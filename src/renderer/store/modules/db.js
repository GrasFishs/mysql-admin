import Vue from 'vue';
import dbService from '../service/db';
import { Notification } from 'element-ui';

export default {
  state: {
    databases: [],
    tables: {},
    currentTable: ''
  },
  mutations: {
    SET_TABLE(state, table) {
      state.currentTable = table;
    },
    SET_DATABASES(state, databases) {
      state.databases = databases;
    },
    ADD_TABLE(state, table) {
      const [db, tb] = table.split('.');
      state.tables = {
        ...state.tables,
        [table]: {
          rows: [],
          total: 0,
          page: 1,
          size: 100,
          columns: state.databases
            .find(d => d.name === db)
            .tables.find(t => t.name === tb).cols
        }
      };
    },
    REMOVE_TABLE(state, table) {
      Vue.delete(state.tables, table);
    },
    ADD_ROW(state) {
      const table = state.currentTable;
      const fileds = state.tables[table].columns.map(col => col.Field);
      const row = { index: state.tables[table].rows.length };
      fileds.forEach(filed => (row[filed] = ''));
      state.tables[table].rows.push(row);
    },
    SET_ROW(state, { row, index }) {
      state.tables[state.currentTable].rows[index] = row;
    },
    SET_ROWS(state, { rows, total }) {
      const table = state.currentTable;
      state.tables[table].rows = rows.map((row, index) => ({
        ...row,
        index,
        type: ''
      }));
      state.tables[table].total = total;
    },
    SET_TABLE_PAGE(state, { page, size }) {
      const table = state.currentTable;
      if (page) {
        state.tables[table].page = page ? page : state.tables[table].page;
      }
      if (size) {
        state.tables[table].size = size ? size : state.tables[table].size;
      }
    }
  },
  actions: {
    async getTableRows({ state, commit }) {
      const table = state.currentTable;
      const { page, size } = state.tables[table];
      const [database, t] = table.split('.');
      const { total, rows } = await dbService.getRows({
        database,
        table: t,
        page,
        size
      });
      commit('SET_ROWS', { table, rows, total });
      return { total, rows };
    },
    async addRow({ state, commit }, { row }) {
      const table = state.currentTable;
      const [db, tb] = table.split('.');
      const { columns, size } = state.tables[table];
      // 规范化类型，防止数字类型以字符串形式传入
      const normalizeRow = {};
      Object.keys(row).forEach(key => {
        if (row[key]) {
          const { type } = columns.find(col => col.Field === key);
          if (type === 'number') {
            normalizeRow[key] = Number(row[key]);
          } else {
            normalizeRow[key] = row[key];
          }
        }
      });
      await dbService.addRow({
        database: db,
        table: tb,
        row: normalizeRow
      });
      commit('SET_TABLE_PAGE', { table, size: size + 1 });
      Notification.success({
        title: '提醒',
        message: `插入数据成功！`
      });
      return true;
    },
    async removeRow({ state, commit }, { key, value }) {
      const table = state.currentTable;
      const [db, tb] = table.split('.');
      await dbService.removeRow({
        database: db,
        table: tb,
        key,
        value
      });
      commit('SET_TABLE_PAGE', { table, size: table.size - 1 });
      Notification.success({
        title: '提醒',
        message: `删除${key}=${value}的行成功`
      });
      return true;
    },
    async updateRow({ state }, { key, values }) {
      const table = state.currentTable;
      const [db, tb] = table.split('.');
      const { columns } = state.tables[table];
      const normalizeRow = {};
      Object.keys(values).forEach(key => {
        if (values[key]) {
          const { type } = columns.find(col => col.Field === key);
          if (type === 'number') {
            normalizeRow[key] = Number(values[key]);
          } else {
            normalizeRow[key] = values[key];
          }
        }
      });
      await dbService.updateRow({
        database: db,
        table: tb,
        key,
        values: normalizeRow
      });
      Notification.success({
        title: '提醒',
        message: `更新${key}=${values[key]}的行成功`
      });
      return true;
    }
  }
};
