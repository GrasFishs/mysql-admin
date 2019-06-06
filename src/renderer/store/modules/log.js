/**
 * interface Log{
 *    sql: string;
 *    date: moment.format;
 * }
 */

export default {
  state: {
    logs: []
  },
  mutations: {
    ADD_LOG(state, sql) {
      state.logs = [...state.logs, sql];
    }
  }
};
