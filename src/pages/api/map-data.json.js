/**
 * map-data.json.js - Endpoint GET para obtener todos los reportes de alquiler.
 *
 * Devuelve la lista completa de alquileres reportados, ordenados por fecha
 * descendente (más recientes primero). Se utiliza para renderizar los
 * marcadores en el mapa interactivo.
 *
 * Respuesta (200):
 *   Array de objetos con: id, lat, lng, zona, precio, quiere_contacto, created_at
 *
 * Respuesta (500):
 *   { error: 'Database error' }
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

/** Ruta absoluta al archivo de base de datos SQLite */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../../db/rentals.db');

export async function GET() {
  try {
    const db = new Database(dbPath);
    
    // Ensure new columns exist (for databases created before the address field was added)
    try { db.exec('ALTER TABLE rent_reports ADD COLUMN fingerprint TEXT'); } catch {}
    try { db.exec('ALTER TABLE rent_reports ADD COLUMN direccion TEXT'); } catch {}
    
    const rows = db.prepare(`
      SELECT id, lat, lng, zona, precio, quiere_contacto, direccion, created_at
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
