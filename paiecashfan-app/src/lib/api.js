// ============================================================
// API client pour paiecashfan-app
// ------------------------------------------------------------
// En dev : Vite proxy /api/* → http://localhost:5173 (Worker Hono)
// En prod : même domaine que la SPA, donc fetch('/api/...') directement
// La variable VITE_API_BASE peut surcharger pour pointer ailleurs.
// ============================================================

// Normalise VITE_API_BASE : ajoute https:// si le schéma est oublié (sinon
// fetch traite l'URL comme relative et tape le front au lieu du backend),
// et retire un éventuel / final.
const RAW_BASE = import.meta.env.VITE_API_BASE || '';
const API_BASE = RAW_BASE
  ? (/^https?:\/\//.test(RAW_BASE) ? RAW_BASE : `https://${RAW_BASE}`).replace(/\/+$/, '')
  : '';

// Construit l'URL absolue vers le backend. À utiliser pour les requêtes qui
// ne passent PAS par apiFetch (ex: upload multipart/form-data).
export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

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
