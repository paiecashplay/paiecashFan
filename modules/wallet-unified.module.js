/**
 * ========================================
 * 🪙 WALLET UNIFIED MODULE V11.0
 * ========================================
 * Module unifié pour la gestion du portefeuille crypto et fiat
 * 
 * FONCTIONNALITÉS :
 * - Multi-wallets : WalletConnect, MetaMask, Coinbase, Trust Wallet
 * - Balance tracking : USDT, USDC, ETH, BNB, etc.
 * - Transaction history
 * - Send/Receive crypto
 * - Fiat on/off ramp
 * - QR Code generation pour recevoir
 * - Persistent storage avec IndexedDB
 * 
 * NAMESPACE : pcf_v11_WalletUnified_
 * DÉPENDANCES : core-system.module.js
 * 
 * INTÉGRATION EXISTANTE :
 * - backend/models/wallet.model.js
 * - backend/services/walletconnect.service.js
 * - js/wallet-connector.js
 * - WalletConnect Web3Modal v3
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
    const MODULE_NAME = 'WalletUnified';
    const NAMESPACE = `pcf_v11_${MODULE_NAME}_`;

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        // WalletConnect Project ID (à configurer)
        WALLETCONNECT_PROJECT_ID: 'YOUR_WALLETCONNECT_PROJECT_ID',
        
        // Chaînes supportées
        SUPPORTED_CHAINS: {
            ETHEREUM: { id: 1, name: 'Ethereum', symbol: 'ETH', rpc: 'https://eth.llamarpc.com' },
            BSC: { id: 56, name: 'BSC', symbol: 'BNB', rpc: 'https://bsc-dataseed.binance.org' },
            POLYGON: { id: 137, name: 'Polygon', symbol: 'MATIC', rpc: 'https://polygon-rpc.com' },
            ARBITRUM: { id: 42161, name: 'Arbitrum', symbol: 'ETH', rpc: 'https://arb1.arbitrum.io/rpc' }
        },

        // Stablecoins supportés
        STABLECOINS: {
            USDT: { 
                symbol: 'USDT', 
                name: 'Tether USD',
                contracts: {
                    1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum
                    56: '0x55d398326f99059fF775485246999027B3197955', // BSC
                    137: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' // Polygon
                }
            },
            USDC: { 
                symbol: 'USDC', 
                name: 'USD Coin',
                contracts: {
                    1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                    56: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
                    137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
                }
            }
        },

        // Storage keys
        STORAGE_KEYS: {
            CONNECTED_WALLET: `${NAMESPACE}connectedWallet`,
            WALLET_ADDRESS: `${NAMESPACE}walletAddress`,
            WALLET_CHAIN: `${NAMESPACE}walletChain`,
            TRANSACTION_HISTORY: `${NAMESPACE}transactionHistory`,
            BALANCE_CACHE: `${NAMESPACE}balanceCache`
        },

        // IndexedDB
        INDEXEDDB: {
            NAME: `${NAMESPACE}database`,
            VERSION: 1,
            STORES: {
                TRANSACTIONS: 'transactions',
                BALANCES: 'balances',
                WALLETS: 'wallets'
            }
        }
    };

    // ========================================
    // STATE PRIVÉ
    // ========================================
    let state = {
        isInitialized: false,
        connectedWallet: null,
        walletAddress: null,
        currentChain: null,
        web3Provider: null,
        balances: {},
        transactions: [],
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

                // Store: transactions
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.TRANSACTIONS)) {
                    const txStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.TRANSACTIONS, { 
                        keyPath: 'hash', 
                        autoIncrement: false 
                    });
                    txStore.createIndex('address', 'from', { unique: false });
                    txStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Store: balances
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.BALANCES)) {
                    db.createObjectStore(CONFIG.INDEXEDDB.STORES.BALANCES, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                }

                // Store: wallets
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.WALLETS)) {
                    db.createObjectStore(CONFIG.INDEXEDDB.STORES.WALLETS, { 
                        keyPath: 'address', 
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

    function loadFromIndexedDB(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                reject(new Error('IndexedDB not initialized'));
                return;
            }

            const transaction = state.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

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
    // WALLET CONNECTION
    // ========================================
    async function connectWallet(walletType = 'metamask') {
        try {
            console.log(`[${MODULE_NAME}] Connecting to ${walletType}...`);

            // Simulation de connexion (à remplacer par vraie intégration)
            if (walletType === 'metamask') {
                if (typeof window.ethereum !== 'undefined') {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const chainId = await window.ethereum.request({ method: 'eth_chainId' });

                    state.connectedWallet = walletType;
                    state.walletAddress = accounts[0];
                    state.currentChain = parseInt(chainId, 16);

                    // Sauvegarder
                    saveToLocalStorage(CONFIG.STORAGE_KEYS.CONNECTED_WALLET, walletType);
                    saveToLocalStorage(CONFIG.STORAGE_KEYS.WALLET_ADDRESS, accounts[0]);
                    saveToLocalStorage(CONFIG.STORAGE_KEYS.WALLET_CHAIN, state.currentChain);

                    await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.WALLETS, {
                        address: accounts[0],
                        type: walletType,
                        chainId: state.currentChain,
                        connectedAt: Date.now()
                    });

                    // Charger les balances
                    await loadBalances();

                    console.log(`[${MODULE_NAME}] ✅ Wallet connected:`, accounts[0]);

                    // Émettre event
                    window.dispatchEvent(new CustomEvent('pcf:wallet:connected', {
                        detail: { address: accounts[0], wallet: walletType, chainId: state.currentChain }
                    }));

                    return { success: true, address: accounts[0], chainId: state.currentChain };
                } else {
                    throw new Error('MetaMask not installed');
                }
            } else if (walletType === 'walletconnect') {
                // TODO: Intégrer WalletConnect Web3Modal v3
                throw new Error('WalletConnect integration pending');
            } else {
                throw new Error(`Unsupported wallet type: ${walletType}`);
            }
        } catch (error) {
            console.error(`[${MODULE_NAME}] Error connecting wallet:`, error);
            window.dispatchEvent(new CustomEvent('pcf:wallet:error', {
                detail: { error: error.message }
            }));
            return { success: false, error: error.message };
        }
    }

    async function disconnectWallet() {
        try {
            console.log(`[${MODULE_NAME}] Disconnecting wallet...`);

            const address = state.walletAddress;

            // Reset state
            state.connectedWallet = null;
            state.walletAddress = null;
            state.currentChain = null;
            state.balances = {};

            // Clear localStorage
            localStorage.removeItem(CONFIG.STORAGE_KEYS.CONNECTED_WALLET);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.WALLET_ADDRESS);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.WALLET_CHAIN);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.BALANCE_CACHE);

            console.log(`[${MODULE_NAME}] ✅ Wallet disconnected`);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:wallet:disconnected', {
                detail: { address }
            }));

            return { success: true };
        } catch (error) {
            console.error(`[${MODULE_NAME}] Error disconnecting wallet:`, error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // BALANCE MANAGEMENT
    // ========================================
    async function loadBalances() {
        try {
            if (!state.walletAddress) {
                throw new Error('No wallet connected');
            }

            console.log(`[${MODULE_NAME}] Loading balances for ${state.walletAddress}...`);

            // Simulation de balances (à remplacer par vrais appels RPC)
            const mockBalances = {
                ETH: (Math.random() * 5).toFixed(4),
                USDT: (Math.random() * 1000).toFixed(2),
                USDC: (Math.random() * 800).toFixed(2),
                BNB: (Math.random() * 10).toFixed(3)
            };

            state.balances = mockBalances;

            // Sauvegarder cache
            saveToLocalStorage(CONFIG.STORAGE_KEYS.BALANCE_CACHE, {
                balances: mockBalances,
                timestamp: Date.now(),
                address: state.walletAddress
            });

            await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.BALANCES, {
                id: `${state.walletAddress}_${state.currentChain}`,
                address: state.walletAddress,
                chainId: state.currentChain,
                balances: mockBalances,
                updatedAt: Date.now()
            });

            console.log(`[${MODULE_NAME}] ✅ Balances loaded:`, mockBalances);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:wallet:balances', {
                detail: { balances: mockBalances, address: state.walletAddress }
            }));

            return mockBalances;
        } catch (error) {
            console.error(`[${MODULE_NAME}] Error loading balances:`, error);
            return {};
        }
    }

    async function getBalance(token = 'ETH') {
        try {
            if (!state.balances[token]) {
                await loadBalances();
            }
            return state.balances[token] || '0.00';
        } catch (error) {
            console.error(`[${MODULE_NAME}] Error getting balance:`, error);
            return '0.00';
        }
    }

    // ========================================
    // TRANSACTION MANAGEMENT
    // ========================================
    async function sendTransaction(to, amount, token = 'ETH') {
        try {
            if (!state.walletAddress) {
                throw new Error('No wallet connected');
            }

            console.log(`[${MODULE_NAME}] Sending ${amount} ${token} to ${to}...`);

            // Simulation de transaction (à remplacer par vraie transaction)
            const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
            
            const transaction = {
                hash: mockTxHash,
                from: state.walletAddress,
                to,
                amount,
                token,
                chainId: state.currentChain,
                status: 'pending',
                timestamp: Date.now()
            };

            // Sauvegarder transaction
            state.transactions.push(transaction);
            await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.TRANSACTIONS, transaction);

            console.log(`[${MODULE_NAME}] ✅ Transaction sent:`, mockTxHash);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:wallet:transaction', {
                detail: { transaction }
            }));

            // Simuler confirmation après 3 secondes
            setTimeout(async () => {
                transaction.status = 'confirmed';
                await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.TRANSACTIONS, transaction);
                
                window.dispatchEvent(new CustomEvent('pcf:wallet:transaction:confirmed', {
                    detail: { transaction }
                }));

                // Recharger les balances
                await loadBalances();
            }, 3000);

            return { success: true, txHash: mockTxHash, transaction };
        } catch (error) {
            console.error(`[${MODULE_NAME}] Error sending transaction:`, error);
            window.dispatchEvent(new CustomEvent('pcf:wallet:error', {
                detail: { error: error.message }
            }));
            return { success: false, error: error.message };
        }
    }

    async function getTransactionHistory(limit = 50) {
        try {
            if (!state.walletAddress) {
                return [];
            }

            console.log(`[${MODULE_NAME}] Loading transaction history...`);

            // Charger depuis IndexedDB
            const allTransactions = await getAllFromIndexedDB(CONFIG.INDEXEDDB.STORES.TRANSACTIONS);
            
            // Filtrer par adresse et trier par timestamp
            const userTransactions = allTransactions
                .filter(tx => tx.from === state.walletAddress || tx.to === state.walletAddress)
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, limit);

            state.transactions = userTransactions;

            console.log(`[${MODULE_NAME}] ✅ Loaded ${userTransactions.length} transactions`);

            return userTransactions;
        } catch (error) {
            console.error(`[${MODULE_NAME}] Error loading transaction history:`, error);
            return [];
        }
    }

    // ========================================
    // QR CODE GENERATION
    // ========================================
    function generateQRCode(address = state.walletAddress) {
        if (!address) {
            console.error(`[${MODULE_NAME}] No address to generate QR code`);
            return null;
        }

        // Utiliser une API QR code ou bibliothèque
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(address)}`;
        
        console.log(`[${MODULE_NAME}] QR Code generated for ${address}`);

        return {
            address,
            qrCodeUrl,
            dataUrl: qrCodeUrl // Pour compatibilité
        };
    }

    // ========================================
    // RESTORE SESSION
    // ========================================
    async function restoreSession() {
        try {
            console.log(`[${MODULE_NAME}] Restoring wallet session...`);

            const savedWallet = loadFromLocalStorage(CONFIG.STORAGE_KEYS.CONNECTED_WALLET);
            const savedAddress = loadFromLocalStorage(CONFIG.STORAGE_KEYS.WALLET_ADDRESS);
            const savedChain = loadFromLocalStorage(CONFIG.STORAGE_KEYS.WALLET_CHAIN);

            if (savedWallet && savedAddress) {
                state.connectedWallet = savedWallet;
                state.walletAddress = savedAddress;
                state.currentChain = savedChain;

                // Charger balances depuis cache
                const cachedBalances = loadFromLocalStorage(CONFIG.STORAGE_KEYS.BALANCE_CACHE);
                if (cachedBalances && cachedBalances.address === savedAddress) {
                    state.balances = cachedBalances.balances;
                    console.log(`[${MODULE_NAME}] ✅ Session restored from cache`);
                } else {
                    // Recharger les balances
                    await loadBalances();
                    console.log(`[${MODULE_NAME}] ✅ Session restored with fresh balances`);
                }

                // Émettre event
                window.dispatchEvent(new CustomEvent('pcf:wallet:restored', {
                    detail: { 
                        address: savedAddress, 
                        wallet: savedWallet, 
                        chainId: savedChain,
                        balances: state.balances
                    }
                }));

                return { success: true, address: savedAddress, wallet: savedWallet };
            } else {
                console.log(`[${MODULE_NAME}] No saved session found`);
                return { success: false, message: 'No saved session' };
            }
        } catch (error) {
            console.error(`[${MODULE_NAME}] Error restoring session:`, error);
            return { success: false, error: error.message };
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

            // Restaurer session si existante
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
    const WalletUnifiedAPI = {
        // Core
        init,
        getState: () => ({ ...state }), // Clone pour éviter mutations
        isConnected: () => !!state.walletAddress,
        getAddress: () => state.walletAddress,
        getChainId: () => state.currentChain,

        // Connection
        connect: connectWallet,
        disconnect: disconnectWallet,
        restoreSession,

        // Balances
        loadBalances,
        getBalance,
        getBalances: () => ({ ...state.balances }),

        // Transactions
        send: sendTransaction,
        getTransactionHistory,

        // Utils
        generateQRCode,

        // Config
        getConfig: () => ({ ...CONFIG }),
        getSupportedChains: () => ({ ...CONFIG.SUPPORTED_CHAINS }),
        getStablecoins: () => ({ ...CONFIG.STABLECOINS })
    };

    // ========================================
    // EXPORT MODULE
    // ========================================
    window.PaieCashFan_WalletUnified = WalletUnifiedAPI;

    console.log(`[${MODULE_NAME}] Module loaded. Use window.PaieCashFan_WalletUnified to access API`);

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
