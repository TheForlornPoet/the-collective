// api/albums.js
import { readJSON, writeJSON } from './_lib/storage.js';
import { jwtVerify } from 'jose';
import { id } from './_lib/utils.js';

export const config = { runtime: 'edge' };

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev_secret_change_me'
);

// Helper to get token from cookies
function getTokenFromCookies(req) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/tc_auth=([^;]+)/);
  if (!match) return null;
  return decodeURIComponent(match[1]);
}

// Edge-compatible verify
async function verifyTokenFromCookies(req) {
  const token = getTokenFromCookies(req);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

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
    const user = await verifyTokenFromCookies(req);
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
