import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'familiaspalmete',
      password: process.env.DB_PASSWORD || 'familiaspalmete',
      database: process.env.DB_NAME || 'familiaspalmete',
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const p = getPool();
  const [rows] = await p.query(sql, params);
  return rows;
}
