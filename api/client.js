/**
 * PaieCashFan API Client
 * Client JavaScript pour interagir avec l'API REST
 * Version: 1.0.0
 */

class PaieCashFanAPIClient {
    constructor(config = {}) {
        this.baseURL = config.baseURL || 'http://localhost:3000/api';
        this.token = config.token || null;
        this.onTokenExpired = config.onTokenExpired || null;
    }

    /**
     * Effectuer une requête HTTP
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // Gérer l'expiration du token
            if (response.status === 401 && this.onTokenExpired) {
                this.onTokenExpired();
                throw new Error('Token expired');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    /**
     * Définir le token JWT
     */
    setToken(token) {
        this.token = token;
    }

    /**
     * Supprimer le token JWT
     */
    clearToken() {
        this.token = null;
    }

    // ============================================
    // AUTH METHODS
    // ============================================

    async register(email, password, name, clubId = 'AS_MONACO') {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, clubId })
        });
        this.setToken(data.token);
        return data;
    }

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        this.setToken(data.token);
        return data;
    }

    logout() {
        this.clearToken();
    }

    // ============================================
    // WALLET METHODS
    // ============================================

    async getWalletBalance() {
        return await this.request('/wallet/balance');
    }

    async getWalletTransactions(limit = 20, offset = 0) {
        return await this.request(`/wallet/transactions?limit=${limit}&offset=${offset}`);
    }

    async sendMoney(recipientId, amount, currency = 'EUR') {
        return await this.request('/wallet/send', {
            method: 'POST',
            body: JSON.stringify({ recipientId, amount, currency })
        });
    }

    async depositMoney(amount, method = 'card') {
        return await this.request('/wallet/deposit', {
            method: 'POST',
            body: JSON.stringify({ amount, method })
        });
    }

    // ============================================
    // ESIM METHODS
    // ============================================

    async getESIMPlans() {
        return await this.request('/esim/plans');
    }

    async activateESIM(planId) {
        return await this.request('/esim/activate', {
            method: 'POST',
            body: JSON.stringify({ planId })
        });
    }

    async getActiveESIM() {
        return await this.request('/esim/active');
    }

    // ============================================
    // SHOP METHODS
    // ============================================

    async getProducts(club = 'AS_MONACO', category = 'all') {
        return await this.request(`/shop/products?club=${club}&category=${category}`);
    }

    async addToCart(productId, quantity = 1) {
        return await this.request('/shop/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
    }

    async getCart() {
        return await this.request('/shop/cart');
    }

    async checkout(total) {
        return await this.request('/shop/checkout', {
            method: 'POST',
            body: JSON.stringify({ total })
        });
    }

    // ============================================
    // TICKETS METHODS
    // ============================================

    async getEvents(club = 'AS_MONACO') {
        return await this.request(`/tickets/events?club=${club}`);
    }

    async purchaseTicket(eventId, category, price) {
        return await this.request('/tickets/purchase', {
            method: 'POST',
            body: JSON.stringify({ eventId, category, price })
        });
    }

    async getMyTickets() {
        return await this.request('/tickets/my-tickets');
    }

    async getTicketQR(ticketId) {
        return await this.request(`/tickets/${ticketId}/qr`);
    }

    // ============================================
    // SOCIAL METHODS
    // ============================================

    async getConversations() {
        return await this.request('/social/conversations');
    }

    async sendMessage(conversationId, message) {
        return await this.request('/social/messages', {
            method: 'POST',
            body: JSON.stringify({ conversationId, message })
        });
    }

    async getFeed(page = 1, limit = 10) {
        return await this.request(`/social/feed?page=${page}&limit=${limit}`);
    }

    // ============================================
    // AI METHODS
    // ============================================

    async getAIRecommendations() {
        return await this.request('/ai/recommendations');
    }

    async getAIInsights() {
        return await this.request('/ai/insights');
    }

    async getAIPredictions() {
        return await this.request('/ai/predictions');
    }

    // ============================================
    // SYSTEM METHODS
    // ============================================

    async getHealth() {
        return await this.request('/health');
    }

    async getStats() {
        return await this.request('/stats');
    }
}

// Export pour utilisation dans Node.js ou navigateur
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaieCashFanAPIClient;
} else if (typeof window !== 'undefined') {
    window.PaieCashFanAPIClient = PaieCashFanAPIClient;
}
