// ═══════════════════════════════════════════════════════════════
// routes/v2/marketplace/fan-feed.js — Fan Club (feed + chat par club)
// Monté sur /api/v2/clubs. Toutes les routes exigent une session
// (requireAuth) — tout fan connecté peut lire et publier.
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { requireAuth } = require('../../../middleware/auth');
const fanFeed = require('../../../db/fanFeed');

const router = express.Router();
router.use(requireAuth);

const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

const MAX = 2000;
const clean = (v) => (typeof v === 'string' ? v.trim() : '');

// Résout le club (slug → tenant) et le pose sur req.
async function withTenant(req, res, next) {
  const tenant = await fanFeed.resolveTenantId(req.params.slug);
  if (!tenant) return fail(res, 'Club introuvable.', 404);
  req.tenant = tenant;
  next();
}

// GET /api/v2/clubs/:slug/fan-feed
router.get('/:slug/fan-feed', withTenant, async (req, res) => {
  try {
    const data = await fanFeed.getFeed(req.tenant.id, req.authUser.id);
    return ok(res, data);
  } catch (err) {
    return fail(res, 'Chargement du fan club impossible : ' + err.message, 500);
  }
});

// POST /api/v2/clubs/:slug/fan-feed/posts  { content }
router.post('/:slug/fan-feed/posts', withTenant, async (req, res) => {
  const content = clean(req.body?.content);
  if (!content) return fail(res, 'Le message est vide.');
  if (content.length > MAX) return fail(res, 'Message trop long.');
  try {
    const post = await fanFeed.createPost(req.tenant.id, req.authUser.id, content);
    return ok(res, { post });
  } catch (err) {
    return fail(res, 'Publication impossible : ' + err.message, 500);
  }
});

// POST /api/v2/clubs/:slug/fan-feed/posts/:postId/comments  { content }
router.post('/:slug/fan-feed/posts/:postId/comments', withTenant, async (req, res) => {
  const content = clean(req.body?.content);
  if (!content) return fail(res, 'Le commentaire est vide.');
  if (content.length > MAX) return fail(res, 'Commentaire trop long.');
  try {
    const comment = await fanFeed.addComment(req.params.postId, req.authUser.id, content);
    return ok(res, { comment });
  } catch (err) {
    return fail(res, 'Commentaire impossible : ' + err.message, 500);
  }
});

// POST /api/v2/clubs/:slug/fan-feed/posts/:postId/like  → toggle
router.post('/:slug/fan-feed/posts/:postId/like', withTenant, async (req, res) => {
  try {
    const result = await fanFeed.toggleLike(req.params.postId, req.authUser.id);
    return ok(res, result);
  } catch (err) {
    return fail(res, 'Like impossible : ' + err.message, 500);
  }
});

// POST /api/v2/clubs/:slug/fan-feed/messages  { content }
router.post('/:slug/fan-feed/messages', withTenant, async (req, res) => {
  const content = clean(req.body?.content);
  if (!content) return fail(res, 'Le message est vide.');
  if (content.length > MAX) return fail(res, 'Message trop long.');
  try {
    const message = await fanFeed.createMessage(req.tenant.id, req.authUser.id, content);
    return ok(res, { message });
  } catch (err) {
    return fail(res, 'Envoi impossible : ' + err.message, 500);
  }
});

module.exports = router;
