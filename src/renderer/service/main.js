import { post } from "./util";
import { createPool } from "mysql";
import store from "../store";

const query = (pool, isLog = true) => (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (err, result) => {
      isLog && store.commit("addLog", sql);
      if (err) reject(err);
      resolve(result);
    });
  });
};

export const API = {
  connect: async body => {
    const pool = createPool(body);
    return await query(pool, false)("SHOW DATABASES");
  },
  getRows: async (body, database, table) => {
    const pool = createPool(body);
    return await query(pool)(`SELECT * FROM ${database}.${table}`);
  },
  useDatabase: async (body, database) => {
    const pool = createPool(body);
    await query(pool)(`USE ${database}`);
    return await query(pool, false)(`SHOW TABLES`);
  },
  getTypes: async (body, databse, table) => {
    const pool = createPool(body);
    return await query(pool, false)(`DESC ${databse}.${table}`);
  },
  removeRow: async (body, database, table, key, value) => {
    const pool = createPool(body);
    return await query(pool)(
      `DELETE FROM ${database}.${table} WHERE ${key}=${value}`
    );
  },
  updateRow: async (body, database, table, key, value) => {
    const pool = createPool(body);
    let str = "";
    Object.keys(value).forEach(v => {
      if (v !== key) {
        str += `${v}='${value[v]}',`;
      }
    });
    str = str.slice(0, str.length - 1);
    console.log(str);
    return await query(pool)(
      `UPDATE ${database}.${table} SET ${str} WHERE ${key}=${value[key]}`
    );
  }
};

const url = path => `http://localhost:3000/${path}`;

export const mainAPI = {
  connect(option) {
    return new Promise(async (resolve, reject) => {
      const excludes = [
        "information_schema",
        "mysql",
        "performance_schema",
        "sys"
      ];
      try {
        const res = await API.connect(option);
        resolve(res.map(_ => _.Database).filter(_ => !excludes.includes(_)));
      } catch (e) {
        reject(e);
      }
    });
  },
  useDatabase(option, database) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await API.useDatabase(option, database);
        resolve(res.map(_ => _[`Tables_in_${database}`]));
      } catch (e) {
        reject(e);
      }
    });
  },
  getRows(option, database, table) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await API.getRows(option, database, table);
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  },
  getTypes(option, database, table) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await API.getTypes(option, database, table);
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  },
  removeRow(option, database, table, key, value) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await API.removeRow(option, database, table, key, value);
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  },
  updateRow(option, database, table, key, value) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await API.updateRow(option, database, table, key, value);
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }
};
