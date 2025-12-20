// ========================================
// 🌍 OM AFRIQUE - VISION FRANCHISE
// Partenariat Olympique de Marseille - Afrique
// ========================================

const OM_AFRIQUE = {
    // ========== MERCHANDISING PRIORITAIRE ==========
    merchandising: {
        // Textile ACCESSIBLE (5 000 - 15 000 FCFA)
        textile: [
            {
                id: 'om-afrique-tshirt-1',
                nom: 'T-shirt OM Africa Edition',
                description: 'Logo OM + mention "OM Africa" - Blanc',
                prix_eur: 15,
                prix_fcfa: 9850,
                image: '👕',
                category: 'textile',
                tailles: ['S', 'M', 'L', 'XL', 'XXL'],
                couleurs: ['Blanc', 'Bleu', 'Noir']
            },
            {
                id: 'om-afrique-tshirt-2',
                nom: 'T-shirt OM Côte d\'Ivoire',
                description: 'Logo OM + drapeau CI stylisé - Edition exclusive',
                prix_eur: 18,
                prix_fcfa: 11820,
                image: '👕',
                category: 'textile',
                exclusive: true
            },
            {
                id: 'om-afrique-casquette',
                nom: 'Casquette OM Africa',
                description: 'Casquette officielle OM Africa - Très forte demande',
                prix_eur: 12,
                prix_fcfa: 7875,
                image: '🧢',
                category: 'textile'
            },
            {
                id: 'om-afrique-maillot-lifestyle',
                nom: 'Maillot Lifestyle OM Street',
                description: 'Version "street" fans - PAS le maillot officiel',
                prix_eur: 25,
                prix_fcfa: 16400,
                image: '👚',
                category: 'textile'
            }
        ],
        
        // Accessoires du quotidien (forte demande)
        accessoires: [
            {
                id: 'om-afrique-sac',
                nom: 'Sac OM Africa',
                description: 'Sac / tote bag officiel',
                prix_eur: 10,
                prix_fcfa: 6560,
                image: '👜',
                category: 'accessoires'
            },
            {
                id: 'om-afrique-bonnet',
                nom: 'Bonnet OM',
                description: 'Bonnet officiel OM',
                prix_eur: 8,
                prix_fcfa: 5250,
                image: '🧢',
                category: 'accessoires'
            },
            {
                id: 'om-afrique-coque',
                nom: 'Coque téléphone OM',
                description: 'Coque iPhone/Android - Logo OM',
                prix_eur: 12,
                prix_fcfa: 7875,
                image: '📱',
                category: 'accessoires'
            },
            {
                id: 'om-afrique-portecles',
                nom: 'Porte-clés OM',
                description: 'Porte-clés officiel OM',
                prix_eur: 5,
                prix_fcfa: 3280,
                image: '🔑',
                category: 'accessoires'
            },
            {
                id: 'om-afrique-sacados',
                nom: 'Sac à dos scolaire OM',
                description: 'Parfait pour les jeunes & étudiants',
                prix_eur: 25,
                prix_fcfa: 16400,
                image: '🎒',
                category: 'accessoires'
            }
        ],
        
        // Collection Afrique Exclusive
        exclusive: [
            {
                id: 'om-afrique-exclusive-1',
                nom: 'T-shirt OM x Côte d\'Ivoire',
                description: 'OM 🇫🇷 + 🇨🇮 drapeau stylisé - "Fiers d\'être Marseillais, fiers d\'être Africains"',
                prix_eur: 22,
                prix_fcfa: 14430,
                image: '👕',
                category: 'exclusive',
                exclusive: true
            },
            {
                id: 'om-afrique-exclusive-2',
                nom: 'Maillot OM Passion Afrique',
                description: '"OM – Passion sans frontières" - Collection unique',
                prix_eur: 35,
                prix_fcfa: 22960,
                image: '👚',
                category: 'exclusive',
                exclusive: true
            }
        ]
    },
    
    // ========== CARTES CO-BRANDÉES ==========
    cartes: [
        {
            id: 'carte-om-fan',
            nom: 'Carte OM FAN x PaieCash',
            description: 'Carte bancaire co-brandée OM x PaieCash - Gratuite',
            prix_eur: 0,
            prix_fcfa: 0, // Gratuite
            avantages: [
                '✅ Cashback +2% sur produits OM',
                '✅ Réductions exclusives merchandising',
                '✅ Design exclusif OM Africa',
                '✅ NFC & Sans contact',
                '✅ Acceptée partout Mastercard'
            ],
            image: 'https://www.genspark.ai/api/files/s/mRvbluWz',
            type: 'FAN',
            design: {
                couleur_principale: '#0EA5E9',
                couleur_secondaire: '#1E40AF',
                logo_om: true,
                logo_paiecash: true,
                logo_mastercard: true,
                background_image: 'https://www.genspark.ai/api/files/s/mRvbluWz',
                mention: 'Official Partner Africa'
            }
        },
        {
            id: 'carte-om-vip',
            nom: 'Carte OM VIP x PaieCash',
            description: 'Carte premium avec avantages exclusifs VIP',
            prix_eur: 3,
            prix_fcfa: 1970,
            avantages: [
                '✅ Cashback +5% sur produits OM',
                '✅ Priorité billetterie',
                '✅ Accès événements exclusifs',
                '✅ NFC & Sans contact',
                '✅ Carte métal collector',
                '✅ Kit fan offert'
            ],
            image: 'https://www.genspark.ai/api/files/s/mRvbluWz',
            type: 'VIP',
            design: {
                couleur_principale: '#FFD700',
                couleur_secondaire: '#0EA5E9',
                logo_om: true,
                logo_paiecash: true,
                logo_mastercard: true,
                background_image: 'https://www.genspark.ai/api/files/s/mRvbluWz',
                mention: 'Premium VIP Member',
                materiau: 'métal'
            }
        }
    ],
    
    // ========== PACKS FAN OM CI ==========
    packs: [
        {
            id: 'pack-fan-om-ci-starter',
            nom: 'Pack Fan OM CI - Starter',
            description: 'Pack de démarrage pour nouveaux fans',
            prix_eur: 25,
            prix_fcfa: 16400,
            contenu: [
                '💳 Carte OM Africa Standard (gratuite)',
                '👕 T-shirt OM Africa',
                '🔑 Porte-clé OM',
                '💰 10€ cashback offert'
            ],
            image: '🎁',
            economie_eur: 12
        },
        {
            id: 'pack-fan-om-ci-premium',
            nom: 'Pack Fan OM CI - Premium',
            description: 'Pack complet pour vrais supporters',
            prix_eur: 55,
            prix_fcfa: 36080,
            contenu: [
                '💎 Carte OM Africa Premium',
                '👚 Maillot Lifestyle OM',
                '🧢 Casquette OM',
                '👜 Sac OM',
                '🔑 Porte-clé OM',
                '💰 25€ cashback offert'
            ],
            image: '🎁',
            economie_eur: 30
        },
        {
            id: 'pack-fan-om-ci-collector',
            nom: 'Pack Fan OM CI - Collector',
            description: 'Edition limitée Côte d\'Ivoire',
            prix_eur: 89,
            prix_fcfa: 58400,
            contenu: [
                '💎 Carte OM Africa Premium Métal',
                '👚 Maillot OM x CI Exclusif',
                '🧢 Casquette Edition limitée',
                '👜 Sac collector',
                '🎒 Sac à dos OM',
                '📱 Coque téléphone',
                '💰 50€ cashback offert',
                '🎟️ 1 ticket match offert (sous conditions)'
            ],
            image: '🏆',
            economie_eur: 60,
            edition_limitee: true
        }
    ],
    
    // ========== SYSTÈME CASHBACK AFRIQUE ==========
    cashback: {
        taux_base: 3, // 3% cashback de base
        taux_premium: 5, // 5% pour carte premium
        taux_exclusif: 7, // 7% sur produits Africa exclusifs
        bonus_premier_achat: 10 // 10€ offerts premier achat
    },
    
    // ========== ACTIVATIONS LOCALES ==========
    activations: {
        popupStores: [
            {
                ville: 'Abidjan',
                quartiers: ['Plateau', 'Cocody', 'Yopougon'],
                statut: 'planifié'
            },
            {
                ville: 'Bouaké',
                quartiers: ['Centre-ville'],
                statut: 'planifié'
            },
            {
                ville: 'Yamoussoukro',
                quartiers: ['Centre'],
                statut: 'planifié'
            }
        ],
        fanZones: {
            description: 'Fan zones lors des gros matchs OM',
            paiement_exclusif: 'PaieCashFan uniquement',
            offres: 'Carte OM offerte ou prix réduit'
        },
        influenceurs: {
            nombre_cible: 10,
            profil: 'Influenceurs sportifs ivoiriens',
            contenu: 'Promotion produits OM + PaieCashFan'
        }
    },
    
    // ========== SLOGANS & MESSAGES ==========
    messages: {
        slogan_principal: 'OM Africa - Passion sans frontières',
        slogans: [
            'Fiers d\'être Marseillais, fiers d\'être Africains',
            'Un club, une passion, un continent',
            'L\'OM dans votre cœur, l\'Afrique dans notre ADN'
        ],
        welcome_message: '🌍 Bienvenue dans la famille OM Africa !',
        cta_principal: '🛍️ Découvrir la collection OM Africa'
    }
};

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

function convertirEurVersXOF(montantEur) {
    const tauxChange = 655.957; // 1 EUR = 655.957 FCFA
    return Math.round(montantEur * tauxChange);
}

function getTousProduitsAfrique() {
    return [
        ...OM_AFRIQUE.merchandising.textile,
        ...OM_AFRIQUE.merchandising.accessoires,
        ...OM_AFRIQUE.merchandising.exclusive
    ];
}

function getPacksAfrique() {
    return OM_AFRIQUE.packs;
}

function getCartesAfrique() {
    return OM_AFRIQUE.cartes;
}

function calculerCashbackAfrique(montant, typeCarte = 'standard', produitExclusif = false) {
    let taux = OM_AFRIQUE.cashback.taux_base;
    
    if (typeCarte === 'premium') {
        taux = OM_AFRIQUE.cashback.taux_premium;
    }
    
    if (produitExclusif) {
        taux = OM_AFRIQUE.cashback.taux_exclusif;
    }
    
    return (montant * taux) / 100;
}

console.log('✅ OM Afrique Franchise - Données chargées');
console.log('🌍 Produits disponibles:', getTousProduitsAfrique().length);
console.log('🎁 Packs disponibles:', getPacksAfrique().length);
console.log('💳 Cartes disponibles:', getCartesAfrique().length);
