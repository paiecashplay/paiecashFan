import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

// Hook minimal pour fetch un endpoint de l'API Hono.
// - `path` : ex '/api/federations'
// - `options.fallback` : valeur renvoyée si l'API échoue (mock data)
// Retourne { data, loading, error, isLive }
//   isLive=true : data vient de l'API
//   isLive=false : data vient du fallback (Worker offline ou erreur)
export function useApi(path, { fallback = null } = {}) {
  const [state, setState] = useState({
    data: fallback,
    loading: true,
    error: null,
    isLive: false
  });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    apiFetch(path)
      .then((res) => {
        if (!alive) return;
        setState({ data: res, loading: false, error: null, isLive: true });
      })
      .catch((err) => {
        if (!alive) return;
        if (import.meta.env.DEV) {
          console.warn(`[api] ${path} → fallback:`, err.message);
        }
        setState({ data: fallback, loading: false, error: err, isLive: false });
      });
    return () => { alive = false; };
  }, [path]);

  return state;
}
