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

// Jeton d'accès Supabase courant (pour les routes protégées côté backend).
// Import dynamique pour éviter un cycle de dépendances au chargement.
async function authHeader() {
  try {
    const { supabase } = await import('./supabase');
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const auth = await authHeader();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const res = await fetch(url, {
    ...options,
    headers: {
      // FormData : on laisse le navigateur poser le Content-Type (boundary).
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...auth,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    // On tente de remonter le message d'erreur JSON du backend si présent.
    let msg = `API ${res.status} on ${path}`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch { /* pas de JSON */ }
    throw new Error(msg);
  }
  return res.json();
}
