/**
 * Redis Cache Configuration
 * Using redis library
 */

const redis = require('redis');

// Configuration de la connexion Redis
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || undefined,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('❌ Redis: Trop de tentatives de reconnexion');
                return new Error('Trop de tentatives de reconnexion');
            }
            return retries * 500; // Retry après 500ms, 1000ms, 1500ms, etc.
        }
    }
});

// Gestion des événements
redisClient.on('connect', () => {
    console.log('✅ Redis: Connexion en cours...');
});

redisClient.on('ready', () => {
    console.log('✅ Redis: Prêt à accepter les commandes');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis: Erreur de connexion:', err.message);
});

redisClient.on('reconnecting', () => {
    console.log('🔄 Redis: Reconnexion...');
});

// Connecter Redis
async function connectRedis() {
    try {
        await redisClient.connect();
        console.log('✅ Redis connecté avec succès');
        return true;
    } catch (error) {
        console.error('❌ Redis: Erreur de connexion:', error.message);
        return false;
    }
}

// Helper functions

/**
 * Set une valeur dans Redis avec TTL optionnel
 * @param {string} key - Clé
 * @param {any} value - Valeur (sera stringifié si objet)
 * @param {number} ttl - TTL en secondes (optionnel)
 */
async function setCache(key, value, ttl = null) {
    try {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        
        if (ttl) {
            await redisClient.setEx(key, ttl, stringValue);
        } else {
            await redisClient.set(key, stringValue);
        }
        
        return true;
    } catch (error) {
        console.error(`❌ Redis setCache error (${key}):`, error.message);
        return false;
    }
}

/**
 * Get une valeur depuis Redis
 * @param {string} key - Clé
 * @param {boolean} parse - Parser en JSON (default: true)
 */
async function getCache(key, parse = true) {
    try {
        const value = await redisClient.get(key);
        
        if (!value) {
            return null;
        }
        
        if (parse) {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        
        return value;
    } catch (error) {
        console.error(`❌ Redis getCache error (${key}):`, error.message);
        return null;
    }
}

/**
 * Delete une clé de Redis
 * @param {string} key - Clé
 */
async function deleteCache(key) {
    try {
        await redisClient.del(key);
        return true;
    } catch (error) {
        console.error(`❌ Redis deleteCache error (${key}):`, error.message);
        return false;
    }
}

/**
 * Delete toutes les clés correspondant à un pattern
 * @param {string} pattern - Pattern (ex: "user:*")
 */
async function deleteCachePattern(pattern) {
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
        return true;
    } catch (error) {
        console.error(`❌ Redis deleteCachePattern error (${pattern}):`, error.message);
        return false;
    }
}

/**
 * Vérifier si une clé existe
 * @param {string} key - Clé
 */
async function existsCache(key) {
    try {
        const exists = await redisClient.exists(key);
        return exists === 1;
    } catch (error) {
        console.error(`❌ Redis existsCache error (${key}):`, error.message);
        return false;
    }
}

/**
 * Incrémenter une valeur
 * @param {string} key - Clé
 */
async function incrCache(key) {
    try {
        return await redisClient.incr(key);
    } catch (error) {
        console.error(`❌ Redis incrCache error (${key}):`, error.message);
        return null;
    }
}

/**
 * Décrémenter une valeur
 * @param {string} key - Clé
 */
async function decrCache(key) {
    try {
        return await redisClient.decr(key);
    } catch (error) {
        console.error(`❌ Redis decrCache error (${key}):`, error.message);
        return null;
    }
}

/**
 * Set TTL sur une clé existante
 * @param {string} key - Clé
 * @param {number} seconds - Secondes
 */
async function expireCache(key, seconds) {
    try {
        await redisClient.expire(key, seconds);
        return true;
    } catch (error) {
        console.error(`❌ Redis expireCache error (${key}):`, error.message);
        return false;
    }
}

/**
 * Hash: Set un champ
 */
async function hsetCache(key, field, value) {
    try {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        await redisClient.hSet(key, field, stringValue);
        return true;
    } catch (error) {
        console.error(`❌ Redis hsetCache error (${key}):`, error.message);
        return false;
    }
}

/**
 * Hash: Get un champ
 */
async function hgetCache(key, field, parse = true) {
    try {
        const value = await redisClient.hGet(key, field);
        
        if (!value) {
            return null;
        }
        
        if (parse) {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        
        return value;
    } catch (error) {
        console.error(`❌ Redis hgetCache error (${key}):`, error.message);
        return null;
    }
}

/**
 * Hash: Get tous les champs
 */
async function hgetAllCache(key, parse = true) {
    try {
        const hash = await redisClient.hGetAll(key);
        
        if (!hash || Object.keys(hash).length === 0) {
            return null;
        }
        
        if (parse) {
            const parsed = {};
            for (const [field, value] of Object.entries(hash)) {
                try {
                    parsed[field] = JSON.parse(value);
                } catch {
                    parsed[field] = value;
                }
            }
            return parsed;
        }
        
        return hash;
    } catch (error) {
        console.error(`❌ Redis hgetAllCache error (${key}):`, error.message);
        return null;
    }
}

/**
 * List: Push à droite
 */
async function rpushCache(key, ...values) {
    try {
        const stringValues = values.map(v => 
            typeof v === 'object' ? JSON.stringify(v) : String(v)
        );
        await redisClient.rPush(key, stringValues);
        return true;
    } catch (error) {
        console.error(`❌ Redis rpushCache error (${key}):`, error.message);
        return false;
    }
}

/**
 * List: Get range
 */
async function lrangeCache(key, start = 0, stop = -1, parse = true) {
    try {
        const values = await redisClient.lRange(key, start, stop);
        
        if (parse) {
            return values.map(v => {
                try {
                    return JSON.parse(v);
                } catch {
                    return v;
                }
            });
        }
        
        return values;
    } catch (error) {
        console.error(`❌ Redis lrangeCache error (${key}):`, error.message);
        return [];
    }
}

/**
 * Set: Add member
 */
async function saddCache(key, ...members) {
    try {
        const stringMembers = members.map(m => 
            typeof m === 'object' ? JSON.stringify(m) : String(m)
        );
        await redisClient.sAdd(key, stringMembers);
        return true;
    } catch (error) {
        console.error(`❌ Redis saddCache error (${key}):`, error.message);
        return false;
    }
}

/**
 * Set: Get all members
 */
async function smembersCache(key, parse = true) {
    try {
        const members = await redisClient.sMembers(key);
        
        if (parse) {
            return members.map(m => {
                try {
                    return JSON.parse(m);
                } catch {
                    return m;
                }
            });
        }
        
        return members;
    } catch (error) {
        console.error(`❌ Redis smembersCache error (${key}):`, error.message);
        return [];
    }
}

/**
 * Sorted Set: Add member avec score
 */
async function zaddCache(key, score, member) {
    try {
        const stringMember = typeof member === 'object' ? JSON.stringify(member) : String(member);
        await redisClient.zAdd(key, { score, value: stringMember });
        return true;
    } catch (error) {
        console.error(`❌ Redis zaddCache error (${key}):`, error.message);
        return false;
    }
}

/**
 * Sorted Set: Get range par score (descendant)
 */
async function zrevrangeCache(key, start = 0, stop = -1, parse = true) {
    try {
        const members = await redisClient.zRevRange(key, start, stop);
        
        if (parse) {
            return members.map(m => {
                try {
                    return JSON.parse(m);
                } catch {
                    return m;
                }
            });
        }
        
        return members;
    } catch (error) {
        console.error(`❌ Redis zrevrangeCache error (${key}):`, error.message);
        return [];
    }
}

/**
 * Flush toute la base Redis (USE WITH CAUTION!)
 */
async function flushAllCache() {
    try {
        await redisClient.flushAll();
        console.log('⚠️  Redis: Base vidée complètement');
        return true;
    } catch (error) {
        console.error('❌ Redis flushAllCache error:', error.message);
        return false;
    }
}

/**
 * Ping Redis
 */
async function pingRedis() {
    try {
        const pong = await redisClient.ping();
        return pong === 'PONG';
    } catch (error) {
        console.error('❌ Redis ping error:', error.message);
        return false;
    }
}

/**
 * Get info Redis
 */
async function getRedisInfo() {
    try {
        const info = await redisClient.info();
        return info;
    } catch (error) {
        console.error('❌ Redis getInfo error:', error.message);
        return null;
    }
}

// Cache keys helpers
const CacheKeys = {
    // User
    user: (userId) => `user:${userId}`,
    userByEmail: (email) => `user:email:${email}`,
    
    // Wallet
    wallet: (userId) => `wallet:${userId}`,
    walletBalance: (userId) => `wallet:balance:${userId}`,
    transactions: (userId) => `transactions:${userId}`,
    
    // eSIM
    esimPlans: () => `esim:plans`,
    esimActive: (userId) => `esim:active:${userId}`,
    
    // Shop
    products: (club, category) => `products:${club}:${category}`,
    cart: (userId) => `cart:${userId}`,
    
    // Tickets
    events: (club) => `events:${club}`,
    userTickets: (userId) => `tickets:${userId}`,
    
    // Social
    conversations: (userId) => `conversations:${userId}`,
    feed: (userId, page) => `feed:${userId}:${page}`,
    
    // IA
    recommendations: (userId) => `ai:recommendations:${userId}`,
    insights: (userId) => `ai:insights:${userId}`,
    predictions: (userId) => `ai:predictions:${userId}`,
    
    // Stats
    stats: () => `stats:global`,
    
    // Rate limiting
    rateLimit: (ip, endpoint) => `rate:${ip}:${endpoint}`
};

// TTL constants (en secondes)
const CacheTTL = {
    SHORT: 60,           // 1 minute
    MEDIUM: 300,         // 5 minutes
    LONG: 1800,          // 30 minutes
    VERY_LONG: 3600,     // 1 heure
    DAY: 86400           // 24 heures
};

module.exports = {
    redisClient,
    connectRedis,
    pingRedis,
    getRedisInfo,
    
    // Basic operations
    setCache,
    getCache,
    deleteCache,
    deleteCachePattern,
    existsCache,
    incrCache,
    decrCache,
    expireCache,
    
    // Hash operations
    hsetCache,
    hgetCache,
    hgetAllCache,
    
    // List operations
    rpushCache,
    lrangeCache,
    
    // Set operations
    saddCache,
    smembersCache,
    
    // Sorted Set operations
    zaddCache,
    zrevrangeCache,
    
    // Utility
    flushAllCache,
    
    // Helpers
    CacheKeys,
    CacheTTL
};
