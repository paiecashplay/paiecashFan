// ═══════════════════════════════════════════════════════════════
// routes/v2/webhooks/paiecashcoin.js — Webhooks entrants PaieCashCoin.
// Événement `payment.completed` : quand une vente de produit plateforme
// (créditée au PaieCash Store) est confirmée, on déclenche le reversement
// de la commission au club (revshare). Sécurisé par HMAC-SHA256.
//
// ⚠️ Ce routeur DOIT être monté AVANT express.json() avec capture du body
//    BRUT (req.rawBody) — la vérif de signature porte sur les octets exacts.
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { createHmac, timingSafeEqual } = require('crypto');
const supabase = require('../../../db/supabase');
const revshareDb = require('../../../db/revshare');
const revshareProcessor = require('../../../services/revshareProcessor');

const router = express.Router();

const WEBHOOK_SECRET = process.env.PCC_WEBHOOK_SECRET || '';
const STORE_SLUG = process.env.PAIECASH_STORE_SLUG || 'paiecashstore';
const REF_PREFIX = 'paiecashfan:';

// Vérifie X-PCC-Signature: t=<unix>,v1=<hmac hex>  sur `<t>.<rawBody>`.
function verifySignature(rawBody, header) {
  if (!WEBHOOK_SECRET || !header) return false;
  const parts = Object.fromEntries(String(header).split(',').map((kv) => kv.split('=').map((s) => s.trim())));
  const t = Number(parts.t);
  const v1 = String(parts.v1 || '');
  if (!t || !v1) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - t) > 300) return false; // anti-rejeu (>5 min)
  const expected = createHmac('sha256', WEBHOOK_SECRET).update(`${t}.${rawBody}`).digest('hex');
  let a, b;
  try { a = Buffer.from(v1, 'hex'); b = Buffer.from(expected, 'hex'); } catch { return false; }
  return a.length === b.length && timingSafeEqual(a, b);
}

// POST /api/v2/webhooks/paiecashcoin
router.post('/', async (req, res) => {
  // rawBody est posé par le middleware de capture (server.js), avant express.json.
  const raw = req.rawBody != null ? req.rawBody : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}));

  if (!verifySignature(raw, req.header('X-PCC-Signature'))) {
    return res.status(401).send('bad signature');
  }

  let event;
  try { event = typeof req.body === 'object' && req.body ? req.body : JSON.parse(raw); } catch { return res.status(400).send('bad json'); }
  if (!event?.id) return res.status(400).send('missing id');

  // Idempotence : on ne traite chaque event qu'une fois (retry PaieCashCoin).
  try {
    const fresh = await revshareDb.markWebhookSeen(event.id, event.type, event);
    if (!fresh) return res.status(200).send('ok (dup)');
  } catch (e) {
    console.error('[PCC WEBHOOK] markWebhookSeen:', e.message);
    return res.status(200).send('ok'); // ne pas boucler en retry sur un souci DB
  }

  // Toujours répondre 200 (traitement idempotent) ; on log les soucis métier.
  try {
    if (event.type === 'payment.completed') {
      await handlePaymentCompleted(event.data || {});
    }
  } catch (e) {
    console.error('[PCC WEBHOOK] handlePaymentCompleted:', e.message);
  }
  return res.status(200).send('ok');
});

async function handlePaymentCompleted(data) {
  const mref = String(data.merchantRef || '');
  // Filtre défensif : ne traiter que nos événements.
  if (!mref.startsWith(REF_PREFIX)) return;

  // Vente de produit plateforme = créditée au PaieCash Store.
  const isPlatformSale = data.recipientSlug === STORE_SLUG || mref.startsWith(`${REF_PREFIX}${STORE_SLUG}:`);
  if (!isPlatformSale) return; // vente club normale → rien à reverser

  // merchantRef = paiecashfan:<store>:<orderId>
  const orderId = mref.split(':')[2] || null;
  if (!orderId) return;

  const { data: commission } = await supabase
    .from('platform_commissions').select('*').eq('order_id', orderId).maybeSingle();
  if (!commission || commission.status === 'paid') return; // déjà reversé / rien à faire

  const { data: club } = await supabase
    .from('tenants').select('slug').eq('id', commission.club_tenant_id).maybeSingle();
  if (!club?.slug) return;

  const row = await revshareDb.enqueue({
    orderId,
    commissionId: commission.id,
    clubSlug: club.slug,                       // = public_slug PCC du club (hypothèse : = notre slug)
    clubTenantId: commission.club_tenant_id,
    amountEur: Number(commission.commission_eur),
    saleReference: data.reference || null,
    idempotencyKey: `revshare-${orderId}`,
  });
  if (row) await revshareProcessor.processRow(row);
}

module.exports = router;
