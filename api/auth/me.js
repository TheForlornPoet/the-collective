import { verifyTokenFromCookies } from '../_lib/auth.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const payload = verifyTokenFromCookies(req);

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
