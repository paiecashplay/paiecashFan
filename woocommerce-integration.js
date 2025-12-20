// ========================================
// MODULE INTÉGRATION WOOCOMMERCE
// PaieCashPlay x store.paiecashplay.com
// ========================================

/**
 * Configuration WooCommerce
 * IMPORTANT: Les clés API doivent être générées dans:
 * WordPress Admin → WooCommerce → Settings → Advanced → REST API
 */
const WOO_CONFIG = {
    baseURL: 'https://store.paiecashplay.com',
    apiEndpoint: '/wp-json/wc/v3',
    // NOTE: Pour des raisons de sécurité, ces clés devraient être stockées côté serveur
    // Ici, on utilise une approche client-side simplifiée pour la démo
    consumerKey: 'ck_VOTRE_CLE_CONSUMER',
    consumerSecret: 'cs_VOTRE_CLE_SECRET',
    version: 'v3'
};

/**
 * Cache des produits WooCommerce
 */
let wooProductsCache = [];

/**
 * Charge les produits depuis l'API WooCommerce
 * @param {number} page - Numéro de page (défaut: 1)
 * @param {number} perPage - Nombre de produits par page (défaut: 100)
 * @returns {Promise<Array>} Liste des produits
 */
async function loadWooCommerceProducts(page = 1, perPage = 100) {
    try {
        // Construction de l'URL avec authentification Basic
        const auth = btoa(`${WOO_CONFIG.consumerKey}:${WOO_CONFIG.consumerSecret}`);
        const url = `${WOO_CONFIG.baseURL}${WOO_CONFIG.apiEndpoint}/products?page=${page}&per_page=${perPage}`;

        console.log(`📦 Chargement des produits WooCommerce (page ${page})...`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }

        const products = await response.json();
        console.log(`✅ ${products.length} produits chargés depuis WooCommerce`);

        // Mettre en cache
        wooProductsCache = wooProductsCache.concat(products);

        return products;
    } catch (error) {
        console.error('❌ Erreur lors du chargement WooCommerce:', error);
        
        // Fallback: retourner des produits de démo si l'API échoue
        return getDemoProducts();
    }
}

/**
 * Produits de démo (fallback si WooCommerce est inaccessible)
 */
function getDemoProducts() {
    return [
        {
            id: 1001,
            name: "Maillot Domicile 2024/25",
            price: "89.99",
            regular_price: "89.99",
            images: [{ src: "https://via.placeholder.com/300x300?text=Maillot" }],
            categories: [{ name: "Maillots" }],
            stock_status: "instock"
        },
        {
            id: 1002,
            name: "Écharpe Officielle",
            price: "19.99",
            regular_price: "24.99",
            images: [{ src: "https://via.placeholder.com/300x300?text=Écharpe" }],
            categories: [{ name: "Accessoires" }],
            stock_status: "instock"
        },
        {
            id: 1003,
            name: "Casquette Logo Club",
            price: "24.99",
            regular_price: "24.99",
            images: [{ src: "https://via.placeholder.com/300x300?text=Casquette" }],
            categories: [{ name: "Accessoires" }],
            stock_status: "instock"
        },
        {
            id: 1004,
            name: "Survêtement Entraînement",
            price: "129.99",
            regular_price: "149.99",
            images: [{ src: "https://via.placeholder.com/300x300?text=Survêtement" }],
            categories: [{ name: "Vêtements" }],
            stock_status: "instock"
        },
        {
            id: 1005,
            name: "Ballon Officiel",
            price: "29.99",
            regular_price: "29.99",
            images: [{ src: "https://via.placeholder.com/300x300?text=Ballon" }],
            categories: [{ name: "Accessoires" }],
            stock_status: "instock"
        },
        {
            id: 1006,
            name: "Gourde Isotherme",
            price: "14.99",
            regular_price: "14.99",
            images: [{ src: "https://via.placeholder.com/300x300?text=Gourde" }],
            categories: [{ name: "Accessoires" }],
            stock_status: "instock"
        }
    ];
}

/**
 * Affiche les produits WooCommerce dans la grille
 * @param {string} containerId - ID du conteneur HTML
 * @param {Array} products - Liste des produits à afficher
 */
function displayWooProducts(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ Conteneur #${containerId} introuvable`);
        return;
    }

    if (!products || products.length === 0) {
        // NE PAS écraser les produits phares, juste ajouter un message
        const emptyMsg = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; opacity: 0.7;">
                <div style="font-size: 60px; margin-bottom: 15px;">📦</div>
                <p style="font-size: 18px;">Chargement des produits WooCommerce...</p>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', emptyMsg);
        return;
    }

    // AJOUTER les produits WooCommerce APRÈS les produits phares (ne pas écraser)
    const wooHTML = products.map(product => {
        const imageUrl = product.images && product.images[0] ? product.images[0].src : 'https://via.placeholder.com/300x300?text=Produit';
        const price = parseFloat(product.price);
        const regularPrice = product.regular_price ? parseFloat(product.regular_price) : price;
        const isOnSale = regularPrice > price;
        const discount = isOnSale ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;

        return `
            <div class="product-card" onclick="toggleWooProduct(${product.id})" id="woo-product-${product.id}" style="cursor: pointer; transition: all 0.3s;">
                ${isOnSale ? `
                    <div style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; padding: 5px 10px; border-radius: 10px; font-size: 11px; font-weight: bold; z-index: 1;">
                        -${discount}%
                    </div>
                ` : ''}
                ${product.stock_status !== 'instock' ? `
                    <div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 10px; font-size: 11px; font-weight: bold; z-index: 1;">
                        Rupture
                    </div>
                ` : ''}
                <div class="product-img" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center; height: 120px; border-radius: 10px; margin-bottom: 10px;"></div>
                <div class="product-name" style="font-size: 14px; font-weight: 600; margin-bottom: 5px; line-height: 1.3;">${product.name}</div>
                ${product.categories && product.categories[0] ? `
                    <div style="font-size: 11px; opacity: 0.7; margin-bottom: 5px;">${product.categories[0].name}</div>
                ` : ''}
                <div style="display: flex; align-items: center; gap: 8px; margin-top: auto;">
                    ${isOnSale ? `
                        <span style="text-decoration: line-through; opacity: 0.5; font-size: 13px;">${regularPrice.toFixed(2)} €</span>
                    ` : ''}
                    <div class="product-price" style="color: ${isOnSale ? '#10b981' : '#fff'}; font-size: ${isOnSale ? '18px' : '16px'}; font-weight: bold;">${price.toFixed(2)} €</div>
                </div>
            </div>
        `;
    }).join('');
    
    // AJOUTER à la fin du conteneur au lieu de remplacer
    container.insertAdjacentHTML('beforeend', wooHTML);
    console.log(`✅ ${products.length} produits WooCommerce ajoutés à la boutique`);
}

/**
 * Gère la sélection d'un produit WooCommerce
 * @param {number} productId - ID du produit
 */
function toggleWooProduct(productId) {
    const card = document.getElementById(`woo-product-${productId}`);
    if (!card) return;

    const isSelected = card.classList.contains('selected');
    
    if (isSelected) {
        card.classList.remove('selected');
        card.style.border = '2px solid rgba(255,255,255,0.2)';
        card.style.transform = 'scale(1)';
        // Retirer du panier
        const index = state.produitsSelectionnes.findIndex(p => p.id === productId);
        if (index !== -1) {
            state.produitsSelectionnes.splice(index, 1);
        }
    } else {
        card.classList.add('selected');
        card.style.border = '2px solid #10b981';
        card.style.transform = 'scale(1.05)';
        // Ajouter au panier
        const product = wooProductsCache.find(p => p.id === productId);
        if (product) {
            state.produitsSelectionnes.push({
                id: product.id,
                nom: product.name,
                prix: parseFloat(product.price)
            });
        }
    }

    updatePanier();
}

/**
 * Initialise l'intégration WooCommerce au chargement de la page
 */
async function initWooCommerce() {
    console.log('🚀 Initialisation WooCommerce...');
    
    try {
        // Charger les produits
        const products = await loadWooCommerceProducts(1, 100);
        
        // Afficher dans la boutique officielle
        displayWooProducts('boutique-grid', products);
        
        console.log('✅ WooCommerce initialisé avec succès');
    } catch (error) {
        console.error('❌ Erreur d\'initialisation WooCommerce:', error);
        
        // Afficher les produits de démo en cas d'erreur
        const demoProducts = getDemoProducts();
        displayWooProducts('boutique-grid', demoProducts);
    }
}

/**
 * Crée une commande WooCommerce
 * @param {Array} items - Liste des produits commandés
 * @param {Object} paymentMethod - Méthode de paiement
 * @returns {Promise<Object>} Détails de la commande créée
 */
async function createWooOrder(items, paymentMethod) {
    try {
        const auth = btoa(`${WOO_CONFIG.consumerKey}:${WOO_CONFIG.consumerSecret}`);
        const url = `${WOO_CONFIG.baseURL}${WOO_CONFIG.apiEndpoint}/orders`;

        const orderData = {
            payment_method: paymentMethod.code || 'paiecashplay',
            payment_method_title: paymentMethod.name || 'PaieCashPlay',
            set_paid: true,
            line_items: items.map(item => ({
                product_id: item.id,
                quantity: 1
            })),
            status: 'processing'
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }

        const order = await response.json();
        console.log('✅ Commande WooCommerce créée:', order);
        
        return order;
    } catch (error) {
        console.error('❌ Erreur création commande:', error);
        throw error;
    }
}

// Export des fonctions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadWooCommerceProducts,
        displayWooProducts,
        toggleWooProduct,
        initWooCommerce,
        createWooOrder
    };
}
