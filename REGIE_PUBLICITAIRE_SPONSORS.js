/**
 * 📢 RÉGIE PUBLICITAIRE SPONSORS V16.0
 * ====================================
 * 
 * FOMO ECONOMICS : Le Club ET le Fan gagnent de l'argent !
 * 
 * 🎯 CONCEPT :
 * - Sponsors peuvent être : Pays, Ville, Marque, Produit
 * - Traçabilité totale des interactions fans
 * - Interactions : Like, Partage, Commentaire, Achat, Live Shopping
 * - Cashback automatique + Points de fidélité
 * 
 * 👥 PROGRAMME AMBASSADEUR (3 niveaux) :
 * 1. 🌟 JOUEUR / LÉGENDE : Promotion sponsors du club
 * 2. ⭐ FAN VIP : Promotion sponsors du club
 * 3. 💎 AMBASSADEUR PAIECASH : Promotion PaieCash dans son réseau
 * 
 * 💰 SYSTÈME DE RÉMUNÉRATION :
 * - Like = 0.01€ en stablecoin club
 * - Partage = 0.05€ en stablecoin club
 * - Commentaire = 0.02€ en stablecoin club
 * - Achat produit sponsor = 5% cashback
 * - Parrainage = 2€ par filleul VALIDÉ (après achat min 30€)
 * 
 * Version: 16.0.0
 * Date: 27 Décembre 2025
 * Author: PaieCashFan Team
 */

const REGIE_PUBLICITAIRE_SPONSORS = (function() {
    'use strict';

    // ========================================
    // 📊 CONFIGURATION RÉGIE
    // ========================================
    const CONFIG = {
        // Taux de rémunération (en EUR)
        REWARDS: {
            LIKE: 0.01,
            SHARE: 0.05,
            COMMENT: 0.02,
            PURCHASE_CASHBACK_PERCENT: 5,
            REFERRAL: 2.00,
            REFERRAL_MIN_PURCHASE: 30.00, // Montant minimum d'achat pour activer le parrainage
            STORY_VIEW: 0.005,
            LIVE_SHOPPING_PURCHASE: 10 // 10% cashback spécial live shopping
        },

        // Validation parrainage
        REFERRAL_VALIDATION: {
            MIN_PURCHASE_AMOUNT: 30.00, // 30€ minimum
            VALID_PURCHASE_TYPES: ['BOUTIQUE', 'BILLETTERIE'], // Types d'achats valides
            VALIDATION_DELAY: 24 * 60 * 60 * 1000, // 24h en millisecondes
            MAX_PENDING_DAYS: 30 // 30 jours max en attente
        },

        // Niveaux ambassadeur
        AMBASSADOR_LEVELS: {
            PLAYER: {
                name: 'Joueur/Légende',
                icon: '🌟',
                commission_percent: 20,
                min_followers: 0,
                description: 'Joueur ou légende du club'
            },
            FAN_VIP: {
                name: 'Fan VIP',
                icon: '⭐',
                commission_percent: 10,
                min_followers: 100,
                description: 'Fan actif du club'
            },
            AMBASSADOR: {
                name: 'Ambassadeur PaieCash',
                icon: '💎',
                commission_percent: 15,
                min_followers: 50,
                description: 'Ambassadeur PaieCash'
            }
        },

        // Types de sponsors
        SPONSOR_TYPES: ['PAYS', 'VILLE', 'MARQUE', 'PRODUIT'],

        // API Endpoints
        API: {
            BASE_URL: '/api/v16/regie',
            TRACK_INTERACTION: '/track',
            GET_CAMPAIGNS: '/campaigns',
            GET_STATS: '/stats',
            CLAIM_REWARD: '/claim'
        }
    };

    // ========================================
    // 💾 STORAGE (IndexedDB)
    // ========================================
    let db = null;
    const DB_NAME = 'paiecashfan_regie_v16';
    const DB_VERSION = 1;

    async function initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                db = request.result;
                resolve(db);
            };
            
            request.onupgradeneeded = (e) => {
                const database = e.target.result;
                
                // Store : interactions
                if (!database.objectStoreNames.contains('interactions')) {
                    const interactionsStore = database.createObjectStore('interactions', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    interactionsStore.createIndex('userId', 'userId', { unique: false });
                    interactionsStore.createIndex('campaignId', 'campaignId', { unique: false });
                    interactionsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // Store : campaigns
                if (!database.objectStoreNames.contains('campaigns')) {
                    const campaignsStore = database.createObjectStore('campaigns', { 
                        keyPath: 'id' 
                    });
                    campaignsStore.createIndex('sponsorId', 'sponsorId', { unique: false });
                    campaignsStore.createIndex('clubId', 'clubId', { unique: false });
                    campaignsStore.createIndex('active', 'active', { unique: false });
                }
                
                // Store : rewards
                if (!database.objectStoreNames.contains('rewards')) {
                    const rewardsStore = database.createObjectStore('rewards', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    rewardsStore.createIndex('userId', 'userId', { unique: false });
                    rewardsStore.createIndex('claimed', 'claimed', { unique: false });
                }
                
                // Store : ambassadors
                if (!database.objectStoreNames.contains('ambassadors')) {
                    const ambassadorsStore = database.createObjectStore('ambassadors', { 
                        keyPath: 'userId' 
                    });
                    ambassadorsStore.createIndex('level', 'level', { unique: false });
                    ambassadorsStore.createIndex('clubId', 'clubId', { unique: false });
                }
                
                // Store : referrals (système anti-faux comptes)
                if (!database.objectStoreNames.contains('referrals')) {
                    const referralsStore = database.createObjectStore('referrals', { 
                        keyPath: 'id' 
                    });
                    referralsStore.createIndex('sponsorId', 'sponsorId', { unique: false });
                    referralsStore.createIndex('newUserId', 'newUserId', { unique: false });
                    referralsStore.createIndex('status', 'status', { unique: false });
                    referralsStore.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };
        });
    }

    // ========================================
    // 🎯 TRACKING INTERACTIONS
    // ========================================
    
    /**
     * Track interaction fan avec campagne sponsor
     * @param {string} type - Type interaction (LIKE, SHARE, COMMENT, PURCHASE, etc.)
     * @param {object} data - Données interaction
     */
    async function trackInteraction(type, data) {
        try {
            const interaction = {
                id: `INT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: type.toUpperCase(),
                userId: data.userId,
                userName: data.userName,
                campaignId: data.campaignId,
                campaignName: data.campaignName,
                sponsorId: data.sponsorId,
                sponsorName: data.sponsorName,
                sponsorType: data.sponsorType,
                clubId: data.clubId,
                amount: calculateReward(type, data),
                currency: data.currency || 'EUR',
                metadata: {
                    postId: data.postId || null,
                    productId: data.productId || null,
                    purchaseAmount: data.purchaseAmount || 0,
                    referralCode: data.referralCode || null,
                    comment: data.comment || null,
                    shareUrl: data.shareUrl || null
                },
                timestamp: Date.now(),
                status: 'PENDING', // PENDING, VALIDATED, CLAIMED
                validatedAt: null,
                claimedAt: null
            };

            // Sauvegarder dans IndexedDB
            await saveInteraction(interaction);

            // Envoyer au backend
            await sendToBackend(interaction);

            // Notifier l'utilisateur
            showRewardNotification(interaction);

            console.log('✅ Interaction trackée:', interaction);
            return interaction;
        } catch (error) {
            console.error('❌ Erreur tracking interaction:', error);
            throw error;
        }
    }

    /**
     * Calculer montant reward selon type interaction
     */
    function calculateReward(type, data) {
        const TYPE = type.toUpperCase();
        
        switch(TYPE) {
            case 'LIKE':
                return CONFIG.REWARDS.LIKE;
            
            case 'SHARE':
                return CONFIG.REWARDS.SHARE;
            
            case 'COMMENT':
                return CONFIG.REWARDS.COMMENT;
            
            case 'STORY_VIEW':
                return CONFIG.REWARDS.STORY_VIEW;
            
            case 'PURCHASE':
                const purchaseAmount = data.purchaseAmount || 0;
                const cashbackPercent = data.isLiveShopping 
                    ? CONFIG.REWARDS.LIVE_SHOPPING_PURCHASE 
                    : CONFIG.REWARDS.PURCHASE_CASHBACK_PERCENT;
                return purchaseAmount * (cashbackPercent / 100);
            
            case 'REFERRAL':
                // Le parrainage doit être validé après achat minimum
                return 0; // Sera crédité après validation
            
            case 'REFERRAL_VALIDATED':
                // Parrainage validé après achat minimum 30€
                return CONFIG.REWARDS.REFERRAL;
            
            default:
                return 0;
        }
    }

    /**
     * Sauvegarder interaction dans IndexedDB
     */
    async function saveInteraction(interaction) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['interactions'], 'readwrite');
            const store = transaction.objectStore('interactions');
            const request = store.add(interaction);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Envoyer interaction au backend
     */
    async function sendToBackend(interaction) {
        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.TRACK_INTERACTION}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(interaction)
            });
            
            if (!response.ok) throw new Error('Erreur envoi backend');
            
            return await response.json();
        } catch (error) {
            console.error('❌ Erreur envoi backend:', error);
            // Garder en local pour retry plus tard
            return { offline: true };
        }
    }

    /**
     * Afficher notification reward
     */
    function showRewardNotification(interaction) {
        const amount = interaction.amount.toFixed(2);
        const currency = interaction.currency;
        const type = interaction.type;
        
        let message = '';
        switch(type) {
            case 'LIKE':
                message = `👍 +${amount}€ pour ton like !`;
                break;
            case 'SHARE':
                message = `🔄 +${amount}€ pour ton partage !`;
                break;
            case 'COMMENT':
                message = `💬 +${amount}€ pour ton commentaire !`;
                break;
            case 'PURCHASE':
                message = `🛍️ +${amount}€ cashback !`;
                break;
            case 'REFERRAL':
                message = `🎁 +${amount}€ parrainage !`;
                break;
        }
        
        // Créer notification visuelle
        const notification = document.createElement('div');
        notification.className = 'reward-notification';
        notification.innerHTML = `
            <div class="reward-content">
                <span class="reward-icon">💰</span>
                <span class="reward-message">${message}</span>
            </div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(72, 187, 120, 0.4);
            z-index: 99999;
            animation: slideIn 0.3s ease-out;
            font-weight: 600;
            font-size: 15px;
        `;
        
        document.body.appendChild(notification);
        
        // Retirer après 3 secondes
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ========================================
    // 🎪 CAMPAGNES SPONSOR
    // ========================================
    
    /**
     * Récupérer campagnes actives pour un club
     */
    async function getActiveCampaigns(clubId) {
        try {
            const response = await fetch(
                `${CONFIG.API.BASE_URL}${CONFIG.API.GET_CAMPAIGNS}?clubId=${clubId}&active=true`,
                {
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`
                    }
                }
            );
            
            if (!response.ok) throw new Error('Erreur récupération campagnes');
            
            const campaigns = await response.json();
            
            // Sauvegarder en cache
            await saveCampaigns(campaigns);
            
            return campaigns;
        } catch (error) {
            console.error('❌ Erreur récupération campagnes:', error);
            // Fallback : campagnes en cache
            return await getCachedCampaigns(clubId);
        }
    }

    /**
     * Sauvegarder campagnes en cache
     */
    async function saveCampaigns(campaigns) {
        const transaction = db.transaction(['campaigns'], 'readwrite');
        const store = transaction.objectStore('campaigns');
        
        campaigns.forEach(campaign => {
            store.put(campaign);
        });
        
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * Récupérer campagnes depuis cache
     */
    async function getCachedCampaigns(clubId) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['campaigns'], 'readonly');
            const store = transaction.objectStore('campaigns');
            const index = store.index('clubId');
            const request = index.getAll(clubId);
            
            request.onsuccess = () => {
                const campaigns = request.result.filter(c => c.active);
                resolve(campaigns);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // ========================================
    // 👥 PROGRAMME AMBASSADEUR
    // ========================================
    
    /**
     * Récupérer statut ambassadeur utilisateur
     */
    async function getAmbassadorStatus(userId) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['ambassadors'], 'readonly');
            const store = transaction.objectStore('ambassadors');
            const request = store.get(userId);
            
            request.onsuccess = () => {
                const ambassador = request.result || {
                    userId: userId,
                    level: null,
                    clubId: null,
                    followers: 0,
                    totalEarnings: 0,
                    totalReferrals: 0,
                    createdAt: Date.now()
                };
                resolve(ambassador);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Mettre à jour niveau ambassadeur
     */
    async function updateAmbassadorLevel(userId, level, clubId) {
        const ambassador = await getAmbassadorStatus(userId);
        ambassador.level = level;
        ambassador.clubId = clubId;
        ambassador.updatedAt = Date.now();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['ambassadors'], 'readwrite');
            const store = transaction.objectStore('ambassadors');
            const request = store.put(ambassador);
            
            request.onsuccess = () => resolve(ambassador);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Calculer commission ambassadeur
     */
    function calculateAmbassadorCommission(level, amount) {
        const levelConfig = CONFIG.AMBASSADOR_LEVELS[level];
        if (!levelConfig) return 0;
        
        return amount * (levelConfig.commission_percent / 100);
    }

    // ========================================
    // 🎁 SYSTÈME PARRAINAGE ANTI-FAUX COMPTES
    // ========================================
    
    /**
     * Créer un parrainage en attente de validation
     * @param {string} sponsorId - ID du parrain
     * @param {string} newUserId - ID du filleul
     * @param {string} referralCode - Code de parrainage
     */
    async function createPendingReferral(sponsorId, newUserId, referralCode) {
        const referral = {
            id: `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sponsorId: sponsorId,
            newUserId: newUserId,
            referralCode: referralCode,
            status: 'PENDING', // PENDING, VALIDATED, EXPIRED, REJECTED
            createdAt: Date.now(),
            validatedAt: null,
            firstPurchaseAmount: 0,
            firstPurchaseType: null,
            expiresAt: Date.now() + (CONFIG.REFERRAL_VALIDATION.MAX_PENDING_DAYS * 24 * 60 * 60 * 1000)
        };

        // Sauvegarder dans IndexedDB
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['referrals'], 'readwrite');
            const store = transaction.objectStore('referrals');
            const request = store.add(referral);
            
            request.onsuccess = () => {
                console.log('✅ Parrainage créé (en attente validation):', referral);
                resolve(referral);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Valider un parrainage après achat minimum 30€
     * @param {string} newUserId - ID du filleul qui vient d'acheter
     * @param {number} purchaseAmount - Montant de l'achat
     * @param {string} purchaseType - Type d'achat (BOUTIQUE ou BILLETTERIE)
     */
    async function validateReferral(newUserId, purchaseAmount, purchaseType) {
        try {
            // Vérifier que c'est un achat valide
            if (!CONFIG.REFERRAL_VALIDATION.VALID_PURCHASE_TYPES.includes(purchaseType)) {
                console.log('❌ Type d\'achat non valide pour parrainage:', purchaseType);
                return null;
            }

            // Vérifier le montant minimum
            if (purchaseAmount < CONFIG.REFERRAL_VALIDATION.MIN_PURCHASE_AMOUNT) {
                console.log(`⚠️ Montant insuffisant pour validation parrainage: ${purchaseAmount}€ (min ${CONFIG.REFERRAL_VALIDATION.MIN_PURCHASE_AMOUNT}€)`);
                return null;
            }

            // Chercher le parrainage en attente
            const referral = await getPendingReferralByUserId(newUserId);
            if (!referral) {
                console.log('ℹ️ Aucun parrainage en attente pour cet utilisateur');
                return null;
            }

            // Vérifier si pas expiré
            if (Date.now() > referral.expiresAt) {
                console.log('⚠️ Parrainage expiré');
                await updateReferralStatus(referral.id, 'EXPIRED');
                return null;
            }

            // VALIDER LE PARRAINAGE
            referral.status = 'VALIDATED';
            referral.validatedAt = Date.now();
            referral.firstPurchaseAmount = purchaseAmount;
            referral.firstPurchaseType = purchaseType;

            // Mettre à jour dans IndexedDB
            await updateReferral(referral);

            // CRÉDITER LE PARRAIN
            const sponsorReward = await trackInteraction('REFERRAL_VALIDATED', {
                userId: referral.sponsorId,
                userName: 'Parrain',
                campaignId: 'REFERRAL_PROGRAM',
                campaignName: 'Programme Parrainage',
                sponsorId: 'PAIECASHFAN',
                sponsorName: 'PaieCashFan',
                sponsorType: 'MARQUE',
                clubId: 'ALL',
                referralCode: referral.referralCode,
                referredUserId: newUserId,
                firstPurchaseAmount: purchaseAmount,
                firstPurchaseType: purchaseType
            });

            console.log('✅ PARRAINAGE VALIDÉ ! Parrain crédité de 2€', sponsorReward);

            // Notifier le parrain
            showReferralValidatedNotification(referral);

            return referral;
        } catch (error) {
            console.error('❌ Erreur validation parrainage:', error);
            throw error;
        }
    }

    /**
     * Récupérer parrainage en attente par userId du filleul
     */
    async function getPendingReferralByUserId(newUserId) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['referrals'], 'readonly');
            const store = transaction.objectStore('referrals');
            const index = store.index('newUserId');
            const request = index.get(newUserId);
            
            request.onsuccess = () => {
                const referral = request.result;
                if (referral && referral.status === 'PENDING') {
                    resolve(referral);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Mettre à jour un parrainage
     */
    async function updateReferral(referral) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['referrals'], 'readwrite');
            const store = transaction.objectStore('referrals');
            const request = store.put(referral);
            
            request.onsuccess = () => resolve(referral);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Mettre à jour statut parrainage
     */
    async function updateReferralStatus(referralId, status) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['referrals'], 'readwrite');
            const store = transaction.objectStore('referrals');
            const getRequest = store.get(referralId);
            
            getRequest.onsuccess = () => {
                const referral = getRequest.result;
                if (referral) {
                    referral.status = status;
                    referral.updatedAt = Date.now();
                    const updateRequest = store.put(referral);
                    updateRequest.onsuccess = () => resolve(referral);
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    reject(new Error('Parrainage non trouvé'));
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    /**
     * Notification validation parrainage
     */
    function showReferralValidatedNotification(referral) {
        const notification = document.createElement('div');
        notification.className = 'referral-validated-notification';
        notification.innerHTML = `
            <div class="referral-content">
                <span class="referral-icon">🎉</span>
                <div class="referral-message">
                    <strong>PARRAINAGE VALIDÉ !</strong><br>
                    +2.00€ crédités pour votre filleul actif
                </div>
            </div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(72, 187, 120, 0.5);
            z-index: 99999;
            animation: slideIn 0.5s ease-out;
            font-weight: 600;
            font-size: 16px;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Retirer après 5 secondes
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-out';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }

    // ========================================
    // 📊 STATISTIQUES & ANALYTICS
    // ========================================
    
    /**
     * Récupérer stats utilisateur
     */
    async function getUserStats(userId) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['interactions', 'rewards'], 'readonly');
            const interactionsStore = transaction.objectStore('interactions');
            const rewardsStore = transaction.objectStore('rewards');
            
            const interactionsIndex = interactionsStore.index('userId');
            const rewardsIndex = rewardsStore.index('userId');
            
            const interactionsRequest = interactionsIndex.getAll(userId);
            const rewardsRequest = rewardsIndex.getAll(userId);
            
            let interactions = [];
            let rewards = [];
            
            interactionsRequest.onsuccess = () => {
                interactions = interactionsRequest.result;
            };
            
            rewardsRequest.onsuccess = () => {
                rewards = rewardsRequest.result;
            };
            
            transaction.oncomplete = () => {
                const stats = {
                    totalInteractions: interactions.length,
                    totalEarnings: interactions.reduce((sum, i) => sum + i.amount, 0),
                    totalClaimed: rewards.filter(r => r.claimed).reduce((sum, r) => sum + r.amount, 0),
                    totalPending: interactions.filter(i => i.status === 'PENDING').reduce((sum, i) => sum + i.amount, 0),
                    byType: {
                        likes: interactions.filter(i => i.type === 'LIKE').length,
                        shares: interactions.filter(i => i.type === 'SHARE').length,
                        comments: interactions.filter(i => i.type === 'COMMENT').length,
                        purchases: interactions.filter(i => i.type === 'PURCHASE').length,
                        referrals: interactions.filter(i => i.type === 'REFERRAL').length
                    }
                };
                resolve(stats);
            };
            
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // ========================================
    // 🔧 HELPERS
    // ========================================
    
    function getAuthToken() {
        return localStorage.getItem('paiecashfan_auth_token') || '';
    }

    function generateReferralCode(userId, clubId) {
        return `PCF_${clubId}_${userId}`.toUpperCase();
    }

    // ========================================
    // 🎨 ANIMATIONS CSS
    // ========================================
    
    function injectCSS() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // 🚀 INITIALISATION
    // ========================================
    
    async function init() {
        try {
            await initDB();
            injectCSS();
            console.log('✅ Régie Publicitaire Sponsors initialisée');
        } catch (error) {
            console.error('❌ Erreur initialisation Régie:', error);
        }
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ========================================
    // 📤 API PUBLIQUE
    // ========================================
    
    return {
        // Tracking
        trackInteraction,
        
        // Campagnes
        getActiveCampaigns,
        
        // Ambassadeur
        getAmbassadorStatus,
        updateAmbassadorLevel,
        calculateAmbassadorCommission,
        generateReferralCode,
        
        // Parrainage Anti-Faux Comptes
        createPendingReferral,
        validateReferral,
        getPendingReferralByUserId,
        updateReferralStatus,
        
        // Stats
        getUserStats,
        
        // Config
        CONFIG
    };
})();

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = REGIE_PUBLICITAIRE_SPONSORS;
}
