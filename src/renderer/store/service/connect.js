import { query } from './utils';

export default {
  async connect() {
    const excludes = [
      'information_schema',
      'mysql',
      'performance_schema',
      'sys'
    ];
    try {
      const res = await query('SHOW DATABASES', null, { isLog: false });
      return res.map(_ => _.Database).filter(_ => !excludes.includes(_));
    } catch (e) {
      throw e;
    }
  },
  getTypes(database, table) {
    return query(`DESC ${database}.${table}`, null, { isLog: false });
  },
  async useDatabase(database) {
    const tables = await query(`SHOW TABLES FROM ${database}`);
    return tables.map(table => table[`Tables_in_${database}`]);
  }
};
