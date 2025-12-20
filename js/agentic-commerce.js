/**
 * PaieCashFan - Agentic Commerce Protocol (ACP)
 * Système de commerce conversationnel intelligent
 * Permet l'achat DIRECT depuis le chat IA
 */

class AgenticCommerce {
    constructor() {
        this.cart = [];
        this.currentClub = null;
        this.woocommerce = null;
        this.smsPayment = window.smsPayment || null;
        this.qrPayment = window.qrPayment || null;
        this.customerInfo = this.loadCustomerInfo();
        
        // Initialiser WooCommerce
        this.initWooCommerce();
    }
    
    /**
     * Initialiser la connexion WooCommerce
     */
    async initWooCommerce() {
        try {
            if (typeof WooCommerceConnector !== 'undefined') {
                this.woocommerce = new WooCommerceConnector();
                console.log('✅ WooCommerce connector initialized');
            } else {
                console.warn('⚠️ WooCommerceConnector not found');
            }
        } catch (error) {
            console.error('Failed to initialize WooCommerce:', error);
        }
    }
    
    /**
     * Définir le club actuel
     */
    setCurrentClub(clubId, clubName) {
        this.currentClub = {
            id: clubId,
            name: clubName
        };
    }
    
    /**
     * Charger les informations client depuis localStorage
     */
    loadCustomerInfo() {
        const saved = localStorage.getItem('paiecashfan_customer');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return null;
            }
        }
        return null;
    }
    
    /**
     * Sauvegarder les informations client
     */
    saveCustomerInfo(info) {
        this.customerInfo = info;
        localStorage.setItem('paiecashfan_customer', JSON.stringify(info));
    }
    
    /**
     * Rechercher des produits
     * @param {String} query - Requête de recherche
     * @param {Object} options - Options de recherche
     * @returns {Array} Produits trouvés
     */
    async searchProducts(query, options = {}) {
        if (!this.woocommerce) {
            return this.getMockProducts(query);
        }
        
        try {
            const clubId = options.clubId || this.currentClub?.id;
            return await this.woocommerce.searchProducts(query, clubId);
        } catch (error) {
            console.error('Product search error:', error);
            return this.getMockProducts(query);
        }
    }
    
    /**
     * Obtenir les promotions actives
     * @returns {Array} Produits en promotion
     */
    async getPromotions() {
        if (!this.woocommerce) {
            return this.getMockPromotions();
        }
        
        try {
            const clubId = this.currentClub?.id;
            return await this.woocommerce.getOnSaleProducts(clubId);
        } catch (error) {
            console.error('Promotions fetch error:', error);
            return this.getMockPromotions();
        }
    }
    
    /**
     * Ajouter un produit au panier
     * @param {Object} product - Produit à ajouter
     * @param {Number} quantity - Quantité
     * @param {Object} options - Options (taille, couleur, etc.)
     * @returns {Object} État du panier
     */
    addToCart(product, quantity = 1, options = {}) {
        const existingItem = this.cart.find(item => 
            item.product.id === product.id && 
            JSON.stringify(item.options) === JSON.stringify(options)
        );
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                product,
                quantity,
                options,
                addedAt: Date.now()
            });
        }
        
        this.saveCart();
        
        return this.getCartSummary();
    }
    
    /**
     * Retirer un produit du panier
     * @param {Number} productId - ID du produit
     * @param {Object} options - Options du produit
     * @returns {Object} État du panier
     */
    removeFromCart(productId, options = {}) {
        this.cart = this.cart.filter(item => 
            !(item.product.id === productId && 
              JSON.stringify(item.options) === JSON.stringify(options))
        );
        
        this.saveCart();
        
        return this.getCartSummary();
    }
    
    /**
     * Mettre à jour la quantité d'un produit
     * @param {Number} productId - ID du produit
     * @param {Number} quantity - Nouvelle quantité
     * @param {Object} options - Options du produit
     * @returns {Object} État du panier
     */
    updateQuantity(productId, quantity, options = {}) {
        const item = this.cart.find(item => 
            item.product.id === productId && 
            JSON.stringify(item.options) === JSON.stringify(options)
        );
        
        if (item) {
            if (quantity <= 0) {
                return this.removeFromCart(productId, options);
            }
            item.quantity = quantity;
            this.saveCart();
        }
        
        return this.getCartSummary();
    }
    
    /**
     * Vider le panier
     */
    clearCart() {
        this.cart = [];
        this.saveCart();
    }
    
    /**
     * Obtenir le résumé du panier
     * @returns {Object} Résumé du panier
     */
    getCartSummary() {
        const subtotal = this.cart.reduce((sum, item) => {
            const price = parseFloat(item.product.price || 0);
            return sum + (price * item.quantity);
        }, 0);
        
        const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
            items: this.cart,
            itemCount,
            subtotal: subtotal.toFixed(2),
            shipping: this.calculateShipping(subtotal),
            total: (subtotal + this.calculateShipping(subtotal)).toFixed(2)
        };
    }
    
    /**
     * Calculer les frais de livraison
     */
    calculateShipping(subtotal) {
        if (subtotal >= 50) return 0; // Livraison gratuite au-dessus de 50€
        return 4.99;
    }
    
    /**
     * Sauvegarder le panier
     */
    saveCart() {
        localStorage.setItem('paiecashfan_cart', JSON.stringify(this.cart));
    }
    
    /**
     * Charger le panier
     */
    loadCart() {
        const saved = localStorage.getItem('paiecashfan_cart');
        if (saved) {
            try {
                this.cart = JSON.parse(saved);
            } catch (e) {
                this.cart = [];
            }
        }
    }
    
    /**
     * Passer commande
     * @param {Object} checkoutData - Données de paiement
     * @returns {Object} Résultat de la commande
     */
    async checkout(checkoutData) {
        const {
            paymentMethod,
            customerInfo,
            shippingAddress
        } = checkoutData;
        
        // Validation
        if (this.cart.length === 0) {
            throw new Error('Le panier est vide');
        }
        
        if (!customerInfo || !customerInfo.email) {
            throw new Error('Informations client requises');
        }
        
        // Sauvegarder les infos client
        this.saveCustomerInfo(customerInfo);
        
        try {
            // Créer la commande WooCommerce
            let order = null;
            
            if (this.woocommerce) {
                order = await this.createWooCommerceOrder(customerInfo, shippingAddress, paymentMethod);
            } else {
                order = this.createMockOrder(customerInfo, shippingAddress, paymentMethod);
            }
            
            // Traiter le paiement
            const paymentResult = await this.processPayment(paymentMethod, order, checkoutData);
            
            // Si le paiement est réussi, vider le panier
            if (paymentResult.success) {
                this.clearCart();
            }
            
            return {
                success: true,
                order,
                payment: paymentResult
            };
            
        } catch (error) {
            console.error('Checkout error:', error);
            throw error;
        }
    }
    
    /**
     * Créer une commande WooCommerce
     */
    async createWooCommerceOrder(customerInfo, shippingAddress, paymentMethod) {
        const cartSummary = this.getCartSummary();
        
        // Créer ou récupérer le client
        const customer = await this.woocommerce.getOrCreateCustomer({
            email: customerInfo.email,
            first_name: customerInfo.firstName,
            last_name: customerInfo.lastName,
            billing: shippingAddress,
            shipping: shippingAddress
        });
        
        // Préparer les line items
        const lineItems = this.cart.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            meta_data: Object.entries(item.options).map(([key, value]) => ({
                key,
                value
            }))
        }));
        
        // Créer la commande
        const order = await this.woocommerce.createOrder({
            customer_id: customer?.id || 0,
            payment_method: paymentMethod,
            billing: shippingAddress,
            shipping: shippingAddress,
            line_items: lineItems,
            club: this.currentClub?.name,
            phone: customerInfo.phone
        });
        
        return order;
    }
    
    /**
     * Créer une commande fictive (mode démo)
     */
    createMockOrder(customerInfo, shippingAddress, paymentMethod) {
        const cartSummary = this.getCartSummary();
        
        return {
            id: Math.floor(Math.random() * 100000),
            order_key: 'wc_order_' + Date.now(),
            status: 'pending',
            currency: 'EUR',
            total: cartSummary.total,
            subtotal: cartSummary.subtotal,
            shipping_total: cartSummary.shipping,
            customer: customerInfo,
            shipping: shippingAddress,
            payment_method: paymentMethod,
            line_items: this.cart.map(item => ({
                id: item.product.id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
                total: (parseFloat(item.product.price) * item.quantity).toFixed(2)
            })),
            date_created: new Date().toISOString()
        };
    }
    
    /**
     * Traiter le paiement selon la méthode choisie
     */
    async processPayment(paymentMethod, order, checkoutData) {
        switch (paymentMethod) {
            case 'sms':
                return await this.processSMSPayment(order, checkoutData);
            
            case 'qrcode':
                return await this.processQRCodePayment(order, checkoutData);
            
            case 'crypto':
                return await this.processCryptoPayment(order, checkoutData);
            
            case 'card':
                return await this.processCardPayment(order, checkoutData);
            
            default:
                throw new Error('Méthode de paiement non supportée');
        }
    }
    
    /**
     * Traiter un paiement par SMS
     */
    async processSMSPayment(order, checkoutData) {
        if (!this.smsPayment) {
            throw new Error('Module de paiement SMS non disponible');
        }
        
        const phoneNumber = checkoutData.phoneNumber || checkoutData.customerInfo?.phone;
        
        if (!phoneNumber) {
            throw new Error('Numéro de téléphone requis pour le paiement SMS');
        }
        
        try {
            const result = await this.smsPayment.initiatePayment({
                phoneNumber,
                amount: parseFloat(order.total),
                description: `Commande #${order.id}`,
                type: 'purchase'
            });
            
            return {
                success: result.success,
                method: 'sms',
                transactionId: result.transactionId,
                orderId: order.id
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Traiter un paiement par QR Code
     */
    async processQRCodePayment(order, checkoutData) {
        if (!this.qrPayment) {
            throw new Error('Module de paiement QR Code non disponible');
        }
        
        try {
            const qrData = await this.qrPayment.generate({
                amount: parseFloat(order.total),
                orderId: order.id,
                description: `Commande #${order.id} - ${this.currentClub?.name || 'PaieCashFan'}`,
                type: 'purchase'
            });
            
            return {
                success: true,
                method: 'qrcode',
                qrData: qrData,
                orderId: order.id,
                status: 'pending_scan'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Traiter un paiement crypto
     */
    async processCryptoPayment(order, checkoutData) {
        // Simulé pour le moment
        return {
            success: true,
            method: 'crypto',
            transactionId: 'crypto_' + Date.now(),
            orderId: order.id,
            status: 'pending_blockchain'
        };
    }
    
    /**
     * Traiter un paiement par carte
     */
    async processCardPayment(order, checkoutData) {
        // Simulé pour le moment (intégration Stripe requise)
        return {
            success: true,
            method: 'card',
            transactionId: 'card_' + Date.now(),
            orderId: order.id,
            status: 'completed'
        };
    }
    
    /**
     * Obtenir des produits fictifs (mode démo)
     */
    getMockProducts(query = '') {
        const clubName = this.currentClub?.name || 'Club';
        
        const products = [
            {
                id: 1,
                name: `Maillot Domicile ${clubName} 2025`,
                price: '89.99',
                sale_price: '71.99',
                on_sale: true,
                images: [{ src: 'https://via.placeholder.com/300x300?text=Maillot' }],
                description: `Maillot officiel domicile saison 2025`,
                categories: [{ id: 1, name: 'Maillots' }],
                attributes: [
                    { name: 'Taille', options: ['S', 'M', 'L', 'XL', 'XXL'] }
                ]
            },
            {
                id: 2,
                name: `Écharpe Officielle ${clubName}`,
                price: '19.99',
                sale_price: '13.99',
                on_sale: true,
                images: [{ src: 'https://via.placeholder.com/300x300?text=Echarpe' }],
                description: `Écharpe officielle aux couleurs du club`,
                categories: [{ id: 2, name: 'Accessoires' }]
            },
            {
                id: 3,
                name: `Pack Supporter ${clubName}`,
                price: '49.99',
                on_sale: false,
                images: [{ src: 'https://via.placeholder.com/300x300?text=Pack' }],
                description: `Pack complet: maillot + écharpe + casquette`,
                categories: [{ id: 3, name: 'Packs' }]
            }
        ];
        
        if (query) {
            return products.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.description.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        return products;
    }
    
    /**
     * Obtenir des promotions fictives (mode démo)
     */
    getMockPromotions() {
        return this.getMockProducts().filter(p => p.on_sale);
    }
}

// Export global
window.AgenticCommerce = AgenticCommerce;

// Instanciation automatique
if (!window.agenticCommerce) {
    window.agenticCommerce = new AgenticCommerce();
    window.agenticCommerce.loadCart();
}
