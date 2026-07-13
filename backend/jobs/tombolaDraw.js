// ═══════════════════════════════════════════════════════════════
// jobs/tombolaDraw.js — Tirage automatique des tombolas arrivées à échéance.
// Balaie les campagnes 'active' dont ends_at est dépassé et tire un gagnant
// (ou passe en 'closed' si aucun ticket). Idempotent (drawWinner garde-fou).
// ═══════════════════════════════════════════════════════════════

const tombola = require('../db/tombola');

async function runTombolaDraws() {
  try {
    const due = await tombola.campaignsDueForDraw();
    if (!due.length) return;
    for (const c of due) {
      try {
        const r = await tombola.drawWinner(c.id);
        if (r.drawn) console.log(`[TombolaDraw] "${c.title}" → gagnant ${r.winnerUserId}`);
        else console.log(`[TombolaDraw] "${c.title}" → ${r.reason}`);
      } catch (e) {
        console.error(`[TombolaDraw] échec pour ${c.id}:`, e.message);
      }
    }
  } catch (err) {
    console.error('[TombolaDraw] Job error:', err.message);
  }
}

module.exports = { runTombolaDraws };
