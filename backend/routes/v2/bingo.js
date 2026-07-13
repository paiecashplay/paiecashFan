// ═══════════════════════════════════════════════════════════════
// routes/v2/bingo.js — PaieCash Sport Bingo (Phase 1). Monté sur /api/v2/bingo.
//   Public : GET / (éditions), GET /:slug (édition + matchs + events + ma carte)
//   Joueur : POST /:slug/card, PUT /card/:id/picks, POST /card/:id/submit, GET /me/credits
//   Admin (super_admin) : CRUD éditions / matchs / événements
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { requireAuth, optionalAuth, requireRole } = require('../../middleware/auth');
const bingo = require('../../db/bingo');
const wallet = require('../../db/wallet');
const scoring = require('../../services/bingoScoring');
const { getFootballProvider } = require('../../services/footballProvider');
const supabase = require('../../db/supabase');

const router = express.Router();
const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400, extra = {}) => res.status(s).json({ success: false, data: null, error: msg, ...extra });

const PUBLIC_STATUSES = ['scheduled', 'open', 'live', 'locked', 'calculating', 'completed'];

// ── Public ───────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const editions = await bingo.listEditions({ statuses: PUBLIC_STATUSES });
    return ok(res, { editions });
  } catch (err) { return fail(res, 'Chargement impossible : ' + err.message, 500); }
});

// Classement (public)
router.get('/leaderboard', async (req, res) => {
  try {
    const period = ['weekly', 'monthly', 'all_time'].includes(req.query.period) ? req.query.period : 'all_time';
    return ok(res, { period, entries: await scoring.getLeaderboard(period, 20) });
  } catch (err) { return fail(res, err.message, 500); }
});

router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const edition = await bingo.getEditionBySlug(req.params.slug);
    if (!edition) return fail(res, 'Édition introuvable.', 404);
    const [matches, events] = await Promise.all([bingo.listMatches(edition.id), bingo.listEvents(edition.id)]);

    let card = null, picks = [], credits = null;
    if (req.authUser?.id) {
      card = await bingo.getCard(edition.id, req.authUser.id);
      if (card) picks = await bingo.getPicks(card.id);
      credits = (await bingo.ensureCredits(req.authUser.id)).balance;
    }
    return ok(res, { edition, matches, events, card, picks, credits });
  } catch (err) { return fail(res, 'Chargement impossible : ' + err.message, 500); }
});

// ── Joueur ───────────────────────────────────────────────────
router.get('/me/credits', requireAuth, async (req, res) => {
  try { return ok(res, { balance: await wallet.getBalance(req.authUser.id) }); }
  catch (err) { return fail(res, err.message, 500); }
});

// Mes cartes (toutes éditions confondues).
router.get('/me/cards', requireAuth, async (req, res) => {
  try { return ok(res, { cards: await bingo.listMyCards(req.authUser.id) }); }
  catch (err) { return fail(res, err.message, 500); }
});

// Portefeuille virtuel (Fan Credits) + historique (ledger).
router.get('/me/wallet', requireAuth, async (req, res) => {
  try {
    const [balance, transactions] = await Promise.all([
      wallet.getBalance(req.authUser.id),
      wallet.listTransactions(req.authUser.id, 30),
    ]);
    return ok(res, { balance, transactions });
  } catch (err) { return fail(res, err.message, 500); }
});

// Démarre (ou récupère) ma carte pour une édition.
router.post('/:slug/card', requireAuth, async (req, res) => {
  try {
    const edition = await bingo.getEditionBySlug(req.params.slug);
    if (!edition) return fail(res, 'Édition introuvable.', 404);
    if (!['open', 'scheduled'].includes(edition.status)) return fail(res, 'Cette édition n\'accepte pas (ou plus) de nouvelles grilles.', 409);
    if (edition.locks_at && new Date(edition.locks_at) <= new Date()) return fail(res, 'Les grilles sont verrouillées.', 409);

    const { card, picks, created } = await bingo.createCard(edition, req.authUser.id);
    return ok(res, { card, picks, created });
  } catch (err) {
    if (err.code === 'NO_CREDITS') return fail(res, 'Crédits insuffisants.', 402, { balance: err.balance });
    if (err.code === 'NOT_ENOUGH_EVENTS') return fail(res, err.message, 409);
    return fail(res, 'Impossible de créer la grille : ' + err.message, 500);
  }
});

async function ownCard(req, res, next) {
  const { data } = await supabase.from('bingo_cards').select('*').eq('id', req.params.id).maybeSingle();
  if (!data) return fail(res, 'Grille introuvable.', 404);
  if (data.user_id !== req.authUser.id) return fail(res, 'Accès refusé.', 403);
  req.card = data;
  next();
}

router.put('/card/:id/picks', requireAuth, ownCard, async (req, res) => {
  try {
    const picks = await bingo.savePicks(req.card, req.body?.selections || []);
    return ok(res, { picks });
  } catch (err) {
    if (err.code === 'LOCKED') return fail(res, err.message, 409);
    return fail(res, 'Sauvegarde impossible : ' + err.message, 500);
  }
});

router.post('/card/:id/submit', requireAuth, ownCard, async (req, res) => {
  try {
    const card = await bingo.submitCard(req.card);
    return ok(res, { card });
  } catch (err) {
    if (err.code === 'INCOMPLETE') return fail(res, err.message, 400);
    if (err.code === 'LOCKED') return fail(res, err.message, 409);
    return fail(res, 'Validation impossible : ' + err.message, 500);
  }
});

// ── Admin (super_admin) ──────────────────────────────────────
router.use('/admin', requireAuth, requireRole('super_admin'));

router.get('/admin/editions', async (req, res) => {
  try { return ok(res, { editions: await bingo.listEditions({}) }); }
  catch (err) { return fail(res, err.message, 500); }
});
router.get('/admin/editions/:id', async (req, res) => {
  try {
    const edition = await bingo.getEditionById(req.params.id);
    if (!edition) return fail(res, 'Introuvable.', 404);
    const [matches, events] = await Promise.all([bingo.listMatches(edition.id), bingo.listEvents(edition.id)]);
    return ok(res, { edition, matches, events });
  } catch (err) { return fail(res, err.message, 500); }
});
router.post('/admin/editions', async (req, res) => {
  try {
    if (!req.body?.slug || !req.body?.title) return fail(res, 'slug et title requis.');
    const edition = await bingo.createEdition({ ...req.body, createdBy: req.authUser.id });
    return ok(res, { edition });
  } catch (err) {
    if (err.code === 'DUPLICATE_SLUG') return fail(res, err.message, 409);
    return fail(res, err.message, 500);
  }
});
router.put('/admin/editions/:id', async (req, res) => {
  try { return ok(res, { edition: await bingo.updateEdition(req.params.id, req.body || {}) }); }
  catch (err) { return fail(res, err.message, 500); }
});
router.delete('/admin/editions/:id', async (req, res) => {
  try { await bingo.deleteEdition(req.params.id); return ok(res, { deleted: true }); }
  catch (err) { return fail(res, err.message, 500); }
});

router.post('/admin/editions/:id/matches', async (req, res) => {
  try { return ok(res, { match: await bingo.addMatch(req.params.id, req.body || {}) }); }
  catch (err) { return fail(res, err.message, 500); }
});
router.put('/admin/matches/:mid', async (req, res) => {
  try { return ok(res, { match: await bingo.updateMatch(req.params.mid, req.body || {}) }); }
  catch (err) { return fail(res, err.message, 500); }
});
router.delete('/admin/matches/:mid', async (req, res) => {
  try { await bingo.deleteMatch(req.params.mid); return ok(res, { deleted: true }); }
  catch (err) { return fail(res, err.message, 500); }
});

router.post('/admin/editions/:id/events', async (req, res) => {
  try { return ok(res, { event: await bingo.addEvent(req.params.id, req.body || {}) }); }
  catch (err) { return fail(res, err.message, 500); }
});

// Match + événement 1/N/2 en une fois (saisie unifiée).
router.post('/admin/editions/:id/match-event', async (req, res) => {
  try {
    const order = (await bingo.listMatches(req.params.id)).length;
    return ok(res, await bingo.addMatchWithEvent(req.params.id, req.body || {}, order));
  } catch (err) { return fail(res, err.message, 500); }
});

// Import en masse de matchs (+ leurs événements, résultats optionnels).
router.post('/admin/editions/:id/matches/bulk', async (req, res) => {
  try { return ok(res, await bingo.bulkAddMatches(req.params.id, req.body?.matches || [])); }
  catch (err) { return fail(res, err.message, 500); }
});

// Supprime un événement + son match associé.
router.delete('/admin/events/:eid/with-match', async (req, res) => {
  try { await bingo.deleteEventWithMatch(req.params.eid); return ok(res, { deleted: true }); }
  catch (err) { return fail(res, err.message, 500); }
});
router.put('/admin/events/:eid', async (req, res) => {
  try { return ok(res, { event: await bingo.updateEvent(req.params.eid, req.body || {}) }); }
  catch (err) { return fail(res, err.message, 500); }
});
router.delete('/admin/events/:eid', async (req, res) => {
  try { await bingo.deleteEvent(req.params.eid); return ok(res, { deleted: true }); }
  catch (err) { return fail(res, err.message, 500); }
});

// Clôture + calcul des points d'une édition (idempotent).
router.post('/admin/editions/:id/settle', async (req, res) => {
  try { return ok(res, await scoring.settleEdition(req.params.id)); }
  catch (err) { return fail(res, 'Scoring impossible : ' + err.message, 500); }
});

// Données foot (via le provider abstrait — mock au MVP) pour l'import de matchs.
router.get('/admin/football/competitions', async (req, res) => {
  try { return ok(res, { competitions: await getFootballProvider().getCompetitions() }); }
  catch (err) { return fail(res, err.message, 500); }
});
router.get('/admin/football/fixtures', async (req, res) => {
  try { return ok(res, { fixtures: await getFootballProvider().getFixtures({ competition: req.query.competition }) }); }
  catch (err) { return fail(res, err.message, 500); }
});

module.exports = router;
