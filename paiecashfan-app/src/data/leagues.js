// ============================================================
// Ligues & clubs — données mock pour Phase B
// Logos via crests.football-data.org (gratuit, sans clé).
// Couleurs primaires des clubs pour les accents UI.
// ============================================================

const crest = (id) => `https://crests.football-data.org/${id}.png`;

export const categories = [
  { id: 'fr',         label: 'Football France',     icon: '⚽', flag: '🇫🇷' },
  { id: 'others',     label: 'Autres sports',       icon: '🏆', flag: '🌟' },
  { id: 'eu',         label: 'Football Européen',   icon: '🌍', flag: '🇪🇺' },
  { id: 'federations',label: 'Fédérations',         icon: '🏟', flag: '🌐' },
  { id: 'events',     label: 'Évènements',          icon: '🎫', flag: '⭐' }
];

// Catégorie Football France — Ligue 1 2025-2026
export const ligue1 = {
  id: 'ligue-1',
  name: 'Ligue 1',
  country: 'France',
  flag: '🇫🇷',
  clubs: [
    { id: 'om',     name: 'Olympique de Marseille', city: 'Marseille',     logo: crest(516),  primaryColor: '#0099D8' },
    { id: 'psg',    name: 'Paris Saint-Germain',    city: 'Paris',         logo: crest(524),  primaryColor: '#004170' },
    { id: 'paris-fc',   name: 'Paris FC',            city: 'Paris',         logo: '/images/logos/clubs-france/logo-paris-fc.png',  primaryColor: '#0033A0' }, //Trouver le logo du Paris FC sur football-data.org
    { id: 'le-havre-ac', name: 'Le Havre AC',          city: 'Le Havre',      logo: '/images/logos/clubs-france/logo-le-havre-ac.png',  primaryColor: '#00A3E0' }, //Trouver le logo du Paris FC sur football-data.org
    { id: 'lyon',   name: 'Olympique Lyonnais',     city: 'Lyon',          logo: crest(523),  primaryColor: '#003B82' },
    { id: 'monaco', name: 'AS Monaco',              city: 'Monaco',        logo: crest(548),  primaryColor: '#E60026' },
    { id: 'lille',  name: 'LOSC Lille',             city: 'Lille',         logo: crest(521),  primaryColor: '#C8102E' },
    { id: 'nice',   name: 'OGC Nice',               city: 'Nice',          logo: crest(522),  primaryColor: '#D71920' },
    { id: 'rennes', name: 'Stade Rennais',          city: 'Rennes',        logo: crest(529),  primaryColor: '#E12B23' },
    { id: 'lens',   name: 'RC Lens',                city: 'Lens',          logo: crest(546),  primaryColor: '#FFD700' },
    { id: 'strbg',  name: 'RC Strasbourg Alsace',   city: 'Strasbourg',    logo: crest(576),  primaryColor: '#005CA9' },
    { id: 'auxer',  name: 'AJ Auxerre',             city: 'Auxerre',       logo: crest(519),  primaryColor: '#0F4D92' },
    { id: 'brest',  name: 'Stade Brestois 29',      city: 'Brest',         logo: crest(512),  primaryColor: '#E0000E' },
    { id: 'metz',   name: 'FC Metz',                city: 'Metz',          logo: crest(545),  primaryColor: '#7E0202' },
    { id: 'angers', name: 'Angers SCO',             city: 'Angers',        logo: crest(514),  primaryColor: '#000000' },
    { id: 'lehavre',name: 'Le Havre AC',            city: 'Le Havre',      logo: crest(517),  primaryColor: '#1A5CB0' },
    { id: 'nantes', name: 'FC Nantes',              city: 'Nantes',        logo: crest(543),  primaryColor: '#FFD700' },
    { id: 'mtpel', name: 'Montpellier HSC',         city: 'Montpellier',   logo: crest(518),  primaryColor: '#FF6900' },
    { id: 'reims',  name: 'Stade de Reims',         city: 'Reims',         logo: crest(547),  primaryColor: '#E1000F' },
    { id: 'toul',   name: 'Toulouse FC',            city: 'Toulouse',      logo: crest(511),  primaryColor: '#4B0082' }

  ]
};

// Catégorie Football Européen — top championships
export const championsEurope = [
  {
    id: 'premier-league',
    name: 'Premier League',
    country: 'Angleterre',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    clubs: [
      { id: 'mci', name: 'Manchester City', city: 'Manchester',    logo: crest(65),  primaryColor: '#6CABDD' },
      { id: 'liv', name: 'Liverpool',       city: 'Liverpool',     logo: crest(64),  primaryColor: '#C8102E' },
      { id: 'che', name: 'Chelsea',         city: 'Londres',       logo: crest(61),  primaryColor: '#034694' },
      { id: 'ars', name: 'Arsenal',         city: 'Londres',       logo: crest(57),  primaryColor: '#EF0107' },
      { id: 'mun', name: 'Manchester United', city: 'Manchester',  logo: crest(66),  primaryColor: '#DA291C' },
      { id: 'tot', name: 'Tottenham Hotspur', city: 'Londres',     logo: crest(73),  primaryColor: '#132257' }
    ]
  },
  {
    id: 'la-liga',
    name: 'La Liga',
    country: 'Espagne',
    flag: '🇪🇸',
    clubs: [
      { id: 'rma', name: 'Real Madrid',       city: 'Madrid',     logo: crest(86),  primaryColor: '#FEBE10' },
      { id: 'fcb', name: 'FC Barcelona',      city: 'Barcelona',  logo: crest(81),  primaryColor: '#A50044' },
      { id: 'atm', name: 'Atlético Madrid',   city: 'Madrid',     logo: crest(78),  primaryColor: '#CB3524' },
      { id: 'sev', name: 'Sevilla FC',        city: 'Séville',    logo: crest(559), primaryColor: '#D32027' }
    ]
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    country: 'Allemagne',
    flag: '🇩🇪',
    clubs: [
      { id: 'bay', name: 'Bayern Munich',          city: 'Munich',   logo: crest(5),  primaryColor: '#DC052D' },
      { id: 'bvb', name: 'Borussia Dortmund',      city: 'Dortmund', logo: crest(4),  primaryColor: '#FDE100' },
      { id: 'rbl', name: 'RB Leipzig',             city: 'Leipzig',  logo: crest(721),primaryColor: '#DD0741' }
    ]
  },
  {
    id: 'serie-a',
    name: 'Serie A',
    country: 'Italie',
    flag: '🇮🇹',
    clubs: [
      { id: 'juv', name: 'Juventus',  city: 'Turin',    logo: crest(109), primaryColor: '#000000' },
      { id: 'mil', name: 'AC Milan',  city: 'Milan',    logo: crest(98),  primaryColor: '#FB090B' },
      { id: 'int', name: 'Inter',     city: 'Milan',    logo: crest(108), primaryColor: '#0068A8' },
      { id: 'nap', name: 'SSC Napoli',city: 'Naples',   logo: crest(113), primaryColor: '#12A0DB' }
    ]
  }
];

// Catégorie Autres sports
export const otherSports = [
  {
    id: 'rugby',
    name: 'Top 14 Rugby',
    country: 'France',
    flag: '🏉',
    clubs: [
      { id: 'st',   name: 'Stade Toulousain',     city: 'Toulouse',  logo: null, primaryColor: '#E1000F' },
      { id: 'ur',   name: 'Union Bordeaux-Bègles',city: 'Bordeaux',  logo: null, primaryColor: '#003F87' },
      { id: 'rcg',  name: 'Racing 92',            city: 'Paris',     logo: null, primaryColor: '#0066CC' },
      { id: 'mtpr', name: 'Montpellier HR',       city: 'Montpellier',logo: null,primaryColor: '#0096D6' }
    ]
  },
  {
    id: 'basket',
    name: 'LNB Pro A Basket',
    country: 'France',
    flag: '🏀',
    clubs: [
      { id: 'asvel',name: 'LDLC ASVEL',        city: 'Villeurbanne', logo: null, primaryColor: '#018A4D' },
      { id: 'mona', name: 'AS Monaco Basket',  city: 'Monaco',       logo: null, primaryColor: '#E60026' }
    ]
  }
];

// Catégorie Évènements — à venir
export const events = [
  { id: 'cdm-2026',  name: 'Coupe du Monde 2026',          date: '2026-06-11', location: 'USA · Mexique · Canada', flag: '🏆' },
  { id: 'can-2025',  name: 'Coupe d\'Afrique 2025',         date: '2025-12-21', location: 'Maroc',                  flag: '🌍' },
  { id: 'ucl-final', name: 'Finale Champions League 2026', date: '2026-05-30', location: 'Wembley',                flag: '🏟' }
];
