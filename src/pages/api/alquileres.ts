import { query } from '../../../db/connection.js';
import type { APIContext } from 'astro';

export async function GET({ request }: APIContext) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    // Add missing columns if they don't exist (for databases created before schema updates)
    try { await query('ALTER TABLE rent_reports ADD COLUMN ip TEXT'); } catch {}
    try { await query('ALTER TABLE rent_reports ADD COLUMN fingerprint TEXT'); } catch {}
    try { await query('ALTER TABLE rent_reports ADD COLUMN direccion TEXT'); } catch {}

    const offset = (page - 1) * limit;

    const whereParts: string[] = [];
    const params: any[] = [];

    if (search) {
      whereParts.push('(zona LIKE ?)');
      params.push(`%${search}%`);
    }

    const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

    const countRows = await query(`SELECT COUNT(*) as total FROM rent_reports ${whereClause}`, params);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    const rows = await query(`
      SELECT id, zona as barrio, precio as alquiler, email, direccion, quiere_contacto
      FROM rent_reports 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    return new Response(JSON.stringify({
      items: rows,
      totalPages,
      currentPage: page,
      total
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
