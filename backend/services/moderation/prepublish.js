// ═══════════════════════════════════════════════════════════════
// services/moderation/prepublish.js — Lot 6 : détection AVANT publication.
//
// Pipeline (dans l'ordre, du moins cher au plus cher) :
//   1. Rate limit      — instantané, base. Coupe le flood avant tout appel IA.
//   2. Heuristique     — instantané, gratuit. Bloque l'explicite sans appeler
//                        Claude (économise ~$0,006 et 3 s sur les cas évidents).
//   3. Claude          — ~3 s. Rattrape l'implicite que l'heuristique rate
//                        (« retourne cueillir des bananes »).
//
// 🔓 FAIL-OPEN : si l'IA échoue ou dépasse le budget, on PUBLIE et on repasse
//    en analyse asynchrone (lot 5). Bloquer un supporter parce que l'IA est
//    lente ou en panne serait pire que laisser passer un message qu'un humain
//    relira. Une panne d'IA ne doit jamais faire taire le salon.
//
// 🔒 L'IA ne prononce ici qu'une suspension CONSERVATOIRE (temporaire, 1 h) :
//    jamais d'exclusion définitive — verrouillé en base et par issueSanction.
// ═══════════════════════════════════════════════════════════════

const supabase = require('../../db/supabase');
const mock = require('./mockProvider');
const { normalize } = require('./types');

const FLAG_KEY = 'chat_ai_prepublish_enabled';
const FLAG_TTL_MS = 60_000;

// Budget de latence : au-delà, on publie et on analyse en asynchrone.
// Mesuré : ~3 s en moyenne, jusqu'à ~8 s sur les cas graves — d'où 10 s.
const CLAUDE_BUDGET_MS = 10_000;

// Rate limit : 10 contenus / minute / salon. Un supporter humain n'écrit pas
// plus vite ; au-delà c'est du flood.
const RATE_MAX = 10;
const RATE_WINDOW_MS = 60_000;

// Suspension conservatoire : 3 blocages en 10 min → lecture seule 1 h.
const BLOCK_STRIKES = 3;
const BLOCK_WINDOW_MS = 10 * 60_000;
const CONSERVATORY_HOURS = 1;

const CONTENT_TABLE = { message: 'fan_messages', post: 'fan_posts', comment: 'fan_comments' };

let flagCache = { value: null, at: 0 };
async function isEnabled() {
  if (process.env.CHAT_AI_PREPUBLISH_ENABLED === 'false') return false;   // coupe-circuit
  const now = Date.now();
  if (flagCache.value !== null && now - flagCache.at < FLAG_TTL_MS) return flagCache.value;
  try {
    const { data } = await supabase.from('feature_flags').select('enabled').eq('key', FLAG_KEY).maybeSingle();
    flagCache = { value: !!data?.enabled, at: now };
  } catch { flagCache = { value: false, at: now }; }
  return flagCache.value;
}
function _resetFlagCache() { flagCache = { value: null, at: 0 }; }

// ── 1. Rate limit ────────────────────────────────────────────
// Compte TOUT ce que l'auteur a écrit dans la fenêtre, y compris les contenus
// bloqués : sinon on pourrait flooder à coups de messages refusés.
async function isRateLimited({ contentType, tenantId, authorId }) {
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const table = CONTENT_TABLE[contentType] || 'fan_messages';
  let q = supabase.from(table).select('id', { count: 'exact', head: true })
    .eq('author_id', authorId).gte('created_at', since);
  if (table !== 'fan_comments') q = q.eq('tenant_id', tenantId);
  const { count } = await q;
  return (count || 0) >= RATE_MAX;
}

// ── 3. Claude, borné par un budget de latence ────────────────
async function analyzeWithBudget(content) {
  const provider = process.env.ANTHROPIC_API_KEY ? require('./claudeProvider') : mock;
  if (provider.name === 'mock') return null;   // déjà passé par l'heuristique

  const timeout = new Promise((resolve) => setTimeout(() => resolve('TIMEOUT'), CLAUDE_BUDGET_MS));
  const result = await Promise.race([provider.analyze({ content }).catch(() => 'ERROR'), timeout]);
  if (result === 'TIMEOUT' || result === 'ERROR' || !result) return null;   // → fail-open
  return result;
}

// ── Suspension conservatoire ─────────────────────────────────
// Temporaire et révocable : l'IA gagne du temps, l'humain tranche.
async function maybeSuspend({ tenantId, authorId }) {
  const since = new Date(Date.now() - BLOCK_WINDOW_MS).toISOString();
  const { count } = await supabase.from('fan_messages').select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId).eq('author_id', authorId)
    .eq('moderation_status', 'blocked').gte('created_at', since);
  if ((count || 0) < BLOCK_STRIKES) return null;

  const mod = require('../../db/chatModeration');
  // Déjà sous le coup d'une sanction ? on n'empile pas.
  if (await mod.getActiveSanction(authorId, tenantId)) return null;

  try {
    return await mod.issueSanction({
      userId: authorId, tenantId, type: 'mute',
      durationHours: CONSERVATORY_HOURS, isPermanent: false,
      reasonCode: 'auto_conservatory',
      reasonText: `Suspension conservatoire : ${count} contenus bloqués en ${BLOCK_WINDOW_MS / 60000} minutes. Un modérateur va relire.`,
      issuedBy: null, actorType: 'ai',   // ← temporaire : autorisé à l'IA
    });
  } catch (err) {
    console.warn('[moderation] suspension conservatoire impossible :', err.message);
    return null;   // ne bloque jamais le pipeline
  }
}

// ── Le portail ───────────────────────────────────────────────
// Retourne { allowed, action, reason, ai }.
//  · action 'blocked'         → high/critical : dossier ouvert pour un humain
//  · action 'request_rewrite' → medium : on demande de reformuler, SANS dossier
//    (proportionné : un « connard » ne doit pas inonder la file des modérateurs)
async function screenBeforePublish({ contentType = 'message', tenantId, authorId, content }) {
  if (!(await isEnabled())) return { allowed: true, skipped: true };

  // 1. Flood
  if (await isRateLimited({ contentType, tenantId, authorId })) {
    return {
      allowed: false, action: 'rate_limited', ai: null,
      reason: 'Tu écris trop vite. Patiente une minute avant de reprendre.',
    };
  }

  // 2. Heuristique — instantanée et gratuite
  const quick = await mock.analyze({ content }).catch(() => null);
  if (quick && ['high', 'critical'].includes(quick.riskLevel)) {
    return { allowed: false, action: 'blocked', ai: quick, reason: reasonFor(quick) };
  }

  // 3. Claude — rattrape l'implicite. Fail-open si indisponible.
  const deep = await analyzeWithBudget(content);
  if (!deep) {
    // L'IA n'a pas répondu à temps : on publie, le lot 5 analysera en asynchrone.
    return { allowed: true, degraded: true };
  }
  if (['high', 'critical'].includes(deep.riskLevel)) {
    return { allowed: false, action: 'blocked', ai: deep, reason: reasonFor(deep) };
  }
  if (deep.riskLevel === 'medium') {
    return { allowed: false, action: 'request_rewrite', ai: deep, reason: reasonFor(deep) };
  }

  return { allowed: true, ai: deep };
}

const REASON_TEXT = {
  racism: 'des propos à caractère raciste', hate: 'des propos haineux',
  threat: 'une menace', violence: 'un appel à la violence',
  insult: 'une insulte visant une personne', harassment: 'du harcèlement',
  sexual_content: 'un contenu sexuel', personal_data: 'des données personnelles',
  spam: 'du spam', provocation: 'une provocation',
};

// Message rendu au supporter : on dit CE QUI bloque, sans recopier l'analyse
// brute de l'IA (ni son ton, ni ses éventuelles erreurs de formulation).
function reasonFor(r) {
  const cats = (r.categories || []).filter((c) => c !== 'clean');
  const what = cats.map((c) => REASON_TEXT[c]).filter(Boolean).join(' et ');
  return what
    ? `Ton message n'a pas été publié : il contient ${what}. Reformule-le dans le respect de la charte.`
    : "Ton message n'a pas été publié car il ne respecte pas la charte du salon.";
}

module.exports = {
  screenBeforePublish, maybeSuspend, isEnabled, isRateLimited,
  FLAG_KEY, _resetFlagCache,
  RATE_MAX, BLOCK_STRIKES, CONSERVATORY_HOURS, CLAUDE_BUDGET_MS,
};
