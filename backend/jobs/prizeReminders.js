// ═══════════════════════════════════════════════════════════════
// jobs/prizeReminders.js — Relances automatiques des gagnants sans adresse.
// La cadence (48 h puis tous les 3 j, plafond 3) est gérée dans runReminderPass,
// donc le job peut tourner souvent sans risque de spam.
// ═══════════════════════════════════════════════════════════════

const prizeClaims = require('../db/prizeClaims');

async function runPrizeReminders() {
  try {
    const r = await prizeClaims.runReminderPass();
    if (r.reminded || r.escalated) {
      console.log(`[PrizeReminders] rappels envoyés : ${r.reminded} | escalades BO : ${r.escalated}`);
    }
  } catch (err) {
    console.error('[PrizeReminders] Job error:', err.message);
  }
}

module.exports = { runPrizeReminders };
