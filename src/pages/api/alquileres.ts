/**
 * alquileres.ts - Endpoint GET para listados paginados de alquileres.
 *
 * Diseñado para el panel de administración. Soporta búsqueda por zona
 * y paginación configurable.
 *
 * Query params:
 *   - page: número de página (por defecto: 1)
 *   - limit: elementos por página (por defecto: 10)
 *   - search: filtro por nombre de zona (opcional)
 *
 * Respuesta (200):
 *   { items: Array, totalPages: number, currentPage: number, total: number }
 *
 * Respuesta (500):
 *   { error: string }
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import type { APIContext } from 'astro';

/** Ruta absoluta al archivo de base de datos SQLite */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../../db/rentals.db');

export async function GET({ request }: APIContext) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    const db = new Database(dbPath);

    // Add missing columns if they don't exist (for databases created before schema updates)
    try { db.exec('ALTER TABLE rent_reports ADD COLUMN ip TEXT'); } catch {}
    try { db.exec('ALTER TABLE rent_reports ADD COLUMN fingerprint TEXT'); } catch {}
    try { db.exec('ALTER TABLE rent_reports ADD COLUMN direccion TEXT'); } catch {}

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
      SELECT id, zona as barrio, precio as alquiler, email, direccion, quiere_contacto
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
