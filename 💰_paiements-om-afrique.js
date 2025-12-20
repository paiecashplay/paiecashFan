// ========================================
// 💰 MOYENS DE PAIEMENT OM AFRIQUE
// PaieCashFan x Olympique de Marseille
// ========================================

const PAIEMENTS_OM_AFRIQUE = {
    // ========== STABLECOIN OM ==========
    stablecoin: {
        code: 'OMC',
        nom: 'OM Coin',
        logo: '🔵⚪',
        description: 'Stablecoin officiel Olympique de Marseille',
        avantages: [
            'Cashback +10% sur achats OM',
            'Transactions instantanées',
            'Frais réduits (0.5%)',
            'Utilisable dans tout l\'écosystème OM'
        ],
        taux_change: {
            EUR: 1.00,
            FCFA: 655.957,
            USD: 1.10
        }
    },

    // ========== MOBILE MONEY AFRIQUE ==========
    mobile_money: [
        {
            id: 'orange-money',
            nom: 'Orange Money',
            logo: '🟠',
            pays: ['Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 'Cameroun', 'Guinée'],
            frais: '1% (min 100 FCFA, max 5000 FCFA)',
            limite_transaction: 2000000, // FCFA
            description: 'Paiement mobile le plus populaire en Afrique francophone',
            instructions: [
                '1. Composez #144# sur votre téléphone',
                '2. Sélectionnez "Transfert d\'argent"',
                '3. Entrez le numéro marchand PaieCashFan',
                '4. Confirmez avec votre code PIN'
            ]
        },
        {
            id: 'wave',
            nom: 'Wave',
            logo: '💙',
            pays: ['Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 'Bénin', 'Ouganda'],
            frais: 'GRATUIT (0%)',
            limite_transaction: 5000000, // FCFA
            description: 'Transferts gratuits et instantanés',
            instructions: [
                '1. Ouvrez l\'app Wave',
                '2. Scannez le QR code PaieCashFan',
                '3. Entrez le montant',
                '4. Confirmez avec votre code'
            ]
        },
        {
            id: 'mtn-mobile-money',
            nom: 'MTN Mobile Money',
            logo: '🟡',
            pays: ['Côte d\'Ivoire', 'Cameroun', 'Ghana', 'Nigeria', 'Ouganda', 'Bénin'],
            frais: '1.5% (min 100 FCFA, max 7500 FCFA)',
            limite_transaction: 3000000, // FCFA
            description: 'Mobile Money MTN - Large couverture africaine',
            instructions: [
                '1. Composez *133# sur votre téléphone',
                '2. Sélectionnez "Transfert d\'argent"',
                '3. Entrez le numéro marchand',
                '4. Validez avec votre PIN'
            ]
        },
        {
            id: 'moov-money',
            nom: 'Moov Money',
            logo: '🔵',
            pays: ['Côte d\'Ivoire', 'Bénin', 'Togo', 'Burkina Faso', 'Niger'],
            frais: '1.2% (min 150 FCFA, max 6000 FCFA)',
            limite_transaction: 2500000, // FCFA
            description: 'Moov Money - Paiement mobile simple et rapide',
            instructions: [
                '1. Composez #155# sur votre téléphone',
                '2. Choisissez "Paiement marchand"',
                '3. Entrez les infos PaieCashFan',
                '4. Confirmez'
            ]
        }
    ],

    // ========== CARTES BANCAIRES ==========
    cartes_bancaires: [
        {
            id: 'visa',
            nom: 'Visa',
            logo: '💳',
            zones: ['Europe', 'Afrique', 'Monde entier'],
            frais: '2.9% + 0.30€',
            description: 'Accepté dans le monde entier',
            monnaies: ['EUR', 'FCFA', 'USD', 'GBP']
        },
        {
            id: 'mastercard',
            nom: 'Mastercard',
            logo: '💳',
            zones: ['Europe', 'Afrique', 'Monde entier'],
            frais: '2.9% + 0.30€',
            description: 'Paiement sécurisé international',
            monnaies: ['EUR', 'FCFA', 'USD', 'GBP']
        },
        {
            id: 'carte-bancaire-ci',
            nom: 'Carte Bancaire CI',
            logo: '🇨🇮',
            zones: ['Côte d\'Ivoire', 'UEMOA'],
            frais: '1.5%',
            description: 'Cartes bancaires locales (GIM-UEMOA, Visa CI)',
            monnaies: ['FCFA']
        }
    ],

    // ========== CARTE PAIECASH OM ==========
    carte_paiecash_om: {
        nom: 'Carte PaieCash OM',
        logo: '💎',
        description: 'Carte co-brandée Olympique de Marseille x PaieCashFan',
        types: [
            {
                id: 'standard',
                nom: 'Carte OM Standard',
                prix: 0, // Gratuite
                prix_fcfa: 0,
                avantages: [
                    'Cashback +2% sur achats OM',
                    'Paiement en OMC, EUR, FCFA',
                    'Acceptée partout',
                    'Rechargeable par Orange Money, Wave, CB'
                ],
                inclus_dans: ['Pack Fan OM CI - Starter', 'Pack Supporter']
            },
            {
                id: 'premium',
                nom: 'Carte OM Premium',
                prix: 3,
                prix_fcfa: 1970,
                avantages: [
                    'Cashback +5% sur achats OM',
                    'Priorité billetterie',
                    'Accès événements exclusifs',
                    'Carte métal collector',
                    'Rechargeable tous moyens'
                ],
                inclus_dans: ['Pack Premium', 'Pack Collector']
            },
            {
                id: 'platine',
                nom: 'Carte OM Platine',
                prix: 5,
                prix_fcfa: 3280,
                avantages: [
                    'Cashback +10% sur achats OM',
                    'Conversion OMC automatique',
                    'Frais 0% sur recharges',
                    'Concierge VIP',
                    'Carte métal or',
                    'Tous moyens de paiement'
                ],
                inclus_dans: ['Abonnement Fan OM (annuel)']
            }
        ],
        recharge_par: [
            'Orange Money',
            'Wave',
            'MTN Mobile Money',
            'Moov Money',
            'Carte Bancaire',
            'Virement SEPA (Europe)',
            'OMC (Stablecoin OM)'
        ]
    },

    // ========== ABONNEMENTS FAN OM ==========
    abonnements: [
        {
            id: 'fan-om-mensuel',
            nom: 'Abonnement Fan OM - Mensuel',
            prix_eur: 9.99,
            prix_fcfa: 6550,
            description: 'Abonnement mensuel avec Carte OM incluse',
            inclus: [
                '💳 Carte PaieCash OM Standard (gratuite)',
                '🎁 Cashback +5% permanent',
                '🎟️ Réduction -10% billetterie',
                '🛍️ Réduction -15% boutique OM',
                '📱 Accès app premium',
                '🌍 Contenu exclusif OM Africa'
            ],
            paiement_accepte: ['OMC', 'Orange Money', 'Wave', 'Carte Bancaire']
        },
        {
            id: 'fan-om-annuel',
            nom: 'Abonnement Fan OM - Annuel',
            prix_eur: 99.99,
            prix_fcfa: 65600,
            economie: '2 mois gratuits',
            description: 'Abonnement annuel avec Carte OM Platine incluse',
            inclus: [
                '💎 Carte PaieCash OM Platine (gratuite)',
                '🎁 Cashback +10% permanent',
                '🎟️ Réduction -20% billetterie + priorité',
                '🛍️ Réduction -25% boutique OM',
                '📱 Accès app premium + VIP',
                '🌍 Contenu exclusif OM Africa',
                '🏟️ 1 billet match offert (conditions)',
                '👕 1 maillot OM offert'
            ],
            paiement_accepte: ['OMC', 'Orange Money', 'Wave', 'Carte Bancaire']
        }
    ],

    // ========== CONFIGURATION TECHNIQUE ==========
    config: {
        devise_defaut_afrique: 'FCFA',
        devise_defaut_europe: 'EUR',
        taux_change_omc: {
            '1_OMC': '1_EUR',
            '1_OMC': '655.957_FCFA'
        },
        frais_conversion: {
            OMC_to_FCFA: 0, // Gratuit
            FCFA_to_OMC: 0, // Gratuit
            OMC_to_EUR: 0.5, // 0.5%
            EUR_to_OMC: 0.5 // 0.5%
        },
        api_paiement: {
            orange_money: 'https://api.orange.com/orange-money-webpay/dev/v1',
            wave: 'https://api.wave.com/v1',
            mtn_momo: 'https://momodeveloper.mtn.com',
            stripe: 'https://api.stripe.com/v1' // Pour cartes bancaires
        }
    }
};

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

function convertirOMCversFCFA(montantOMC) {
    return Math.round(montantOMC * 655.957);
}

function convertirFCFAversOMC(montantFCFA) {
    return (montantFCFA / 655.957).toFixed(2);
}

function convertirOMCversEUR(montantOMC) {
    return montantOMC; // 1 OMC = 1 EUR
}

function getMoyensPaiementParZone(zone) {
    // zone: 'afrique', 'europe', 'tous'
    if (zone === 'afrique') {
        return {
            stablecoin: PAIEMENTS_OM_AFRIQUE.stablecoin,
            mobile_money: PAIEMENTS_OM_AFRIQUE.mobile_money,
            cartes: PAIEMENTS_OM_AFRIQUE.cartes_bancaires.filter(c => 
                c.zones.includes('Afrique')
            )
        };
    } else if (zone === 'europe') {
        return {
            stablecoin: PAIEMENTS_OM_AFRIQUE.stablecoin,
            cartes: PAIEMENTS_OM_AFRIQUE.cartes_bancaires.filter(c => 
                c.zones.includes('Europe')
            )
        };
    } else {
        return PAIEMENTS_OM_AFRIQUE;
    }
}

function afficherMoyensPaiement(zone = 'tous') {
    const moyens = getMoyensPaiementParZone(zone);
    console.log('💰 Moyens de paiement disponibles:', moyens);
    return moyens;
}

console.log('✅ Module Paiements OM Afrique chargé');
console.log('💰 Stablecoin:', PAIEMENTS_OM_AFRIQUE.stablecoin.code);
console.log('📱 Mobile Money:', PAIEMENTS_OM_AFRIQUE.mobile_money.length, 'options');
console.log('💳 Cartes:', PAIEMENTS_OM_AFRIQUE.cartes_bancaires.length, 'types');
console.log('💎 Carte PaieCash OM:', PAIEMENTS_OM_AFRIQUE.carte_paiecash_om.types.length, 'niveaux');
console.log('📅 Abonnements:', PAIEMENTS_OM_AFRIQUE.abonnements.length, 'formules');
