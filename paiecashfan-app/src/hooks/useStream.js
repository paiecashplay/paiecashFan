import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';

// Live vidéo du club (embed réglé au BO). Re-vérifie toutes les 60 s car le
// club peut lancer/arrêter son live à tout moment.
export function useStream(slug) {
  const [stream, setStream] = useState({ isLive: false, provider: null, id: null });
  const timer = useRef(null);

  useEffect(() => {
    if (!slug) return undefined;
    let alive = true;

    const load = async () => {
      try {
        const j = await apiFetch(`/api/v2/live/club/${encodeURIComponent(slug)}/stream`);
        if (alive && j?.data) setStream(j.data);
      } catch { /* fail-soft : on garde l'état précédent */ }
      if (alive) timer.current = window.setTimeout(load, 60_000);
    };

    load();
    return () => { alive = false; if (timer.current) window.clearTimeout(timer.current); };
  }, [slug]);

  return stream;
}
