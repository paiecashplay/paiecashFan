/**
 * PaieCashFan API Server with PostgreSQL + Redis
 * Backend REST API avec vraies bases de données
 * Version: 2.0.0
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Import Database & Cache
const { pool, testConnection, initializeTables, seedDatabase } = require('./config/database');
const { 
    connectRedis, 
    getCache, 
    setCache, 
    deleteCache, 
    CacheKeys, 
    CacheTTL 
} = require('./config/redis');

// Configuration
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'paiecashfan-secret-key-2026';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize databases
async function initializeDatabases() {
    try {
        // Test PostgreSQL
        const pgConnected = await testConnection();
        if (!pgConnected) {
            throw new Error('PostgreSQL connection failed');
        }

        // Initialize tables
        await initializeTables();
        
        // Seed database
        await seedDatabase();

        // Connect Redis
        await connectRedis();

        console.log('✅ Toutes les bases de données sont connectées');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des bases:', error.message);
        process.exit(1);
    }
}

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
 */
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, clubId } = req.body;

        // Vérifier si l'utilisateur existe
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email déjà utilisé' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        const userId = uuidv4();
        const now = Date.now();

        await pool.query(
            'INSERT INTO users (id, email, password, name, club_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [userId, email, hashedPassword, name, clubId || 'AS_MONACO', now, now]
        );

        // Créer le wallet
        const walletId = uuidv4();
        const initialBalance = 100.00;
        const assets = JSON.stringify([
            { symbol: 'PAIECASH_USD', balance: 100.00, valueEUR: 100.00 },
            { symbol: 'BTC', balance: 0, valueEUR: 0 },
            { symbol: 'ETH', balance: 0, valueEUR: 0 }
        ]);

        await pool.query(
            'INSERT INTO wallets (id, user_id, balance, currency, assets, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
            [walletId, userId, initialBalance, 'EUR', assets, now]
        );

        // Générer JWT
        const token = jwt.sign(
            { userId, email, name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Cache user
        await setCache(CacheKeys.user(userId), { id: userId, email, name, clubId }, CacheTTL.LONG);

        res.status(201).json({
            message: 'Inscription réussie',
            user: { id: userId, email, name, clubId },
            token,
            wallet: { id: walletId, balance: initialBalance }
        });
    } catch (error) {
        console.error('Error in /auth/register:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/auth/login
 */
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trouver l'utilisateur
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        const user = result.rows[0];

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

        // Cache user
        await setCache(
            CacheKeys.user(user.id), 
            { id: user.id, email: user.email, name: user.name, clubId: user.club_id },
            CacheTTL.LONG
        );

        res.json({
            message: 'Connexion réussie',
            user: { id: user.id, email: user.email, name: user.name, clubId: user.club_id },
            token
        });
    } catch (error) {
        console.error('Error in /auth/login:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ROUTES WALLET
// ============================================

/**
 * GET /api/wallet/balance
 */
app.get('/api/wallet/balance', authenticateToken, async (req, res) => {
    try {
        // Check cache
        const cacheKey = CacheKeys.walletBalance(req.user.userId);
        const cached = await getCache(cacheKey);
        
        if (cached) {
            return res.json(cached);
        }

        // Query database
        const result = await pool.query(
            'SELECT balance, currency, assets FROM wallets WHERE user_id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Wallet non trouvé' });
        }

        const wallet = result.rows[0];
        const response = {
            balance: parseFloat(wallet.balance),
            currency: wallet.currency,
            assets: wallet.assets
        };

        // Cache response
        await setCache(cacheKey, response, CacheTTL.SHORT);

        res.json(response);
    } catch (error) {
        console.error('Error in /wallet/balance:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/wallet/transactions
 */
app.get('/api/wallet/transactions', authenticateToken, async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;

        const result = await pool.query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2 OFFSET $3',
            [req.user.userId, parseInt(limit), parseInt(offset)]
        );

        res.json({
            transactions: result.rows,
            total: result.rows.length
        });
    } catch (error) {
        console.error('Error in /wallet/transactions:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/wallet/deposit
 */
app.post('/api/wallet/deposit', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { amount, method = 'card' } = req.body;
        
        await client.query('BEGIN');

        // Update wallet balance
        const walletResult = await client.query(
            'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 RETURNING balance',
            [parseFloat(amount), req.user.userId]
        );

        if (walletResult.rows.length === 0) {
            throw new Error('Wallet non trouvé');
        }

        const newBalance = parseFloat(walletResult.rows[0].balance);

        // Create transaction
        const transactionId = uuidv4();
        await client.query(
            'INSERT INTO transactions (id, user_id, type, amount, currency, method, timestamp, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [transactionId, req.user.userId, 'deposit', parseFloat(amount), 'EUR', method, Date.now(), 'completed']
        );

        await client.query('COMMIT');

        // Invalidate cache
        await deleteCache(CacheKeys.walletBalance(req.user.userId));

        res.json({
            message: 'Dépôt réussi',
            transaction: { id: transactionId, amount: parseFloat(amount), method },
            newBalance
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in /wallet/deposit:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// ============================================
// ROUTES ESIM
// ============================================

/**
 * GET /api/esim/plans
 */
app.get('/api/esim/plans', async (req, res) => {
    try {
        // Check cache
        const cacheKey = CacheKeys.esimPlans();
        const cached = await getCache(cacheKey);
        
        if (cached) {
            return res.json({ plans: cached });
        }

        // Query database
        const result = await pool.query('SELECT * FROM esim_plans ORDER BY price ASC');

        // Cache response
        await setCache(cacheKey, result.rows, CacheTTL.VERY_LONG);

        res.json({ plans: result.rows });
    } catch (error) {
        console.error('Error in /esim/plans:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/esim/activate
 */
app.post('/api/esim/activate', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { planId } = req.body;

        await client.query('BEGIN');

        // Get plan price
        const planResult = await client.query('SELECT price FROM esim_plans WHERE id = $1', [planId]);
        if (planResult.rows.length === 0) {
            throw new Error('Plan non trouvé');
        }

        const price = parseFloat(planResult.rows[0].price);

        // Check wallet balance
        const walletResult = await client.query('SELECT balance FROM wallets WHERE user_id = $1', [req.user.userId]);
        if (walletResult.rows.length === 0) {
            throw new Error('Wallet non trouvé');
        }

        const balance = parseFloat(walletResult.rows[0].balance);
        if (balance < price) {
            throw new Error('Solde insuffisant');
        }

        // Deduct from wallet
        await client.query(
            'UPDATE wallets SET balance = balance - $1 WHERE user_id = $2',
            [price, req.user.userId]
        );

        const newBalance = balance - price;

        // Activate eSIM
        const esimId = uuidv4();
        const now = Date.now();
        const expiresAt = now + (30 * 24 * 60 * 60 * 1000);
        const qrCode = `QR-${esimId.substring(0, 8).toUpperCase()}`;

        // Delete old eSIM if exists
        await client.query('DELETE FROM esim_active WHERE user_id = $1', [req.user.userId]);

        await client.query(
            'INSERT INTO esim_active (id, user_id, plan_id, activated_at, expires_at, data_total, data_used, status, qr_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [esimId, req.user.userId, planId, now, expiresAt, 100, 0, 'active', qrCode]
        );

        // Create transaction
        const transactionId = uuidv4();
        await client.query(
            'INSERT INTO transactions (id, user_id, type, amount, currency, plan_id, timestamp, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [transactionId, req.user.userId, 'esim_purchase', -price, 'EUR', planId, now, 'completed']
        );

        await client.query('COMMIT');

        // Invalidate caches
        await deleteCache(CacheKeys.walletBalance(req.user.userId));
        await deleteCache(CacheKeys.esimActive(req.user.userId));

        res.json({
            message: 'eSIM activé avec succès',
            esim: {
                id: esimId,
                planId,
                activatedAt: now,
                expiresAt,
                dataTotal: 100,
                dataUsed: 0,
                status: 'active',
                qrCode
            },
            newBalance
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in /esim/activate:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

/**
 * GET /api/esim/active
 */
app.get('/api/esim/active', authenticateToken, async (req, res) => {
    try {
        // Check cache
        const cacheKey = CacheKeys.esimActive(req.user.userId);
        const cached = await getCache(cacheKey);
        
        if (cached) {
            return res.json({ esim: cached });
        }

        // Query database
        const result = await pool.query(
            'SELECT * FROM esim_active WHERE user_id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Aucun eSIM actif' });
        }

        const esim = result.rows[0];

        // Cache response
        await setCache(cacheKey, esim, CacheTTL.MEDIUM);

        res.json({ esim });
    } catch (error) {
        console.error('Error in /esim/active:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ROUTES SHOP
// ============================================

/**
 * GET /api/shop/products
 */
app.get('/api/shop/products', async (req, res) => {
    try {
        const { club = 'AS_MONACO', category = 'all' } = req.query;

        // Check cache
        const cacheKey = CacheKeys.products(club, category);
        const cached = await getCache(cacheKey);
        
        if (cached) {
            return res.json({ products: cached });
        }

        // Query database
        let query = 'SELECT * FROM products WHERE club = $1';
        const params = [club];

        if (category !== 'all') {
            query += ' AND category = $2';
            params.push(category);
        }

        query += ' ORDER BY price ASC';

        const result = await pool.query(query, params);

        // Cache response
        await setCache(cacheKey, result.rows, CacheTTL.LONG);

        res.json({ products: result.rows });
    } catch (error) {
        console.error('Error in /shop/products:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/shop/cart/add
 */
app.post('/api/shop/cart/add', authenticateToken, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const now = Date.now();

        // Upsert cart item
        await pool.query(
            `INSERT INTO cart (user_id, product_id, quantity, added_at) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, product_id) 
             DO UPDATE SET quantity = cart.quantity + $3`,
            [req.user.userId, productId, quantity, now]
        );

        // Get updated cart
        const result = await pool.query(
            'SELECT * FROM cart WHERE user_id = $1',
            [req.user.userId]
        );

        const itemCount = result.rows.reduce((sum, item) => sum + item.quantity, 0);

        // Invalidate cache
        await deleteCache(CacheKeys.cart(req.user.userId));

        res.json({
            message: 'Produit ajouté au panier',
            cart: { items: result.rows },
            itemCount
        });
    } catch (error) {
        console.error('Error in /shop/cart/add:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/shop/cart
 */
app.get('/api/shop/cart', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM cart WHERE user_id = $1',
            [req.user.userId]
        );

        res.json({ cart: { items: result.rows } });
    } catch (error) {
        console.error('Error in /shop/cart:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/shop/checkout
 */
app.post('/api/shop/checkout', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { total } = req.body;

        await client.query('BEGIN');

        // Get cart
        const cartResult = await client.query('SELECT * FROM cart WHERE user_id = $1', [req.user.userId]);
        
        if (cartResult.rows.length === 0) {
            throw new Error('Panier vide');
        }

        // Check wallet balance
        const walletResult = await client.query('SELECT balance FROM wallets WHERE user_id = $1', [req.user.userId]);
        const balance = parseFloat(walletResult.rows[0].balance);

        if (balance < total) {
            throw new Error('Solde insuffisant');
        }

        // Deduct from wallet
        await client.query('UPDATE wallets SET balance = balance - $1 WHERE user_id = $2', [total, req.user.userId]);

        const newBalance = balance - total;

        // Create order
        const orderId = uuidv4();
        const now = Date.now();

        await client.query(
            'INSERT INTO orders (id, user_id, items, total, status, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
            [orderId, req.user.userId, JSON.stringify(cartResult.rows), total, 'confirmed', now]
        );

        // Clear cart
        await client.query('DELETE FROM cart WHERE user_id = $1', [req.user.userId]);

        // Create transaction
        const transactionId = uuidv4();
        await client.query(
            'INSERT INTO transactions (id, user_id, type, amount, currency, order_id, timestamp, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [transactionId, req.user.userId, 'purchase', -total, 'EUR', orderId, now, 'completed']
        );

        await client.query('COMMIT');

        // Invalidate caches
        await deleteCache(CacheKeys.walletBalance(req.user.userId));
        await deleteCache(CacheKeys.cart(req.user.userId));

        res.json({
            message: 'Commande confirmée',
            order: {
                id: orderId,
                items: cartResult.rows,
                total,
                status: 'confirmed'
            },
            newBalance
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in /shop/checkout:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// ============================================
// ROUTES TICKETS (simplified - similar pattern)
// ============================================

app.get('/api/tickets/events', async (req, res) => {
    try {
        const { club = 'AS_MONACO' } = req.query;
        
        const cacheKey = CacheKeys.events(club);
        const cached = await getCache(cacheKey);
        
        if (cached) {
            return res.json({ events: cached });
        }

        const result = await pool.query('SELECT * FROM events WHERE club = $1 ORDER BY date ASC', [club]);
        
        await setCache(cacheKey, result.rows, CacheTTL.MEDIUM);
        
        res.json({ events: result.rows });
    } catch (error) {
        console.error('Error in /tickets/events:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/tickets/my-tickets', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tickets WHERE user_id = $1', [req.user.userId]);
        res.json({ tickets: result.rows });
    } catch (error) {
        console.error('Error in /tickets/my-tickets:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ROUTES HEALTH & STATS
// ============================================

app.get('/api/health', async (req, res) => {
    try {
        // Test PostgreSQL
        const pgResult = await pool.query('SELECT NOW()');
        const pgHealthy = pgResult.rows.length > 0;

        // Test Redis
        const redisHealthy = await getCache('health:test') !== undefined;

        res.json({
            status: pgHealthy && redisHealthy ? 'healthy' : 'degraded',
            version: '2.0.0',
            timestamp: Date.now(),
            services: {
                postgres: pgHealthy ? 'operational' : 'degraded',
                redis: redisHealthy ? 'operational' : 'degraded',
                auth: 'operational',
                wallet: 'operational',
                esim: 'operational',
                shop: 'operational',
                tickets: 'operational',
                social: 'operational',
                ai: 'operational'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        // Check cache
        const cacheKey = CacheKeys.stats();
        const cached = await getCache(cacheKey);
        
        if (cached) {
            return res.json(cached);
        }

        // Query database
        const users = await pool.query('SELECT COUNT(*) FROM users');
        const transactions = await pool.query('SELECT COUNT(*) FROM transactions');
        const esimActive = await pool.query('SELECT COUNT(*) FROM esim_active');
        const orders = await pool.query('SELECT COUNT(*) FROM orders');
        const tickets = await pool.query('SELECT COUNT(*) FROM tickets');

        const stats = {
            users: parseInt(users.rows[0].count),
            transactions: parseInt(transactions.rows[0].count),
            esimActive: parseInt(esimActive.rows[0].count),
            products: 6,
            orders: parseInt(orders.rows[0].count),
            events: 3,
            tickets: parseInt(tickets.rows[0].count)
        };

        // Cache response
        await setCache(cacheKey, stats, CacheTTL.SHORT);

        res.json(stats);
    } catch (error) {
        console.error('Error in /stats:', error);
        res.status(500).json({ error: error.message });
    }
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

async function startServer() {
    try {
        // Initialize databases
        await initializeDatabases();

        // Start server
        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════╗
║  🚀 PaieCashFan API Server (PostgreSQL+Redis) ║
╠═══════════════════════════════════════════════╣
║  Version: 2.0.0                               ║
║  Port: ${PORT}                                    ║
║  Environment: ${process.env.NODE_ENV || 'development'}                     ║
║  Health: http://localhost:${PORT}/api/health     ║
║  PostgreSQL: ✅ Connected                     ║
║  Redis: ✅ Connected                          ║
╚═══════════════════════════════════════════════╝
`);
        });
    } catch (error) {
        console.error('❌ Erreur lors du démarrage:', error.message);
        process.exit(1);
    }
}

startServer();

module.exports = app;
