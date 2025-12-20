/**
 * Client API PaieCashFan V4.0
 * Remplace localStorage par de vrais appels API
 */

class PaieCashFanAPI {
  constructor() {
    // Changer cette URL selon l'environnement
    this.baseURL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000/api'
      : 'https://api.paiecashfan.com/api';
    
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  /**
   * Effectuer une requête HTTP
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    // Ajouter le token d'authentification si disponible
    if (this.accessToken && !options.skipAuth) {
      config.headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Si le token est expiré, essayer de le rafraîchir
      if (response.status === 401 && data.message?.includes('expiré') && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Réessayer la requête avec le nouveau token
          config.headers['Authorization'] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, config);
          return await retryResponse.json();
        } else {
          // Impossible de rafraîchir, rediriger vers login
          this.logout();
          window.location.href = 'connexion.html';
        }
      }

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la requête');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ========== AUTHENTIFICATION ==========

  /**
   * Inscription
   */
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      skipAuth: true
    });

    if (response.success) {
      this.setTokens(response.data.tokens);
      return response.data.user;
    }
    throw new Error(response.message);
  }

  /**
   * Connexion
   */
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true
    });

    if (response.success) {
      this.setTokens(response.data.tokens);
      return response.data.user;
    }
    throw new Error(response.message);
  }

  /**
   * Rafraîchir le token d'accès
   */
  async refreshAccessToken() {
    try {
      const response = await this.request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
        skipAuth: true
      });

      if (response.success) {
        this.setTokens(response.data.tokens);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      return false;
    }
  }

  /**
   * Déconnexion
   */
  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Stocker les tokens
   */
  setTokens(tokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  /**
   * Effacer les tokens
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated() {
    return !!this.accessToken;
  }

  // ========== UTILISATEUR ==========

  /**
   * Obtenir le profil de l'utilisateur connecté
   */
  async getProfile() {
    const response = await this.request('/users/me');
    return response.data;
  }

  /**
   * Modifier le profil
   */
  async updateProfile(updates) {
    const response = await this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response.data;
  }

  /**
   * Définir le code secret de paiement
   */
  async setPaymentCode(code) {
    const response = await this.request('/users/me/payment-code', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
    return response.data;
  }

  /**
   * Vérifier le code secret de paiement
   */
  async verifyPaymentCode(code) {
    const response = await this.request('/users/me/payment-code/verify', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
    return response.data;
  }

  // ========== WALLET ==========

  /**
   * Obtenir le wallet de l'utilisateur
   */
  async getWallet() {
    const response = await this.request('/users/me/wallet');
    return response.data;
  }

  /**
   * Obtenir l'historique des transactions
   */
  async getTransactions(page = 1, limit = 10) {
    const response = await this.request(`/users/me/wallet/transactions?page=${page}&limit=${limit}`);
    return response.data;
  }

  /**
   * Connecter un wallet WalletConnect
   */
  async connectWallet(ethereumAddress, signature) {
    const response = await this.request('/wallet/connect', {
      method: 'POST',
      body: JSON.stringify({ ethereumAddress, signature })
    });
    return response.data;
  }

  // ========== FIDÉLITÉ ==========

  /**
   * Obtenir les points de fidélité
   */
  async getLoyaltyPoints() {
    const response = await this.request('/loyalty/points');
    return response.data;
  }

  /**
   * Obtenir le niveau de fidélité
   */
  async getLoyaltyLevel() {
    const response = await this.request('/loyalty/level');
    return response.data;
  }

  // ========== PARRAINAGE ==========

  /**
   * Obtenir le code de parrainage
   */
  async getReferralCode() {
    const response = await this.request('/referrals/code');
    return response.data;
  }

  /**
   * Obtenir la liste des filleuls
   */
  async getReferrals() {
    const response = await this.request('/referrals/list');
    return response.data;
  }

  /**
   * Partager le code de parrainage
   */
  async shareReferralCode(method) {
    // Cette méthode déclenche le partage côté frontend
    // mais peut logger l'événement côté backend
    try {
      await this.request('/referrals/share', {
        method: 'POST',
        body: JSON.stringify({ method })
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du partage:', error);
    }
  }

  // ========== CLUBS ==========

  /**
   * Obtenir la liste des clubs
   */
  async getClubs() {
    const response = await this.request('/clubs', { skipAuth: true });
    return response.data;
  }

  /**
   * Obtenir les détails d'un club
   */
  async getClub(clubId) {
    const response = await this.request(`/clubs/${clubId}`, { skipAuth: true });
    return response.data;
  }

  // ========== PAIEMENTS ==========

  /**
   * Créer un paiement Stripe
   */
  async createStripePayment(amount, currency = 'EUR', metadata = {}) {
    const response = await this.request('/payments/stripe', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, metadata })
    });
    return response.data;
  }

  /**
   * Créer un paiement crypto
   */
  async createCryptoPayment(amount, cryptocurrency, toAddress) {
    const response = await this.request('/payments/crypto', {
      method: 'POST',
      body: JSON.stringify({ amount, cryptocurrency, toAddress })
    });
    return response.data;
  }

  /**
   * Obtenir l'historique des paiements
   */
  async getPaymentHistory(page = 1, limit = 10) {
    const response = await this.request(`/payments/history?page=${page}&limit=${limit}`);
    return response.data;
  }

  // ========== NOTIFICATIONS ==========

  /**
   * Obtenir les notifications
   */
  async getNotifications(page = 1, limit = 10) {
    const response = await this.request(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  }

  /**
   * Marquer une notification comme lue
   */
  async markNotificationAsRead(notificationId) {
    const response = await this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
    return response.data;
  }

  /**
   * Mettre à jour les préférences de notifications
   */
  async updateNotificationPreferences(preferences) {
    const response = await this.request('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
    return response.data;
  }
}

// Exporter une instance globale
const api = new PaieCashFanAPI();

// Si utilisé avec des modules ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaieCashFanAPI;
}
