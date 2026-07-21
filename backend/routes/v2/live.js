// ═══════════════════════════════════════════════════════════════
// routes/v2/live.js — Matchs en direct (API-Football)
// · GET /api/v2/live/matches      → tous les lives (grandes compétitions),
//   y compris des clubs NON inscrits sur la plateforme.
// · GET /api/v2/live/club/:slug   → match d'un club inscrit (live > prochain > dernier).
//
// Public (pas d'auth). Fail-open : si l'API est indisponible/quota atteint, on
// renvoie available:false pour que l'UI se masque proprement (jamais d'erreur brute).
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const apiFootball = require('../../services/apiFootball');
const { parseStreamUrl } = require('../../services/streamEmbed');
const tenants = require('../../db/tenants');

const router = express.Router();
const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

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

    const { role, club_id } = req.authUser;
    if (role !== 'super_admin' && !(role === 'club_admin' && club_id === t.id)) {
      return fail(res, 'Accès refusé.', 403);
    }

    const url = (req.body?.url || '').trim();
    const isLive = !!req.body?.isLive;

    // URL fournie → doit être un embed YouTube/Twitch valide (jamais d'iframe arbitraire).
    if (url) {
      const parsed = parseStreamUrl(url);
      if (!parsed) return fail(res, 'Lien non reconnu. Utilise un lien YouTube ou Twitch (live).');
    }

    const metadata = { ...(t.metadata || {}), stream: { url, isLive } };
    await tenants.updateTenant(t.id, { metadata });
    const parsed = url ? parseStreamUrl(url) : null;
    return ok(res, { url, isLive: isLive && !!parsed, provider: parsed?.provider || null, id: parsed?.id || null });
  } catch (err) {
    return fail(res, 'Enregistrement impossible : ' + err.message, 500);
  }
});

module.exports = router;
