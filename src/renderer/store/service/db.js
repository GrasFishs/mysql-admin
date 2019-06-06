import { query } from './utils';

export default {
  async getRows({ database, table, page, size }) {
    const [counts, rows] = await Promise.all([
      query(`SELECT count(*) as total FROM ${database}.${table}`),
      query(
        `SELECT * FROM ${database}.${table} LIMIT ${(page - 1) * size},${size}`
      )
    ]);
    return { total: counts[0].total, rows };
  },
  removeRow({ database, table, key, value }) {
    return query(`DELETE FROM ${database}.${table} WHERE ${key}=${value}`);
  },
  updateRow({ database, table, key, value }) {
    Object.keys(value)
      .filter(k => k !== key)
      .map(k => `${k}=${value[k]}`)
      .join(',');
    return query(
      `UPDATE ${database}.${table} SET ${str} WHERE ${key}=${value[key]}`
    );
  },
  addRow({ database, table, row }) {
    const keys = Object.keys(row);
    const fileds = keys.join(',');
    const values = keys
      .map(
        key => (typeof row[key] === 'string' ? `"${row[key]}"` : `${row[key]}`)
      )
      .join(',');
    return query(`INSERT ${database}.${table} (${fileds}) VALUES (${values})`);
  },
  command(sql) {
    return query(sql);
  }
};
