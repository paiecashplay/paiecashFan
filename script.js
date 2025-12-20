// ========================================
// PAIECASHPLAY FAN APP - JAVASCRIPT COMPLET
// Version avec Live Stream, Ventes Fans et Multi-Club Stablecoins
// ========================================

// === DONNÉES ===

// NFT Marketplace - Moments Iconiques OM
const nftMarketplace = [
    {
        id: 1,
        title: 'But de Basile Boli - Finale C1 1993',
        description: 'Le but historique de la tête contre le Milan AC à Munich. Champions d\'Europe !',
        image: 'https://www.genspark.ai/api/files/s/BOvtefGS',
        category: 'moment-legendaire',
        player: 'Basile Boli',
        date: '26 Mai 1993',
        price: 499,
        currency: 'OMC',
        edition: 'Édition limitée 100/1993',
        rarity: 'Legendary',
        verified: true
    },
    {
        id: 2,
        title: 'Steve Mandanda - Gardien Légendaire',
        description: 'Portrait NFT du meilleur gardien de l\'histoire de l\'OM. 613 matchs !',
        image: 'https://www.genspark.ai/api/files/s/nnvwqDUR',
        category: 'legende',
        player: 'Steve Mandanda',
        date: '2007-2024',
        price: 350,
        currency: 'OMC',
        edition: 'Édition limitée 50/613',
        rarity: 'Epic',
        verified: true
    },
    {
        id: 3,
        title: 'Didier Drogba - Saison 2003/04',
        description: 'NFT exclusif de Drogba en action. 32 buts en 55 matchs !',
        image: 'https://www.genspark.ai/api/files/s/KlT2ta3A',
        category: 'legende',
        player: 'Didier Drogba',
        date: '2003-2004',
        price: 599,
        currency: 'OMC',
        edition: 'Édition limitée 32/100',
        rarity: 'Legendary',
        verified: true
    },
    {
        id: 4,
        title: 'André Ayew - Enfant du Club',
        description: 'Portrait NFT d\'André Ayew, formé à l\'OM. 240 matchs avec le maillot olympien.',
        image: 'https://www.genspark.ai/api/files/s/hNeGrsp6',
        category: 'legende',
        player: 'André Ayew',
        date: '2006-2015',
        price: 299,
        currency: 'OMC',
        edition: 'Édition limitée 240/500',
        rarity: 'Rare',
        verified: true
    },
    {
        id: 5,
        title: 'Souleymane Diawara - Capitaine',
        description: 'NFT du capitaine emblématique. Numéro 21 retiré en son honneur.',
        image: 'https://www.genspark.ai/api/files/s/ooQrGBls',
        category: 'legende',
        player: 'Souleymane Diawara',
        date: '2007-2014',
        price: 249,
        currency: 'OMC',
        edition: 'Édition limitée 21/200',
        rarity: 'Epic',
        verified: true
    },
    {
        id: 6,
        title: 'Mamadou Niang - Meilleur Buteur',
        description: 'NFT collector de Mamadou Niang. 83 buts, légende du Vélodrome !',
        image: 'https://www.genspark.ai/api/files/s/RfomEzmt',
        category: 'legende',
        player: 'Mamadou Niang',
        date: '2005-2011',
        price: 399,
        currency: 'OMC',
        edition: 'Édition limitée 83/300',
        rarity: 'Epic',
        verified: true
    },
    {
        id: 7,
        title: 'Djamel Belmadi - Milieu Légendaire',
        description: 'Portrait NFT de Djamel Belmadi, finaliste C1 1999.',
        image: 'https://www.genspark.ai/api/files/s/ciBUmrLN',
        category: 'legende',
        player: 'Djamel Belmadi',
        date: '1997-2003',
        price: 199,
        currency: 'OMC',
        edition: 'Édition limitée 150/400',
        rarity: 'Rare',
        verified: true
    },
    {
        id: 8,
        title: 'Didier Drogba - Portrait Gardien',
        description: 'NFT rare de Drogba en tenue de gardien lors d\'un entraînement.',
        image: 'https://www.genspark.ai/api/files/s/ImJVmZVs',
        category: 'moment-rare',
        player: 'Didier Drogba',
        date: '2004',
        price: 449,
        currency: 'OMC',
        edition: 'Édition limitée 50/100',
        rarity: 'Legendary',
        verified: true
    },
    {
        id: 9,
        title: 'Abedi Pelé - Roi d\'Afrique à Marseille',
        description: 'NFT du triple Ballon d\'Or africain sous les couleurs marseillaises.',
        image: 'https://www.genspark.ai/api/files/s/Az1QNEdm',
        category: 'legende',
        player: 'Abedi Pelé',
        date: '1987-1993',
        price: 549,
        currency: 'OMC',
        edition: 'Édition limitée 3/100',
        rarity: 'Legendary',
        verified: true
    },
    {
        id: 10,
        title: 'Équipe Féminine OM 2024',
        description: 'NFT collectif de l\'équipe féminine de l\'OM saison 2024/25.',
        image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600',
        category: 'effectif-feminin',
        player: 'Équipe Féminine',
        date: '2024',
        price: 149,
        currency: 'OMC',
        edition: 'Édition limitée 500/1000',
        rarity: 'Common',
        verified: true
    }
];

// Amis et leurs stories
const friends = [
    {
        id: 1,
        name: 'Sophie Martin',
        username: '@sophie_om',
        avatar: 'https://i.pravatar.cc/150?img=45',
        hasStory: true
    },
    {
        id: 2,
        name: 'Thomas Dubois',
        username: '@thomas_marseille',
        avatar: 'https://i.pravatar.cc/150?img=33',
        hasStory: true
    },
    {
        id: 3,
        name: 'Julie Bernard',
        username: '@julie_om13',
        avatar: 'https://i.pravatar.cc/150?img=47',
        hasStory: true
    },
    {
        id: 4,
        name: 'Marc Petit',
        username: '@marc_velodrome',
        avatar: 'https://i.pravatar.cc/150?img=51',
        hasStory: true
    },
    {
        id: 5,
        name: 'Emma Leroy',
        username: '@emma_om_forever',
        avatar: 'https://i.pravatar.cc/150?img=29',
        hasStory: true
    }
];

// Posts d'amis qui parlent du match
const friendsPosts = [
    {
        id: 1,
        author: friends[0],
        time: 'Il y a 15 min',
        text: '⚽ Quelle victoire hier soir ! L\'OM est de retour au sommet ! 💙 Le Vélodrome était en feu ! #AllezLOM',
        image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800',
        likes: 142,
        comments: 23,
        shares: 8,
        liked: false
    },
    {
        id: 2,
        author: friends[1],
        time: 'Il y a 1h',
        text: 'Déjà mes places pour OM-PSG ! 🎟️ Qui vient avec moi au Classico ? Avec mon OM Coin j\'ai eu -5% 💰',
        image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
        likes: 89,
        comments: 34,
        shares: 12,
        liked: true
    },
    {
        id: 3,
        author: friends[2],
        time: 'Il y a 2h',
        text: 'Le nouveau maillot domicile est juste parfait ! 🤩 Commandé via PaieCashPlay, livré en 24h ⚡',
        image: 'https://images.unsplash.com/photo-1551318180-655c3a79bbdd?w=800',
        likes: 215,
        comments: 45,
        shares: 18,
        liked: false
    },
    {
        id: 4,
        author: friends[3],
        time: 'Il y a 3h',
        text: 'Ambiance de dingue au stade ! 😍 47 000 supporters derrière l\'équipe ! Allez l\'OM ! 🏟️💙',
        image: 'https://images.unsplash.com/photo-1522778526004-d6f42794f9f6?w=800',
        likes: 178,
        comments: 28,
        shares: 15,
        liked: true
    },
    {
        id: 5,
        author: friends[4],
        time: 'Il y a 4h',
        text: 'Rencontre avec Habib Beye aujourd\'hui à l\'événement PaieCashPlay ! ⭐ Quelle légende ! Photo souvenir 📸',
        image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
        likes: 302,
        comments: 56,
        shares: 24,
        liked: false
    }
];

// AMBASSADEURS OM - PHOTOS RÉELLES INTÉGRÉES
const ambassadeurs = [
    {
        id: 1,
        name: 'Abedi Pelé',
        period: '1987-1993',
        position: 'Milieu offensif',
        achievements: 'Légende africaine, Ballon d\'or africain 3x, Champion de France',
        photo: 'https://sspark.genspark.ai/cfimages?u1=QskCUXy0KY4RFtPp3CZIY4JqJwjrC3l9mPfxkjXq5l4FyZh1IKxQQZTXC93n3aGSaS5r2Oaqc%2BT%2BVe9a8f1Vby40uaD%2BgTi9yDQwVY9nW%2B9KWM8QDbEm%2BhGPp0S3B%2B7w&u2=dLJv%2Fv2TxpbR30Yf&width=2560',
        followers: '850K',
        association: {
            name: 'Fondation Abedi Pelé',
            description: 'Aide aux jeunes talents africains',
            goal: 'Former la prochaine génération de footballeurs',
            raised: 78000,
            target: 150000
        },
        nft: {
            available: true,
            price: 449,
            image: 'https://www.genspark.ai/api/files/s/ImJVmZVs'
        }
    },
    {
        id: 2,
        name: 'Taye Taiwo',
        period: '2005-2011',
        position: 'Latéral gauche',
        achievements: 'Finaliste C1 2004, 6 saisons à l\'OM, Hall of Fame OM',
        photo: 'https://sspark.genspark.ai/cfimages?u1=6XaHV86KNR5yshQrW8dijQjESHdRxJ1zfWTHz9vArdAQuJWWNs6iuvhySXOI%2Fky9ox8m4XdusXlWE1miLel1uhWw2u%2B1ko0mtoDtGsyKzIvLy%2FIgwv%2FSz6XT8dWZuD14zq1m3zOcWM67oD6r3OS1M2IAvgyaShKSq%2FTLyRkesDhYTST8QaNdrn7kWw%3D%3D&u2=Hqyb2HGbfK2ApO0s&width=2560',
        followers: '420K'
    },
    {
        id: 3,
        name: 'Didier Drogba',
        period: '2003-2004',
        position: 'Attaquant',
        achievements: '32 buts en 55 matchs, Meilleur buteur Ligue 1, Légende Chelsea',
        photo: 'https://sspark.genspark.ai/cfimages?u1=xu0OkePZIbWHB%2Fp7gVFqUZ5%2BDm%2FTGBUS1x28o80X8kiy4zl5ZO5iNQxvWZVyxd3qg0aM15HDMeq8dD8wJsNRrl8QDy4xych%2FOgZVXlXfC1z3eD8qHEIv&u2=XWplgnwlDt%2FJD5LO&width=2560',
        followers: '3.2M',
        association: {
            name: 'Fondation Didier Drogba',
            description: 'Hôpitaux et soins de santé en Côte d\'Ivoire',
            goal: 'Améliorer l\'accès aux soins médicaux',
            raised: 250000,
            target: 500000
        },
        nft: {
            available: true,
            price: 599,
            image: 'https://www.genspark.ai/api/files/s/KlT2ta3A'
        }
    },
    {
        id: 4,
        name: 'Djamel Belmadi',
        period: '1997-2003',
        position: 'Milieu défensif',
        achievements: 'Capitaine, Finaliste C1 1999, Sélectionneur Algérie Champion d\'Afrique 2019',
        photo: 'https://sspark.genspark.ai/cfimages?u1=MkQzExFPFqyCWzz1i4eyWag%2FdcwO4ilrrjeczkedZaYNMn6x3YaSbpdgi2nIZ6ctYBLbT6lFvCb2iQgaKJKAURBMponQ7ugTNp02uJ0snLsWQWaUBwiyUWFFIbE09baAFHYTcnr68ikl24w6M%2FDNCZK1BDGeLDZAGVzQ1852qseDb%2BAzq59MvpUL12JyZL1ool9XatNt%2BG1Vr1hr1LKJK36rJ1f%2BiC1KHMy4jFw%3D&u2=Uc%2FeNFJB3RDEEU2d&width=2560',
        followers: '680K'
    },
    {
        id: 5,
        name: 'Mamadou Niang',
        period: '2005-2011',
        position: 'Attaquant',
        achievements: 'Meilleur buteur de l\'histoire récente (83 buts), Légende du Vélodrome',
        photo: 'https://sspark.genspark.ai/cfimages?u1=rEs0TU%2Fxh5%2FgpBbZWODNGOwpPnyl0nkA5Bhir%2BxhBG%2Bpchs%2BAl0OVIIgrgVaPRdk6nW9dcfhXZbbC2TeP6jFTayJRUGK6lLQKf7of7fIWXSpYz7gp9s%2ByUEwUrzwS53XUl0%3D&u2=dRhTUKMfcIAkSvI5&width=2560',
        followers: '540K'
    },
    {
        id: 6,
        name: 'Habib Beye',
        period: '2003-2007',
        position: 'Latéral droit',
        achievements: '4 saisons, Finaliste C1, Consultant RMC Sport',
        photo: 'https://sspark.genspark.ai/cfimages?u1=dqABH4zqDyGraCwJAjIHOZBLPYfPs3UD0pI%2F64P0DEY%2FdHANfedJcEmkb%2FA2DzfrLDVojbYF6%2BAJkyeZN2WvgE1uTbAuogDWlZgiyanpv3oFkQitT8hZymd0%2BQ5utYL2euNWrMsu9%2BbOIr60abfaFaB7fcuGfM0fyVyu1cd4VkpQkkt2sb7kC%2F3HXt8UhXJFJq0EkYGZOFPL%2Bm3YVVQmCFlAPvl4T7qtuZn3t%2FdIYks969ujGoTVykLGYVawrbQnzIaTVaLqpFKjDtdCGL0d41e%2BLF4j51yA0daqcZ7KexaaPxq%2FWKR1o6Wl7idHBwY9TgovH6w1hqMQFx404O7b2wgddbtsfNRC8U3KLq89da9O116wA3ymrHJFA2Q5Ow%3D%3D&u2=Gju1s%2F8xFVrL8W5X&width=2560',
        followers: '390K'
    },
    {
        id: 7,
        name: 'Souleymane Diawara',
        period: '2007-2014',
        position: 'Défenseur central',
        achievements: '7 saisons, Capitaine, Champion de France 2010, Numéro 21 retiré',
        photo: 'https://sspark.genspark.ai/cfimages?u1=4U%2BLNtKozKafiQXLXzfxeiQ1ZL3w%2FMbv2bW%2FMpQh7D1BpCsJEBIUSAfE7WmbDE7rqB%2F7N6kbEJHbkupmCLXG6BcPGQ2qNMlWP%2FsJ%2BrkjzZWiMJxnkLH4c%2B5jZXV1LsI%3D&u2=Hm76f%2FYq1H4bQDvn&width=2560',
        followers: '310K'
    },
    {
        id: 8,
        name: 'Stéphane Mbia',
        period: '2009-2012',
        position: 'Milieu défensif',
        achievements: 'Roc du milieu, Champion de France 2010, 110 matchs',
        photo: 'https://sspark.genspark.ai/cfimages?u1=hShvOiSdVjlNBqbFkLVIQxXZ7A7PAN2k3LeyuU4p8%2BtFkLXhMQRaKIHPOShYsVevx6bzltutyC6AroT7%2BAWrYlz6Odz8GBRjEMDsTtnP68ZwsDnrK%2FiA01LXSEgJ&u2=W0YUAv7GzlI3o1tQ&width=2560',
        followers: '280K',
        association: {
            name: 'École Stéphane Mbia',
            description: 'Construction et financement d\'une école au Cameroun',
            goal: 'Offrir une éducation de qualité aux enfants défavorisés',
            raised: 45000,
            target: 100000
        },
        nft: {
            available: true,
            price: 299,
            image: 'https://www.genspark.ai/api/files/s/KlT2ta3A'
        }
    },
    {
        id: 9,
        name: 'François Omam-Biyik',
        period: '1989-1993',
        position: 'Attaquant',
        achievements: 'Champion de France 1991, Héros Mondial 1990 Cameroun',
        photo: 'https://sspark.genspark.ai/cfimages?u1=GYTn3352E3C%2BMXnAvdTaAk%2BpB1XmGTWTMz51HcgFPwJ8yhr6Yv8%2F2oP4syrV3tmDHyQfP3AZXPo5AyK5ZajNthHd9STP3LoAEQFPdGWwuXa0S8KdTLVR01G1Zyu9RiBargsuzEiWrTNvGzylbhweBsPmY%2FNnP1DA1G%2FqJEDehyBOwe7%2BCrcjlA%3D%3D&u2=vBPuxGvKvVd1xuXd&width=2560',
        followers: '450K'
    },
    {
        id: 10,
        name: 'Joseph-Antoine Bell',
        period: '1988-1994',
        position: 'Gardien de but',
        achievements: 'Légende gardien, Champion de France 1991, Consultant',
        photo: 'https://sspark.genspark.ai/cfimages?u1=b2fmLvAaduGx9cgkYgx8vEKfFKSzOGOwpIzkEsSolXkEZXKPCvmztCeUDAT4YnBW%2BAIJmOInBk3ADmc6He0u469Em1E%3D&u2=FLj6Xqb5hCFis2oz&width=2560',
        followers: '370K'
    },
    {
        id: 11,
        name: 'André Ayew',
        period: '2006-2015',
        position: 'Ailier',
        achievements: 'Formé à l\'OM, 240 matchs, Capitaine Ghana, Joueur africain année 2015',
        photo: 'https://sspark.genspark.ai/cfimages?u1=VO6KG9tD3illqgeGNWgiEmcctShYaxQZDmP3mVydqV31NoH02hR52TfRW1YGwazisAKkvqbAply%2BS5srmXO9NdbOfmXcRJuh9%2BPdmMjBDdEOfT1NCEW6iyGkz6MFPMPjqEs%3D&u2=qMgjqOQWP6TFK4Ct&width=2560',
        followers: '1.5M',
        association: {
            name: 'Ayew Foundation',
            description: 'Projet sportif pour la jeunesse ghanéenne',
            goal: 'Développer le football chez les jeunes',
            raised: 120000,
            target: 200000
        },
        nft: {
            available: true,
            price: 499,
            image: 'https://www.genspark.ai/api/files/s/nnvwqDUR'
        }
    }
];

// Badges
const badges = [
    { id: 1, name: 'Supporter Platine', icon: '💎', unlocked: true },
    { id: 2, name: 'Influenceur OM', icon: '📱', unlocked: true },
    { id: 3, name: 'Collectionneur', icon: '🏆', unlocked: true },
    { id: 4, name: 'Vélodrome VIP', icon: '🏟️', unlocked: true },
    { id: 5, name: 'Ambassadeur', icon: '⭐', unlocked: false },
    { id: 6, name: 'Ultra OM', icon: '🔥', unlocked: false }
];

// Missions
const missions = [
    { id: 1, title: 'Partager 3 matchs', progress: 2, total: 3, reward: 50 },
    { id: 2, title: 'Acheter un maillot', progress: 0, total: 1, reward: 100 },
    { id: 3, title: 'Inviter 5 amis', progress: 3, total: 5, reward: 250 }
];

// Matchs
const matches = [
    {
        id: 1,
        home: 'OM',
        away: 'PSG',
        date: '15 Déc 2024',
        time: '21:00',
        competition: 'Ligue 1',
        stadium: 'Vélodrome',
        price: 65,
        available: 234
    },
    {
        id: 2,
        home: 'OM',
        away: 'OL',
        date: '22 Déc 2024',
        time: '17:00',
        competition: 'Ligue 1',
        stadium: 'Vélodrome',
        price: 45,
        available: 890
    },
    {
        id: 3,
        home: 'Monaco',
        away: 'OM',
        date: '05 Jan 2025',
        time: '21:00',
        competition: 'Ligue 1',
        stadium: 'Stade Louis II',
        price: 55,
        available: 156
    }
];

// Billets revendus par des fans
const fanTickets = [
    {
        id: 1,
        seller: 'Marc Dubois',
        match: 'OM - PSG',
        date: '15 Déc 2024',
        section: 'Stade Vélodrome',
        originalPrice: 65,
        price: 58,
        verified: true
    },
    {
        id: 2,
        seller: 'Sophie Laurent',
        match: 'OM - OL',
        date: '22 Déc 2024',
        section: 'Virage Sud',
        originalPrice: 45,
        price: 40,
        verified: true
    }
];

// Produits boutique officielle
const products = [
    {
        id: 1,
        name: 'Maillot Domicile 24/25',
        price: 89.99,
        category: 'maillots',
        image: 'https://images.unsplash.com/photo-1551318180-655c3a79bbdd?w=500',
        type: 'officiel'
    },
    {
        id: 2,
        name: 'Écharpe OM',
        price: 19.99,
        category: 'accessoires',
        image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=500',
        type: 'officiel'
    },
    {
        id: 3,
        name: 'Casquette OM',
        price: 24.99,
        category: 'accessoires',
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500',
        type: 'officiel'
    },
    {
        id: 4,
        name: 'Maillot Extérieur 24/25',
        price: 89.99,
        category: 'maillots',
        image: 'https://images.unsplash.com/photo-1542602993-e4d6d7574c8c?w=500',
        type: 'officiel'
    },
    {
        id: 5,
        name: 'Sweat à capuche',
        price: 54.99,
        category: 'accessoires',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
        type: 'officiel'
    },
    {
        id: 6,
        name: 'Ballon officiel',
        price: 29.99,
        category: 'accessoires',
        image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=500',
        type: 'officiel'
    }
];

// Articles vendus par des fans
const fanProducts = [
    {
        id: 101,
        seller: 'Thomas Martin',
        sellerRating: 4.8,
        name: 'Maillot OM 2010 dédicacé Niang',
        price: 150,
        originalPrice: 89.99,
        category: 'maillots',
        image: 'https://images.unsplash.com/photo-1551318180-655c3a79bbdd?w=500',
        type: 'fan',
        verified: true,
        condition: 'Excellent'
    },
    {
        id: 102,
        seller: 'Julie Dupont',
        sellerRating: 5.0,
        name: 'Écharpe vintage OM 1993',
        price: 45,
        originalPrice: 19.99,
        category: 'accessoires',
        image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=500',
        type: 'fan',
        verified: true,
        condition: 'Très bon'
    },
    {
        id: 103,
        seller: 'Marc Leroy',
        sellerRating: 4.5,
        name: 'Maillot collector Drogba 2003',
        price: 280,
        originalPrice: 89.99,
        category: 'maillots',
        image: 'https://images.unsplash.com/photo-1542602993-e4d6d7574c8c?w=500',
        type: 'fan',
        verified: true,
        condition: 'Neuf'
    }
];

// Contacts P2P
const p2pContacts = [
    {
        id: 1,
        name: 'Sophie Martin',
        phone: '+33 6 12 34 56 78',
        wallet: '0x1a2b...3c4d',
        avatar: 'https://i.pravatar.cc/150?img=45'
    },
    {
        id: 2,
        name: 'Thomas Dubois',
        phone: '+33 6 98 76 54 32',
        wallet: '0x5e6f...7g8h',
        avatar: 'https://i.pravatar.cc/150?img=33'
    },
    {
        id: 3,
        name: 'Julie Bernard',
        phone: '+33 7 11 22 33 44',
        wallet: '0x9i0j...1k2l',
        avatar: 'https://i.pravatar.cc/150?img=47'
    }
];

// Historique des Transactions
const transactionsHistory = [];

// Réservations de Billets
const reservations = [];

// Notifications
const notifications = [
    {
        id: 1,
        type: 'match-resultat',
        title: '⚽ Résultat : OM 3-1 Lyon',
        message: 'L\'OM s\'impose à domicile ! Buts de Vitinha (2) et Harit. Prochain match : OM-Monaco dimanche',
        time: 'Il y a 30min',
        read: false,
        link: 'https://www.om.fr/matchs/resultats'
    },
    {
        id: 2,
        type: 'promo-geo',
        title: '🎉 Promo Partenaire à 500m !',
        message: 'Bar "Le Droit au But" - 📍 Marseille 13008 - 20% sur toutes les boissons ce soir avant le match ! Cliquez pour voir l\'itinéraire',
        time: 'Il y a 1h',
        read: false,
        link: 'https://maps.google.com/?q=Le+Droit+au+But+Marseille',
        location: '500m'
    },
    {
        id: 3,
        type: 'promo-digital',
        title: '💳 Cashback 10% Orange Bank',
        message: 'Orange Bank vous offre 10% de cashback sur vos achats OM ce weekend. Code : OM2024. Valable jusqu\'à dimanche minuit',
        time: 'Il y a 2h',
        read: false,
        link: 'https://www.orangebank.fr/promo-om'
    },
    {
        id: 4,
        type: 'payment',
        title: 'Paiement reçu',
        message: 'Sophie Martin vous a envoyé 50€ via PaieCash',
        time: 'Il y a 5h',
        read: false
    },
    {
        id: 5,
        type: 'match-alerte',
        title: '⏰ Match OM-PSG dans 24h',
        message: 'Votre match est demain à 21h au Vélodrome. Section Ganay, Porte 7. Cliquez pour voir votre billet',
        time: 'Il y a 6h',
        read: true,
        link: '#billetsSection'
    },
    {
        id: 6,
        type: 'promo-geo',
        title: '🍕 Promo Partenaire à 1.2km',
        message: 'Pizzeria "La Casa del Tifosi" - 📍 Marseille 13009 - Menu spécial match à 19€ (Pizza + Boisson + Dessert). Réservation en ligne',
        time: 'Il y a 8h',
        read: true,
        link: 'https://maps.google.com/?q=La+Casa+del+Tifosi+Marseille',
        location: '1.2km'
    },
    {
        id: 7,
        type: 'badge',
        title: 'Nouveau badge débloqué !',
        message: 'Vous avez obtenu le badge "Supporter Platine" pour votre fidélité',
        time: 'Il y a 2j',
        read: true
    },
    {
        id: 8,
        type: 'reservation',
        title: 'Réservation confirmée',
        message: 'Votre billet pour OM-Monaco dimanche 20h45 est confirmé. E-billet disponible',
        time: 'Il y a 3j',
        read: true,
        link: '#billetsSection'
    }
];

// Ami actuellement sélectionné pour l'interaction
let selectedFriend = null;

// Montant et devise pour le paiement en cours
let currentPaymentAmount = 0;
let currentPaymentCurrency = 'EUR';
let currentPaymentMethod = null;

// === ÉTAT APPLICATION ===
let cart = [];
let currentSection = 'accueil';

// === INITIALISATION ===
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        
        initApp();
    }, 2000);
});

function initApp() {
    renderStories();
    renderPosts();
    renderAmbassadeurs();
    renderBadges();
    renderMissions();
    renderTransactions();
    renderReservations();
    renderMatches();
    renderFanTickets();
    renderProducts();
    renderFanProducts();
    renderNFTs();
    renderP2PContacts();
    initNavigation();
    // initAI(); - Supprimé pour look professionnel
    initCart();
    initPaymentMethods();
    initWalletToggles();
    initP2PSearch();
    initNotifications();
    initFriendInteractions();
}

// === RENDER FUNCTIONS ===

function renderStories() {
    const container = document.getElementById('storiesContainer');
    
    // Ajouter le bouton ➕ en premier
    let storiesHTML = `
        <div class="story-item-compact add-friend-story" title="Ajouter un ami" onclick="ajouterAmi()" style="cursor: pointer;">
            <div class="story-avatar-compact" style="background: linear-gradient(135deg, #0e9cda, #0c7db3); display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 28px; color: white;">➕</span>
            </div>
        </div>
    `;
    
    // Charger les VRAIS amis depuis gestion_amis.js
    let mesAmis = [];
    if (typeof obtenirMesAmis === 'function') {
        mesAmis = obtenirMesAmis();
    }
    
    // Ajouter les stories des vrais amis
    if (mesAmis.length > 0) {
        storiesHTML += mesAmis.map(ami => `
            <div class="story-item-compact" title="${ami.nom}" onclick="openFriendModal('${ami.nom}', '${ami.avatar}')">
                <div class="story-avatar-compact">
                    <img src="${ami.avatar}" alt="${ami.nom}">
                </div>
            </div>
        `).join('');
    } else {
        // Si pas d'amis, afficher les amis par défaut
        storiesHTML += friends.map(friend => `
            <div class="story-item-compact" title="${friend.name}" onclick="openFriendModal('${friend.name}', '${friend.avatar}')">
                <div class="story-avatar-compact">
                    <img src="${friend.avatar}" alt="${friend.name}">
                </div>
            </div>
        `).join('');
    }
    
    container.innerHTML = storiesHTML;
}

function renderPosts() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = friendsPosts.map(post => `
        <div class="post-card">
            <div class="post-header">
                <img src="${post.author.avatar}" alt="${post.author.name}" class="post-avatar">
                <div class="post-author-info">
                    <h4>${post.author.name}</h4>
                    <span class="post-time">${post.time}</span>
                </div>
                <button class="post-menu">⋮</button>
            </div>
            <div class="post-content">
                <p>${post.text}</p>
                ${post.image ? `<img src="${post.image}" alt="Post" class="post-image">` : ''}
            </div>
            <div class="post-actions">
                <button class="post-action ${post.liked ? 'active' : ''}" onclick="toggleLike(${post.id})">
                    ❤️ <span>${post.likes}</span>
                </button>
                <button class="post-action">
                    💬 <span>${post.comments}</span>
                </button>
                <button class="post-action">
                    📤 <span>${post.shares}</span>
                </button>
            </div>
        </div>
    `).join('');
}

function renderAmbassadeurs() {
    const container = document.getElementById('ambassadeursGrid');
    container.innerHTML = ambassadeurs.map(amb => `
        <div class="ambassadeur-card">
            <img src="${amb.photo}" alt="${amb.name}" class="ambassadeur-photo" onerror="this.style.display='none'">
            <div class="ambassadeur-info">
                <h3>${amb.name}</h3>
                <span class="ambassadeur-period">${amb.period}</span>
                <p class="ambassadeur-position">${amb.position}</p>
                <p class="ambassadeur-achievements">${amb.achievements}</p>
                <div class="ambassadeur-stats">
                    <span>👥 ${amb.followers} followers</span>
                    <span class="verified">✓ Vérifié</span>
                </div>
                ${amb.association ? `
                    <div class="ambassadeur-association">
                        <h4>🎯 ${amb.association.name}</h4>
                        <p>${amb.association.description}</p>
                        <div class="association-progress">
                            <div class="association-bar">
                                <div class="association-fill" style="width: ${(amb.association.raised / amb.association.target) * 100}%"></div>
                            </div>
                            <span class="association-amount">${amb.association.raised.toLocaleString()}€ / ${amb.association.target.toLocaleString()}€</span>
                        </div>
                        <button class="btn-association" onclick="soutenirAssociation(${amb.id})">
                            💝 Soutenir ce projet
                        </button>
                    </div>
                ` : ''}
                ${amb.nft && amb.nft.available ? `
                    <button class="btn-nft" onclick="acheterNFTLegende(${amb.id})">
                        🎨 Acheter NFT - ${amb.nft.price} OMC
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function renderBadges() {
    const container = document.getElementById('badgesGrid');
    container.innerHTML = badges.map(badge => `
        <div class="badge-item ${badge.unlocked ? 'unlocked' : 'locked'}" onclick="afficherBadgeInfo('${badge.name}', ${badge.unlocked})" style="cursor: pointer;">
            <span class="badge-icon">${badge.icon}</span>
            <span class="badge-name">${badge.name}</span>
        </div>
    `).join('');
}

function afficherBadgeInfo(badgeName, unlocked) {
    if (unlocked) {
        alert(`🏆 Badge Débloqué !\n\n${badgeName}\n\n✅ Vous avez obtenu ce badge !\n\n💡 Partagez votre réussite avec vos amis pour gagner des points bonus.`);
    } else {
        alert(`🔒 Badge Verrouillé\n\n${badgeName}\n\n❌ Vous n'avez pas encore débloqué ce badge.\n\n💡 Continuez vos missions pour le débloquer !`);
    }
}

function renderMissions() {
    const container = document.getElementById('missionsGrid');
    container.innerHTML = missions.map(mission => `
        <div class="mission-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <h4>${mission.title}</h4>
                <button onclick="partagerMission('${mission.title}', '${mission.reward} pts')" style="background: rgba(14, 156, 218, 0.2); border: none; padding: 6px 12px; border-radius: 8px; color: var(--om-blue); font-size: 12px; cursor: pointer; font-weight: 600;" title="Partager cette mission">
                    📤
                </button>
            </div>
            <div class="mission-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(mission.progress/mission.total)*100}%"></div>
                </div>
                <span>${mission.progress}/${mission.total}</span>
            </div>
            <span class="mission-reward">+${mission.reward} pts</span>
        </div>
    `).join('');
}

function renderMatches() {
    const container = document.getElementById('matchesGrid');
    container.innerHTML = matches.map(match => `
        <div class="match-card">
            <div class="match-header">
                <span class="match-competition">${match.competition}</span>
                <span class="match-available">${match.available} places</span>
            </div>
            <div class="match-teams">
                <div class="team">${match.home}</div>
                <div class="vs">VS</div>
                <div class="team">${match.away}</div>
            </div>
            <div class="match-info">
                <span>📅 ${match.date}</span>
                <span>⏰ ${match.time}</span>
                <span>🏟️ ${match.stadium}</span>
            </div>
            <div class="match-footer">
                <span class="match-price">${match.price} € (-5% OM Coin)</span>
                <button class="btn-primary" onclick="bookTicket(${match.id})">Réserver</button>
            </div>
        </div>
    `).join('');
}

function renderFanTickets() {
    const container = document.getElementById('fanTicketsGrid');
    container.innerHTML = fanTickets.map(ticket => `
        <div class="fan-ticket-card">
            <div class="fan-ticket-header">
                <span class="verified-seller">✓ Vendeur vérifié</span>
                <span class="price-discount">-${Math.round((1-ticket.price/ticket.originalPrice)*100)}%</span>
            </div>
            <h4>${ticket.match}</h4>
            <p>📅 ${ticket.date}</p>
            <p>🪑 ${ticket.section}</p>
            <p class="seller-info">👤 Vendu par ${ticket.seller}</p>
            <div class="fan-ticket-footer">
                <div class="prices">
                    <span class="original-price">${ticket.originalPrice} €</span>
                    <span class="current-price">${ticket.price} €</span>
                </div>
                <button class="btn-primary" onclick="buyFanTicket(${ticket.id})">Acheter</button>
            </div>
        </div>
    `).join('');
}

function renderProducts() {
    const container = document.getElementById('productsGrid');
    const officialProducts = products.filter(p => p.type === 'officiel');
    container.innerHTML = officialProducts.map(product => `
        <div class="product-card" data-category="${product.category}">
            <img src="${product.image}" alt="${product.name}">
            <h4>${product.name}</h4>
            <span class="product-price">${product.price} €</span>
            <button class="btn-add-cart" onclick="addToCart(${product.id})">Ajouter au panier</button>
        </div>
    `).join('');
}

function renderFanProducts() {
    const container = document.getElementById('fanProductsGrid');
    container.innerHTML = fanProducts.map(product => `
        <div class="fan-product-card">
            <div class="fan-product-badge">
                <span class="verified-badge">✓ Vérifié</span>
                <span class="condition-badge">${product.condition}</span>
            </div>
            <img src="${product.image}" alt="${product.name}">
            <h4>${product.name}</h4>
            <div class="seller-info">
                <span>👤 ${product.seller}</span>
                <span class="seller-rating">⭐ ${product.sellerRating}</span>
            </div>
            <div class="fan-product-prices">
                <span class="original-price">${product.originalPrice} €</span>
                <span class="fan-price">${product.price} €</span>
            </div>
            <button class="btn-add-cart" onclick="addFanProductToCart(${product.id})">Acheter</button>
        </div>
    `).join('');
}

function renderNFTs() {
    const container = document.getElementById('nftGrid');
    container.innerHTML = nftMarketplace.map(nft => `
        <div class="nft-card" data-rarity="${nft.rarity.toLowerCase()}">
            <div class="nft-badge-container">
                <span class="nft-rarity ${nft.rarity.toLowerCase()}">${nft.rarity}</span>
                ${nft.verified ? '<span class="nft-verified">✓ Officiel</span>' : ''}
            </div>
            <div class="nft-image" style="background-image: url('${nft.image}')">
                <div class="nft-overlay">
                    <span class="nft-category">${nft.category.replace('-', ' ')}</span>
                </div>
            </div>
            <div class="nft-content">
                <h4 class="nft-title">${nft.title}</h4>
                <p class="nft-player">👤 ${nft.player}</p>
                <p class="nft-date">📅 ${nft.date}</p>
                <p class="nft-description">${nft.description}</p>
                <p class="nft-edition">${nft.edition}</p>
                <div class="nft-footer">
                    <div class="nft-price">
                        <span class="price-value">${nft.price}</span>
                        <span class="price-currency">${nft.currency}</span>
                    </div>
                    <button class="btn-nft-buy" onclick="buyNFT(${nft.id})">Acheter NFT</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderP2PContacts() {
    const container = document.getElementById('contactsGrid');
    container.innerHTML = p2pContacts.map(contact => `
        <div class="contact-card" data-name="${contact.name.toLowerCase()}" data-phone="${contact.phone}" data-wallet="${contact.wallet}">
            <img src="${contact.avatar}" alt="${contact.name}">
            <div class="contact-info">
                <h4>${contact.name}</h4>
                <p>${contact.phone}</p>
                <p class="wallet-address">${contact.wallet}</p>
            </div>
            <button class="btn-send" onclick="sendMoney('${contact.name}')">Envoyer</button>
        </div>
    `).join('');
}

// === INTERACTION FUNCTIONS ===

function toggleLike(postId) {
    const post = friendsPosts.find(p => p.id === postId);
    if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        renderPosts();
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Ouvrir le modal de choix de paiement avec BNPL
    ouvrirChoixPaiement({
        name: product.name,
        price: product.price,
        type: 'Produit Boutique'
    });
}

function addFanProductToCart(productId) {
    const product = fanProducts.find(p => p.id === productId);
    if (!product) return;
    
    const confirm = window.confirm(`Acheter ce produit d'occasion

🛒 ${product.name}
👤 Vendeur: ${product.seller}
⭐ Note: ${product.sellerRating}/5
🏷️ État: ${product.condition}
💰 ${product.price}€ (au lieu de ${product.originalPrice}€)

Confirmer l'achat ?`);
    
    if (confirm) {
        alert(`✅ Paiement effectué par PaieCash

🛒 "${product.name}" acheté avec succès!
👤 Vendeur: ${product.seller}
💰 ${product.price}€ débités

🏦 Transaction validée par PaieCash
📧 Coordonnées du vendeur envoyées par email`);
        
        cart.push(product);
        updateCartCount();
    }
}

function updateCartCount() {
    document.querySelector('.cart-count').textContent = cart.length;
}

function openCart() {
    const modal = document.getElementById('cartModal');
    const body = document.getElementById('cartBody');
    
    if (cart.length === 0) {
        body.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
    } else {
        body.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    ${item.type === 'fan' ? `<p class="seller-tag">Vendu par ${item.seller}</p>` : ''}
                    <span>${item.price} €</span>
                </div>
                <button class="btn-remove" onclick="removeFromCart(${item.id})">✖</button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        document.getElementById('cartTotal').textContent = `${total.toFixed(2)} €`;
    }
    
    modal.style.display = 'flex';
}

function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        cart.splice(index, 1);
        updateCartCount();
        openCart();
    }
}

function checkout() {
    const password = document.getElementById('checkoutPassword').value;
    
    if (password !== 'test1234') {
        showToast('❌ Mot de passe incorrect');
        return;
    }
    
    if (cart.length === 0) {
        showToast('❌ Votre panier est vide');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    showToast(`✅ Paiement confirmé : ${total.toFixed(2)} € avec OM Coin (-5%)`);
    cart = [];
    updateCartCount();
    closeCart();
}

function bookTicket(matchId) {
    showToast('🎟️ Redirection vers la billetterie...');
}

function buyFanTicket(ticketId) {
    const ticket = fanTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // Ouvrir le modal de choix de paiement avec BNPL
    ouvrirChoixPaiement({
        name: ticket.match,
        price: ticket.price,
        type: 'Billet Fan-to-Fan'
    });
}

function buyNFT(nftId) {
    const nft = nftMarketplace.find(n => n.id === nftId);
    if (!nft) return;
    
    // Ouvrir le modal de choix de paiement avec BNPL
    ouvrirChoixPaiement({
        name: nft.title,
        price: nft.price,
        type: 'NFT Marketplace'
    });
}

function sendMoney(contactName) {
    // Utiliser la nouvelle fonction avec autocomplétion
    if (typeof envoyerArgentAmi === 'function') {
        envoyerArgentAmi();
    } else {
        showToast(`💸 Envoi d'argent à ${contactName}...`);
    }
}

// === NAVIGATION ===

function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            switchSection(section);
        });
    });
}

function switchSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Show target section
    document.getElementById(`${sectionName}Section`).classList.add('active');
    
    // Update nav
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    currentSection = sectionName;
}

// === AI CHATBOT - REMOVED FOR PROFESSIONAL LOOK ===
// IA Triviat supprimée pour un look plus professionnel

// === LÉGENDES - INTERACTIONS ===

function soutenirAssociation(ambassadeurId) {
    const amb = ambassadeurs.find(a => a.id === ambassadeurId);
    if (!amb || !amb.association) return;
    
    const montant = prompt(`Soutenir ${amb.association.name}\n\nCombien souhaitez-vous donner ? (en €)`);
    if (montant && !isNaN(montant) && montant > 0) {
        // Simuler le paiement via PaieCash
        alert(`✅ Paiement effectué par PaieCash\n\n💝 Merci pour votre don de ${montant}€ à ${amb.association.name}!\n\n🏦 Traitement par PaieCash (marque blanche PaieCash)`);
        
        // Mettre à jour le montant collecté
        amb.association.raised += parseInt(montant);
        renderAmbassadeurs();
    }
}

function acheterNFTLegende(ambassadeurId) {
    const amb = ambassadeurs.find(a => a.id === ambassadeurId);
    if (!amb || !amb.nft || !amb.nft.available) return;
    
    const confirm = window.confirm(`Acheter le NFT de ${amb.name}\n\nPrix: ${amb.nft.price} OMC\n(équivalent ${amb.nft.price}€)\n\nConfirmer l'achat ?`);
    
    if (confirm) {
        // Simuler l'achat via PaieCash
        alert(`✅ Paiement effectué par PaieCash\n\n🎨 NFT "${amb.name}" acheté avec succès!\n💰 ${amb.nft.price} OMC débités\n📦 Le NFT a été ajouté à votre wallet`);
        
        // Ajouter à l'historique
        ajouterTransaction({
            type: 'NFT Légende',
            description: `NFT ${amb.name}`,
            montant: amb.nft.price,
            devise: 'OMC',
            statut: 'Complété'
        });
        
        // Ajouter au panier ou wallet
        addToCart({
            type: 'nft',
            name: `NFT ${amb.name}`,
            price: amb.nft.price,
            currency: 'OMC'
        });
    }
}

// === CART ===

function initCart() {
    document.getElementById('floatingCart').addEventListener('click', openCart);
}

// === PAYMENT METHODS (PaieCash) ===

function initPaymentMethods() {
    // Already defined in HTML onclick handlers
}

// === WALLET - GESTION DES COINS ===

// === OUVRIR UN PARTENAIRE DE PAIEMENT ===
function ouvrirPartenaire(nomPartenaire, urlPartenaire) {
    const utilisateur = obtenirUtilisateurConnecte();
    
    if (!utilisateur) {
        alert('❌ Erreur\n\nVous devez être connecté pour utiliser les partenaires');
        return;
    }
    
    // Catalogues de produits par partenaire
    const catalogues = {
        "McDonald's": [
            { id: 1, nom: "Big Mac Menu", prix: 9.50, categorie: "Menu" },
            { id: 2, nom: "Royal Cheese Menu", prix: 9.50, categorie: "Menu" },
            { id: 3, nom: "Chicken McNuggets (9p)", prix: 6.50, categorie: "Menu" },
            { id: 4, nom: "McFlurry Daim", prix: 3.90, categorie: "Dessert" },
            { id: 5, nom: "Frites Moyennes", prix: 2.90, categorie: "Accompagnement" }
        ],
        "Carrefour": [
            { id: 1, nom: "Pack Eau 6x1.5L", prix: 3.50, categorie: "Boissons" },
            { id: 2, nom: "Baguette Tradition", prix: 1.20, categorie: "Boulangerie" },
            { id: 3, nom: "Poulet Rôti", prix: 8.90, categorie: "Traiteur" },
            { id: 4, nom: "Fruits & Légumes (1kg)", prix: 5.00, categorie: "Frais" },
            { id: 5, nom: "Lait Demi-Écrémé 1L", prix: 1.30, categorie: "Produits Laitiers" }
        ],
        "Uber Eats": [
            { id: 1, nom: "Pizza Margherita", prix: 12.00, categorie: "Italien" },
            { id: 2, nom: "Burger Classique", prix: 11.50, categorie: "Américain" },
            { id: 3, nom: "Sushi Box (12p)", prix: 15.90, categorie: "Japonais" },
            { id: 4, nom: "Poke Bowl", prix: 13.50, categorie: "Hawaïen" },
            { id: 5, nom: "Tacos 3 Viandes", prix: 9.00, categorie: "Mexicain" }
        ],
        "Décathlon": [
            { id: 1, nom: "Ballon Football Kipsta", prix: 19.99, categorie: "Football" },
            { id: 2, nom: "Chaussures Running", prix: 49.99, categorie: "Running" },
            { id: 3, nom: "T-shirt Sport", prix: 9.99, categorie: "Vêtements" },
            { id: 4, nom: "Gourde 750ml", prix: 7.99, categorie: "Accessoires" },
            { id: 5, nom: "Tapis de Yoga", prix: 24.99, categorie: "Fitness" }
        ],
        "Fnac": [
            { id: 1, nom: "Casque Bluetooth", prix: 79.99, categorie: "Audio" },
            { id: 2, nom: "Livre Bestseller", prix: 19.90, categorie: "Livres" },
            { id: 3, nom: "Manette PS5", prix: 69.99, categorie: "Gaming" },
            { id: 4, nom: "Film Blu-Ray 4K", prix: 24.99, categorie: "Films" },
            { id: 5, nom: "Album Vinyle", prix: 29.90, categorie: "Musique" }
        ],
        "Sephora": [
            { id: 1, nom: "Parfum Eau de Toilette", prix: 65.00, categorie: "Parfums" },
            { id: 2, nom: "Rouge à Lèvres Mat", prix: 24.90, categorie: "Maquillage" },
            { id: 3, nom: "Crème Hydratante", prix: 32.50, categorie: "Soins" },
            { id: 4, nom: "Palette Yeux", prix: 45.00, categorie: "Maquillage" },
            { id: 5, nom: "Masque Cheveux", prix: 18.90, categorie: "Cheveux" }
        ]
    };
    
    const produits = catalogues[nomPartenaire] || [];
    
    if (produits.length === 0) {
        alert('❌ Catalogue non disponible pour ce partenaire');
        return;
    }
    
    // Afficher le catalogue
    let catalogue = `🛒 ${nomPartenaire} - Catalogue\n\n`;
    catalogue += `✅ Wallet PaieCash connecté\n`;
    catalogue += `💰 Solde : ${utilisateur.solde.toFixed(2)} EUR\n\n`;
    catalogue += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    produits.forEach((p, index) => {
        catalogue += `${index + 1}. ${p.nom}\n`;
        catalogue += `   ${p.prix.toFixed(2)}€ | ${p.categorie}\n\n`;
    });
    
    catalogue += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    catalogue += `Entrez le numéro du produit (1-${produits.length})\n`;
    catalogue += `Ou "panier" pour voir votre panier`;
    
    const choix = prompt(catalogue);
    
    if (!choix) return;
    
    if (choix.toLowerCase() === 'panier') {
        afficherPanierPartenaire(nomPartenaire, produits);
        return;
    }
    
    const index = parseInt(choix) - 1;
    
    if (index >= 0 && index < produits.length) {
        ajouterAuPanierPartenaire(nomPartenaire, produits[index]);
    } else {
        alert('❌ Choix invalide');
    }
}

// === PANIER PARTENAIRE ===
window.panierPartenaire = {};

function ajouterAuPanierPartenaire(nomPartenaire, produit) {
    if (!window.panierPartenaire[nomPartenaire]) {
        window.panierPartenaire[nomPartenaire] = [];
    }
    
    // Vérifier si le produit est déjà dans le panier
    const existant = window.panierPartenaire[nomPartenaire].find(p => p.id === produit.id);
    
    if (existant) {
        existant.quantite++;
    } else {
        window.panierPartenaire[nomPartenaire].push({...produit, quantite: 1});
    }
    
    // Calculer le total actuel du panier
    const panier = window.panierPartenaire[nomPartenaire];
    let totalPanier = 0;
    panier.forEach(item => {
        totalPanier += item.prix * item.quantite;
    });
    
    // Calculer le cashback
    const cashbackPourcent = {
        "McDonald's": 5,
        "Carrefour": 3,
        "Uber Eats": 4,
        "Décathlon": 6,
        "Fnac": 3,
        "Sephora": 4
    };
    const cashback = (totalPanier * (cashbackPourcent[nomPartenaire] || 0)) / 100;
    
    // Message simplifié avec choix direct
    const action = prompt(
        `✅ Produit ajouté !\n\n` +
        `${produit.nom} - ${produit.prix.toFixed(2)}€\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🛒 Panier : ${panier.length} article(s)\n` +
        `💰 Total : ${totalPanier.toFixed(2)}€\n` +
        `🎁 Cashback : +${cashback.toFixed(2)}€\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `1. Payer maintenant (${totalPanier.toFixed(2)}€)\n` +
        `2. Ajouter un autre produit\n\n` +
        `Tapez 1 ou 2 :`
    );
    
    if (action === '1') {
        // Payer directement
        afficherPanierPartenaire(nomPartenaire, []);
    } else if (action === '2') {
        // Continuer les achats
        ouvrirPartenaire(nomPartenaire, '');
    } else if (action) {
        // Si l'utilisateur tape autre chose, redemander
        alert('❌ Veuillez taper 1 ou 2');
        ajouterAuPanierPartenaire(nomPartenaire, produit);
    }
}

function afficherPanierPartenaire(nomPartenaire, tousLesProduits) {
    const panier = window.panierPartenaire[nomPartenaire] || [];
    
    if (panier.length === 0) {
        const continuer = confirm(
            `🛒 Panier vide\n\n` +
            `Votre panier ${nomPartenaire} est vide.\n\n` +
            `Voulez-vous continuer vos achats ?`
        );
        
        if (continuer) {
            ouvrirPartenaire(nomPartenaire, '');
        }
        return;
    }
    
    let total = 0;
    let recapPanier = `🛒 Panier ${nomPartenaire}\n\n`;
    
    panier.forEach((item, index) => {
        const sousTotal = item.prix * item.quantite;
        total += sousTotal;
        recapPanier += `${index + 1}. ${item.nom}\n`;
        recapPanier += `   ${item.prix.toFixed(2)}€ x${item.quantite} = ${sousTotal.toFixed(2)}€\n\n`;
    });
    
    // Calculer le cashback
    const cashbackPourcent = {
        "McDonald's": 5,
        "Carrefour": 3,
        "Uber Eats": 4,
        "Décathlon": 6,
        "Fnac": 3,
        "Sephora": 4
    };
    
    const cashback = (total * (cashbackPourcent[nomPartenaire] || 0)) / 100;
    
    recapPanier += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    recapPanier += `Total : ${total.toFixed(2)}€\n`;
    recapPanier += `🎁 Cashback ${cashbackPourcent[nomPartenaire]}% : +${cashback.toFixed(2)}€\n\n`;
    recapPanier += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Aller directement au paiement
    payerPanierPartenaire(nomPartenaire, panier, total, cashback);
}

function payerPanierPartenaire(nomPartenaire, panier, total, cashback) {
    const utilisateur = obtenirUtilisateurConnecte();
    
    if (!utilisateur) {
        alert('❌ Erreur : Utilisateur non connecté');
        return;
    }
    
    const soldeEUR = utilisateur.solde || 0;
    const soldeOMC = utilisateur.soldeOMC || 0;
    
    // Choix du mode de paiement
    const modePaiement = prompt(
        `💳 Choisir le mode de paiement\n\n` +
        `Total à payer : ${total.toFixed(2)}€\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `1. EUR (Solde : ${soldeEUR.toFixed(2)}€)\n` +
        `2. OM Coin (Solde : ${soldeOMC.toFixed(2)} OMC)\n` +
        `3. BNPL 3x sans frais\n` +
        `4. BNPL 4x sans frais\n\n` +
        `Tapez 1, 2, 3 ou 4 :`
    );
    
    if (!modePaiement) return;
    
    let modeTexte = '';
    let soldeApres = 0;
    let devise = '';
    
    if (modePaiement === '1') {
        if (soldeEUR < total) {
            alert(`❌ Solde insuffisant\n\nVous avez : ${soldeEUR.toFixed(2)}€\nIl faut : ${total.toFixed(2)}€`);
            return;
        }
        modeTexte = 'EUR';
        soldeApres = soldeEUR - total;
        devise = 'EUR';
    } else if (modePaiement === '2') {
        if (soldeOMC < total) {
            alert(`❌ Solde insuffisant\n\nVous avez : ${soldeOMC.toFixed(2)} OMC\nIl faut : ${total.toFixed(2)} OMC`);
            return;
        }
        modeTexte = 'OM Coin';
        soldeApres = soldeOMC - total;
        devise = 'OMC';
    } else if (modePaiement === '3' || modePaiement === '4') {
        const nbFois = modePaiement === '3' ? 3 : 4;
        const montantMensuel = total / nbFois;
        modeTexte = `BNPL ${nbFois}x sans frais`;
        devise = 'EUR';
        
        alert(
            `💳 BNPL ${nbFois}x sans frais\n\n` +
            `Total : ${total.toFixed(2)}€\n` +
            `Mensualité : ${montantMensuel.toFixed(2)}€\n\n` +
            `Échéances :\n` +
            `• Aujourd'hui : ${montantMensuel.toFixed(2)}€\n` +
            Array.from({length: nbFois - 1}, (_, i) => 
                `• Dans ${i + 1} mois : ${montantMensuel.toFixed(2)}€`
            ).join('\n')
        );
    } else {
        alert('❌ Choix invalide');
        return;
    }
    
    // Vérifier code secret si >30€
    if (total > 30 && utilisateur.codeSecret) {
        const code = prompt(`🔐 Code Secret Requis\n\nMontant > 30€\n\nEntrez votre code à 4 chiffres :`);
        
        if (code !== utilisateur.codeSecret) {
            alert('❌ Code secret incorrect');
            return;
        }
    }
    
    // Confirmation finale
    const confirmation = confirm(
        `✅ CONFIRMER LE PAIEMENT\n\n` +
        `${nomPartenaire}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Montant : ${total.toFixed(2)}€\n` +
        `Mode : ${modeTexte}\n` +
        `Cashback : +${cashback.toFixed(2)}€\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Confirmer le paiement ?`
    );
    
    if (!confirmation) return;
    
    // Effectuer le paiement
    if (devise === 'EUR') {
        utilisateur.solde = soldeApres;
        utilisateur.solde += cashback; // Ajouter le cashback
    } else if (devise === 'OMC') {
        utilisateur.soldeOMC = soldeApres;
        utilisateur.soldeOMC += cashback; // Ajouter le cashback
    }
    
    // Sauvegarder
    localStorage.setItem('utilisateurConnecte', JSON.stringify(utilisateur));
    mettreAJourProfil({
        solde: utilisateur.solde,
        soldeOMC: utilisateur.soldeOMC
    });
    
    // Ajouter à l'historique
    if (typeof ajouterTransaction === 'function') {
        ajouterTransaction({
            type: `Achat ${nomPartenaire}`,
            description: `${panier.length} article(s)`,
            montant: -total,
            devise: devise,
            statut: 'Validé',
            cashback: cashback
        });
    }
    
    // Vider le panier
    window.panierPartenaire[nomPartenaire] = [];
    
    // Message de succès
    alert(
        `✅ PAIEMENT RÉUSSI !\n\n` +
        `${nomPartenaire}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `💰 Montant débité : ${total.toFixed(2)} ${devise}\n` +
        `🎁 Cashback crédité : +${cashback.toFixed(2)} ${devise}\n\n` +
        `Nouveau solde ${devise} : ${devise === 'EUR' ? utilisateur.solde.toFixed(2) : utilisateur.soldeOMC.toFixed(2)}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📧 Confirmation envoyée par email\n` +
        `🧾 Reçu disponible dans "Transactions"\n\n` +
        `Merci pour votre achat ! 🎉`
    );
}

function ouvrirCoin(nomCoin, symboleCoin, soldeActuel) {
    const action = prompt(`💰 ${nomCoin} (${symboleCoin})\n\nSolde actuel: ${soldeActuel} ${symboleCoin}\n(équivalent ${soldeActuel}€)\n\nQue souhaitez-vous faire ?\n\n1. Acheter plus de ${symboleCoin}\n2. Échanger vers un autre coin\n3. Envoyer à un ami\n\nTapez 1, 2 ou 3 :`);
    
    if (action === '1') {
        // Utiliser la nouvelle fonction avec débit OM Coin
        if (typeof acheterCoinAvecDebit === 'function') {
            acheterCoinAvecDebit(nomCoin, symboleCoin, soldeActuel);
        } else {
            acheterCoin(nomCoin, symboleCoin);
        }
    } else if (action === '2') {
        // Utiliser la nouvelle fonction avec EURC/USDT
        if (typeof echangerCoin === 'function' && echangerCoin.length === 2) {
            echangerCoin(symboleCoin, soldeActuel);
        } else {
            echangerCoinAncien(nomCoin, symboleCoin, soldeActuel);
        }
    } else if (action === '3') {
        // Utiliser la nouvelle fonction avec autocomplétion
        if (typeof envoyerOMCoin === 'function') {
            envoyerOMCoin();
        } else {
            envoyerCoin(nomCoin, symboleCoin, soldeActuel);
        }
    }
}

function acheterCoin(nomCoin, symboleCoin) {
    const montant = prompt(`Acheter ${nomCoin} (${symboleCoin})\n\nCombien souhaitez-vous acheter ? (en €)\n\n💡 1 ${symboleCoin} = 1 EUR (stablecoin)`);
    
    if (montant && !isNaN(montant) && montant > 0) {
        const confirm = window.confirm(`Confirmer l'achat\n\n💰 ${montant} ${symboleCoin}\nCoût: ${montant}€\n\nPayer avec PaieCash ?`);
        
        if (confirm) {
            alert(`✅ Paiement effectué par PaieCash\n\n💰 ${montant} ${symboleCoin} achetés avec succès!\n💳 ${montant}€ débités\n\n🏦 Transaction validée par PaieCash\n📊 Nouveau solde mis à jour dans votre wallet`);
        }
    }
}

function echangerCoinAncien(nomCoinSource, symboleCoinSource, soldeActuel) {
    const montant = prompt(`Échanger ${nomCoinSource}\n\nSolde disponible: ${soldeActuel} ${symboleCoinSource}\n\nCombien souhaitez-vous échanger ?`);
    
    if (montant && !isNaN(montant) && montant > 0 && montant <= soldeActuel) {
        const coinDest = prompt(`Vers quel coin échanger ?\n\n1. OM Coin (OMC)\n2. PSG Coin (PSC)\n3. OL Coin (OLC)\n4. Monaco Coin (ASC)\n5. LOSC Coin (LSC)\n6. Lens Coin (RCL)\n\nTapez le numéro :`);
        
        const coins = ['OMC', 'PSC', 'OLC', 'ASC', 'LSC', 'RCL'];
        const coinsNoms = ['OM Coin', 'PSG Coin', 'OL Coin', 'Monaco Coin', 'LOSC Coin', 'Lens Coin'];
        
        if (coinDest >= 1 && coinDest <= 6) {
            const coinDestSymbole = coins[coinDest - 1];
            const coinDestNom = coinsNoms[coinDest - 1];
            
            alert(`✅ Échange effectué par PaieCash\n\n🔄 ${montant} ${symboleCoinSource} → ${montant} ${coinDestSymbole}\n\n🏦 Transaction validée par PaieCash (marque blanche)\n📊 Vos soldes ont été mis à jour\n\n💡 Parité 1:1 entre tous les stablecoins clubs`);
        }
    } else if (montant > soldeActuel) {
        alert('❌ Solde insuffisant');
    }
}

function envoyerCoin(nomCoin, symboleCoin, soldeActuel) {
    const destinataire = prompt(`Envoyer ${nomCoin}\n\nSolde disponible: ${soldeActuel} ${symboleCoin}\n\nAdresse du destinataire ou nom d'ami :`);
    
    if (destinataire) {
        const montant = prompt(`Combien de ${symboleCoin} envoyer à ${destinataire} ?`);
        
        if (montant && !isNaN(montant) && montant > 0 && montant <= soldeActuel) {
            alert(`✅ Envoi effectué par PaieCash\n\n💸 ${montant} ${symboleCoin} envoyés à ${destinataire}\n\n🏦 Transaction validée par PaieCash\n📊 Nouveau solde: ${soldeActuel - montant} ${symboleCoin}\n📧 ${destinataire} a été notifié`);
        } else if (montant > soldeActuel) {
            alert('❌ Solde insuffisant');
        }
    }
}

function showQRCode() {
    showToast('📱 Génération du QR Code PaieCash...');
}

function createPaymentLink() {
    showToast('🔗 Création du lien de paiement PaieCash...');
}

function enableNFC() {
    showToast('📡 Activation du paiement NFC...');
}

function copyAddress() {
    const address = document.getElementById('walletAddress').textContent;
    navigator.clipboard.writeText(address);
    showToast('📋 Adresse copiée !');
}

// === WALLET TOGGLES ===

function initWalletToggles() {
    const toggleBalance = document.getElementById('toggleBalance');
    const cardBalance = document.getElementById('cardBalance');
    let balanceVisible = true;
    
    toggleBalance.addEventListener('click', () => {
        balanceVisible = !balanceVisible;
        cardBalance.textContent = balanceVisible ? '1 247,50 €' : '••• €';
        toggleBalance.textContent = balanceVisible ? '👁️' : '👁️‍🗨️';
    });
    
    const toggleAddress = document.getElementById('toggleAddress');
    const walletAddress = document.getElementById('walletAddress');
    const fullAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f8f3a';
    let addressVisible = true;
    
    toggleAddress.addEventListener('click', () => {
        addressVisible = !addressVisible;
        walletAddress.textContent = addressVisible ? fullAddress : '0x••••••••';
    });
}

// === P2P SEARCH ===

function initP2PSearch() {
    const searchInput = document.getElementById('p2pSearch');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const contacts = document.querySelectorAll('.contact-card');
        
        contacts.forEach(contact => {
            const name = contact.dataset.name;
            const phone = contact.dataset.phone;
            const wallet = contact.dataset.wallet;
            
            const matches = name.includes(query) || phone.includes(query) || wallet.includes(query);
            contact.style.display = matches ? 'flex' : 'none';
        });
    });
}

// === UTILITIES ===

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// === CATEGORY FILTER ===

document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.cat;
            filterProducts(category);
        });
    });
});

function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        if (category === 'all') {
            product.style.display = 'block';
        } else {
            const productCategory = product.dataset.category;
            product.style.display = productCategory === category ? 'block' : 'none';
        }
    });
}