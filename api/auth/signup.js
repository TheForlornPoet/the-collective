import bcrypt from 'bcrypt-es';
import { readJSON, writeJSON } from '../_lib/storage.js';
import { id, json, bad } from '../_lib/utils.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return bad(null, 'Method not allowed', 405);

  // Parse request body
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) return bad(null, 'Email and password required', 400);

  // Read existing users
  const users = await readJSON('users.json');

  // Check if email already exists
  if (users.find(u => u.email === email)) return bad(null, 'Email already exists', 409);

  // Hash the password
  const hash = await bcrypt.hash(password, 10);

  // Create new user
  const user = {
    id: id(),
    email,
    pass: hash,
    role: 'user',
    createdAt: Date.now()
  };

  // Save user
  users.push(user);
  await writeJSON('users.json', users);

  // Return success
  return json(null, 200, { ok: true, id: user.id });
}
