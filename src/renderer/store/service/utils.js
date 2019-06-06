import { createPool } from 'mysql';
import store from '../index';
import moment from 'moment';
import { Message } from 'element-ui';

export const query = (sql, values, { isLog } = { isLog: true }) => {
  const { user, password, host, dateStrings } = store.state.account;
  const pool = createPool({
    host,
    user,
    password,
    dateStrings
  });
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (err, result) => {
      if (isLog) {
        store.commit('log/ADD_LOG', {
          sql: sql.replace(/\n/g),
          time: moment().format('YYYY-MM-DD hh:mm:ss')
        });
      }
      if (err) {
        Message.error(err.message);
        reject(err);
      }
      resolve(result);
    });
  });
};
