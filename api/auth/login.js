import { compare } from 'https://cdn.jsdelivr.net/npm/bcrypt-es@1.0.2/dist/bcrypt.min.js';
import { readJSON } from '../_lib/storage.js';
import { json, bad } from '../_lib/utils.js';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
export const config = { runtime: 'edge' };

async function signToken(user) {
  return new SignJWT({ uid: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(JWT_SECRET));
}

export default async function handler(req) {
  if (req.method !== 'POST') return bad(null, 'Method not allowed', 405);

  const { email, password } = await req.json().catch(() => ({}));

  const users = await readJSON('users.json');
  const user = users.find(u => u.email === email);
  if (!user) return bad(null, 'Invalid credentials', 401);

  const match = await compare(password, user.pass);
  if (!match) return bad(null, 'Invalid credentials', 401);

  const token = await signToken(user);

  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append(
    'Set-Cookie',
    `tc_auth=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${7 * 24 * 3600}`
  );

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
