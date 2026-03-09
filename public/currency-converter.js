// ========================================
// CONVERTISSEUR DE DEVISES - PaieCashFan
// Affiche les prix en devise locale + EUR
// ========================================

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
            // Fallback EUR
            this.currencyInfo = { currency: 'EUR', symbol: '€', name: 'Euro', rate: 1, flag: '🇪🇺' };
        }
        return this.currencyInfo;
    },
    
    // Convertir un montant EUR en devise locale
    convert(amountEUR) {
        if (!this.currencyInfo || this.currencyInfo.currency === 'EUR') {
            return { local: amountEUR, localFormatted: `${amountEUR.toFixed(2)} €`, eur: amountEUR, eurFormatted: `${amountEUR.toFixed(2)} €`, isEUR: true };
        }
        const localAmount = amountEUR * this.currencyInfo.rate;
        const localFormatted = this.formatAmount(localAmount, this.currencyInfo);
        return {
            local: localAmount,
            localFormatted,
            eur: amountEUR,
            eurFormatted: `${amountEUR.toFixed(2)} €`,
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
        
        // Devises sans décimales
        const noDecimalCurrencies = ['XOF', 'XAF', 'NGN', 'GHS', 'KES', 'TZS', 'UGX', 'RWF', 'BIF', 'CDF', 'MGA', 'GNF', 'SLL', 'MWK', 'ZMW', 'ETB', 'DJF', 'KMF', 'LRD', 'SOS', 'SDG', 'YER', 'IRR', 'VND', 'IDR', 'KRW', 'JPY', 'MNT', 'UZS', 'KHR', 'LAK', 'MMK', 'PYG', 'VEF', 'AOA', 'MZN', 'HTG', 'COP', 'CLP'];
        
        if (noDecimalCurrencies.includes(currency)) {
            return `${Math.round(amount).toLocaleString('fr-FR')} ${symbol}`;
        }
        return `${amount.toFixed(2)} ${symbol}`;
    },
    
    // Afficher le prix avec conversion dans un élément HTML
    displayPrice(element, amountEUR) {
        const result = this.convert(amountEUR);
        if (result.isEUR) {
            element.textContent = result.eurFormatted;
        } else {
            element.innerHTML = `
                <span class="price-local">${result.localFormatted}</span>
                <span class="price-eur">(${result.eurFormatted})</span>
            `;
        }
    },
    
    // Obtenir le badge de devise pour affichage dans le header
    getCurrencyBadge() {
        if (!this.currencyInfo || this.currencyInfo.currency === 'EUR') return '';
        return `<span class="currency-badge">${this.currencyInfo.flag} ${this.currencyInfo.currency} · Taux: 1€ = ${this.formatAmount(this.currencyInfo.rate, this.currencyInfo)}</span>`;
    }
};

// CSS pour les prix convertis
const currencyStyle = document.createElement('style');
currencyStyle.textContent = `
    .price-local {
        font-weight: bold;
        font-size: 1.1em;
    }
    .price-eur {
        font-size: 0.8em;
        opacity: 0.7;
        margin-left: 4px;
    }
    .currency-badge {
        display: inline-block;
        background: rgba(255,255,255,0.15);
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 20px;
        padding: 4px 12px;
        font-size: 0.8em;
        margin-left: 10px;
        vertical-align: middle;
    }
    .currency-info-bar {
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 8px 16px;
        margin: 8px 0;
        font-size: 0.85em;
        text-align: center;
        border: 1px solid rgba(255,255,255,0.2);
    }
`;
document.head.appendChild(currencyStyle);
