// ============================================================
// Clubs du championnat de Tanzanie + Fédération de Zanzibar.
// Photos posées dans public/images/products/{nom-dossier}/.
// Logos dans public/images/logos/clubs-tanzanie/.
// ============================================================

// NBC Premier League — championnat de Tanzanie continentale.
// 8 clubs avec leurs métadonnées complètes (logo, stade, année, ville)
// — utilisés à la fois par /clubs/:slug (page club individuelle) et par
// la grille des clubs sur la page de la fédération /clubs/tanzanie.
export const nbcPremier = {
  id: 'nbc-premier-league',
  name: 'NBC Premier League',
  country: 'Tanzanie',
  flag: '🇹🇿',
  clubs: [
    { id: 'young-africans-sc', name: 'Young Africans SC', city: 'Dar es Salaam', stadium: 'Benjamin Mkapa Stadium', founded: 1935, logo: '/images/logos/clubs-tanzanie/young-africans-sc.png', primaryColor: '#007A33' },
    { id: 'simba-sc',          name: 'Simba SC',          city: 'Dar es Salaam', stadium: 'Benjamin Mkapa Stadium', founded: 1936, logo: '/images/logos/clubs-tanzanie/simba-sc.png',          primaryColor: '#C8102E' },
    { id: 'azam-fc',           name: 'Azam FC',           city: 'Dar es Salaam', stadium: 'Chamazi Stadium',        founded: 2004, logo: '/images/logos/clubs-tanzanie/azam-fc.png',           primaryColor: '#1B3A6E' },
    { id: 'coastal-union',     name: 'Coastal Union',     city: 'Tanga',         stadium: 'Mkwakwani Stadium',      founded: 1974, logo: '/images/logos/clubs-tanzanie/coastal-union.png',     primaryColor: '#B22222' },
    { id: 'jkt-tanzania',      name: 'JKT Tanzania',      city: 'Dar es Salaam', stadium: 'Uhuru Stadium',          founded: 1964, logo: '/images/logos/clubs-tanzanie/jkt-tanzania.png',      primaryColor: '#4F7942' },
    { id: 'namungo-fc',        name: 'Namungo FC',        city: 'Mtwara',        stadium: 'Majaliwa Stadium',       founded: 2000, logo: null,                                                  primaryColor: '#1E40AF' },
    { id: 'geita-gold-fc',     name: 'Geita Gold FC',     city: 'Geita',         stadium: 'Kambarage Stadium',      founded: 2015, logo: null,                                                  primaryColor: '#DAA520' },
    { id: 'kagera-sugar',      name: 'Kagera Sugar',      city: 'Kagera',        stadium: 'Kaitaba Stadium',        founded: 1977, logo: null,                                                  primaryColor: '#C49A0E' }
  ]
};

// Fédération de Zanzibar de Football — sélection nationale spéciale
// (membre associé de la CAF mais pas de la FIFA, joue dans des compétitions
// régionales comme la CECAFA Cup).
// Traitée comme une sélection nationale dans le registry.
export const zanzibarFederation = {
  id: 'fedzanzibar',
  name: 'Fédération de Zanzibar de Football',
  nameFR: 'Fédération de Zanzibar de Football',
  nameEN: 'Zanzibar Football Federation',
  code: 'ZFF',
  flag: '🇹🇿',
  region: 'Afrique de l\'Est',
  federation: 'ZFF - Zanzibar Football Federation',
  president: 'Salum Madadi',
  founded: 1926,
  fifaMember: null,
  colors: ['#007A33', '#FFD700'],
  logo: null
};
