// ============================================================
// Clubs du championnat de Tanzanie + Fédération de Zanzibar.
// Photos posées dans public/images/products/{nom-dossier}/.
// ============================================================

// NBC Premier League — championnat de Tanzanie continentale.
// 8 clubs avec photos products ajoutées par l'équipe.
export const nbcPremier = {
  id: 'nbc-premier-league',
  name: 'NBC Premier League',
  country: 'Tanzanie',
  flag: '🇹🇿',
  clubs: [
    { id: 'azam-fc',           name: 'Azam FC',           city: 'Chamazi',        logo: null, primaryColor: '#1B3A6E' },
    { id: 'coastal-union',     name: 'Coastal Union',     city: 'Tanga',          logo: null, primaryColor: '#B22222' },
    { id: 'geita-gold-fc',     name: 'Geita Gold FC',     city: 'Geita',          logo: null, primaryColor: '#DAA520' },
    { id: 'jkt-tanzania',      name: 'JKT Tanzania',      city: 'Ruvu',           logo: null, primaryColor: '#4F7942' },
    { id: 'kagera-sugar',      name: 'Kagera Sugar',      city: 'Bukoba',         logo: null, primaryColor: '#C49A0E' },
    { id: 'namungo-fc',        name: 'Namungo FC',        city: 'Ruangwa',        logo: null, primaryColor: '#1E40AF' },
    { id: 'simba-sc',          name: 'Simba SC',          city: 'Dar es Salaam',  logo: null, primaryColor: '#C8102E' },
    { id: 'young-africans-sc', name: 'Young Africans SC', city: 'Dar es Salaam',  logo: null, primaryColor: '#007A33' }
  ]
};

// Fédération de Zanzibar de Football — sélection nationale spéciale
// (membre associé de la CAF mais pas de la FIFA, joue dans des compétitions
// régionales comme la CECAFA Cup).
// Traitée comme une sélection nationale dans le registry.
export const zanzibarFederation = {
  id: 'fedzanzibar',
  // Champs au format fromFederationMember
  name: 'Fédération de Zanzibar de Football',
  nameFR: 'Fédération de Zanzibar de Football',
  nameEN: 'Zanzibar Football Federation',
  code: 'ZFF',
  flag: '🇹🇿',
  region: 'Afrique de l\'Est',
  federation: 'ZFF - Zanzibar Football Federation',
  president: 'Salum Madadi',
  founded: 1926,
  fifaMember: null,                   // pas membre FIFA (membre associé CAF)
  colors: ['#007A33', '#FFD700'],     // vert + or (couleurs du drapeau de Zanzibar)
  logo: null
};
