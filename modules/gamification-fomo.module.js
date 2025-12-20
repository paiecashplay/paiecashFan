/**
 * ========================================
 * 🎮 GAMIFICATION FOMO MODULE V11.0
 * ========================================
 * Module de gamification et FOMO events
 * 
 * FONCTIONNALITÉS :
 * - Système de points et récompenses
 * - Badges et achievements
 * - Leaderboards (classements)
 * - Niveaux de fan (Bronze, Silver, Gold, Platinum)
 * - FOMO Events (événements à durée limitée)
 * - Challenges quotidiens/hebdomadaires
 * - Streaks (séries de connexions)
 * - Rewards (cadeaux, réductions, NFTs)
 * - Notifications temps réel
 * - Persistent storage avec IndexedDB
 * 
 * NAMESPACE : pcf_v11_GamificationFomo_
 * DÉPENDANCES : core-system.module.js, auth-persistent.module.js
 * 
 * @version 11.0.0
 * @date 2024-12-13
 * @author PaieCashFan Team
 */

(function(window) {
    'use strict';

    // ========================================
    // NAMESPACE UNIQUE
    // ========================================
    const MODULE_NAME = 'GamificationFomo';
    const NAMESPACE = `pcf_v11_${MODULE_NAME}_`;

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        // API Endpoints
        API: {
            BASE_URL: '/api/gamification',
            POINTS: '/points',
            BADGES: '/badges',
            LEADERBOARD: '/leaderboard',
            CHALLENGES: '/challenges',
            EVENTS: '/events',
            REWARDS: '/rewards',
            STREAKS: '/streaks'
        },

        // Niveaux de fan
        FAN_LEVELS: {
            BRONZE: { min: 0, max: 999, name: 'Bronze Fan', color: '#CD7F32', benefits: [] },
            SILVER: { min: 1000, max: 4999, name: 'Silver Fan', color: '#C0C0C0', benefits: ['5% discount'] },
            GOLD: { min: 5000, max: 19999, name: 'Gold Fan', color: '#FFD700', benefits: ['10% discount', 'Early access'] },
            PLATINUM: { min: 20000, max: 99999, name: 'Platinum Fan', color: '#E5E4E2', benefits: ['15% discount', 'VIP events', 'Exclusive NFTs'] },
            DIAMOND: { min: 100000, max: Infinity, name: 'Diamond Fan', color: '#B9F2FF', benefits: ['20% discount', 'VIP events', 'Exclusive NFTs', 'Meet & Greet'] }
        },

        // Actions qui donnent des points
        POINT_ACTIONS: {
            SIGNUP: 100,
            LOGIN_DAILY: 10,
            VIDEO_WATCH: 5,
            VIDEO_LIKE: 2,
            VIDEO_COMMENT: 5,
            VIDEO_SHARE: 10,
            PURCHASE: 50,
            REFERRAL: 500,
            FOLLOW_CLUB: 20,
            CLUB_EVENT: 30
        },

        // Types de badges
        BADGE_TYPES: {
            WELCOME: { id: 'welcome', name: 'Welcome', icon: '👋', description: 'Created an account' },
            FIRST_VIDEO: { id: 'first_video', name: 'First Watch', icon: '🎬', description: 'Watched first video' },
            FIRST_PURCHASE: { id: 'first_purchase', name: 'First Purchase', icon: '🛍️', description: 'Made first purchase' },
            SOCIAL_BUTTERFLY: { id: 'social_butterfly', name: 'Social Butterfly', icon: '🦋', description: 'Shared 10 videos' },
            LOYAL_FAN: { id: 'loyal_fan', name: 'Loyal Fan', icon: '❤️', description: '30 day streak' },
            BIG_SPENDER: { id: 'big_spender', name: 'Big Spender', icon: '💰', description: 'Spent over $1000' },
            INFLUENCER: { id: 'influencer', name: 'Influencer', icon: '⭐', description: 'Referred 10 friends' }
        },

        // FOMO Events types
        FOMO_TYPES: {
            FLASH_SALE: 'flash_sale',
            LIMITED_EDITION: 'limited_edition',
            EXCLUSIVE_DROP: 'exclusive_drop',
            LIVE_EVENT: 'live_event',
            CHALLENGE: 'challenge'
        },

        // Storage keys
        STORAGE_KEYS: {
            POINTS: `${NAMESPACE}points`,
            LEVEL: `${NAMESPACE}level`,
            BADGES: `${NAMESPACE}badges`,
            STREAK: `${NAMESPACE}streak`,
            LAST_LOGIN: `${NAMESPACE}lastLogin`,
            ACTIVE_EVENTS: `${NAMESPACE}activeEvents`,
            COMPLETED_CHALLENGES: `${NAMESPACE}completedChallenges`
        },

        // IndexedDB
        INDEXEDDB: {
            NAME: `${NAMESPACE}database`,
            VERSION: 1,
            STORES: {
                POINTS: 'points',
                BADGES: 'badges',
                LEADERBOARD: 'leaderboard',
                EVENTS: 'events',
                CHALLENGES: 'challenges',
                REWARDS: 'rewards',
                STREAKS: 'streaks'
            }
        },

        // Streak settings
        STREAK: {
            RESET_HOURS: 24,
            BONUS_MULTIPLIER: 1.5 // 50% bonus après 7 jours
        }
    };

    // ========================================
    // STATE PRIVÉ
    // ========================================
    let state = {
        isInitialized: false,
        currentUser: null,
        points: 0,
        level: 'BRONZE',
        badges: [],
        streak: 0,
        lastLogin: null,
        activeEvents: [],
        challenges: [],
        rewards: [],
        leaderboard: [],
        db: null // IndexedDB instance
    };

    // ========================================
    // INDEXEDDB INITIALIZATION
    // ========================================
    function initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(CONFIG.INDEXEDDB.NAME, CONFIG.INDEXEDDB.VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                state.db = request.result;
                console.log(`[${MODULE_NAME}] IndexedDB initialized`);
                resolve(state.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store: points
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.POINTS)) {
                    const pointStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.POINTS, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    pointStore.createIndex('userId', 'userId', { unique: false });
                    pointStore.createIndex('action', 'action', { unique: false });
                    pointStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Store: badges
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.BADGES)) {
                    const badgeStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.BADGES, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    badgeStore.createIndex('userId', 'userId', { unique: false });
                    badgeStore.createIndex('badgeType', 'badgeType', { unique: false });
                }

                // Store: leaderboard
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.LEADERBOARD)) {
                    const leaderStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.LEADERBOARD, { 
                        keyPath: 'userId', 
                        autoIncrement: false 
                    });
                    leaderStore.createIndex('points', 'points', { unique: false });
                }

                // Store: events
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.EVENTS)) {
                    const eventStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.EVENTS, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    eventStore.createIndex('type', 'type', { unique: false });
                    eventStore.createIndex('endsAt', 'endsAt', { unique: false });
                    eventStore.createIndex('active', 'active', { unique: false });
                }

                // Store: challenges
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.CHALLENGES)) {
                    const challengeStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.CHALLENGES, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    challengeStore.createIndex('userId', 'userId', { unique: false });
                    challengeStore.createIndex('status', 'status', { unique: false });
                }

                // Store: rewards
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.REWARDS)) {
                    const rewardStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.REWARDS, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    rewardStore.createIndex('userId', 'userId', { unique: false });
                    rewardStore.createIndex('claimed', 'claimed', { unique: false });
                }

                // Store: streaks
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.STREAKS)) {
                    const streakStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.STREAKS, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    streakStore.createIndex('userId', 'userId', { unique: false });
                }

                console.log(`[${MODULE_NAME}] IndexedDB stores created`);
            };
        });
    }

    // ========================================
    // STORAGE HELPERS
    // ========================================
    function saveToLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`[${MODULE_NAME}] Error saving to localStorage:`, error);
        }
    }

    function loadFromLocalStorage(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`[${MODULE_NAME}] Error loading from localStorage:`, error);
            return null;
        }
    }

    function saveToIndexedDB(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                reject(new Error('IndexedDB not initialized'));
                return;
            }

            const transaction = state.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    function getAllFromIndexedDB(storeName) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                reject(new Error('IndexedDB not initialized'));
                return;
            }

            const transaction = state.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ========================================
    // POINTS SYSTEM
    // ========================================
    async function addPoints(action, amount = null, metadata = {}) {
        try {
            if (!state.currentUser) {
                console.warn(`[${MODULE_NAME}] No user logged in`);
                return { success: false, error: 'User not authenticated' };
            }

            // Utiliser montant prédéfini ou custom
            const pointsToAdd = amount || CONFIG.POINT_ACTIONS[action] || 0;

            if (pointsToAdd === 0) {
                return { success: false, error: 'Invalid action' };
            }

            // Appliquer multiplicateur streak
            let finalPoints = pointsToAdd;
            if (state.streak >= 7) {
                finalPoints = Math.floor(pointsToAdd * CONFIG.STREAK.BONUS_MULTIPLIER);
            }

            // Ajouter points
            state.points += finalPoints;

            // Enregistrer transaction
            const transaction = {
                id: `pt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: state.currentUser.id,
                action,
                points: finalPoints,
                metadata,
                timestamp: Date.now()
            };

            await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.POINTS, transaction);
            saveToLocalStorage(CONFIG.STORAGE_KEYS.POINTS, state.points);

            console.log(`[${MODULE_NAME}] ✅ Added ${finalPoints} points for ${action}`);

            // Vérifier changement de niveau
            checkLevelUp();

            // Vérifier badges
            checkBadges(action);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:gamification:points:added', {
                detail: { action, points: finalPoints, total: state.points }
            }));

            return { success: true, points: finalPoints, total: state.points };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error adding points:`, error);
            return { success: false, error: error.message };
        }
    }

    function checkLevelUp() {
        const currentLevel = state.level;
        let newLevel = currentLevel;

        for (const [levelName, levelData] of Object.entries(CONFIG.FAN_LEVELS)) {
            if (state.points >= levelData.min && state.points <= levelData.max) {
                newLevel = levelName;
                break;
            }
        }

        if (newLevel !== currentLevel) {
            state.level = newLevel;
            saveToLocalStorage(CONFIG.STORAGE_KEYS.LEVEL, newLevel);

            console.log(`[${MODULE_NAME}] 🎉 Level up: ${currentLevel} → ${newLevel}`);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:gamification:level:up', {
                detail: { 
                    oldLevel: currentLevel, 
                    newLevel,
                    benefits: CONFIG.FAN_LEVELS[newLevel].benefits
                }
            }));

            // Récompense de level up
            unlockReward({
                type: 'level_up',
                level: newLevel,
                description: `Congratulations! You reached ${CONFIG.FAN_LEVELS[newLevel].name}`
            });
        }
    }

    // ========================================
    // BADGES SYSTEM
    // ========================================
    async function checkBadges(action) {
        try {
            const badgesToCheck = [];

            // Logique de déblocage de badges selon l'action
            if (action === 'SIGNUP') {
                badgesToCheck.push('WELCOME');
            }

            if (action === 'VIDEO_WATCH') {
                // Vérifier si c'est la première vidéo
                const watchCount = await getActionCount('VIDEO_WATCH');
                if (watchCount === 1) {
                    badgesToCheck.push('FIRST_VIDEO');
                }
            }

            if (action === 'PURCHASE') {
                const purchaseCount = await getActionCount('PURCHASE');
                if (purchaseCount === 1) {
                    badgesToCheck.push('FIRST_PURCHASE');
                }
            }

            if (action === 'VIDEO_SHARE') {
                const shareCount = await getActionCount('VIDEO_SHARE');
                if (shareCount === 10) {
                    badgesToCheck.push('SOCIAL_BUTTERFLY');
                }
            }

            // Débloquer badges
            for (const badgeType of badgesToCheck) {
                await unlockBadge(badgeType);
            }

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error checking badges:`, error);
        }
    }

    async function unlockBadge(badgeType) {
        try {
            const badgeConfig = CONFIG.BADGE_TYPES[badgeType];
            if (!badgeConfig) {
                return;
            }

            // Vérifier si déjà débloqué
            if (state.badges.some(b => b.type === badgeType)) {
                return;
            }

            const badge = {
                id: `badge_${Date.now()}_${badgeType}`,
                userId: state.currentUser.id,
                badgeType,
                ...badgeConfig,
                unlockedAt: Date.now()
            };

            state.badges.push(badge);
            await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.BADGES, badge);
            saveToLocalStorage(CONFIG.STORAGE_KEYS.BADGES, state.badges);

            console.log(`[${MODULE_NAME}] 🏆 Badge unlocked: ${badgeConfig.name}`);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:gamification:badge:unlocked', {
                detail: { badge }
            }));

            return badge;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error unlocking badge:`, error);
        }
    }

    async function getActionCount(action) {
        try {
            const allPoints = await getAllFromIndexedDB(CONFIG.INDEXEDDB.STORES.POINTS);
            return allPoints.filter(p => 
                p.userId === state.currentUser.id && 
                p.action === action
            ).length;
        } catch (error) {
            console.error(`[${MODULE_NAME}] Error getting action count:`, error);
            return 0;
        }
    }

    // ========================================
    // STREAK SYSTEM
    // ========================================
    async function checkStreak() {
        try {
            const now = Date.now();
            const lastLogin = loadFromLocalStorage(CONFIG.STORAGE_KEYS.LAST_LOGIN);

            if (!lastLogin) {
                // Première connexion
                state.streak = 1;
            } else {
                const hoursSinceLastLogin = (now - lastLogin) / (1000 * 60 * 60);

                if (hoursSinceLastLogin < CONFIG.STREAK.RESET_HOURS) {
                    // Même jour, pas de changement
                    state.streak = loadFromLocalStorage(CONFIG.STORAGE_KEYS.STREAK) || 1;
                } else if (hoursSinceLastLogin < CONFIG.STREAK.RESET_HOURS * 2) {
                    // Jour suivant, incrémenter
                    state.streak = (loadFromLocalStorage(CONFIG.STORAGE_KEYS.STREAK) || 0) + 1;
                    
                    // Récompense pour streak
                    await addPoints('LOGIN_DAILY');

                    console.log(`[${MODULE_NAME}] 🔥 Streak: ${state.streak} days`);

                    // Badge loyal fan
                    if (state.streak === 30) {
                        await unlockBadge('LOYAL_FAN');
                    }

                    // Émettre event
                    window.dispatchEvent(new CustomEvent('pcf:gamification:streak:updated', {
                        detail: { streak: state.streak }
                    }));
                } else {
                    // Trop longtemps, reset
                    state.streak = 1;
                    console.log(`[${MODULE_NAME}] 💔 Streak reset`);
                }
            }

            // Sauvegarder
            state.lastLogin = now;
            saveToLocalStorage(CONFIG.STORAGE_KEYS.LAST_LOGIN, now);
            saveToLocalStorage(CONFIG.STORAGE_KEYS.STREAK, state.streak);

            await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.STREAKS, {
                id: `streak_${state.currentUser.id}_${Date.now()}`,
                userId: state.currentUser.id,
                streak: state.streak,
                lastLogin: now
            });

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error checking streak:`, error);
        }
    }

    // ========================================
    // FOMO EVENTS
    // ========================================
    async function loadActiveEvents() {
        try {
            console.log(`[${MODULE_NAME}] Loading active FOMO events...`);

            // Charger événements actifs depuis IndexedDB
            const allEvents = await getAllFromIndexedDB(CONFIG.INDEXEDDB.STORES.EVENTS);
            const now = Date.now();

            // Filtrer événements actifs et non expirés
            state.activeEvents = allEvents.filter(event => 
                event.active && event.endsAt > now
            );

            console.log(`[${MODULE_NAME}] ✅ ${state.activeEvents.length} active FOMO events`);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:gamification:events:loaded', {
                detail: { events: state.activeEvents }
            }));

            // Planifier expirations
            state.activeEvents.forEach(event => {
                const timeUntilExpiry = event.endsAt - now;
                if (timeUntilExpiry > 0) {
                    setTimeout(() => {
                        expireEvent(event.id);
                    }, timeUntilExpiry);
                }
            });

            return state.activeEvents;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error loading events:`, error);
            return [];
        }
    }

    function expireEvent(eventId) {
        state.activeEvents = state.activeEvents.filter(e => e.id !== eventId);
        
        console.log(`[${MODULE_NAME}] ⏰ Event expired:`, eventId);

        window.dispatchEvent(new CustomEvent('pcf:gamification:event:expired', {
            detail: { eventId }
        }));
    }

    // ========================================
    // CHALLENGES
    // ========================================
    async function loadChallenges() {
        try {
            console.log(`[${MODULE_NAME}] Loading challenges...`);

            state.challenges = await getAllFromIndexedDB(CONFIG.INDEXEDDB.STORES.CHALLENGES);

            console.log(`[${MODULE_NAME}] ✅ ${state.challenges.length} challenges loaded`);

            return state.challenges;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error loading challenges:`, error);
            return [];
        }
    }

    async function completeChallenge(challengeId) {
        try {
            const challenge = state.challenges.find(c => c.id === challengeId);
            if (!challenge) {
                throw new Error('Challenge not found');
            }

            if (challenge.status === 'completed') {
                return { success: false, error: 'Challenge already completed' };
            }

            challenge.status = 'completed';
            challenge.completedAt = Date.now();

            await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.CHALLENGES, challenge);

            // Récompense
            await addPoints('CHALLENGE_COMPLETED', challenge.reward);

            console.log(`[${MODULE_NAME}] ✅ Challenge completed:`, challenge.name);

            window.dispatchEvent(new CustomEvent('pcf:gamification:challenge:completed', {
                detail: { challenge }
            }));

            return { success: true, challenge };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error completing challenge:`, error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // REWARDS
    // ========================================
    async function unlockReward(rewardData) {
        try {
            const reward = {
                id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: state.currentUser.id,
                ...rewardData,
                claimed: false,
                unlockedAt: Date.now()
            };

            state.rewards.push(reward);
            await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.REWARDS, reward);

            console.log(`[${MODULE_NAME}] 🎁 Reward unlocked:`, reward.type);

            window.dispatchEvent(new CustomEvent('pcf:gamification:reward:unlocked', {
                detail: { reward }
            }));

            return reward;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error unlocking reward:`, error);
        }
    }

    async function claimReward(rewardId) {
        try {
            const reward = state.rewards.find(r => r.id === rewardId);
            if (!reward) {
                throw new Error('Reward not found');
            }

            if (reward.claimed) {
                return { success: false, error: 'Reward already claimed' };
            }

            reward.claimed = true;
            reward.claimedAt = Date.now();

            await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.REWARDS, reward);

            console.log(`[${MODULE_NAME}] ✅ Reward claimed:`, reward.type);

            window.dispatchEvent(new CustomEvent('pcf:gamification:reward:claimed', {
                detail: { reward }
            }));

            return { success: true, reward };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error claiming reward:`, error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // LEADERBOARD
    // ========================================
    async function loadLeaderboard(limit = 50) {
        try {
            console.log(`[${MODULE_NAME}] Loading leaderboard...`);

            state.leaderboard = await getAllFromIndexedDB(CONFIG.INDEXEDDB.STORES.LEADERBOARD);
            
            // Trier par points décroissants
            state.leaderboard.sort((a, b) => b.points - a.points);
            
            // Limiter
            state.leaderboard = state.leaderboard.slice(0, limit);

            console.log(`[${MODULE_NAME}] ✅ Leaderboard loaded: top ${state.leaderboard.length}`);

            return state.leaderboard;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error loading leaderboard:`, error);
            return [];
        }
    }

    function getUserRank() {
        if (!state.currentUser) {
            return null;
        }

        const userIndex = state.leaderboard.findIndex(u => u.userId === state.currentUser.id);
        return userIndex >= 0 ? userIndex + 1 : null;
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    async function init() {
        if (state.isInitialized) {
            console.warn(`[${MODULE_NAME}] Already initialized`);
            return;
        }

        try {
            console.log(`[${MODULE_NAME}] Initializing...`);

            // Vérifier dépendances
            if (!window.PaieCashFan_CoreSystem) {
                throw new Error('Core System not found');
            }

            if (window.PaieCashFan_AuthPersistent) {
                const authState = window.PaieCashFan_AuthPersistent.getState();
                state.currentUser = authState.user;
            }

            // Initialiser IndexedDB
            await initIndexedDB();

            // Restaurer données
            state.points = loadFromLocalStorage(CONFIG.STORAGE_KEYS.POINTS) || 0;
            state.level = loadFromLocalStorage(CONFIG.STORAGE_KEYS.LEVEL) || 'BRONZE';
            state.badges = loadFromLocalStorage(CONFIG.STORAGE_KEYS.BADGES) || [];
            state.streak = loadFromLocalStorage(CONFIG.STORAGE_KEYS.STREAK) || 0;

            // Check streak
            if (state.currentUser) {
                await checkStreak();
            }

            // Charger événements actifs
            await loadActiveEvents();

            state.isInitialized = true;

            // Enregistrer dans CoreSystem
            window.PaieCashFan_CoreSystem.registerModule(MODULE_NAME, {
                version: '11.0.0',
                status: 'active',
                namespace: NAMESPACE
            });

            console.log(`[${MODULE_NAME}] ✅ Module initialized`);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:module:ready', {
                detail: { module: MODULE_NAME }
            }));

        } catch (error) {
            console.error(`[${MODULE_NAME}] Initialization failed:`, error);
            throw error;
        }
    }

    // ========================================
    // PUBLIC API
    // ========================================
    const GamificationFomoAPI = {
        // Core
        init,
        getState: () => ({ ...state }),

        // Points
        addPoints,
        getPoints: () => state.points,
        getLevel: () => state.level,
        getLevelInfo: () => CONFIG.FAN_LEVELS[state.level],

        // Badges
        getBadges: () => [...state.badges],
        unlockBadge,

        // Streak
        getStreak: () => state.streak,
        checkStreak,

        // Events
        loadActiveEvents,
        getActiveEvents: () => [...state.activeEvents],

        // Challenges
        loadChallenges,
        completeChallenge,
        getChallenges: () => [...state.challenges],

        // Rewards
        unlockReward,
        claimReward,
        getRewards: () => [...state.rewards],

        // Leaderboard
        loadLeaderboard,
        getLeaderboard: () => [...state.leaderboard],
        getUserRank,

        // Config
        getConfig: () => ({ ...CONFIG })
    };

    // ========================================
    // EXPORT MODULE
    // ========================================
    window.PaieCashFan_GamificationFomo = GamificationFomoAPI;

    console.log(`[${MODULE_NAME}] Module loaded. Use window.PaieCashFan_GamificationFomo to access API`);

    // Auto-init si Core System est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.PaieCashFan_CoreSystem) {
                init().catch(console.error);
            }
        });
    } else {
        if (window.PaieCashFan_CoreSystem) {
            init().catch(console.error);
        }
    }

})(window);
