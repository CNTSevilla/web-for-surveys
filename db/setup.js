import { query, getPool } from './connection.js';

async function setup() {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rent_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lat DOUBLE NOT NULL,
        lng DOUBLE NOT NULL,
        zona VARCHAR(255) NOT NULL,
        precio INT NOT NULL,
        quiere_contacto TINYINT DEFAULT 0,
        email VARCHAR(255),
        direccion TEXT,
        fingerprint TEXT,
        ip VARCHAR(45),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } finally {
    connection.release();
  }
  await pool.end();
}

setup().catch(console.error);
