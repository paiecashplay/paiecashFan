// ═══════════════════════════════════════════════════════════════
// services/moderation/mockProvider.js — Fournisseur heuristique.
// Sert : (1) en dev/tests sans clé IA, (2) de repli si Claude est
// indisponible. Volontairement simple et déterministe.
//
// Ce n'est PAS un modérateur sérieux : il attrape les cas grossiers.
// Le vrai classement vient de claudeProvider.
// ═══════════════════════════════════════════════════════════════

const { normalize } = require('./types');

// Motifs par catégorie. Bornés par \b pour éviter les faux positifs
// (« Cannes » ne doit pas matcher une insulte contenue dedans).
const RULES = [
  { category: 'racism', risk: 'critical', words: ['negre', 'nègre', 'bougnoule', 'youpin', 'sale arabe', 'sale noir', 'sale juif', 'sale blanc', 'singe'] },
  { category: 'hate', risk: 'critical', words: ['sale pd', 'pédé', 'pede', 'tapette', 'sale race'] },
  { category: 'threat', risk: 'critical', words: ['je vais te tuer', 'je vais te crever', 'on va te retrouver', 'je te retrouve', 'tu vas mourir', 'je sais où tu habites'] },
  { category: 'violence', risk: 'high', words: ['on va tous les casser', 'casser la gueule', 'defonce lui', 'défonce-lui', 'brûler le stade'] },
  { category: 'sexual_content', risk: 'high', words: ['nudes', 'suce', 'salope', 'pute'] },
  { category: 'insult', risk: 'medium', words: ['connard', 'enculé', 'encule', 'abruti', 'batard', 'bâtard', 'ferme ta gueule', 'ta gueule', 'idiot', 'imbécile'] },
  { category: 'provocation', risk: 'low', words: ['vous êtes nuls', 'equipe de merde', 'équipe de merde', 'bande de nazes'] },
];

const PERSONAL_DATA = [
  /\b(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}\b/,                      // téléphone FR
  /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i,                             // email
  /\b\d{1,3}\s+(?:rue|avenue|av|bd|boulevard|impasse|allée)\s+\w+/i, // adresse
];

const RANK = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };

// Retire les accents et la ponctuation d'obfuscation (c.o.n.n.a.r.d).
function canon(text) {
  return (text || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[.\-_*]/g, '')
    .replace(/\s+/g, ' ');
}

async function analyze({ content }) {
  const raw = content || '';
  const text = canon(raw);
  const categories = [];
  let risk = 'none';
  let hits = 0;

  for (const rule of RULES) {
    if (rule.words.some((w) => text.includes(canon(w)))) {
      categories.push(rule.category);
      hits += 1;
      if (RANK[rule.risk] > RANK[risk]) risk = rule.risk;
    }
  }
  if (PERSONAL_DATA.some((re) => re.test(raw))) {
    categories.push('personal_data');
    if (RANK['high'] > RANK[risk]) risk = 'high';
  }
  // Spam : cri prolongé ou répétition
  if (raw.length > 20 && raw === raw.toUpperCase() && /[A-Z]{15,}/.test(raw)) {
    categories.push('spam');
    if (RANK['low'] > RANK[risk]) risk = 'low';
  }

  return normalize({
    riskLevel: risk,
    score: Math.min(1, hits * 0.3 + (risk === 'critical' ? 0.7 : 0)),
    categories,
    recommendedAction: RANK[risk] >= RANK['medium'] ? 'flag_for_review' : 'publish',
    explanation: categories.length
      ? `Détection heuristique : ${categories.join(', ')}.`
      : 'Aucun motif problématique détecté.',
  }, { provider: 'mock' });
}

module.exports = { analyze, name: 'mock' };
