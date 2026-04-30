import type { APIContext } from 'astro';
import fs from 'fs/promises';
import path from 'path';

const dataPath = path.join(process.cwd(), 'src/data/alquileres.json');

// Asegurar que el archivo existe
async function ensureDataFile() {
  try {
    await fs.access(dataPath);
  } catch {
    await fs.writeFile(dataPath, JSON.stringify([]));
  }
}

export async function GET({ request }: APIContext) {
  await ensureDataFile();
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('search') || '';

  try {
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));

    let filtered = data;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = data.filter((item: any) =>
        (item.nombre && item.nombre.toLowerCase().includes(searchLower)) ||
        (item.email && item.email.toLowerCase().includes(searchLower)) ||
        (item.barrio && item.barrio.toLowerCase().includes(searchLower))
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return new Response(
      JSON.stringify({
        items,
        currentPage: page,
        totalPages,
        total
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE({ params, request }: APIContext) {
  // Verificar autenticación básica
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401 });
  }

  // En producción, verificar token correctamente
  // Por ahora, aceptamos cualquier token (simulación)
  
  await ensureDataFile();
  const id = params.id; // Este es el [id] en la ruta, pero para DELETE necesitamos otro archivo
  
  // Como estamos en index.ts, no podemos capturar [id] dinámicamente
  // Necesitamos crear un archivo [id].ts para DELETE
  return new Response(JSON.stringify({ error: 'Use /api/alquileres/[id] para DELETE' }), { status: 400 });
}
