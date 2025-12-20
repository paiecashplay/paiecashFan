// ⚽ EFFECTIF ACTUEL DES CLUBS - JOUEURS EN ACTIVITÉ (2024-2025)
// Tous les joueurs de l'effectif peuvent avoir leur NFT
// SÉPARÉ de la section "Légendes" qui est réservée aux joueurs retraités

const effectifActuel = {
    // ========== LIVERPOOL FC - EFFECTIF HOMMES 2024-2025 ==========
    'liverpool-fc-hommes': [
        {
            name: 'Mohamed Salah',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/salah-profile.jpg',
            role: 'Ailier droit',
            number: 11,
            nationality: 'Égypte',
            achievements: 'Champion 2020 • Champion League 2019 • 200+ buts',
            followers: 61500000,
            active: true,
            nft: { available: true, price: 299, rarity: 'EPIC', edition: '11/2024' }
        },
        {
            name: 'Virgil van Dijk',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/vandijk-profile.jpg',
            role: 'Défenseur central - Capitaine',
            number: 4,
            nationality: 'Pays-Bas',
            achievements: 'Champion 2020 • Champion League 2019 • Meilleur joueur UEFA 2019',
            followers: 15800000,
            active: true,
            nft: { available: true, price: 249, rarity: 'EPIC', edition: '4/2024' }
        },
        {
            name: 'Trent Alexander-Arnold',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/alexander-arnold-profile.jpg',
            role: 'Latéral droit',
            number: 66,
            nationality: 'Angleterre',
            achievements: 'Champion 2020 • Champion League 2019 • Formé au club',
            followers: 8500000,
            active: true,
            nft: { available: true, price: 229, rarity: 'RARE', edition: '66/2024' }
        },
        {
            name: 'Alisson Becker',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/alisson-profile.jpg',
            role: 'Gardien',
            number: 1,
            nationality: 'Brésil',
            achievements: 'Champion 2020 • Champion League 2019 • Golden Glove',
            followers: 9200000,
            active: true,
            nft: { available: true, price: 239, rarity: 'RARE', edition: '1/2024' }
        },
        {
            name: 'Darwin Núñez',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/acquiadam/nunez-profile.jpg',
            role: 'Attaquant',
            number: 9,
            nationality: 'Uruguay',
            achievements: 'Transfert record Liverpool • Buteur puissant',
            followers: 4200000,
            active: true,
            nft: { available: true, price: 199, rarity: 'RARE', edition: '9/2024' }
        }
        // Note: Ajouter tous les autres joueurs de l'effectif (25+ joueurs)
    ],

    // ========== LIVERPOOL FC - EFFECTIF FEMMES 2024-2025 ==========
    'liverpool-fc-femmes': [
        {
            name: 'Rachel Furness',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/women/furness-profile.jpg',
            role: 'Milieu - Capitaine',
            number: 8,
            nationality: 'Irlande du Nord',
            achievements: 'Capitaine • Meilleure buteuse 2022',
            followers: 25000,
            active: true,
            nft: { available: true, price: 99, rarity: 'COMMON', edition: '8/2024' }
        },
        {
            name: 'Gemma Bonner',
            photo: 'https://www.liverpoolfc.com/sites/default/files/styles/md/public/women/bonner-profile.jpg',
            role: 'Défenseur central',
            number: 5,
            nationality: 'Angleterre',
            achievements: 'Internationale anglaise • Leader défensive',
            followers: 18000,
            active: true,
            nft: { available: true, price: 89, rarity: 'COMMON', edition: '5/2024' }
        }
        // Note: Ajouter toutes les joueuses de l'effectif féminin
    ],

    // ========== MANCHESTER CITY - EFFECTIF HOMMES 2024-2025 ==========
    'manchester-city-hommes': [
        {
            name: 'Erling Haaland',
            photo: 'https://www.mancity.com/sites/default/files/styles/player_header/public/2024-08/haaland-header.jpg',
            role: 'Attaquant',
            number: 9,
            nationality: 'Norvège',
            achievements: 'Meilleur buteur PL 2023 (36 buts) • Champion 2023, 2024',
            followers: 35500000,
            active: true,
            nft: { available: true, price: 349, rarity: 'LEGENDARY', edition: '9/2024' }
        },
        {
            name: 'Kevin De Bruyne',
            photo: 'https://www.mancity.com/sites/default/files/styles/player_header/public/2024-08/debruyne-header.jpg',
            role: 'Milieu offensif',
            number: 17,
            nationality: 'Belgique',
            achievements: 'Joueur de l\'année PL 2x • Champion League 2023 • Maestro',
            followers: 28500000,
            active: true,
            nft: { available: true, price: 329, rarity: 'LEGENDARY', edition: '17/2024' }
        },
        {
            name: 'Phil Foden',
            photo: 'https://www.mancity.com/sites/default/files/styles/player_header/public/2024-08/foden-header.jpg',
            role: 'Milieu offensif',
            number: 47,
            nationality: 'Angleterre',
            achievements: 'Formé au club • Champion 2023, 2024 • Joueur de l\'année PL 2024',
            followers: 12200000,
            active: true,
            nft: { available: true, price: 279, rarity: 'EPIC', edition: '47/2024' }
        },
        {
            name: 'Ederson',
            photo: 'https://www.mancity.com/sites/default/files/styles/player_header/public/2024-08/ederson-header.jpg',
            role: 'Gardien',
            number: 31,
            nationality: 'Brésil',
            achievements: '6x Champion • Golden Glove • Gardien ballon au pied',
            followers: 8900000,
            active: true,
            nft: { available: true, price: 249, rarity: 'EPIC', edition: '31/2024' }
        },
        {
            name: 'Rodri',
            photo: 'https://www.mancity.com/sites/default/files/styles/player_header/public/2024-08/rodri-header.jpg',
            role: 'Milieu défensif',
            number: 16,
            nationality: 'Espagne',
            achievements: 'Champion League 2023 • Champion d\'Europe 2024 • Ballon d\'Or 2024',
            followers: 7500000,
            active: true,
            nft: { available: true, price: 299, rarity: 'EPIC', edition: '16/2024' }
        }
        // Note: Ajouter tous les autres joueurs de l'effectif
    ],

    // ========== PARIS SAINT-GERMAIN - EFFECTIF HOMMES 2024-2025 ==========
    'paris-saint-germain-hommes': [
        {
            name: 'Kylian Mbappé',
            photo: 'https://www.psg.fr/media/mbappe-profile-2024.jpg',
            role: 'Attaquant',
            number: 7,
            nationality: 'France',
            achievements: 'Champion du monde 2018 • 256 buts au PSG • Meilleur buteur historique',
            followers: 115000000,
            active: true,
            note: 'A quitté le PSG en 2024 pour le Real Madrid',
            nft: { available: true, price: 449, rarity: 'LEGENDARY', edition: '7/2024' }
        },
        {
            name: 'Marquinhos',
            photo: 'https://www.psg.fr/media/marquinhos-profile-2024.jpg',
            role: 'Défenseur central - Capitaine',
            number: 5,
            nationality: 'Brésil',
            achievements: 'Capitaine • 10+ saisons • 6x Champion de France',
            followers: 14200000,
            active: true,
            nft: { available: true, price: 269, rarity: 'EPIC', edition: '5/2024' }
        },
        {
            name: 'Gianluigi Donnarumma',
            photo: 'https://www.psg.fr/media/donnarumma-profile-2024.jpg',
            role: 'Gardien',
            number: 99,
            nationality: 'Italie',
            achievements: 'Meilleur joueur Euro 2020 • Champion d\'Europe 2020',
            followers: 8500000,
            active: true,
            nft: { available: true, price: 239, rarity: 'RARE', edition: '99/2024' }
        }
        // Note: Ajouter tous les autres joueurs de l'effectif
    ]
};

// Fonction pour obtenir l'effectif actuel d'un club
function getCurrentSquad(clubSlug, gender = 'hommes') {
    const squadKey = `${clubSlug}-${gender}`;
    return effectifActuel[squadKey] || [];
}

// Fonction pour obtenir TOUS les NFTs disponibles (effectif complet)
function getAllNFTsForClub(clubSlug) {
    const hommes = getCurrentSquad(clubSlug, 'hommes');
    const femmes = getCurrentSquad(clubSlug, 'femmes');
    return [...hommes, ...femmes];
}

console.log('⚽ Base de données EFFECTIF ACTUEL chargée (joueurs en activité)');
console.log('📊 Effectifs documentés:', Object.keys(effectifActuel).length);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { effectifActuel, getCurrentSquad, getAllNFTsForClub };
}
