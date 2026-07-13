// ═══════════════════════════════════════════════════════════════
// services/bingoScoring.js — Moteur de scoring Sport Bingo (Phase 2b).
// À la clôture d'une édition : note chaque case (correct/incorrect/void),
// détecte les figures, attribue les points de façon IDEMPOTENTE
// (calculation_version + bingo_card_wins), journalise l'audit, met à jour
// le classement. Exécuté côté serveur (service-role) uniquement.
// ═══════════════════════════════════════════════════════════════

const supabase = require('../db/supabase');
const engine = require('./bingoEngine');

const GRID = { express: 3, standard: 5, expert: 6 };

async function audit(row) { await supabase.from('bingo_result_audit_logs').insert(row).then(() => {}, () => {}); }

// Table code→points pour une édition : edition_patterns si configurés, sinon
// défauts de bingo_patterns.
async function resolvePatternPoints(editionId) {
  const { data: patterns } = await supabase.from('bingo_patterns').select('id, code, default_points, active');
  const byCode = {}; const byId = {};
  (patterns || []).forEach((p) => { byCode[p.code] = p; byId[p.id] = p; });

  const { data: eps } = await supabase.from('bingo_edition_patterns').select('pattern_id, points, active').eq('edition_id', editionId);
  const map = {};
  if (eps && eps.length) {
    eps.forEach((e) => { const p = byId[e.pattern_id]; if (p && e.active) map[p.code] = { id: p.id, points: e.points != null ? e.points : p.default_points }; });
  } else {
    Object.values(byCode).forEach((p) => { if (p.active) map[p.code] = { id: p.id, points: p.default_points }; });
  }
  return map;
}

// Note une carte (pur, sans écriture) : renvoie { correct, codes, total, wins }.
function gradeCard(picks, evById, size, pointsByCode) {
  const correct = new Array(size * size).fill(false);
  const graded = [];
  for (const p of picks || []) {
    if (p.state === 'free') { correct[p.cell_index] = true; graded.push({ cell: p.cell_index, state: 'free' }); continue; }
    const ev = p.event_id ? evById[p.event_id] : null;
    let isCorrect = null, state = p.state;
    if (ev && ev.validation_status === 'void') { state = 'void'; }
    else if (ev && ev.official_answer) { isCorrect = p.chosen_option === ev.official_answer; state = isCorrect ? 'correct' : 'incorrect'; }
    if (isCorrect === true) correct[p.cell_index] = true;
    graded.push({ cell: p.cell_index, state, isCorrect });
  }
  const { codes } = engine.detectFigures(correct, size);
  let total = 0; const wins = [];
  for (const code of codes) { const pt = pointsByCode[code]; if (!pt) continue; total += pt.points; wins.push({ pattern_id: pt.id, code, points: pt.points }); }
  return { correct, codes, total, wins, graded };
}

// Simulation (dry-run) : calcule ce que donnerait la clôture SANS rien écrire.
async function simulateEdition(editionId) {
  const edition = await supabase.from('bingo_editions').select('*').eq('id', editionId).maybeSingle().then((r) => r.data);
  if (!edition) throw new Error('Édition introuvable.');
  const size = GRID[edition.format] || 5;
  const { data: events } = await supabase.from('bingo_events').select('id, official_answer, validation_status').eq('edition_id', editionId);
  const evById = Object.fromEntries((events || []).map((e) => [e.id, e]));
  const withResult = (events || []).filter((e) => e.official_answer).length;
  const pointsByCode = await resolvePatternPoints(editionId);
  const { data: cards } = await supabase.from('bingo_cards').select('*').eq('edition_id', editionId).in('status', ['submitted', 'scored']);

  const ids = [...new Set((cards || []).map((c) => c.user_id))];
  const { data: profs } = ids.length ? await supabase.from('profiles').select('id, display_name').in('id', ids) : { data: [] };
  const pmap = Object.fromEntries((profs || []).map((p) => [p.id, p]));

  const results = [];
  for (const card of cards || []) {
    const { data: picks } = await supabase.from('bingo_card_picks').select('*').eq('card_id', card.id).order('cell_index');
    const g = gradeCard(picks, evById, size, pointsByCode);
    results.push({ cardId: card.id, player: pmap[card.user_id]?.display_name || 'Supporter', points: g.total, figures: g.codes });
  }
  results.sort((a, b) => b.points - a.points);
  return { events: events?.length || 0, withResult, cards: results.length, results };
}

// Clôture + scoring d'une édition. Idempotent : chaque passe = nouvelle
// calculation_version ; le score de la carte = total de CETTE version.
async function settleEdition(editionId) {
  const { data: edition } = await supabase.from('bingo_editions').select('*').eq('id', editionId).maybeSingle();
  if (!edition) throw new Error('Édition introuvable.');
  const size = GRID[edition.format] || 5;

  const { data: events } = await supabase.from('bingo_events').select('id, official_answer, validation_status').eq('edition_id', editionId);
  const evById = Object.fromEntries((events || []).map((e) => [e.id, e]));
  const pointsByCode = await resolvePatternPoints(editionId);

  const { data: cards } = await supabase.from('bingo_cards').select('*').eq('edition_id', editionId).in('status', ['submitted', 'scored']);
  let scored = 0;

  for (const card of cards || []) {
    const { data: picks } = await supabase.from('bingo_card_picks').select('*').eq('card_id', card.id).order('cell_index');
    const correct = new Array(size * size).fill(false);

    // 1. Noter chaque case
    for (const p of picks || []) {
      if (p.state === 'free') { correct[p.cell_index] = true; continue; }
      const ev = p.event_id ? evById[p.event_id] : null;
      let isCorrect = null, state = p.state;
      if (ev && ev.validation_status === 'void') { state = 'void'; isCorrect = null; }
      else if (ev && ev.official_answer) { isCorrect = p.chosen_option === ev.official_answer; state = isCorrect ? 'correct' : 'incorrect'; }
      if (isCorrect === true) correct[p.cell_index] = true;
      await supabase.from('bingo_card_picks').update({ is_correct: isCorrect, state, updated_at: new Date().toISOString() }).eq('id', p.id);
    }

    // 2. Détecter les figures + points
    const { codes } = engine.detectFigures(correct, size);
    const version = (card.calculation_version || 0) + 1;
    let total = 0;
    const wins = [];
    for (const code of codes) {
      const pt = pointsByCode[code];
      if (!pt) continue;
      total += pt.points;
      wins.push({ card_id: card.id, pattern_id: pt.id, points_awarded: pt.points, calculation_version: version });
    }
    if (wins.length) await supabase.from('bingo_card_wins').insert(wins).then(() => {}, () => {});

    await supabase.from('bingo_cards').update({
      status: 'scored', points_total: total, figures_won: codes, calculation_version: version, updated_at: new Date().toISOString(),
    }).eq('id', card.id);

    await audit({ edition_id: editionId, card_id: card.id, action: 'score_card', new_value: { points: total, figures: codes }, calculation_version: version });
    scored++;
  }

  await supabase.from('bingo_editions').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', editionId);
  await rebuildLeaderboard();
  await audit({ edition_id: editionId, action: 'settle_edition', new_value: { cards: scored } });

  return { scored };
}

// Classement all-time : agrège les cartes notées par joueur.
async function rebuildLeaderboard() {
  const { data: cards } = await supabase.from('bingo_cards').select('user_id, points_total, figures_won').eq('status', 'scored');
  const agg = {};
  for (const c of cards || []) {
    const a = (agg[c.user_id] ||= { total_points: 0, bingo_count: 0, cards: 0 });
    a.total_points += Number(c.points_total || 0);
    a.cards += 1;
    if (Array.isArray(c.figures_won) && c.figures_won.includes('FULL_CARD')) a.bingo_count += 1;
  }

  const rows = Object.entries(agg)
    .map(([user_id, a]) => ({ period_type: 'all_time', period_start: null, user_id, total_points: a.total_points, bingo_count: a.bingo_count, correct_predictions: 0, total_predictions: 0 }))
    .sort((x, y) => y.total_points - x.total_points)
    .map((r, i) => ({ ...r, rank: i + 1, updated_at: new Date().toISOString() }));

  if (rows.length) {
    // Remplace le all-time
    await supabase.from('bingo_leaderboards').delete().eq('period_type', 'all_time');
    await supabase.from('bingo_leaderboards').insert(rows).then(() => {}, () => {});
  }
}

async function getLeaderboard(period = 'all_time', limit = 20) {
  const { data } = await supabase.from('bingo_leaderboards').select('*').eq('period_type', period).order('rank', { ascending: true }).limit(limit);
  const ids = [...new Set((data || []).map((r) => r.user_id))];
  const { data: profs } = ids.length ? await supabase.from('profiles').select('id, display_name, avatar_url').in('id', ids) : { data: [] };
  const pmap = Object.fromEntries((profs || []).map((p) => [p.id, p]));
  return (data || []).map((r) => ({
    rank: r.rank, userId: r.user_id, name: pmap[r.user_id]?.display_name || 'Supporter', avatar: pmap[r.user_id]?.avatar_url || null,
    points: r.total_points, bingos: r.bingo_count,
  }));
}

module.exports = { settleEdition, simulateEdition, rebuildLeaderboard, getLeaderboard };
