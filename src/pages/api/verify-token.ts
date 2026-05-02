/**
 * verify-token.ts - Endpoint POST para verificar la validez de un token admin.
 *
 * Decodifica el token (base64 JSON) y comprueba si ha expirado.
 * Se usa desde el panel de administración para mantener la sesión activa
 * y redirigir al login si el token es inválido o ha caducado.
 *
 * Headers requeridos:
 *   - Authorization: Bearer <token>
 *
 * Respuesta (200):
 *   { valid: true } - token válido y no expirado
 *   { valid: false, reason: 'expired' } - token expirado
 *
 * Respuesta (401):
 *   { valid: false } - token ausente, malformado o expirado
 *
 * Respuesta (500):
 *   { error: string }
 */

import type { APIContext } from 'astro';

export async function POST({ request }: APIContext) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ valid: false }), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return new Response(JSON.stringify({ valid: false }), { status: 401 });
    }

    // Decodificar token
    let tokenData;
    try {
      tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
    } catch {
      return new Response(JSON.stringify({ valid: false }), { status: 401 });
    }

    // Verificar expiración
    if (tokenData.expiresAt < Date.now()) {
      return new Response(JSON.stringify({ valid: false, reason: 'expired' }), { status: 401 });
    }

    return new Response(
      JSON.stringify({ valid: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
