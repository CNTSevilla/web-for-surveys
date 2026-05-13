import { query } from '../../../../db/connection.js';
import type { APIContext } from 'astro';

export async function DELETE({ params }: APIContext) {
  try {
    await query('DELETE FROM rent_reports WHERE id = ?', [params.id]);

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
