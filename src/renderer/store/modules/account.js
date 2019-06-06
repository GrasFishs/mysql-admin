import { Loading } from 'element-ui';
import NProgress from 'nprogress';
import { connectService } from '../service';

const numRegx = /int|bit|float|double|decimal/gi;
function getType(type) {
  if (numRegx.test(type)) {
    return 'number';
  } else {
    return 'string';
  }
}

export default {
  state: {
    host: 'localhost', //'47.93.41.220',
    user: 'root',
    password: 'gotoAnd@123',
    dateStrings: ['DATE', 'DATETIME']
  },
  mutations: {
    SET_HOST(state, host) {
      state.host = host;
    },
    SET_USER(state, user) {
      state.user = user;
    },
    SET_PASSWORD(state, password) {
      state.password = password;
    }
  },
  actions: {
    async connect({ commit }) {
      const loading = Loading.service({
        background: 'hsla(0,0%,100%,.1)',
        text: '获取数据中...'
      });
      NProgress.start();

      const databases = [];
      // 获取 数据库
      let dbs;
      try {
        dbs = await connectService.connect();
      } catch (e) {
        loading.close();
        NProgress.done();
        throw e;
      }
      try {
        const tablesPromises = dbs.map(db => connectService.useDatabase(db));
        // 获取 数据库 对应的 表
        const tables = await Promise.all(tablesPromises);
        const columnsPromises = [];
        for (let i = 0; i < tables.length; i++) {
          tables[i].forEach(table => {
            columnsPromises.push(connectService.getTypes(dbs[i], table));
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
              cols: columns[0].map(col => ({
                ...col,
                type: getType(col.Type)
              }))
            }))
          );
        } else {
          for (let i = 0; i < tables.length; i++) {
            databasesWithTable.push(
              tables[i].map((table, index) => ({
                name: table,
                cols: columns
                  .slice(len, tables[i].length + len)
                  [index].map(col => ({
                    ...col,
                    type: getType(col.Type)
                  }))
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
        commit('db/SET_DATABASES', databases, { root: true });
        loading.close();
        NProgress.done();
        return;
      } catch (e) {
        loading.close();
        NProgress.done();
        throw e;
      }
    }
  }
};
