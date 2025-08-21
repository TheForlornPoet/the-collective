// api/tracks.js
import { readJSON, writeJSON } from './_lib/storage.js';
import { jwtVerify } from 'jose';
import { id } from './_lib/utils.js';

export const config = { runtime: 'edge' };

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev_secret_change_me'
);

function getTokenFromCookies(req) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/tc_auth=([^;]+)/);
  if (!match) return null;
  return decodeURIComponent(match[1]);
}

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
    const tracks = await readJSON('tracks.json');
    const idParam = searchParams.get('id');

    if (idParam) {
      const t = tracks.find(x => x.id === idParam);
      if (!t) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify(t), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ items: tracks }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (req.method === 'POST') {
    const user = await verifyTokenFromCookies(req);
    if (!user || user.role !== 'admin') return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });

    const { albumId, title, duration = '', lyrics = '', audioUrl = '', tabsUrl = '', videoUrl = '' } = await req.json().catch(() => ({}));
    if (!albumId || !title) return new Response(JSON.stringify({ error: 'albumId and title required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const tracks = await readJSON('tracks.json');
    const _id = id();
    tracks.push({ id: _id, albumId, title, duration, lyrics, audioUrl, tabsUrl, videoUrl, createdAt: Date.now() });
    await writeJSON('tracks.json', tracks);

    return new Response(JSON.stringify({ id: _id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response('Method not allowed', { status: 405 });
}

