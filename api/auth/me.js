import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev_secret_change_me'
);

async function verifyTokenFromCookies(req) {
  const cookie = req.headers.get('cookie') || '';
  const m = cookie.match(/tc_auth=([^;]+)/);
  if (!m) return null;
  const token = decodeURIComponent(m[1]);
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const payload = await verifyTokenFromCookies(req);

  if (!payload) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({ uid: payload.uid, role: payload.role }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
