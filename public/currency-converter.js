/**
 * CurrencyConverter — Conversion universelle de devises pour PaieCashFan
 * Fonctionne pour TOUS les clubs (français et étrangers)
 * Appelle /api/currency/rates pour obtenir le taux en temps réel
 */

const CurrencyConverter = {
    currencyInfo: null,

    // Initialiser et charger le taux de change
    async init(club, league) {
        try {
            const params = new URLSearchParams();
            if (club) params.set('club', club);
            if (league) params.set('league', league);
            const response = await fetch(`/api/currency/rates?${params}`);
            if (response.ok) {
                this.currencyInfo = await response.json();
            }
        } catch (e) {
            this.currencyInfo = { currency: 'EUR', symbol: '€', name: 'Euro', rate: 1, flag: '🇪🇺' };
        }
        return this.currencyInfo;
    },

    // Vérifier si la devise est EUR
    isEur() {
        return !this.currencyInfo || this.currencyInfo.currency === 'EUR';
    },

    // Convertir un montant EUR en devise locale
    convert(amountEUR) {
        if (this.isEur()) {
            const f = this.formatAmount(amountEUR, { currency: 'EUR', symbol: '€' });
            return { local: amountEUR, localFormatted: f, eur: amountEUR, eurFormatted: f, isEUR: true };
        }
        const localAmount = amountEUR * this.currencyInfo.rate;
        const localFormatted = this.formatAmount(localAmount, this.currencyInfo);
        const eurFormatted = this.formatAmount(amountEUR, { currency: 'EUR', symbol: '€' });
        return {
            local: localAmount,
            localFormatted,
            eur: amountEUR,
            eurFormatted,
            isEUR: false,
            currency: this.currencyInfo.currency,
            symbol: this.currencyInfo.symbol,
            flag: this.currencyInfo.flag
        };
    },

    // Formater un montant selon la devise
    formatAmount(amount, info) {
        const currency = info ? info.currency : 'EUR';
        const symbol = info ? info.symbol : '€';
        const noDecimal = ['XOF','XAF','NGN','GHS','KES','TZS','UGX','RWF','BIF','CDF','MGA',
            'GNF','SLL','MWK','ZMW','ETB','DJF','KMF','LRD','SOS','SDG','VND','IDR','KRW','JPY',
            'MNT','UZS','KHR','LAK','MMK','PYG','AOA','MZN','HTG','COP','CLP','IRR'];
        if (noDecimal.includes(currency)) {
            return `${Math.round(amount).toLocaleString('fr-FR')} ${symbol}`;
        }
        return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
    },

    // Afficher le prix avec conversion dans un élément HTML
    displayPrice(element, amountEUR) {
        const result = this.convert(amountEUR);
        if (result.isEUR) {
            element.innerHTML = `<span class="price-local">${result.localFormatted}</span>`;
        } else {
            element.innerHTML = `<span class="price-local">${result.localFormatted}</span> <span class="price-eur">(${result.eurFormatted})</span>`;
        }
    },

    // Obtenir le badge de devise pour affichage dans le header
    getCurrencyBadge() {
        if (this.isEur()) return '';
        const info = this.currencyInfo;
        return `<span class="currency-badge">${info.flag} ${info.symbol} · Taux: 1€ = ${this.formatAmount(info.rate, info)}</span>`;
    },

    // Bannière de conversion
    getConversionBanner() {
        if (this.isEur()) return '';
        const info = this.currencyInfo;
        return `<div class="currency-info-bar">${info.flag} Prix affichés en <strong>${info.symbol}</strong> · 1€ = ${this.formatAmount(info.rate, info)}</div>`;
    },

    // ============================================================
    // CONVERSION UNIVERSELLE : convertit tous les montants € dans le DOM
    // ============================================================
    convertAllDomAmounts(container) {
        if (this.isEur()) return; // Pas de conversion pour les clubs français
        const root = container || document;

        // Regex pour détecter un montant en euros : "10 000€", "2€", "2,00 €", "10-20€", "5 000 €"
        const euroRegex = /(\d[\d\s]*(?:[,\.]\d+)?(?:\s*-\s*\d[\d\s]*(?:[,\.]\d+)?)?)\s*€/g;

        const convertText = (text) => {
            return text.replace(euroRegex, (match, numStr) => {
                // Gérer les plages "10-20€"
                if (numStr.includes('-')) {
                    const parts = numStr.split('-').map(s => parseFloat(s.replace(/\s/g,'').replace(',','.')));
                    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                        const c1 = this.convert(parts[0]);
                        const c2 = this.convert(parts[1]);
                        return `${c1.localFormatted}-${c2.localFormatted} <span style="opacity:0.65;font-size:0.85em">(${parts[0]}-${parts[1]} €)</span>`;
                    }
                }
                const clean = numStr.replace(/\s/g,'').replace(',','.');
                const num = parseFloat(clean);
                if (isNaN(num) || num === 0) return match;
                const c = this.convert(num);
                return `${c.localFormatted} <span style="opacity:0.65;font-size:0.85em">(${c.eurFormatted})</span>`;
            });
        };

        // Parcourir tous les noeuds texte du DOM
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                // Ignorer les scripts, styles, et noeuds déjà convertis
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                const tag = parent.tagName;
                if (['SCRIPT','STYLE','NOSCRIPT','TEMPLATE'].includes(tag)) return NodeFilter.FILTER_REJECT;
                if (parent.dataset && parent.dataset.converted) return NodeFilter.FILTER_REJECT;
                if (node.textContent && node.textContent.includes('€')) return NodeFilter.FILTER_ACCEPT;
                return NodeFilter.FILTER_SKIP;
            }
        });

        const nodesToConvert = [];
        let node;
        while ((node = walker.nextNode())) {
            nodesToConvert.push(node);
        }

        nodesToConvert.forEach(textNode => {
            const parent = textNode.parentElement;
            if (!parent || parent.dataset.converted) return;
            const original = parent.innerHTML;
            const converted = convertText(original);
            if (converted !== original) {
                parent.innerHTML = converted;
                parent.dataset.converted = 'true';
            }
        });
    },

    // Initialiser et convertir automatiquement toute la page
    async autoConvert(club, league) {
        const params = new URLSearchParams(window.location.search);
        const c = club || params.get('club') || '';
        const l = league || params.get('league') || '';
        await this.init(c, l);
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.convertAllDomAmounts());
        } else {
            this.convertAllDomAmounts();
        }
        return this.currencyInfo;
    }
};

// CSS pour les prix convertis
const _currencyStyle = document.createElement('style');
_currencyStyle.textContent = `
    .price-local { font-weight: bold; }
    .price-eur { font-size: 0.8em; opacity: 0.7; margin-left: 4px; }
    .currency-badge {
        display: inline-block;
        background: rgba(255,255,255,0.15);
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 20px;
        padding: 4px 12px;
        font-size: 0.8em;
        margin-left: 10px;
        vertical-align: middle;
        color: #fff;
    }
    .currency-info-bar {
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 8px 16px;
        margin: 8px 0;
        font-size: 0.85em;
        text-align: center;
        border: 1px solid rgba(255,255,255,0.2);
        color: rgba(255,255,255,0.9);
    }
`;
document.head.appendChild(_currencyStyle);
