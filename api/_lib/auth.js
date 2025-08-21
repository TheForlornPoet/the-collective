import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

/**
 * Sign a JWT for a given user
 * @param {Object} user - User object with `id` and `role`
 * @returns {string} - JWT token
 */
export function signToken(user) {
  return jwt.sign(
    { uid: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify JWT from request cookies
 * @param {Request} req - Incoming request object
 * @returns {Object|null} - Decoded payload or null if invalid
 */
export function verifyTokenFromCookies(req) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/tc_auth=([^;]+)/);
  if (!match) return null;

  const token = decodeURIComponent(match[1]);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload;
  } catch (e) {
    return null;
  }
}
