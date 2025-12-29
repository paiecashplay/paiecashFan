// 🪙 PAIECASH COIN PAYMENT SYSTEM
// Système de paiement universel pour tous les clubs et fédérations
// Supporte : PaieCash Coin, CB, BNPL, Stablecoins, Crypto

const PAIECASH_PAYMENT_CONFIG = {
    version: '1.0.0',
    api: {
        baseUrl: '/api',
        endpoints: {
            createPayment: '/payments/create',
            verifyPayment: '/payments/verify',
            processRefund: '/payments/refund',
            getWallet: '/wallet',
            createWallet: '/wallet/create'
        }
    },
    currencies: {
        // Monnaie principale
        paiecashCoin: {
            code: 'PCC',
            symbol: '💰',
            name: 'PaieCash Coin',
            decimals: 2,
            primary: true
        },
        // Crypto & Stablecoins
        bitcoin: { code: 'BTC', symbol: '₿', name: 'Bitcoin', decimals: 8 },
        ethereum: { code: 'ETH', symbol: 'Ξ', name: 'Ethereum', decimals: 6 },
        usdc: { code: 'USDC', symbol: 'USDC', name: 'USD Coin', decimals: 2 },
        usdt: { code: 'USDT', symbol: 'USDT', name: 'Tether', decimals: 2 },
        // Fiat
        eur: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
        usd: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 }
    },
    paymentMethods: {
        paiecashCoin: {
            id: 'paiecash-coin',
            name: 'PaieCash Coin',
            icon: '💰',
            enabled: true,
            instant: true,
            cashback: 5, // 5% cashback
            priority: 1
        },
        creditCard: {
            id: 'credit-card',
            name: 'Carte Bancaire',
            icon: '💳',
            enabled: true,
            instant: true,
            cashback: 0,
            priority: 2,
            providers: ['Visa', 'Mastercard', 'Amex']
        },
        bnpl: {
            id: 'bnpl',
            name: 'Payer en 3/4 fois',
            icon: '📅',
            enabled: true,
            instant: false,
            cashback: 2,
            priority: 3,
            minAmount: 50,
            providers: ['Klarna', 'Alma', 'PayPal']
        },
        crypto: {
            id: 'crypto',
            name: 'Crypto / Stablecoin',
            icon: '₿',
            enabled: true,
            instant: true,
            cashback: 3,
            priority: 4,
            supported: ['BTC', 'ETH', 'USDC', 'USDT']
        },
        prepaidCard: {
            id: 'prepaid-card',
            name: 'Carte Prépayée PaieCash',
            icon: '🎫',
            enabled: true,
            instant: true,
            cashback: 7, // 7% cashback pour cartes prépayées
            priority: 0
        }
    },
    fees: {
        paiecashCoin: 0, // Pas de frais
        creditCard: 1.5, // 1.5%
        bnpl: 2.5, // 2.5%
        crypto: 1, // 1%
        prepaidCard: 0 // Pas de frais
    }
};

/**
 * Classe principale pour gérer les paiements PaieCash Coin
 */
class PaieCashPaymentSystem {
    constructor(clubId, federationId = null) {
        this.clubId = clubId;
        this.federationId = federationId;
        this.walletBalance = 0;
        this.initialized = false;
    }

    /**
     * Initialise le système de paiement
     */
    async initialize() {
        try {
            console.log('💰 Initialisation PaieCash Payment System...');
            
            // Récupérer le wallet de l'utilisateur
            const wallet = await this.getOrCreateWallet();
            this.walletBalance = wallet.balance;
            this.initialized = true;
            
            console.log(`✅ Wallet chargé: ${this.formatAmount(this.walletBalance)} PCC`);
            return true;
        } catch (error) {
            console.error('❌ Erreur initialisation paiement:', error);
            return false;
        }
    }

    /**
     * Récupère ou crée un wallet pour l'utilisateur
     */
    async getOrCreateWallet() {
        const userId = this.getUserId();
        
        // Vérifier si le wallet existe dans localStorage
        const cachedWallet = localStorage.getItem(`wallet_${userId}`);
        if (cachedWallet) {
            return JSON.parse(cachedWallet);
        }

        // Sinon, créer un nouveau wallet
        const newWallet = {
            userId: userId,
            balance: 0,
            currency: 'PCC',
            clubTokens: {},
            cryptoBalances: {},
            cards: [],
            createdAt: new Date().toISOString()
        };

        localStorage.setItem(`wallet_${userId}`, JSON.stringify(newWallet));
        console.log('✅ Nouveau wallet créé automatiquement');
        
        return newWallet;
    }

    /**
     * Obtient l'ID utilisateur (ou génère un ID temporaire)
     */
    getUserId() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', userId);
        }
        return userId;
    }

    /**
     * Crée une session de paiement
     */
    async createPayment(amount, description, productId = null) {
        if (!this.initialized) {
            await this.initialize();
        }

        const payment = {
            id: 'pay_' + Math.random().toString(36).substr(2, 12),
            amount: amount,
            currency: 'PCC',
            description: description,
            productId: productId,
            clubId: this.clubId,
            federationId: this.federationId,
            status: 'pending',
            createdAt: new Date().toISOString(),
            availableMethods: this.getAvailablePaymentMethods(amount)
        };

        return payment;
    }

    /**
     * Récupère les méthodes de paiement disponibles
     */
    getAvailablePaymentMethods(amount) {
        const methods = [];

        Object.entries(PAIECASH_PAYMENT_CONFIG.paymentMethods).forEach(([key, method]) => {
            if (!method.enabled) return;
            
            // Vérifier le montant minimum pour BNPL
            if (method.id === 'bnpl' && amount < method.minAmount) return;
            
            methods.push({
                id: method.id,
                name: method.name,
                icon: method.icon,
                cashback: method.cashback,
                fee: PAIECASH_PAYMENT_CONFIG.fees[key] || 0,
                instant: method.instant,
                priority: method.priority
            });
        });

        // Trier par priorité
        return methods.sort((a, b) => a.priority - b.priority);
    }

    /**
     * Traite un paiement avec la méthode sélectionnée
     */
    async processPayment(paymentId, methodId, paymentDetails = {}) {
        console.log(`💳 Traitement paiement: ${paymentId} via ${methodId}`);

        // Simuler l'API de paiement
        await this.simulatePaymentDelay();

        const method = PAIECASH_PAYMENT_CONFIG.paymentMethods[methodId];
        if (!method) {
            throw new Error('Méthode de paiement invalide');
        }

        // Vérifier le solde pour PaieCash Coin
        if (methodId === 'paiecashCoin') {
            const amount = paymentDetails.amount;
            if (this.walletBalance < amount) {
                throw new Error('Solde insuffisant');
            }

            // Débiter le wallet
            this.walletBalance -= amount;
            this.saveWalletBalance();

            // Ajouter le cashback
            const cashback = (amount * method.cashback) / 100;
            this.walletBalance += cashback;
            this.saveWalletBalance();

            console.log(`✅ Paiement réussi ! Cashback: ${this.formatAmount(cashback)} PCC`);
        }

        return {
            success: true,
            paymentId: paymentId,
            method: methodId,
            timestamp: new Date().toISOString(),
            cashback: method.cashback
        };
    }

    /**
     * Affiche le modal de paiement
     */
    showPaymentModal(payment) {
        const modal = this.createPaymentModalHTML(payment);
        
        // Insérer dans le DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modal;
        document.body.appendChild(modalContainer);

        // Ajouter les event listeners
        this.attachPaymentModalEvents(payment);
    }

    /**
     * Crée le HTML du modal de paiement
     */
    createPaymentModalHTML(payment) {
        const methods = payment.availableMethods;
        
        return `
        <div id="paiecashPaymentModal" class="paiecash-modal">
            <div class="paiecash-modal-content">
                <div class="paiecash-modal-header">
                    <h2>💰 Paiement PaieCash</h2>
                    <button class="close-modal" onclick="closePaieCashModal()">&times;</button>
                </div>
                
                <div class="paiecash-modal-body">
                    <div class="payment-summary">
                        <h3>${payment.description}</h3>
                        <div class="amount">${this.formatAmount(payment.amount)} PCC</div>
                    </div>

                    <div class="wallet-balance">
                        <span>💼 Solde actuel:</span>
                        <strong>${this.formatAmount(this.walletBalance)} PCC</strong>
                    </div>

                    <div class="payment-methods">
                        <h4>Choisissez votre moyen de paiement :</h4>
                        ${methods.map(method => this.createMethodHTML(method, payment)).join('')}
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    /**
     * Crée le HTML d'une méthode de paiement
     */
    createMethodHTML(method, payment) {
        const feeAmount = (payment.amount * method.fee) / 100;
        const cashbackAmount = (payment.amount * method.cashback) / 100;

        return `
        <div class="payment-method-card" data-method="${method.id}">
            <div class="method-icon">${method.icon}</div>
            <div class="method-info">
                <h5>${method.name}</h5>
                ${method.cashback > 0 ? `<span class="cashback">+${method.cashback}% cashback (${this.formatAmount(cashbackAmount)} PCC)</span>` : ''}
                ${method.fee > 0 ? `<span class="fee">Frais: ${this.formatAmount(feeAmount)} PCC</span>` : '<span class="no-fee">Sans frais</span>'}
                ${method.instant ? '<span class="instant">⚡ Instantané</span>' : ''}
            </div>
            <button class="select-method-btn" data-method="${method.id}">
                Choisir
            </button>
        </div>
        `;
    }

    /**
     * Attache les événements au modal
     */
    attachPaymentModalEvents(payment) {
        const buttons = document.querySelectorAll('.select-method-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const methodId = e.target.getAttribute('data-method');
                try {
                    const result = await this.processPayment(payment.id, methodId, {
                        amount: payment.amount
                    });
                    
                    if (result.success) {
                        this.showSuccessMessage(result);
                        this.closePaieCashModal();
                    }
                } catch (error) {
                    this.showErrorMessage(error.message);
                }
            });
        });
    }

    /**
     * Formate un montant pour l'affichage
     */
    formatAmount(amount) {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    /**
     * Sauvegarde le solde du wallet
     */
    saveWalletBalance() {
        const userId = this.getUserId();
        const wallet = JSON.parse(localStorage.getItem(`wallet_${userId}`) || '{}');
        wallet.balance = this.walletBalance;
        wallet.updatedAt = new Date().toISOString();
        localStorage.setItem(`wallet_${userId}`, JSON.stringify(wallet));
    }

    /**
     * Simule un délai de traitement
     */
    async simulatePaymentDelay() {
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    /**
     * Affiche un message de succès
     */
    showSuccessMessage(result) {
        alert(`✅ Paiement réussi !\nMéthode: ${result.method}\nCashback: ${result.cashback}%`);
    }

    /**
     * Affiche un message d'erreur
     */
    showErrorMessage(message) {
        alert(`❌ Erreur: ${message}`);
    }

    /**
     * Ferme le modal de paiement
     */
    closePaieCashModal() {
        const modal = document.getElementById('paiecashPaymentModal');
        if (modal) {
            modal.remove();
        }
    }
}

// Fonction globale pour fermer le modal
function closePaieCashModal() {
    const modal = document.getElementById('paiecashPaymentModal');
    if (modal) {
        modal.remove();
    }
}

// CSS pour le modal de paiement
const PAIECASH_MODAL_STYLES = `
<style>
.paiecash-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.paiecash-modal-content {
    background: linear-gradient(135deg, #1a1f2e 0%, #2d1b4e 100%);
    border-radius: 20px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    border: 2px solid rgba(16, 185, 129, 0.3);
}

.paiecash-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 2px solid rgba(16, 185, 129, 0.2);
}

.paiecash-modal-header h2 {
    margin: 0;
    color: #10b981;
    font-size: 24px;
    font-weight: 700;
}

.close-modal {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    font-size: 28px;
    cursor: pointer;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.close-modal:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: rotate(90deg);
}

.paiecash-modal-body {
    padding: 24px;
}

.payment-summary {
    text-align: center;
    margin-bottom: 24px;
    padding: 20px;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 12px;
    border: 2px solid rgba(16, 185, 129, 0.3);
}

.payment-summary h3 {
    color: white;
    margin: 0 0 12px 0;
    font-size: 18px;
}

.payment-summary .amount {
    font-size: 32px;
    font-weight: 900;
    background: linear-gradient(135deg, #10b981 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.wallet-balance {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: rgba(139, 92, 246, 0.1);
    border-radius: 10px;
    margin-bottom: 24px;
    border: 1px solid rgba(139, 92, 246, 0.3);
}

.wallet-balance span {
    color: #e0e0e0;
}

.wallet-balance strong {
    color: #8b5cf6;
    font-size: 20px;
}

.payment-methods h4 {
    color: white;
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
}

.payment-method-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    margin-bottom: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.payment-method-card:hover {
    background: rgba(16, 185, 129, 0.1);
    border-color: #10b981;
    transform: translateX(5px);
}

.method-icon {
    font-size: 32px;
    min-width: 50px;
    text-align: center;
}

.method-info {
    flex: 1;
}

.method-info h5 {
    color: white;
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
}

.method-info span {
    display: block;
    font-size: 13px;
    margin: 4px 0;
}

.cashback {
    color: #10b981;
    font-weight: 600;
}

.fee {
    color: #f59e0b;
}

.no-fee {
    color: #10b981;
}

.instant {
    color: #8b5cf6;
}

.select-method-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.select-method-btn:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
}
</style>
`;

// Injecter les styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('div');
    styleSheet.innerHTML = PAIECASH_MODAL_STYLES;
    document.head.appendChild(styleSheet.firstElementChild);
}

console.log('✅ PaieCash Coin Payment System chargé');
