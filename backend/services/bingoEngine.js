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

// Détecte les figures gagnantes à partir d'un tableau de booléens `correct`
// (indexé par case ; cases FREE = true). `size` = côté de la grille.
// Retourne { codes: [...], completeLines }.
function detectFigures(correct, size) {
  const at = (r, c) => !!correct[r * size + c];
  const codes = new Set();
  let completeLines = 0;

  for (let r = 0; r < size; r++) { let all = true; for (let c = 0; c < size; c++) if (!at(r, c)) all = false; if (all) { codes.add('LINE_HORIZONTAL'); completeLines++; } }
  for (let c = 0; c < size; c++) { let all = true; for (let r = 0; r < size; r++) if (!at(r, c)) all = false; if (all) { codes.add('LINE_VERTICAL'); completeLines++; } }

  let d1 = true, d2 = true;
  for (let i = 0; i < size; i++) { if (!at(i, i)) d1 = false; if (!at(i, size - 1 - i)) d2 = false; }
  if (d1 || d2) codes.add('DIAGONAL');
  if (d1 && d2) codes.add('X_SHAPE');

  if (at(0, 0) && at(0, size - 1) && at(size - 1, 0) && at(size - 1, size - 1)) codes.add('FOUR_CORNERS');

  sq: for (let r = 0; r < size - 1; r++) for (let c = 0; c < size - 1; c++) {
    if (at(r, c) && at(r, c + 1) && at(r + 1, c) && at(r + 1, c + 1)) { codes.add('SQUARE_2X2'); break sq; }
  }

  if (size % 2 === 1) {
    const m = Math.floor(size / 2);
    let row = true, col = true;
    for (let i = 0; i < size; i++) { if (!at(m, i)) row = false; if (!at(i, m)) col = false; }
    if (row && col) codes.add('CROSS');
  }

  if (completeLines >= 2) codes.add('DOUBLE_LINE');
  if (completeLines >= 3) codes.add('TRIPLE_LINE');
  if (correct.length && correct.every(Boolean)) codes.add('FULL_CARD');

  return { codes: [...codes], completeLines };
}

module.exports = { FORMATS, formatSpec, generateSeed, buildLayout, detectFigures };
