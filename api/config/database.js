/**
 * PostgreSQL Database Configuration
 * Using pg (node-postgres) library
 */

const { Pool } = require('pg');

// Configuration de la connexion PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/paiecashfan',
    max: parseInt(process.env.DATABASE_POOL_MAX) || 10,
    min: parseInt(process.env.DATABASE_POOL_MIN) || 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Gestion des événements
pool.on('connect', () => {
    console.log('✅ PostgreSQL: Nouvelle connexion établie');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL: Erreur de connexion:', err);
    process.exit(-1);
});

// Test de connexion
async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('✅ PostgreSQL connecté avec succès:', result.rows[0].now);
        client.release();
        return true;
    } catch (error) {
        console.error('❌ PostgreSQL: Erreur de connexion:', error.message);
        return false;
    }
}

// Initialiser les tables
async function initializeTables() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Table: users
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                club_id VARCHAR(100) DEFAULT 'AS_MONACO',
                created_at BIGINT NOT NULL,
                updated_at BIGINT NOT NULL
            )
        `);

        // Table: wallets
        await client.query(`
            CREATE TABLE IF NOT EXISTS wallets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                balance DECIMAL(15, 2) DEFAULT 0.00,
                currency VARCHAR(10) DEFAULT 'EUR',
                assets JSONB DEFAULT '[]'::jsonb,
                created_at BIGINT NOT NULL,
                UNIQUE(user_id)
            )
        `);

        // Table: transactions
        await client.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'EUR',
                recipient UUID,
                method VARCHAR(50),
                plan_id VARCHAR(100),
                order_id UUID,
                event_id VARCHAR(100),
                ticket_id UUID,
                timestamp BIGINT NOT NULL,
                status VARCHAR(50) DEFAULT 'completed'
            )
        `);

        // Table: esim_plans
        await client.query(`
            CREATE TABLE IF NOT EXISTS esim_plans (
                id VARCHAR(100) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                region VARCHAR(100) NOT NULL,
                data VARCHAR(50) NOT NULL,
                duration INTEGER NOT NULL,
                countries INTEGER NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'EUR',
                features JSONB DEFAULT '[]'::jsonb,
                popular BOOLEAN DEFAULT false
            )
        `);

        // Table: esim_active
        await client.query(`
            CREATE TABLE IF NOT EXISTS esim_active (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                plan_id VARCHAR(100) NOT NULL,
                activated_at BIGINT NOT NULL,
                expires_at BIGINT NOT NULL,
                data_total INTEGER NOT NULL,
                data_used INTEGER DEFAULT 0,
                status VARCHAR(50) DEFAULT 'active',
                qr_code VARCHAR(255) NOT NULL,
                UNIQUE(user_id)
            )
        `);

        // Table: products
        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id VARCHAR(100) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                club VARCHAR(100) NOT NULL,
                category VARCHAR(50) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                old_price DECIMAL(10, 2),
                discount INTEGER,
                image VARCHAR(50),
                stock INTEGER DEFAULT 0,
                nft BOOLEAN DEFAULT false
            )
        `);

        // Table: cart
        await client.query(`
            CREATE TABLE IF NOT EXISTS cart (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                product_id VARCHAR(100) NOT NULL,
                quantity INTEGER DEFAULT 1,
                added_at BIGINT NOT NULL,
                UNIQUE(user_id, product_id)
            )
        `);

        // Table: orders
        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                items JSONB NOT NULL,
                total DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'confirmed',
                created_at BIGINT NOT NULL
            )
        `);

        // Table: events
        await client.query(`
            CREATE TABLE IF NOT EXISTS events (
                id VARCHAR(100) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                club VARCHAR(100) NOT NULL,
                date BIGINT NOT NULL,
                venue VARCHAR(255) NOT NULL,
                competition VARCHAR(100) NOT NULL,
                price_from DECIMAL(10, 2) NOT NULL,
                seats_available INTEGER DEFAULT 0,
                image VARCHAR(50),
                hot BOOLEAN DEFAULT false,
                vip BOOLEAN DEFAULT false
            )
        `);

        // Table: tickets
        await client.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                event_id VARCHAR(100) NOT NULL,
                category VARCHAR(50) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                qr_code VARCHAR(255) NOT NULL,
                nft BOOLEAN DEFAULT true,
                blockchain JSONB,
                purchased_at BIGINT NOT NULL,
                status VARCHAR(50) DEFAULT 'valid'
            )
        `);

        // Table: conversations
        await client.query(`
            CREATE TABLE IF NOT EXISTS conversations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                participants UUID[] NOT NULL,
                last_message TEXT,
                last_message_at BIGINT,
                created_at BIGINT NOT NULL
            )
        `);

        // Table: messages
        await client.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                timestamp BIGINT NOT NULL,
                read BOOLEAN DEFAULT false
            )
        `);

        // Table: ai_recommendations
        await client.query(`
            CREATE TABLE IF NOT EXISTS ai_recommendations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                subtitle VARCHAR(255),
                content TEXT,
                tags JSONB DEFAULT '[]'::jsonb,
                confidence DECIMAL(3, 2),
                created_at BIGINT NOT NULL
            )
        `);

        // Table: ai_insights
        await client.query(`
            CREATE TABLE IF NOT EXISTS ai_insights (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                favorite_team JSONB,
                favorite_player JSONB,
                shopping_style JSONB,
                next_purchase_probability DECIMAL(3, 2),
                engagement_multiplier DECIMAL(3, 2),
                predicted_value DECIMAL(10, 2),
                predicted_level VARCHAR(50),
                updated_at BIGINT NOT NULL,
                UNIQUE(user_id)
            )
        `);

        // Indexes pour optimisation
        await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`);

        await client.query('COMMIT');
        console.log('✅ PostgreSQL: Tables initialisées avec succès');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ PostgreSQL: Erreur lors de l\'initialisation des tables:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

// Insérer des données de test
async function seedDatabase() {
    const client = await pool.connect();
    
    try {
        // Vérifier si des données existent déjà
        const result = await client.query('SELECT COUNT(*) FROM esim_plans');
        if (parseInt(result.rows[0].count) > 0) {
            console.log('ℹ️  PostgreSQL: Données déjà présentes, skip seed');
            return;
        }

        await client.query('BEGIN');

        // Insérer les forfaits eSIM
        await client.query(`
            INSERT INTO esim_plans (id, name, region, data, duration, countries, price, popular, features) VALUES
            ('europe-starter', 'Europe Starter', 'Europe', '30 GB', 30, 20, 9.99, false, '[]'),
            ('europe-unlimited', 'Europe Unlimited', 'Europe', '100 GB', 30, 35, 19.99, true, '[]'),
            ('global-unlimited', 'Global Unlimited', 'Mondial', 'Illimité', 30, 120, 49.99, false, '["5G", "Hotspot"]'),
            ('asia-pacific', 'Asia Pacific', 'Asie-Pacifique', '50 GB', 30, 15, 29.99, false, '["4G/5G"]')
        `);

        // Insérer les produits
        await client.query(`
            INSERT INTO products (id, name, club, category, price, old_price, discount, image, stock, nft) VALUES
            ('1', 'Maillot Domicile 2025/26', 'AS_MONACO', 'jerseys', 79.99, 99.99, 20, '👕', 142, false),
            ('2', 'Casquette Officielle', 'AS_MONACO', 'accessories', 24.99, 29.99, 15, '🧢', 87, false),
            ('3', 'Veste d''Entraînement', 'AS_MONACO', 'training', 89.99, NULL, NULL, '🧥', 56, false),
            ('4', 'Écharpe Supporter', 'AS_MONACO', 'accessories', 14.99, 19.99, 25, '🧣', 203, false),
            ('5', 'NFT Édition Limitée', 'AS_MONACO', 'nft', 199.99, NULL, NULL, '🎨', 10, true),
            ('6', 'Ballon Officiel', 'AS_MONACO', 'accessories', 39.99, NULL, NULL, '⚽', 78, false)
        `);

        // Insérer les événements
        await client.query(`
            INSERT INTO events (id, title, club, date, venue, competition, price_from, seats_available, image, hot, vip) VALUES
            ('1', 'AS Monaco vs Paris Saint-Germain', 'AS_MONACO', ${Date.now() + 30 * 24 * 60 * 60 * 1000}, 'Stade Louis II, Monaco', 'Ligue 1', 49.99, 142, '⚽', true, false),
            ('2', 'AS Monaco vs Manchester City', 'AS_MONACO', ${Date.now() + 45 * 24 * 60 * 60 * 1000}, 'Stade Louis II, Monaco', 'UEFA Champions League', 149.99, 23, '⚽', false, true),
            ('3', 'AS Monaco vs Olympique Lyonnais', 'AS_MONACO', ${Date.now() + 60 * 24 * 60 * 60 * 1000}, 'Stade Louis II, Monaco', 'Ligue 1', 59.99, 87, '⚽', false, false)
        `);

        await client.query('COMMIT');
        console.log('✅ PostgreSQL: Données de test insérées');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ PostgreSQL: Erreur lors du seed:', error.message);
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    testConnection,
    initializeTables,
    seedDatabase
};
