// ═══════════════════════════════════════════════════════════════
// services/moderation/index.js — Pré-classement IA (lot 5).
//
// Analyse APRÈS publication : le message reste visible, mais un dossier
// priorisé est ouvert pour un humain. Le blocage AVANT publication est le
// lot 6 — ici on ne masque jamais.
//
// 🔒 L'IA ne sanctionne pas. Elle ouvre un dossier, rien de plus.
//    (Verrouillé aussi en base : sanction permanente => issued_by NOT NULL.)
//
// Activation : flag `chat_ai_moderation_enabled` en base + ANTHROPIC_API_KEY.
// Sans clé → fournisseur heuristique (mock). Flag off → aucune analyse.
// ═══════════════════════════════════════════════════════════════

const supabase = require('../../db/supabase');
const mock = require('./mockProvider');
const types = require('./types');

const FLAG_KEY = 'chat_ai_moderation_enabled';
const FLAG_TTL_MS = 60_000;      // on ne relit pas le flag à chaque message

let flagCache = { value: null, at: 0 };

async function isEnabled() {
  if (process.env.CHAT_AI_MODERATION_ENABLED === 'false') return false;   // coupe-circuit
  const now = Date.now();
  if (flagCache.value !== null && now - flagCache.at < FLAG_TTL_MS) return flagCache.value;
  try {
    const { data } = await supabase.from('feature_flags').select('enabled').eq('key', FLAG_KEY).maybeSingle();
    flagCache = { value: !!data?.enabled, at: now };
  } catch {
    flagCache = { value: false, at: now };
  }
  return flagCache.value;
}

// Claude si une clé est configurée, sinon heuristique. Jamais d'exception ici :
// le require du SDK ne doit pas casser le serveur si le paquet manque.
function getProvider() {
  if (!process.env.ANTHROPIC_API_KEY) return mock;
  try { return require('./claudeProvider'); }
  catch { return mock; }
}

function providerName() {
  return process.env.ANTHROPIC_API_KEY ? 'claude' : 'mock';
}

// Analyse brute d'un texte (sans effet de bord) — utilisée par les tests
// et par le lot 6. Repli sur le mock si le fournisseur réel échoue.
async function analyzeText(content) {
  const provider = getProvider();
  try {
    return await provider.analyze({ content });
  } catch (err) {
    if (provider.name !== 'mock') {
      console.warn('[moderation] fournisseur', provider.name, 'indisponible :', err.message, '→ repli heuristique');
      try { return await mock.analyze({ content }); } catch { /* ignore */ }
    }
    return null;
  }
}

// Pré-classement d'un contenu publié — message du chat, post OU commentaire.
// Ne bloque jamais la publication : à appeler sans await (fire-and-forget).
async function screenContent({ contentType = 'message', contentId, tenantId, authorId, content }) {
  if (!(await isEnabled())) return null;
  const result = await analyzeText(content);
  if (!result || !result.shouldOpenCase) return result;

  // On délègue à la couche métier : dédoublonnage + audit y sont déjà gérés.
  const mod = require('../../db/chatModeration');
  const caseId = await mod.upsertCaseForContent({
    tenantId, contentType, contentId, targetUserId: authorId, source: 'ai', ai: result,
  });
  return { ...result, caseId };
}

// Le flag est mis en cache 60 s : les tests doivent pouvoir le rafraîchir.
function _resetFlagCache() { flagCache = { value: null, at: 0 }; }

module.exports = { isEnabled, analyzeText, screenContent, getProvider, providerName, FLAG_KEY, _resetFlagCache, ...types };
