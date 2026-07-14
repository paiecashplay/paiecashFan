// ═══════════════════════════════════════════════════════════════
// jobs/bingoSync.js — Synchronise le STATUT stocké des éditions Sport Bingo
// avec l'heure serveur, pour rester cohérent avec getEditionAvailability :
//   scheduled → open   dès starts_at atteint (et avant locks_at)
//   open      → locked dès locks_at atteint
// (les transitions live / calculating / completed restent pilotées par l'admin
//  ou le scoring). Même si ce job échoue, getEditionAvailability protège déjà via
//  les dates — ce job ne sert qu'à garder le statut stocké cohérent.
// ═══════════════════════════════════════════════════════════════

const supabase = require('../db/supabase');
const scoring = require('../services/bingoScoring');

async function runBingoSync() {
  const nowIso = new Date().toISOString();
  try {
    // open → locked : clôture atteinte.
    const { data: locked } = await supabase.from('bingo_editions')
      .update({ status: 'locked', updated_at: nowIso })
      .eq('status', 'open').not('locks_at', 'is', null).lte('locks_at', nowIso).select('id');

    // scheduled → open : ouverture atteinte et pas encore clôturée.
    const { data: opened } = await supabase.from('bingo_editions')
      .update({ status: 'open', updated_at: nowIso })
      .eq('status', 'scheduled').not('starts_at', 'is', null).lte('starts_at', nowIso)
      .or(`locks_at.is.null,locks_at.gt.${nowIso}`).select('id');

    const n = (locked?.length || 0) + (opened?.length || 0);
    if (n > 0) console.log(`[CRON] bingoSync: ${opened?.length || 0} ouverte(s), ${locked?.length || 0} clôturée(s)`);
    return { opened: opened?.length || 0, locked: locked?.length || 0 };
  } catch (err) {
    console.error('[CRON] bingoSync failed:', err.message);
    return { opened: 0, locked: 0, error: err.message };
  }
}

// ── Notation / clôture AUTOMATIQUE ──────────────────────────
// Déclencheur : une édition clôturée/en direct dont TOUS les résultats officiels
// (1/N/2) sont saisis est notée automatiquement (→ completed, scoring, classement,
// notifications). L'admin n'a donc qu'à saisir les résultats ; la clôture suit
// toute seule. Idempotent (settleEdition l'est). Le bouton BO « Clôturer » reste
// un override manuel.
async function runBingoAutoSettle() {
  try {
    const { data: eds } = await supabase.from('bingo_editions')
      .select('id, slug').in('status', ['locked', 'live', 'calculating']);
    if (!eds?.length) return { settled: 0 };

    let settled = 0;
    for (const ed of eds) {
      const { data: evs } = await supabase.from('bingo_events').select('official_answer').eq('edition_id', ed.id);
      if (!evs?.length) continue;                                   // pas d'événements → on ignore
      if (!evs.every((e) => e.official_answer)) continue;           // résultats incomplets → on attend
      try { await scoring.settleEdition(ed.id); settled++; console.log(`[CRON] bingoAutoSettle: ${ed.slug} notée automatiquement`); }
      catch (e) { console.error(`[CRON] bingoAutoSettle ${ed.slug}:`, e.message); }
    }
    return { settled };
  } catch (err) {
    console.error('[CRON] bingoAutoSettle failed:', err.message);
    return { settled: 0, error: err.message };
  }
}

module.exports = { runBingoSync, runBingoAutoSettle };
