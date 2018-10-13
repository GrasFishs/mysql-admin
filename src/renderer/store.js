import Vue from "vue";
import Vuex from "vuex";
import { mainAPI, API } from "./service";
import { Loading, Notification } from "element-ui";
import NProgress from "nprogress";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    option: {
      host: "localhost",
      user: "root",
      password: "gotoAnd123",
      dateStrings: ["DATE", "DATETIME"]
    },
    databases: [],
    rows: [],
    database: "",
    table: "",
    columns: [],
    logs: []
  },

  mutations: {
    setColumns(state) {
      state.rows = [];
      const tables = state.databases.find(db => db.name === state.database)
        .tables;
      state.columns = tables.find(table => table.name === state.table).cols;
    },
    addLog(state, sql) {
      if (state.logs[state.logs.length - 1] !== sql) {
        state.logs = [...state.logs, sql];
      }
    }
  },
  actions: {
    connect({ state }) {
      const loading = Loading.service({
        background: "hsla(0,0%,100%,.1)",
        text: "获取数据中..."
      });
      NProgress.start();
      return new Promise(async (resovle, reject) => {
        const databases = [];
        // 获取 数据库
        let dbs;
        try {
          dbs = await mainAPI.connect(state.option);
        } catch (e) {
          reject(e);
          loading.close();
          NProgress.done();
        }
        try {
          const tablesPromises = dbs.map(db =>
            mainAPI.useDatabase(state.option, db)
          );
          // 获取 数据库 对应的 表
          const tables = await Promise.all(tablesPromises);
          const columnsPromises = [];
          for (let i = 0; i < tables.length; i++) {
            tables[i].forEach(table => {
              columnsPromises.push(
                mainAPI.getTypes(state.option, dbs[i], table)
              );
            });
          }
          /**获取所有列的详情信息 */
          const columns = await Promise.all(columnsPromises);
          const databasesWithTable = [];
          let len = 0;
          if (columns.length === 1) {
            databasesWithTable.push(
              tables[0].map(table => ({
                name: table,
                cols: columns[0]
              }))
            );
          } else {
            for (let i = 0; i < tables.length; i++) {
              databasesWithTable.push(
                tables[i].map((table, index) => ({
                  name: table,
                  cols: columns.slice(len, tables[i].length + len - 1)[index]
                }))
              );
              len += tables[i].length;
            }
          }
          databasesWithTable.forEach((tables, index) => {
            databases.push({
              name: dbs[index],
              tables
            });
          });
          state.databases = databases;
          loading.close();
          NProgress.done();
          resovle();
        } catch (e) {
          reject(e);
          loading.close();
          NProgress.done();
        }
      });
    },
    getValues({ state }) {
      return new Promise(async (resolve, reject) => {
        try {
          state.rows = await mainAPI.getRows(
            state.option,
            state.database,
            state.table
          );
          resolve(state.rows);
        } catch (e) {
          reject(e);
        }
      });
    },
    removeRow({ state }, { key, value }) {
      return new Promise(async (resolve, reject) => {
        try {
          await mainAPI.removeRow(
            state.option,
            state.database,
            state.table,
            key,
            value
          );
          Notification.success({
            title: "删除提醒",
            message: `删除【${key}=${value}】行成功！`
          });
          resolve();
        } catch (e) {
          Notification.error({
            title: "删除错误",
            message: e.sqlMessage
          });
          reject(e);
        }
      });
    },
    updateRow({ state }, { key, value }) {
      return new Promise(async (resolve, reject) => {
        try {
          await mainAPI.updateRow(
            state.option,
            state.database,
            state.table,
            key,
            value
          );
          Notification.success({
            title: "更新提醒",
            message: `更新【${key}=${value[key]}】行成功！`
          });
          resolve();
        } catch (e) {
          Notification.error({
            title: "更新错误",
            message: e.sqlMessage
          });
          reject(e);
        }
      });
    }
  }
});
