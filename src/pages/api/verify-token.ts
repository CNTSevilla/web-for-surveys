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
