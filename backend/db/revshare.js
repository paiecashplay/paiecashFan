// ═══════════════════════════════════════════════════════════════
// db/revshare.js — File de reversement des commissions plateforme (Option A).
// Le PaieCash Store encaisse la vente en plein, puis reverse la commission au
// club en PCC pur. Ce module gère la file `revshare_pending` + l'idempotence
// des webhooks (`webhook_events`). Accès service-role (RLS deny-all).
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

// Idempotence webhook : renvoie true si l'event est NOUVEAU (à traiter), false
// s'il a déjà été vu (retry PaieCashCoin → ne pas re-traiter).
async function markWebhookSeen(eventId, type, payload) {
  const { error } = await supabase
    .from('webhook_events')
    .insert({ id: eventId, type, payload });
  if (error) {
    if (error.code === '23505') return false; // déjà vu (clé primaire)
    throw new Error(`markWebhookSeen: ${error.message}`);
  }
  return true;
}

// Enfile un reversement (idempotent sur idempotency_key). Renvoie la ligne
// (nouvelle ou existante). Ne crée pas de doublon si déjà enfilé.
async function enqueue({ orderId, commissionId, clubSlug, clubTenantId, amountEur, saleReference, idempotencyKey }) {
  const { data, error } = await supabase
    .from('revshare_pending')
    .upsert({
      order_id: orderId || null,
      commission_id: commissionId || null,
      club_slug: clubSlug,
      club_tenant_id: clubTenantId || null,
      amount_eur: amountEur,
      sale_reference: saleReference || null,
      idempotency_key: idempotencyKey,
      status: 'pending',
    }, { onConflict: 'idempotency_key', ignoreDuplicates: true })
    .select()
    .maybeSingle();
  if (error) throw new Error(`enqueueRevshare: ${error.message}`);
  if (data) return data;
  // ignoreDuplicates → pas de ligne renvoyée si conflit : on relit l'existante.
  const { data: existing } = await supabase
    .from('revshare_pending').select('*').eq('idempotency_key', idempotencyKey).maybeSingle();
  return existing || null;
}

// Verrou léger : passe une ligne 'pending'/'failed' en 'processing' (si personne
// ne l'a prise). Renvoie true si on a le lock.
async function claim(id) {
  const { data, error } = await supabase
    .from('revshare_pending')
    .update({ status: 'processing' })
    .eq('id', id)
    .in('status', ['pending', 'failed'])
    .select('id')
    .maybeSingle();
  if (error) throw new Error(`claimRevshare: ${error.message}`);
  return !!data;
}

async function markDone(id) {
  await supabase.from('revshare_pending')
    .update({ status: 'done', processed_at: new Date().toISOString(), last_error: null })
    .eq('id', id);
}

async function markFailed(id, message) {
  const { data: cur } = await supabase.from('revshare_pending').select('attempts').eq('id', id).maybeSingle();
  await supabase.from('revshare_pending')
    .update({ status: 'failed', attempts: (cur?.attempts || 0) + 1, last_error: String(message || '').slice(0, 500) })
    .eq('id', id);
}

// Lignes à (re)tenter : pending, ou failed sous le plafond de tentatives.
async function listRetryable({ maxAttempts = 6, limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('revshare_pending')
    .select('*')
    .in('status', ['pending', 'failed'])
    .lt('attempts', maxAttempts)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw new Error(`listRetryable: ${error.message}`);
  return data || [];
}

module.exports = { markWebhookSeen, enqueue, claim, markDone, markFailed, listRetryable };
