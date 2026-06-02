// ============================================================
// Federations FIFA — données mock pour Phase B
// Sera remplacé en Phase C par fetch('/api/federations') vers le Worker Hono.
// ============================================================

export const federations = [
  {
    id: 'caf',
    code: 'CAF',
    name: 'Confédération Africaine de Football',
    shortName: 'Confédération Africaine',
    region: 'Afrique',
    clubs: 54,
    primaryColor: '#00723D',
    accent: '#FFCD00',
    flag: '🌍'
  },
  {
    id: 'uefa',
    code: 'UEFA',
    name: 'Union Européenne de Football',
    shortName: 'Union Européenne',
    region: 'Europe',
    clubs: 55,
    primaryColor: '#003B82',
    accent: '#FFFFFF',
    flag: '🇪🇺'
  },
  {
    id: 'conmebol',
    code: 'CONMEBOL',
    name: 'Confederación Sudamericana de Fútbol',
    shortName: 'Confederación Sudamericana',
    region: 'Amérique du Sud',
    clubs: 10,
    // Or + Turquoise · Passion
    primaryColor: '#FBBF24',
    accent: '#22D3EE',
    flag: '🌎'
  },
  {
    id: 'concacaf',
    code: 'CONCACAF',
    name: 'Confederation North, Central America & Caribbean',
    shortName: 'CONCACAF',
    region: 'Amérique du Nord',
    clubs: 35,
    // Cyan + Orange · Diversité et énergie
    primaryColor: '#22D3EE',
    accent: '#F97316',
    flag: '🌎'
  },
  {
    id: 'afc',
    code: 'AFC',
    name: 'Asian Football Confederation',
    shortName: 'AFC',
    region: 'Asie',
    clubs: 47,
    // Rouge + Or · Puissance et croissance
    primaryColor: '#DC2626',
    accent: '#FBBF24',
    flag: '🌏'
  },
  {
    id: 'ofc',
    code: 'OFC',
    name: 'Oceania Football Confederation',
    shortName: 'OFC',
    region: 'Océanie',
    clubs: 11,
    primaryColor: '#0072CE',
    accent: '#FFFFFF',
    flag: '🌏'
  }
];

// Map par id pour merger avec les données live de /api/federations.
// L'API Worker Hono renvoie un shape EN minimal (region en anglais, flag
// en code 2 lettres). On enrichit côté frontend avec couleurs + emoji + FR.
export const federationStyleById = Object.fromEntries(
  federations.map((f) => [f.id, {
    primaryColor: f.primaryColor,
    accent: f.accent,
    flag: f.flag,         // emoji local (override le code court de l'API)
    region: f.region,     // FR local (override l'EN de l'API)
    shortName: f.shortName // FR plus court que le fullName de l'API
  }])
);

// Normalize : convertit la shape API Hono → shape FederationCard
// Hono :   { id, name, fullName, flag, region, clubsCount }
// Card :   { id, code, shortName, region, clubs, primaryColor, accent, flag }
export function normalizeFederation(api) {
  const local = federationStyleById[api.id] || {
    primaryColor: '#10b981',
    accent: '#FFFFFF',
    flag: '🌐',
    region: api.region,
    shortName: api.fullName
  };
  return {
    id: api.id,
    code: api.name,
    shortName: local.shortName || api.fullName,
    region: local.region || api.region,
    clubs: api.clubsCount,
    flag: local.flag,
    primaryColor: local.primaryColor,
    accent: local.accent
  };
}
