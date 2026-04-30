import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import type { APIContext } from 'astro';

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
