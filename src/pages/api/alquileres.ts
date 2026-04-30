import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import type { APIContext } from 'astro';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../../db/rentals.db');

export async function GET({ request }: APIContext) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    const db = new Database(dbPath);

    // Add missing columns if they don't exist
    try { db.exec('ALTER TABLE rent_reports ADD COLUMN ip TEXT'); } catch {}

    const offset = (page - 1) * limit;

    const whereParts: string[] = [];
    const params: any[] = [];

    if (search) {
      whereParts.push('(zona LIKE ?)');
      params.push(`%${search}%`);
    }

    const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

    const totalRow = db.prepare(`SELECT COUNT(*) as total FROM rent_reports ${whereClause}`).get(...params) as { total: number };
    const total = totalRow.total;
    const totalPages = Math.ceil(total / limit);

    const rows = db.prepare(`
      SELECT id, zona as barrio, precio as alquiler, email, quiere_contacto
      FROM rent_reports 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    db.close();

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
