// ═══════════════════════════════════════════════════════════════
// db/matchSnapshots.js — Cache permanent des matchs TERMINÉS (API-Football).
// On fige le détail d'un match fini (score + événements + stats) pour que les
// fans puissent le revoir toujours, sans re-consommer le quota API.
// Best-effort : si la table n'existe pas encore (migration non jouée), tout
// dégrade proprement (l'API sert directement).
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

// Statuts « match fini » (temps plein, prolongations, tirs au but).
const FINISHED = ['FT', 'AET', 'PEN'];

async function getSnapshot(fixtureId) {
  try {
    const { data, error } = await supabase
      .from('match_snapshots')
      .select('data')
      .eq('fixture_id', String(fixtureId))
      .maybeSingle();
    if (error) return null;
    return data?.data || null;
  } catch { return null; }
}

// Fige un match UNIQUEMENT s'il est terminé (les matchs en cours changent).
// `detail` = { match, events, statistics } BRUT (sans les slugs, dérivés au serve).
async function saveSnapshot(fixtureId, detail) {
  try {
    const m = detail?.match;
    if (!m || !FINISHED.includes(m.statusShort)) return;
    await supabase.from('match_snapshots').upsert({
      fixture_id:   String(fixtureId),
      status:       m.statusShort,
      home_team_id: m.homeTeamId ?? null,
      away_team_id: m.awayTeamId ?? null,
      data:         detail,
    }, { onConflict: 'fixture_id' });
  } catch { /* table absente / erreur → ignoré, l'API sert quand même */ }
}

module.exports = { getSnapshot, saveSnapshot, FINISHED };
