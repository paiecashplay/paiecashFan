// ═══════════════════════════════════════════════════════════════
// db/bingo.js — PaieCash Sport Bingo (Phase 1) : éditions, matchs,
// événements, cartes (grilles), crédits virtuels. Supabase service-role.
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');
const engine = require('../services/bingoEngine');
const wallet = require('./wallet');

const START_CREDITS = wallet.START_BALANCE;

// ─── Éditions ────────────────────────────────────────────────
async function listEditions({ statuses } = {}) {
  let q = supabase.from('bingo_editions').select('*').order('starts_at', { ascending: true, nullsFirst: false });
  if (statuses?.length) q = q.in('status', statuses);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data || [];
}
async function getEditionBySlug(slug) {
  const { data } = await supabase.from('bingo_editions').select('*').eq('slug', slug).maybeSingle();
  return data || null;
}
async function getEditionById(id) {
  const { data } = await supabase.from('bingo_editions').select('*').eq('id', id).maybeSingle();
  return data || null;
}
async function createEdition(d) {
  const { data, error } = await supabase.from('bingo_editions').insert({
    slug: d.slug, title: d.title, description: d.description || null, cover_url: d.coverUrl || null,
    theme: d.theme || {}, badge: d.badge || null, format: d.format || 'standard', difficulty: d.difficulty || 'standard',
    competitions: d.competitions || [], starts_at: d.startsAt || null, locks_at: d.locksAt || null, ends_at: d.endsAt || null,
    cards_available: d.cardsAvailable != null ? parseInt(d.cardsAvailable, 10) : null,
    cost_credits: parseInt(d.costCredits, 10) || 0, reward_points: parseInt(d.rewardPoints, 10) || 0,
    figures_config: d.figuresConfig || {}, status: d.status || 'draft', created_by: d.createdBy || null,
  }).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}
async function updateEdition(id, updates) {
  const map = { title: 'title', description: 'description', coverUrl: 'cover_url', theme: 'theme', badge: 'badge',
    format: 'format', difficulty: 'difficulty', competitions: 'competitions', startsAt: 'starts_at', locksAt: 'locks_at',
    endsAt: 'ends_at', cardsAvailable: 'cards_available', costCredits: 'cost_credits', rewardPoints: 'reward_points',
    figuresConfig: 'figures_config', status: 'status' };
  const patch = { updated_at: new Date().toISOString() };
  for (const [k, col] of Object.entries(map)) if (updates[k] !== undefined) patch[col] = updates[k];
  const { data, error } = await supabase.from('bingo_editions').update(patch).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}
async function deleteEdition(id) {
  const { error } = await supabase.from('bingo_editions').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

// ─── Matchs ──────────────────────────────────────────────────
async function listMatches(editionId) {
  const { data } = await supabase.from('bingo_matches').select('*').eq('edition_id', editionId).order('display_order');
  return data || [];
}
async function addMatch(editionId, d) {
  const { data, error } = await supabase.from('bingo_matches').insert({
    edition_id: editionId, home: d.home, away: d.away, competition: d.competition || null,
    kickoff_at: d.kickoffAt || null, display_order: d.displayOrder ?? 0,
  }).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}
async function updateMatch(id, updates) {
  const map = { home: 'home', away: 'away', competition: 'competition', kickoffAt: 'kickoff_at', status: 'status',
    minute: 'minute', homeScore: 'home_score', awayScore: 'away_score', displayOrder: 'display_order' };
  const patch = { updated_at: new Date().toISOString() };
  for (const [k, col] of Object.entries(map)) if (updates[k] !== undefined) patch[col] = updates[k];
  const { data, error } = await supabase.from('bingo_matches').update(patch).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}
async function deleteMatch(id) { const { error } = await supabase.from('bingo_matches').delete().eq('id', id); if (error) throw new Error(error.message); return true; }

// ─── Événements ──────────────────────────────────────────────
async function listEvents(editionId) {
  const { data } = await supabase.from('bingo_events').select('*').eq('edition_id', editionId).order('display_order');
  return data || [];
}
async function addEvent(editionId, d) {
  const { data, error } = await supabase.from('bingo_events').insert({
    edition_id: editionId, match_id: d.matchId || null, type: d.type || 'MATCH_RESULT', label: d.label,
    description: d.description || null, options: d.options || ['1', 'N', '2'], display_order: d.displayOrder ?? 0,
  }).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}
async function updateEvent(id, updates) {
  const map = { label: 'label', description: 'description', options: 'options', matchId: 'match_id',
    officialAnswer: 'official_answer', validationStatus: 'validation_status', displayOrder: 'display_order' };
  const patch = { updated_at: new Date().toISOString() };
  for (const [k, col] of Object.entries(map)) if (updates[k] !== undefined) patch[col] = updates[k];
  const { data, error } = await supabase.from('bingo_events').update(patch).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}
async function deleteEvent(id) { const { error } = await supabase.from('bingo_events').delete().eq('id', id); if (error) throw new Error(error.message); return true; }

// ─── Crédits virtuels (délégués au portefeuille + ledger) ────
async function ensureCredits(userId) {
  const w = await wallet.ensureWallet(userId);
  return { balance: w.balance };
}

// ─── Cartes (grilles) ────────────────────────────────────────
async function getCard(editionId, userId) {
  const { data } = await supabase.from('bingo_cards').select('*').eq('edition_id', editionId).eq('user_id', userId).maybeSingle();
  return data || null;
}
async function getPicks(cardId) {
  const { data } = await supabase.from('bingo_card_picks').select('*').eq('card_id', cardId).order('cell_index');
  return data || [];
}

// Toutes les cartes d'un joueur (toutes éditions), enrichies des infos d'édition
// nécessaires à l'affichage « Mes cartes ».
async function listMyCards(userId) {
  const { data: cards } = await supabase.from('bingo_cards')
    .select('id, edition_id, status, points_total, figures_won, format, created_at, submitted_at')
    .eq('user_id', userId).order('created_at', { ascending: false });
  if (!cards?.length) return [];
  const edIds = [...new Set(cards.map((c) => c.edition_id))];
  const { data: eds } = await supabase.from('bingo_editions')
    .select('id, slug, title, cover_url, badge, status, ends_at, locks_at, cost_credits').in('id', edIds);
  const byId = Object.fromEntries((eds || []).map((e) => [e.id, e]));
  return cards.map((c) => ({ ...c, edition: byId[c.edition_id] || null }));
}

// Crée la carte du joueur (débit crédits + génération layout déterministe +
// initialisation des picks). Idempotent : renvoie la carte existante sinon.
async function createCard(edition, userId) {
  const existing = await getCard(edition.id, userId);
  if (existing) return { card: existing, picks: await getPicks(existing.id), created: false };

  const events = await listEvents(edition.id);
  const seed = engine.generateSeed();
  const layout = engine.buildLayout(events.map((e) => e.id), edition.format, seed); // throw si pas assez d'événements

  // Vérif du solde AVANT création (évite une carte orpheline non payée)
  const cost = edition.cost_credits || 0;
  if (cost > 0) {
    const bal = await wallet.getBalance(userId);
    if (bal < cost) { const e = new Error('Crédits insuffisants.'); e.code = 'NO_CREDITS'; e.balance = bal; throw e; }
  }

  const { data: card, error } = await supabase.from('bingo_cards').insert({
    edition_id: edition.id, user_id: userId, seed, format: edition.format, layout, status: 'draft',
  }).select('*').single();
  if (error) throw new Error(error.message);

  // Débit via le ledger (idempotent : idempotency_key = entry:<cardId>)
  if (cost > 0) {
    await wallet.record({ userId, amount: -cost, type: 'bingo_entry', referenceType: 'bingo_card', referenceId: card.id, idempotencyKey: `entry:${card.id}` });
  }

  // Picks initiaux (une ligne par case)
  const picks = layout.map((c) => ({ card_id: card.id, event_id: c.eventId, cell_index: c.cell, state: c.free ? 'free' : 'not_selected', chosen_option: null }));
  await supabase.from('bingo_card_picks').insert(picks);

  return { card, picks: await getPicks(card.id), created: true };
}

// Sauvegarde des pronostics (tant que la carte est 'draft').
async function savePicks(card, selections) {
  if (card.status !== 'draft') { const e = new Error('Grille déjà validée.'); e.code = 'LOCKED'; throw e; }
  for (const s of selections || []) {
    const opt = s.chosenOption;
    await supabase.from('bingo_card_picks').update({
      chosen_option: opt || null, state: opt ? 'selected' : 'not_selected', updated_at: new Date().toISOString(),
    }).eq('card_id', card.id).eq('cell_index', s.cellIndex).neq('state', 'free');
  }
  return getPicks(card.id);
}

// Validation finale : toutes les cases non-FREE doivent être remplies.
async function submitCard(card) {
  if (card.status !== 'draft') { const e = new Error('Grille déjà validée.'); e.code = 'LOCKED'; throw e; }
  const picks = await getPicks(card.id);
  const missing = picks.filter((p) => p.state !== 'free' && !p.chosen_option);
  if (missing.length) { const e = new Error(`${missing.length} case(s) à compléter.`); e.code = 'INCOMPLETE'; throw e; }
  const { data } = await supabase.from('bingo_cards').update({ status: 'submitted', submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', card.id).select('*').single();
  return data;
}

module.exports = {
  START_CREDITS,
  listEditions, getEditionBySlug, getEditionById, createEdition, updateEdition, deleteEdition,
  listMatches, addMatch, updateMatch, deleteMatch,
  listEvents, addEvent, updateEvent, deleteEvent,
  ensureCredits,
  getCard, getPicks, listMyCards, createCard, savePicks, submitCard,
};
