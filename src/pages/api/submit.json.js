import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../../db/rentals.db');

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { lat, lng, zona, precio, quiere_contacto, email, fingerprint, isAdmin } = body;
    
    if (!lat || !lng || !zona || !precio) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const db = new Database(dbPath);

    // Ensure column exists
    try { db.exec('ALTER TABLE rent_reports ADD COLUMN fingerprint TEXT'); } catch {}

    // Check for duplicate fingerprint (skip for admin)
    if (fingerprint && !isAdmin) {
      const existing = db.prepare('SELECT id FROM rent_reports WHERE fingerprint = ?').get(fingerprint);
      if (existing) {
        db.close();
        return new Response(JSON.stringify({ error: 'Ya has enviado un alquiler. Solo se permite un envío por usuario.' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    const stmt = db.prepare(`
      INSERT INTO rent_reports (lat, lng, zona, precio, quiere_contacto, email, fingerprint)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      lat,
      lng,
      zona,
      precio,
      quiere_contacto ? 1 : 0,
      quiere_contacto && email ? email : null,
      fingerprint || null
    );
    
    db.close();
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
