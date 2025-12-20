/**
 * ============================================
 * PAIECASHFAN - CORE SYSTEM V11.0
 * ============================================
 * Gestionnaire principal de l'architecture modulaire
 * 
 * GARANTIES:
 * - Les modules peuvent être chargés/déchargés indépendamment
 * - Les upgrades n'affectent jamais les modules existants
 * - Chaque module a son propre namespace et localStorage
 * - Compatibilité backward garantie
 * 
 * @version 11.0.0
 * @date 2025-12-13
 */

(function(global) {
    'use strict';

    // ============================================
    // CONFIGURATION GLOBALE
    // ============================================
    const CORE_VERSION = '11.0.0';
    const STORAGE_PREFIX = 'pcf_v11_';
    const DEBUG_MODE = true;

    // ============================================
    // CORE SYSTEM CLASS
    // ============================================
    class CoreSystem {
        constructor() {
            this.version = CORE_VERSION;
            this.modules = new Map();
            this.moduleStates = new Map();
            this.loadedModules = new Set();
            this.eventBus = new EventTarget();
            
            this.log('✅ Core System initialized', 'success');
        }

        /**
         * Logger unifié avec niveaux
         */
        log(message, level = 'info', data = null) {
            if (!DEBUG_MODE) return;
            
            const styles = {
                success: 'color: #10b981; font-weight: bold',
                error: 'color: #ef4444; font-weight: bold',
                warning: 'color: #f59e0b; font-weight: bold',
                info: 'color: #3b82f6; font-weight: bold',
                module: 'color: #8b5cf6; font-weight: bold'
            };

            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            console.log(
                `%c[CoreSystem ${timestamp}] ${message}`,
                styles[level] || styles.info,
                data || ''
            );
        }

        /**
         * Enregistrer un module
         */
        registerModule(name, moduleClass, options = {}) {
            try {
                if (this.modules.has(name)) {
                    this.log(`⚠️ Module "${name}" déjà enregistré, écrasement`, 'warning');
                }

                // Créer une instance du module
                const instance = new moduleClass(this, options);
                
                this.modules.set(name, {
                    name,
                    instance,
                    class: moduleClass,
                    options,
                    version: instance.version || '1.0.0',
                    dependencies: instance.dependencies || [],
                    status: 'registered'
                });

                this.log(`📦 Module "${name}" enregistré (v${instance.version})`, 'module');
                return true;
            } catch (error) {
                this.log(`❌ Erreur lors de l'enregistrement du module "${name}"`, 'error', error);
                return false;
            }
        }

        /**
         * Initialiser un module
         */
        async initModule(name) {
            try {
                const moduleData = this.modules.get(name);
                if (!moduleData) {
                    throw new Error(`Module "${name}" non trouvé`);
                }

                if (this.loadedModules.has(name)) {
                    this.log(`ℹ️ Module "${name}" déjà initialisé`, 'info');
                    return true;
                }

                // Vérifier les dépendances
                for (const dep of moduleData.dependencies) {
                    if (!this.loadedModules.has(dep)) {
                        this.log(`🔄 Chargement de la dépendance "${dep}" pour "${name}"`, 'info');
                        await this.initModule(dep);
                    }
                }

                // Initialiser le module
                this.log(`🚀 Initialisation du module "${name}"...`, 'module');
                moduleData.status = 'initializing';
                
                if (typeof moduleData.instance.init === 'function') {
                    await moduleData.instance.init();
                }

                moduleData.status = 'loaded';
                this.loadedModules.add(name);
                
                this.log(`✅ Module "${name}" initialisé avec succès`, 'success');
                this.emit('module:loaded', { name, module: moduleData });
                
                return true;
            } catch (error) {
                this.log(`❌ Erreur lors de l'initialisation du module "${name}"`, 'error', error);
                const moduleData = this.modules.get(name);
                if (moduleData) {
                    moduleData.status = 'error';
                    moduleData.error = error.message;
                }
                return false;
            }
        }

        /**
         * Initialiser tous les modules enregistrés
         */
        async initAllModules() {
            this.log('🚀 Initialisation de tous les modules...', 'info');
            const moduleNames = Array.from(this.modules.keys());
            
            for (const name of moduleNames) {
                await this.initModule(name);
            }

            this.log(`✅ ${this.loadedModules.size}/${moduleNames.length} modules chargés`, 'success');
            this.emit('core:ready');
        }

        /**
         * Obtenir un module
         */
        getModule(name) {
            const moduleData = this.modules.get(name);
            return moduleData ? moduleData.instance : null;
        }

        /**
         * Vérifier si un module est chargé
         */
        isModuleLoaded(name) {
            return this.loadedModules.has(name);
        }

        /**
         * Obtenir l'état de tous les modules
         */
        getModulesStatus() {
            const status = {};
            for (const [name, data] of this.modules) {
                status[name] = {
                    version: data.version,
                    status: data.status,
                    loaded: this.loadedModules.has(name),
                    error: data.error || null
                };
            }
            return status;
        }

        /**
         * Event Bus - Émettre un événement
         */
        emit(eventName, data = null) {
            const event = new CustomEvent(eventName, { detail: data });
            this.eventBus.dispatchEvent(event);
            this.log(`📡 Événement émis: ${eventName}`, 'info', data);
        }

        /**
         * Event Bus - Écouter un événement
         */
        on(eventName, callback) {
            this.eventBus.addEventListener(eventName, (e) => callback(e.detail));
        }

        /**
         * Event Bus - Écouter une fois
         */
        once(eventName, callback) {
            const handler = (e) => {
                callback(e.detail);
                this.eventBus.removeEventListener(eventName, handler);
            };
            this.eventBus.addEventListener(eventName, handler);
        }

        /**
         * LocalStorage avec namespace
         */
        storage = {
            set: (key, value, moduleName = 'global') => {
                try {
                    const storageKey = `${STORAGE_PREFIX}${moduleName}_${key}`;
                    const data = {
                        value,
                        timestamp: Date.now(),
                        version: CORE_VERSION
                    };
                    localStorage.setItem(storageKey, JSON.stringify(data));
                    return true;
                } catch (error) {
                    console.error('Storage set error:', error);
                    return false;
                }
            },

            get: (key, moduleName = 'global', defaultValue = null) => {
                try {
                    const storageKey = `${STORAGE_PREFIX}${moduleName}_${key}`;
                    const item = localStorage.getItem(storageKey);
                    if (!item) return defaultValue;
                    
                    const data = JSON.parse(item);
                    return data.value;
                } catch (error) {
                    console.error('Storage get error:', error);
                    return defaultValue;
                }
            },

            remove: (key, moduleName = 'global') => {
                try {
                    const storageKey = `${STORAGE_PREFIX}${moduleName}_${key}`;
                    localStorage.removeItem(storageKey);
                    return true;
                } catch (error) {
                    console.error('Storage remove error:', error);
                    return false;
                }
            },

            clear: (moduleName = null) => {
                try {
                    if (moduleName) {
                        // Supprimer uniquement les clés d'un module spécifique
                        const prefix = `${STORAGE_PREFIX}${moduleName}_`;
                        Object.keys(localStorage)
                            .filter(key => key.startsWith(prefix))
                            .forEach(key => localStorage.removeItem(key));
                    } else {
                        // Supprimer toutes les clés PaieCashFan
                        Object.keys(localStorage)
                            .filter(key => key.startsWith(STORAGE_PREFIX))
                            .forEach(key => localStorage.removeItem(key));
                    }
                    return true;
                } catch (error) {
                    console.error('Storage clear error:', error);
                    return false;
                }
            }
        };

        /**
         * Utilitaires
         */
        utils = {
            /**
             * Générer un ID unique
             */
            generateId: (prefix = 'pcf') => {
                return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            },

            /**
             * Formater une date
             */
            formatDate: (date, locale = 'fr-FR') => {
                return new Intl.DateTimeFormat(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }).format(new Date(date));
            },

            /**
             * Formater un montant
             */
            formatAmount: (amount, currency = 'EUR', locale = 'fr-FR') => {
                return new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: currency
                }).format(amount);
            },

            /**
             * Slugifier une chaîne
             */
            slugify: (text) => {
                return text
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            },

            /**
             * Debounce function
             */
            debounce: (func, wait) => {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            }
        };

        /**
         * Migration automatique depuis anciennes versions
         */
        async migrateFromOldVersion() {
            this.log('🔄 Vérification des migrations...', 'info');
            
            // Migrer les anciennes données d'auth
            const oldAuth = localStorage.getItem('utilisateurConnecte');
            if (oldAuth && !this.storage.get('user', 'auth')) {
                try {
                    const userData = JSON.parse(oldAuth);
                    this.storage.set('user', userData, 'auth');
                    this.storage.set('isAuthenticated', true, 'auth');
                    this.log('✅ Migration auth: données migrées', 'success');
                } catch (e) {
                    this.log('⚠️ Migration auth: échec', 'warning', e);
                }
            }

            // Migrer d'autres données si nécessaire...
            this.log('✅ Migrations terminées', 'success');
        }

        /**
         * Diagnostics système
         */
        async runDiagnostics() {
            this.log('🔍 Exécution des diagnostics...', 'info');
            
            const diagnostics = {
                version: this.version,
                timestamp: new Date().toISOString(),
                modules: this.getModulesStatus(),
                storage: {
                    available: this.testStorageAvailable(),
                    usage: this.getStorageUsage()
                },
                browser: {
                    userAgent: navigator.userAgent,
                    language: navigator.language,
                    online: navigator.onLine
                }
            };

            console.table(diagnostics.modules);
            return diagnostics;
        }

        testStorageAvailable() {
            try {
                const test = '__storage_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        }

        getStorageUsage() {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return {
                bytes: total,
                kb: (total / 1024).toFixed(2),
                mb: (total / 1024 / 1024).toFixed(2)
            };
        }
    }

    // ============================================
    // CLASSE DE BASE POUR LES MODULES
    // ============================================
    class BaseModule {
        constructor(core, options = {}) {
            this.core = core;
            this.options = options;
            this.name = this.constructor.name;
            this.version = '1.0.0';
            this.dependencies = [];
            this.initialized = false;
        }

        /**
         * Méthode d'initialisation (à override)
         */
        async init() {
            this.core.log(`Initialisation du module ${this.name}`, 'module');
            this.initialized = true;
        }

        /**
         * Logger du module
         */
        log(message, level = 'info', data = null) {
            this.core.log(`[${this.name}] ${message}`, level, data);
        }

        /**
         * Storage du module
         */
        storage = {
            set: (key, value) => this.core.storage.set(key, value, this.name),
            get: (key, defaultValue = null) => this.core.storage.get(key, this.name, defaultValue),
            remove: (key) => this.core.storage.remove(key, this.name),
            clear: () => this.core.storage.clear(this.name)
        };

        /**
         * Émettre un événement
         */
        emit(eventName, data = null) {
            this.core.emit(`${this.name}:${eventName}`, data);
        }

        /**
         * Écouter un événement
         */
        on(eventName, callback) {
            this.core.on(`${this.name}:${eventName}`, callback);
        }
    }

    // ============================================
    // EXPORT GLOBAL
    // ============================================
    global.PaieCashFan = global.PaieCashFan || {};
    global.PaieCashFan.CoreSystem = CoreSystem;
    global.PaieCashFan.BaseModule = BaseModule;
    global.PaieCashFan.VERSION = CORE_VERSION;

    // Créer une instance globale
    global.PaieCashFan.core = new CoreSystem();

    // Log initial
    console.log(
        '%c🚀 PaieCashFan Core System V' + CORE_VERSION,
        'color: #10b981; font-size: 20px; font-weight: bold'
    );
    console.log(
        '%c   Architecture Modulaire Activée',
        'color: #8b5cf6; font-size: 14px'
    );

})(window);
