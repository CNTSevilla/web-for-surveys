import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'rentals.db');

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS rent_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    zona TEXT NOT NULL,
    precio INTEGER NOT NULL,
    quiere_contacto INTEGER DEFAULT 0,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('Database initialized at', dbPath);
db.close();
