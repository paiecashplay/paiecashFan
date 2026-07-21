import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';

// Match d'un club via API-Football (live > prochain > dernier joué).
// Poll toutes les 30 s quand c'est LIVE, sinon toutes les 5 min (le score ne
// bouge pas). Fail-soft : match=null si l'API est indisponible → la bannière
// affiche un état neutre plutôt qu'une erreur.
export function useLiveMatch(slug) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const timer = useRef(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return undefined; }
    let alive = true;

    const load = async () => {
      try {
        const j = await apiFetch(`/api/v2/live/club/${encodeURIComponent(slug)}`);
        if (!alive) return;
        const m = j?.data?.available ? j.data.match : null;
        setMatch(m);
        const delay = m?.status === 'LIVE' ? 30_000 : 5 * 60_000;
        timer.current = window.setTimeout(load, delay);
      } catch {
        if (alive) { setMatch(null); timer.current = window.setTimeout(load, 5 * 60_000); }
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => { alive = false; if (timer.current) window.clearTimeout(timer.current); };
  }, [slug]);

  return { match, loading };
}
