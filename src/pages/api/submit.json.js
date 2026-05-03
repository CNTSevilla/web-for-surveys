/**
 * submit.json.js - Endpoint POST para enviar nuevos reportes de alquiler.
 *
 * Recibe datos de un formulario de reporte de alquiler y los inserta
 * en la base de datos SQLite. Implementa control de duplicados mediante
 * fingerprint del navegador (los admins pueden saltarse esta restricción).
 *
 * Request body esperado:
 *   - lat: número (latitud)
 *   - lng: número (longitud)
 *   - zona: string (nombre de la zona/barrio)
 *   - precio: número (precio del alquiler en €)
 *   - quiere_contacto: boolean (opcional)
 *   - email: string (opcional, solo si quiere_contacto)
 *   - direccion: string (opcional, dirección del usuario)
 *   - fingerprint: string (identificador del navegador)
 *   - isAdmin: boolean (si el usuario es admin)
 *
 * Respuestas:
 *   - 200: { success: true }
 *   - 400: { error: 'Missing required fields' }
 *   - 409: { error: 'Ya has enviado un alquiler...' } (duplicado)
 *   - 500: { error: 'Server error' }
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

/** Ruta absoluta al archivo de base de datos SQLite */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../../db/rentals.db');

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { lat, lng, zona, precio, quiere_contacto, email, direccion, fingerprint, isAdmin } = body;
    
    if (!lat || !lng || !zona || !precio) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const db = new Database(dbPath);

    // Ensure columns exist
    try { db.exec('ALTER TABLE rent_reports ADD COLUMN fingerprint TEXT'); } catch {}
    try { db.exec('ALTER TABLE rent_reports ADD COLUMN direccion TEXT'); } catch {}

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
      INSERT INTO rent_reports (lat, lng, zona, precio, quiere_contacto, email, direccion, fingerprint)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      lat,
      lng,
      zona,
      precio,
      quiere_contacto ? 1 : 0,
      quiere_contacto && email ? email : null,
      direccion || null,
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
