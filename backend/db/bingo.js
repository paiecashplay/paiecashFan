// ═══════════════════════════════════════════════════════════════
// db/bingo.js — PaieCash Sport Bingo (Phase 1) : éditions, matchs,
// événements, cartes (grilles), crédits virtuels. Supabase service-role.
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');
const engine = require('../services/bingoEngine');
const wallet = require('./wallet');
const { getEditionAvailability } = require('../services/bingoAvailability');

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
  if (error) {
    if (error.code === '23505') { const e = new Error(`Le slug « ${d.slug} » est déjà utilisé. Choisis-en un autre.`); e.code = 'DUPLICATE_SLUG'; throw e; }
    throw new Error(error.message);
  }
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
  const row = {
    edition_id: editionId, home: d.home, away: d.away, competition: d.competition || null,
    kickoff_at: d.kickoffAt || null, display_order: d.displayOrder ?? 0,
    home_logo: d.homeLogo || null, away_logo: d.awayLogo || null,
  };
  // group_label = colonne récente (migration bingo-match-group.sql) : on ne
  // l'inclut que si renseignée, pour ne pas casser l'insert avant migration.
  if (d.groupLabel) row.group_label = d.groupLabel;
  const { data, error } = await supabase.from('bingo_matches').insert(row).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}
async function updateMatch(id, updates) {
  const map = { home: 'home', away: 'away', competition: 'competition', kickoffAt: 'kickoff_at', status: 'status',
    minute: 'minute', homeScore: 'home_score', awayScore: 'away_score', displayOrder: 'display_order',
    homeLogo: 'home_logo', awayLogo: 'away_logo', groupLabel: 'group_label' };
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

// Nombre de cartes (joueurs) par édition — pour l'affichage front.
async function countCardsByEdition(editionIds) {
  if (!editionIds?.length) return {};
  const { data } = await supabase.from('bingo_cards').select('edition_id').in('edition_id', editionIds);
  const map = {};
  (data || []).forEach((c) => { map[c.edition_id] = (map[c.edition_id] || 0) + 1; });
  return map;
}

// Toutes les cartes d'une édition, enrichies du profil joueur (BO).
async function listEditionCards(editionId) {
  const { data: cards } = await supabase.from('bingo_cards')
    .select('id, user_id, status, points_total, figures_won, created_at, submitted_at, calculation_version')
    .eq('edition_id', editionId).order('points_total', { ascending: false, nullsFirst: false });
  if (!cards?.length) return [];
  const ids = [...new Set(cards.map((c) => c.user_id))];
  const { data: profs } = await supabase.from('profiles').select('id, display_name, avatar_url').in('id', ids);
  const pmap = Object.fromEntries((profs || []).map((p) => [p.id, p]));
  return cards.map((c) => ({ ...c, player: pmap[c.user_id]?.display_name || 'Supporter', avatar: pmap[c.user_id]?.avatar_url || null }));
}

// Éditions terminées (page Résultats / archives) + stats.
async function listResults(limit = 30) {
  const { data: eds } = await supabase.from('bingo_editions')
    .select('id, slug, title, cover_url, badge, theme, format, difficulty, reward_points, ends_at, status')
    .eq('status', 'completed').order('ends_at', { ascending: false, nullsFirst: false }).limit(limit);
  if (!eds?.length) return [];
  const ids = eds.map((e) => e.id);
  const { data: cards } = await supabase.from('bingo_cards').select('edition_id, user_id, points_total').in('edition_id', ids).eq('status', 'scored');
  const byEd = {};
  (cards || []).forEach((c) => { (byEd[c.edition_id] ||= []).push(c); });
  // profils des meilleurs
  const topUserIds = new Set();
  Object.values(byEd).forEach((list) => list.slice().sort((a, b) => b.points_total - a.points_total).slice(0, 3).forEach((c) => topUserIds.add(c.user_id)));
  const { data: profs } = topUserIds.size ? await supabase.from('profiles').select('id, display_name, avatar_url').in('id', [...topUserIds]) : { data: [] };
  const pmap = Object.fromEntries((profs || []).map((p) => [p.id, p]));

  return eds.map((e) => {
    const list = (byEd[e.id] || []).slice().sort((a, b) => b.points_total - a.points_total);
    return {
      ...e,
      participants: list.length,
      maxPoints: list.length ? list[0].points_total : 0,
      top: list.slice(0, 3).map((c, i) => ({ rank: i + 1, points: c.points_total, name: pmap[c.user_id]?.display_name || 'Supporter', avatar: pmap[c.user_id]?.avatar_url || null })),
    };
  });
}

// Prévisualise une grille type (sans créer de carte) : layout + libellés.
async function previewLayout(editionId) {
  const edition = await getEditionById(editionId);
  if (!edition) throw new Error('Édition introuvable.');
  const events = await listEvents(editionId);
  const seed = engine.generateSeed();
  const layout = engine.buildLayout(events.map((e) => e.id), edition.format, seed); // throw NOT_ENOUGH_EVENTS
  const evById = Object.fromEntries(events.map((e) => [e.id, e]));
  return {
    format: edition.format,
    cells: layout.map((c) => ({ cell: c.cell, free: c.free, label: c.eventId ? (evById[c.eventId]?.label || '—') : null })),
  };
}

// ─── Match + événement en une fois (UX admin unifiée) ────────
// Crée le match ET son événement MATCH_RESULT (1/N/2). Si `officialAnswer`
// est fourni (1/N/2), le résultat officiel est renseigné directement.
async function addMatchWithEvent(editionId, d, order) {
  const match = await addMatch(editionId, {
    home: d.home, away: d.away, competition: d.competition || null, kickoffAt: d.kickoffAt || null, displayOrder: order,
    homeLogo: d.homeLogo || null, awayLogo: d.awayLogo || null, groupLabel: d.groupLabel || null,
  });
  const label = (d.label || '').trim() || `${d.home} - ${d.away}`;
  const event = await addEvent(editionId, {
    matchId: match.id, type: 'MATCH_RESULT', label, options: ['1', 'N', '2'], displayOrder: order,
  });
  const ans = String(d.officialAnswer || '').toUpperCase();
  if (['1', 'N', '2'].includes(ans)) await updateEvent(event.id, { officialAnswer: ans, validationStatus: 'settled' });
  return { match, event };
}

// Import en masse : chaque entrée = { home, away, competition?, officialAnswer? }.
async function bulkAddMatches(editionId, rows) {
  const start = (await listMatches(editionId)).length;
  let created = 0;
  for (const r of rows || []) {
    if (!r?.home?.trim() || !r?.away?.trim()) continue;
    await addMatchWithEvent(editionId, r, start + created);
    created++;
  }
  return { created };
}

// Supprime un événement et, s'il est lié à un match, le match associé.
async function deleteEventWithMatch(eventId) {
  const { data: ev } = await supabase.from('bingo_events').select('match_id').eq('id', eventId).maybeSingle();
  await deleteEvent(eventId);
  if (ev?.match_id) await supabase.from('bingo_matches').delete().eq('id', ev.match_id);
  return true;
}

// ─── Crédits virtuels (délégués au portefeuille + ledger) ────
async function ensureCredits(userId) {
  const w = await wallet.ensureWallet(userId);
  return { balance: w.balance };
}

// ─── Garde serveur : participation autorisée ? ───────────────
// Vérifie auth + existence + état PLAYABLE (statut open + dates serveur) +
// quota de cartes + solde. Renvoie { allowed, reason, edition?, balance? }.
// L'heure de référence est TOUJOURS l'heure serveur (jamais le navigateur).
async function canParticipateInEdition(userId, editionId, now = new Date()) {
  if (!userId) return { allowed: false, reason: 'NOT_AUTHENTICATED' };
  const edition = await getEditionById(editionId);
  if (!edition) return { allowed: false, reason: 'NOT_FOUND' };
  if (edition.status === 'cancelled') return { allowed: false, reason: 'EDITION_CANCELLED' };

  const availability = getEditionAvailability(edition, now);
  if (availability === 'upcoming') return { allowed: false, reason: 'NOT_STARTED', edition };
  if (availability === 'locked') return { allowed: false, reason: 'REGISTRATION_CLOSED', edition };
  if (availability !== 'playable') return { allowed: false, reason: 'NOT_OPEN', edition };

  // Quota de cartes (si défini).
  if (edition.cards_available != null) {
    const counts = await countCardsByEdition([editionId]);
    if ((counts[editionId] || 0) >= edition.cards_available) return { allowed: false, reason: 'MAX_CARDS_REACHED', edition };
  }
  // Solde (si coût > 0) — ignoré si le joueur a déjà une carte (pas de re-débit).
  const cost = edition.cost_credits || 0;
  if (cost > 0) {
    const existing = await getCard(editionId, userId);
    if (!existing) {
      const balance = await wallet.getBalance(userId);
      if (balance < cost) return { allowed: false, reason: 'INSUFFICIENT_CREDITS', edition, balance };
    }
  }
  return { allowed: true, edition, availability };
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

  // Rang du joueur dans chaque édition où il a une carte notée.
  const scoredEdIds = [...new Set(cards.filter((c) => c.status === 'scored').map((c) => c.edition_id))];
  const pointsByEd = {};
  if (scoredEdIds.length) {
    const { data: allScored } = await supabase.from('bingo_cards')
      .select('edition_id, points_total').eq('status', 'scored').in('edition_id', scoredEdIds);
    (allScored || []).forEach((c) => { (pointsByEd[c.edition_id] ||= []).push(Number(c.points_total || 0)); });
  }

  return cards.map((c) => {
    let rank = null, participants = null;
    if (c.status === 'scored' && pointsByEd[c.edition_id]) {
      const pts = pointsByEd[c.edition_id];
      const mine = Number(c.points_total || 0);
      rank = 1 + pts.filter((p) => p > mine).length;
      participants = pts.length;
    }
    return { ...c, edition: byId[c.edition_id] || null, rank, participants };
  });
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
  addMatchWithEvent, bulkAddMatches, deleteEventWithMatch,
  countCardsByEdition, listEditionCards, previewLayout, listResults,
  canParticipateInEdition,
  ensureCredits,
  getCard, getPicks, listMyCards, createCard, savePicks, submitCard,
};
