import Vue from 'vue';
import Vuex from 'vuex';
import { mainAPI } from './service';
import { Loading, Notification } from 'element-ui';
import NProgress from 'nprogress';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    option: {
      host: '47.93.41.220',
      user: 'root',
      password: 'gotoAnd@123',
      dateStrings: ['DATE', 'DATETIME']
    },
    databases: [],
    total: 0,
    rows: [],
    database: '',
    table: '',
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
      state.logs = [...state.logs, sql];
    },
    addRow(state) {
      const index = state.rows.length;
      const row = state.rows[0];
      for (const key of Object.keys(row)) {
        row[key] = '';
      }
      state.rows.push({ ...row, index });
    }
  },
  actions: {
    connect({ state }) {
      const loading = Loading.service({
        background: 'hsla(0,0%,100%,.1)',
        text: '获取数据中...'
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
                  cols: columns.slice(len, tables[i].length + len)[index]
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
    getValues({ state }, { page, size }) {
      return new Promise(async (resolve, reject) => {
        try {
          const [counts, rows] = await mainAPI.getRows(
            state.option,
            state.database,
            state.table,
            page,
            size
          );
          state.rows = rows;
          state.total = counts[0].total;
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
            title: '删除提醒',
            message: `删除【${key}=${value}】行成功！`
          });
          resolve();
        } catch (e) {
          Notification.error({
            title: '删除错误',
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
            title: '更新提醒',
            message: `更新【${key}=${value[key]}】行成功！`
          });
          resolve();
        } catch (e) {
          Notification.error({
            title: '更新错误',
            message: e.sqlMessage
          });
          reject(e);
        }
      });
    },
    addRow({ state }, { key, value }) {
      return new Promise(async (resolve, reject) => {
        try {
          await mainAPI.addRow(
            state.option,
            state.database,
            state.table,
            key,
            value
          );
          Notification.success({
            title: '插入提醒',
            message: `插入【${key}=${value[key]}】行成功！`
          });
          resolve();
        } catch (e) {
          Notification.error({
            title: '插入错误',
            message: e.sqlMessage
          });
          reject(e);
        }
      });
    }
  }
});
