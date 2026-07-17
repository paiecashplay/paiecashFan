import { useEffect } from 'react';
import { apiFetch } from '@/lib/api';

const HEARTBEAT_MS = 30_000;   // < fenêtre backend (75 s) → 1 ping manqué toléré

// Signale que le fan est présent dans un salon, tant que la page est ouverte
// ET l'onglet visible. Fire-and-forget : un échec de ping ne casse rien.
// `enabled` permet de couper (ex. mode « friends », ou fan non connecté).
export function usePresence(slug, enabled = true) {
  useEffect(() => {
    if (!slug || !enabled) return;

    let stopped = false;
    const ping = () => {
      if (stopped || document.hidden) return;   // onglet caché → on ne pingue pas
      apiFetch(`/api/v2/clubs/${slug}/presence`, { method: 'POST' }).catch(() => {});
    };

    ping();                                    // présence immédiate à l'entrée
    const id = setInterval(ping, HEARTBEAT_MS);
    // Reping dès qu'on revient sur l'onglet (pour ne pas attendre 30 s).
    const onVisible = () => { if (!document.hidden) ping(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      stopped = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [slug, enabled]);
}
