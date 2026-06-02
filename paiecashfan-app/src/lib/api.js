// ============================================================
// API client pour paiecashfan-app
// ------------------------------------------------------------
// En dev : Vite proxy /api/* → http://localhost:5173 (Worker Hono)
// En prod : même domaine que la SPA, donc fetch('/api/...') directement
// La variable VITE_API_BASE peut surcharger pour pointer ailleurs.
// ============================================================

const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} on ${path}`);
  }
  return res.json();
}
