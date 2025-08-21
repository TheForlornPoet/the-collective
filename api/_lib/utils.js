import { nanoid } from 'nanoid';

/**
 * Return a JSON response
 * @param {any} res - Response object (not used in this context)
 * @param {number} status - HTTP status code
 * @param {Object} body - Response body
 * @returns {Response} - Fetch API Response
 */
export function json(res, status = 200, body = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
}

/**
 * Return a JSON error response
 * @param {any} res - Response object (not used in this context)
 * @param {string} msg - Error message
 * @param {number} status - HTTP status code
 * @returns {Response}
 */
export function bad(res, msg, status = 400) {
  return json(res, status, { error: msg });
}

/**
 * Generate a unique ID using nanoid
 * @returns {string} - Unique ID
 */
export function id() {
  return nanoid();
}
