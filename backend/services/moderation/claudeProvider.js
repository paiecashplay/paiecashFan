// ═══════════════════════════════════════════════════════════════
// services/moderation/claudeProvider.js — Classement par Claude.
//
// 🔒 SÉCURITÉ : ANTHROPIC_API_KEY est lue ici, côté serveur uniquement.
//    Elle n'est JAMAIS renvoyée au frontend ni exposée dans une réponse API.
//
// Tâche : classification de texte court → un seul appel, sortie JSON
// contrainte par schéma (output_config.format). Pas de streaming (sortie
// minuscule), pas de tool use (rien à exécuter, juste un verdict).
// ═══════════════════════════════════════════════════════════════

const Anthropic = require('@anthropic-ai/sdk');
const { normalize, CATEGORIES, RISK_LEVELS, AI_ACTIONS } = require('./types');

const MODEL = 'claude-opus-4-8';
const MAX_CHARS = 2000;          // un message de salon est court ; on borne le coût
// Généreux à dessein : l'analyse tourne APRÈS publication, sans await — personne
// n'attend. Mesuré : ~3 s en moyenne, mais jusqu'à ~8 s sur les cas graves, qui
// demandent le plus de réflexion. Un timeout serré ferait donc échouer en premier
// les messages qu'il faut surtout ne pas rater.
const TIMEOUT_MS = 25000;

let client = null;
function getClient() {
  if (!client) client = new Anthropic();   // lit ANTHROPIC_API_KEY dans l'env
  return client;
}

// Schéma de sortie : le modèle NE PEUT PAS répondre autre chose.
const SCHEMA = {
  type: 'object',
  properties: {
    riskLevel: { type: 'string', enum: RISK_LEVELS },
    score: { type: 'number' },
    categories: { type: 'array', items: { type: 'string', enum: CATEGORIES } },
    recommendedAction: { type: 'string', enum: AI_ACTIONS },
    explanation: { type: 'string' },
    requiresHumanReview: { type: 'boolean' },
  },
  required: ['riskLevel', 'score', 'categories', 'recommendedAction', 'explanation', 'requiresHumanReview'],
  additionalProperties: false,
};

const SYSTEM = `Tu es un modérateur de salons de supporters de football (PaieCashFan).
Tu analyses UN message et tu le classes. Tu ne parles jamais à l'utilisateur.

Contexte indispensable — la passion footballistique est NORMALE :
- Chambrer l'équipe adverse, râler sur l'arbitre, critiquer un joueur ou le coach,
  dire "on est nuls ce soir" ou "quel match pourri" = clean. Ce n'est PAS de la modération.
- Les rivalités entre clubs, les chants de supporters et l'argot du foot sont attendus.

Tu signales UNIQUEMENT :
- insult: insulte visant une personne (pas une critique sportive)
- harassment: acharnement répété sur une personne
- hate / racism: haine visant un groupe (origine, religion, orientation, handicap)
- threat: menace de violence envers une personne
- violence: appel ou incitation à la violence physique
- sexual_content: contenu sexuel explicite ou non sollicité
- personal_data: téléphone, email, adresse, données privées d'un tiers
- spam: publicité, arnaque, flood
- provocation: provocation gratuite destinée à envenimer
- clean: rien à signaler

Niveaux de risque :
- none/low: laisser publier (clean ou simple chambrage)
- medium: insulte ou provocation nette → un humain doit regarder
- high: haine, menace, données personnelles, contenu sexuel
- critical: racisme, menace de mort, appel à la violence

Règles absolues :
- Dans le doute, choisis le niveau le PLUS BAS. Un faux positif frustre un supporter innocent.
- Tu ne décides JAMAIS d'une sanction ni d'une exclusion : tu ne fais que classer.
- recommendedAction vaut "publish" (rien à signaler) ou "flag_for_review" (un humain tranche).`;

async function analyze({ content }) {
  const text = (content || '').slice(0, MAX_CHARS);
  if (!text.trim()) return normalize({ riskLevel: 'none' }, { provider: 'claude' });

  // Pas de cache_control : le prompt système (~900 tokens) est sous le minimum
  // cachable d'Opus 4.8 (4096). Le marqueur serait ignoré silencieusement.
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM,
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{ role: 'user', content: `Message à classer :\n<message>\n${text}\n</message>` }],
  }, { timeout: TIMEOUT_MS });

  // Le modèle peut refuser (contenu extrême) : on traite comme "à revoir".
  if (response.stop_reason === 'refusal') {
    return normalize({
      riskLevel: 'high', score: 0.9, categories: ['hate'],
      recommendedAction: 'flag_for_review', requiresHumanReview: true,
      explanation: 'Contenu refusé par le classifieur : revue humaine requise.',
    }, { provider: 'claude' });
  }

  const block = response.content.find((b) => b.type === 'text');
  let raw = {};
  try { raw = JSON.parse(block?.text || '{}'); } catch { /* normalize gère le vide */ }
  return normalize(raw, { provider: 'claude' });
}

module.exports = { analyze, name: 'claude', MODEL };
