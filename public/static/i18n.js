/**
 * PaieCashFan i18n System
 * Multi-language support for 11 languages
 * 
 * Supported languages:
 * FR (Français), EN (English), ES (Español), PT (Português)
 * AR (العربية), DE (Deutsch), IT (Italiano), NL (Nederlands)
 * ZH (中文), JA (日本語), KO (한국어)
 */

class I18nManager {
    constructor() {
        this.currentLang = this.getSavedLanguage() || 'fr';
        this.translations = {};
        this.languages = [
            { code: 'fr', name: 'Français', flag: '🇫🇷' },
            { code: 'en', name: 'English', flag: '🇬🇧' },
            { code: 'es', name: 'Español', flag: '🇪🇸' },
            { code: 'pt', name: 'Português', flag: '🇵🇹' },
            { code: 'ar', name: 'العربية', flag: '🇸🇦' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
            { code: 'it', name: 'Italiano', flag: '🇮🇹' },
            { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
            { code: 'zh', name: '中文', flag: '🇨🇳' },
            { code: 'ja', name: '日本語', flag: '🇯🇵' },
            { code: 'ko', name: '한국어', flag: '🇰🇷' }
        ];
    }

    // Get saved language from localStorage
    getSavedLanguage() {
        return localStorage.getItem('paiecashfan_language');
    }

    // Save language to localStorage
    saveLanguage(lang) {
        localStorage.setItem('paiecashfan_language', lang);
    }

    // Load translation file for specific language
    async loadLanguage(lang) {
        try {
            const response = await fetch(`/i18n/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${lang}.json`);
            }
            this.translations[lang] = await response.json();
            return true;
        } catch (error) {
            console.error(`Error loading language ${lang}:`, error);
            return false;
        }
    }

    // Get translation for a key (supports nested keys like "home.welcome")
    t(key, lang = null) {
        const targetLang = lang || this.currentLang;
        
        if (!this.translations[targetLang]) {
            console.warn(`Translations for ${targetLang} not loaded`);
            return key;
        }

        const keys = key.split('.');
        let value = this.translations[targetLang];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key "${key}" not found for language ${targetLang}`);
                return key;
            }
        }

        return value;
    }

    // Change language and reload translations
    async changeLanguage(lang) {
        if (lang === this.currentLang) {
            return true;
        }

        // Load new language if not already loaded
        if (!this.translations[lang]) {
            const success = await this.loadLanguage(lang);
            if (!success) {
                return false;
            }
        }

        this.currentLang = lang;
        this.saveLanguage(lang);
        
        // Apply RTL for Arabic
        if (lang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', 'ar');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', lang);
        }

        this.updatePageContent();
        return true;
    }

    // Update all page content with current language
    updatePageContent() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        // Update all placeholders with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        // Update all titles with data-i18n-title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        // Trigger custom event for pages that need special handling
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: this.currentLang } 
        }));
    }

    // Create language selector HTML
    createLanguageSelector() {
        const container = document.createElement('div');
        container.className = 'language-selector';
        container.innerHTML = `
            <button class="lang-btn" id="langToggle">
                <i class="fas fa-globe"></i>
                <span class="current-lang">${this.currentLang.toUpperCase()}</span>
            </button>
            <div class="lang-dropdown" id="langDropdown" style="display: none;">
                ${this.languages.map(lang => `
                    <button class="lang-option ${lang.code === this.currentLang ? 'active' : ''}" 
                            data-lang="${lang.code}">
                        <span class="lang-flag">${lang.flag}</span>
                        <span class="lang-name">${lang.name}</span>
                    </button>
                `).join('')}
            </div>
        `;

        // Add event listeners
        const toggle = container.querySelector('#langToggle');
        const dropdown = container.querySelector('#langDropdown');

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });

        container.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', async (e) => {
                e.stopPropagation();
                const lang = option.getAttribute('data-lang');
                const success = await this.changeLanguage(lang);
                if (success) {
                    dropdown.style.display = 'none';
                    toggle.querySelector('.current-lang').textContent = lang.toUpperCase();
                    
                    // Update active state
                    container.querySelectorAll('.lang-option').forEach(opt => {
                        opt.classList.remove('active');
                    });
                    option.classList.add('active');
                }
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });

        return container;
    }

    // Initialize i18n system
    async init() {
        // Load current language
        await this.loadLanguage(this.currentLang);
        
        // Apply RTL if Arabic
        if (this.currentLang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
        }
        document.documentElement.setAttribute('lang', this.currentLang);
        
        // Update content
        this.updatePageContent();
        
        return true;
    }
}

// Global i18n instance
const i18n = new I18nManager();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
    i18n.init();
}
