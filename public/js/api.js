// Same-origin calls to Vercel Functions under /api
const API_BASE = ""; // e.g., fetch('/api/whatever')

async function api(path, opts = {}) {
  const method = opts.method || "GET";
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {})
  };
  const body = method !== "GET" && opts.body ? JSON.stringify(opts.body) : undefined;

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    credentials: "include",
    body
  });

  let data = {};
  try {
    data = await res.json();
  } catch (err) {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.error || res.statusText);
  }

  return data;
}
