// ═══════════════════════════════════════════════════════════════
// services/revshareProcessor.js — Exécute les reversements en attente.
// Débite le PaieCash Store et crédite le club (PCC pur, instantané), puis
// marque la commission `paid`. Idempotent (idempotency_key + verrou 'processing').
// Appelé (a) juste après une vente pcc_full, (b) par le webhook payment.completed,
// (c) par un cron toutes les 5 min pour rattraper les échecs.
// ═══════════════════════════════════════════════════════════════

const supabase = require('./../db/supabase');
const revshareDb = require('./../db/revshare');
const pcc = require('./paiecashcoin');

// Traite UNE ligne revshare_pending. Renvoie 'done' | 'failed' | 'skipped'.
async function processRow(row) {
  if (!row || row.status === 'done') return 'skipped';
  if (!pcc.isStoreConfigured()) return 'skipped'; // clé store pas encore configurée
  if (!(Number(row.amount_eur) > 0) || !row.club_slug) { await revshareDb.markDone(row.id); return 'skipped'; }

  // Verrou : évite qu'un cron et le flux synchrone traitent la même ligne.
  const got = await revshareDb.claim(row.id);
  if (!got) return 'skipped';

  try {
    await pcc.payoutToClub({
      clubSlug: row.club_slug,
      amountEur: Number(row.amount_eur),
      description: `Commission ${row.sale_reference || row.order_id || ''}`.trim(),
      idempotencyKey: row.idempotency_key,
    });
    await revshareDb.markDone(row.id);
    if (row.commission_id) {
      await supabase.from('platform_commissions').update({ status: 'paid' }).eq('id', row.commission_id);
    }
    return 'done';
  } catch (err) {
    await revshareDb.markFailed(row.id, err.message);
    return 'failed';
  }
}

// Rattrape toutes les lignes en attente / en échec (cron).
async function processPending() {
  let rows;
  try { rows = await revshareDb.listRetryable(); }
  catch (e) { console.error('[REVSHARE] listRetryable:', e.message); return; }
  if (!rows.length) return;
  let done = 0, failed = 0;
  for (const row of rows) {
    const r = await processRow(row);
    if (r === 'done') done += 1; else if (r === 'failed') failed += 1;
  }
  if (done || failed) console.log(`[REVSHARE] traité: ${done} reversé(s), ${failed} échec(s)`);
}

module.exports = { processRow, processPending };
