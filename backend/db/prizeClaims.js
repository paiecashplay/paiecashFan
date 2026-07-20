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

module.exports = { createClaim, listMyClaims, submitAddress, shape, SHIP_FIELDS };
