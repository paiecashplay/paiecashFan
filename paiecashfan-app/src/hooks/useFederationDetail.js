// ============================================================
// useFederationDetail(slug)
//
// API-first : tente GET /api/v2/marketplace/federations/:slug.
// Si une fédération existe en base (ex: tanzanie, zanzibar, FECAFOOT)
// → renvoie { federation, members, hub, fromApi:true }.
// Sinon → fromApi:false (la page retombe sur les données statiques
// des confédérations CAF/UEFA…).
//
// Passe `slug = null` pour désactiver l'appel (ex: confédération
// statique connue).
// ============================================================

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export function useFederationDetail(slug) {
  const [federation, setFederation] = useState(null);
  const [members, setMembers]       = useState([]);
  const [hub, setHub]               = useState(null);
  const [loading, setLoading]       = useState(Boolean(slug));
  const [fromApi, setFromApi]       = useState(false);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setFromApi(false);
    setFederation(null); setMembers([]); setHub(null);

    apiFetch(`/api/v2/marketplace/federations/${slug}`)
      .then((json) => {
        if (cancelled || !json?.success || !json.data?.federation) return;
        setFederation(json.data.federation);
        setMembers(json.data.members || []);
        setHub(json.data.hub || null);
        setFromApi(true);
      })
      .catch(() => { /* pas en base → repli statique */ })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [slug]);

  return { federation, members, hub, loading, fromApi };
}
