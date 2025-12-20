/**
 * ========================================
 * 🔌 PAIECASHFAN WIDGET SDK V1.0
 * ========================================
 * SDK embeddable pour intégrer PaieCashFan sur sites de clubs
 * 
 * USAGE SUR SITE DU CLUB :
 * 
 * <script src="https://paiecashfan.com/sdk/paiecashfan-widget.js"></script>
 * <div id="paiecashfan-widget" 
 *      data-club="marseille" 
 *      data-theme="light">
 * </div>
 * 
 * @version 1.0.0
 * @author PaieCashFan Team
 */

(function(window, document) {
    'use strict';

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        API_BASE_URL: 'https://paiecashfan.com/api',
        AUTH_URL: 'https://paiecashfan.com/auth',
        WIDGET_VERSION: '1.0.0'
    };

    // ========================================
    // WIDGET CLASS
    // ========================================
    class PaieCashFanWidget {
        constructor(container, options = {}) {
            this.container = container;
            this.options = {
                club: options.club || container.dataset.club || 'default',
                theme: options.theme || container.dataset.theme || 'light',
                mode: options.mode || container.dataset.mode || 'compact', // compact, full
                showShop: options.showShop !== false,
                showWallet: options.showWallet !== false,
                showSocial: options.showSocial !== false
            };

            this.isAuthenticated = false;
            this.currentUser = null;

            this.init();
        }

        init() {
            console.log(`[PaieCashFan Widget] Initializing for club: ${this.options.club}`);
            
            // Injecter CSS
            this.injectStyles();
            
            // Créer UI
            this.render();
            
            // Charger état auth depuis PaieCashFan
            this.checkAuthStatus();
        }

        injectStyles() {
            if (document.getElementById('paiecashfan-widget-styles')) {
                return; // Already injected
            }

            const styles = `
                .pcf-widget {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    max-width: 400px;
                    background: white;
                }

                .pcf-widget.dark {
                    background: #1f2937;
                    color: white;
                }

                .pcf-widget-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    text-align: center;
                }

                .pcf-widget-header h3 {
                    margin: 0 0 5px 0;
                    font-size: 18px;
                    font-weight: 600;
                }

                .pcf-widget-header p {
                    margin: 0;
                    font-size: 13px;
                    opacity: 0.9;
                }

                .pcf-widget-body {
                    padding: 20px;
                }

                .pcf-auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .pcf-input {
                    padding: 12px 15px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: all 0.3s;
                }

                .pcf-input:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .pcf-btn {
                    padding: 12px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .pcf-btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .pcf-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                }

                .pcf-btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                }

                .pcf-user-profile {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .pcf-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 18px;
                }

                .pcf-user-info {
                    flex: 1;
                }

                .pcf-user-name {
                    font-weight: 600;
                    margin-bottom: 3px;
                }

                .pcf-user-email {
                    font-size: 12px;
                    color: #6b7280;
                }

                .pcf-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-top: 15px;
                }

                .pcf-action-btn {
                    padding: 12px;
                    border: 2px solid #e5e7eb;
                    background: white;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .pcf-action-btn:hover {
                    border-color: #667eea;
                    transform: translateY(-2px);
                }

                .pcf-action-icon {
                    font-size: 24px;
                }

                .pcf-action-label {
                    font-size: 12px;
                    font-weight: 600;
                }

                .pcf-footer {
                    padding: 15px;
                    border-top: 1px solid #e5e7eb;
                    text-align: center;
                    font-size: 11px;
                    color: #9ca3af;
                }

                .pcf-footer a {
                    color: #667eea;
                    text-decoration: none;
                }

                .pcf-alert {
                    padding: 10px;
                    border-radius: 6px;
                    font-size: 13px;
                    margin-bottom: 12px;
                }

                .pcf-alert-success {
                    background: #d1fae5;
                    color: #065f46;
                }

                .pcf-alert-error {
                    background: #fee2e2;
                    color: #991b1b;
                }

                .pcf-loading {
                    text-align: center;
                    padding: 20px;
                }

                .pcf-spinner {
                    border: 3px solid #f3f4f6;
                    border-top: 3px solid #667eea;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    animation: pcf-spin 1s linear infinite;
                    margin: 0 auto;
                }

                @keyframes pcf-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;

            const styleSheet = document.createElement('style');
            styleSheet.id = 'paiecashfan-widget-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        render() {
            const themeClass = this.options.theme === 'dark' ? 'dark' : '';
            
            this.container.innerHTML = `
                <div class="pcf-widget ${themeClass}">
                    <div class="pcf-widget-header">
                        <h3>⚽ PaieCashFan</h3>
                        <p>Votre club, vos avantages</p>
                    </div>
                    <div class="pcf-widget-body" id="pcf-widget-content">
                        <div class="pcf-loading">
                            <div class="pcf-spinner"></div>
                            <p style="margin-top: 10px; font-size: 13px;">Chargement...</p>
                        </div>
                    </div>
                    <div class="pcf-footer">
                        Propulsé par <a href="https://paiecashfan.com" target="_blank">PaieCashFan</a>
                    </div>
                </div>
            `;
        }

        async checkAuthStatus() {
            try {
                // Vérifier si utilisateur est déjà connecté
                const response = await fetch(`${CONFIG.API_BASE_URL}/auth/status`, {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.authenticated) {
                        this.isAuthenticated = true;
                        this.currentUser = data.user;
                        this.renderAuthenticatedView();
                    } else {
                        this.renderLoginView();
                    }
                } else {
                    this.renderLoginView();
                }
            } catch (error) {
                console.error('[PaieCashFan Widget] Auth check failed:', error);
                this.renderLoginView();
            }
        }

        renderLoginView() {
            const content = document.getElementById('pcf-widget-content');
            
            content.innerHTML = `
                <div id="pcf-alert"></div>
                <form class="pcf-auth-form" onsubmit="return false;">
                    <input 
                        type="email" 
                        id="pcf-email" 
                        class="pcf-input" 
                        placeholder="Email" 
                        required
                    >
                    <input 
                        type="password" 
                        id="pcf-password" 
                        class="pcf-input" 
                        placeholder="Mot de passe" 
                        required
                    >
                    <button 
                        type="button" 
                        class="pcf-btn pcf-btn-primary" 
                        id="pcf-login-btn"
                    >
                        Se connecter
                    </button>
                    <button 
                        type="button" 
                        class="pcf-btn pcf-btn-secondary" 
                        id="pcf-register-btn"
                    >
                        S'inscrire
                    </button>
                </form>
            `;

            // Attach event listeners
            document.getElementById('pcf-login-btn').addEventListener('click', () => this.handleLogin());
            document.getElementById('pcf-register-btn').addEventListener('click', () => this.handleRegister());
        }

        renderAuthenticatedView() {
            const content = document.getElementById('pcf-widget-content');
            
            const initials = this.currentUser.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase();

            content.innerHTML = `
                <div class="pcf-user-profile">
                    <div class="pcf-avatar">${initials}</div>
                    <div class="pcf-user-info">
                        <div class="pcf-user-name">${this.currentUser.name}</div>
                        <div class="pcf-user-email">${this.currentUser.email}</div>
                    </div>
                </div>
                
                ${this.renderActions()}
                
                <button 
                    class="pcf-btn pcf-btn-secondary" 
                    id="pcf-logout-btn" 
                    style="width: 100%; margin-top: 15px;"
                >
                    Se déconnecter
                </button>
            `;

            document.getElementById('pcf-logout-btn').addEventListener('click', () => this.handleLogout());
            
            // Attach action buttons
            document.querySelectorAll('.pcf-action-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action;
                    this.handleAction(action);
                });
            });
        }

        renderActions() {
            const actions = [];

            if (this.options.showShop) {
                actions.push({
                    icon: '🛍️',
                    label: 'Boutique',
                    action: 'shop'
                });
            }

            if (this.options.showWallet) {
                actions.push({
                    icon: '💰',
                    label: 'Wallet',
                    action: 'wallet'
                });
            }

            if (this.options.showSocial) {
                actions.push({
                    icon: '📱',
                    label: 'Social',
                    action: 'social'
                });
            }

            actions.push({
                icon: '🎟️',
                label: 'Billetterie',
                action: 'tickets'
            });

            return `
                <div class="pcf-actions">
                    ${actions.map(a => `
                        <div class="pcf-action-btn" data-action="${a.action}">
                            <span class="pcf-action-icon">${a.icon}</span>
                            <span class="pcf-action-label">${a.label}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        showAlert(message, type = 'success') {
            const alert = document.getElementById('pcf-alert');
            if (alert) {
                alert.innerHTML = `<div class="pcf-alert pcf-alert-${type}">${message}</div>`;
                setTimeout(() => {
                    alert.innerHTML = '';
                }, 3000);
            }
        }

        async handleLogin() {
            const email = document.getElementById('pcf-email').value;
            const password = document.getElementById('pcf-password').value;

            if (!email || !password) {
                this.showAlert('Veuillez remplir tous les champs', 'error');
                return;
            }

            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        email,
                        password,
                        club: this.options.club
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    this.isAuthenticated = true;
                    this.currentUser = data.user;
                    this.renderAuthenticatedView();
                    this.showAlert('✅ Connexion réussie !', 'success');
                    
                    // Trigger custom event
                    this.dispatchEvent('login', data.user);
                } else {
                    this.showAlert('❌ ' + (data.error || 'Erreur de connexion'), 'error');
                }
            } catch (error) {
                console.error('[PaieCashFan Widget] Login error:', error);
                this.showAlert('❌ Erreur de connexion', 'error');
            }
        }

        async handleRegister() {
            // Rediriger vers page d'inscription complète
            window.open(`${CONFIG.AUTH_URL}?club=${this.options.club}&action=register`, '_blank');
        }

        async handleLogout() {
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (response.ok) {
                    this.isAuthenticated = false;
                    this.currentUser = null;
                    this.renderLoginView();
                    this.showAlert('✅ Déconnexion réussie', 'success');
                    
                    // Trigger custom event
                    this.dispatchEvent('logout');
                }
            } catch (error) {
                console.error('[PaieCashFan Widget] Logout error:', error);
                this.showAlert('❌ Erreur de déconnexion', 'error');
            }
        }

        handleAction(action) {
            console.log(`[PaieCashFan Widget] Action: ${action}`);
            
            // Trigger custom event
            this.dispatchEvent('action', { action, club: this.options.club });

            // Open action in new window
            const urls = {
                shop: `${CONFIG.API_BASE_URL}/shop/${this.options.club}`,
                wallet: `${CONFIG.API_BASE_URL}/wallet`,
                social: `${CONFIG.API_BASE_URL}/social`,
                tickets: `${CONFIG.API_BASE_URL}/tickets/${this.options.club}`
            };

            if (urls[action]) {
                window.open(urls[action], '_blank');
            }
        }

        dispatchEvent(eventName, detail = {}) {
            const event = new CustomEvent(`paiecashfan:${eventName}`, {
                detail: {
                    ...detail,
                    club: this.options.club,
                    user: this.currentUser
                }
            });
            window.dispatchEvent(event);
        }

        // Public API
        getUser() {
            return this.currentUser;
        }

        isLoggedIn() {
            return this.isAuthenticated;
        }
    }

    // ========================================
    // AUTO-INITIALIZATION
    // ========================================
    function initWidgets() {
        const widgets = document.querySelectorAll('[id^="paiecashfan-widget"]');
        
        widgets.forEach(container => {
            if (!container.dataset.initialized) {
                new PaieCashFanWidget(container);
                container.dataset.initialized = 'true';
            }
        });
    }

    // Init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidgets);
    } else {
        initWidgets();
    }

    // Export to window
    window.PaieCashFanWidget = PaieCashFanWidget;

    console.log('[PaieCashFan Widget SDK] v' + CONFIG.WIDGET_VERSION + ' loaded');

})(window, document);
