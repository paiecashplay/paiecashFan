/**
 * ========================================
 * 🛒 SHOP UNIFIED MODULE V11.0
 * ========================================
 * Module unifié pour l'intégration WooCommerce
 * 
 * FONCTIONNALITÉS :
 * - WooCommerce REST API integration
 * - Product catalog management
 * - Cart management
 * - Checkout flow
 * - Order tracking
 * - Product search & filters
 * - Categories & tags
 * - Stock management
 * - Promotions & coupons
 * - Persistent cart avec IndexedDB
 * 
 * NAMESPACE : pcf_v11_ShopUnified_
 * DÉPENDANCES : core-system.module.js, payment-unified.module.js
 * 
 * INTÉGRATION EXISTANTE :
 * - woocommerce-integration.js
 * - js/woocommerce-connector.js
 * - js/agentic-commerce.js
 * - 🏆_PRODUITS_PHARES_CLUBS.js
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
    const MODULE_NAME = 'ShopUnified';
    const NAMESPACE = `pcf_v11_${MODULE_NAME}_`;

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        // WooCommerce API
        WOOCOMMERCE: {
            STORE_URL: '', // À configurer : https://votre-boutique.com
            CONSUMER_KEY: '', // À configurer
            CONSUMER_SECRET: '', // À configurer
            API_VERSION: 'wc/v3',
            TIMEOUT: 30000
        },

        // Endpoints
        ENDPOINTS: {
            PRODUCTS: '/products',
            PRODUCT: '/products/{id}',
            CATEGORIES: '/products/categories',
            CART: '/cart',
            ORDERS: '/orders',
            ORDER: '/orders/{id}',
            COUPONS: '/coupons',
            CUSTOMER: '/customers/{id}'
        },

        // Pagination
        PAGINATION: {
            PER_PAGE: 20,
            MAX_PER_PAGE: 100
        },

        // Storage keys
        STORAGE_KEYS: {
            CART: `${NAMESPACE}cart`,
            CART_ITEMS: `${NAMESPACE}cartItems`,
            FAVORITES: `${NAMESPACE}favorites`,
            ORDER_HISTORY: `${NAMESPACE}orderHistory`,
            PRODUCT_CACHE: `${NAMESPACE}productCache`
        },

        // IndexedDB
        INDEXEDDB: {
            NAME: `${NAMESPACE}database`,
            VERSION: 1,
            STORES: {
                PRODUCTS: 'products',
                CART: 'cart',
                ORDERS: 'orders',
                FAVORITES: 'favorites'
            }
        },

        // Cache TTL (1 heure)
        CACHE_TTL: 60 * 60 * 1000
    };

    // ========================================
    // STATE PRIVÉ
    // ========================================
    let state = {
        isInitialized: false,
        cart: {
            items: [],
            total: 0,
            subtotal: 0,
            tax: 0,
            shipping: 0,
            discount: 0
        },
        favorites: [],
        orderHistory: [],
        productCache: {},
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

                // Store: products
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.PRODUCTS)) {
                    const productStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.PRODUCTS, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    productStore.createIndex('slug', 'slug', { unique: true });
                    productStore.createIndex('category', 'category_id', { unique: false });
                }

                // Store: cart
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.CART)) {
                    db.createObjectStore(CONFIG.INDEXEDDB.STORES.CART, { 
                        keyPath: 'productId', 
                        autoIncrement: false 
                    });
                }

                // Store: orders
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.ORDERS)) {
                    const orderStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.ORDERS, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    orderStore.createIndex('status', 'status', { unique: false });
                    orderStore.createIndex('date', 'date_created', { unique: false });
                }

                // Store: favorites
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.FAVORITES)) {
                    db.createObjectStore(CONFIG.INDEXEDDB.STORES.FAVORITES, { 
                        keyPath: 'productId', 
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

    function deleteFromIndexedDB(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                reject(new Error('IndexedDB not initialized'));
                return;
            }

            const transaction = state.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // ========================================
    // WOOCOMMERCE API HELPERS
    // ========================================
    function buildWooCommerceUrl(endpoint, params = {}) {
        const url = new URL(`${CONFIG.WOOCOMMERCE.STORE_URL}/wp-json/${CONFIG.WOOCOMMERCE.API_VERSION}${endpoint}`);
        
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        return url.toString();
    }

    async function wooCommerceRequest(endpoint, options = {}) {
        try {
            const { method = 'GET', data = null, params = {} } = options;

            const url = buildWooCommerceUrl(endpoint, params);

            const headers = {
                'Content-Type': 'application/json'
            };

            // Basic Auth (à remplacer par OAuth en production)
            if (CONFIG.WOOCOMMERCE.CONSUMER_KEY && CONFIG.WOOCOMMERCE.CONSUMER_SECRET) {
                const auth = btoa(`${CONFIG.WOOCOMMERCE.CONSUMER_KEY}:${CONFIG.WOOCOMMERCE.CONSUMER_SECRET}`);
                headers['Authorization'] = `Basic ${auth}`;
            }

            const fetchOptions = {
                method,
                headers,
                timeout: CONFIG.WOOCOMMERCE.TIMEOUT
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                fetchOptions.body = JSON.stringify(data);
            }

            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            return { success: true, data: result };

        } catch (error) {
            console.error(`[${MODULE_NAME}] WooCommerce API error:`, error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // PRODUCTS
    // ========================================
    async function getProducts(options = {}) {
        try {
            const {
                page = 1,
                per_page = CONFIG.PAGINATION.PER_PAGE,
                category = null,
                search = '',
                orderby = 'date',
                order = 'desc',
                on_sale = null,
                featured = null
            } = options;

            console.log(`[${MODULE_NAME}] Fetching products...`, options);

            const params = {
                page,
                per_page: Math.min(per_page, CONFIG.PAGINATION.MAX_PER_PAGE),
                orderby,
                order
            };

            if (category) params.category = category;
            if (search) params.search = search;
            if (on_sale !== null) params.on_sale = on_sale;
            if (featured !== null) params.featured = featured;

            const result = await wooCommerceRequest(CONFIG.ENDPOINTS.PRODUCTS, { params });

            if (result.success) {
                // Mettre en cache
                result.data.forEach(product => {
                    state.productCache[product.id] = {
                        ...product,
                        cachedAt: Date.now()
                    };
                    saveToIndexedDB(CONFIG.INDEXEDDB.STORES.PRODUCTS, product);
                });

                console.log(`[${MODULE_NAME}] ✅ Fetched ${result.data.length} products`);
            }

            return result;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error fetching products:`, error);
            return { success: false, error: error.message };
        }
    }

    async function getProduct(productId) {
        try {
            console.log(`[${MODULE_NAME}] Fetching product ${productId}...`);

            // Check cache first
            const cached = state.productCache[productId];
            if (cached && (Date.now() - cached.cachedAt < CONFIG.CACHE_TTL)) {
                console.log(`[${MODULE_NAME}] ✅ Product from cache`);
                return { success: true, data: cached };
            }

            // Fetch from API
            const endpoint = CONFIG.ENDPOINTS.PRODUCT.replace('{id}', productId);
            const result = await wooCommerceRequest(endpoint);

            if (result.success) {
                // Update cache
                state.productCache[productId] = {
                    ...result.data,
                    cachedAt: Date.now()
                };
                await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.PRODUCTS, result.data);

                console.log(`[${MODULE_NAME}] ✅ Fetched product ${productId}`);
            }

            return result;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error fetching product:`, error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // CART MANAGEMENT
    // ========================================
    async function addToCart(productId, quantity = 1, variation = null) {
        try {
            console.log(`[${MODULE_NAME}] Adding to cart:`, productId, quantity);

            // Fetch product details
            const productResult = await getProduct(productId);
            if (!productResult.success) {
                throw new Error('Product not found');
            }

            const product = productResult.data;

            // Check stock
            if (!product.in_stock) {
                throw new Error('Product out of stock');
            }

            if (product.manage_stock && product.stock_quantity < quantity) {
                throw new Error(`Only ${product.stock_quantity} items available`);
            }

            // Check if already in cart
            const existingItem = state.cart.items.find(item => 
                item.productId === productId && 
                JSON.stringify(item.variation) === JSON.stringify(variation)
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.cart.items.push({
                    productId,
                    product,
                    quantity,
                    variation,
                    price: parseFloat(product.price),
                    total: parseFloat(product.price) * quantity
                });
            }

            // Recalculate cart totals
            calculateCartTotals();

            // Save cart
            await saveCart();

            console.log(`[${MODULE_NAME}] ✅ Added to cart:`, productId);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:cart:updated', {
                detail: { cart: state.cart }
            }));

            return { success: true, cart: state.cart };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error adding to cart:`, error);
            window.dispatchEvent(new CustomEvent('pcf:cart:error', {
                detail: { error: error.message }
            }));
            return { success: false, error: error.message };
        }
    }

    async function removeFromCart(productId, variation = null) {
        try {
            console.log(`[${MODULE_NAME}] Removing from cart:`, productId);

            state.cart.items = state.cart.items.filter(item => 
                !(item.productId === productId && 
                  JSON.stringify(item.variation) === JSON.stringify(variation))
            );

            // Recalculate cart totals
            calculateCartTotals();

            // Save cart
            await saveCart();

            console.log(`[${MODULE_NAME}] ✅ Removed from cart:`, productId);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:cart:updated', {
                detail: { cart: state.cart }
            }));

            return { success: true, cart: state.cart };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error removing from cart:`, error);
            return { success: false, error: error.message };
        }
    }

    async function updateCartItem(productId, quantity, variation = null) {
        try {
            console.log(`[${MODULE_NAME}] Updating cart item:`, productId, quantity);

            if (quantity <= 0) {
                return await removeFromCart(productId, variation);
            }

            const item = state.cart.items.find(item => 
                item.productId === productId && 
                JSON.stringify(item.variation) === JSON.stringify(variation)
            );

            if (!item) {
                throw new Error('Item not found in cart');
            }

            // Check stock
            if (item.product.manage_stock && item.product.stock_quantity < quantity) {
                throw new Error(`Only ${item.product.stock_quantity} items available`);
            }

            item.quantity = quantity;
            item.total = item.price * quantity;

            // Recalculate cart totals
            calculateCartTotals();

            // Save cart
            await saveCart();

            console.log(`[${MODULE_NAME}] ✅ Updated cart item:`, productId);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:cart:updated', {
                detail: { cart: state.cart }
            }));

            return { success: true, cart: state.cart };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error updating cart item:`, error);
            return { success: false, error: error.message };
        }
    }

    async function clearCart() {
        try {
            console.log(`[${MODULE_NAME}] Clearing cart...`);

            state.cart = {
                items: [],
                total: 0,
                subtotal: 0,
                tax: 0,
                shipping: 0,
                discount: 0
            };

            // Clear from IndexedDB
            const transaction = state.db.transaction([CONFIG.INDEXEDDB.STORES.CART], 'readwrite');
            const store = transaction.objectStore(CONFIG.INDEXEDDB.STORES.CART);
            store.clear();

            // Clear from localStorage
            localStorage.removeItem(CONFIG.STORAGE_KEYS.CART);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.CART_ITEMS);

            console.log(`[${MODULE_NAME}] ✅ Cart cleared`);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:cart:cleared', {
                detail: {}
            }));

            return { success: true };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error clearing cart:`, error);
            return { success: false, error: error.message };
        }
    }

    function calculateCartTotals() {
        state.cart.subtotal = state.cart.items.reduce((sum, item) => sum + item.total, 0);
        state.cart.tax = state.cart.subtotal * 0.2; // 20% TVA (à adapter)
        state.cart.total = state.cart.subtotal + state.cart.tax + state.cart.shipping - state.cart.discount;
    }

    async function saveCart() {
        try {
            // Save to localStorage
            saveToLocalStorage(CONFIG.STORAGE_KEYS.CART, state.cart);
            saveToLocalStorage(CONFIG.STORAGE_KEYS.CART_ITEMS, state.cart.items);

            // Save to IndexedDB
            for (const item of state.cart.items) {
                await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.CART, item);
            }

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error saving cart:`, error);
        }
    }

    async function restoreCart() {
        try {
            console.log(`[${MODULE_NAME}] Restoring cart...`);

            // Try localStorage first
            const savedCart = loadFromLocalStorage(CONFIG.STORAGE_KEYS.CART);
            if (savedCart) {
                state.cart = savedCart;
                console.log(`[${MODULE_NAME}] ✅ Cart restored from localStorage`);
                return;
            }

            // Try IndexedDB
            const cartItems = await getAllFromIndexedDB(CONFIG.INDEXEDDB.STORES.CART);
            if (cartItems && cartItems.length > 0) {
                state.cart.items = cartItems;
                calculateCartTotals();
                await saveCart();
                console.log(`[${MODULE_NAME}] ✅ Cart restored from IndexedDB`);
            }

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error restoring cart:`, error);
        }
    }

    function getCart() {
        return { ...state.cart };
    }

    function getCartItemCount() {
        return state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    // ========================================
    // CHECKOUT
    // ========================================
    async function checkout(orderData) {
        try {
            console.log(`[${MODULE_NAME}] Processing checkout...`, orderData);

            if (state.cart.items.length === 0) {
                throw new Error('Cart is empty');
            }

            // Préparer données commande
            const order = {
                ...orderData,
                line_items: state.cart.items.map(item => ({
                    product_id: item.productId,
                    quantity: item.quantity,
                    variation_id: item.variation?.id || null
                })),
                total: state.cart.total.toFixed(2),
                subtotal: state.cart.subtotal.toFixed(2),
                total_tax: state.cart.tax.toFixed(2),
                shipping_total: state.cart.shipping.toFixed(2)
            };

            // Créer commande via WooCommerce API
            const result = await wooCommerceRequest(CONFIG.ENDPOINTS.ORDERS, {
                method: 'POST',
                data: order
            });

            if (result.success) {
                // Sauvegarder commande
                await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.ORDERS, result.data);
                state.orderHistory.push(result.data);

                // Vider panier
                await clearCart();

                console.log(`[${MODULE_NAME}] ✅ Checkout completed:`, result.data.id);

                // Émettre event
                window.dispatchEvent(new CustomEvent('pcf:order:completed', {
                    detail: { order: result.data }
                }));
            }

            return result;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error during checkout:`, error);
            window.dispatchEvent(new CustomEvent('pcf:order:error', {
                detail: { error: error.message }
            }));
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // FAVORITES
    // ========================================
    async function addToFavorites(productId) {
        try {
            if (!state.favorites.includes(productId)) {
                state.favorites.push(productId);
                await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.FAVORITES, { 
                    productId, 
                    addedAt: Date.now() 
                });
                saveToLocalStorage(CONFIG.STORAGE_KEYS.FAVORITES, state.favorites);

                window.dispatchEvent(new CustomEvent('pcf:favorites:updated', {
                    detail: { favorites: state.favorites }
                }));
            }

            return { success: true, favorites: state.favorites };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error adding to favorites:`, error);
            return { success: false, error: error.message };
        }
    }

    async function removeFromFavorites(productId) {
        try {
            state.favorites = state.favorites.filter(id => id !== productId);
            await deleteFromIndexedDB(CONFIG.INDEXEDDB.STORES.FAVORITES, productId);
            saveToLocalStorage(CONFIG.STORAGE_KEYS.FAVORITES, state.favorites);

            window.dispatchEvent(new CustomEvent('pcf:favorites:updated', {
                detail: { favorites: state.favorites }
            }));

            return { success: true, favorites: state.favorites };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error removing from favorites:`, error);
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

            // Restaurer cart et favorites
            await restoreCart();
            state.favorites = loadFromLocalStorage(CONFIG.STORAGE_KEYS.FAVORITES) || [];

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
    const ShopUnifiedAPI = {
        // Core
        init,
        getState: () => ({ ...state }),

        // Products
        getProducts,
        getProduct,

        // Cart
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        getCart,
        getCartItemCount,

        // Checkout
        checkout,

        // Favorites
        addToFavorites,
        removeFromFavorites,
        getFavorites: () => [...state.favorites],

        // Config
        getConfig: () => ({ ...CONFIG })
    };

    // ========================================
    // EXPORT MODULE
    // ========================================
    window.PaieCashFan_ShopUnified = ShopUnifiedAPI;

    console.log(`[${MODULE_NAME}] Module loaded. Use window.PaieCashFan_ShopUnified to access API`);

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
