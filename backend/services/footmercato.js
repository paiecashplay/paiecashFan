// ═══════════════════════════════════════════════════════════════
// services/footmercato.js — Récupère le palmarès d'un club depuis
// footmercato.net (page /club/{slug}/palmares, endpoint "partial").
//
// ⚠️ Scraping d'un site tiers : à utiliser dans le respect de ses CGU.
//    Le HTML "partial" est mal formé (td non fermés) → on parse via les
//    noms de compétitions (data-name) servant d'ancres dans le texte.
//
// Renvoie : [{ label, count, years_text, scope }]
// ═══════════════════════════════════════════════════════════════

const axios = require('axios');

const UA = 'Mozilla/5.0 (compatible; PaieCashFanBot/1.0)';

// Devine le scope (contrainte trophies.scope) d'après le nom de la compétition
function guessScope(label) {
  const l = (label || '').toLowerCase();
  if (/(ligue des champions|champions league|europa|uefa|supercoupe d'europe|coupe d'europe|conference league|c1|c3)/.test(l)) return 'european';
  if (/(monde|mondial|intercontinental|club world|fifa)/.test(l)) return 'world';
  return 'domestic';
}

// GET footmercato palmarès (partial) → liste de trophées normalisée
async function getTrophies(slug) {
  const clean = String(slug || '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!clean) throw new Error('slug Foot Mercato requis (ex: ol, psg, om)');

  const url = `https://www.footmercato.net/club/${encodeURIComponent(clean)}/palmares?partial=1&order%5Bcompetition%5D=ASC`;
  const { data: html, status } = await axios.get(url, {
    headers: { 'User-Agent': UA, 'X-Requested-With': 'XMLHttpRequest' },
    timeout: 15000,
    validateStatus: () => true
  });
  if (status !== 200 || typeof html !== 'string') {
    throw new Error(`Foot Mercato a répondu ${status} pour « ${clean} »`);
  }

  // Noms des compétitions (ancres) dans l'ordre du document
  const names = [...html.matchAll(/data-name="([^"]+)"/g)].map((m) => m[1]);
  if (!names.length) {
    throw new Error(`Aucun palmarès trouvé pour « ${clean} » (slug Foot Mercato incorrect ?)`);
  }

  // Texte nettoyé, après l'en-tête "Saisons"
  let text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  const headerIdx = text.indexOf('Saisons');
  const after = headerIdx >= 0 ? text.slice(headerIdx + 'Saisons'.length) : text;

  const trophies = [];
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const start = after.indexOf(name);
    if (start < 0) continue;
    const nextStart = (i + 1 < names.length) ? after.indexOf(names[i + 1], start + name.length) : after.length;
    const seg = after.slice(start + name.length, nextStart < 0 ? after.length : nextStart).trim();
    const cm = seg.match(/\d+/);
    const count = cm ? parseInt(cm[0], 10) : 0;
    const years = cm ? seg.slice(seg.indexOf(cm[0]) + cm[0].length).trim() : '';
    if (name && count > 0) {
      trophies.push({ label: name, count, years_text: years || null, scope: guessScope(name) });
    }
  }
  return trophies;
}

module.exports = { getTrophies };
