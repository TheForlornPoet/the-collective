import { readJSON, writeJSON } from './_lib/storage.js';
import { verifyTokenFromCookies } from './_lib/auth.js';
import { id } from './_lib/utils.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const user = verifyTokenFromCookies(req);
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { searchParams } = new URL(req.url);
  const albumId = searchParams.get('id');
  const { rating } = await req.json().catch(() => ({}));

  if (!albumId || !rating || rating < 1 || rating > 5) {
    return new Response(
      JSON.stringify({ error: '1-5 rating required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const arr = await readJSON('albumRatings.json');
  arr.push({ id: id(), albumId, userId: user.uid, rating, createdAt: Date.now() });
  await writeJSON('albumRatings.json', arr);

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
