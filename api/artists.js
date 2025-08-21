import { readJSON, writeJSON } from './_lib/storage.js';
import { verifyTokenFromCookies } from './_lib/auth.js';
import { id } from './_lib/utils.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);

  if (req.method === 'GET') {
    const items = await readJSON('artists.json');
    const idParam = searchParams.get('id');

    if (idParam) {
      const a = items.find(x => x.id === idParam);
      if (!a) {
        return new Response(
          JSON.stringify({ error: 'Not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const albums = (await readJSON('albums.json')).filter(x => x.artistId === a.id);
      return new Response(
        JSON.stringify({ ...a, albums }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ items }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (req.method === 'POST') {
    const user = verifyTokenFromCookies(req);
    if (!user || user.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { name, genres = [], bio = '' } = await req.json().catch(() => ({}));
    if (!name) {
      return new Response(
        JSON.stringify({ error: 'Name required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const items = await readJSON('artists.json');
    const _id = id();
    items.push({ id: _id, name, genres, bio, createdAt: Date.now() });
    await writeJSON('artists.json', items);

    return new Response(
      JSON.stringify({ id: _id }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return new Response('Method not allowed', { status: 405 });
}
