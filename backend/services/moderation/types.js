// ═══════════════════════════════════════════════════════════════
// services/moderation/types.js — Contrat commun à tous les fournisseurs
// d'analyse (mock, Claude, futur autre). Le reste du code ne connaît QUE
// ce format normalisé : on peut changer de fournisseur sans rien casser.
//
// 🔒 L'IA ne PEUT PAS : bannir, exclure définitivement, supprimer un compte,
//    trancher un appel. Elle ne fait que PRÉ-CLASSER (lot 5).
//    Cette limite est aussi verrouillée en base (CHECK sur chat_sanctions).
// ═══════════════════════════════════════════════════════════════

// Catégories alignées sur les motifs de signalement (REPORT_REASONS).
const CATEGORIES = [
  'insult', 'harassment', 'hate', 'racism', 'threat', 'violence',
  'sexual_content', 'personal_data', 'spam', 'provocation', 'clean',
];

const RISK_LEVELS = ['none', 'low', 'medium', 'high', 'critical'];

// Ce que l'IA a le droit de RECOMMANDER (jamais d'exécuter une exclusion).
const AI_ACTIONS = [
  'publish',          // rien à signaler
  'flag_for_review',  // dossier ouvert pour un humain
  'request_rewrite',  // proposer une reformulation (lot 6)
  'hold_for_review',  // masquer en attente (lot 6 — jamais en lot 5)
];

const RISK_TO_PRIORITY = { none: 'low', low: 'low', medium: 'normal', high: 'high', critical: 'critical' };

// Un risque >= medium ouvre un dossier ; >= high exige une revue humaine.
function normalize(raw, { provider }) {
  const risk = RISK_LEVELS.includes(raw?.riskLevel) ? raw.riskLevel : 'none';
  const categories = Array.isArray(raw?.categories)
    ? raw.categories.filter((c) => CATEGORIES.includes(c)) : [];
  let action = AI_ACTIONS.includes(raw?.recommendedAction) ? raw.recommendedAction : 'publish';
  // Garde-fou : une IA qui dit « publish » sur un risque élevé est ignorée.
  if (['high', 'critical'].includes(risk) && action === 'publish') action = 'flag_for_review';

  return {
    provider,
    riskLevel: risk,
    score: typeof raw?.score === 'number' ? Math.max(0, Math.min(1, raw.score)) : 0,
    categories: categories.length ? categories : ['clean'],
    recommendedAction: action,
    explanation: typeof raw?.explanation === 'string' ? raw.explanation.slice(0, 500) : '',
    requiresHumanReview: ['high', 'critical'].includes(risk) || raw?.requiresHumanReview === true,
    priority: RISK_TO_PRIORITY[risk] || 'normal',
    shouldOpenCase: ['medium', 'high', 'critical'].includes(risk),
  };
}

module.exports = { CATEGORIES, RISK_LEVELS, AI_ACTIONS, RISK_TO_PRIORITY, normalize };
