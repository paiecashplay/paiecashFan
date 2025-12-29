/**
 * PAIECASHFAN SDK v1.0
 * SDK JavaScript pour intégrer les widgets PaieCashFan
 * 
 * Usage:
 * <script src="https://sdk.paiecashfan.com/paiecashfan-sdk.js"></script>
 * 
 * PaieCashFan.Wallet.init({ container: '#wallet', userId: '123' });
 */

(function(window) {
    'use strict';

    // Configuration globale
    const CONFIG = {
        widgetBaseUrl: 'https://widgets.paiecashfan.com',
        apiBaseUrl: 'https://api.paiecashfan.com',
        version: '1.0.0',
        debug: false
    };

    // Classe principale
    class PaieCashFanSDK {
        constructor() {
            this.widgets = new Map();
            this.config = { ...CONFIG };
        }

        /**
         * Configurer le SDK globalement
         * @param {Object} options 
         */
        configure(options = {}) {
            this.config = { ...this.config, ...options };
            if (this.config.debug) {
                console.log('[PaieCashFan SDK] Configuration:', this.config);
            }
        }

        /**
         * Logger
         */
        log(...args) {
            if (this.config.debug) {
                console.log('[PaieCashFan SDK]', ...args);
            }
        }

        error(...args) {
            console.error('[PaieCashFan SDK]', ...args);
        }
    }

    // Module Wallet
    class WalletModule {
        constructor(sdk) {
            this.sdk = sdk;
            this.instances = new Map();
        }

        /**
         * Initialiser widget Wallet
         * @param {Object} options 
         * @param {string} options.container - Sélecteur CSS du conteneur
         * @param {string} options.userId - ID utilisateur
         * @param {string} [options.theme='dark'] - Thème (dark/light)
         * @param {Function} [options.onTransaction] - Callback transaction
         * @param {Function} [options.onReady] - Callback ready
         * @returns {Object} Instance widget
         */
        init(options = {}) {
            const {
                container,
                userId,
                theme = 'dark',
                width = '100%',
                height = '600px',
                onTransaction,
                onReady,
                onError
            } = options;

            // Validation
            if (!container) {
                this.sdk.error('Container requis');
                return null;
            }
            if (!userId) {
                this.sdk.error('userId requis');
                return null;
            }

            const containerEl = document.querySelector(container);
            if (!containerEl) {
                this.sdk.error(`Container ${container} introuvable`);
                return null;
            }

            // Créer iframe
            const iframe = document.createElement('iframe');
            iframe.src = `${this.sdk.config.widgetBaseUrl}/wallet-widget.html?userId=${userId}&theme=${theme}`;
            iframe.style.width = width;
            iframe.style.height = height;
            iframe.style.border = 'none';
            iframe.style.borderRadius = '20px';
            iframe.setAttribute('allow', 'payment');
            
            containerEl.appendChild(iframe);

            // Instance widget
            const instance = {
                id: `wallet-${Date.now()}`,
                iframe,
                container: containerEl,
                userId,
                
                // Méthodes publiques
                refresh: () => {
                    iframe.contentWindow.postMessage({
                        target: 'paiecashfan-wallet',
                        action: 'refresh'
                    }, '*');
                },
                
                updateBalance: (balance) => {
                    iframe.contentWindow.postMessage({
                        target: 'paiecashfan-wallet',
                        action: 'updateBalance',
                        balance
                    }, '*');
                },
                
                destroy: () => {
                    containerEl.removeChild(iframe);
                    this.instances.delete(instance.id);
                }
            };

            // Écouter messages du widget
            window.addEventListener('message', (event) => {
                if (event.data.source === 'paiecashfan-wallet') {
                    const { action, data } = event.data;
                    
                    switch(action) {
                        case 'ready':
                            this.sdk.log('Wallet widget ready:', data);
                            if (onReady) onReady(data);
                            break;
                        case 'transaction':
                            this.sdk.log('Transaction:', data);
                            if (onTransaction) onTransaction(data);
                            break;
                        case 'error':
                            this.sdk.error('Wallet error:', data);
                            if (onError) onError(data);
                            break;
                    }
                }
            });

            this.instances.set(instance.id, instance);
            this.sdk.log('Wallet widget initialized:', instance.id);
            
            return instance;
        }

        /**
         * Obtenir instance par ID
         */
        getInstance(id) {
            return this.instances.get(id);
        }

        /**
         * Détruire toutes les instances
         */
        destroyAll() {
            this.instances.forEach(instance => instance.destroy());
        }
    }

    // Module eSIM
    class eSIMModule {
        constructor(sdk) {
            this.sdk = sdk;
            this.instances = new Map();
        }

        init(options = {}) {
            const {
                container,
                userId,
                width = '100%',
                height = '400px',
                onActivation,
                onReady
            } = options;

            if (!container || !userId) {
                this.sdk.error('Container et userId requis');
                return null;
            }

            const containerEl = document.querySelector(container);
            if (!containerEl) {
                this.sdk.error(`Container ${container} introuvable`);
                return null;
            }

            const iframe = document.createElement('iframe');
            iframe.src = `${this.sdk.config.widgetBaseUrl}/esim-widget.html?userId=${userId}`;
            iframe.style.width = width;
            iframe.style.height = height;
            iframe.style.border = 'none';
            iframe.style.borderRadius = '20px';
            
            containerEl.appendChild(iframe);

            const instance = {
                id: `esim-${Date.now()}`,
                iframe,
                container: containerEl,
                userId,
                destroy: () => {
                    containerEl.removeChild(iframe);
                    this.instances.delete(instance.id);
                }
            };

            // Écouter messages
            window.addEventListener('message', (event) => {
                if (event.data.source === 'paiecashfan-esim') {
                    const { action, data } = event.data;
                    
                    switch(action) {
                        case 'ready':
                            if (onReady) onReady(data);
                            break;
                        case 'activation':
                            if (onActivation) onActivation(data);
                            break;
                    }
                }
            });

            this.instances.set(instance.id, instance);
            return instance;
        }
    }

    // Module Shop
    class ShopModule {
        constructor(sdk) {
            this.sdk = sdk;
            this.instances = new Map();
        }

        init(options = {}) {
            const {
                container,
                club,
                width = '100%',
                height = '800px',
                onPurchase,
                onReady
            } = options;

            if (!container || !club) {
                this.sdk.error('Container et club requis');
                return null;
            }

            const containerEl = document.querySelector(container);
            if (!containerEl) {
                this.sdk.error(`Container ${container} introuvable`);
                return null;
            }

            const iframe = document.createElement('iframe');
            iframe.src = `${this.sdk.config.widgetBaseUrl}/shop-widget.html?club=${encodeURIComponent(club)}`;
            iframe.style.width = width;
            iframe.style.height = height;
            iframe.style.border = 'none';
            iframe.style.borderRadius = '20px';
            
            containerEl.appendChild(iframe);

            const instance = {
                id: `shop-${Date.now()}`,
                iframe,
                container: containerEl,
                club,
                destroy: () => {
                    containerEl.removeChild(iframe);
                    this.instances.delete(instance.id);
                }
            };

            // Écouter messages
            window.addEventListener('message', (event) => {
                if (event.data.source === 'paiecashfan-shop') {
                    const { action, data } = event.data;
                    
                    switch(action) {
                        case 'ready':
                            if (onReady) onReady(data);
                            break;
                        case 'purchase':
                            if (onPurchase) onPurchase(data);
                            break;
                    }
                }
            });

            this.instances.set(instance.id, instance);
            return instance;
        }
    }

    // Initialiser SDK
    const sdk = new PaieCashFanSDK();

    // Exporter vers window
    window.PaieCashFan = {
        version: CONFIG.version,
        config: (options) => sdk.configure(options),
        Wallet: new WalletModule(sdk),
        eSIM: new eSIMModule(sdk),
        Shop: new ShopModule(sdk)
    };

    // Log initialisation
    console.log(`%c PaieCashFan SDK v${CONFIG.version} `, 'background: linear-gradient(135deg, #10b981 0%, #8b5cf6 100%); color: white; font-weight: bold; padding: 5px 10px; border-radius: 5px;');

})(window);
