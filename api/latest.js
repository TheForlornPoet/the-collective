import { readJSON } from './_lib/storage.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const artists = (await readJSON('artists.json'))
    .slice(-4)
    .map(a => ({
      type: 'Artist',
      title: a.name,
      subtitle: (a.genres || []).join(', ')
    }));

  const albums = (await readJSON('albums.json'))
    .slice(-4)
    .map(a => ({
      type: (a.type || '').toUpperCase(),
      title: a.title,
      subtitle: a.releaseDate || ''
    }));

  const tracks = (await readJSON('tracks.json'))
    .slice(-4)
    .map(t => ({
      type: 'Track',
      title: t.title,
      subtitle: t.duration || ''
    }));

  const items = [...albums, ...artists, ...tracks].slice(-6);

  return new Response(
    JSON.stringify({ items }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
