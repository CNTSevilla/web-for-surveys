import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../../db/rentals.db');

export async function GET() {
  try {
    const db = new Database(dbPath);
    
    const rows = db.prepare(`
      SELECT id, lat, lng, zona, precio, quiere_contacto, created_at
      FROM rent_reports
      ORDER BY created_at DESC
    `).all();
    
    db.close();
    
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
