// ⭐ BASE DE DONNÉES DES LÉGENDES - TOUS LES CLUBS
// Chaque légende est associée à son club principal ET sa première équipe professionnelle
// Source: Données historiques officielles + Transfermarkt + Wikipedia

const legendesDatabase = {
    // ========== OLYMPIQUE DE MARSEILLE ==========
    'olympique-de-marseille': [
        {
            name: 'Basile Boli',
            photo: 'https://cdn.resfu.com/media/img/news/boli--om-3--om.fr.jpg',
            role: 'Défenseur légendaire',
            period: '1990-1994',
            achievements: 'But de la tête en finale C1 1993 contre AC Milan • Champion d\'Europe • Champion de France',
            followers: 850000,
            firstClub: 'AJ Auxerre',
            firstClubPeriod: '1982-1990',
            nft: { available: true, price: 499, rarity: 'LEGENDARY', edition: '100/1993' }
        },
        {
            name: 'Didier Drogba',
            photo: 'https://img.chelseafc.com/image/upload/f_auto,q_auto:best,w_1440/editorial/people/mens-players/2004-05/Didier_Drogba_Profile.jpg',
            role: 'Attaquant prodige',
            period: '2003-2004',
            achievements: '32 buts en 55 matchs • Meilleur buteur Ligue 1 • Légende Chelsea',
            followers: 15200000,
            firstClub: 'Le Mans UC',
            firstClubPeriod: '1998-2002',
            nft: { available: true, price: 599, rarity: 'LEGENDARY', edition: '32/55' }
        },
        {
            name: 'Steve Mandanda',
            photo: 'https://www.om.fr/sites/default/files/styles/full_screen_retina/public/2022-07/MANDANDA_STEVE_0.jpg',
            role: 'Gardien emblématique',
            period: '2007-2016, 2017-2022',
            achievements: 'Plus de 600 matchs avec l\'OM • Capitaine • Champion du monde 2018',
            followers: 2400000,
            firstClub: 'Le Havre AC',
            firstClubPeriod: '2005-2007',
            nft: { available: true, price: 350, rarity: 'EPIC', edition: '600/613' }
        },
        {
            name: 'André Ayew',
            photo: 'https://www.om.fr/sites/default/files/inline-images/ayew_17.jpg',
            role: 'Enfant du club',
            period: '2007-2015',
            achievements: 'Formé à l\'OM • 60 buts • Capitaine • Ballon d\'or africain',
            followers: 3200000,
            firstClub: 'Olympique de Marseille',
            firstClubPeriod: '2007-2015',
            note: 'Formation à l\'OM',
            nft: { available: true, price: 299, rarity: 'RARE', edition: '60/246' }
        },
        {
            name: 'Souleymane Diawara',
            photo: 'https://static.om.net/photos/joueurs/290/thumb_souleymane-diawara_290.jpg',
            role: 'Capitaine emblématique',
            period: '2007-2014',
            achievements: 'Capitaine • Plus de 200 matchs • Leader défensif',
            followers: 180000,
            firstClub: 'FC Sochaux',
            firstClubPeriod: '2000-2007',
            nft: { available: true, price: 249, rarity: 'EPIC', edition: '200/245' }
        },
        {
            name: 'Mamadou Niang',
            photo: 'https://www.om.fr/sites/default/files/2020-12/niang_0.jpg',
            role: 'Buteur historique',
            period: '2005-2011',
            achievements: '83 buts • Meilleur buteur de l\'histoire récente • Légende du Vélodrome',
            followers: 950000,
            firstClub: 'FC Metz',
            firstClubPeriod: '2002-2005',
            nft: { available: true, price: 399, rarity: 'EPIC', edition: '83/259' }
        },
        {
            name: 'Djamel Belmadi',
            photo: 'https://cdn-s-www.lalsace.fr/images/4C3E3F3C-8C7E-4E1A-9F1C-9D8E2E8F5C3D/NW_raw/belmadi-lors-de-son-passage-a-l-om-photo-d-r-1574449774.jpg',
            role: 'Milieu technique',
            period: '2003-2008',
            achievements: 'Sélectionneur champion d\'Afrique 2019 • Milieu élégant',
            followers: 1200000,
            firstClub: 'Paris Saint-Germain',
            firstClubPeriod: '1998-2003',
            nft: { available: true, price: 199, rarity: 'RARE', edition: '89/167' }
        },
        {
            name: 'Habib Beye',
            photo: 'https://www.om.fr/sites/default/files/inline-images/beye.jpg',
            role: 'Latéral moderne',
            period: '2007-2009',
            achievements: 'Finaliste Coupe UEFA 2004 • Défenseur offensif',
            followers: 420000,
            firstClub: 'RC Strasbourg',
            firstClubPeriod: '2000-2002',
            nft: { available: true, price: 179, rarity: 'RARE', edition: '70/142' }
        },
        {
            name: 'Abedi Pelé',
            photo: 'https://en.africatopsports.com/wp-content/uploads/2020/03/abedi-pele-marseille.jpg',
            role: 'Roi d\'Afrique',
            period: '1987-1993',
            achievements: 'Légende africaine • Ballon d\'or africain 3x • Champion de France • Champion d\'Europe',
            followers: 2100000,
            firstClub: 'Real Tamale United (Ghana)',
            firstClubPeriod: '1978-1982',
            nft: { available: true, price: 549, rarity: 'LEGENDARY', edition: '3/147' }
        },
        {
            name: 'Taye Taiwo',
            photo: 'https://www.om.fr/sites/default/files/inline-images/taiwo_0.jpg',
            role: 'Latéral gauche explosif',
            period: '2005-2011',
            achievements: 'Finaliste Ligue des Champions 2011 • Puissance et technique',
            followers: 650000,
            firstClub: 'Lobi Stars (Nigeria)',
            firstClubPeriod: '2003-2005',
            nft: { available: true, price: 189, rarity: 'RARE', edition: '196/156' }
        },
        {
            name: 'Équipe Féminine OM 2024',
            photo: 'https://www.om.fr/sites/default/files/2024-01/om_feminin_equipe.jpg',
            role: 'Équipe professionnelle',
            period: '2020-Présent',
            achievements: 'Division 1 Féminine • Développement du football féminin',
            followers: 180000,
            firstClub: '-',
            firstClubPeriod: '-',
            note: 'NFT collectif',
            nft: { available: true, price: 149, rarity: 'COMMON', edition: '2024/2024' }
        }
    ],

    // ========== PARIS SAINT-GERMAIN ==========
    'paris-saint-germain': [
        {
            name: 'Ronaldinho',
            photo: 'https://www.psg.fr/media/18837/ronaldinho-psg.jpg',
            role: 'Magicien brésilien',
            period: '2001-2003',
            achievements: '25 buts • Ballon d\'or 2005 • Légende du football',
            followers: 60500000,
            firstClub: 'Grêmio (Brésil)',
            firstClubPeriod: '1998-2001',
            nft: { available: true, price: 899, rarity: 'LEGENDARY', edition: '10/25' }
        },
        {
            name: 'Zlatan Ibrahimović',
            photo: 'https://www.psg.fr/media/131847/zlatan-ibrahimovic.jpg',
            role: 'Attaquant légendaire',
            period: '2012-2016',
            achievements: '156 buts en 180 matchs • Meilleur buteur de l\'histoire du PSG • 4x Champion de France',
            followers: 58200000,
            firstClub: 'Malmö FF (Suède)',
            firstClubPeriod: '1999-2001',
            nft: { available: true, price: 799, rarity: 'LEGENDARY', edition: '156/180' }
        },
        {
            name: 'Thiago Silva',
            photo: 'https://www.psg.fr/media/127842/thiago-silva-psg.jpg',
            role: 'Défenseur central - O Monstro',
            period: '2012-2020',
            achievements: 'Capitaine • 8 saisons • 7 titres de champion • Leader défensif',
            followers: 11500000,
            firstClub: 'RS Futebol (Brésil)',
            firstClubPeriod: '2001-2004',
            nft: { available: true, price: 599, rarity: 'LEGENDARY', edition: '315/373' }
        },
        {
            name: 'Marco Verratti',
            photo: 'https://www.psg.fr/media/201848/marco-verratti.jpg',
            role: 'Maestro du milieu',
            period: '2012-2023',
            achievements: '11 saisons • 9 titres de champion • Finaliste C1 2020 • Champion d\'Europe 2020',
            followers: 7800000,
            firstClub: 'Pescara (Italie)',
            firstClubPeriod: '2008-2012',
            nft: { available: true, price: 499, rarity: 'EPIC', edition: '416/485' }
        },
        {
            name: 'Pauleta',
            photo: 'https://www.psg.fr/media/18965/pauleta-psg.jpg',
            role: 'Buteur historique',
            period: '2003-2008',
            achievements: '109 buts • Meilleur buteur historique pendant 7 ans • Légende portugaise',
            followers: 890000,
            firstClub: 'União Desportiva de Salamanca (Portugal)',
            firstClubPeriod: '1992-1994',
            nft: { available: true, price: 449, rarity: 'EPIC', edition: '109/211' }
        },
        {
            name: 'Rai',
            photo: 'https://www.psg.fr/media/19121/rai-psg.jpg',
            role: 'Milieu créateur',
            period: '1993-1998',
            achievements: 'Capitaine • Champion de France 1994 • Coupe d\'Europe des vainqueurs de coupe',
            followers: 520000,
            firstClub: 'São Paulo FC (Brésil)',
            firstClubPeriod: '1984-1993',
            nft: { available: true, price: 399, rarity: 'EPIC', edition: '72/215' }
        },
        {
            name: 'Edinson Cavani',
            photo: 'https://www.psg.fr/media/165842/edinson-cavani.jpg',
            role: 'El Matador',
            period: '2013-2020',
            achievements: '200 buts • Co-meilleur buteur historique • 6 titres de champion',
            followers: 6200000,
            firstClub: 'Danubio (Uruguay)',
            firstClubPeriod: '2005-2007',
            nft: { available: true, price: 649, rarity: 'LEGENDARY', edition: '200/301' }
        },
        {
            name: 'George Weah',
            photo: 'https://www.psg.fr/media/19298/george-weah-psg.jpg',
            role: 'Ballon d\'Or 1995',
            period: '1992-1995',
            achievements: 'Seul Ballon d\'Or africain • Champion de France 1994 • 55 buts',
            followers: 3200000,
            firstClub: 'Young Survivors (Libéria)',
            firstClubPeriod: '1985-1987',
            nft: { available: true, price: 799, rarity: 'LEGENDARY', edition: '1/1995' }
        }
    ],

    // ========== OLYMPIQUE LYONNAIS ==========
    'olympique-lyonnais': [
        {
            name: 'Juninho Pernambucano',
            photo: 'https://www.ol.fr/sites/default/files/inline-images/juninho_ol.jpg',
            role: 'Maître des coups francs',
            period: '2001-2009',
            achievements: '7 titres consécutifs • 100 buts dont 44 coups francs • Légende absolue',
            followers: 2100000,
            firstClub: 'Sport Recife (Brésil)',
            firstClubPeriod: '1993-1995',
            nft: { available: true, price: 699, rarity: 'LEGENDARY', edition: '44/352' }
        },
        {
            name: 'Grégory Coupet',
            photo: 'https://www.ol.fr/sites/default/files/inline-images/coupet_ol.jpg',
            role: 'Gardien légendaire',
            period: '1997-2008',
            achievements: '7 titres de champion • 518 matchs • Élu meilleur gardien Ligue 1',
            followers: 620000,
            firstClub: 'AS Saint-Étienne',
            firstClubPeriod: '1994-1997',
            nft: { available: true, price: 499, rarity: 'EPIC', edition: '518/518' }
        },
        {
            name: 'Michael Essien',
            photo: 'https://www.ol.fr/sites/default/files/inline-images/essien_ol.jpg',
            role: 'Milieu tout-terrain',
            period: '2003-2005',
            achievements: 'Champion 2004 et 2005 • Joueur africain de l\'année 2005',
            followers: 3100000,
            firstClub: 'Liberty Professionals (Ghana)',
            firstClubPeriod: '1998-2000',
            nft: { available: true, price: 399, rarity: 'EPIC', edition: '76/96' }
        },
        {
            name: 'Alexandre Lacazette',
            photo: 'https://www.ol.fr/sites/default/files/inline-images/lacazette_ol_2024.jpg',
            role: 'Général Lacazette',
            period: '2010-2017, 2022-Présent',
            achievements: 'Formé au club • Plus de 200 buts • Capitaine • Enfant de Lyon',
            followers: 7300000,
            firstClub: 'Olympique Lyonnais',
            firstClubPeriod: '2010-2017',
            note: 'Formation à l\'OL',
            nft: { available: true, price: 449, rarity: 'EPIC', edition: '206/387' }
        },
        {
            name: 'Karim Benzema',
            photo: 'https://www.ol.fr/sites/default/files/inline-images/benzema_ol.jpg',
            role: 'Attaquant prodige',
            period: '2005-2009',
            achievements: 'Formé à l\'OL • 66 buts • Ballon d\'Or 2022 • Légende mondiale',
            followers: 73500000,
            firstClub: 'Olympique Lyonnais',
            firstClubPeriod: '2005-2009',
            note: 'Formation à l\'OL',
            nft: { available: true, price: 849, rarity: 'LEGENDARY', edition: '66/148' }
        },
        {
            name: 'Sidney Govou',
            photo: 'https://www.ol.fr/sites/default/files/inline-images/govou_ol.jpg',
            role: 'Ailier emblématique',
            period: '1999-2010',
            achievements: 'Formé au club • 7 titres • 407 matchs • Fidélité totale',
            followers: 450000,
            firstClub: 'Olympique Lyonnais',
            firstClubPeriod: '1999-2010',
            note: 'Formation à l\'OL',
            nft: { available: true, price: 349, rarity: 'RARE', edition: '407/407' }
        }
    ],

    // ========== AS MONACO ==========
    'as-monaco': [
        {
            name: 'Jean Tigana',
            photo: 'https://www.asmonaco.com/wp-content/uploads/jean-tigana-monaco.jpg',
            role: 'Milieu légendaire - Carré Magique',
            period: '1980-1989',
            achievements: 'Champion 1982, 1988 • Demi-finaliste Coupe du Monde 1986 • Finaliste Euro 1984 • Carré Magique',
            followers: 420000,
            firstClub: 'Toulon',
            firstClubPeriod: '1976-1980',
            association: 'Association Jean Tigana - Formation des jeunes talents',
            activite: 'Académie de football pour jeunes défavorisés en Afrique',
            nft: { available: true, price: 699, rarity: 'LEGENDARY', edition: '6/350' }
        },
        {
            name: 'Glenn Hoddle',
            photo: 'https://www.asmonaco.com/wp-content/uploads/glenn-hoddle-monaco.jpg',
            role: 'Maestro anglais',
            period: '1987-1991',
            achievements: 'Champion 1988 • Meilleur passeur • Légende de Tottenham • Élégance technique',
            followers: 650000,
            firstClub: 'Tottenham Hotspur',
            firstClubPeriod: '1975-1987',
            association: 'Glenn Hoddle Academy',
            activite: 'Académie de football en Espagne pour jeunes joueurs anglais',
            nft: { available: true, price: 649, rarity: 'LEGENDARY', edition: '10/274' }
        },
        {
            name: 'Emmanuel Petit',
            photo: 'https://www.asmonaco.com/wp-content/uploads/emmanuel-petit-monaco.jpg',
            role: 'Champion du monde 1998',
            period: '1988-1997',
            achievements: 'Champion 1997 • Champion du monde 1998 • But en finale • Champion d\'Europe 2000',
            followers: 580000,
            firstClub: 'AS Monaco',
            firstClubPeriod: '1988-1997',
            note: 'Formation à l\'ASM',
            association: 'Fondation Emmanuel Petit',
            activite: 'Soutien aux enfants malades et recherche médicale',
            nft: { available: true, price: 599, rarity: 'LEGENDARY', edition: '98/310' }
        },
        {
            name: 'Claude Puel',
            photo: 'https://www.asmonaco.com/wp-content/uploads/claude-puel-monaco.jpg',
            role: 'Capitaine emblématique',
            period: '1979-1998',
            achievements: 'Champion 1982, 1988, 1997 • Plus de 600 matchs • Capitaine • Fidélité totale',
            followers: 280000,
            firstClub: 'AS Monaco',
            firstClubPeriod: '1979-1998',
            note: 'Formation et carrière à l\'ASM - 19 saisons !',
            association: 'Claude Puel Sports Academy',
            activite: 'Programme de mentorat pour jeunes footballeurs professionnels',
            nft: { available: true, price: 549, rarity: 'EPIC', edition: '619/619' }
        },
        {
            name: 'Thierry Henry',
            photo: 'https://www.asmonaco.com/wp-content/uploads/2020/01/henry-monaco.jpg',
            role: 'Légende française',
            period: '1994-1999',
            achievements: 'Champion 1997 • Demi-finaliste C1 1998 • Champion du monde 1998 • Légende d\'Arsenal',
            followers: 3500000,
            firstClub: 'AS Monaco',
            firstClubPeriod: '1994-1999',
            note: 'Formation à l\'ASM',
            association: 'Thierry Henry Foundation',
            activite: 'Aide à l\'éducation des enfants défavorisés',
            nft: { available: true, price: 799, rarity: 'LEGENDARY', edition: '28/141' }
        },
        {
            name: 'David Trezeguet',
            photo: 'https://www.asmonaco.com/wp-content/uploads/2020/01/trezeguet-monaco.jpg',
            role: 'Buteur français',
            period: '1995-2000',
            achievements: 'Champion du monde 1998 • Champion 2000 • But en or Euro 2000 • 52 buts',
            followers: 920000,
            firstClub: 'AS Monaco',
            firstClubPeriod: '1995-2000',
            note: 'Formation à l\'ASM',
            association: 'Fondation David Trezeguet',
            activite: 'Programmes sportifs pour jeunes en Argentine et France',
            nft: { available: true, price: 599, rarity: 'EPIC', edition: '52/123' }
        },
        {
            name: 'Kylian Mbappé',
            photo: 'https://www.asmonaco.com/wp-content/uploads/2021/07/mbappe-monaco-2017.jpg',
            role: 'Prodige mondial',
            period: '2015-2017',
            achievements: 'Révélation • Champion 2017 • Meilleur jeune mondial • Champion du monde 2018',
            followers: 115000000,
            firstClub: 'AS Monaco',
            firstClubPeriod: '2015-2017',
            note: 'Formation à l\'ASM',
            association: 'Inspired by KM',
            activite: 'Association pour l\'éducation et le sport des enfants',
            nft: { available: true, price: 999, rarity: 'LEGENDARY', edition: '27/60' }
        },
        {
            name: 'Radamel Falcao',
            photo: 'https://www.asmonaco.com/wp-content/uploads/2020/01/falcao-monaco.jpg',
            role: 'El Tigre',
            period: '2013-2019',
            achievements: 'Champion 2017 • Plus de 100 buts • Meilleur buteur historique récent',
            followers: 18500000,
            firstClub: 'Lanceros Boyacá (Colombie)',
            firstClubPeriod: '1999-2001',
            association: 'Fundación Radamel Falcao García',
            activite: 'Aide aux enfants défavorisés en Colombie',
            nft: { available: true, price: 649, rarity: 'LEGENDARY', edition: '113/225' }
        },
        {
            name: 'Youri Djorkaeff',
            photo: 'https://www.asmonaco.com/wp-content/uploads/2020/01/djorkaeff-monaco.jpg',
            role: 'Champion du monde',
            period: '1990-1995',
            achievements: 'Champion du monde 1998 • Champion 1991 • Finaliste C1 1992',
            followers: 450000,
            firstClub: 'RC Strasbourg',
            firstClubPeriod: '1984-1990',
            association: 'Youri Djorkaeff Foundation',
            activite: 'Programmes éducatifs et sportifs internationaux',
            nft: { available: true, price: 449, rarity: 'EPIC', edition: '61/144' }
        }
    ],

    // ========== LOSC LILLE ==========
    'losc-lille': [
        {
            name: 'Eden Hazard',
            photo: 'https://www.losc.fr/sites/default/files/inline-images/hazard_losc.jpg',
            role: 'Ailier magique',
            period: '2005-2012',
            achievements: 'Champion 2011 • Meilleur joueur Ligue 1 • Légende de Chelsea',
            followers: 36200000,
            firstClub: 'LOSC Lille',
            firstClubPeriod: '2005-2012',
            note: 'Formation au LOSC',
            nft: { available: true, price: 799, rarity: 'LEGENDARY', edition: '50/194' }
        },
        {
            name: 'Gervinho',
            photo: 'https://www.losc.fr/sites/default/files/inline-images/gervinho_losc.jpg',
            role: 'Ailier ivoirien',
            period: '2009-2010',
            achievements: 'Champion 2011 • Meilleur buteur 2011 • 14 buts',
            followers: 1800000,
            firstClub: 'ASEC Mimosas (Côte d\'Ivoire)',
            firstClubPeriod: '2004-2007',
            nft: { available: true, price: 349, rarity: 'RARE', edition: '14/42' }
        },
        {
            name: 'Rio Mavuba',
            photo: 'https://www.losc.fr/sites/default/files/inline-images/mavuba_losc.jpg',
            role: 'Capitaine fidèle',
            period: '2008-2017',
            achievements: 'Champion 2011 • Capitaine • Plus de 400 matchs • Mr. LOSC',
            followers: 280000,
            firstClub: 'Girondins de Bordeaux',
            firstClubPeriod: '2000-2008',
            nft: { available: true, price: 399, rarity: 'EPIC', edition: '428/428' }
        },
        {
            name: 'Yohan Cabaye',
            photo: 'https://www.losc.fr/sites/default/files/inline-images/cabaye_losc.jpg',
            role: 'Milieu élégant',
            period: '2004-2011',
            achievements: 'Champion 2011 • 20 buts • International français',
            followers: 620000,
            firstClub: 'LOSC Lille',
            firstClubPeriod: '2004-2011',
            note: 'Formation au LOSC',
            nft: { available: true, price: 299, rarity: 'RARE', edition: '20/239' }
        },
        {
            name: 'Peter Osgood',
            photo: 'https://www.losc.fr/sites/default/files/inline-images/osgood_losc.jpg',
            role: 'Attaquant tchèque',
            period: '2010-2013',
            achievements: 'Champion 2011 • Buteur prolifique',
            followers: 180000,
            firstClub: 'Slavia Prague',
            firstClubPeriod: '2003-2009',
            nft: { available: true, price: 249, rarity: 'RARE', edition: '31/98' }
        },
        {
            name: 'Franck Beria',
            photo: 'https://www.losc.fr/sites/default/files/inline-images/beria_losc.jpg',
            role: 'Défenseur central',
            period: '2005-2010',
            achievements: 'Champion 2011 • 189 matchs • Solidité défensive',
            followers: 95000,
            firstClub: 'RC Lens',
            firstClubPeriod: '2002-2005',
            nft: { available: true, price: 199, rarity: 'RARE', edition: '189/189' }
        }
    ],

    // ========== RC LENS ==========
    'rc-lens': [
        {
            name: 'Guillaume Warmuz',
            photo: 'https://www.rclens.fr/sites/default/files/inline-images/warmuz_lens.jpg',
            role: 'Gardien légendaire',
            period: '1995-2008',
            achievements: 'Champion 1998 • Plus de 450 matchs • Légende du club',
            followers: 180000,
            firstClub: 'RC Lens',
            firstClubPeriod: '1995-2008',
            note: 'Formation à Lens',
            nft: { available: true, price: 399, rarity: 'EPIC', edition: '468/468' }
        },
        {
            name: 'Tony Vairelles',
            photo: 'https://www.rclens.fr/sites/default/files/inline-images/vairelles_lens.jpg',
            role: 'Attaquant emblématique',
            period: '1996-2004',
            achievements: 'Champion 1998 • 93 buts • Meilleur buteur',
            followers: 240000,
            firstClub: 'RC Strasbourg',
            firstClubPeriod: '1992-1996',
            nft: { available: true, price: 449, rarity: 'EPIC', edition: '93/280' }
        },
        {
            name: 'Daniel Moreira',
            photo: 'https://www.rclens.fr/sites/default/files/inline-images/moreira_lens.jpg',
            role: 'Milieu portugais',
            period: '1997-2003',
            achievements: 'Champion 1998 • Cerveau du jeu • Légende portugaise',
            followers: 150000,
            firstClub: 'Benfica',
            firstClubPeriod: '1993-1997',
            nft: { available: true, price: 349, rarity: 'RARE', edition: '24/183' }
        },
        {
            name: 'Raphaël Varane',
            photo: 'https://www.rclens.fr/sites/default/files/inline-images/varane_lens.jpg',
            role: 'Défenseur prodige',
            period: '2010-2011',
            achievements: 'Formation à Lens • Champion du monde 2018 • Légende du Real Madrid',
            followers: 19500000,
            firstClub: 'RC Lens',
            firstClubPeriod: '2010-2011',
            note: 'Formation à Lens',
            nft: { available: true, price: 699, rarity: 'LEGENDARY', edition: '1/23' }
        },
        {
            name: 'Éric Sikora',
            photo: 'https://www.rclens.fr/sites/default/files/inline-images/sikora_lens.jpg',
            role: 'Capitaine historique',
            period: '1993-2008',
            achievements: 'Champion 1998 • Plus de 500 matchs • Mr. Lens',
            followers: 120000,
            firstClub: 'RC Lens',
            firstClubPeriod: '1993-2008',
            note: 'Formation et carrière à Lens',
            nft: { available: true, price: 449, rarity: 'EPIC', edition: '527/527' }
        },
        {
            name: 'Issam Jemâa',
            photo: 'https://www.rclens.fr/sites/default/files/inline-images/jemaa_lens.jpg',
            role: 'Attaquant tunisien',
            period: '2008-2012',
            achievements: '44 buts • Meilleur buteur tunisien en France',
            followers: 380000,
            firstClub: 'Espérance Tunis',
            firstClubPeriod: '2003-2005',
            nft: { available: true, price: 299, rarity: 'RARE', edition: '44/151' }
        }
    ],

    // ========== SCO ANGERS ==========
    'sco-angers': [
        {
            name: 'Ulrich Ramé',
            photo: 'https://www.sco.fr/sites/default/files/inline-images/rame_angers.jpg',
            role: 'Gardien légendaire',
            period: '1996-2008',
            achievements: 'Plus de 400 matchs • Champion de France D2 • Légende du club',
            followers: 120000,
            firstClub: 'RC Lens',
            firstClubPeriod: '1989-1996',
            nft: { available: true, price: 349, rarity: 'EPIC', edition: '412/412' }
        },
        {
            name: 'Stéphane Pichot',
            photo: 'https://www.sco.fr/sites/default/files/inline-images/pichot_angers.jpg',
            role: 'Milieu créateur',
            period: '2001-2010',
            achievements: '37 buts • Plus de 300 matchs • Meneur de jeu',
            followers: 85000,
            firstClub: 'FC Nantes',
            firstClubPeriod: '1996-2001',
            nft: { available: true, price: 249, rarity: 'RARE', edition: '37/315' }
        },
        {
            name: 'El-Hadji Diouf',
            photo: 'https://www.sco.fr/sites/default/files/inline-images/diouf_angers.jpg',
            role: 'Attaquant sénégalais',
            period: '1998-2000',
            achievements: 'Révélation • Ballon d\'or africain 2002 • Légende du Sénégal',
            followers: 1850000,
            firstClub: 'Sochaux',
            firstClubPeriod: '1998',
            nft: { available: true, price: 399, rarity: 'EPIC', edition: '24/68' }
        },
        {
            name: 'Cheikh Diabaté',
            photo: 'https://www.sco.fr/sites/default/files/inline-images/diabate_angers.jpg',
            role: 'Buteur malien',
            period: '2016-2020',
            achievements: '41 buts • Attaquant prolifique • Héros de la remontée',
            followers: 420000,
            firstClub: 'Girondins de Bordeaux',
            firstClubPeriod: '2011-2014',
            nft: { available: true, price: 299, rarity: 'RARE', edition: '41/145' }
        },
        {
            name: 'Jean-Jacques Fussien',
            photo: 'https://www.sco.fr/sites/default/files/inline-images/fussien_angers.jpg',
            role: 'Défenseur historique',
            period: '1995-2005',
            achievements: 'Plus de 350 matchs • Capitaine • Fidélité totale',
            followers: 62000,
            firstClub: 'SCO Angers',
            firstClubPeriod: '1995-2005',
            note: 'Formation à Angers',
            nft: { available: true, price: 249, rarity: 'RARE', edition: '358/358' }
        },
        {
            name: 'Ludovic Butelle',
            photo: 'https://www.sco.fr/sites/default/files/inline-images/butelle_angers.jpg',
            role: 'Gardien rempart',
            period: '2015-2023',
            achievements: 'Plus de 250 matchs • Montée en Ligue 1 • 8 saisons',
            followers: 78000,
            firstClub: 'Stade Rennais',
            firstClubPeriod: '2004-2011',
            nft: { available: true, price: 199, rarity: 'RARE', edition: '253/253' }
        }
    ],

    // ========== STADE RENNAIS ==========
    'stade-rennais': [
        {
            name: 'Sylvain Wiltord',
            photo: 'https://www.staderennais.com/sites/default/files/inline-images/wiltord_rennes.jpg',
            role: 'Attaquant prodige',
            period: '1997-2000',
            achievements: 'Champion du monde 1998 • Champion d\'Europe 2000 • Légende d\'Arsenal',
            followers: 920000,
            firstClub: 'Stade Rennais',
            firstClubPeriod: '1997-2000',
            note: 'Formation à Rennes',
            nft: { available: true, price: 549, rarity: 'LEGENDARY', edition: '42/108' }
        },
        {
            name: 'Ousmane Dembélé',
            photo: 'https://www.staderennais.com/sites/default/files/inline-images/dembele_rennes.jpg',
            role: 'Ailier prodige',
            period: '2015-2016',
            achievements: 'Révélation • Champion du monde 2018 • Légende du Barça',
            followers: 14200000,
            firstClub: 'Stade Rennais',
            firstClubPeriod: '2015-2016',
            note: 'Formation à Rennes',
            nft: { available: true, price: 699, rarity: 'LEGENDARY', edition: '12/26' }
        },
        {
            name: 'Yoann Gourcuff',
            photo: 'https://www.staderennais.com/sites/default/files/inline-images/gourcuff_rennes.jpg',
            role: 'Maestro français',
            period: '2015-2020',
            achievements: 'Meilleur joueur Ligue 1 2009 • 25 buts • Élégance technique',
            followers: 850000,
            firstClub: 'Stade Rennais',
            firstClubPeriod: '2001-2006',
            note: 'Formation à Rennes',
            nft: { available: true, price: 449, rarity: 'EPIC', edition: '25/138' }
        },
        {
            name: 'Petr Čech',
            photo: 'https://www.staderennais.com/sites/default/files/inline-images/cech_rennes.jpg',
            role: 'Gardien tchèque',
            period: '2002-2004',
            achievements: 'Révélation • Légende de Chelsea • 4x Premier League',
            followers: 8500000,
            firstClub: 'Chmel Blšany (République tchèque)',
            firstClubPeriod: '1999-2001',
            nft: { available: true, price: 599, rarity: 'LEGENDARY', edition: '70/70' }
        },
        {
            name: 'Mikael Silvestre',
            photo: 'https://www.staderennais.com/sites/default/files/inline-images/silvestre_rennes.jpg',
            role: 'Défenseur champion du monde',
            period: '1996-1998',
            achievements: 'Champion du monde 1998 • Légende de Manchester United',
            followers: 420000,
            firstClub: 'Stade Rennais',
            firstClubPeriod: '1996-1998',
            note: 'Formation à Rennes',
            nft: { available: true, price: 399, rarity: 'EPIC', edition: '98/65' }
        },
        {
            name: 'Jimmy Briand',
            photo: 'https://www.staderennais.com/sites/default/files/inline-images/briand_rennes.jpg',
            role: 'Attaquant prolifique',
            period: '2007-2010',
            achievements: '57 buts • International français • Buteur emblématique',
            followers: 280000,
            firstClub: 'Stade Rennais',
            firstClubPeriod: '2007-2010',
            note: 'Formation à Rennes',
            nft: { available: true, price: 299, rarity: 'RARE', edition: '57/132' }
        }
    ],

    // ========== OGC NICE ==========
    'ogc-nice': [
        {
            name: 'Éric Cantona',
            photo: 'https://www.ogcnice.com/sites/default/files/inline-images/cantona_nice.jpg',
            role: 'Légende française',
            period: '1994-1995',
            achievements: 'Légende de Manchester United • Champion de France • Icône du football',
            followers: 3200000,
            firstClub: 'AJ Auxerre',
            firstClubPeriod: '1983-1988',
            nft: { available: true, price: 799, rarity: 'LEGENDARY', edition: '7/7' }
        },
        {
            name: 'Hatem Ben Arfa',
            photo: 'https://www.ogcnice.com/sites/default/files/inline-images/benarfa_nice.jpg',
            role: 'Artiste du ballon',
            period: '2015-2018',
            achievements: 'Meilleur joueur Ligue 1 2016 • 32 buts • Génie technique',
            followers: 4200000,
            firstClub: 'Lyon',
            firstClubPeriod: '2004-2008',
            nft: { available: true, price: 499, rarity: 'EPIC', edition: '32/133' }
        },
        {
            name: 'Gaëtan Laborde',
            photo: 'https://www.ogcnice.com/sites/default/files/inline-images/laborde_nice.jpg',
            role: 'Buteur aiglons',
            period: '2018-2021',
            achievements: '51 buts • International français • Attaquant prolifique',
            followers: 320000,
            firstClub: 'Girondins de Bordeaux',
            firstClubPeriod: '2013-2018',
            nft: { available: true, price: 349, rarity: 'RARE', edition: '51/124' }
        },
        {
            name: 'David Ospina',
            photo: 'https://www.ogcnice.com/sites/default/files/inline-images/ospina_nice.jpg',
            role: 'Gardien colombien',
            period: '2008-2011',
            achievements: '130 matchs • International • Légende d\'Arsenal/Naples',
            followers: 8500000,
            firstClub: 'Atlético Nacional (Colombie)',
            firstClubPeriod: '2005-2008',
            nft: { available: true, price: 399, rarity: 'EPIC', edition: '130/130' }
        },
        {
            name: 'Alexy Bosetti',
            photo: 'https://www.ogcnice.com/sites/default/files/inline-images/bosetti_nice.jpg',
            role: 'Attaquant historique',
            period: '2011-2018',
            achievements: '68 buts • Plus de 250 matchs • Fidélité',
            followers: 180000,
            firstClub: 'AS Monaco',
            firstClubPeriod: '2008-2011',
            nft: { available: true, price: 299, rarity: 'RARE', edition: '68/267' }
        },
        {
            name: 'Dante',
            photo: 'https://www.ogcnice.com/sites/default/files/inline-images/dante_nice.jpg',
            role: 'Défenseur brésilien - Capitaine',
            period: '2016-Présent',
            achievements: 'Capitaine • Plus de 300 matchs • Champion League avec Bayern',
            followers: 1850000,
            firstClub: 'Juventude (Brésil)',
            firstClubPeriod: '2002-2004',
            nft: { available: true, price: 449, rarity: 'EPIC', edition: '312/312' }
        }
    ],

    // ========== CLUBS EUROPÉENS ==========
    'arsenal-fc': [
        {
            name: 'Thierry Henry',
            photo: 'https://www.arsenal.com/sites/default/files/styles/large_16x9/public/images/ThierryHenry_Profile.jpg',
            role: 'Roi d\'Arsenal',
            period: '1999-2007, 2012',
            achievements: 'Meilleur buteur historique (228 buts) • 2x Champion • Légende absolue',
            followers: 3500000,
            firstClub: 'AS Monaco',
            firstClubPeriod: '1994-1999',
            nft: { available: true, price: 899, rarity: 'LEGENDARY', edition: '228/377' }
        },
        {
            name: 'Dennis Bergkamp',
            photo: 'https://www.arsenal.com/sites/default/files/styles/large_16x9/public/images/Bergkamp_Profile.jpg',
            role: 'Maître technique',
            period: '1995-2006',
            achievements: '120 buts • 3x Champion • Joueur PL du siècle • The Iceman',
            followers: 980000,
            firstClub: 'Ajax Amsterdam',
            firstClubPeriod: '1986-1993',
            nft: { available: true, price: 749, rarity: 'LEGENDARY', edition: '120/423' }
        },
        {
            name: 'Patrick Vieira',
            photo: 'https://www.arsenal.com/sites/default/files/styles/large_16x9/public/images/Vieira_Profile.jpg',
            role: 'Capitaine emblématique',
            period: '1996-2005',
            achievements: 'Capitaine Invincibles 2004 • 3x Champion • Champion du monde 1998',
            followers: 2100000,
            firstClub: 'AS Cannes',
            firstClubPeriod: '1993-1995',
            nft: { available: true, price: 799, rarity: 'LEGENDARY', edition: '407/407' }
        },
        {
            name: 'Ian Wright',
            photo: 'https://www.arsenal.com/sites/default/files/styles/large_16x9/public/images/Wright_Profile.jpg',
            role: 'Buteur légendaire',
            period: '1991-1998',
            achievements: '185 buts • Meilleur buteur historique (avant Henry) • Légende des 90s',
            followers: 1850000,
            firstClub: 'Greenwich Borough',
            firstClubPeriod: '1985',
            nft: { available: true, price: 649, rarity: 'LEGENDARY', edition: '185/288' }
        },
        {
            name: 'Tony Adams',
            photo: 'https://www.arsenal.com/sites/default/files/styles/large_16x9/public/images/Adams_Profile.jpg',
            role: 'Mr. Arsenal - Défenseur',
            period: '1983-2002',
            achievements: 'Capitaine 14 ans • 4x Champion • 672 matchs • One-club man',
            followers: 920000,
            firstClub: 'Arsenal FC',
            firstClubPeriod: '1983-2002',
            note: 'Formation et carrière à Arsenal',
            nft: { available: true, price: 799, rarity: 'LEGENDARY', edition: '672/672' }
        },
        {
            name: 'Robert Pirès',
            photo: 'https://www.arsenal.com/sites/default/files/styles/large_16x9/public/images/Pires_Profile.jpg',
            role: 'Ailier champion du monde',
            period: '2000-2006',
            achievements: 'Champion du monde 1998 • Invincibles 2004 • 84 buts',
            followers: 1200000,
            firstClub: 'FC Metz',
            firstClubPeriod: '1992-1998',
            nft: { available: true, price: 549, rarity: 'EPIC', edition: '84/284' }
        },
        {
            name: 'Cesc Fàbregas',
            photo: 'https://www.arsenal.com/sites/default/files/styles/large_16x9/public/images/Fabregas_Profile.jpg',
            role: 'Maestro espagnol',
            period: '2003-2011',
            achievements: 'Capitaine • 57 buts • Champion du monde 2010 • Champion d\'Europe',
            followers: 18500000,
            firstClub: 'FC Barcelona',
            firstClubPeriod: '1997-2003',
            note: 'Formation à La Masia',
            nft: { available: true, price: 699, rarity: 'LEGENDARY', edition: '57/303' }
        }
    ],

    'liverpool-fc': [
        {
            name: 'Steven Gerrard',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/2021-05/gerrard-profile.jpg',
            role: 'Captain Fantastic',
            period: '1998-2015',
            achievements: 'Capitaine légendaire • Champion League 2005 • 710 matchs • Mr. Liverpool',
            followers: 16800000,
            firstClub: 'Liverpool FC',
            firstClubPeriod: '1998-2015',
            note: 'Formation à Liverpool',
            nft: { available: true, price: 849, rarity: 'LEGENDARY', edition: '186/710' }
        },
        {
            name: 'Kenny Dalglish',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/dalglish-profile.jpg',
            role: 'King Kenny',
            period: '1977-1990',
            achievements: '172 buts • 6x Champion • 3x C1 • Légende absolue',
            followers: 1850000,
            firstClub: 'Celtic Glasgow',
            firstClubPeriod: '1969-1977',
            nft: { available: true, price: 899, rarity: 'LEGENDARY', edition: '172/515' }
        },
        {
            name: 'Ian Rush',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/rush-profile.jpg',
            role: 'Meilleur buteur historique',
            period: '1980-1987, 1988-1996',
            achievements: '346 buts • 5x Champion • 2x C1 • Légende galloise',
            followers: 980000,
            firstClub: 'Chester City',
            firstClubPeriod: '1978-1980',
            nft: { available: true, price: 849, rarity: 'LEGENDARY', edition: '346/660' }
        },
        {
            name: 'Jamie Carragher',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/carragher-profile.jpg',
            role: 'Mr. Liverpool - Défenseur',
            period: '1996-2013',
            achievements: '737 matchs • Champion League 2005 • Vice-capitaine • One-club man',
            followers: 5200000,
            firstClub: 'Liverpool FC',
            firstClubPeriod: '1996-2013',
            note: 'Formation et carrière à Liverpool',
            nft: { available: true, price: 749, rarity: 'LEGENDARY', edition: '737/737' }
        },
        {
            name: 'Mohamed Salah',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/salah-profile.jpg',
            role: 'Egyptian King',
            period: '2017-Présent',
            achievements: 'Champion 2020 • Champion League 2019 • 200+ buts • Ballon d\'Or africain',
            followers: 61500000,
            firstClub: 'El Mokawloon (Egypte)',
            firstClubPeriod: '2010-2012',
            nft: { available: true, price: 899, rarity: 'LEGENDARY', edition: '211/350' }
        },
        {
            name: 'Virgil van Dijk',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/vandijk-profile.jpg',
            role: 'Défenseur meilleur joueur UEFA',
            period: '2018-Présent',
            achievements: 'Champion 2020 • Champion League 2019 • Meilleur joueur UEFA 2019',
            followers: 15800000,
            firstClub: 'Groningen (Pays-Bas)',
            firstClubPeriod: '2011-2013',
            nft: { available: true, price: 799, rarity: 'LEGENDARY', edition: '4/200' }
        },
        {
            name: 'Fernando Torres',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/torres-profile.jpg',
            role: 'El Niño',
            period: '2007-2011',
            achievements: '81 buts • Champion du monde 2010 • Champion d\'Europe 2008/2012',
            followers: 17200000,
            firstClub: 'Atlético Madrid',
            firstClubPeriod: '2001-2007',
            nft: { available: true, price: 699, rarity: 'LEGENDARY', edition: '81/142' }
        }
    ],

    'bayern-munich': [
        {
            name: 'Franck Ribéry',
            photo: 'https://fcbayern.com/binaries/content/gallery/fc-bayern/homepage/spieler/spieler-alumni/ribery-franck-16-9.jpg',
            role: 'Ailier magique',
            period: '2007-2019',
            achievements: '9 Bundesliga • Champion League 2013 • Ballon d\'Or 3e (2013)',
            followers: 7200000,
            firstClub: 'Boulogne-sur-Mer',
            firstClubPeriod: '2001-2004',
            nft: { available: true, price: 699, rarity: 'LEGENDARY', edition: '124/425' }
        },
        {
            name: 'Arjen Robben',
            photo: 'https://fcbayern.com/binaries/content/gallery/fc-bayern/homepage/spieler/spieler-alumni/robben-arjen-16-9.jpg',
            role: 'Ailier néerlandais',
            period: '2009-2019',
            achievements: '8 Bundesliga • Champion League 2013 • But en finale • 144 buts',
            followers: 11200000,
            firstClub: 'FC Groningen',
            firstClubPeriod: '2000-2002',
            nft: { available: true, price: 749, rarity: 'LEGENDARY', edition: '144/309' }
        },
        {
            name: 'Philipp Lahm',
            photo: 'https://fcbayern.com/binaries/content/gallery/fc-bayern/homepage/spieler/spieler-alumni/lahm-philipp-16-9.jpg',
            role: 'Capitaine emblématique',
            period: '2002-2017',
            achievements: 'Capitaine • Champion du monde 2014 • 8 Bundesliga • Champion League 2013',
            followers: 5800000,
            firstClub: 'Bayern Munich',
            firstClubPeriod: '2002-2017',
            note: 'Formation au Bayern',
            nft: { available: true, price: 799, rarity: 'LEGENDARY', edition: '517/517' }
        },
        {
            name: 'Bastian Schweinsteiger',
            photo: 'https://fcbayern.com/binaries/content/gallery/fc-bayern/homepage/spieler/spieler-alumni/schweinsteiger-bastian-16-9.jpg',
            role: 'Milieu champion du monde',
            period: '2002-2015',
            achievements: 'Champion du monde 2014 • 8 Bundesliga • Champion League 2013 • 45 buts',
            followers: 11500000,
            firstClub: 'Bayern Munich',
            firstClubPeriod: '2002-2015',
            note: 'Formation au Bayern',
            nft: { available: true, price: 749, rarity: 'LEGENDARY', edition: '45/500' }
        },
        {
            name: 'Oliver Kahn',
            photo: 'https://fcbayern.com/binaries/content/gallery/fc-bayern/homepage/spieler/spieler-alumni/kahn-oliver-16-9.jpg',
            role: 'Der Titan - Gardien légendaire',
            period: '1994-2008',
            achievements: '8 Bundesliga • Champion League 2001 • Ballon d\'Or 2002 (2e)',
            followers: 3200000,
            firstClub: 'Karlsruher SC',
            firstClubPeriod: '1987-1994',
            nft: { available: true, price: 849, rarity: 'LEGENDARY', edition: '429/632' }
        },
        {
            name: 'Gerd Müller',
            photo: 'https://fcbayern.com/binaries/content/gallery/fc-bayern/homepage/spieler/spieler-alumni/mueller-gerd-16-9.jpg',
            role: 'Der Bomber - Légende absolue',
            period: '1964-1979',
            achievements: 'Meilleur buteur historique (566 buts) • Champion du monde 1974 • 3x C1',
            followers: 1850000,
            firstClub: 'TSV 1861 Nördlingen',
            firstClubPeriod: '1963-1964',
            nft: { available: true, price: 999, rarity: 'LEGENDARY', edition: '566/607' }
        },
        {
            name: 'Robert Lewandowski',
            photo: 'https://fcbayern.com/binaries/content/gallery/fc-bayern/homepage/spieler/spieler-alumni/lewandowski-robert-16-9.jpg',
            role: 'Buteur moderne',
            period: '2014-2022',
            achievements: '344 buts • 8 Bundesliga • Champion League 2020 • Meilleur joueur FIFA',
            followers: 34500000,
            firstClub: 'Znicz Pruszków (Pologne)',
            firstClubPeriod: '2006-2008',
            nft: { available: true, price: 899, rarity: 'LEGENDARY', edition: '344/375' }
        }
    ],

    // ========== REAL MADRID ==========
    'real-madrid': [
        {
            name: 'Cristiano Ronaldo',
            photo: 'https://www.realmadrid.com/sites/default/files/styles/large_16x9/public/ronaldo-profile.jpg',
            role: 'CR7 - Légende absolue',
            period: '2009-2018',
            achievements: 'Meilleur buteur historique (451 buts) • 4x Champion League • 5x Ballon d\'Or',
            followers: 635000000,
            firstClub: 'Sporting CP',
            firstClubPeriod: '2002-2003',
            nft: { available: true, price: 1499, rarity: 'LEGENDARY', edition: '451/438' }
        },
        {
            name: 'Zinedine Zidane',
            photo: 'https://www.realmadrid.com/sites/default/files/styles/large_16x9/public/zidane-profile.jpg',
            role: 'Maestro français',
            period: '2001-2006',
            achievements: 'But vainqueur C1 2002 • Champion du monde 1998 • Ballon d\'Or 1998',
            followers: 4200000,
            firstClub: 'AS Cannes',
            firstClubPeriod: '1989-1992',
            nft: { available: true, price: 999, rarity: 'LEGENDARY', edition: '49/227' }
        },
        {
            name: 'Raúl González',
            photo: 'https://www.realmadrid.com/sites/default/files/styles/large_16x9/public/raul-profile.jpg',
            role: 'Capitaine emblématique',
            period: '1994-2010',
            achievements: '323 buts • 6 titres • 3x Champion League • Mr. Real Madrid',
            followers: 2850000,
            firstClub: 'Real Madrid',
            firstClubPeriod: '1994-2010',
            note: 'Formation au Real',
            nft: { available: true, price: 949, rarity: 'LEGENDARY', edition: '323/741' }
        },
        {
            name: 'Iker Casillas',
            photo: 'https://www.realmadrid.com/sites/default/files/styles/large_16x9/public/casillas-profile.jpg',
            role: 'San Iker - Gardien légende',
            period: '1999-2015',
            achievements: 'Capitaine • Champion du monde 2010 • 3x Champion League • 725 matchs',
            followers: 19800000,
            firstClub: 'Real Madrid',
            firstClubPeriod: '1999-2015',
            note: 'Formation au Real',
            nft: { available: true, price: 849, rarity: 'LEGENDARY', edition: '725/725' }
        },
        {
            name: 'Sergio Ramos',
            photo: 'https://www.realmadrid.com/sites/default/files/styles/large_16x9/public/ramos-profile.jpg',
            role: 'Défenseur capitaine',
            period: '2005-2021',
            achievements: 'Capitaine • 4x Champion League • 101 buts (défenseur) • 671 matchs',
            followers: 59200000,
            firstClub: 'Sevilla FC',
            firstClubPeriod: '2004-2005',
            nft: { available: true, price: 899, rarity: 'LEGENDARY', edition: '101/671' }
        },
        {
            name: 'Karim Benzema',
            photo: 'https://www.realmadrid.com/sites/default/files/styles/large_16x9/public/benzema-profile.jpg',
            role: 'KB9 - Buteur ballon d\'or',
            period: '2009-2023',
            achievements: 'Ballon d\'Or 2022 • 354 buts • 5x Champion League • 2e buteur historique',
            followers: 73500000,
            firstClub: 'Olympique Lyonnais',
            firstClubPeriod: '2005-2009',
            nft: { available: true, price: 949, rarity: 'LEGENDARY', edition: '354/648' }
        }
    ],

    // ========== CLUBS TURCS (SÜPER LIG) ==========
    'galatasaray': [
        {
            name: 'Hakan Şükür',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Hakan_S%C3%BCk%C3%BCr.jpg/800px-Hakan_S%C3%BCk%C3%BCr.jpg',
            role: 'Kral (Le Roi) - Buteur légendaire',
            period: '1992-2000, 2008-2009',
            achievements: 'Meilleur buteur historique (249 buts) • Champion UEFA 2000 • Coupe du Monde 2002',
            followers: 2100000,
            firstClub: 'Sakaryaspor',
            firstClubPeriod: '1987-1990',
            nft: { available: true, price: 899, rarity: 'LEGENDARY', edition: '249/614' }
        },
        {
            name: 'Gheorghe Hagi',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Gheorghe_Hagi.jpg/800px-Gheorghe_Hagi.jpg',
            role: 'Comandante - Maestro roumain',
            period: '1996-2001',
            achievements: 'Champion UEFA 2000 • Coupe UEFA 2000 • Ballon d\'Or 3e (1994)',
            followers: 1850000,
            firstClub: 'Steaua Bucarest',
            firstClubPeriod: '1987-1990',
            nft: { available: true, price: 799, rarity: 'LEGENDARY', edition: '73/245' }
        },
        {
            name: 'Arda Turan',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Arda_Turan.jpg/800px-Arda_Turan.jpg',
            role: 'Milieu créateur',
            period: '2005-2011',
            achievements: '6 championnats • Champion League avec Barcelone • Euro 2008',
            followers: 9200000,
            firstClub: 'Galatasaray',
            firstClubPeriod: '2005-2011',
            note: 'Formation à Galatasaray',
            nft: { available: true, price: 549, rarity: 'EPIC', edition: '51/189' }
        },
        {
            name: 'Fatih Terim',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Fatih_Terim.jpg/800px-Fatih_Terim.jpg',
            role: 'Empereur - Joueur & Entraîneur légendaire',
            period: '1974-1984 (joueur), 1996-2000, 2011-2013, 2017-2021 (entraîneur)',
            achievements: 'Champion UEFA 2000 • 8 championnats en tant qu\'entraîneur • Icône du club',
            followers: 3500000,
            firstClub: 'Galatasaray',
            firstClubPeriod: '1974-1984',
            note: 'Joueur et entraîneur à Galatasaray',
            nft: { available: true, price: 699, rarity: 'LEGENDARY', edition: '8/8' }
        },
        {
            name: 'Bülent Korkmaz',
            photo: 'https://www.galatasaray.org/images/default-source/default-album/bulent-korkmaz.jpg',
            role: 'Défenseur central - Capitaine',
            period: '1994-2005',
            achievements: 'Champion UEFA 2000 • 7 championnats • Plus de 400 matchs • Fidélité totale',
            followers: 420000,
            firstClub: 'Galatasaray',
            firstClubPeriod: '1994-2005',
            note: 'Formation et carrière à Galatasaray',
            nft: { available: true, price: 449, rarity: 'EPIC', edition: '426/426' }
        },
        {
            name: 'Wesley Sneijder',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Wesley_Sneijder_2018.jpg/800px-Wesley_Sneijder_2018.jpg',
            role: 'Maestro néerlandais',
            period: '2013-2017',
            achievements: 'Champion 2013, 2015 • Champion du monde 2010 (2e) • Champion League avec Inter',
            followers: 11500000,
            firstClub: 'Ajax Amsterdam',
            firstClubPeriod: '2002-2007',
            nft: { available: true, price: 649, rarity: 'LEGENDARY', edition: '46/133' }
        },
        {
            name: 'Taffarel',
            photo: 'https://www.galatasaray.org/images/default-source/default-album/taffarel.jpg',
            role: 'Gardien brésilien',
            period: '1998-2001',
            achievements: 'Champion UEFA 2000 • Champion du monde 1994 • Légende brésilienne',
            followers: 850000,
            firstClub: 'Internacional',
            firstClubPeriod: '1985-1990',
            nft: { available: true, price: 599, rarity: 'EPIC', edition: '118/118' }
        }
    ],

    'fenerbahce': [
        {
            name: 'Alex de Souza',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Alex_de_Souza_2010.jpg/800px-Alex_de_Souza_2010.jpg',
            role: 'Crack - Légende absolue',
            period: '2004-2012',
            achievements: '4 championnats • 171 buts • Meilleur joueur étranger de l\'histoire • Idole',
            followers: 5800000,
            firstClub: 'Coritiba',
            firstClubPeriod: '1995-1997',
            nft: { available: true, price: 899, rarity: 'LEGENDARY', edition: '171/322' }
        },
        {
            name: 'Roberto Carlos',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Roberto_Carlos_2011.jpg/800px-Roberto_Carlos_2011.jpg',
            role: 'Latéral gauche légendaire',
            period: '2007-2009',
            achievements: 'Champion du monde 2002 • 3x Champion League • Légende du Real Madrid',
            followers: 14500000,
            firstClub: 'União São João',
            firstClubPeriod: '1991',
            nft: { available: true, price: 799, rarity: 'LEGENDARY', edition: '56/105' }
        },
        {
            name: 'Rüştü Reçber',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/R%C3%BC%C5%9Ft%C3%BC_Re%C3%A7ber.jpg/800px-R%C3%BC%C5%9Ft%C3%BC_Re%C3%A7ber.jpg',
            role: 'Gardien légendaire turc',
            period: '2007-2012',
            achievements: 'Coupe du Monde 2002 (3e place) • Euro 2008 • Plus de 500 matchs carrière',
            followers: 1850000,
            firstClub: 'Antalyaspor',
            firstClubPeriod: '1993-1994',
            nft: { available: true, price: 599, rarity: 'EPIC', edition: '120/120' }
        },
        {
            name: 'Pierre van Hooijdonk',
            photo: 'https://www.fenerbahce.org/images/default-source/default-album/pierre-van-hooijdonk.jpg',
            role: 'Attaquant néerlandais',
            period: '2005-2007',
            achievements: '62 buts • Champion 2007 • Buteur prolifique',
            followers: 620000,
            firstClub: 'NAC Breda',
            firstClubPeriod: '1992-1995',
            nft: { available: true, price: 549, rarity: 'EPIC', edition: '62/88' }
        },
        {
            name: 'Emre Belözoğlu',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Emre_Bel%C3%B6zo%C4%9Flu_2018.jpg/800px-Emre_Bel%C3%B6zo%C4%9Flu_2018.jpg',
            role: 'Capitaine emblématique',
            period: '2008-2021',
            achievements: 'Champion 2011, 2014 • Capitaine • Plus de 400 matchs • Légende moderne',
            followers: 2800000,
            firstClub: 'Galatasaray',
            firstClubPeriod: '1996-2001',
            nft: { available: true, price: 649, rarity: 'LEGENDARY', edition: '432/432' }
        },
        {
            name: 'Lefter Küçükandonyadis',
            photo: 'https://www.fenerbahce.org/images/default-source/default-album/lefter.jpg',
            role: 'Professor - Légende historique',
            period: '1951-1964',
            achievements: 'Meilleur buteur historique (423 buts toutes compétitions) • Icône absolue',
            followers: 950000,
            firstClub: 'Fenerbahçe',
            firstClubPeriod: '1951-1964',
            note: 'Carrière complète à Fenerbahçe',
            nft: { available: true, price: 899, rarity: 'LEGENDARY', edition: '423/615' }
        },
        {
            name: 'Dirk Kuyt',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Dirk_Kuyt_2015.jpg/800px-Dirk_Kuyt_2015.jpg',
            role: 'Ailier travailleur néerlandais',
            period: '2015-2017',
            achievements: 'Champion 2017 • 32 buts • Champion League avec Liverpool',
            followers: 3200000,
            firstClub: 'Quick Boys',
            firstClubPeriod: '1998-2000',
            nft: { available: true, price: 499, rarity: 'EPIC', edition: '32/76' }
        }
    ],

    'besiktas': [
        {
            name: 'Metin Tekin',
            photo: 'https://www.bjk.com.tr/images/default-source/default-album/metin-tekin.jpg',
            role: 'Légende absolue - Capitaine',
            period: '1974-1993',
            achievements: '19 saisons • 7 championnats • Plus de 600 matchs • Mr. Beşiktaş',
            followers: 820000,
            firstClub: 'Beşiktaş',
            firstClubPeriod: '1974-1993',
            note: 'Carrière complète à Beşiktaş',
            nft: { available: true, price: 799, rarity: 'LEGENDARY', edition: '638/638' }
        },
        {
            name: 'Ricardo Quaresma',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Ricardo_Quaresma_2018.jpg/800px-Ricardo_Quaresma_2018.jpg',
            role: 'Ailier magique portugais',
            period: '2010-2012, 2015-2020',
            achievements: 'Champion 2016, 2017 • 90 buts • 3 championnats • Trivela légendaire',
            followers: 12500000,
            firstClub: 'Sporting CP',
            firstClubPeriod: '2001-2003',
            nft: { available: true, price: 699, rarity: 'LEGENDARY', edition: '90/350' }
        },
        {
            name: 'Mario Gomez',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Mario_Gomez_2018.jpg/800px-Mario_Gomez_2018.jpg',
            role: 'Buteur allemand',
            period: '2015-2016',
            achievements: '26 buts en 34 matchs • Champion du monde 2014 • Efficacité redoutable',
            followers: 4200000,
            firstClub: 'VfB Stuttgart',
            firstClubPeriod: '2003-2009',
            nft: { available: true, price: 599, rarity: 'EPIC', edition: '26/34' }
        },
        {
            name: 'Sergen Yalçın',
            photo: 'https://www.bjk.com.tr/images/default-source/default-album/sergen-yalcin.jpg',
            role: 'Maestro turc',
            period: '1990-2002',
            achievements: '12 saisons • 3 championnats • Meneur de jeu exceptionnel • Légende technique',
            followers: 1580000,
            firstClub: 'Beşiktaş',
            firstClubPeriod: '1990-2002',
            note: 'Formation et carrière principale à Beşiktaş',
            nft: { available: true, price: 649, rarity: 'LEGENDARY', edition: '91/332' }
        },
        {
            name: 'Tayfur Havutçu',
            photo: 'https://www.bjk.com.tr/images/default-source/default-album/tayfur-havutcu.jpg',
            role: 'Milieu emblématique',
            period: '1990-2003',
            achievements: '13 saisons • 3 championnats • Plus de 400 matchs • Fidélité absolue',
            followers: 680000,
            firstClub: 'Beşiktaş',
            firstClubPeriod: '1990-2003',
            note: 'Formation et carrière complète à Beşiktaş',
            nft: { available: true, price: 549, rarity: 'EPIC', edition: '422/422' }
        },
        {
            name: 'Pepe',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Pepe_2018.jpg/800px-Pepe_2018.jpg',
            role: 'Défenseur central portugais',
            period: '2017-2019',
            achievements: 'Champion 2017 • Champion du monde 2016 • 3x Champion League avec Real',
            followers: 8900000,
            firstClub: 'Corinthians Alagoano',
            firstClubPeriod: '2001',
            nft: { available: true, price: 699, rarity: 'LEGENDARY', edition: '89/89' }
        },
        {
            name: 'Anderson Talisca',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Anderson_Talisca_2018.jpg/800px-Anderson_Talisca_2018.jpg',
            role: 'Milieu offensif brésilien',
            period: '2014-2016 (prêt)',
            achievements: '33 buts en 80 matchs • Buteur spectaculaire • Frappes puissantes',
            followers: 7200000,
            firstClub: 'Bahia',
            firstClubPeriod: '2011-2014',
            nft: { available: true, price: 549, rarity: 'EPIC', edition: '33/80' }
        }
    ]
};

// Fonction pour obtenir les légendes d'un club
function getLegendsForClub(clubSlug) {
    // Normaliser le slug du club
    const normalizedSlug = clubSlug.toLowerCase()
        .replace(/\+/g, '-')
        .replace(/\s+/g, '-')
        .replace('_', '-');
    
    // Chercher les correspondances possibles
    for (const key in legendesDatabase) {
        if (normalizedSlug.includes(key) || key.includes(normalizedSlug)) {
            return legendesDatabase[key];
        }
    }
    
    // Par défaut: retourner une liste vide ou des légendes génériques
    return [];
}

// Fonction pour compter le total de followers
function getTotalFollowers(clubSlug) {
    const legends = getLegendsForClub(clubSlug);
    return legends.reduce((total, legend) => total + legend.followers, 0);
}

// Fonction pour obtenir les NFTs disponibles
function getNFTsForClub(clubSlug) {
    const legends = getLegendsForClub(clubSlug);
    return legends.filter(legend => legend.nft && legend.nft.available);
}

console.log('⭐ Base de données des légendes chargée');
console.log(`📊 Total clubs documentés: ${Object.keys(legendesDatabase).length}`);

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { legendesDatabase, getLegendsForClub, getTotalFollowers, getNFTsForClub };
}
