/**
 * PaieCashFan API Server
 * Backend REST API pour tous les microservices
 * Version: 1.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Configuration
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'paiecashfan-secret-key-2026';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Databases simulées (en production: PostgreSQL + Redis)
const databases = {
    users: new Map(),
    wallets: new Map(),
    transactions: new Map(),
    esimPlans: new Map(),
    esimActive: new Map(),
    products: new Map(),
    cart: new Map(),
    orders: new Map(),
    events: new Map(),
    tickets: new Map(),
    conversations: new Map(),
    messages: new Map(),
    aiRecommendations: new Map(),
    aiInsights: new Map()
};

// ============================================
// MIDDLEWARE D'AUTHENTIFICATION
// ============================================

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }
        req.user = user;
        next();
    });
}

// ============================================
// ROUTES AUTH
// ============================================

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, clubId } = req.body;

        // Vérifier si l'utilisateur existe
        if (Array.from(databases.users.values()).find(u => u.email === email)) {
            return res.status(400).json({ error: 'Email déjà utilisé' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        const userId = uuidv4();
        const user = {
            id: userId,
            email,
            password: hashedPassword,
            name,
            clubId: clubId || 'AS_MONACO',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        databases.users.set(userId, user);

        // Créer le wallet
        const walletId = uuidv4();
        databases.wallets.set(userId, {
            id: walletId,
            userId,
            balance: 100.00, // Bonus d'inscription
            currency: 'EUR',
            assets: [
                { symbol: 'PAIECASH_USD', balance: 100.00, valueEUR: 100.00 },
                { symbol: 'BTC', balance: 0, valueEUR: 0 },
                { symbol: 'ETH', balance: 0, valueEUR: 0 }
            ],
            createdAt: Date.now()
        });

        // Générer JWT
        const token = jwt.sign(
            { userId, email, name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Inscription réussie',
            user: { id: userId, email, name, clubId },
            token,
            wallet: { id: walletId, balance: 100.00 }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trouver l'utilisateur
        const user = Array.from(databases.users.values()).find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        // Générer JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Connexion réussie',
            user: { id: user.id, email: user.email, name: user.name, clubId: user.clubId },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ROUTES WALLET
// ============================================

/**
 * GET /api/wallet/balance
 * Récupérer le solde du wallet
 */
app.get('/api/wallet/balance', authenticateToken, (req, res) => {
    try {
        const wallet = databases.wallets.get(req.user.userId);
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet non trouvé' });
        }

        res.json({
            balance: wallet.balance,
            currency: wallet.currency,
            assets: wallet.assets
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/wallet/transactions
 * Récupérer l'historique des transactions
 */
app.get('/api/wallet/transactions', authenticateToken, (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        
        const userTransactions = Array.from(databases.transactions.values())
            .filter(tx => tx.userId === req.user.userId)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(offset, offset + parseInt(limit));

        res.json({
            transactions: userTransactions,
            total: userTransactions.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/wallet/send
 * Envoyer de l'argent
 */
app.post('/api/wallet/send', authenticateToken, (req, res) => {
    try {
        const { recipientId, amount, currency = 'EUR' } = req.body;

        const senderWallet = databases.wallets.get(req.user.userId);
        const recipientWallet = databases.wallets.get(recipientId);

        if (!senderWallet || !recipientWallet) {
            return res.status(404).json({ error: 'Wallet non trouvé' });
        }

        if (senderWallet.balance < amount) {
            return res.status(400).json({ error: 'Solde insuffisant' });
        }

        // Effectuer la transaction
        senderWallet.balance -= amount;
        recipientWallet.balance += amount;

        // Enregistrer la transaction
        const transactionId = uuidv4();
        const transaction = {
            id: transactionId,
            userId: req.user.userId,
            type: 'send',
            amount: -amount,
            currency,
            recipient: recipientId,
            timestamp: Date.now(),
            status: 'completed'
        };

        databases.transactions.set(transactionId, transaction);

        res.json({
            message: 'Envoi réussi',
            transaction,
            newBalance: senderWallet.balance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/wallet/deposit
 * Déposer de l'argent
 */
app.post('/api/wallet/deposit', authenticateToken, (req, res) => {
    try {
        const { amount, method = 'card' } = req.body;

        const wallet = databases.wallets.get(req.user.userId);
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet non trouvé' });
        }

        // Effectuer le dépôt
        wallet.balance += parseFloat(amount);

        // Enregistrer la transaction
        const transactionId = uuidv4();
        const transaction = {
            id: transactionId,
            userId: req.user.userId,
            type: 'deposit',
            amount: parseFloat(amount),
            currency: 'EUR',
            method,
            timestamp: Date.now(),
            status: 'completed'
        };

        databases.transactions.set(transactionId, transaction);

        res.json({
            message: 'Dépôt réussi',
            transaction,
            newBalance: wallet.balance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ROUTES ESIM
// ============================================

/**
 * GET /api/esim/plans
 * Récupérer les forfaits eSIM disponibles
 */
app.get('/api/esim/plans', (req, res) => {
    const plans = [
        {
            id: 'europe-starter',
            name: 'Europe Starter',
            region: 'Europe',
            data: '30 GB',
            duration: 30,
            countries: 20,
            price: 9.99,
            currency: 'EUR'
        },
        {
            id: 'europe-unlimited',
            name: 'Europe Unlimited',
            region: 'Europe',
            data: '100 GB',
            duration: 30,
            countries: 35,
            price: 19.99,
            currency: 'EUR',
            popular: true
        },
        {
            id: 'global-unlimited',
            name: 'Global Unlimited',
            region: 'Mondial',
            data: 'Illimité',
            duration: 30,
            countries: 120,
            price: 49.99,
            currency: 'EUR',
            features: ['5G', 'Hotspot']
        },
        {
            id: 'asia-pacific',
            name: 'Asia Pacific',
            region: 'Asie-Pacifique',
            data: '50 GB',
            duration: 30,
            countries: 15,
            price: 29.99,
            currency: 'EUR'
        }
    ];

    res.json({ plans });
});

/**
 * POST /api/esim/activate
 * Activer un forfait eSIM
 */
app.post('/api/esim/activate', authenticateToken, (req, res) => {
    try {
        const { planId } = req.body;

        // Vérifier le solde
        const wallet = databases.wallets.get(req.user.userId);
        const plans = {
            'europe-starter': 9.99,
            'europe-unlimited': 19.99,
            'global-unlimited': 49.99,
            'asia-pacific': 29.99
        };

        const price = plans[planId];
        if (wallet.balance < price) {
            return res.status(400).json({ error: 'Solde insuffisant' });
        }

        // Débiter le wallet
        wallet.balance -= price;

        // Activer l'eSIM
        const esimId = uuidv4();
        const esim = {
            id: esimId,
            userId: req.user.userId,
            planId,
            activatedAt: Date.now(),
            expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000),
            dataTotal: planId === 'global-unlimited' ? 999999 : parseInt(plans[planId] || 30),
            dataUsed: 0,
            status: 'active',
            qrCode: `QR-${esimId.substring(0, 8).toUpperCase()}`
        };

        databases.esimActive.set(req.user.userId, esim);

        // Enregistrer la transaction
        const transactionId = uuidv4();
        databases.transactions.set(transactionId, {
            id: transactionId,
            userId: req.user.userId,
            type: 'esim_purchase',
            amount: -price,
            currency: 'EUR',
            planId,
            timestamp: Date.now(),
            status: 'completed'
        });

        res.json({
            message: 'eSIM activé avec succès',
            esim,
            newBalance: wallet.balance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/esim/active
 * Récupérer l'eSIM actif
 */
app.get('/api/esim/active', authenticateToken, (req, res) => {
    try {
        const esim = databases.esimActive.get(req.user.userId);
        if (!esim) {
            return res.status(404).json({ error: 'Aucun eSIM actif' });
        }

        res.json({ esim });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ROUTES SHOP
// ============================================

/**
 * GET /api/shop/products
 * Récupérer les produits
 */
app.get('/api/shop/products', (req, res) => {
    const { club = 'AS_MONACO', category = 'all' } = req.query;

    const products = [
        {
            id: '1',
            name: 'Maillot Domicile 2025/26',
            club,
            category: 'jerseys',
            price: 79.99,
            oldPrice: 99.99,
            discount: 20,
            image: '👕',
            stock: 142
        },
        {
            id: '2',
            name: 'Casquette Officielle',
            club,
            category: 'accessories',
            price: 24.99,
            oldPrice: 29.99,
            discount: 15,
            image: '🧢',
            stock: 87
        },
        {
            id: '3',
            name: 'Veste d\'Entraînement',
            club,
            category: 'training',
            price: 89.99,
            image: '🧥',
            stock: 56
        },
        {
            id: '4',
            name: 'Écharpe Supporter',
            club,
            category: 'accessories',
            price: 14.99,
            oldPrice: 19.99,
            discount: 25,
            image: '🧣',
            stock: 203
        },
        {
            id: '5',
            name: 'NFT Édition Limitée',
            club,
            category: 'nft',
            price: 199.99,
            image: '🎨',
            stock: 10,
            nft: true
        },
        {
            id: '6',
            name: 'Ballon Officiel',
            club,
            category: 'accessories',
            price: 39.99,
            image: '⚽',
            stock: 78
        }
    ];

    const filtered = category === 'all' 
        ? products 
        : products.filter(p => p.category === category);

    res.json({ products: filtered });
});

/**
 * POST /api/shop/cart/add
 * Ajouter au panier
 */
app.post('/api/shop/cart/add', authenticateToken, (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        let cart = databases.cart.get(req.user.userId) || { items: [] };
        
        const existingItem = cart.items.find(item => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ productId, quantity, addedAt: Date.now() });
        }

        databases.cart.set(req.user.userId, cart);

        res.json({
            message: 'Produit ajouté au panier',
            cart,
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/shop/cart
 * Récupérer le panier
 */
app.get('/api/shop/cart', authenticateToken, (req, res) => {
    try {
        const cart = databases.cart.get(req.user.userId) || { items: [] };
        res.json({ cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/shop/checkout
 * Payer le panier
 */
app.post('/api/shop/checkout', authenticateToken, (req, res) => {
    try {
        const cart = databases.cart.get(req.user.userId);
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Panier vide' });
        }

        const { total } = req.body;

        // Vérifier le solde
        const wallet = databases.wallets.get(req.user.userId);
        if (wallet.balance < total) {
            return res.status(400).json({ error: 'Solde insuffisant' });
        }

        // Débiter le wallet
        wallet.balance -= total;

        // Créer la commande
        const orderId = uuidv4();
        const order = {
            id: orderId,
            userId: req.user.userId,
            items: cart.items,
            total,
            status: 'confirmed',
            createdAt: Date.now()
        };

        databases.orders.set(orderId, order);

        // Vider le panier
        databases.cart.delete(req.user.userId);

        // Enregistrer la transaction
        const transactionId = uuidv4();
        databases.transactions.set(transactionId, {
            id: transactionId,
            userId: req.user.userId,
            type: 'purchase',
            amount: -total,
            currency: 'EUR',
            orderId,
            timestamp: Date.now(),
            status: 'completed'
        });

        res.json({
            message: 'Commande confirmée',
            order,
            newBalance: wallet.balance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ROUTES TICKETS
// ============================================

/**
 * GET /api/tickets/events
 * Récupérer les événements
 */
app.get('/api/tickets/events', (req, res) => {
    const { club = 'AS_MONACO' } = req.query;

    const events = [
        {
            id: '1',
            title: 'AS Monaco vs Paris Saint-Germain',
            club,
            date: new Date('2026-02-15T15:00:00').getTime(),
            venue: 'Stade Louis II, Monaco',
            competition: 'Ligue 1',
            priceFrom: 49.99,
            seatsAvailable: 142,
            image: '⚽',
            hot: true
        },
        {
            id: '2',
            title: 'AS Monaco vs Manchester City',
            club,
            date: new Date('2026-03-05T21:00:00').getTime(),
            venue: 'Stade Louis II, Monaco',
            competition: 'UEFA Champions League',
            priceFrom: 149.99,
            seatsAvailable: 23,
            image: '⚽',
            vip: true
        },
        {
            id: '3',
            title: 'AS Monaco vs Olympique Lyonnais',
            club,
            date: new Date('2026-03-28T21:00:00').getTime(),
            venue: 'Stade Louis II, Monaco',
            competition: 'Ligue 1',
            priceFrom: 59.99,
            seatsAvailable: 87,
            image: '⚽'
        }
    ];

    res.json({ events });
});

/**
 * POST /api/tickets/purchase
 * Acheter un billet
 */
app.post('/api/tickets/purchase', authenticateToken, (req, res) => {
    try {
        const { eventId, category = 'standard', price } = req.body;

        // Vérifier le solde
        const wallet = databases.wallets.get(req.user.userId);
        if (wallet.balance < price) {
            return res.status(400).json({ error: 'Solde insuffisant' });
        }

        // Débiter le wallet
        wallet.balance -= price;

        // Créer le billet NFT
        const ticketId = uuidv4();
        const ticket = {
            id: ticketId,
            userId: req.user.userId,
            eventId,
            category,
            price,
            qrCode: `TICKET-${ticketId.substring(0, 12).toUpperCase()}`,
            nft: true,
            blockchain: {
                network: 'Polygon',
                tokenId: Math.floor(Math.random() * 1000000),
                contractAddress: '0x' + '0'.repeat(40)
            },
            purchasedAt: Date.now(),
            status: 'valid'
        };

        databases.tickets.set(ticketId, ticket);

        // Enregistrer la transaction
        const transactionId = uuidv4();
        databases.transactions.set(transactionId, {
            id: transactionId,
            userId: req.user.userId,
            type: 'ticket_purchase',
            amount: -price,
            currency: 'EUR',
            eventId,
            ticketId,
            timestamp: Date.now(),
            status: 'completed'
        });

        res.json({
            message: 'Billet acheté avec succès',
            ticket,
            newBalance: wallet.balance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/tickets/my-tickets
 * Récupérer mes billets
 */
app.get('/api/tickets/my-tickets', authenticateToken, (req, res) => {
    try {
        const userTickets = Array.from(databases.tickets.values())
            .filter(ticket => ticket.userId === req.user.userId);

        res.json({ tickets: userTickets });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/tickets/:ticketId/qr
 * Récupérer le QR code d'un billet
 */
app.get('/api/tickets/:ticketId/qr', authenticateToken, (req, res) => {
    try {
        const ticket = databases.tickets.get(req.params.ticketId);
        if (!ticket || ticket.userId !== req.user.userId) {
            return res.status(404).json({ error: 'Billet non trouvé' });
        }

        res.json({
            qrCode: ticket.qrCode,
            ticketId: ticket.id,
            eventId: ticket.eventId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ROUTES SOCIAL
// ============================================

/**
 * GET /api/social/conversations
 * Récupérer les conversations
 */
app.get('/api/social/conversations', authenticateToken, (req, res) => {
    try {
        const userConversations = Array.from(databases.conversations.values())
            .filter(conv => conv.participants.includes(req.user.userId));

        res.json({ conversations: userConversations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/social/messages
 * Envoyer un message
 */
app.post('/api/social/messages', authenticateToken, (req, res) => {
    try {
        const { conversationId, message } = req.body;

        const messageId = uuidv4();
        const newMessage = {
            id: messageId,
            conversationId,
            userId: req.user.userId,
            message,
            timestamp: Date.now(),
            read: false
        };

        databases.messages.set(messageId, newMessage);

        res.json({
            message: 'Message envoyé',
            data: newMessage
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/social/feed
 * Récupérer le feed social
 */
app.get('/api/social/feed', authenticateToken, (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const feed = [
        {
            id: '1',
            type: 'live',
            author: { id: 'club_monaco', name: 'AS Monaco', avatar: '⚽' },
            content: 'Match en direct ! Monaco vs PSG 🔴',
            likes: 2347,
            comments: 156,
            timestamp: Date.now() - 300000,
            live: true
        },
        {
            id: '2',
            type: 'shopping',
            author: { id: 'club_monaco', name: 'AS Monaco', avatar: '🛍️' },
            content: 'Live Shopping -20% sur tous les maillots !',
            likes: 892,
            comments: 67,
            timestamp: Date.now() - 600000,
            shopping: true
        }
    ];

    res.json({ feed, page: parseInt(page), total: feed.length });
});

// ============================================
// ROUTES IA
// ============================================

/**
 * GET /api/ai/recommendations
 * Récupérer les recommandations IA
 */
app.get('/api/ai/recommendations', authenticateToken, (req, res) => {
    const recommendations = [
        {
            id: '1',
            type: 'event',
            title: 'Match Monaco vs PSG',
            subtitle: 'Dimanche 15h • Stade Louis II',
            content: 'Votre équipe favorite joue dimanche ! Billets disponibles + 10% cashback.',
            tags: ['Match', 'Billet', 'Cashback 10%'],
            confidence: 0.92
        },
        {
            id: '2',
            type: 'product',
            title: 'Maillot Ben Yedder Signé',
            subtitle: 'Édition Limitée • 50 exemplaires',
            content: 'Votre joueur préféré ! Maillot authentique signé. Livraison gratuite.',
            tags: ['Maillot', 'Signé', 'Gratuit'],
            confidence: 0.87
        },
        {
            id: '3',
            type: 'shopping',
            title: 'Live Shopping Exclusif',
            subtitle: 'Ce soir 20h • En direct',
            content: 'Session shopping en direct avec des joueurs. Offres flash -30% garanties.',
            tags: ['LIVE', 'Shopping', '-30%'],
            confidence: 0.78
        }
    ];

    res.json({ recommendations });
});

/**
 * GET /api/ai/insights
 * Récupérer les insights utilisateur
 */
app.get('/api/ai/insights', authenticateToken, (req, res) => {
    const insights = {
        favoriteTeam: { name: 'AS Monaco', confidence: 0.87 },
        favoritePlayer: { name: 'Wissam Ben Yedder', confidence: 0.92 },
        shoppingStyle: { style: 'Premium', confidence: 0.78 },
        nextPurchaseProbability: 0.87,
        engagementMultiplier: 3.2,
        predictedValue: 142,
        predictedLevel: 'Gold'
    };

    res.json({ insights });
});

/**
 * GET /api/ai/predictions
 * Récupérer les prédictions IA
 */
app.get('/api/ai/predictions', authenticateToken, (req, res) => {
    const predictions = {
        nextPurchase: {
            probability: 0.87,
            category: 'jerseys',
            estimatedAmount: 79.99,
            timeframe: '7 days'
        },
        engagement: {
            currentLevel: 2.8,
            predictedLevel: 3.2,
            trend: 'up'
        },
        lifetime: {
            currentValue: 1247.50,
            predictedValue: 1389.50,
            timeframe: '30 days'
        }
    };

    res.json({ predictions });
});

// ============================================
// ROUTES HEALTH CHECK
// ============================================

/**
 * GET /api/health
 * Vérifier l'état du serveur
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        version: '1.0.0',
        timestamp: Date.now(),
        services: {
            auth: 'operational',
            wallet: 'operational',
            esim: 'operational',
            shop: 'operational',
            tickets: 'operational',
            social: 'operational',
            ai: 'operational'
        }
    });
});

/**
 * GET /api/stats
 * Statistiques globales
 */
app.get('/api/stats', (req, res) => {
    res.json({
        users: databases.users.size,
        wallets: databases.wallets.size,
        transactions: databases.transactions.size,
        esimActive: databases.esimActive.size,
        products: 6,
        orders: databases.orders.size,
        events: 3,
        tickets: databases.tickets.size
    });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Erreur serveur',
        message: err.message
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║     🚀 PaieCashFan API Server Started       ║
╠═══════════════════════════════════════════════╣
║  Version: 1.0.0                               ║
║  Port: ${PORT}                                    ║
║  Environment: ${process.env.NODE_ENV || 'development'}                     ║
║  Health: http://localhost:${PORT}/api/health     ║
╚═══════════════════════════════════════════════╝

📚 API Endpoints disponibles:
   
   🔐 Auth:
   POST   /api/auth/register
   POST   /api/auth/login
   
   💰 Wallet:
   GET    /api/wallet/balance
   GET    /api/wallet/transactions
   POST   /api/wallet/send
   POST   /api/wallet/deposit
   
   📡 eSIM:
   GET    /api/esim/plans
   POST   /api/esim/activate
   GET    /api/esim/active
   
   🛍️ Shop:
   GET    /api/shop/products
   POST   /api/shop/cart/add
   GET    /api/shop/cart
   POST   /api/shop/checkout
   
   🎟️ Tickets:
   GET    /api/tickets/events
   POST   /api/tickets/purchase
   GET    /api/tickets/my-tickets
   GET    /api/tickets/:id/qr
   
   💬 Social:
   GET    /api/social/conversations
   POST   /api/social/messages
   GET    /api/social/feed
   
   🤖 IA:
   GET    /api/ai/recommendations
   GET    /api/ai/insights
   GET    /api/ai/predictions
   
   📊 System:
   GET    /api/health
   GET    /api/stats
`);
});

module.exports = app;
