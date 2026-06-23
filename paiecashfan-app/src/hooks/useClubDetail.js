// ============================================================
// useClubDetail(slug)
//
// Stratégie : API-first avec fallback sur les données statiques.
//
// 1. On résout immédiatement le club depuis le registry local
//    (findClubBySlug) → l'UI s'affiche sans aucun délai.
// 2. En parallèle on tente GET /api/v2/marketplace/clubs/:slug
//    → si la réponse contient des players / trophies / products
//    depuis Supabase, on les fusionne dans le club pour enrichir l'UI.
// 3. Si l'API est inaccessible ou renvoie 404, on garde les données
//    statiques sans aucun message d'erreur visible.
//
// Ainsi tous les clubs (même ceux non seedés) continuent de fonctionner.
// ============================================================

import { useState, useEffect } from 'react';
import { findClubBySlug } from '@/data/clubsRegistry';
import { apiFetch } from '@/lib/api';

// Mappe la shape API (snake_case) vers la shape attendue par ClubDetail (camelCase).
// On ne pose une clé camelCase que si l'API fournit une valeur, pour ne pas
// écraser les données statiques par des undefined lors de la fusion.
function normalizeApiClub(c) {
  const out = { ...c };
  if (c.founded_year != null)       out.founded        = c.founded_year;
  if (c.primary_color)              out.primaryColor   = c.primary_color;
  if (c.logo_url)                   out.logo           = c.logo_url;
  if (c.stadium_image_url)          out.stadiumImage   = c.stadium_image_url;
  if (c.short_code)                 out.code           = c.short_code;
  if (c.is_federation_hub != null)  out.isFederationHub = c.is_federation_hub;
  if (c.motto_color)                out.mottoColor     = c.motto_color;
  // `federation` peut être un objet (join API) : on le réduit à une string
  // (nom) pour le rendu, sinon React #31 (objet rendu comme enfant). On
  // conserve slug + confédération à part pour la navigation (bouton Retour).
  if (c.federation && typeof c.federation === 'object') {
    out.federationSlug          = c.federation.slug || undefined;
    out.federationConfederation = c.federation.confederation_code || undefined;
    out.federationStadiumImage  = c.federation.stadium_image_url || undefined;
    out.federation              = c.federation.name || undefined;
  }
  return out;
}

// Fusionne l'API par-dessus le stub statique : l'API (donnée saisie dans le BO)
// prime, mais on ignore ses valeurs vides (null / undefined / '') pour laisser
// le statique servir de filet sur les champs non renseignés en base.
// Indispensable car les stubs statiques (leagues.js) posent founded:null,
// stadium:null… qui sinon écraseraient les vraies valeurs de la base.
function mergeApiOverStatic(base, api) {
  const out = { ...(base || {}) };
  for (const [k, v] of Object.entries(api || {})) {
    if (v !== null && v !== undefined && v !== '') out[k] = v;
  }
  return out;
}

export function useClubDetail(slug) {
  const staticClub = findClubBySlug(slug);

  const [club, setClub]           = useState(staticClub);
  const [players, setPlayers]     = useState(staticClub?.squad || []);
  const [starPlayer, setStarPlayer] = useState(staticClub?.starPlayer || null);
  const [trophies, setTrophies]   = useState(staticClub?.trophies?.breakdown || []);
  const [products, setProducts]   = useState([]);
  const [members, setMembers]     = useState([]);   // clubs membres si fédération hub
  const [loading, setLoading]     = useState(true);
  const [fromApi, setFromApi]     = useState(false);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }

    // On réinitialise avec les données statiques immédiatement
    const base = findClubBySlug(slug);
    setClub(base);
    setPlayers(base?.squad || []);
    setStarPlayer(base?.starPlayer || null);
    setTrophies(base?.trophies?.breakdown || []);
    setProducts([]);
    setMembers([]);
    setFromApi(false);
    setLoading(true);

    let cancelled = false;

    apiFetch(`/api/v2/marketplace/clubs/${slug}`)
      .then((json) => {
        if (cancelled || !json?.success) return;

        const { club: apiClub, starPlayer: apiStar, players: apiPlayers,
                trophies: apiTrophies, products: apiProducts, members: apiMembers } = json.data;

        if (!apiClub) return;

        // Fusion : l'API (BO) prime sur le stub statique, mais ses valeurs
        // vides laissent le statique remplir les trous (image stade curée, etc.).
        const normalized = normalizeApiClub(apiClub);
        setClub((prev) => mergeApiOverStatic(prev || base, normalized));

        if (apiStar)    setStarPlayer(apiStar);
        if (apiPlayers?.length)  setPlayers(apiPlayers);
        if (apiTrophies?.length) setTrophies(apiTrophies);
        if (apiProducts?.length) setProducts(apiProducts);
        if (apiMembers?.length)  setMembers(apiMembers);

        setFromApi(true);
      })
      .catch(() => {
        // API indisponible → les données statiques sont déjà en place, rien à faire
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  return { club, players, starPlayer, trophies, products, members, loading, fromApi };
}
