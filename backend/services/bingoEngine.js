// ═══════════════════════════════════════════════════════════════
// services/bingoEngine.js — Génération de carte déterministe + helpers.
// La disposition (layout) d'une carte est dérivée d'un SEED unique stocké
// en base → reproductible et vérifiable côté serveur (jamais côté client).
// ═══════════════════════════════════════════════════════════════

const crypto = require('crypto');

const FORMATS = {
  express:  { size: 3, free: false }, // 3×3, 9 événements
  standard: { size: 5, free: true },  // 5×5, 24 événements + FREE au centre
  expert:   { size: 6, free: false }, // 6×6, 36 événements
};

function formatSpec(format) {
  const f = FORMATS[format] || FORMATS.standard;
  const cells = f.size * f.size;
  const freeIndex = f.free ? Math.floor(cells / 2) : -1;
  const needed = cells - (f.free ? 1 : 0);
  return { ...f, cells, freeIndex, needed };
}

function generateSeed() {
  return crypto.randomBytes(12).toString('hex');
}

// PRNG déterministe (mulberry32) initialisé depuis le seed.
function makeRng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates déterministe.
function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Construit le layout : [{ cell, eventId|null, free }]. `eventIds` = ids des
// événements de l'édition. Requiert au moins `needed` événements.
function buildLayout(eventIds, format, seed) {
  const spec = formatSpec(format);
  if (!Array.isArray(eventIds) || eventIds.length < spec.needed) {
    const e = new Error(`Édition incomplète : ${eventIds?.length || 0}/${spec.needed} événements requis pour le format ${format}.`);
    e.code = 'NOT_ENOUGH_EVENTS';
    throw e;
  }
  const rng = makeRng(seed);
  const picked = shuffle(eventIds, rng).slice(0, spec.needed);

  const layout = [];
  let k = 0;
  for (let cell = 0; cell < spec.cells; cell++) {
    if (cell === spec.freeIndex) layout.push({ cell, eventId: null, free: true });
    else layout.push({ cell, eventId: picked[k++], free: false });
  }
  return layout;
}

module.exports = { FORMATS, formatSpec, generateSeed, buildLayout };
