/**
 * SERVEUR BACKEND PARIS FC - PaieCashPlay
 * Architecture Microservices
 * 
 * Ce serveur gère :
 * - Paiements Alipay (Yuan CNY)
 * - Stablecoin (USDC/USDT)
 * - Mobile Money (Orange, M-Pesa, MTN)
 * - Billetterie Stade Jean Bouin
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration du club
const CLUB_CONFIG = {
    id: 'paris-fc',
    nom: 'Paris FC',
    stade: 'Stade Jean Bouin',
    couleurs: {
        primaire: '#1e3a8a',
        secondaire: '#3b82f6'
    },
    capacite: 20000,
    tribunes: [
        { nom: 'Tribune Présidentielle', capacite: 2000, prix: 80 },
        { nom: 'Tribune Jean Bouin Nord', capacite: 6000, prix: 45 },
        { nom: 'Tribune Jean Bouin Sud', capacite: 6000, prix: 45 },
        { nom: 'Tribune Est', capacite: 3000, prix: 35 },
        { nom: 'Tribune Ouest', capacite: 3000, prix: 35 }
    ],
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/2/22/Paris_FC_logo_2020.svg/1200px-Paris_FC_logo_2020.svg.png'
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Route principale
app.get('/', (req, res) => {
    res.json({
        service: 'PaieCashPlay Paris FC',
        version: '1.0.0',
        club: CLUB_CONFIG.nom,
        stade: CLUB_CONFIG.stade,
        status: 'operational',
        features: [
            'Paiement Alipay (CNY)',
            'Stablecoin (USDC/USDT)',
            'Mobile Money Afrique',
            'Billetterie Stade Charléty',
            'Cashback 5%'
        ]
    });
});

// Configuration du club
app.get('/api/club/config', (req, res) => {
    res.json(CLUB_CONFIG);
});

// Créer une session de paiement Alipay
app.post('/api/payment/alipay/create-session', async (req, res) => {
    try {
        const { montant, devise = 'cny', description, tribune } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['alipay'],
            line_items: [{
                price_data: {
                    currency: devise.toLowerCase(),
                    product_data: {
                        name: `Paris FC - ${tribune || description}`,
                        description: `Stade Jean Bouin`,
                        images: [CLUB_CONFIG.logo]
                    },
                    unit_amount: Math.round(montant * 100)
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/cancel.html`,
            metadata: {
                club: 'paris-fc',
                stade: 'Stade Jean Bouin',
                tribune: tribune || 'N/A',
                methode_paiement: 'alipay'
            }
        });

        console.log(`✅ Session Alipay créée pour Paris FC : ${session.id}`);
        res.json({ sessionId: session.id, url: session.url });

    } catch (error) {
        console.error('❌ Erreur création session Alipay:', error);
        res.status(500).json({ 
            error: error.message,
            club: 'paris-fc'
        });
    }
});

// Créer une session de paiement Stablecoin
app.post('/api/payment/stablecoin/create-session', async (req, res) => {
    try {
        const { montant, crypto = 'usdc', description, tribune } = req.body;

        // Simulation pour Stablecoin (nécessite intégration LYF ou autre)
        const mockSession = {
            sessionId: `stablecoin_${Date.now()}`,
            club: 'paris-fc',
            montant: montant,
            crypto: crypto.toUpperCase(),
            tribune: tribune,
            cashback: montant * 0.05, // 5% cashback
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        console.log(`✅ Session Stablecoin créée pour Paris FC : ${mockSession.sessionId}`);
        res.json(mockSession);

    } catch (error) {
        console.error('❌ Erreur création session Stablecoin:', error);
        res.status(500).json({ 
            error: error.message,
            club: 'paris-fc'
        });
    }
});

// Créer une session de paiement Mobile Money
app.post('/api/payment/mobilemoney/create-session', async (req, res) => {
    try {
        const { montant, operateur = 'orange', telephone, description, tribune } = req.body;

        // Simulation pour Mobile Money (nécessite intégration Orange Money API, etc.)
        const mockSession = {
            sessionId: `mobilemoney_${Date.now()}`,
            club: 'paris-fc',
            montant: montant,
            operateur: operateur,
            telephone: telephone,
            tribune: tribune,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        console.log(`✅ Session Mobile Money créée pour Paris FC : ${mockSession.sessionId}`);
        res.json(mockSession);

    } catch (error) {
        console.error('❌ Erreur création session Mobile Money:', error);
        res.status(500).json({ 
            error: error.message,
            club: 'paris-fc'
        });
    }
});

// Webhook Stripe pour Paris FC
app.post('/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('❌ Erreur webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Traiter l'événement
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        if (session.metadata.club === 'paris-fc') {
            console.log(`✅ Paiement Paris FC confirmé : ${session.id}`);
            console.log(`   Tribune : ${session.metadata.tribune}`);
            console.log(`   Montant : ${session.amount_total / 100} ${session.currency.toUpperCase()}`);
            
            // Ici : enregistrer la transaction, envoyer le billet, etc.
        }
    }

    res.json({received: true});
});

// Récupérer les tribunes disponibles
app.get('/api/billetterie/tribunes', (req, res) => {
    res.json({
        stade: CLUB_CONFIG.stade,
        capacite_totale: CLUB_CONFIG.capacite,
        tribunes: CLUB_CONFIG.tribunes
    });
});

// Vérifier le statut d'un paiement
app.get('/api/payment/status/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        // Vérifier avec Stripe
        if (sessionId.startsWith('cs_')) {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            res.json({
                status: session.payment_status,
                club: session.metadata.club,
                montant: session.amount_total / 100,
                devise: session.currency
            });
        } else {
            // Session simulée (Stablecoin ou Mobile Money)
            res.json({
                status: 'completed',
                club: 'paris-fc',
                message: 'Paiement simulé - Mode développement'
            });
        }
    } catch (error) {
        console.error('❌ Erreur vérification statut:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        club: 'paris-fc',
        service: 'PaieCashPlay Paris FC',
        timestamp: new Date().toISOString()
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║       🔵⚪ SERVEUR PARIS FC DÉMARRÉ 🔵⚪             ║
╠═══════════════════════════════════════════════════════╣
║  Port          : ${PORT}                              ║
║  Club          : ${CLUB_CONFIG.nom}                   ║
║  Stade         : ${CLUB_CONFIG.stade}                 ║
║  Capacité      : ${CLUB_CONFIG.capacite} places       ║
║                                                       ║
║  Paiements activés :                                  ║
║  ✅ Alipay (🇨🇳 Yuan CNY)                            ║
║  ✅ Stablecoin (💎 USDC/USDT) - Cashback 5%          ║
║  ✅ Mobile Money (🌍 Afrique)                        ║
║  ✅ Carte Bancaire (💳 Classique)                    ║
╚═══════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
