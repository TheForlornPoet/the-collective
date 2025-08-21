// api/trackRatings.js
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
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const user = await verifyTokenFromCookies(req);
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { searchParams } = new URL(req.url);
  const trackId = searchParams.get('id');
  const { rating } = await req.json().catch(() => ({}));

  if (!trackId || !rating || rating < 1 || rating > 5) {
    return new Response(
      JSON.stringify({ error: '1-5 rating required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const arr = await readJSON('trackRatings.json');
  arr.push({ id: id(), trackId, userId: user.uid, rating, createdAt: Date.now() });
  await writeJSON('trackRatings.json', arr);

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
