// WooCommerce Connector V6.0
// Connexion à l'API WooCommerce pour PaieCashFan

class WooCommerceConnector {
    constructor(config = {}) {
        this.apiUrl = config.apiUrl || 'https://store.paiecashplay.com/wp-json/wc/v3';
        this.consumerKey = config.consumerKey || '';
        this.consumerSecret = config.consumerSecret || '';
        this.demoMode = config.demoMode !== false; // Mode démo par défaut
    }

    // Produits de démonstration
    getDemoProducts() {
        return [
            {
                id: 1,
                name: 'Maillot Domicile 2024/2025',
                price: '89.99',
                currency: '€',
                image: '👕',
                category: 'maillots',
                stock: 25,
                description: 'Maillot officiel domicile saison 2024/2025'
            },
            {
                id: 2,
                name: 'Maillot Extérieur 2024/2025',
                price: '89.99',
                currency: '€',
                image: '👕',
                category: 'maillots',
                stock: 18,
                description: 'Maillot officiel extérieur saison 2024/2025'
            },
            {
                id: 3,
                name: 'Casquette Fan Collection',
                price: '24.99',
                currency: '€',
                image: '🧢',
                category: 'goodies',
                stock: 50,
                description: 'Casquette officielle avec logo brodé'
            },
            {
                id: 4,
                name: 'Écharpe Supporter',
                price: '19.99',
                currency: '€',
                image: '🧣',
                category: 'goodies',
                stock: 35,
                description: 'Écharpe officielle 100% acrylique'
            },
            {
                id: 5,
                name: 'Sac à dos',
                price: '49.99',
                currency: '€',
                image: '🎒',
                category: 'goodies',
                stock: 12,
                description: 'Sac à dos édition limitée'
            }
        ];
    }

    // Récupérer les produits
    async getProducts(params = {}) {
        if (this.demoMode) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    let products = this.getDemoProducts();
                    if (params.category) {
                        products = products.filter(p => p.category === params.category);
                    }
                    resolve({ success: true, products });
                }, 500);
            });
        }

        try {
            const response = await fetch(`${this.apiUrl}/products?${new URLSearchParams(params)}`, {
                headers: {
                    'Authorization': 'Basic ' + btoa(`${this.consumerKey}:${this.consumerSecret}`)
                }
            });
            const products = await response.json();
            return { success: true, products };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getProduct(productId) {
        if (this.demoMode) {
            const products = this.getDemoProducts();
            const product = products.find(p => p.id === parseInt(productId));
            return new Promise((resolve) => {
                setTimeout(() => resolve({ success: true, product }), 300);
            });
        }

        try {
            const response = await fetch(`${this.apiUrl}/products/${productId}`, {
                headers: {
                    'Authorization': 'Basic ' + btoa(`${this.consumerKey}:${this.consumerSecret}`)
                }
            });
            const product = await response.json();
            return { success: true, product };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async createOrder(orderData) {
        if (this.demoMode) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        order: {
                            id: Math.floor(Math.random() * 10000),
                            status: 'processing',
                            total: orderData.total,
                            ...orderData
                        }
                    });
                }, 800);
            });
        }

        try {
            const response = await fetch(`${this.apiUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${this.consumerKey}:${this.consumerSecret}`),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            const order = await response.json();
            return { success: true, order };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

window.woocommerce = new WooCommerceConnector({ demoMode: true });
console.log('✅ WooCommerce Connector V6.0 chargé');
