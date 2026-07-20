// ═══════════════════════════════════════════════════════════════
// db/prizeClaims.js — Gains & remise des lots (tombola / loto / bingo)
// Table : prize_claims (voir migrations/prize-claims.sql).
// Accès service-role uniquement (RLS deny-all).
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');
const { createNotification } = require('./notifications');

const SHIP_FIELDS = ['ship_name', 'ship_phone', 'ship_address1', 'ship_address2', 'ship_postal_code', 'ship_city', 'ship_country'];

// Crée le claim d'un gain. Idempotent : si le (jeu, réf, gagnant) existe déjà,
// on renvoie l'existant (le tirage peut être rejoué sans doublon).
async function createClaim({ gameType, gameRef, tenantId = null, winnerUserId, prizeLabel = null, prizeType = 'physical' }) {
  if (!gameType || !gameRef || !winnerUserId) throw new Error('createClaim: paramètres manquants.');

  const { data: existing } = await supabase.from('prize_claims')
    .select('*').eq('game_type', gameType).eq('game_ref', gameRef).eq('winner_user_id', winnerUserId).maybeSingle();
  if (existing) return existing;

  // Un lot digital n'a pas d'expédition → directement « delivered ».
  const status = prizeType === 'digital' ? 'delivered' : 'pending_address';
  const { data, error } = await supabase.from('prize_claims').insert({
    game_type: gameType, game_ref: gameRef, tenant_id: tenantId,
    winner_user_id: winnerUserId, prize_label: prizeLabel, prize_type: prizeType,
    status, delivered_at: prizeType === 'digital' ? new Date().toISOString() : null,
  }).select('*').single();
  if (error) {
    // Course possible sur l'index unique → on relit.
    const { data: again } = await supabase.from('prize_claims')
      .select('*').eq('game_type', gameType).eq('game_ref', gameRef).eq('winner_user_id', winnerUserId).maybeSingle();
    if (again) return again;
    throw new Error(`createClaim: ${error.message}`);
  }
  return data;
}

// Vue publique d'un claim (pour le fan / l'admin) — enrichie du club.
async function shape(c) {
  if (!c) return null;
  let clubName = null;
  if (c.tenant_id) {
    const { data } = await supabase.from('tenants').select('name').eq('id', c.tenant_id).maybeSingle();
    clubName = data?.name || null;
  }
  return {
    id: c.id,
    gameType: c.game_type,
    gameRef: c.game_ref,
    tenantId: c.tenant_id,
    clubName,
    prizeLabel: c.prize_label,
    prizeType: c.prize_type,
    status: c.status,
    shipping: {
      name: c.ship_name, phone: c.ship_phone, address1: c.ship_address1, address2: c.ship_address2,
      postalCode: c.ship_postal_code, city: c.ship_city, country: c.ship_country,
    },
    carrier: c.carrier,
    trackingNumber: c.tracking_number,
    trackingUrl: c.tracking_url,
    wonAt: c.won_at,
    addressFilledAt: c.address_filled_at,
    shippedAt: c.shipped_at,
    deliveredAt: c.delivered_at,
  };
}

// Gains d'un fan (le plus récent d'abord).
async function listMyClaims(userId) {
  const { data, error } = await supabase.from('prize_claims')
    .select('*').eq('winner_user_id', userId).order('won_at', { ascending: false });
  if (error) throw new Error(`listMyClaims: ${error.message}`);
  return Promise.all((data || []).map(shape));
}

// Le fan renseigne / met à jour son adresse de livraison. Autorisé tant que le
// lot n'est pas expédié. Le 1er remplissage fait passer pending_address → preparing.
async function submitAddress(claimId, userId, address = {}) {
  const { data: c } = await supabase.from('prize_claims')
    .select('*').eq('id', claimId).eq('winner_user_id', userId).maybeSingle();
  if (!c) { const e = new Error('Gain introuvable.'); e.code = 'NOT_FOUND'; throw e; }
  if (c.prize_type === 'digital') { const e = new Error('Ce lot ne nécessite pas de livraison.'); e.code = 'DIGITAL'; throw e; }
  if (['shipped', 'delivered', 'cancelled'].includes(c.status)) {
    const e = new Error('Ce lot est déjà en cours d\'expédition, l\'adresse ne peut plus être modifiée.'); e.code = 'LOCKED'; throw e;
  }
  if (!address.name || !address.address1 || !address.postalCode || !address.city) {
    const e = new Error('Nom, adresse, code postal et ville sont obligatoires.'); e.code = 'BAD_INPUT'; throw e;
  }

  const updates = {
    ship_name: address.name, ship_phone: address.phone || null,
    ship_address1: address.address1, ship_address2: address.address2 || null,
    ship_postal_code: address.postalCode, ship_city: address.city, ship_country: address.country || 'France',
    status: 'preparing', address_filled_at: c.address_filled_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('prize_claims').update(updates).eq('id', claimId).select('*').single();
  if (error) throw new Error(`submitAddress: ${error.message}`);
  return shape(data);
}

// ── Côté BO (club / super admin) ─────────────────────────────

// Vue admin d'un claim : + nom du gagnant + drapeau adresse renseignée.
async function adminShape(c) {
  const base = await shape(c);
  const { data } = await supabase.from('profiles').select('display_name').eq('id', c.winner_user_id).maybeSingle();
  return { ...base, winnerName: data?.display_name || 'Supporter', hasAddress: !!c.ship_address1 };
}

// Liste des gains à traiter. `tenantId` :
//   · undefined → tout (super admin)
//   · <uuid>    → gains de ce club (club admin)
//   · null      → gains « plateforme » (sans club) — réservé au super admin
async function listClaims({ tenantId = undefined, status = null, gameType = null } = {}) {
  let q = supabase.from('prize_claims').select('*').order('won_at', { ascending: false });
  if (tenantId !== undefined) q = tenantId === null ? q.is('tenant_id', null) : q.eq('tenant_id', tenantId);
  if (status) q = q.eq('status', status);
  if (gameType) q = q.eq('game_type', gameType);
  const { data, error } = await q;
  if (error) throw new Error(`listClaims: ${error.message}`);
  return Promise.all((data || []).map(adminShape));
}

async function getClaimRaw(id) {
  const { data } = await supabase.from('prize_claims').select('*').eq('id', id).maybeSingle();
  return data || null;
}

const FULFILLMENT_STATUSES = ['pending_address', 'preparing', 'shipped', 'delivered', 'cancelled'];

// Met à jour la remise d'un lot (statut, transporteur, n° de suivi, notes) et
// notifie le gagnant aux étapes clés (expédié / livré).
async function updateFulfillment(claimId, { status, carrier, trackingNumber, trackingUrl, notes } = {}) {
  const c = await getClaimRaw(claimId);
  if (!c) { const e = new Error('Gain introuvable.'); e.code = 'NOT_FOUND'; throw e; }

  const updates = { updated_at: new Date().toISOString() };
  if (status !== undefined) {
    if (!FULFILLMENT_STATUSES.includes(status)) { const e = new Error('Statut invalide.'); e.code = 'BAD_INPUT'; throw e; }
    // Un lot physique ne peut pas être expédié sans adresse.
    if (status === 'shipped' && c.prize_type === 'physical' && !c.ship_address1) {
      const e = new Error("Impossible d'expédier : l'adresse du gagnant n'est pas renseignée."); e.code = 'NO_ADDRESS'; throw e;
    }
    updates.status = status;
    if (status === 'shipped' && !c.shipped_at) updates.shipped_at = new Date().toISOString();
    if (status === 'delivered' && !c.delivered_at) updates.delivered_at = new Date().toISOString();
  }
  if (carrier !== undefined) updates.carrier = carrier || null;
  if (trackingNumber !== undefined) updates.tracking_number = trackingNumber || null;
  if (trackingUrl !== undefined) updates.tracking_url = trackingUrl || null;
  if (notes !== undefined) updates.notes = notes || null;

  const { data, error } = await supabase.from('prize_claims').update(updates).eq('id', claimId).select('*').single();
  if (error) throw new Error(`updateFulfillment: ${error.message}`);

  // Notifications aux transitions importantes (best-effort).
  const lot = c.prize_label || 'Ton lot';
  if (status === 'shipped') {
    await createNotification({
      user_id: c.winner_user_id, type: 'prize_shipped', title: '🚚 Ton lot est expédié !',
      message: `« ${lot} » a été expédié${carrier ? ` via ${carrier}` : ''}${trackingNumber ? ` — suivi : ${trackingNumber}` : ''}.`,
      metadata: { link: '/mon-compte?tab=prizes' },
    }).catch(() => {});
  } else if (status === 'delivered') {
    await createNotification({
      user_id: c.winner_user_id, type: 'prize_delivered', title: '✅ Lot livré',
      message: `« ${lot} » a été marqué comme livré. Profite bien ! 🎉`,
      metadata: { link: '/mon-compte?tab=prizes' },
    }).catch(() => {});
  }
  return adminShape(data);
}

// Relance le gagnant qui n'a pas encore renseigné son adresse (notification).
async function remindAddress(claimId) {
  const c = await getClaimRaw(claimId);
  if (!c) { const e = new Error('Gain introuvable.'); e.code = 'NOT_FOUND'; throw e; }
  if (c.status !== 'pending_address') { const e = new Error('Ce gain a déjà une adresse.'); e.code = 'HAS_ADDRESS'; throw e; }
  await createNotification({
    user_id: c.winner_user_id, type: 'prize_reminder', title: '📮 Renseigne ton adresse',
    message: `Pour recevoir « ${c.prize_label || 'ton lot'} », renseigne ton adresse postale dans « Mes gains ».`,
    metadata: { link: '/mon-compte?tab=prizes' },
  });
  return { reminded: true };
}

module.exports = {
  createClaim, listMyClaims, submitAddress, shape, SHIP_FIELDS,
  listClaims, getClaimRaw, updateFulfillment, remindAddress, FULFILLMENT_STATUSES,
};
