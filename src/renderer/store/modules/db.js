import Vue from 'vue';
import dbService from '../service/db';
import { Notification } from 'element-ui';

export default {
  state: {
    databases: [],
    tables: {}
  },
  mutations: {
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
    ADD_ROW(state, table) {
      const fileds = state.tables[table].columns.map(col => col.Field);
      const row = { index: state.tables[table].rows.length };
      fileds.forEach(filed => (row[filed] = ''));
      state.tables[table].rows.push(row);
    },
    SET_ROWS(state, { table, rows, total }) {
      state.tables[table].rows = rows.map((row, index) => ({ ...row, index }));
      state.tables[table].total = total;
    },
    SET_TABLE_PAGE(state, { table, page, size }) {
      if (page) {
        state.tables[table].page = page ? page : state.tables[table].page;
      }
      if (size) {
        state.tables[table].size = size ? size : state.tables[table].size;
      }
    }
  },
  actions: {
    async getTableRows({ state, commit }, { table }) {
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
    async addRow({ state, commit }, { table, row }) {
      const [db, tb] = table.split('.');
      const { columns, size } = state.tables[table];
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
      console.log(normalizeRow);
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
    }
  }
};
