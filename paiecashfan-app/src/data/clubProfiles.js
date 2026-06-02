// ============================================================
// Profils détaillés pour chaque club (override des données de base
// venant de leagues.js / federation members).
//
// Indexés par slug calculé via slugify(club.name).
// Chaque profil peut fournir : motto, mottoColor, founded, stadium,
// stadiumImage, coach, president, starPlayer, squad.
//
// Si un club n'a pas de profil ici, la page club utilise les fallbacks
// génériques (image stade par défaut, pas de Star Player / Squad).
// ============================================================

export const clubProfiles = {
  // ────────────────────────────────────────────────────────────
  // Paris Saint-Germain — Ligue 1
  // ────────────────────────────────────────────────────────────
  'paris-saint-germain': {
    motto: 'Ici c\'est Paris',
    mottoColor: '#DC2626',            // rouge PSG
    founded: 1970,
    stadium: 'Parc des Princes',
    stadiumImage: '/images/clubs/psg-stadium.jpg', // poser le fichier ici
    coach: 'Luis Enrique',
    president: 'Nasser Al-Khelaïfi',
    // Palmarès complet du PSG (58 trophées au total).
    // Pour étendre à d'autres clubs : reprendre la même structure.
    trophies: {
      total: 58,
      breakdown: [
        { label: 'Ligue des champions',            count: 2,  years: '2025, 2026',              scope: 'european' },
        { label: 'Coupe intercontinentale',        count: 1,  years: '2025',                    scope: 'world' },
        { label: 'Supercoupe d\'Europe',           count: 1,  years: '2025',                    scope: 'european' },
        { label: 'Coupe des vainqueurs de coupe',  count: 1,  years: '1996',                    scope: 'european' },
        { label: 'Championnat de France',          count: 14, years: '1986, 1994, 2013-2016, 2018-2020, 2022-2026', scope: 'domestic' },
        { label: 'Coupe de France',                count: 16, years: '1982, 1983, 1993, 1995, 1998, 2004, 2006, 2010, 2015-2018, 2020, 2021, 2024, 2025', scope: 'domestic' },
        { label: 'Coupe de la Ligue',              count: 9,  years: '1995, 1998, 2008, 2014-2018, 2020', scope: 'domestic' },
        { label: 'Trophée des champions',          count: 14, years: '1995, 1998, 2013-2020, 2022-2025', scope: 'domestic' }
      ]
    },
    starPlayer: {
      number: 10,
      name: 'Ousmane Dembélé',
      position: 'Attaquant',
      // L'image va d'abord chercher /images/players/ousmane-dembele.jpg (à poser),
      // sinon fallback automatique sur un placeholder stylisé.
      image: '/images/players/ousmane-dembele.jpg',
      stats: { goals: 33, assists: 14 }
    },
    // Pour chaque joueur, image optionnelle dans /images/players/{slug}.jpg
    // Tu peux laisser vide pour utiliser le placeholder stylisé (numéro géant).
    squad: [
      { number: 1,  name: 'Gianluigi Donnarumma', position: 'Gardien',     country: 'IT' },
      { number: 5,  name: 'Marquinhos',           position: 'Défenseur',   country: 'BR' },
      { number: 6,  name: 'Willian Pacho',        position: 'Défenseur',   country: 'EC' },
      { number: 21, name: 'Lucas Hernandez',      position: 'Défenseur',   country: 'FR' },
      { number: 25, name: 'Nuno Mendes',          position: 'Défenseur',   country: 'PT' },
      { number: 8,  name: 'Fabián Ruiz',          position: 'Milieu',      country: 'ES' },
      { number: 17, name: 'Vitinha',              position: 'Milieu',      country: 'PT' },
      { number: 33, name: 'Warren Zaïre-Emery',   position: 'Milieu',      country: 'FR' },
      { number: 14, name: 'Désiré Doué',          position: 'Milieu',      country: 'FR' },
      { number: 10, name: 'Ousmane Dembélé',      position: 'Attaquant',   country: 'FR' },
      { number: 9,  name: 'Gonçalo Ramos',        position: 'Attaquant',   country: 'PT' },
      { number: 7,  name: 'Bradley Barcola',      position: 'Attaquant',   country: 'FR' }
    ]
  }

  // À étendre pour les autres clubs : Olympique de Marseille, Lyon, Monaco,
  // FC Barcelona, Real Madrid, Bayern Munich, Liverpool, etc.
  // Pattern : ajouter une entrée { slug → profil } et la page club
  // se mettra automatiquement à jour.
};

// Helper : récupère le profil d'un club (peut être null).
export function getClubProfile(slug) {
  return clubProfiles[slug] || null;
}
