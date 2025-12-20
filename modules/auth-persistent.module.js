/**
 * ============================================
 * MODULE AUTHENTIFICATION PERSISTANTE V11.0
 * ============================================
 * Gestion de l'authentification qui SURVIT aux upgrades
 * 
 * FONCTIONNALITÉS:
 * - Connexion/Déconnexion
 * - Persistance dans localStorage
 * - Tokens JWT
 * - Sessions sécurisées
 * - Compatibilité avec backend API
 * 
 * @version 1.0.0
 * @requires core-system.js
 */

(function(global) {
    'use strict';

    const { BaseModule } = global.PaieCashFan;

    class AuthPersistentModule extends BaseModule {
        constructor(core, options = {}) {
            super(core, options);
            this.version = '1.0.0';
            this.name = 'AuthPersistent';
            this.dependencies = [];

            // Configuration
            this.config = {
                apiEndpoint: options.apiEndpoint || '/api/auth',
                tokenExpiry: options.tokenExpiry || 24 * 60 * 60 * 1000, // 24h
                refreshTokenExpiry: options.refreshTokenExpiry || 7 * 24 * 60 * 60 * 1000, // 7 jours
                ...options
            };

            // État de l'auth
            this.currentUser = null;
            this.isAuthenticated = false;
            this.tokens = {
                access: null,
                refresh: null
            };
        }

        /**
         * Initialisation du module
         */
        async init() {
            this.log('Initialisation...', 'module');

            // Restaurer la session depuis localStorage
            await this.restoreSession();

            // Vérifier si token encore valide
            if (this.isAuthenticated) {
                await this.validateSession();
            }

            this.initialized = true;
            this.log('✅ Module initialisé', 'success');
            this.emit('ready');
        }

        /**
         * Restaurer la session depuis localStorage
         */
        async restoreSession() {
            try {
                const user = this.storage.get('user');
                const accessToken = this.storage.get('accessToken');
                const refreshToken = this.storage.get('refreshToken');
                const isAuth = this.storage.get('isAuthenticated', false);

                if (user && accessToken && isAuth) {
                    this.currentUser = user;
                    this.tokens.access = accessToken;
                    this.tokens.refresh = refreshToken;
                    this.isAuthenticated = true;

                    this.log(`✅ Session restaurée pour ${user.email}`, 'success');
                    this.emit('session:restored', { user });
                    return true;
                }

                return false;
            } catch (error) {
                this.log('⚠️ Erreur restauration session', 'warning', error);
                return false;
            }
        }

        /**
         * Valider la session actuelle
         */
        async validateSession() {
            try {
                // Vérifier l'expiration du token
                const tokenData = this.storage.get('tokenData');
                if (tokenData && tokenData.expiresAt) {
                    const now = Date.now();
                    if (now > tokenData.expiresAt) {
                        this.log('⚠️ Token expiré, tentative de refresh', 'warning');
                        return await this.refreshAccessToken();
                    }
                }

                return true;
            } catch (error) {
                this.log('❌ Validation session échouée', 'error', error);
                await this.logout();
                return false;
            }
        }

        /**
         * CONNEXION
         */
        async login(email, password, rememberMe = true) {
            try {
                this.log(`Tentative de connexion: ${email}`, 'info');

                // Si API backend disponible
                if (this.config.apiEndpoint && typeof fetch !== 'undefined') {
                    return await this.loginAPI(email, password, rememberMe);
                }

                // Sinon, connexion locale (démo)
                return await this.loginLocal(email, password, rememberMe);

            } catch (error) {
                this.log('❌ Erreur lors de la connexion', 'error', error);
                this.emit('login:error', { error: error.message });
                throw error;
            }
        }

        /**
         * Connexion via API
         */
        async loginAPI(email, password, rememberMe) {
            const response = await fetch(`${this.config.apiEndpoint}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Échec de la connexion');
            }

            const data = await response.json();
            await this.handleSuccessfulLogin(data.user, data.accessToken, data.refreshToken, rememberMe);
            
            return { success: true, user: data.user };
        }

        /**
         * Connexion locale (démo/développement)
         */
        async loginLocal(email, password, rememberMe) {
            // Récupérer les utilisateurs stockés localement
            const users = this.storage.get('registeredUsers', []);
            const user = users.find(u => u.email === email);

            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }

            // Vérifier le mot de passe (en production, utiliser bcrypt)
            if (user.motDePasse !== password) {
                throw new Error('Mot de passe incorrect');
            }

            // Générer des tokens fictifs
            const accessToken = this.generateToken(user, '24h');
            const refreshToken = this.generateToken(user, '7d');

            await this.handleSuccessfulLogin(user, accessToken, refreshToken, rememberMe);

            return { success: true, user };
        }

        /**
         * Traiter une connexion réussie
         */
        async handleSuccessfulLogin(user, accessToken, refreshToken, rememberMe) {
            // Nettoyer les données sensibles
            const safeUser = { ...user };
            delete safeUser.motDePasse;
            delete safeUser.password;

            // Stocker en mémoire
            this.currentUser = safeUser;
            this.tokens.access = accessToken;
            this.tokens.refresh = refreshToken;
            this.isAuthenticated = true;

            // Persister dans localStorage
            if (rememberMe) {
                this.storage.set('user', safeUser);
                this.storage.set('accessToken', accessToken);
                this.storage.set('refreshToken', refreshToken);
                this.storage.set('isAuthenticated', true);
                this.storage.set('tokenData', {
                    expiresAt: Date.now() + this.config.tokenExpiry,
                    refreshExpiresAt: Date.now() + this.config.refreshTokenExpiry
                });
            }

            this.log(`✅ Connexion réussie: ${safeUser.email}`, 'success');
            this.emit('login:success', { user: safeUser });
            this.core.emit('user:authenticated', { user: safeUser });
        }

        /**
         * INSCRIPTION
         */
        async register(userData) {
            try {
                this.log(`Tentative d'inscription: ${userData.email}`, 'info');

                // Si API backend disponible
                if (this.config.apiEndpoint && typeof fetch !== 'undefined') {
                    return await this.registerAPI(userData);
                }

                // Sinon, inscription locale
                return await this.registerLocal(userData);

            } catch (error) {
                this.log('❌ Erreur lors de l\'inscription', 'error', error);
                this.emit('register:error', { error: error.message });
                throw error;
            }
        }

        /**
         * Inscription via API
         */
        async registerAPI(userData) {
            const response = await fetch(`${this.config.apiEndpoint}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Échec de l\'inscription');
            }

            const data = await response.json();
            
            // Auto-login après inscription
            await this.handleSuccessfulLogin(data.user, data.accessToken, data.refreshToken, true);

            return { success: true, user: data.user };
        }

        /**
         * Inscription locale
         */
        async registerLocal(userData) {
            // Récupérer les utilisateurs existants
            const users = this.storage.get('registeredUsers', []);

            // Vérifier si l'email existe déjà
            if (users.some(u => u.email === userData.email)) {
                throw new Error('Cet email est déjà utilisé');
            }

            // Créer le nouvel utilisateur
            const newUser = {
                id: this.core.utils.generateId('user'),
                email: userData.email,
                nom: userData.nom || '',
                prenom: userData.prenom || '',
                motDePasse: userData.motDePasse,
                type: userData.type || 'fan',
                club: userData.club || null,
                sport: userData.sport || null,
                dateInscription: new Date().toISOString(),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.prenom + ' ' + userData.nom)}&background=random`
            };

            // Ajouter aux utilisateurs
            users.push(newUser);
            this.storage.set('registeredUsers', users);

            // Générer des tokens
            const accessToken = this.generateToken(newUser, '24h');
            const refreshToken = this.generateToken(newUser, '7d');

            // Auto-login
            await this.handleSuccessfulLogin(newUser, accessToken, refreshToken, true);

            this.log(`✅ Inscription réussie: ${newUser.email}`, 'success');
            this.emit('register:success', { user: newUser });

            return { success: true, user: newUser };
        }

        /**
         * DÉCONNEXION
         */
        async logout() {
            this.log('Déconnexion...', 'info');

            const user = this.currentUser;

            // Nettoyer l'état
            this.currentUser = null;
            this.tokens = { access: null, refresh: null };
            this.isAuthenticated = false;

            // Nettoyer le localStorage
            this.storage.remove('user');
            this.storage.remove('accessToken');
            this.storage.remove('refreshToken');
            this.storage.remove('isAuthenticated');
            this.storage.remove('tokenData');

            this.log('✅ Déconnexion réussie', 'success');
            this.emit('logout:success', { user });
            this.core.emit('user:logout', { user });
        }

        /**
         * Rafraîchir le token d'accès
         */
        async refreshAccessToken() {
            try {
                if (!this.tokens.refresh) {
                    throw new Error('Pas de refresh token disponible');
                }

                // Si API disponible
                if (this.config.apiEndpoint && typeof fetch !== 'undefined') {
                    const response = await fetch(`${this.config.apiEndpoint}/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken: this.tokens.refresh })
                    });

                    if (!response.ok) {
                        throw new Error('Token refresh failed');
                    }

                    const data = await response.json();
                    this.tokens.access = data.accessToken;
                    this.storage.set('accessToken', data.accessToken);
                    
                    return true;
                }

                // Sinon, régénérer localement
                const newAccessToken = this.generateToken(this.currentUser, '24h');
                this.tokens.access = newAccessToken;
                this.storage.set('accessToken', newAccessToken);
                this.storage.set('tokenData', {
                    expiresAt: Date.now() + this.config.tokenExpiry
                });

                return true;
            } catch (error) {
                this.log('❌ Refresh token échoué', 'error', error);
                await this.logout();
                return false;
            }
        }

        /**
         * Générer un token (version simplifiée pour démo)
         */
        generateToken(user, duration) {
            const payload = {
                userId: user.id,
                email: user.email,
                exp: Date.now() + (duration === '24h' ? this.config.tokenExpiry : this.config.refreshTokenExpiry)
            };
            return btoa(JSON.stringify(payload)) + '.' + Math.random().toString(36);
        }

        /**
         * Vérifier si l'utilisateur est connecté
         */
        isLoggedIn() {
            return this.isAuthenticated && this.currentUser !== null;
        }

        /**
         * Obtenir l'utilisateur actuel
         */
        getCurrentUser() {
            return this.currentUser;
        }

        /**
         * Obtenir le token d'accès
         */
        getAccessToken() {
            return this.tokens.access;
        }

        /**
         * Middleware pour protéger les pages
         */
        requireAuth(redirectTo = 'inscription.html') {
            if (!this.isLoggedIn()) {
                this.log('⚠️ Accès non autorisé, redirection...', 'warning');
                window.location.href = redirectTo;
                return false;
            }
            return true;
        }
    }

    // Export global
    global.PaieCashFan = global.PaieCashFan || {};
    global.PaieCashFan.AuthPersistentModule = AuthPersistentModule;

    // Auto-enregistrement si Core est disponible
    if (global.PaieCashFan.core) {
        global.PaieCashFan.core.registerModule('AuthPersistent', AuthPersistentModule);
    }

})(window);
