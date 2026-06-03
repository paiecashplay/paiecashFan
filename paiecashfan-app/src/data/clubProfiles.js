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
  },

  // ────────────────────────────────────────────────────────────
  // Olympique de Marseille — Ligue 1
  // ────────────────────────────────────────────────────────────
  'olympique-de-marseille': {
    motto: 'Droit au but',
    mottoColor: '#FFFFFF',            // texte blanc (devise traditionnelle blanche sur bleu)
    founded: 1899,
    stadium: 'Orange Vélodrome',
    stadiumImage: '/images/clubs/velodrome-om.jpg',
    coach: 'Roberto De Zerbi',        // À ajuster si changement
    president: 'Pablo Longoria',
    // Palmarès historique le plus étoffé du football français.
    // 27 trophées au total (10 + 10 + 3 + 3 + 1).
    // Ne compte pas le titre amateur de 1929 (qui porterait à 28).
    trophies: {
      total: 27,
      breakdown: [
        { label: 'Ligue des champions',     count: 1,  years: '1993',                            scope: 'european' },
        { label: 'Championnat de France',   count: 10, years: '1937, 1948, 1971, 1972, 1989-1992, 2010', scope: 'domestic' },
        { label: 'Coupe de France',         count: 10, years: '1924, 1926, 1927, 1935, 1938, 1943, 1969, 1972, 1976, 1989', scope: 'domestic' },
        { label: 'Coupe de la Ligue',       count: 3,  years: '2010, 2011, 2012',                scope: 'domestic' },
        { label: 'Trophée des Champions',   count: 3,  years: '1971, 2010, 2011',                scope: 'domestic' }
      ]
    },
    starPlayer: {
      number: 9,
      name: 'Pierre-Emerick Aubameyang',
      position: 'Attaquant',
      image: '/images/players/om/aubameyang.jpg',
      stats: { goals: 15, assists: 4 }   // à ajuster avec les stats officielles
    },
    // Squad officiel OM 2025-26 (depuis captures fournies par l'utilisateur).
    // Photos posées dans public/images/players/om/
    // À compléter : les 6 attaquants ont des numéros estimés — la capture des
    // attaquants n'a pas encore été reçue (à ajuster si numéros différents).
    squad: [
      // ── GARDIENS ───────────────────────────────────────────────
      { number: 1,  name: 'Gerónimo Rulli',           position: 'Gardien de but',    country: 'AR', image: '/images/players/om/rulli.jpg' },
      { number: 12, name: 'Jeffrey De Lange',         position: 'Gardien de but',    country: 'NL', image: '/images/players/om/deLange.jpg' },
      { number: 40, name: 'Jelle Van Neck',           position: 'Gardien de but',    country: 'BE', image: '/images/players/om/vanNeck.jpg' },
      { number: 92, name: 'Théo Vermot',              position: 'Gardien de but',    country: 'FR', image: '/images/players/om/vermot.jpg' },

      // ── DÉFENSEURS ─────────────────────────────────────────────
      { number: 4,  name: 'CJ Egan-Riley',            position: 'Défenseur',         country: 'GB', image: '/images/players/om/egan-riley.jpg' },
      { number: 5,  name: 'Leonardo Balerdi',         position: 'Défenseur',         country: 'AR', image: '/images/players/om/balerdi.jpg' },
      { number: 21, name: 'Nayef Aguerd',             position: 'Défenseur',         country: 'MA', image: '/images/players/om/aguerd.jpg' },
      { number: 22, name: 'Timothy Weah',             position: 'Défenseur',         country: 'US', image: '/images/players/om/weah.jpg' },
      { number: 28, name: 'Benjamin Pavard',          position: 'Défenseur',         country: 'FR', image: '/images/players/om/pavard.jpg' },
      { number: 32, name: 'Facundo Medina',           position: 'Défenseur',         country: 'AR', image: '/images/players/om/medina.jpg' },
      { number: 33, name: 'Emerson Palmieri',         position: 'Défenseur',         country: 'IT', image: '/images/players/om/palmieri.jpg' },

      // ── MILIEUX ────────────────────────────────────────────────
      { number: 6,  name: 'Tochukwu Nnadi',           position: 'Milieu de terrain', country: 'NG', image: '/images/players/om/tochukwu.jpg' },
      { number: 8,  name: 'Himad Abdelli',            position: 'Milieu de terrain', country: 'DZ', image: '/images/players/om/abdelli.jpg' },
      { number: 18, name: 'Arthur Vermeeren',         position: 'Milieu de terrain', country: 'BE', image: '/images/players/om/vermeeren.jpg' },
      { number: 19, name: 'Geoffrey Kondogbia',       position: 'Milieu de terrain', country: 'CF', image: '/images/players/om/kondogbia.jpg' },
      { number: 23, name: 'Pierre-Emile Højbjerg',    position: 'Milieu de terrain', country: 'DK', image: '/images/players/om/hojbjerg.jpg' },
      { number: 26, name: 'Bilal Nadir',              position: 'Milieu de terrain', country: 'MA', image: '/images/players/om/nadir.jpg' },
      { number: 27, name: 'Quinten Timber',           position: 'Milieu de terrain', country: 'NL', image: '/images/players/om/timber.jpg' },
      { number: 45, name: 'Yanis Sellami',            position: 'Milieu de terrain', country: 'FR', image: '/images/players/om/sellami.jpg' },

      // ── ATTAQUANTS ─────────────────────────────────────────────
      // Numéros estimés (capture attaquants pas encore reçue)
      { number: 7,  name: 'Mason Greenwood',          position: 'Attaquant',         country: 'GB', image: '/images/players/om/greenwood.jpg' },
      { number: 9,  name: 'Pierre-Emerick Aubameyang',position: 'Attaquant',         country: 'GA', image: '/images/players/om/aubameyang.jpg' },
      { number: 10, name: 'Amine Gouiri',             position: 'Attaquant',         country: 'DZ', image: '/images/players/om/gouiri.jpg' },
      { number: 11, name: 'Igor Paixão',              position: 'Attaquant',         country: 'BR', image: '/images/players/om/paixao.jpg' },
      { number: 17, name: 'Hamed Traoré',             position: 'Attaquant',         country: 'CI', image: '/images/players/om/traore.jpg' },
      { number: 24, name: 'Ethan Nwaneri',            position: 'Attaquant',         country: 'GB', image: '/images/players/om/nwaneri.jpg' }
    ]
  }

  // À étendre : Olympique Lyonnais, AS Monaco, FC Barcelona, Real Madrid,
  // Bayern Munich, Liverpool, etc. Même pattern.
};

// Helper : récupère le profil d'un club (peut être null).
export function getClubProfile(slug) {
  return clubProfiles[slug] || null;
}
