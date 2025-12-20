// ========================================
// RÉGIE PUBLICITAIRE - SPONSORS CROSS-MARKET
// Gestion des sponsors pour clubs et fédérations
// Inspiré du modèle FIFA avec interaction fans
// ========================================

// ========== CATÉGORIES DE SPONSORS ==========

// 🚗 AUTOMOBILE - Constructeurs & Mobilité
const sponsorsAutomobile = [
    { 
        name: 'Hyundai', 
        logo: 'https://logo.clearbit.com/hyundai.com',
        category: 'Automobile',
        type: 'Constructeur',
        description: 'Partenaire FIFA officiel',
        budget: 'Premium',
        avantages: ['Visibilité mondiale', 'Association prestige', 'Activation événements'],
        zones: ['Monde'],
        contact: 'sports-marketing@hyundai.com'
    },
    { 
        name: 'Kia', 
        logo: 'https://logo.clearbit.com/kia.com',
        category: 'Automobile',
        type: 'Constructeur',
        description: 'Partenaire mobilité sportive',
        budget: 'Premium',
        avantages: ['Visibilité stade', 'Offres exclusives fans', 'Test drive événements'],
        zones: ['Europe', 'Asie'],
        contact: 'sponsoring@kia.com'
    },
    { 
        name: 'Volkswagen', 
        logo: 'https://logo.clearbit.com/volkswagen.com',
        category: 'Automobile',
        type: 'Constructeur',
        description: 'Partenaire football européen',
        budget: 'Premium',
        avantages: ['Exposition médiatique', 'Activations locales', 'Programme fidélité'],
        zones: ['Europe'],
        contact: 'sports@volkswagen.com'
    },
    { 
        name: 'Renault', 
        logo: 'https://logo.clearbit.com/renault.com',
        category: 'Automobile',
        type: 'Constructeur',
        description: 'Partenaire mobilité intelligente',
        budget: 'Standard',
        avantages: ['Présence digitale', 'Offres fans', 'Essais véhicules'],
        zones: ['Europe', 'Afrique'],
        contact: 'marketing-sports@renault.com'
    },
    { 
        name: 'BMW', 
        logo: 'https://logo.clearbit.com/bmw.com',
        category: 'Automobile',
        type: 'Constructeur Premium',
        description: 'Excellence et performance',
        budget: 'Premium',
        avantages: ['VIP expérience', 'Véhicules officiels', 'Loges prestige'],
        zones: ['Monde'],
        contact: 'sports-sponsoring@bmw.com'
    }
];

// ✈️ TRANSPORT AÉRIEN - Compagnies & Mobilité internationale
const sponsorsAerien = [
    { 
        name: 'Emirates', 
        logo: 'https://logo.clearbit.com/emirates.com',
        category: 'Aérien',
        type: 'Compagnie aérienne',
        description: 'Partenaire FIFA officiel',
        budget: 'Premium',
        avantages: ['Visibilité mondiale', 'Transport équipes', 'Offres voyages fans'],
        zones: ['Monde'],
        contact: 'sponsorship@emirates.com'
    },
    { 
        name: 'Qatar Airways', 
        logo: 'https://logo.clearbit.com/qatarairways.com',
        category: 'Aérien',
        type: 'Compagnie aérienne',
        description: 'Excellence voyages sportifs',
        budget: 'Premium',
        avantages: ['Transport officiel', 'Réductions fans', 'Expérience premium'],
        zones: ['Monde'],
        contact: 'sports@qatarairways.com'
    },
    { 
        name: 'Air France', 
        logo: 'https://logo.clearbit.com/airfrance.com',
        category: 'Aérien',
        type: 'Compagnie aérienne',
        description: 'Partenaire football français',
        budget: 'Standard',
        avantages: ['Vols dédiés', 'Miles bonus fans', 'Packages matchs'],
        zones: ['Europe', 'Afrique'],
        contact: 'sponsoring@airfrance.com'
    },
    { 
        name: 'Etihad Airways', 
        logo: 'https://logo.clearbit.com/etihad.com',
        category: 'Aérien',
        type: 'Compagnie aérienne',
        description: 'Innovation transport sportif',
        budget: 'Premium',
        avantages: ['Charters équipes', 'Programmes fidélité', 'Expériences VIP'],
        zones: ['Moyen-Orient', 'Asie', 'Europe'],
        contact: 'sports-marketing@etihad.com'
    },
    { 
        name: 'Turkish Airlines', 
        logo: 'https://logo.clearbit.com/turkishairlines.com',
        category: 'Aérien',
        type: 'Compagnie aérienne',
        description: 'Connecter les fans au monde',
        budget: 'Standard',
        avantages: ['Réseau mondial', 'Offres supporters', 'Transport délégations'],
        zones: ['Europe', 'Asie', 'Afrique'],
        contact: 'sponsorship@turkishairlines.com'
    }
];

// 🏦 BANQUES & SERVICES FINANCIERS - Paiement & Fintech
const sponsorsBanques = [
    { 
        name: 'Visa', 
        logo: 'https://logo.clearbit.com/visa.com',
        category: 'Banque',
        type: 'Paiement',
        description: 'Partenaire FIFA officiel',
        budget: 'Premium',
        avantages: ['Paiements stade', 'Offres cartes', 'Cashback fans'],
        zones: ['Monde'],
        contact: 'sports-sponsorship@visa.com'
    },
    { 
        name: 'Mastercard', 
        logo: 'https://logo.clearbit.com/mastercard.com',
        category: 'Banque',
        type: 'Paiement',
        description: 'Expériences inestimables',
        budget: 'Premium',
        avantages: ['Paiements sans contact', 'Accès VIP', 'Programmes fidélité'],
        zones: ['Monde'],
        contact: 'sponsorship@mastercard.com'
    },
    { 
        name: 'BNP Paribas', 
        logo: 'https://logo.clearbit.com/bnpparibas.com',
        category: 'Banque',
        type: 'Banque universelle',
        description: 'Partenaire tennis & football',
        budget: 'Premium',
        avantages: ['Solutions financement clubs', 'Offres supporters', 'Investissements'],
        zones: ['Europe', 'Afrique'],
        contact: 'sports-sponsoring@bnpparibas.com'
    },
    { 
        name: 'Société Générale', 
        logo: 'https://logo.clearbit.com/societegenerale.com',
        category: 'Banque',
        type: 'Banque',
        description: 'Banque du sport',
        budget: 'Standard',
        avantages: ['Comptes dédiés', 'Cartes supporters', 'Prêts clubs'],
        zones: ['Europe', 'Afrique'],
        contact: 'marketing-sports@societegenerale.com'
    },
    { 
        name: 'PayPal', 
        logo: 'https://logo.clearbit.com/paypal.com',
        category: 'Banque',
        type: 'Paiement digital',
        description: 'Paiements sécurisés en ligne',
        budget: 'Standard',
        avantages: ['Billetterie en ligne', 'Boutique club', 'Cashback'],
        zones: ['Monde'],
        contact: 'partnerships@paypal.com'
    }
];

// 📱 TÉLÉCOMMUNICATIONS - Connectivité & Digital
const sponsorsTelecom = [
    { 
        name: 'Samsung', 
        logo: 'https://logo.clearbit.com/samsung.com',
        category: 'Télécom',
        type: 'Technologie',
        description: 'Innovation mobile & TV',
        budget: 'Premium',
        avantages: ['Écrans géants', 'Apps mobiles', 'Contenus exclusifs'],
        zones: ['Monde'],
        contact: 'sports-marketing@samsung.com'
    },
    { 
        name: 'Vodafone', 
        logo: 'https://logo.clearbit.com/vodafone.com',
        category: 'Télécom',
        type: 'Opérateur',
        description: 'Connecter les fans',
        budget: 'Premium',
        avantages: ['5G stades', 'Streaming matchs', 'Offres abonnés'],
        zones: ['Europe', 'Afrique'],
        contact: 'sponsorship@vodafone.com'
    },
    { 
        name: 'Orange', 
        logo: 'https://logo.clearbit.com/orange.com',
        category: 'Télécom',
        type: 'Opérateur',
        description: 'Partenaire football africain',
        budget: 'Standard',
        avantages: ['Réseau stades', 'Contenus mobiles', 'Forfaits fans'],
        zones: ['Europe', 'Afrique', 'Moyen-Orient'],
        contact: 'sports@orange.com'
    },
    { 
        name: 'Huawei', 
        logo: 'https://logo.clearbit.com/huawei.com',
        category: 'Télécom',
        type: 'Technologie',
        description: 'Innovation 5G & cloud',
        budget: 'Premium',
        avantages: ['Infrastructure digitale', 'Smart stadiums', 'Cloud services'],
        zones: ['Asie', 'Europe', 'Afrique'],
        contact: 'sports-sponsorship@huawei.com'
    },
    { 
        name: 'MTN', 
        logo: 'https://logo.clearbit.com/mtn.com',
        category: 'Télécom',
        type: 'Opérateur',
        description: 'Leader télécom africain',
        budget: 'Standard',
        avantages: ['Couverture stades', 'Diffusion matchs', 'Offres locales'],
        zones: ['Afrique'],
        contact: 'sponsorship@mtn.com'
    }
];

// 🍔 FOOD & BEVERAGE - Alimentation & Boissons
const sponsorsFoodBeverage = [
    { 
        name: 'Coca-Cola', 
        logo: 'https://logo.clearbit.com/coca-cola.com',
        category: 'Food & Beverage',
        type: 'Boissons',
        description: 'Partenaire FIFA historique',
        budget: 'Premium',
        avantages: ['Distribution exclusive', 'Activations fans', 'Trophées'],
        zones: ['Monde'],
        contact: 'sports@coca-cola.com'
    },
    { 
        name: 'McDonald\'s', 
        logo: 'https://logo.clearbit.com/mcdonalds.com',
        category: 'Food & Beverage',
        type: 'Restauration',
        description: 'Partenaire restauration FIFA',
        budget: 'Premium',
        avantages: ['Restauration stades', 'Programmes enfants', 'Offres matchs'],
        zones: ['Monde'],
        contact: 'sponsorship@mcdonalds.com'
    },
    { 
        name: 'Budweiser', 
        logo: 'https://logo.clearbit.com/budweiser.com',
        category: 'Food & Beverage',
        type: 'Boissons alcoolisées',
        description: 'Bière officielle Coupe du Monde',
        budget: 'Premium',
        avantages: ['Distribution stades', 'Fan zones', 'Activations bars'],
        zones: ['Monde'],
        contact: 'sports-marketing@budweiser.com'
    },
    { 
        name: 'Heineken', 
        logo: 'https://logo.clearbit.com/heineken.com',
        category: 'Food & Beverage',
        type: 'Boissons',
        description: 'Partenaire UEFA Champions League',
        budget: 'Premium',
        avantages: ['Présence VIP', 'Campagnes fans', 'Événements'],
        zones: ['Monde'],
        contact: 'sponsorship@heineken.com'
    }
];

// ⚽ ÉQUIPEMENTIERS SPORTIFS - Matériel & Vêtements
const sponsorsEquipementiers = [
    { 
        name: 'Adidas', 
        logo: 'https://logo.clearbit.com/adidas.com',
        category: 'Équipementier',
        type: 'Sportswear',
        description: 'Partenaire FIFA officiel',
        budget: 'Premium',
        avantages: ['Ballon officiel', 'Équipements arbitres', 'Boutiques stades'],
        zones: ['Monde'],
        contact: 'sports-marketing@adidas.com'
    },
    { 
        name: 'Nike', 
        logo: 'https://logo.clearbit.com/nike.com',
        category: 'Équipementier',
        type: 'Sportswear',
        description: 'Leader équipements football',
        budget: 'Premium',
        avantages: ['Maillots équipes', 'Innovations produits', 'Marketing co-brandé'],
        zones: ['Monde'],
        contact: 'football@nike.com'
    },
    { 
        name: 'Puma', 
        logo: 'https://logo.clearbit.com/puma.com',
        category: 'Équipementier',
        type: 'Sportswear',
        description: 'Équipementier football africain',
        budget: 'Standard',
        avantages: ['Équipements sélections', 'Produits dérivés', 'Activations'],
        zones: ['Europe', 'Afrique'],
        contact: 'sponsorship@puma.com'
    }
];

// ========== PACKAGES DE SPONSORING ==========

const packagesSponsoring = {
    platinum: {
        name: 'Platinum Partner',
        prix: '500K - 2M€/an',
        avantages: [
            'Logo sur tous les supports digitaux',
            'Présence physique stade (panneaux LED, bannières)',
            'Activation événements (fan zones, concours)',
            'Contenus exclusifs fans (vidéos, interviews)',
            'Base de données fans (RGPD compliant)',
            'Packages VIP (loges, rencontres joueurs)',
            'Co-branding produits dérivés',
            'Analytics & rapports ROI'
        ]
    },
    gold: {
        name: 'Gold Partner',
        prix: '200K - 500K€/an',
        avantages: [
            'Logo site web & app mobile',
            'Bannières digitales stade',
            'Activation 5 événements/an',
            'Vidéos sponsorisées (3/mois)',
            'Accès base données (anonymisée)',
            'Packages VIP (50 places/an)',
            'Boutique co-brandée'
        ]
    },
    silver: {
        name: 'Silver Partner',
        prix: '50K - 200K€/an',
        avantages: [
            'Logo footer site web',
            'Bannières rotatives app',
            'Activation 2 événements/an',
            'Vidéos (1/mois)',
            'Packages VIP (20 places/an)',
            'Offres promotionnelles fans'
        ]
    },
    bronze: {
        name: 'Bronze Partner',
        prix: '10K - 50K€/an',
        avantages: [
            'Logo page partenaires',
            'Post réseaux sociaux',
            'Activation 1 événement/an',
            'Packages VIP (5 places/an)'
        ]
    }
};

// ========== FORMATS PUBLICITAIRES DIGITAUX ==========

const formatsPublicitaires = {
    video: {
        type: 'Vidéo',
        formats: ['Pre-roll (15s, 30s)', 'Mid-roll (30s)', 'Bannière vidéo', 'Stories'],
        tarifs: {
            'Pre-roll 15s': '5€ CPM',
            'Pre-roll 30s': '8€ CPM',
            'Mid-roll 30s': '10€ CPM',
            'Bannière vidéo': '12€ CPM',
            'Stories': '6€ CPM'
        }
    },
    display: {
        type: 'Display',
        formats: ['Bannière top', 'Bannière latérale', 'Interstitiel', 'Native ads'],
        tarifs: {
            'Bannière top': '3€ CPM',
            'Bannière latérale': '2€ CPM',
            'Interstitiel': '8€ CPM',
            'Native ads': '10€ CPM'
        }
    },
    social: {
        type: 'Réseaux sociaux',
        formats: ['Post sponsorisé', 'Story sponsorisée', 'Vidéo live', 'Concours'],
        tarifs: {
            'Post sponsorisé': '500€ - 5K€',
            'Story sponsorisée': '300€ - 2K€',
            'Vidéo live': '2K€ - 10K€',
            'Concours': '1K€ - 15K€'
        }
    },
    inApp: {
        type: 'In-App',
        formats: ['Push notification', 'In-app message', 'Wallet integration', 'Gamification'],
        tarifs: {
            'Push notification': '0.10€ par envoi',
            'In-app message': '5€ CPM',
            'Wallet integration': '15€ CPM',
            'Gamification': 'Sur devis'
        }
    }
};

// ========== TOUS LES SPONSORS ==========
const tousLesSponsors = [
    ...sponsorsAutomobile,
    ...sponsorsAerien,
    ...sponsorsBanques,
    ...sponsorsTelecom,
    ...sponsorsFoodBeverage,
    ...sponsorsEquipementiers
];

console.log('✅ Régie publicitaire chargée:');
console.log('🚗 Automobile:', sponsorsAutomobile.length, 'sponsors');
console.log('✈️ Aérien:', sponsorsAerien.length, 'sponsors');
console.log('🏦 Banques:', sponsorsBanques.length, 'sponsors');
console.log('📱 Télécom:', sponsorsTelecom.length, 'sponsors');
console.log('🍔 Food & Beverage:', sponsorsFoodBeverage.length, 'sponsors');
console.log('⚽ Équipementiers:', sponsorsEquipementiers.length, 'sponsors');
console.log('📊 TOTAL:', tousLesSponsors.length, 'sponsors disponibles');
