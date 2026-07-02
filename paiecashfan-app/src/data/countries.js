// Pays par confédération (codes ISO 3166-1 alpha-2). Le nom FR est dérivé à
// l'exécution via Intl.DisplayNames, et le drapeau emoji depuis le code — on
// n'a donc qu'à maintenir la correspondance code → confédération.
// Sert au pré-remplissage de la création d'une fédération dans le BO.
const CONFEDERATION_COUNTRIES = {
  CAF: [
    'DZ','AO','BJ','BW','BF','BI','CM','CV','CF','TD','KM','CG','CD','CI','DJ','EG',
    'GQ','ER','SZ','ET','GA','GM','GH','GN','GW','KE','LS','LR','LY','MG','MW','ML',
    'MR','MU','MA','MZ','NA','NE','NG','RW','ST','SN','SC','SL','SO','ZA','SS','SD',
    'TZ','TG','TN','UG','ZM','ZW',
  ],
  UEFA: [
    'AL','AD','AM','AT','AZ','BY','BE','BA','BG','HR','CY','CZ','DK','EE','FO','FI',
    'FR','GE','DE','GI','GR','HU','IS','IE','IL','IT','KZ','XK','LV','LI','LT','LU',
    'MT','MD','MC','ME','NL','MK','NO','PL','PT','RO','RU','SM','RS','SK','SI','ES',
    'SE','CH','TR','UA','GB',
  ],
  CONMEBOL: ['AR','BO','BR','CL','CO','EC','PY','PE','UY','VE'],
  CONCACAF: [
    'US','CA','MX','CR','SV','GT','HN','NI','PA','BZ','CU','DO','HT','JM','TT','BB',
    'GD','LC','VC','KN','DM','AG','BS','AW','CW','SR','GY','AI','BM','KY','MS','VG','TC',
  ],
  AFC: [
    'JP','KR','CN','AU','SA','IR','IQ','QA','AE','KW','BH','OM','YE','JO','LB','SY',
    'PS','IN','PK','BD','LK','NP','BT','MV','AF','UZ','TM','TJ','KG','TH','VN','MY',
    'SG','ID','PH','MM','KH','LA','BN','TL','HK','MO','MN','KP','GU',
  ],
  OFC: ['NZ','FJ','PG','SB','VU','NC','TO','WS','CK','TV'],
};

// Drapeau emoji depuis un code ISO 2-lettres (paires d'indicateurs régionaux).
export function flagEmoji(code) {
  if (!code || code.length !== 2) return '';
  return code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

// Liste plate { code, name (FR), confederation, flag }, triée par nom.
let _cache = null;
export function getCountryOptions() {
  if (_cache) return _cache;
  let dn = null;
  try { dn = new Intl.DisplayNames(['fr'], { type: 'region' }); } catch { /* vieux navigateur */ }

  const seen = new Set();
  const out = [];
  for (const [confederation, codes] of Object.entries(CONFEDERATION_COUNTRIES)) {
    for (const code of codes) {
      if (seen.has(code)) continue;
      seen.add(code);
      let name = code;
      try { name = (dn && dn.of(code)) || code; } catch { name = code; }
      out.push({ code, name, confederation, flag: flagEmoji(code) });
    }
  }
  _cache = out.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  return _cache;
}

// Recherche insensible casse/accents sur nom ou code.
export function searchCountries(query, limit = 8) {
  const q = (query || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  if (!q) return [];
  return getCountryOptions()
    .filter((c) => {
      const n = c.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      return n.includes(q) || c.code.toLowerCase() === q;
    })
    .slice(0, limit);
}
