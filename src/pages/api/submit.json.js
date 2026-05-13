import { query } from '../../../db/connection.js';

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

    // Ensure columns exist
    try { await query('ALTER TABLE rent_reports ADD COLUMN fingerprint TEXT'); } catch {}
    try { await query('ALTER TABLE rent_reports ADD COLUMN direccion TEXT'); } catch {}

    // Check for duplicate fingerprint (skip for admin)
    if (fingerprint && !isAdmin) {
      const rows = await query('SELECT id FROM rent_reports WHERE fingerprint = ?', [fingerprint]);
      if (rows.length > 0) {
        return new Response(JSON.stringify({ error: 'Ya has enviado un alquiler. Solo se permite un envío por usuario.' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    await query(
      `INSERT INTO rent_reports (lat, lng, zona, precio, quiere_contacto, email, direccion, fingerprint)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [lat, lng, zona, precio, quiere_contacto ? 1 : 0, quiere_contacto && email ? email : null, direccion || null, fingerprint || null]
    );

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
