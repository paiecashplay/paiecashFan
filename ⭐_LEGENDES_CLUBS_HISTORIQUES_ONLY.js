// ⭐ BASE DE DONNÉES DES LÉGENDES HISTORIQUES - JOUEURS RETRAITÉS UNIQUEMENT
// CRITÈRE : Joueurs retraités OU ayant quitté le club avant 2020
// PAS de joueurs actuellement en activité (2024-2025)

const legendesHistoriques = {
    // ========== OLYMPIQUE DE MARSEILLE ==========
    'olympique-de-marseille': [
        {
            name: 'Basile Boli',
            photo: 'https://cdn.resfu.com/media/img/news/boli--om-3--om.fr.jpg',
            role: 'Défenseur légendaire',
            period: '1990-1994',
            achievements: 'But de la tête en finale C1 1993 contre AC Milan • Champion d\'Europe • Champion de France',
            followers: 850000,
            retired: true,
            retirementYear: 1998,
            nft: { available: true, price: 499, rarity: 'LEGENDARY', edition: '100/1993' }
        },
        {
            name: 'Didier Drogba',
            photo: 'https://img.chelseafc.com/image/upload/f_auto,q_auto:best,w_1440/editorial/people/mens-players/2004-05/Didier_Drogba_Profile.jpg',
            role: 'Attaquant prodige',
            period: '2003-2004',
            achievements: '32 buts en 55 matchs • Meilleur buteur Ligue 1 • Légende Chelsea',
            followers: 15200000,
            retired: true,
            retirementYear: 2018,
            nft: { available: true, price: 599, rarity: 'LEGENDARY', edition: '32/55' }
        },
        {
            name: 'Jean-Pierre Papin',
            photo: 'https://www.om.fr/sites/default/files/inline-images/papin_om.jpg',
            role: 'JPP - Buteur légendaire',
            period: '1986-1992',
            achievements: 'Ballon d\'Or 1991 • 5x meilleur buteur D1 • 182 buts • Légende absolue',
            followers: 1250000,
            retired: true,
            retirementYear: 1996,
            nft: { available: true, price: 899, rarity: 'LEGENDARY', edition: '182/278' }
        },
        {
            name: 'Abedi Pelé',
            photo: 'https://en.africatopsports.com/wp-content/uploads/2020/03/abedi-pele-marseille.jpg',
            role: 'Roi d\'Afrique',
            period: '1987-1993',
            achievements: 'Légende africaine • Ballon d\'or africain 3x • Champion de France • Champion d\'Europe',
            followers: 2100000,
            retired: true,
            retirementYear: 2000,
            nft: { available: true, price: 549, rarity: 'LEGENDARY', edition: '3/147' }
        },
        {
            name: 'Chris Waddle',
            photo: 'https://www.om.fr/sites/default/files/inline-images/waddle_om.jpg',
            role: 'Ailier anglais magique',
            period: '1989-1992',
            achievements: 'Champion 1989, 1990, 1991 • Finaliste Coupe du Monde 1990 • 59 buts',
            followers: 620000,
            retired: true,
            retirementYear: 1998,
            nft: { available: true, price: 449, rarity: 'EPIC', edition: '59/141' }
        },
        {
            name: 'Éric Di Meco',
            photo: 'https://www.om.fr/sites/default/files/inline-images/dimeco_om.jpg',
            role: 'Latéral gauche - One-club man',
            period: '1986-1999',
            achievements: 'Champion d\'Europe 1993 • 488 matchs • Fidélité totale • Formé au club',
            followers: 450000,
            retired: true,
            retirementYear: 1999,
            nft: { available: true, price: 399, rarity: 'EPIC', edition: '488/488' }
        },
        {
            name: 'Marcel Desailly',
            photo: 'https://www.om.fr/sites/default/files/inline-images/desailly_om.jpg',
            role: 'Défenseur central - Le Roc',
            period: '1992-1993',
            achievements: 'Champion d\'Europe 1993 • Champion du monde 1998 • 2x Champion League',
            followers: 1480000,
            retired: true,
            retirementYear: 2006,
            nft: { available: true, price: 649, rarity: 'LEGENDARY', edition: '48/48' }
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
            retired: true,
            retirementYear: 2018,
            nft: { available: true, price: 899, rarity: 'LEGENDARY', edition: '10/25' }
        },
        {
            name: 'Zlatan Ibrahimović',
            photo: 'https://www.psg.fr/media/131847/zlatan-ibrahimovic.jpg',
            role: 'Attaquant légendaire',
            period: '2012-2016',
            achievements: '156 buts en 180 matchs • Meilleur buteur de l\'histoire du PSG • 4x Champion de France',
            followers: 58200000,
            retired: true,
            retirementYear: 2023,
            nft: { available: true, price: 799, rarity: 'LEGENDARY', edition: '156/180' }
        },
        {
            name: 'Thiago Silva',
            photo: 'https://www.psg.fr/media/127842/thiago-silva-psg.jpg',
            role: 'Défenseur central - O Monstro',
            period: '2012-2020',
            achievements: 'Capitaine • 8 saisons • 7 titres de champion • Leader défensif',
            followers: 11500000,
            retired: false,
            note: 'A quitté le PSG en 2020 (joue encore à 40 ans)',
            nft: { available: true, price: 599, rarity: 'LEGENDARY', edition: '315/373' }
        },
        {
            name: 'Pauleta',
            photo: 'https://www.psg.fr/media/18965/pauleta-psg.jpg',
            role: 'Buteur historique',
            period: '2003-2008',
            achievements: '109 buts • Meilleur buteur historique pendant 7 ans • Légende portugaise',
            followers: 890000,
            retired: true,
            retirementYear: 2008,
            nft: { available: true, price: 449, rarity: 'EPIC', edition: '109/211' }
        },
        {
            name: 'Rai',
            photo: 'https://www.psg.fr/media/19121/rai-psg.jpg',
            role: 'Milieu créateur',
            period: '1993-1998',
            achievements: 'Capitaine • Champion de France 1994 • Coupe d\'Europe des vainqueurs de coupe',
            followers: 520000,
            retired: true,
            retirementYear: 1998,
            nft: { available: true, price: 399, rarity: 'EPIC', edition: '72/215' }
        },
        {
            name: 'George Weah',
            photo: 'https://www.psg.fr/media/19298/george-weah-psg.jpg',
            role: 'Ballon d\'Or 1995',
            period: '1992-1995',
            achievements: 'Seul Ballon d\'Or africain • Champion de France 1994 • 55 buts',
            followers: 3200000,
            retired: true,
            retirementYear: 2003,
            nft: { available: true, price: 799, rarity: 'LEGENDARY', edition: '1/1995' }
        },
        {
            name: 'David Ginola',
            photo: 'https://www.psg.fr/media/ginola-psg.jpg',
            role: 'Ailier élégant',
            period: '1992-1995',
            achievements: 'Champion 1994 • Coupe des Coupes 1996 • Élu meilleur joueur PL',
            followers: 850000,
            retired: true,
            retirementYear: 2002,
            nft: { available: true, price: 449, rarity: 'EPIC', edition: '30/108' }
        }
    ],

    // ========== MANCHESTER CITY ==========
    'manchester-city': [
        {
            name: 'Sergio Agüero',
            photo: 'https://www.mancity.com/sites/default/files/styles/player_header/public/2021-05/aguero-header.jpg',
            role: 'Kun - Buteur légendaire',
            period: '2011-2021',
            achievements: 'Meilleur buteur historique (260 buts) • But du titre 93:20 • 5x Champion',
            followers: 28500000,
            retired: true,
            retirementYear: 2021,
            nft: { available: true, price: 949, rarity: 'LEGENDARY', edition: '260/390' }
        },
        {
            name: 'Vincent Kompany',
            photo: 'https://www.mancity.com/sites/default/files/styles/player_header/public/2019-05/kompany-header.jpg',
            role: 'Capitaine emblématique',
            period: '2008-2019',
            achievements: 'Capitaine • 4x Champion • 11 saisons • Défenseur légendaire',
            followers: 7200000,
            retired: true,
            retirementYear: 2020,
            nft: { available: true, price: 799, rarity: 'LEGENDARY', edition: '360/360' }
        },
        {
            name: 'David Silva',
            photo: 'https://www.mancity.com/sites/default/files/styles/player_header/public/2020-07/silva-header.jpg',
            role: 'El Mago - Maestro espagnol',
            period: '2010-2020',
            achievements: '10 saisons • 4x Champion • Champion du monde 2010 • 77 buts',
            followers: 13500000,
            retired: false,
            note: 'A quitté City en 2020',
            nft: { available: true, price: 849, rarity: 'LEGENDARY', edition: '436/436' }
        },
        {
            name: 'Yaya Touré',
            photo: 'https://www.mancity.com/sites/default/files/styles/player_header/public/2018-05/toure-header.jpg',
            role: 'Milieu tout-terrain',
            period: '2010-2018',
            achievements: '3x Champion • Joueur de l\'année PL 2014 • 79 buts',
            followers: 9800000,
            retired: true,
            retirementYear: 2020,
            nft: { available: true, price: 699, rarity: 'LEGENDARY', edition: '79/316' }
        },
        {
            name: 'Joe Hart',
            photo: 'https://www.mancity.com/sites/default/files/styles/player_header/public/2016-08/hart-header.jpg',
            role: 'Gardien - Golden Glove',
            period: '2006-2016',
            achievements: '2x Champion • 4x Golden Glove • 348 matchs',
            followers: 5200000,
            retired: true,
            retirementYear: 2022,
            nft: { available: true, price: 549, rarity: 'EPIC', edition: '348/348' }
        },
        {
            name: 'Pablo Zabaleta',
            photo: 'https://www.mancity.com/sites/default/files/styles/player_header/public/2017-05/zabaleta-header.jpg',
            role: 'Latéral droit - Warrior',
            period: '2008-2017',
            achievements: '2x Champion • 333 matchs • Fidélité et combativité',
            followers: 3800000,
            retired: true,
            retirementYear: 2020,
            nft: { available: true, price: 499, rarity: 'EPIC', edition: '333/333' }
        },
        {
            name: 'Colin Bell',
            photo: 'https://www.mancity.com/sites/default/files/styles/player_header/public/colin-bell.jpg',
            role: 'The King of the Kippax',
            period: '1966-1979',
            achievements: 'Légende absolue • 492 matchs • Champion 1968 • Icône du club',
            followers: 850000,
            retired: true,
            retirementYear: 1979,
            note: 'Décédé en 2021',
            nft: { available: true, price: 899, rarity: 'LEGENDARY', edition: '153/492' }
        }
    ],

    // ========== LIVERPOOL FC (RETRAITÉS UNIQUEMENT) ==========
    'liverpool-fc': [
        {
            name: 'Steven Gerrard',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/2021-05/gerrard-profile.jpg',
            role: 'Captain Fantastic',
            period: '1998-2015',
            achievements: 'Capitaine légendaire • Champion League 2005 • 710 matchs • Mr. Liverpool',
            followers: 16800000,
            retired: true,
            retirementYear: 2016,
            nft: { available: true, price: 849, rarity: 'LEGENDARY', edition: '186/710' }
        },
        {
            name: 'Kenny Dalglish',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/dalglish-profile.jpg',
            role: 'King Kenny',
            period: '1977-1990',
            achievements: '172 buts • 6x Champion • 3x C1 • Légende absolue',
            followers: 1850000,
            retired: true,
            retirementYear: 1990,
            nft: { available: true, price: 899, rarity: 'LEGENDARY', edition: '172/515' }
        },
        {
            name: 'Ian Rush',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/rush-profile.jpg',
            role: 'Meilleur buteur historique',
            period: '1980-1987, 1988-1996',
            achievements: '346 buts • 5x Champion • 2x C1 • Légende galloise',
            followers: 980000,
            retired: true,
            retirementYear: 1996,
            nft: { available: true, price: 849, rarity: 'LEGENDARY', edition: '346/660' }
        },
        {
            name: 'Jamie Carragher',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/carragher-profile.jpg',
            role: 'Mr. Liverpool - Défenseur',
            period: '1996-2013',
            achievements: '737 matchs • Champion League 2005 • Vice-capitaine • One-club man',
            followers: 5200000,
            retired: true,
            retirementYear: 2013,
            nft: { available: true, price: 749, rarity: 'LEGENDARY', edition: '737/737' }
        },
        {
            name: 'Fernando Torres',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/torres-profile.jpg',
            role: 'El Niño',
            period: '2007-2011',
            achievements: '81 buts • Champion du monde 2010 • Champion d\'Europe 2008/2012',
            followers: 17200000,
            retired: true,
            retirementYear: 2019,
            nft: { available: true, price: 699, rarity: 'LEGENDARY', edition: '81/142' }
        },
        {
            name: 'Xabi Alonso',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/xabi-alonso-profile.jpg',
            role: 'Maestro espagnol',
            period: '2004-2009',
            achievements: 'Champion League 2005 • Champion du monde 2010 • 210 matchs',
            followers: 9500000,
            retired: true,
            retirementYear: 2017,
            nft: { available: true, price: 649, rarity: 'LEGENDARY', edition: '18/210' }
        },
        {
            name: 'John Barnes',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/barnes-profile.jpg',
            role: 'Ailier magique',
            period: '1987-1997',
            achievements: '2x Champion • Joueur de l\'année PL 1988, 1990 • 108 buts',
            followers: 1250000,
            retired: true,
            retirementYear: 1999,
            nft: { available: true, price: 599, rarity: 'EPIC', edition: '108/407' }
        }
    ]
};

// Fonction pour obtenir les légendes RETRAITÉS d'un club
function getRetiredLegendsForClub(clubSlug) {
    const normalizedSlug = clubSlug.toLowerCase()
        .replace(/\+/g, '-')
        .replace(/\s+/g, '-')
        .replace('_', '-');
    
    for (const key in legendesHistoriques) {
        if (normalizedSlug.includes(key) || key.includes(normalizedSlug)) {
            return legendesHistoriques[key];
        }
    }
    
    return [];
}

console.log('⭐ Base de données des LÉGENDES HISTORIQUES chargée (joueurs retraités uniquement)');
console.log(`📊 Total clubs documentés: ${Object.keys(legendesHistoriques).length}`);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { legendesHistoriques, getRetiredLegendsForClub };
}
