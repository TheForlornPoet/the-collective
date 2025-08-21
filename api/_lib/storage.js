import { put, head, get } from '@vercel/blob';

const BUCKET_PREFIX = 'data/';

// Helper to read JSON from Blob (returns [] if not exists)
export async function readJSON(key) {
  const blobKey = BUCKET_PREFIX + key;
  try {
    const h = await head(blobKey);
    if (!h) return [];
    const res = await fetch(h.url);
    const text = await res.text();
    return JSON.parse(text || '[]');
  } catch (err) {
    // If not found or error occurs, return empty array
    return [];
  }
}

// Helper to write JSON to Blob
export async function writeJSON(key, data) {
  const blobKey = BUCKET_PREFIX + key;
  const body = JSON.stringify(data, null, 2); // pretty-print
  await put(blobKey, body, { contentType: 'application/json', access: 'public' });
  return true;
}
