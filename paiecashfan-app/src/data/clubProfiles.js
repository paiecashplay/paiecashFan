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
      image: '/images/players/PSG/ousmane-dembele.jpg',
      stats: { goals: 33, assists: 14 }
    },
    // Liste officielle 2026 (24 joueurs). Photos posées dans /public/images/players/
    // avec noms hétérogènes — référencés explicitement via le champ image.
    squad: [
      { number: 2,  name: 'Achraf Hakimi',          position: 'Défenseur',         country: 'MA', image: '/images/players/PSG/hakimi.jpg' },
      { number: 5,  name: 'Marquinhos',             position: 'Défenseur',         country: 'BR', image: '/images/players/PSG/marquinhos.jpg' },
      { number: 6,  name: 'Illia Zabarnyi',         position: 'Défenseur',         country: 'UA', image: '/images/players/PSG/Zabarnyi.jpg' },
      { number: 7,  name: 'Khvicha Kvaratskhelia',  position: 'Attaquant',         country: 'GE', image: '/images/players/PSG/Kvaratskhelia.jpg' },
      { number: 8,  name: 'Fabián Ruiz',            position: 'Milieu de terrain', country: 'ES', image: '/images/players/PSG/ruiz.jpg' },
      { number: 9,  name: 'Gonçalo Ramos',          position: 'Attaquant',         country: 'PT', image: '/images/players/PSG/ramos.jpg' },
      { number: 10, name: 'Ousmane Dembélé',        position: 'Attaquant',         country: 'FR', image: '/images/players/PSG/ousmane-dembele.jpg' },
      { number: 14, name: 'Désiré Doué',            position: 'Attaquant',         country: 'FR', image: '/images/players/PSG/doué.jpg' },
      { number: 17, name: 'Vitinha',                position: 'Milieu de terrain', country: 'PT', image: '/images/players/PSG/vitinha.jpg' },
      { number: 19, name: 'Kang-In Lee',            position: 'Milieu de terrain', country: 'KR', image: '/images/players/PSG/lee.jpg' },
      { number: 21, name: 'Lucas Hernández',        position: 'Défenseur',         country: 'FR', image: '/images/players/PSG/hernandez.jpg' },
      { number: 25, name: 'Nuno Mendes',            position: 'Défenseur',         country: 'PT', image: '/images/players/PSG/mendes.jpg' },
      { number: 27, name: 'Dro Fernández',          position: 'Milieu de terrain', country: 'ES', image: '/images/players/PSG/Dro Fernández.jpg' },
      { number: 29, name: 'Bradley Barcola',        position: 'Attaquant',         country: 'FR', image: '/images/players/PSG/barcola.jpg' },
      { number: 30, name: 'Lucas Chevalier',        position: 'Gardien de but',    country: 'FR', image: '/images/players/PSG/chevalier.jpg' },
      { number: 33, name: 'Warren Zaïre-Emery',     position: 'Milieu de terrain', country: 'FR', image: '/images/players/PSG/Zaïre-Emery.jpg' },
      { number: 35, name: 'Lucas Beraldo',          position: 'Défenseur',         country: 'BR', image: '/images/players/PSG/beraldo.jpg' },
      { number: 39, name: 'Matvey Safonov',         position: 'Gardien de but',    country: 'RU', image: '/images/players/PSG/safonov.jpg' },
      { number: 41, name: 'Senny Mayulu',           position: 'Milieu de terrain', country: 'FR', image: '/images/players/PSG/mayulu.jpg' },
      { number: 44, name: 'Quentin Ndjantou',       position: 'Attaquant',         country: 'FR', image: '/images/players/PSG/Ndjantou.jpg' },
      { number: 49, name: 'Ibrahim Mbaye',          position: 'Attaquant',         country: 'FR', image: '/images/players/PSG/mbaye.jpg' },
      { number: 51, name: 'Willian Pacho',          position: 'Défenseur',         country: 'EC', image: '/images/players/PSG/pacho.jpg' },
      { number: 87, name: 'João Neves',             position: 'Milieu de terrain', country: 'PT', image: '/images/players/PSG/neves.jpg' },
      { number: 89, name: 'Renato Marin',           position: 'Gardien de but',    country: 'BR', image: '/images/players/PSG/marin.jpg' }
    ],
    merchandise: [
      // ── Maillots ─────────────────────────────────────────────────
      {
        id: 'home-jersey',
        category: 'maillot',
        name: 'Maillot Domicile 2025-26',
        description: 'Maillot Domicile Match PSG Nike Dri-FIT ADV.',
        price: 130,
        image: '/images/products/paris-saint-germain/home-jersey-recto.jpg',
        images: [
          '/images/products/paris-saint-germain/home-jersey-recto.jpg',
          '/images/products/paris-saint-germain/home-jersey-verso.jpg'
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        emoji: '👕'
      },
      {
        id: 'away-jersey',
        category: 'maillot',
        name: 'Maillot Extérieur 2025-26',
        description: 'Maillot Extérieur Stadium PSG Nike.',
        price: 100,
        image: '/images/products/paris-saint-germain/out-jersey-recto.png',
        images: [
          '/images/products/paris-saint-germain/out-jersey-recto.png',
          '/images/products/paris-saint-germain/out-jersey-verso.png'
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        emoji: '👕'
      },

      // ── Sweats ─────────────────────────────────────────────────
      {
        id: 'hoodie',
        category: 'sweat',
        name: 'Sweat à capuche PSG',
        description: 'Sweat capuche PSG Nike Kvaratskhelia 7 - Bleu.',
        price: 75,
        image: '/images/products/paris-saint-germain/hoodie-recto.jpg',
        images: [
          '/images/products/paris-saint-germain/hoodie-recto.jpg',
          '/images/products/paris-saint-germain/hoodie-verso.jpg'
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        emoji: '🥋'
      },

      // ── T-SHIRT ───────────────────────────────────────────────
      {
        id: 'tshirt',
        category: 't-shirt',
        name: 'T-Shirt OM',
        description: 'T-Shirt PSG Nike Kvaratskhelia 7 - Bleu.',
        price: 42,
        image: '/images/products/paris-saint-germain/Tshirt-recto.jpg',
        images: [
          '/images/products/paris-saint-germain/Tshirt-recto.jpg',
          '/images/products/paris-saint-germain/Tshirt-verso.jpg',
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        emoji: '👕'
      },

      // ── Survetement ───────────────────────────────────────────────
      {
        id: 'survetement',
        category: 'survetement',
        name: 'Survêtement PSG',
        description: 'Survêtement PSG - Bleu.',
        price: 83,
        image: '/images/products/paris-saint-germain/tracksuit-recto.jpg',
        images: [
          '/images/products/paris-saint-germain/tracksuit-recto.jpg',
          '/images/products/paris-saint-germain/tracksuit-verso.jpg'
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        emoji: '🥋'
      },

      // ── ACCESSOIRES ───────────────────────────────────────────
      {
        id: 'scarf',
        category: 'accessoire',
        name: 'Écharpe PSG ',
        description: 'Écharpe PSG Core Wordmark - Bleu',
        price: 13,
        image: '/images/products/paris-saint-germain/echarp.jpg',
        images: [
          '/images/products/paris-saint-germain/echarp.jpg',
        ],
        emoji: '🧣'
      },
      {
        id: 'cap',
        category: 'accessoire',
        name: 'Casquette PSG',
        description: 'Casquette PSG Étoile Eiffel 2 réglable - Bleu',
        price: 25,
        image: '/images/products/paris-saint-germain/casquette-recto.jpg',
        images: [
          '/images/products/paris-saint-germain/casquette-recto.jpg',
          '/images/products/paris-saint-germain/casquette-verso.jpg'
        ],
        emoji: '🧢'
      },

      // ── COLLECTION ────────────────────────────────────────────
      {
        id: 'ball',
        category: 'autre',
        name: 'Ballon PSG ecusson',
        description: 'Ballon de football Paris Saint-Germain avec écusson ',
        price: 17,
        image: '/images/products/paris-saint-germain/ballon.jpg',
        images: [
          '/images/products/paris-saint-germain/ballon.jpg'
        ],
        emoji: '⚽'
      },

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
      number: 17,
      name: 'Pierre-Emerick Aubameyang',
      position: 'Attaquant',
      image: '/images/players/OM/aubameyang.jpg',
      stats: { goals: 15, assists: 4 }   // à ajuster avec les stats officielles
    },
    // Boutique OM — paths réels des photos posées dans
    // public/images/products/olympique-de-marseille/
    merchandise: [
      // ── MAILLOTS ──────────────────────────────────────────────
      {
        id: 'home-jersey',
        category: 'maillot',
        name: 'Maillot Domicile 2025-26',
        description: 'Maillot officiel à domicile, design Puma × OM, sponsor CMA CGM, blanc à liserés bleu et or.',
        price: 100,
        image: '/images/products/olympique-de-marseille/home-jersey.png',
        images: [
          '/images/products/olympique-de-marseille/home-jersey.png',
          '/images/products/olympique-de-marseille/home-jersey-2.png'
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        emoji: '👕'
      },
      {
        id: 'away-jersey',
        category: 'maillot',
        name: 'Maillot Extérieur 2025-26',
        description: 'Maillot officiel à l\'extérieur, design Puma × OM, sponsor CMA CGM.',
        price: 100,
        image: '/images/products/olympique-de-marseille/out-jersey-recto.png',
        images: [
          '/images/products/olympique-de-marseille/out-jersey-recto.png',
          '/images/products/olympique-de-marseille/out-jersey-verso.png'
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        emoji: '👕'
      },
      {
        id: 'training-jersey',
        category: 'maillot',
        name: 'Maillot d\'Entraînement OM',
        description: 'Maillot d\'entraînement officiel Puma × OM, idéal pour l\'effort.',
        price: 50,
        image: '/images/products/olympique-de-marseille/training-recto.png',
        images: [
          '/images/products/olympique-de-marseille/training-recto.png',
          '/images/products/olympique-de-marseille/training1-recto.png',
          '/images/products/olympique-de-marseille/training verso.png'
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        emoji: '👕'
      },

      // ── SWEAT ─────────────────────────────────────────────────
      {
        id: 'hoodie',
        category: 'sweat',
        name: 'Sweat à capuche OM',
        description: 'Sweat à capuche officiel OM, coupe ample, parfait pour la tribune.',
        price: 85,
        image: '/images/products/olympique-de-marseille/sweet-recto.png',
        images: [
          '/images/products/olympique-de-marseille/sweet-recto.png',
          '/images/products/olympique-de-marseille/sweet-verso.png',
          '/images/products/olympique-de-marseille/sweet-porte.png'
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        emoji: '🥋'
      },

      // ── T-SHIRT ───────────────────────────────────────────────
      {
        id: 'tshirt',
        category: 't-shirt',
        name: 'T-Shirt OM Travel',
        description: 'T-shirt officiel OM Travel, coton premium, esprit Droit au but.',
        price: 45,
        image: '/images/products/olympique-de-marseille/Tshirt-travel.png',
        images: [
          '/images/products/olympique-de-marseille/Tshirt-travel.png',
          '/images/products/olympique-de-marseille/Tshirt-travel-verso.png',
          '/images/products/olympique-de-marseille/Tshirt-travel2.png'
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        emoji: '👕'
      },

      // ── ACCESSOIRES ───────────────────────────────────────────
      {
        id: 'scarf',
        category: 'accessoire',
        name: 'Écharpe Allez l\'OM',
        description: 'Écharpe tricotée officielle aux couleurs marseillaises, design Allez l\'OM.',
        price: 15,
        image: '/images/products/olympique-de-marseille/echarp-allez.png',
        images: [
          '/images/products/olympique-de-marseille/echarp-allez.png',
          '/images/products/olympique-de-marseille/echarp-allez2.png',
          '/images/products/olympique-de-marseille/echarp-allez3.png'
        ],
        emoji: '🧣'
      },
      {
        id: 'cap',
        category: 'accessoire',
        name: 'Casquette OM',
        description: 'Casquette officielle aux couleurs de l\'OM, taille unique ajustable.',
        price: 30,
        image: '/images/products/olympique-de-marseille/casquette-recto.png',
        images: [
          '/images/products/olympique-de-marseille/casquette-recto.png',
          '/images/products/olympique-de-marseille/casquette-verso.png',
          '/images/products/olympique-de-marseille/casquette-verso2.png',
          '/images/products/olympique-de-marseille/casquette2recto.png'
        ],
        emoji: '🧢'
      },

      // ── COLLECTION ────────────────────────────────────────────
      {
        id: 'ball',
        category: 'autre',
        name: 'Ballon Officiel OM',
        description: 'Ballon officiel aux couleurs de l\'Olympique de Marseille. Sous licence officielle.',
        price: 25,
        image: '/images/products/olympique-de-marseille/Ballon OM.png',
        images: [
          '/images/products/olympique-de-marseille/Ballon OM.png',
          '/images/products/olympique-de-marseille/Ballon OM2.png'
        ],
        emoji: '⚽'
      },
      {
        id: 'linge-lit-prado',
        category: 'maison',
        name: 'Linge De Lit OM PRADO 240 × 220',
        description: `Linge de lit Olympique de Marseille inspiration du Prado, coloris bleu et blanc.
Housse de couette réversible, pour changer selon vos envies.
Produit sous licence officielle.

En savoir plus :
- Housse de couette réversible bleu et blanc 240 × 220
- 2 taies d'oreiller bleu 63 × 63

Composition : 100 % coton
Coloris : Bleu et blanc`,
        price: 69.90,
        image: '/images/products/olympique-de-marseille/lingeLit.png',
        images: [
          '/images/products/olympique-de-marseille/lingeLit.png',
          '/images/products/olympique-de-marseille/lingeLit2.png',
          '/images/products/olympique-de-marseille/lingeLit3.png'
        ],
        emoji: '🛏️'
      }
    ],
    // Squad officiel OM 2025-26 (depuis captures fournies par l'utilisateur).
    // Photos posées dans public/images/players/OM/
    // À compléter : les 6 attaquants ont des numéros estimés — la capture des
    // attaquants n'a pas encore été reçue (à ajuster si numéros différents).
    squad: [
      // ── GARDIENS ───────────────────────────────────────────────
      { number: 1,  name: 'Gerónimo Rulli',           position: 'Gardien de but',    country: 'AR', image: '/images/players/OM/rulli.jpg' },
      { number: 12, name: 'Jeffrey De Lange',         position: 'Gardien de but',    country: 'NL', image: '/images/players/OM/deLange.jpg' },
      { number: 40, name: 'Jelle Van Neck',           position: 'Gardien de but',    country: 'BE', image: '/images/players/OM/vanNeck.jpg' },
      { number: 92, name: 'Théo Vermot',              position: 'Gardien de but',    country: 'FR', image: '/images/players/OM/vermot.jpg' },

      // ── DÉFENSEURS ─────────────────────────────────────────────
      { number: 4,  name: 'CJ Egan-Riley',            position: 'Défenseur',         country: 'GB', image: '/images/players/OM/egan-riley.jpg' },
      { number: 5,  name: 'Leonardo Balerdi',         position: 'Défenseur',         country: 'AR', image: '/images/players/OM/balerdi.jpg' },
      { number: 21, name: 'Nayef Aguerd',             position: 'Défenseur',         country: 'MA', image: '/images/players/OM/aguerd.jpg' },
      { number: 22, name: 'Timothy Weah',             position: 'Défenseur',         country: 'US', image: '/images/players/OM/weah.jpg' },
      { number: 28, name: 'Benjamin Pavard',          position: 'Défenseur',         country: 'FR', image: '/images/players/OM/pavard.jpg' },
      { number: 32, name: 'Facundo Medina',           position: 'Défenseur',         country: 'AR', image: '/images/players/OM/medina.jpg' },
      { number: 33, name: 'Emerson Palmieri',         position: 'Défenseur',         country: 'IT', image: '/images/players/OM/palmieri.jpg' },

      // ── MILIEUX ────────────────────────────────────────────────
      { number: 6,  name: 'Tochukwu Nnadi',           position: 'Milieu de terrain', country: 'NG', image: '/images/players/OM/tochukwu.jpg' },
      { number: 8,  name: 'Himad Abdelli',            position: 'Milieu de terrain', country: 'DZ', image: '/images/players/OM/abdelli.jpg' },
      { number: 18, name: 'Arthur Vermeeren',         position: 'Milieu de terrain', country: 'BE', image: '/images/players/OM/vermeeren.jpg' },
      { number: 19, name: 'Geoffrey Kondogbia',       position: 'Milieu de terrain', country: 'CF', image: '/images/players/OM/kondogbia.jpg' },
      { number: 23, name: 'Pierre-Emile Højbjerg',    position: 'Milieu de terrain', country: 'DK', image: '/images/players/OM/hojbjerg.jpg' },
      { number: 26, name: 'Bilal Nadir',              position: 'Milieu de terrain', country: 'MA', image: '/images/players/OM/nadir.jpg' },
      { number: 27, name: 'Quinten Timber',           position: 'Milieu de terrain', country: 'NL', image: '/images/players/OM/timber.jpg' },
      { number: 45, name: 'Yanis Sellami',            position: 'Milieu de terrain', country: 'FR', image: '/images/players/OM/sellami.jpg' },

      // ── ATTAQUANTS ─────────────────────────────────────────────
      { number: 9,  name: 'Amine Gouiri',             position: 'Attaquant',         country: 'DZ', image: '/images/players/OM/gouiri.jpg' },
      { number: 10, name: 'Mason Greenwood',          position: 'Attaquant',         country: 'GB', image: '/images/players/OM/greenwood.jpg' },
      { number: 11, name: 'Ethan Nwaneri',            position: 'Attaquant',         country: 'GB', image: '/images/players/OM/nwaneri.jpg' },
      { number: 14, name: 'Igor Paixão',              position: 'Attaquant',         country: 'BR', image: '/images/players/OM/paixao.jpg' },
      { number: 17, name: 'Pierre-Emerick Aubameyang',position: 'Attaquant',         country: 'GA', image: '/images/players/OM/aubameyang.jpg' },
      { number: 20, name: 'Hamed Traoré',             position: 'Attaquant',         country: 'CI', image: '/images/players/OM/traore.jpg' },
      { number: 76, name: 'Tadjidine Mmadi',          position: 'Attaquant',         country: 'KM', image: '/images/players/OM/mmadi.jpg' }
    ]
  },

  // ────────────────────────────────────────────────────────────
  // Paris FC — Ligue 1
  // ────────────────────────────────────────────────────────────
  'paris-fc': {
    motto: 'Une ambition capitale',
    mottoColor: '#0033A0',            // rouge PSG
    founded: 1969,
    stadium: 'Jean-Bouin',
    stadiumImage: '/images/clubs/parisFC-stadium.jpg', // poser le fichier ici
    coach: 'Pierre Ferracci',
    president: 'Antoine Kombouaré',
    // Palmarès complet du PSG (58 trophées au total).
    // Pour étendre à d'autres clubs : reprendre la même structure.
    trophies: {
      total: 0,
      breakdown: [
        { label: 'Division 2 (Groupe Centre)',       count: 1, years: '1971', scope: 'national' },
        { label: 'Division 4',                       count: 1, years: '1989', scope: 'national' },
        { label: 'Division d\'Honneur (Paris-Île-de-France)', count: 1, years: '1988', scope: 'regional' },
        { label: 'Championnat de France Amateur',    count: 1, years: '2006', scope: 'national' }
      ]
    },
    starPlayer: {
      number: 10,
      name: 'Ilan Kebbal',
      position: 'Milieu de terrain',
      image: '/images/players/PFC/ilan-kebbal.png',
      stats: {
        goals: 9,
        assists: 4
      }
    },
    // Liste officielle 2026 (24 joueurs). Photos posées dans /public/images/players/
    // avec noms hétérogènes — référencés explicitement via le champ image.
    squad: [
      { number: 1,  name: 'Rémy Riou',            position: 'Gardien de but',     country: 'FR', image: '/images/players/PFC/remy-riou.png' },
      { number: 16,  name: 'Obed Nkambadio',      position: 'Gardien de but',     country: 'FR', image: '/images/players/PFC/obed-nkambadio.png' },
      { number: 35,  name: 'Kevin Trapp',         position: 'Gardien de but',     country: 'AG', image: '/images/players/PFC/kevin-trapp.png' },
      { number: 2,  name: 'Tuomas Ollila',        position: 'Défenseur',          country: 'FL', image: '/images/players/PFC/tuomas-ollilia.png' },
      { number: 28,  name: 'Thibault De Smet',    position: 'Défenseur',          country: 'BE', image: '/images/players/PFC/thibault-de-smet.png' },
      { number: 6,  name: 'Otávio Ataíde da Silva',        position: 'Défenseur',          country: 'BR', image: '/images/players/PFC/otavio-ataide-da-silva.png' },
      { number: 19,  name: 'Nhoa Sangui',       position: 'Défenseur',  country: 'FR', image: '/images/players/PFC/nhoa-sangui.png' },
      { number: 5,  name: 'Moustapha Mbow',     position: 'Défenseur',          country: 'SE', image: '/images/players/PFC/moustapha-mbow.png' },
      { number: 15,  name: 'Timothée Kolodziejczak',   position: 'Défenseur',          country: 'FR', image: '/images/players/PFC/timothee-kolodziejczak.png' },
      { number: 22,  name: 'Sofiane Alakouch',   position: 'Défenseur',          country: 'MA', image: '/images/players/PFC/sofiane-alakouch.png' },
      { number: 31,  name: 'Samir Chergui',       position: 'Défenseur',  country: 'AL', image: '/images/players/PFC/samir-chergui.png' },
      { number: 14,  name: 'Hamari Traoré',       position: 'Défenseur',  country: 'MA', image: '/images/players/PFC/hamari-traore.png' },
      { number: 42,  name: 'Diego Coppola',     position: 'Défenseur',   country: 'IT', image: '/images/players/PFC/diego-coppola.png' },
      { number: 4,  name: 'Vincent Marchetti',        position: 'Milieu de terrain',  country: 'FR', image: '/images/players/PFC/vincent-marchetti.png' },
      { number: 17,  name: 'Adama Camara',        position: 'Milieu de terrain',  country: 'FR', image: '/images/players/PFC/adama-camara.png' },
      { number: 13,  name: 'Mathieu Cafaro',     position: 'Milieu de terrain',  country: 'FR', image: '/images/players/PFC/mathieu-cafaro.png' },
      { number: 33,  name: 'Pierre Lees-Melou',     position: 'Milieu de terrain',  country: 'FR', image: '/images/players/PFC/pierre-lees-melou.png' },
      { number: 21,  name: 'Maxime Lopez',     position: 'Milieu de terrain',  country: 'FR', image: '/images/players/PFC/maxime-lopez.png' },    
      { number: 10,  name: 'Ilan Kebbal',         position: 'Milieu de terrain',  country: 'FR', image: '/images/players/PFC/ilan-kebbal.png' },
      { number: 18,  name: 'Marshall Munetsi',    position: 'Milieu de terrain',          country: 'ZM', image: '/images/players/PFC/marshall-munetsi.png' },
      { number: 23,  name: 'Rudy Matondo',       position: 'Milieu de terrain',          country: 'FR', image: '/images/players/PFC/rudy-matondo.png' },
      { number: 11,  name: 'Jean-Philippe Krasso',     position: 'Attaquant',          country: 'CI', image: '/images/players/PFC/jean-philippe-krasso.png' },
      { number: 7,   name: 'Alimami Gory',   position: 'Attaquant',          country: 'FR', image: '/images/players/PFC/alimami-gory.png' },
      { number: 20,   name: 'Julien Lopez',     position: 'Attaquant',          country: 'AL', image: '/images/players/PFC/julien-lopez.png' },
      { number: 26,   name: 'Lamine Gueye',     position: 'Attaquant',          country: 'SE', image: '/images/players/PFC/lamine-gueye.png' },
      { number: 29,   name: 'Pierre-Yves Hamel',     position: 'Attaquant',          country: 'FR', image: '/images/players/PFC/pierre-yves-hamel.png' },
      { number: 9,   name: 'Willem Geubbels',     position: 'Attaquant',          country: 'FR', image: '/images/players/PFC/willem-geubbels.png' },
      { number: 93,   name: 'Jonathan Ikoné',     position: 'Attaquant',          country: 'FR', image: '/images/players/PFC/jonathan-ikone.png' },
      { number: 27,   name: 'Moses Simon',     position: 'Attaquant',          country: 'NI', image: '/images/players/PFC/moses-simon.png' },
      { number: 24,   name: 'Luca Koleosho',     position: 'Attaquant',          country: 'IT', image: '/images/players/PFC/luca-koleosho.png' },
      { number: 36,   name: 'Ciro Immobile',     position: 'Attaquant',          country: 'FR', image: '/images/players/PFC/ciro-immobile.png' }
    ],
    merchandise: [
      // ── Maillots ──────────────────────────────────────────────
      {
        id: 'home-jersey',
        category: 'maillot',
        name: 'Maillot Domicile PFC 2025/2026',
        description: 'Le maillot officiel Paris FC domicile par adidas pour la saison 2025/2026.',
        price: 57,
        image: '/images/products/PFC/home-jersey-recto.jpg',
        images: [
          '/images/products/PFC/home-jersey-recto.jpg',
          '/images/products/PFC/home-jersey-verso.jpg'
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        emoji: '👕'
      },

      {
        id: 'away-jersey',
        category: 'maillot',
        name: 'Maillot Extérieur PFC 2025/2026',
        description: 'Maillot Paris FC Extérieur 25/26, design moderne et respirant pour les supporters.',
        price: 57,
        image: '/images/products/PFC/away-jersey-recto.jpg',
        images: [
          '/images/products/PFC/away-jersey-recto.jpg',
          '/images/products/PFC/away-jersey-verso.jpg'
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        emoji: '👕'
      },

      // ── SWEAT ─────────────────────────────────────────────────
      {
        id: 'hoodie',
        category: 'sweat',
        name: 'Sweat-shirt à capuche Paris FC',
        description: 'Sweat-shirt supporter Paris FC zippé à capuche, confortable et chaud pour les matchs.',
        price: 33,
        image: '/images/products/PFC/hoodie-recto.jpg',
        images: [
          '/images/products/PFC/hoodie-recto.jpg',
          '/images/products/PFC/hoodie-verso.jpg'
        ],
        sizes: ['S', 'M', 'L'],
        emoji: '🥋'
      },

      // ── T-SHIRT ───────────────────────────────────────────────
      {
        id: 'tshirt',
        category: 't-shirt',
        name: 'T-Shirt Paris FC',
        description: 'T-Shirt Logo Paris FC Blanc.',
        price: 15.4,
        image: '/images/products/PFC/T-shirt-recto.jpg',
        images: [
          '/images/products/PFC/T-shirt-recto.jpg',
          '/images/products/PFC/T-shirt-verso.jpg',
        ],
        sizes: ['XS', 'S', 'M'],
        emoji: '👕'
      },

      // ── ACCESSOIRES ───────────────────────────────────────────
      {
        id: 'scarf',
        category: 'accessoire',
        name: 'Écharpe Paris FC',
        description: 'Écharpe De Noël Mascotte Enfant Paris FC.',
        price: 15,
        image: '/images/products/PFC/echarp.jpg',
        images: [
          '/images/products/PFC/echarp.jpg',
        ],
        emoji: '🧣'
      },
      {
        id: 'cap',
        category: 'accessoire',
        name: 'Casquette Paris FC',
        description: 'Casquette Paris FC x New Era.',
        price: 20.8,
        image: '/images/products/PFC/casquette-recto.jpg',
        images: [
          '/images/products/PFC/casquette-recto.jpg',
          '/images/products/PFC/casquette-verso.jpg'
        ],
        emoji: '🧢'
      },
      {
        id: 'bag',
        category: 'accessoire',
        name: 'Sac à dos Paris FC',
        description: 'Sac à dos Essentiel Paris FC x adidas.',
        price: 39,
        image: '/images/products/PFC/bag-recto.jpg',
        images: [
          '/images/products/PFC/bag-recto.jpg',
          '/images/products/PFC/bag-verso.jpg'
        ],
        emoji: '🎒'
      },
      
      // ── COLLECTION ────────────────────────────────────────────
      {
        id: 'ball',
        category: 'autre',
        name: 'Ballon Paris FC',
        description: 'Mini Ballon Kids Paris FC.',
        price: 13.5,
        image: '/images/products/PFC/ballon-recto.jpg',
        images: [
          '/images/products/PFC/ballon-recto.jpg',
          '/images/products/PFC/ballon-verso.jpg'
        ],
        emoji: '⚽'
      },
    ]
  },

  // ────────────────────────────────────────────────────────────
  // Sélection nationale Tanzanie (Taifa Stars) — page Fédération.
  // Pas de boutique : on remplace par la grille des clubs NBC.
  // Le flag `isFederationHub: true` indique au ClubDetail de basculer
  // le rendu (grille de clubs au lieu de Boutique).
  // ────────────────────────────────────────────────────────────
  'tanzanie': {
    logo: '/images/logos/clubs-tanzanie/tanzania-federation-logo.png',
    motto: 'Taifa Stars',
    mottoColor: '#FCD116',
    founded: 1930,
    stadium: 'Benjamin Mkapa Stadium',
    stadiumImage: '/images/tanzania-stadium.webp',
    // Image plus légère/standard (JPEG) pour la grille des cards —
    // garantit l'affichage sur tous les navigateurs + chargement
    // rapide quand on en affiche 8 sur la même vue.
    cardBackground: '/images/clubs/tanzania-stadium-card.jpg',
    coach: 'Hemed Morocco',
    president: 'Wallace Karia',
    isFederationHub: true,
    starPlayer: {
      number: 6,
      name: 'Feisal Salum ',
      position: 'Milieu de terrain',
      image: '/images/players/AZ/Feisal-Salum.png',
      stats: { goals: 14, assists: 8 }
    }
  },

  // ────────────────────────────────────────────────────────────
  // Clubs de la NBC Premier League (Tanzanie)
  // Boutique standard 4 produits (maillot/sweat/t-shirt/casquette)
  // Photos posées dans /images/products/{Nom-Dossier}/ avec leur casse exacte.
  // ────────────────────────────────────────────────────────────
  ...tanzaniaClubsProfiles(),

  // ────────────────────────────────────────────────────────────
  // Fédération de Zanzibar de Football (sélection nationale spéciale)
  // ────────────────────────────────────────────────────────────
  'federation-de-zanzibar-de-football': {
    motto: 'Pamoja kwa Zanzibar',
    mottoColor: '#FFD700',
    founded: 1926,
    stadium: 'Amaan Stadium',
    coach: '—',
    president: 'Salum Madadi',
    // Effectif minimal : 3 joueurs avec leurs photos dans players/ZFF/
    squad: [
      { number: 1, name: 'Mudathir Yahya',     position: 'Gardien de but', country: 'TZ', image: '/images/players/ZFF/Mudathir-Yahya.webp' },
      { number: 8, name: 'Feisal Salum',       position: 'Milieu de terrain', country: 'TZ', image: '/images/players/ZFF/Feisal-Salum.jpeg' },
      { number: 9, name: 'Abdulaziz Makame',   position: 'Attaquant',      country: 'TZ', image: '/images/players/ZFF/Abdulaziz-Makame.jpeg' }
    ],
    starPlayer: {
      number: 9,
      name: 'Abdulaziz Makame',
      position: 'Attaquant',
      image: '/images/players/ZFF/Abdulaziz-Makame.jpeg',
      stats: { goals: 8, assists: 3 }
    },
    // Boutique : seulement 1 t-shirt à ce stade
    merchandise: [
      {
        id: 'tshirt',
        category: 'tshirt',
        name: 'T-Shirt Fédération Zanzibar',
        description: 'T-shirt officiel aux couleurs de la Fédération de Zanzibar de Football.',
        price: 30,
        image: '/images/products/federation-de-zanzibar-de-football/Tshirt-recto.jpg',
        images: [
          '/images/products/federation-de-zanzibar-de-football/Tshirt-recto.jpg',
          '/images/products/federation-de-zanzibar-de-football/Tshirt-verso.jpg'
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        emoji: '👕'
      }
    ]
  }
};

// ============================================================
// Helper : génère les profils des 8 clubs tanzaniens.
// Chacun a la même structure boutique (4 produits) avec paths
// référencés en majuscules pour matcher l'arbre git case-sensitive.
// ============================================================
function tanzaniaClubsProfiles() {
  const clubs = [
    { slug: 'azam-fc',           folder: 'Azam-FC',           founded: 2003, stadium: 'Chamazi Complex',     primaryColor: '#1B3A6E', motto: 'Force et Honneur',
      starPlayer: { number: 6, name: 'Feisal Salum',          position: 'Milieu de terrain',         image: '/images/players/AZ/Feisal-Salum.png',      stats: { goals: 14, assists: 8 } },
      trophies: { total: 4, breakdown: [
        { label: 'NBC Premier League',   count: 1, years: '2014',           scope: 'domestic' },
        { label: 'Coupe de Tanzanie',    count: 2, years: '2013, 2018',     scope: 'domestic' },
        { label: 'Community Shield TZ',  count: 1, years: '2014',           scope: 'domestic' }
      ]},
      squad: [
        { number: 2,  name: 'James Akaminko',         position: 'Milieu de terrain',    country: 'GN', image: '/images/players/AZ/James-Akaminko.jpg' },
        { number: 6,  name: 'Feisal Salum',           position: 'Milieu de terrain',    country: 'TZ', image: '/images/players/AZ/Feisal-Salum.png' },
        { number: 7,  name: 'Zidane Ally Sereri',     position: 'Milieu de terrain',    country: 'TZ', image: '/images/players/AZ/Zidane-Ally.jpg' },
        { number: 8,  name: 'Sadio Kanouté',          position: 'Milieu de terrain',    country: 'ML', image: '/images/players/AZ/Sadio-Kanoute.png' },
        { number: 35,  name: 'Himid Mao Mkami',       position: 'Milieu de terrain',    country: 'TZ', image: '/images/players/AZ/Himid-Mao.png' },
        { number: 9,  name: 'Abdul Hamisi Suleiman',  position: 'Attaquant',          country: 'TZ', image: '/images/players/AZ/Abdul-Hamisi.png' },
        { number: 13,  name: 'Pape Doudou Diallo',    position: 'Attaquant',            country: 'SN', image: '/images/players/AZ/Doudou-Diallo.png' },
        { number: 23,  name: 'Iddy Nado',             position: 'Attaquant',            country: 'TZ', image: '/images/players/AZ/Iddy-Nado.png' },
        { number: 30,  name: 'Jephté Kitambala',      position: 'Attaquant',         country: 'RD', image: '/images/players/AZ/Jephte-Kitambala.png'},
        { number: 3,  name: 'Yoro Diaby',             position: 'Défenseur',            country: 'ML', image: '/images/players/AZ/Yoro-Diaby.png' },
        { number: 5,  name: 'Lusajo Mwaikenda',       position: 'Défenseur',            country: 'TZ', image: '/images/players/AZ/Lusajo-Mwaikenda.png' },
        { number: 24,  name: 'Yeison Fuentes',         position: 'Défenseur',            country: 'CB', image: '/images/players/AZ/Yeison-Fuentes.png' },
        { number: 25,  name: 'Nuru Twalib',            position: 'Défenseur',            country: 'TZ', image: '/images/players/AZ/Nuru-Twalib.png' },
        { number: 28,  name: 'Zuberi Foba',           position: 'Gardien de but',            country: 'TZ', image: '/images/players/AZ/Zuberi-Foba.png' },
        { number: 32,  name: 'Aishi Manula',           position: 'Gardien de but',            country: 'TZ', image: '/images/players/AZ/Aishi-Manula.png' },
      ]
    },
    { slug: 'coastal-union',     folder: 'Coastal-Union',     founded: 1953, stadium: 'Mkwakwani Stadium',   primaryColor: '#B22222', motto: 'L\'Union de la Côte',
      starPlayer: { number: 9,  name: 'Hassan Dilunga',       position: 'Attaquant',         image: '/images/players/ZFF/Hassan-Dilunga.jpg',   stats: { goals: 9,  assists: 4 } } },
    { slug: 'geita-gold-fc',     folder: 'Geita-Gold-FC',     founded: 2013, stadium: 'Geita Stadium',       primaryColor: '#DAA520', motto: 'Or de Geita',
      starPlayer: { number: 11, name: 'Said Ndemla',          position: 'Milieu de terrain', stats: { goals: 6,  assists: 5 } } },
    { slug: 'jkt-tanzania',      folder: 'JKT-Tanzania',      founded: 1970, stadium: 'Uhuru Stadium',       primaryColor: '#4F7942', motto: 'Pour la Patrie',
      starPlayer: { number: 7,  name: 'Bakari Mwamnyeto',     position: 'Milieu de terrain', image: '/images/players/ZFF/Bakari-Mwamnyeto.jpg', stats: { goals: 8,  assists: 7 } } },
    { slug: 'kagera-sugar',      folder: 'Kagera-Sugar',      founded: 2002, stadium: 'Kaitaba Stadium',     primaryColor: '#C49A0E', motto: 'La Douceur de Kagera',
      starPlayer: { number: 8,  name: 'Farid Mussa',          position: 'Milieu de terrain', image: '/images/players/ZFF/Farid-Mussa.jpg',      stats: { goals: 5,  assists: 6 } } },
    { slug: 'namungo-fc',        folder: 'Namungo-FC',        founded: 2007, stadium: 'Majaliwa Stadium',    primaryColor: '#1E40AF', motto: 'L\'Esprit de Ruangwa',
      starPlayer: { number: 9,  name: 'Pius Buswita',         position: 'Attaquant',         image: '/images/players/ZFF/Pius-Buswita.jpg',     stats: { goals: 11, assists: 3 } },
      trophies: { total: 1, breakdown: [
        { label: 'Coupe de Tanzanie',    count: 1, years: '2020',           scope: 'domestic' }
      ]} },
    { slug: 'simba-sc',          folder: 'Simba-SC',          founded: 1936, stadium: 'Benjamin Mkapa',      primaryColor: '#C8102E', motto: 'Les Lions de Tanzanie',
      starPlayer: { number: 24, name: 'Clatous Chama',        position: 'Milieu de terrain',         image: '/images/players/SB/Clatous-Chama.png',   stats: { goals: 8, assists: 6 } },
      trophies: { total: 29, breakdown: [
        { label: 'NBC Premier League',   count: 23, years: '1965, 1971, 1972, 1973, 1976, 1977, 1979, 1980, 1981, 1992, 1993, 1994, 1995, 2000, 2002, 2009, 2010, 2012, 2018, 2020, 2021, 2022, 2023', scope: 'domestic' },
        { label: 'Coupe de Tanzanie',    count: 6, years: '1974, 1975, 1976, 2000, 2010, 2024', scope: 'domestic' }
      ]},
      squad: [
        { number: 2,  name: 'Chamou Karaboué',             position: 'Défenseur',           country: 'CI', image: '/images/players/SB/Chamou-Karaboue.png' },
        { number: 12,  name: 'Shomari Kapombe',            position: 'Défenseur',           country: 'TZ', image: '/images/players/SB/Shomari-Kapombe.png' },
        { number: 23,  name: 'Rushine De Reuck',           position: 'Défenseur',           country: 'AS', image: '/images/players/SB/Rushine-De-Reuck.png' },
        { number: 15,  name: 'David Kameta',               position: 'Défenseur',           country: 'TZ', image: '/images/players/SB/David-Kameta.png' },
        { number: 31,  name: 'Wilson Nangu',               position: 'Défenseur',           country: 'TZ', image: '/images/players/SB/Wilson-Nangu.png' },
        { number: 18,  name: 'Morice Abraham',             position: 'Milieu de terrain',   country: 'TZ', image: '/images/players/SB/Morice-Abraham.png' },
        { number: 19,  name: 'Mzamiru Yassin',             position: 'Milieu de terrain',   country: 'TZ', image: '/images/players/SB/Mzamiru-Yassin.png' },
        { number: 21,  name: 'Yusuph Kagoma',              position: 'Milieu de terrain',   country: 'TZ', image: '/images/players/SB/Yusuph-Kagoma.png' },
        { number: 24,  name: 'Clatous Chama',              position: 'Milieu de terrain',   country: 'ZB', image: '/images/players/SB/Clatous-Chama.png' },
        { number: 37,  name: 'Hussein Semfuko',            position: 'Milieu de terrain',   country: 'TZ', image: '/images/players/SB/Hussein-Semfuko.png' },
        { number: 3,  name: 'Jonathan Sowah',              position: 'Attaquant',           country: 'GN', image: '/images/players/SB/Jonathan-Sowah.png' },
        { number: 11,  name: 'Steven Mukwala',             position: 'Attaquant',                country: 'OG', image: '/images/players/SB/Steven-Mukwala.png' },
        { number: 29,  name: 'Libasse Gueye',             position: 'Attaquant',                country: 'SN', image: '/images/players/SB/Libasse-Gueye.png' },       
        { number: 40,  name: 'Selemani Mwalimu',       position: 'Attaquant',           country: 'TZ', image: '/images/players/SB/Selemani-Mwalimu.png' },
        { number: 22,  name: 'Yakoub Suleiman Ali',       position: 'Gardien de but',           country: 'TZ', image: '/images/players/SB/Yakoub-Suleiman.png' },   
      ] 
    },
    { slug: 'young-africans-sc', folder: 'Young-Africans-SC', founded: 1935, stadium: 'Benjamin Mkapa',      primaryColor: '#007A33', motto: 'Yanga, mon amour',
      starPlayer: { number: 20,  name: 'Allan Okello',        position: 'Milieu de terrain',         image: '/images/players/YA/Allan-Okello.png', stats: { goals: 11, assists: 7 } },
      trophies: { total: 35, breakdown: [
        { label: 'NBC Premier League',   count: 30, years: '1968, 1969, 1970, 1974, 1978, 1981, 1982, 1984, 1985, 1986, 1987, 1992, 1996, 1997, 1998, 2005, 2006, 2008, 2011, 2013, 2015, 2016, 2017, 2019, 2024, 2025…', scope: 'domestic' },
        { label: 'Coupe de Tanzanie',    count: 5, years: '1975, 1999, 2003, 2018, 2023', scope: 'domestic' }
      ]},
      squad: [
        { number: 1,  name: 'Khomeiny Abubakar',          position: 'Gardien de but',         country: 'TZ', image: '/images/players/YA/Khomeiny-Abubakar.png' },
        { number: 16,  name: 'Abdutwalib Mshery',         position: 'Gardien de but',         country: 'TZ', image: '/images/players/YA/Abdutwalib-Mshery.png' },
        { number: 28,  name: 'Hussein Masaranga',         position: 'Gardien de but',         country: 'TZ', image: '/images/players/YA/Hussein-Masaranga.png' },
        { number: 39,  name: 'Djigui Diarra',             position: 'Gardien de but',         country: 'ML', image: '/images/players/YA/Djigui-Diarra.png' },
        { number: 3,  name: 'Bakari Mwamnyeto',           position: 'Défenseur',              country: 'TZ', image: '/images/players/YA/Bakari-Mwamnyeto.png' },
        { number: 4,  name: 'Ibrahim Hamad',              position: 'Défenseur',              country: 'TZ', image: '/images/players/YA/Ibrahim-Hamad.png' },
        { number: 5,  name: 'Dickson Job',                position: 'Défenseur',              country: 'TZ', image: '/images/players/YA/Dickson-Job.png' },
        { number: 15,  name: 'Mohamed Hussein',           position: 'Défenseur',              country: 'TZ', image: '/images/players/YA/Mohamed-Hussein.png' },
        { number: 23,  name: 'Issaka Boka',               position: 'Défenseur',              country: 'TZ', image: '/images/players/YA/Issaka-Boka.png' },
        { number: 33,  name: 'Israel Mwenda',             position: 'Défenseur',              country: 'TZ', image: '/images/players/YA/Israel-Mwenda.png' },
        { number: 2,  name: 'Aziz Andabwile',             position: 'Milieu de terrain',      country: 'TZ', image: '/images/players/YA/Aziz-Andabwile.png' },
        { number: 7,  name: 'Maxi Nzengeli',              position: 'Milieu de terrain',      country: 'TZ', image: '/images/players/YA/Maxi-Nzengeli.png' },
        { number: 8,  name: 'Lassine Kouma',              position: 'Milieu de terrain',      country: 'TZ', image: '/images/players/YA/Lassine-Kouma.png' },
        { number: 10,  name: 'Pacôme Zouzoua',            position: 'Milieu de terrain',      country: 'CI', image: '/images/players/YA/Pacome-Zouzoua.png' },
        { number: 20,  name: 'Allan Okello',              position: 'Milieu de terrain',      country: 'TZ', image: '/images/players/YA/Allan-Okello.png' },
        { number: 18,  name: 'Salum Abubakar',            position: 'Milieu de terrain',      country: 'TZ', image: '/images/players/YA/Salum-Abubakar.png' },
        { number: 6,  name: 'Balla Conté',                position: 'Attaquant',              country: 'GN', image: '/images/players/YA/Balla-Conte.png' },
        { number: 13,  name: 'Buba Jammeh',               position: 'Attaquant',              country: 'GB', image: '/images/players/YA/Buba-Jammeh.png' },
        { number: 17,  name: 'Farid Mussa',               position: 'Attaquant',              country: 'TZ', image: '/images/players/YA/Farid-Mussa.png' },
        { number: 29,  name: 'Prince Dube',               position: 'Attaquant',              country: 'ZW', image: '/images/players/YA/Prince-Dube.png' },
        { number: 30,  name: 'Clement Mzize',             position: 'Attaquant',              country: 'TZ', image: '/images/players/YA/Clement-Mzize.png' },
      ]}
  ];

  const entries = clubs.map((c) => {
    const base = `/images/products/${c.folder}`;
    return [
      c.slug,
      {
        motto: c.motto,
        mottoColor: c.primaryColor,
        founded: c.founded,
        stadium: c.stadium,
        stadiumImage: '/images/tanzania-stadium.webp',
        // starPlayer / trophies / squad sont optionnels — ne s'affichent
        // que si présents dans le profil club.
        ...(c.starPlayer ? { starPlayer: c.starPlayer } : {}),
        ...(c.trophies   ? { trophies:   c.trophies   } : {}),
        ...(c.squad      ? { squad:      c.squad      } : {}),
        merchandise: [
          {
            id: 'jersey',
            category: 'maillot',
            name: 'Maillot Officiel',
            price: 75,
            image: `${base}/jersey-recto.png`,
            images: [`${base}/jersey-recto.png`, `${base}/jersey-verso.png`],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            emoji: '👕'
          },
          {
            id: 'hoodie',
            category: 'survetement',
            name: 'Sweat à capuche',
            price: 55,
            image: `${base}/sweet-porte-recto.png`,
            images: [`${base}/sweet-porte-recto.png`, `${base}/sweet-porte-verso.png`],
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            emoji: '🥋'
          },
          {
            id: 'tshirt',
            category: 't-shirt',
            name: 'T-Shirt Officiel',
            price: 30,
            image: `${base}/Tshirt-recto.png`,
            images: [`${base}/Tshirt-recto.png`, `${base}/Tshirt-verso.png`],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            emoji: '👕'
          },
          {
            id: 'cap',
            category: 'accessoire',
            name: 'Casquette Officielle',
            price: 20,
            image: `${base}/casquette-recto.png`,
            images: [`${base}/casquette-recto.png`, `${base}/casquette-verso.png`],
            emoji: '🧢'
          }
        ]
      }
    ];
  });

  return Object.fromEntries(entries);
}

// Helper : récupère le profil d'un club (peut être null).
export function getClubProfile(slug) {
  return clubProfiles[slug] || null;
}
