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
      image: '/images/players/ousmane-dembele.jpg',
      stats: { goals: 33, assists: 14 }
    },
    // Liste officielle 2026 (24 joueurs). Photos posées dans /public/images/players/
    // avec noms hétérogènes — référencés explicitement via le champ image.
    squad: [
      { number: 2,  name: 'Achraf Hakimi',          position: 'Défenseur',         country: 'MA', image: '/images/players/hakimi.jpg' },
      { number: 5,  name: 'Marquinhos',             position: 'Défenseur',         country: 'BR', image: '/images/players/marquinhos.jpg' },
      { number: 6,  name: 'Illia Zabarnyi',         position: 'Défenseur',         country: 'UA', image: '/images/players/Zabarnyi.jpg' },
      { number: 7,  name: 'Khvicha Kvaratskhelia',  position: 'Attaquant',         country: 'GE', image: '/images/players/Kvaratskhelia.jpg' },
      { number: 8,  name: 'Fabián Ruiz',            position: 'Milieu de terrain', country: 'ES', image: '/images/players/ruiz.jpg' },
      { number: 9,  name: 'Gonçalo Ramos',          position: 'Attaquant',         country: 'PT', image: '/images/players/ramos.jpg' },
      { number: 10, name: 'Ousmane Dembélé',        position: 'Attaquant',         country: 'FR', image: '/images/players/ousmane-dembele.jpg' },
      { number: 14, name: 'Désiré Doué',            position: 'Attaquant',         country: 'FR', image: '/images/players/doué.jpg' },
      { number: 17, name: 'Vitinha',                position: 'Milieu de terrain', country: 'PT', image: '/images/players/vitinha.jpg' },
      { number: 19, name: 'Kang-In Lee',            position: 'Milieu de terrain', country: 'KR', image: '/images/players/lee.jpg' },
      { number: 21, name: 'Lucas Hernández',        position: 'Défenseur',         country: 'FR', image: '/images/players/hernandez.jpg' },
      { number: 25, name: 'Nuno Mendes',            position: 'Défenseur',         country: 'PT', image: '/images/players/mendes.jpg' },
      { number: 27, name: 'Dro Fernández',          position: 'Milieu de terrain', country: 'ES', image: '/images/players/Dro Fernández.jpg' },
      { number: 29, name: 'Bradley Barcola',        position: 'Attaquant',         country: 'FR', image: '/images/players/barcola.jpg' },
      { number: 30, name: 'Lucas Chevalier',        position: 'Gardien de but',    country: 'FR', image: '/images/players/chevalier.jpg' },
      { number: 33, name: 'Warren Zaïre-Emery',     position: 'Milieu de terrain', country: 'FR', image: '/images/players/Zaïre-Emery.jpg' },
      { number: 35, name: 'Lucas Beraldo',          position: 'Défenseur',         country: 'BR', image: '/images/players/beraldo.jpg' },
      { number: 39, name: 'Matvey Safonov',         position: 'Gardien de but',    country: 'RU', image: '/images/players/safonov.jpg' },
      { number: 41, name: 'Senny Mayulu',           position: 'Milieu de terrain', country: 'FR', image: '/images/players/mayulu.jpg' },
      { number: 44, name: 'Quentin Ndjantou',       position: 'Attaquant',         country: 'FR', image: '/images/players/Ndjantou.jpg' },
      { number: 49, name: 'Ibrahim Mbaye',          position: 'Attaquant',         country: 'FR', image: '/images/players/mbaye.jpg' },
      { number: 51, name: 'Willian Pacho',          position: 'Défenseur',         country: 'EC', image: '/images/players/pacho.jpg' },
      { number: 87, name: 'João Neves',             position: 'Milieu de terrain', country: 'PT', image: '/images/players/neves.jpg' },
      { number: 89, name: 'Renato Marin',           position: 'Gardien de but',    country: 'BR', image: '/images/players/marin.jpg' }
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
