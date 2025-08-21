export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append(
    'Set-Cookie',
    'tc_auth=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0'
  );

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
