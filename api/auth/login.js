import bcrypt from 'bcryptjs';
import { readJSON } from '../_lib/storage.js';
import { json, bad } from '../_lib/utils.js';
import { signToken } from '../_lib/auth.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return bad(null, 'Method not allowed', 405);

  // Parse request body
  const { email, password } = await req.json().catch(() => ({}));

  // Load users and find matching email
  const users = await readJSON('users.json');
  const user = users.find(u => u.email === email);

  if (!user) return bad(null, 'Invalid credentials', 401);
  if (!bcrypt.compareSync(password, user.pass)) return bad(null, 'Invalid credentials', 401);

  // Generate JWT token
  const token = signToken(user);

  // Set cookie headers
  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append(
    'Set-Cookie',
    `tc_auth=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${7 * 24 * 3600}`
  );

  // Return success response
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
