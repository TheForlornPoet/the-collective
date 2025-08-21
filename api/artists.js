// _lib/auth.js (Edge-compatible)
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev_secret_change_me');

export function signToken(user) {
  return new jose.SignJWT({ uid: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyTokenFromCookies(req) {
  const cookie = req.headers.get('cookie') || '';
  const m = cookie.match(/tc_auth=([^;]+)/);
  if (!m) return null;
  const token = decodeURIComponent(m[1]);
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (e) {
    return null;
  }
}
