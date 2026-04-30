import type { APIContext } from 'astro';
import fsSync from 'fs';
import path from 'path';

// Función para leer .env manualmente
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fsSync.readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Error leyendo .env:', error);
    return {};
  }
}

export async function POST({ request }: APIContext) {
  try {
    const { username, password } = await request.json();

    // Intentar leer de process.env primero, luego manualmente
    let validUsername = process.env.ADMIN_USERNAME;
    let validPassword = process.env.ADMIN_PASSWORD;

    // Si no están en process.env, leer manualmente
    if (!validUsername || !validPassword) {
      const envVars = loadEnv();
      validUsername = validUsername || envVars.ADMIN_USERNAME;
      validPassword = validPassword || envVars.ADMIN_PASSWORD;
    }

    if (!validUsername || !validPassword) {
      return new Response(JSON.stringify({ error: 'Configuración incompleta. Revisa .env' }), { status: 500 });
    }

    if (username !== validUsername || password !== validPassword) {
      return new Response(JSON.stringify({ error: 'Credenciales inválidas' }), { status: 401 });
    }

    const expiresAt = Date.now() + (30 * 60 * 1000); // 30 minutos
    const tokenData = {
      username,
      expiresAt,
      createdAt: Date.now()
    };
    
    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');

    return new Response(
      JSON.stringify({ success: true, token }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno' }), { status: 500 });
  }
}
