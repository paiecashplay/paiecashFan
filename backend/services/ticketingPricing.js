// ═══════════════════════════════════════════════════════════════
// services/ticketingPricing.js — Tarification billetterie côté serveur
// ---------------------------------------------------------------
// Recalcule les prix des offres à partir de la source de vérité
// (tenants.metadata.ticketing) OU des offres par défaut générées.
// Doit rester ALIGNÉ avec le front paiecashfan-app/src/utils/ticketingPrices.js
// (mêmes seeds → mêmes prix par défaut). Le checkout ne fait JAMAIS confiance
// au prix envoyé par le client : il ne prend que { offerId, quantity }.
// ═══════════════════════════════════════════════════════════════

function stableNumber(seedText, min, max) {
  const seed = String(seedText)
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return min + (seed % (max - min + 1));
}

function getAutoTicketingPrices(club) {
  const slug = club?.slug || club?.id || club?.name || 'club';
  return {
    ticket: stableNumber(`${slug}-ticket`, 25, 80),
    subscription: stableNumber(`${slug}-subscription`, 180, 650),
  };
}

// Offres par défaut (1 abonnement + 1 billet) quand le club n'a rien saisi en BO.
function buildDefaultOffers(club) {
  const slug = club?.slug || club?.id || 'club';
  const prices = getAutoTicketingPrices(club);
  return [
    {
      id: `${slug}-season-pass`,
      type: 'subscription',
      name: `Abonnement ${club?.name || 'le club'}`,
      price: prices.subscription,
      price_eur: prices.subscription,
    },
    {
      id: `${slug}-single-ticket`,
      type: 'ticket',
      name: `Billet match ${club?.name || 'le club'}`,
      price: prices.ticket,
      price_eur: prices.ticket,
    },
  ];
}

// Renvoie une Map offerId → { id, type, name, price, price_eur } pour un tenant.
// tenant : ligne Supabase (club_name, slug, id, metadata.ticketing).
function resolveOffers(tenant) {
  const club = { slug: tenant?.slug, id: tenant?.id, name: tenant?.name };
  const saved = tenant?.metadata?.ticketing;

  let flat;
  if (saved && (Array.isArray(saved.subscriptions) || Array.isArray(saved.tickets))) {
    flat = [...(saved.subscriptions || []), ...(saved.tickets || [])];
  } else {
    flat = buildDefaultOffers(club);
  }

  const map = new Map();
  for (const o of flat) {
    if (!o?.id) continue;
    const price = Number(o.price) || 0;
    // price_eur peut être vide côté BO → repli sur le prix PCC (1 EUR = 1 PCC).
    const priceEur = o.price_eur === '' || o.price_eur == null ? price : Number(o.price_eur) || 0;
    map.set(o.id, { id: o.id, type: o.type, name: o.name, price, price_eur: priceEur });
  }
  return map;
}

module.exports = { resolveOffers, buildDefaultOffers, getAutoTicketingPrices, stableNumber };
