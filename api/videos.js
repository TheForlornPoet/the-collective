import { readJSON, writeJSON } from './_lib/storage.js';
import { verifyTokenFromCookies } from './_lib/auth.js';
import { id } from './_lib/utils.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'GET') {
    const items = await readJSON('videos.json');
    return new Response(
      JSON.stringify({ items }),
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

    const { artistId = '', title, url } = await req.json().catch(() => ({}));

    if (!title || !url) {
      return new Response(
        JSON.stringify({ error: 'title and url required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const items = await readJSON('videos.json');
    const _id = id();
    items.push({ id: _id, artistId, title, url, createdAt: Date.now() });

    await writeJSON('videos.json', items);

    return new Response(
      JSON.stringify({ id: _id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response('Method not allowed', { status: 405 });
}
