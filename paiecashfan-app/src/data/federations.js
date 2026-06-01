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
    primaryColor: '#FFCB05',
    accent: '#0033A0',
    flag: '🌎'
  },
  {
    id: 'concacaf',
    code: 'CONCACAF',
    name: 'Confederation North, Central America & Caribbean',
    shortName: 'CONCACAF',
    region: 'Amérique du Nord',
    clubs: 35,
    primaryColor: '#E5252C',
    accent: '#FFFFFF',
    flag: '🌎'
  },
  {
    id: 'afc',
    code: 'AFC',
    name: 'Asian Football Confederation',
    shortName: 'AFC',
    region: 'Asie',
    clubs: 47,
    primaryColor: '#0B2C5F',
    accent: '#E60023',
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
