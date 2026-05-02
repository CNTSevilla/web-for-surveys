/**
 * [id].ts - Endpoint DELETE para eliminar un reporte de alquiler.
 *
 * Elimina un registro de la tabla rent_reports por su ID.
 * Utilizado desde el panel de administración.
 *
 * Route params:
 *   - id: número del registro a eliminar
 *
 * Respuesta (200):
 *   { success: true }
 *
 * Respuesta (500):
 *   { error: string }
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import type { APIContext } from 'astro';

/** Ruta absoluta al archivo de base de datos SQLite (nivel superior al de alquileres.ts) */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../../../db/rentals.db');

export async function DELETE({ params }: APIContext) {
  try {
    const db = new Database(dbPath);
    db.prepare('DELETE FROM rent_reports WHERE id = ?').run(params.id);
    db.close();

    return new Response(JSON.stringify({ success: true }), {
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
