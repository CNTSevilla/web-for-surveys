import { query } from '../../../db/connection.js';

export async function GET() {
  try {
    // Ensure new columns exist (for databases created before the address field was added)
    try { await query('ALTER TABLE rent_reports ADD COLUMN fingerprint TEXT'); } catch {}
    try { await query('ALTER TABLE rent_reports ADD COLUMN direccion TEXT'); } catch {}

    const rows = await query(`
      SELECT id, lat, lng, zona, precio, quiere_contacto, direccion, created_at
      FROM rent_reports
      ORDER BY created_at DESC
    `);

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
