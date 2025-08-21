// api/videos.js
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
  if (req.method === 'GET') {
    const items = await readJSON('videos.json');
    return new Response(JSON.stringify({ items }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (req.method === 'POST') {
    const user = await verifyTokenFromCookies(req);
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const { artistId = '', title, url } = await req.json().catch(() => ({}));
    if (!title || !url) return new Response(JSON.stringify({ error: 'title and url required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const items = await readJSON('videos.json');
    const _id = id();
    items.push({ id: _id, artistId, title, url, createdAt: Date.now() });
    await writeJSON('videos.json', items);

    return new Response(JSON.stringify({ id: _id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response('Method not allowed', { status: 405 });
}
