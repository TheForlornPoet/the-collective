import { readJSON, writeJSON } from './_lib/storage.js';
import { verifyTokenFromCookies } from './_lib/auth.js';
import { id } from './_lib/utils.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);

  if (req.method === 'GET') {
    const albums = await readJSON('albums.json');
    const idParam = searchParams.get('id');

    if (idParam) {
      const al = albums.find(x => x.id === idParam);
      if (!al) {
        return new Response(
          JSON.stringify({ error: 'Not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const tracks = (await readJSON('tracks.json')).filter(x => x.albumId === al.id);
      return new Response(
        JSON.stringify({ ...al, tracks }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ items: albums }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (req.method === 'POST') {
    const user = verifyTokenFromCookies(req);
    if (!user || user.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { artistId, title, type = 'lp', releaseDate } = await req.json().catch(() => ({}));
    if (!artistId || !title) {
      return new Response(
        JSON.stringify({ error: 'artistId and title required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const albums = await readJSON('albums.json');
    const _id = id();
    albums.push({ id: _id, artistId, title, type, releaseDate, createdAt: Date.now() });
    await writeJSON('albums.json', albums);

    return new Response(
      JSON.stringify({ id: _id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response('Method not allowed', { status: 405 });
}
