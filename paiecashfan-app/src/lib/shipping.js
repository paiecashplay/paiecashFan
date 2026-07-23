// Frais de port par zone — MIROIR du backend (checkout.js). Sert uniquement à
// l'AFFICHAGE ; le serveur reste l'autorité sur le montant facturé.
export const SHIPPING_ZONES = {
  france:        { standard: 5,  express: 12 },
  europe:        { standard: 12, express: 22 },
  international: { standard: 20, express: 35 },
};

const EUROPE = new Set([
  'allemagne', 'de', 'belgique', 'be', 'pays-bas', 'nl', 'luxembourg', 'lu', 'espagne', 'es',
  'italie', 'it', 'portugal', 'pt', 'irlande', 'ie', 'autriche', 'at', 'suisse', 'ch',
  'royaume-uni', 'gb', 'uk', 'pologne', 'pl', 'suede', 'suède', 'se', 'danemark', 'dk',
  'finlande', 'fi', 'norvege', 'norvège', 'no', 'grece', 'grèce', 'gr', 'republique tcheque', 'cz',
  'hongrie', 'hu', 'roumanie', 'ro', 'bulgarie', 'bg', 'croatie', 'hr', 'slovaquie', 'sk',
  'slovenie', 'slovénie', 'si', 'lituanie', 'lt', 'lettonie', 'lv', 'estonie', 'ee', 'malte', 'mt', 'chypre', 'cy',
]);

export function shippingZone(country) {
  const c = String(country || '').trim().toLowerCase();
  if (!c || c === 'france' || c === 'fr') return 'france';
  if (EUROPE.has(c)) return 'europe';
  return 'international';
}

export const ZONE_LABEL = { france: 'France', europe: 'Europe', international: 'International' };

// Frais (PCC = € 1:1) pour un pays + méthode.
export function shippingFee(country, method) {
  const zone = shippingZone(country);
  return SHIPPING_ZONES[zone]?.[method] ?? 0;
}
