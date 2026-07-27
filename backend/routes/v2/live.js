// ═══════════════════════════════════════════════════════════════
// routes/v2/live.js — Matchs en direct (API-Football)
// · GET /api/v2/live/matches      → tous les lives (grandes compétitions),
//   y compris des clubs NON inscrits sur la plateforme.
// · GET /api/v2/live/club/:slug   → match d'un club inscrit (live > prochain > dernier).
//
// Public (pas d'auth). Fail-open : si l'API est indisponible/quota atteint, on
// renvoie available:false pour que l'UI se masque proprement (jamais d'erreur brute).
// ═══════════════════════════════════════════════════════════════

const crypto = require('crypto');
const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const apiFootball = require('../../services/apiFootball');
const { parseStreamUrl } = require('../../services/streamEmbed');
const byteplus = require('../../services/byteplus');
const tenants = require('../../db/tenants');

const router = express.Router();
const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// club_admin de CE club ou super_admin.
function canManage(authUser, tenant) {
  const { role, club_id } = authUser || {};
  return role === 'super_admin' || (role === 'club_admin' && club_id === tenant.id);
}

// Nom de flux stable et unique du club (persistant dans metadata). Généré une
// seule fois : lisible (slug) + suffixe aléatoire pour éviter les collisions.
async function getOrCreateStreamName(t) {
  const existing = t.metadata?.stream?.streamName;
  if (existing) return existing;
  const base = (t.slug || 'club').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32) || 'club';
  const streamName = `${base}-${crypto.randomBytes(3).toString('hex')}`;
  const stream = { ...(t.metadata?.stream || {}), streamName };
  await tenants.updateTenant(t.id, { metadata: { ...(t.metadata || {}), stream } });
  return streamName;
}

router.get('/matches', async (req, res) => {
  try {
    if (!process.env.API_FOOTBALL_KEY) return ok(res, { available: false, matches: [] });
    const matches = await apiFootball.getLiveFixtures();
    return ok(res, { available: true, matches });
  } catch (err) {
    console.warn('[LIVE] /matches indisponible:', err.message);
    return ok(res, { available: false, matches: [] });
  }
});

router.get('/club/:slug', async (req, res) => {
  try {
    const t = await tenants.getTenantBySlugFlexible(req.params.slug);
    if (!t) return fail(res, 'Club introuvable.', 404);
    const teamId = t.metadata?.api_football_id || null;
    if (!teamId) return ok(res, { available: false, match: null });

    const match = await apiFootball.getMatchForTeam(teamId);
    return ok(res, { available: !!match, match });
  } catch (err) {
    console.warn('[LIVE] /club indisponible:', err.message);
    return ok(res, { available: false, match: null });
  }
});

// ── Streaming vidéo du Fan Club (embed YouTube/Twitch, réglé au BO) ──

// GET /api/v2/live/club/:slug/stream — le live du club pour les fans.
// Renvoie { isLive, provider, id } (le front reconstruit l'URL d'embed sûre).
router.get('/club/:slug/stream', async (req, res) => {
  try {
    const t = await tenants.getTenantBySlugFlexible(req.params.slug);
    if (!t) return fail(res, 'Club introuvable.', 404);
    const s = t.metadata?.stream || null;
    const parsed = s?.url ? parseStreamUrl(s.url) : null;
    return ok(res, {
      isLive: !!(s?.isLive && parsed),
      provider: parsed?.provider || null,
      id: parsed?.id || null,
      url: s?.url || '',   // lien public (pour pré-remplir le BO)
      mode: s?.mode || null, // 'byteplus' (natif) | 'external' (YouTube/Twitch/HLS)
    });
  } catch (err) {
    return ok(res, { isLive: false, provider: null, id: null });
  }
});

// PATCH /api/v2/live/club/:slug/stream — règle le live (club_admin de CE club / super_admin).
// Body: { url, isLive }
router.patch('/club/:slug/stream', requireAuth, async (req, res) => {
  try {
    const t = await tenants.getTenantBySlugFlexible(req.params.slug);
    if (!t) return fail(res, 'Club introuvable.', 404);

    if (!canManage(req.authUser, t)) return fail(res, 'Accès refusé.', 403);

    const url = (req.body?.url || '').trim();
    const isLive = !!req.body?.isLive;

    // URL fournie → doit être un embed YouTube/Twitch ou un flux HLS valide.
    if (url) {
      const parsed = parseStreamUrl(url);
      if (!parsed) return fail(res, 'Lien non reconnu. Utilise un lien YouTube, Twitch, ou un flux HLS (.m3u8).');
    }

    // On préserve le streamName natif éventuel ; ce mode = lien externe.
    const stream = { ...(t.metadata?.stream || {}), mode: 'external', url, isLive };
    await tenants.updateTenant(t.id, { metadata: { ...(t.metadata || {}), stream } });
    const parsed = url ? parseStreamUrl(url) : null;
    return ok(res, { url, isLive: isLive && !!parsed, provider: parsed?.provider || null, id: parsed?.id || null });
  } catch (err) {
    return fail(res, 'Enregistrement impossible : ' + err.message, 500);
  }
});

// ── Mode natif « PaieCashFan Live » (BytePlus) — le club diffuse via OBS ──

// GET /api/v2/live/club/:slug/broadcast — accès OBS du club (club_admin/super_admin).
// Renvoie Serveur + Clé de stream SIGNÉE (à coller dans OBS) + l'URL de lecture.
router.get('/club/:slug/broadcast', requireAuth, async (req, res) => {
  try {
    const t = await tenants.getTenantBySlugFlexible(req.params.slug);
    if (!t) return fail(res, 'Club introuvable.', 404);
    if (!canManage(req.authUser, t)) return fail(res, 'Accès refusé.', 403);
    if (!byteplus.isConfigured()) return fail(res, 'Streaming natif non configuré côté serveur.', 503);

    const streamName = await getOrCreateStreamName(t);
    const push = byteplus.pushInfo(streamName);
    return ok(res, {
      streamName,
      server: push.server,
      streamKey: push.streamKey,
      expire: push.expire,          // timestamp d'expiration de la clé OBS
      playUrl: byteplus.playUrl(streamName),
      isLive: !!(t.metadata?.stream?.isLive),
      mode: t.metadata?.stream?.mode || null,
    });
  } catch (err) {
    return fail(res, 'Accès diffusion indisponible : ' + err.message, 500);
  }
});

// POST /api/v2/live/club/:slug/broadcast — passe en direct / arrête (mode natif).
// Body: { isLive }. L'URL de lecture est calculée par le serveur (jamais fournie
// par le client) → un club ne peut pas diffuser sous le nom d'un autre.
router.post('/club/:slug/broadcast', requireAuth, async (req, res) => {
  try {
    const t = await tenants.getTenantBySlugFlexible(req.params.slug);
    if (!t) return fail(res, 'Club introuvable.', 404);
    if (!canManage(req.authUser, t)) return fail(res, 'Accès refusé.', 403);
    if (!byteplus.isConfigured()) return fail(res, 'Streaming natif non configuré côté serveur.', 503);

    const streamName = await getOrCreateStreamName(t);
    const isLive = !!req.body?.isLive;
    const url = byteplus.playUrl(streamName);
    const stream = { mode: 'byteplus', streamName, url, isLive };
    await tenants.updateTenant(t.id, { metadata: { ...(t.metadata || {}), stream } });
    return ok(res, { isLive, playUrl: url, streamName });
  } catch (err) {
    return fail(res, 'Changement d\'état impossible : ' + err.message, 500);
  }
});

module.exports = router;
