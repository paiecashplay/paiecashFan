/**
 * ========================================
 * 🤖 AI SUPPORT MODULE V11.0
 * ========================================
 * Module Agent IA pour support client intelligent
 * 
 * FONCTIONNALITÉS :
 * - Chat intelligent 24/7
 * - Réponses contextuelles sur commandes, clubs, paiements
 * - Support multilingue (FR, EN, ES, AR, etc.)
 * - Intégration avec tous les modules
 * - Historique des conversations
 * - FAQ dynamique
 * - Escalade vers humain si nécessaire
 * - Suggestions proactives
 * - Persistent storage avec IndexedDB
 * 
 * NAMESPACE : pcf_v11_AISupport_
 * DÉPENDANCES : core-system.module.js
 * 
 * INTÉGRATION EXISTANTE :
 * - js/ai-agent.js
 * - backend/services/ai-agent.service.js
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
    const MODULE_NAME = 'AISupport';
    const NAMESPACE = `pcf_v11_${MODULE_NAME}_`;

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        // AI API (à configurer selon votre backend)
        API: {
            BASE_URL: '/api/ai',
            CHAT: '/chat',
            FAQ: '/faq',
            SUGGEST: '/suggest',
            TRANSLATE: '/translate'
        },

        // Langues supportées
        LANGUAGES: {
            fr: 'Français',
            en: 'English',
            es: 'Español',
            ar: 'العربية',
            pt: 'Português',
            it: 'Italiano',
            de: 'Deutsch',
            tr: 'Türkçe'
        },

        // Langue par défaut
        DEFAULT_LANGUAGE: 'fr',

        // Contextes d'assistance
        CONTEXTS: {
            ORDER: 'order',
            PAYMENT: 'payment',
            WALLET: 'wallet',
            CLUB: 'club',
            VIDEO: 'video',
            ACCOUNT: 'account',
            GENERAL: 'general'
        },

        // Templates de réponses rapides
        QUICK_REPLIES: {
            fr: [
                'Suivre ma commande',
                'Problème de paiement',
                'Connecter mon wallet',
                'Contacter un club',
                'Supprimer mon compte',
                'Autre question'
            ],
            en: [
                'Track my order',
                'Payment issue',
                'Connect my wallet',
                'Contact a club',
                'Delete my account',
                'Other question'
            ]
        },

        // Storage keys
        STORAGE_KEYS: {
            CHAT_HISTORY: `${NAMESPACE}chatHistory`,
            LANGUAGE: `${NAMESPACE}language`,
            FAQ_CACHE: `${NAMESPACE}faqCache`,
            SUGGESTIONS: `${NAMESPACE}suggestions`
        },

        // IndexedDB
        INDEXEDDB: {
            NAME: `${NAMESPACE}database`,
            VERSION: 1,
            STORES: {
                CONVERSATIONS: 'conversations',
                MESSAGES: 'messages',
                FAQ: 'faq',
                SUGGESTIONS: 'suggestions'
            }
        },

        // Chat settings
        CHAT: {
            MAX_MESSAGES: 100,
            TYPING_DELAY: 1000, // Simulation délai de frappe
            AUTO_SUGGEST: true,
            PROACTIVE_HELP: true
        }
    };

    // ========================================
    // STATE PRIVÉ
    // ========================================
    let state = {
        isInitialized: false,
        currentLanguage: CONFIG.DEFAULT_LANGUAGE,
        currentConversation: null,
        chatHistory: [],
        faqCache: {},
        suggestions: [],
        isTyping: false,
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

                // Store: conversations
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.CONVERSATIONS)) {
                    const convStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.CONVERSATIONS, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    convStore.createIndex('userId', 'userId', { unique: false });
                    convStore.createIndex('timestamp', 'createdAt', { unique: false });
                }

                // Store: messages
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.MESSAGES)) {
                    const msgStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.MESSAGES, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    msgStore.createIndex('conversationId', 'conversationId', { unique: false });
                    msgStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Store: faq
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.FAQ)) {
                    const faqStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.FAQ, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    faqStore.createIndex('language', 'language', { unique: false });
                    faqStore.createIndex('category', 'category', { unique: false });
                }

                // Store: suggestions
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.SUGGESTIONS)) {
                    db.createObjectStore(CONFIG.INDEXEDDB.STORES.SUGGESTIONS, { 
                        keyPath: 'id', 
                        autoIncrement: false 
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
    // API HELPERS
    // ========================================
    async function apiRequest(endpoint, options = {}) {
        try {
            const { method = 'POST', data = null } = options;

            const url = `${CONFIG.API.BASE_URL}${endpoint}`;

            const headers = {
                'Content-Type': 'application/json',
                'Accept-Language': state.currentLanguage
            };

            // Ajouter token auth si disponible
            if (window.PaieCashFan_AuthPersistent) {
                const authState = window.PaieCashFan_AuthPersistent.getState();
                if (authState.token) {
                    headers['Authorization'] = `Bearer ${authState.token}`;
                }
            }

            const fetchOptions = {
                method,
                headers
            };

            if (data) {
                fetchOptions.body = JSON.stringify(data);
            }

            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            return { success: true, data: result };

        } catch (error) {
            console.error(`[${MODULE_NAME}] API error:`, error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // CONVERSATION MANAGEMENT
    // ========================================
    function startConversation(context = CONFIG.CONTEXTS.GENERAL) {
        const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        state.currentConversation = {
            id: conversationId,
            userId: window.PaieCashFan_AuthPersistent?.getState().user?.id || 'guest',
            context,
            language: state.currentLanguage,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        saveToIndexedDB(CONFIG.INDEXEDDB.STORES.CONVERSATIONS, state.currentConversation);

        console.log(`[${MODULE_NAME}] Conversation started:`, conversationId);

        // Message de bienvenue
        const welcomeMessage = getWelcomeMessage();
        addMessage('assistant', welcomeMessage);

        return state.currentConversation;
    }

    function getWelcomeMessage() {
        const messages = {
            fr: '👋 Bonjour ! Je suis votre assistant PaieCashFan. Comment puis-je vous aider aujourd\'hui ?',
            en: '👋 Hello! I\'m your PaieCashFan assistant. How can I help you today?',
            es: '👋 ¡Hola! Soy tu asistente PaieCashFan. ¿Cómo puedo ayudarte hoy?',
            ar: '👋 مرحبا! أنا مساعد PaieCashFan الخاص بك. كيف يمكنني مساعدتك اليوم؟'
        };

        return messages[state.currentLanguage] || messages.fr;
    }

    function addMessage(role, content, metadata = {}) {
        if (!state.currentConversation) {
            startConversation();
        }

        const message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            conversationId: state.currentConversation.id,
            role, // 'user' ou 'assistant'
            content,
            metadata,
            timestamp: Date.now()
        };

        state.currentConversation.messages.push(message);
        state.currentConversation.updatedAt = Date.now();
        state.chatHistory.push(message);

        // Sauvegarder
        saveToIndexedDB(CONFIG.INDEXEDDB.STORES.MESSAGES, message);
        saveToIndexedDB(CONFIG.INDEXEDDB.STORES.CONVERSATIONS, state.currentConversation);
        saveToLocalStorage(CONFIG.STORAGE_KEYS.CHAT_HISTORY, 
            state.chatHistory.slice(-CONFIG.CHAT.MAX_MESSAGES)
        );

        // Émettre event
        window.dispatchEvent(new CustomEvent('pcf:ai:message', {
            detail: { message, conversation: state.currentConversation }
        }));

        return message;
    }

    // ========================================
    // CHAT FUNCTIONS
    // ========================================
    async function sendMessage(userMessage, context = null) {
        try {
            console.log(`[${MODULE_NAME}] User message:`, userMessage);

            // Ajouter message utilisateur
            addMessage('user', userMessage);

            // Démarrer typing indicator
            state.isTyping = true;
            window.dispatchEvent(new CustomEvent('pcf:ai:typing', { detail: { isTyping: true } }));

            // Délai simulé
            await new Promise(resolve => setTimeout(resolve, CONFIG.CHAT.TYPING_DELAY));

            // Obtenir contexte des modules si disponibles
            const moduleContext = gatherModuleContext(context);

            // Appeler AI API
            const result = await apiRequest(CONFIG.API.CHAT, {
                data: {
                    message: userMessage,
                    conversationId: state.currentConversation?.id,
                    context: moduleContext,
                    language: state.currentLanguage
                }
            });

            state.isTyping = false;
            window.dispatchEvent(new CustomEvent('pcf:ai:typing', { detail: { isTyping: false } }));

            let response;
            if (result.success) {
                response = result.data.response;
            } else {
                // Réponse fallback si API échoue
                response = getFallbackResponse(userMessage);
            }

            // Ajouter réponse assistant
            addMessage('assistant', response, {
                confidence: result.data?.confidence || 0.8,
                suggestedActions: result.data?.actions || []
            });

            // Auto-suggestions
            if (CONFIG.CHAT.AUTO_SUGGEST) {
                generateSuggestions(userMessage, response);
            }

            return { success: true, response };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error sending message:`, error);
            state.isTyping = false;
            window.dispatchEvent(new CustomEvent('pcf:ai:typing', { detail: { isTyping: false } }));
            return { success: false, error: error.message };
        }
    }

    function gatherModuleContext(specificContext = null) {
        const context = {
            timestamp: Date.now(),
            language: state.currentLanguage,
            modules: {}
        };

        // Auth context
        if (window.PaieCashFan_AuthPersistent) {
            const authState = window.PaieCashFan_AuthPersistent.getState();
            context.modules.auth = {
                isAuthenticated: authState.isAuthenticated,
                userId: authState.user?.id
            };
        }

        // Wallet context
        if (window.PaieCashFan_WalletUnified) {
            const walletState = window.PaieCashFan_WalletUnified.getState();
            context.modules.wallet = {
                isConnected: walletState.walletAddress !== null,
                address: walletState.walletAddress,
                balances: walletState.balances
            };
        }

        // Payment context
        if (window.PaieCashFan_PaymentUnified) {
            const paymentState = window.PaieCashFan_PaymentUnified.getState();
            context.modules.payment = {
                pendingPayments: Object.keys(paymentState.paymentSessions || {}).length,
                lastPayment: paymentState.paymentHistory?.[0] || null
            };
        }

        // Shop context
        if (window.PaieCashFan_ShopUnified) {
            const shopState = window.PaieCashFan_ShopUnified.getState();
            context.modules.shop = {
                cartItemCount: shopState.cart?.items?.length || 0,
                cartTotal: shopState.cart?.total || 0
            };
        }

        // Navigation context
        if (window.PaieCashFan_NavigationHierarchy) {
            const navState = window.PaieCashFan_NavigationHierarchy.getState();
            context.modules.navigation = {
                currentView: navState.currentView,
                selectedSport: navState.filters?.sport
            };
        }

        // Specific context override
        if (specificContext) {
            context.specificContext = specificContext;
        }

        return context;
    }

    function getFallbackResponse(userMessage) {
        const responses = {
            fr: {
                order: 'Pour suivre votre commande, rendez-vous dans "Mes Commandes" ou contactez-nous.',
                payment: 'Pour les problèmes de paiement, vérifiez votre wallet ou contactez notre support.',
                wallet: 'Pour connecter votre wallet, cliquez sur "Connecter Wallet" en haut à droite.',
                default: 'Je n\'ai pas bien compris. Pouvez-vous reformuler votre question ?'
            },
            en: {
                order: 'To track your order, go to "My Orders" or contact us.',
                payment: 'For payment issues, check your wallet or contact our support.',
                wallet: 'To connect your wallet, click "Connect Wallet" in the top right.',
                default: 'I didn\'t understand. Can you rephrase your question?'
            }
        };

        const langResponses = responses[state.currentLanguage] || responses.fr;

        // Détection simple de contexte
        if (/commande|order|pedido/i.test(userMessage)) {
            return langResponses.order;
        } else if (/paiement|payment|pago/i.test(userMessage)) {
            return langResponses.payment;
        } else if (/wallet|portefeuille/i.test(userMessage)) {
            return langResponses.wallet;
        } else {
            return langResponses.default;
        }
    }

    function generateSuggestions(userMessage, aiResponse) {
        // Suggestions basées sur le contexte
        const suggestions = [];

        if (/commande|order/i.test(userMessage)) {
            suggestions.push({
                text: state.currentLanguage === 'fr' ? 'Voir mes commandes' : 'View my orders',
                action: 'navigate:/orders'
            });
        }

        if (/wallet|crypto/i.test(userMessage)) {
            suggestions.push({
                text: state.currentLanguage === 'fr' ? 'Connecter mon wallet' : 'Connect my wallet',
                action: 'wallet:connect'
            });
        }

        if (/club|équipe|team/i.test(userMessage)) {
            suggestions.push({
                text: state.currentLanguage === 'fr' ? 'Explorer les clubs' : 'Explore clubs',
                action: 'navigate:/clubs'
            });
        }

        state.suggestions = suggestions;
        saveToLocalStorage(CONFIG.STORAGE_KEYS.SUGGESTIONS, suggestions);

        if (suggestions.length > 0) {
            window.dispatchEvent(new CustomEvent('pcf:ai:suggestions', {
                detail: { suggestions }
            }));
        }
    }

    // ========================================
    // FAQ
    // ========================================
    async function loadFAQ(category = null) {
        try {
            console.log(`[${MODULE_NAME}] Loading FAQ...`);

            const result = await apiRequest(CONFIG.API.FAQ, {
                method: 'GET',
                data: { category, language: state.currentLanguage }
            });

            if (result.success) {
                state.faqCache = result.data;

                for (const faqItem of result.data) {
                    await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.FAQ, faqItem);
                }

                console.log(`[${MODULE_NAME}] ✅ FAQ loaded: ${result.data.length} items`);

                window.dispatchEvent(new CustomEvent('pcf:ai:faq:loaded', {
                    detail: { faq: result.data }
                }));
            }

            return result;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error loading FAQ:`, error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // LANGUAGE MANAGEMENT
    // ========================================
    function setLanguage(language) {
        if (!CONFIG.LANGUAGES[language]) {
            console.error(`[${MODULE_NAME}] Unsupported language:`, language);
            return false;
        }

        state.currentLanguage = language;
        saveToLocalStorage(CONFIG.STORAGE_KEYS.LANGUAGE, language);

        console.log(`[${MODULE_NAME}] Language set to:`, language);

        window.dispatchEvent(new CustomEvent('pcf:ai:language:changed', {
            detail: { language }
        }));

        return true;
    }

    function getLanguage() {
        return state.currentLanguage;
    }

    function getSupportedLanguages() {
        return { ...CONFIG.LANGUAGES };
    }

    // ========================================
    // PROACTIVE HELP
    // ========================================
    function triggerProactiveHelp(trigger) {
        if (!CONFIG.CHAT.PROACTIVE_HELP) {
            return;
        }

        const messages = {
            cart_abandoned: {
                fr: '🛒 Vous avez des articles dans votre panier. Besoin d\'aide pour finaliser votre commande ?',
                en: '🛒 You have items in your cart. Need help completing your order?'
            },
            payment_failed: {
                fr: '❌ Votre paiement a échoué. Je peux vous aider à résoudre ce problème.',
                en: '❌ Your payment failed. I can help you resolve this issue.'
            },
            first_visit: {
                fr: '👋 Bienvenue sur PaieCashFan ! Voulez-vous une visite guidée ?',
                en: '👋 Welcome to PaieCashFan! Would you like a guided tour?'
            }
        };

        const message = messages[trigger]?.[state.currentLanguage];
        if (message) {
            console.log(`[${MODULE_NAME}] Proactive help triggered:`, trigger);

            window.dispatchEvent(new CustomEvent('pcf:ai:proactive:help', {
                detail: { trigger, message }
            }));
        }
    }

    // ========================================
    // RESTORE SESSION
    // ========================================
    async function restoreSession() {
        try {
            console.log(`[${MODULE_NAME}] Restoring AI session...`);

            // Restaurer langue
            const savedLanguage = loadFromLocalStorage(CONFIG.STORAGE_KEYS.LANGUAGE);
            if (savedLanguage) {
                state.currentLanguage = savedLanguage;
            }

            // Restaurer historique
            const savedHistory = loadFromLocalStorage(CONFIG.STORAGE_KEYS.CHAT_HISTORY);
            if (savedHistory) {
                state.chatHistory = savedHistory;
            }

            // Restaurer dernière conversation
            const conversations = await getAllFromIndexedDB(CONFIG.INDEXEDDB.STORES.CONVERSATIONS);
            if (conversations && conversations.length > 0) {
                state.currentConversation = conversations[conversations.length - 1];
            }

            console.log(`[${MODULE_NAME}] ✅ Session restored`);

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error restoring session:`, error);
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

            // Restaurer session
            await restoreSession();

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
    const AISupportAPI = {
        // Core
        init,
        getState: () => ({ ...state }),

        // Conversation
        startConversation,
        sendMessage,
        getChatHistory: () => [...state.chatHistory],
        getCurrentConversation: () => state.currentConversation,

        // FAQ
        loadFAQ,
        getFAQ: () => state.faqCache,

        // Language
        setLanguage,
        getLanguage,
        getSupportedLanguages,

        // Proactive
        triggerProactiveHelp,

        // Utils
        isTyping: () => state.isTyping,
        getSuggestions: () => [...state.suggestions],

        // Config
        getConfig: () => ({ ...CONFIG })
    };

    // ========================================
    // EXPORT MODULE
    // ========================================
    window.PaieCashFan_AISupport = AISupportAPI;

    console.log(`[${MODULE_NAME}] Module loaded. Use window.PaieCashFan_AISupport to access API`);

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
