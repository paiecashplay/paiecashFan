// ═══════════════════════════════════════════════════════════════
// routes/internal.js — Endpoints server-to-server pour partenaires
// (PaieCashCoin). AUCUN token utilisateur, AUCUN usage frontend :
// authentification par clé partagée `Authorization: Bearer <clé>`,
// stockée UNIQUEMENT en variable d'env backend (Railway), jamais côté
// front/Vercel, jamais commitée.
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { timingSafeEqual } = require('crypto');
const supabase = require('../db/supabase');
const router = express.Router();

const INTERNAL_KEY = process.env.INTERNAL_API_KEY || '';

// Comparaison à temps constant (anti timing-attack).
function keyMatches(provided) {
  if (!INTERNAL_KEY || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(INTERNAL_KEY);
  return a.length === b.length && timingSafeEqual(a, b);
}

function requireInternalKey(req, res, next) {
  if (!INTERNAL_KEY) {
    // Clé non configurée en prod → on refuse plutôt que d'ouvrir l'accès.
    return res.status(503).json({ error: 'internal_api_key_not_configured' });
  }
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7).trim() : '';
  if (!keyMatches(token)) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

// Cherche un compte PaieCashFan par email dans Supabase Auth (source de
// vérité : email + Google login vivent dans auth.users). supabase-js n'expose
// pas de getUserByEmail → on pagine listUsers. Volume faible et appels peu
// fréquents (déclenché à la liaison de compte / à l'achat côté PCC). À migrer
// vers une RPC SQL indexée si la base d'utilisateurs grossit fortement.
async function findAuthUserByEmail(email) {
  const target = email.trim().toLowerCase();
  const perPage = 1000;
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    const users = data?.users || [];
    const found = users.find((u) => (u.email || '').toLowerCase() === target);
    if (found) return found;
    if (users.length < perPage) break; // dernière page atteinte
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// POST /api/internal/verify-subscriber
// Body    : { email: string }
// Réponse : { exists, subscribed, userId?, plan?, subscribedSince? }
//
// NB PaieCashFan n'a PAS de "plan" payant plateforme : être un compte fan
// actif EST l'éligibilité au bonus. Donc subscribed = compte existant & actif,
// plan = null (pas de tiers). `subscribedSince` = date de création du compte.
// ─────────────────────────────────────────────────────────────
router.post('/verify-subscriber', requireInternalKey, async (req, res) => {
  try {
    const email = (req.body && req.body.email ? String(req.body.email) : '').trim();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'invalid_email' });
    }

    const user = await findAuthUserByEmail(email);
    if (!user) {
      return res.json({ exists: false, subscribed: false });
    }

    // Compte actif = non banni (auth.users.banned_until dans le futur = banni).
    const banned = !!user.banned_until && new Date(user.banned_until) > new Date();

    return res.json({
      exists: true,
      subscribed: !banned,
      userId: user.id,
      plan: null, // pas de plan/tier chez PaieCashFan
      subscribedSince: user.created_at || null,
    });
  } catch (err) {
    console.error('[internal/verify-subscriber]', err.message);
    return res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
