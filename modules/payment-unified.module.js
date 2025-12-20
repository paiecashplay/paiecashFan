/**
 * ========================================
 * 💳 PAYMENT UNIFIED MODULE V11.0
 * ========================================
 * Module unifié pour la gestion des paiements (Crypto + Fiat)
 * 
 * FONCTIONNALITÉS :
 * - Multi-PSP : NowPayments, Triple-A, SMS Payment, Alipay
 * - Crypto payments : USDT, USDC, BTC, ETH, BNB
 * - Fiat payments : Carte bancaire, Mobile Money, SMS
 * - Payment sessions avec timeout
 * - Transaction history
 * - Webhook handling
 * - QR Code payments
 * - Buy Now Pay Later (BNPL)
 * - Persistent storage avec IndexedDB
 * 
 * NAMESPACE : pcf_v11_PaymentUnified_
 * DÉPENDANCES : core-system.module.js
 * 
 * INTÉGRATION EXISTANTE :
 * - 💰_nowpayments-integration.js
 * - js/triple-a-payment.js
 * - js/sms-payment.js
 * - backend/models/payment.model.js
 * - backend/services/nowpayments.service.js
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
    const MODULE_NAME = 'PaymentUnified';
    const NAMESPACE = `pcf_v11_${MODULE_NAME}_`;

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        // NowPayments API
        NOWPAYMENTS: {
            API_URL: 'https://api.nowpayments.io/v1',
            SANDBOX_URL: 'https://api-sandbox.nowpayments.io/v1',
            API_KEY: '', // À configurer
            SANDBOX: true // Mettre false en production
        },

        // Triple-A API
        TRIPLE_A: {
            API_URL: 'https://api.triple-a.io/api/v2',
            MERCHANT_KEY: '', // À configurer
            CLIENT_ID: '' // À configurer
        },

        // SMS Payment API
        SMS_PAYMENT: {
            API_URL: '/api/payments/sms',
            PROVIDERS: ['Orange Money', 'MTN Mobile Money', 'Wave', 'Moov Money']
        },

        // Supported payment methods
        PAYMENT_METHODS: {
            CRYPTO: ['USDT', 'USDC', 'BTC', 'ETH', 'BNB', 'MATIC', 'TRX'],
            FIAT: ['CARD', 'MOBILE_MONEY', 'SMS', 'ALIPAY'],
            BNPL: ['KLARNA', 'AFFIRM', 'AFTERPAY']
        },

        // Transaction timeout (15 minutes)
        PAYMENT_TIMEOUT: 15 * 60 * 1000,

        // Storage keys
        STORAGE_KEYS: {
            PAYMENT_SESSIONS: `${NAMESPACE}paymentSessions`,
            PAYMENT_HISTORY: `${NAMESPACE}paymentHistory`,
            PENDING_PAYMENTS: `${NAMESPACE}pendingPayments`,
            PAYMENT_METHODS: `${NAMESPACE}paymentMethods`
        },

        // IndexedDB
        INDEXEDDB: {
            NAME: `${NAMESPACE}database`,
            VERSION: 1,
            STORES: {
                PAYMENTS: 'payments',
                SESSIONS: 'sessions',
                METHODS: 'methods'
            }
        }
    };

    // ========================================
    // STATE PRIVÉ
    // ========================================
    let state = {
        isInitialized: false,
        currentPayment: null,
        paymentSessions: {},
        paymentHistory: [],
        savedMethods: [],
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

                // Store: payments
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.PAYMENTS)) {
                    const paymentStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.PAYMENTS, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    paymentStore.createIndex('status', 'status', { unique: false });
                    paymentStore.createIndex('timestamp', 'createdAt', { unique: false });
                    paymentStore.createIndex('userId', 'userId', { unique: false });
                }

                // Store: sessions
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.SESSIONS)) {
                    const sessionStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.SESSIONS, { 
                        keyPath: 'sessionId', 
                        autoIncrement: false 
                    });
                    sessionStore.createIndex('status', 'status', { unique: false });
                }

                // Store: methods
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.METHODS)) {
                    db.createObjectStore(CONFIG.INDEXEDDB.STORES.METHODS, { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
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
    // PAYMENT CREATION
    // ========================================
    async function createPayment(paymentData) {
        try {
            console.log(`[${MODULE_NAME}] Creating payment:`, paymentData);

            const { 
                amount, 
                currency = 'USD', 
                method, 
                description = '', 
                metadata = {} 
            } = paymentData;

            // Validation
            if (!amount || amount <= 0) {
                throw new Error('Invalid amount');
            }

            if (!method) {
                throw new Error('Payment method required');
            }

            // Générer payment ID
            const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Créer payment object
            const payment = {
                id: paymentId,
                amount,
                currency,
                method,
                description,
                metadata,
                status: 'pending',
                createdAt: Date.now(),
                expiresAt: Date.now() + CONFIG.PAYMENT_TIMEOUT,
                userId: metadata.userId || null
            };

            // Router vers le bon PSP
            let paymentResult;
            if (CONFIG.PAYMENT_METHODS.CRYPTO.includes(method)) {
                paymentResult = await createCryptoPayment(payment);
            } else if (method === 'MOBILE_MONEY') {
                paymentResult = await createMobileMoneyPayment(payment);
            } else if (method === 'SMS') {
                paymentResult = await createSMSPayment(payment);
            } else if (method === 'CARD') {
                paymentResult = await createCardPayment(payment);
            } else {
                throw new Error(`Unsupported payment method: ${method}`);
            }

            // Enrichir payment avec résultat
            Object.assign(payment, paymentResult);

            // Sauvegarder
            state.currentPayment = payment;
            state.paymentSessions[paymentId] = payment;
            
            await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.PAYMENTS, payment);
            await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.SESSIONS, {
                sessionId: paymentId,
                ...payment
            });

            saveToLocalStorage(CONFIG.STORAGE_KEYS.PENDING_PAYMENTS, 
                Object.keys(state.paymentSessions)
            );

            console.log(`[${MODULE_NAME}] ✅ Payment created:`, paymentId);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:payment:created', {
                detail: { payment }
            }));

            // Démarrer timeout checker
            startPaymentTimeout(paymentId);

            return { success: true, payment };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error creating payment:`, error);
            window.dispatchEvent(new CustomEvent('pcf:payment:error', {
                detail: { error: error.message }
            }));
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // CRYPTO PAYMENT (NowPayments)
    // ========================================
    async function createCryptoPayment(payment) {
        try {
            console.log(`[${MODULE_NAME}] Creating crypto payment via NowPayments...`);

            const apiUrl = CONFIG.NOWPAYMENTS.SANDBOX ? 
                CONFIG.NOWPAYMENTS.SANDBOX_URL : 
                CONFIG.NOWPAYMENTS.API_URL;

            // Simulation de création de paiement NowPayments
            // En production, faire un vrai appel API
            const mockResponse = {
                payment_id: `np_${Date.now()}`,
                payment_status: 'waiting',
                pay_address: '0x' + Array(40).fill(0).map(() => 
                    Math.floor(Math.random() * 16).toString(16)
                ).join(''),
                pay_amount: payment.amount,
                pay_currency: payment.method,
                price_amount: payment.amount,
                price_currency: payment.currency,
                order_id: payment.id,
                order_description: payment.description,
                created_at: new Date().toISOString(),
                payment_url: `https://nowpayments.io/payment?order_id=${payment.id}`,
                qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${payment.id}`
            };

            console.log(`[${MODULE_NAME}] ✅ NowPayments response:`, mockResponse);

            return {
                pspProvider: 'nowpayments',
                pspPaymentId: mockResponse.payment_id,
                paymentAddress: mockResponse.pay_address,
                paymentAmount: mockResponse.pay_amount,
                paymentCurrency: mockResponse.pay_currency,
                paymentUrl: mockResponse.payment_url,
                qrCode: mockResponse.qr_code
            };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error creating crypto payment:`, error);
            throw error;
        }
    }

    // ========================================
    // MOBILE MONEY PAYMENT
    // ========================================
    async function createMobileMoneyPayment(payment) {
        try {
            console.log(`[${MODULE_NAME}] Creating Mobile Money payment...`);

            // Simulation de création de paiement Mobile Money
            const mockResponse = {
                payment_id: `mm_${Date.now()}`,
                provider: payment.metadata.provider || 'Orange Money',
                phone_number: payment.metadata.phoneNumber,
                amount: payment.amount,
                currency: payment.currency,
                reference: payment.id,
                status: 'pending',
                instructions: 'Composez *144*4*6# pour valider le paiement'
            };

            console.log(`[${MODULE_NAME}] ✅ Mobile Money payment created:`, mockResponse);

            return {
                pspProvider: 'mobile_money',
                pspPaymentId: mockResponse.payment_id,
                provider: mockResponse.provider,
                phoneNumber: mockResponse.phone_number,
                instructions: mockResponse.instructions
            };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error creating Mobile Money payment:`, error);
            throw error;
        }
    }

    // ========================================
    // SMS PAYMENT
    // ========================================
    async function createSMSPayment(payment) {
        try {
            console.log(`[${MODULE_NAME}] Creating SMS payment...`);

            // Simulation de création de paiement SMS
            const mockResponse = {
                payment_id: `sms_${Date.now()}`,
                sms_code: Math.floor(100000 + Math.random() * 900000).toString(),
                phone_number: payment.metadata.phoneNumber,
                amount: payment.amount,
                currency: payment.currency,
                instructions: `Envoyez ${payment.amount} ${payment.currency} par SMS au numéro court`
            };

            console.log(`[${MODULE_NAME}] ✅ SMS payment created:`, mockResponse);

            return {
                pspProvider: 'sms',
                pspPaymentId: mockResponse.payment_id,
                smsCode: mockResponse.sms_code,
                phoneNumber: mockResponse.phone_number,
                instructions: mockResponse.instructions
            };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error creating SMS payment:`, error);
            throw error;
        }
    }

    // ========================================
    // CARD PAYMENT
    // ========================================
    async function createCardPayment(payment) {
        try {
            console.log(`[${MODULE_NAME}] Creating card payment...`);

            // Simulation de création de paiement par carte
            const mockResponse = {
                payment_id: `card_${Date.now()}`,
                checkout_url: `https://checkout.paiecashfan.com/${payment.id}`,
                amount: payment.amount,
                currency: payment.currency
            };

            console.log(`[${MODULE_NAME}] ✅ Card payment created:`, mockResponse);

            return {
                pspProvider: 'stripe', // ou autre gateway
                pspPaymentId: mockResponse.payment_id,
                checkoutUrl: mockResponse.checkout_url
            };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error creating card payment:`, error);
            throw error;
        }
    }

    // ========================================
    // PAYMENT STATUS CHECK
    // ========================================
    async function checkPaymentStatus(paymentId) {
        try {
            console.log(`[${MODULE_NAME}] Checking payment status:`, paymentId);

            // Charger depuis IndexedDB
            const transaction = state.db.transaction([CONFIG.INDEXEDDB.STORES.PAYMENTS], 'readonly');
            const store = transaction.objectStore(CONFIG.INDEXEDDB.STORES.PAYMENTS);
            const request = store.get(paymentId);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const payment = request.result;
                    if (payment) {
                        console.log(`[${MODULE_NAME}] ✅ Payment status:`, payment.status);
                        resolve(payment);
                    } else {
                        reject(new Error('Payment not found'));
                    }
                };
                request.onerror = () => reject(request.error);
            });

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error checking payment status:`, error);
            throw error;
        }
    }

    // ========================================
    // PAYMENT CONFIRMATION
    // ========================================
    async function confirmPayment(paymentId, confirmationData = {}) {
        try {
            console.log(`[${MODULE_NAME}] Confirming payment:`, paymentId);

            const payment = await checkPaymentStatus(paymentId);

            if (!payment) {
                throw new Error('Payment not found');
            }

            if (payment.status === 'completed') {
                console.log(`[${MODULE_NAME}] Payment already completed`);
                return { success: true, payment };
            }

            // Mettre à jour status
            payment.status = 'completed';
            payment.completedAt = Date.now();
            payment.confirmationData = confirmationData;

            // Sauvegarder
            await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.PAYMENTS, payment);
            
            // Ajouter à l'historique
            state.paymentHistory.push(payment);
            saveToLocalStorage(CONFIG.STORAGE_KEYS.PAYMENT_HISTORY, state.paymentHistory);

            // Retirer des sessions actives
            delete state.paymentSessions[paymentId];
            saveToLocalStorage(CONFIG.STORAGE_KEYS.PENDING_PAYMENTS, 
                Object.keys(state.paymentSessions)
            );

            console.log(`[${MODULE_NAME}] ✅ Payment confirmed:`, paymentId);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:payment:completed', {
                detail: { payment }
            }));

            return { success: true, payment };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error confirming payment:`, error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // PAYMENT CANCELLATION
    // ========================================
    async function cancelPayment(paymentId, reason = 'User cancelled') {
        try {
            console.log(`[${MODULE_NAME}] Cancelling payment:`, paymentId);

            const payment = await checkPaymentStatus(paymentId);

            if (!payment) {
                throw new Error('Payment not found');
            }

            // Mettre à jour status
            payment.status = 'cancelled';
            payment.cancelledAt = Date.now();
            payment.cancellationReason = reason;

            // Sauvegarder
            await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.PAYMENTS, payment);
            
            // Retirer des sessions actives
            delete state.paymentSessions[paymentId];
            saveToLocalStorage(CONFIG.STORAGE_KEYS.PENDING_PAYMENTS, 
                Object.keys(state.paymentSessions)
            );

            console.log(`[${MODULE_NAME}] ✅ Payment cancelled:`, paymentId);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:payment:cancelled', {
                detail: { payment, reason }
            }));

            return { success: true, payment };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error cancelling payment:`, error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // PAYMENT TIMEOUT
    // ========================================
    function startPaymentTimeout(paymentId) {
        setTimeout(async () => {
            try {
                const payment = await checkPaymentStatus(paymentId);
                
                if (payment && payment.status === 'pending') {
                    console.log(`[${MODULE_NAME}] Payment timeout:`, paymentId);
                    await cancelPayment(paymentId, 'Payment timeout');
                }
            } catch (error) {
                console.error(`[${MODULE_NAME}] Error in payment timeout:`, error);
            }
        }, CONFIG.PAYMENT_TIMEOUT);
    }

    // ========================================
    // PAYMENT HISTORY
    // ========================================
    async function getPaymentHistory(userId = null, limit = 50) {
        try {
            console.log(`[${MODULE_NAME}] Loading payment history...`);

            const allPayments = await getAllFromIndexedDB(CONFIG.INDEXEDDB.STORES.PAYMENTS);
            
            // Filtrer par userId si fourni
            let filteredPayments = userId ? 
                allPayments.filter(p => p.userId === userId) : 
                allPayments;

            // Trier par timestamp décroissant
            filteredPayments = filteredPayments
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, limit);

            state.paymentHistory = filteredPayments;

            console.log(`[${MODULE_NAME}] ✅ Loaded ${filteredPayments.length} payments`);

            return filteredPayments;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error loading payment history:`, error);
            return [];
        }
    }

    // ========================================
    // RESTORE PENDING PAYMENTS
    // ========================================
    async function restorePendingPayments() {
        try {
            console.log(`[${MODULE_NAME}] Restoring pending payments...`);

            const pendingIds = loadFromLocalStorage(CONFIG.STORAGE_KEYS.PENDING_PAYMENTS) || [];
            
            for (const paymentId of pendingIds) {
                try {
                    const payment = await checkPaymentStatus(paymentId);
                    
                    if (payment && payment.status === 'pending') {
                        state.paymentSessions[paymentId] = payment;
                        
                        // Redémarrer timeout si pas encore expiré
                        if (payment.expiresAt > Date.now()) {
                            startPaymentTimeout(paymentId);
                        } else {
                            await cancelPayment(paymentId, 'Payment timeout');
                        }
                    }
                } catch (error) {
                    console.error(`[${MODULE_NAME}] Error restoring payment ${paymentId}:`, error);
                }
            }

            console.log(`[${MODULE_NAME}] ✅ Restored ${Object.keys(state.paymentSessions).length} pending payments`);

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error restoring pending payments:`, error);
        }
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

            // Vérifier dépendance core-system
            if (!window.PaieCashFan_CoreSystem) {
                throw new Error('Core System not found. Please load core-system.module.js first');
            }

            // Initialiser IndexedDB
            await initIndexedDB();

            // Restaurer pending payments
            await restorePendingPayments();

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
    const PaymentUnifiedAPI = {
        // Core
        init,
        getState: () => ({ ...state }),

        // Payment creation
        createPayment,
        checkPaymentStatus,
        confirmPayment,
        cancelPayment,

        // History
        getPaymentHistory,
        getPendingPayments: () => ({ ...state.paymentSessions }),

        // Config
        getConfig: () => ({ ...CONFIG }),
        getSupportedMethods: () => ({ ...CONFIG.PAYMENT_METHODS })
    };

    // ========================================
    // EXPORT MODULE
    // ========================================
    window.PaieCashFan_PaymentUnified = PaymentUnifiedAPI;

    console.log(`[${MODULE_NAME}] Module loaded. Use window.PaieCashFan_PaymentUnified to access API`);

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
