// Triple-A Payment Integration V6.0
// Solution de paiement crypto pour e-commerce clubs/fédérations
// https://www.triple-a.io/ecommerce-stores

class TripleAPayment {
    constructor(config = {}) {
        this.merchantKey = config.merchantKey || '';
        this.testMode = config.testMode !== false; // Mode test par défaut
        this.apiUrl = this.testMode 
            ? 'https://api.sandbox.triple-a.io/api/v2' 
            : 'https://api.triple-a.io/api/v2';
        
        // Cryptos supportées
        this.supportedCryptos = [
            { code: 'BTC', name: 'Bitcoin', icon: '₿' },
            { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
            { code: 'USDT', name: 'Tether', icon: '₮' },
            { code: 'USDC', name: 'USD Coin', icon: '$' },
            { code: 'BNB', name: 'Binance Coin', icon: 'BNB' },
            { code: 'LTC', name: 'Litecoin', icon: 'Ł' },
            { code: 'DAI', name: 'Dai', icon: '◈' },
            { code: 'BUSD', name: 'Binance USD', icon: '$' }
        ];
    }

    // Créer une facture de paiement
    async createPayment(orderData) {
        if (this.testMode) {
            // Mode démo : simuler la création d'une facture
            return new Promise((resolve) => {
                setTimeout(() => {
                    const paymentId = 'DEMO_' + Date.now();
                    resolve({
                        success: true,
                        payment: {
                            id: paymentId,
                            status: 'pending',
                            amount: orderData.amount,
                            currency: orderData.currency || 'EUR',
                            crypto_currency: orderData.crypto_currency || 'BTC',
                            order_id: orderData.order_id,
                            merchant_reference: orderData.merchant_reference,
                            payment_url: `https://payment.triple-a.io/checkout/${paymentId}`,
                            qr_code: this.generateQRCode(paymentId),
                            wallet_address: this.generateDemoAddress(orderData.crypto_currency),
                            crypto_amount: this.convertToCrypto(orderData.amount, orderData.crypto_currency),
                            expires_at: Date.now() + (15 * 60 * 1000) // 15 minutes
                        }
                    });
                }, 800);
            });
        }

        // Mode production : appeler l'API Triple-A
        try {
            const response = await fetch(`${this.apiUrl}/payment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.merchantKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'sale',
                    merchant_key: this.merchantKey,
                    order_currency: orderData.currency || 'EUR',
                    order_amount: orderData.amount,
                    crypto_currency: orderData.crypto_currency || 'BTC',
                    payer_email: orderData.email,
                    order_id: orderData.order_id,
                    notify_url: orderData.notify_url,
                    success_url: orderData.success_url,
                    cancel_url: orderData.cancel_url
                })
            });

            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    payment: data.payment
                };
            } else {
                return {
                    success: false,
                    error: data.error || 'Erreur lors de la création du paiement'
                };
            }
        } catch (error) {
            console.error('Erreur Triple-A:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Vérifier le statut d'un paiement
    async checkPaymentStatus(paymentId) {
        if (this.testMode) {
            // Mode démo : simuler la vérification
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Simuler un paiement réussi après 5 secondes
                    const isCompleted = Math.random() > 0.3;
                    resolve({
                        success: true,
                        payment: {
                            id: paymentId,
                            status: isCompleted ? 'completed' : 'pending',
                            updated_at: Date.now()
                        }
                    });
                }, 1000);
            });
        }

        // Mode production : appeler l'API Triple-A
        try {
            const response = await fetch(`${this.apiUrl}/payment/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${this.merchantKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            return {
                success: true,
                payment: data.payment
            };
        } catch (error) {
            console.error('Erreur Triple-A:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Obtenir les taux de change crypto
    async getExchangeRates() {
        if (this.testMode) {
            // Taux fictifs pour la démo
            return {
                success: true,
                rates: {
                    BTC: { EUR: 0.000024, USD: 0.000026 },
                    ETH: { EUR: 0.00038, USD: 0.00041 },
                    USDT: { EUR: 0.92, USD: 1.00 },
                    USDC: { EUR: 0.92, USD: 1.00 },
                    BNB: { EUR: 0.0035, USD: 0.0038 },
                    LTC: { EUR: 0.013, USD: 0.014 },
                    DAI: { EUR: 0.92, USD: 1.00 },
                    BUSD: { EUR: 0.92, USD: 1.00 }
                }
            };
        }

        // Mode production : récupérer les vrais taux
        try {
            const response = await fetch(`${this.apiUrl}/exchange-rates`, {
                headers: {
                    'Authorization': `Bearer ${this.merchantKey}`
                }
            });
            const data = await response.json();
            return {
                success: true,
                rates: data.rates
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Convertir montant fiat en crypto
    async convertToCrypto(amount, cryptoCurrency) {
        const rates = await this.getExchangeRates();
        if (rates.success && rates.rates[cryptoCurrency]) {
            const cryptoAmount = amount * rates.rates[cryptoCurrency].EUR;
            return cryptoAmount.toFixed(8);
        }
        return '0.00000000';
    }

    // Générer QR Code (démo)
    generateQRCode(paymentId) {
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Crect fill='%23fff' width='250' height='250'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23000' font-size='16'%3EQR Code%0A${paymentId}%3C/text%3E%3C/svg%3E`;
    }

    // Générer adresse wallet démo
    generateDemoAddress(crypto) {
        const addresses = {
            BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            ETH: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            BNB: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2',
            LTC: 'LTC1QH9H9FJHP9QWWQQWWQQQQQQQQQQQQQQ',
            DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
        };
        return addresses[crypto] || addresses.BTC;
    }

    // Obtenir les cryptos supportées
    getSupportedCryptos() {
        return this.supportedCryptos;
    }

    // Créer un widget de paiement
    createPaymentWidget(containerId, orderData) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="triple-a-widget" style="
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border-radius: 25px;
                padding: 30px;
                color: white;
                max-width: 500px;
                margin: 0 auto;
            ">
                <h3 style="font-size: 24px; margin-bottom: 20px; text-align: center;">
                    💳 Payer avec Crypto
                </h3>
                
                <div style="margin-bottom: 25px;">
                    <div style="font-size: 16px; opacity: 0.8; margin-bottom: 10px;">Montant</div>
                    <div style="font-size: 36px; font-weight: 900;">${orderData.amount} ${orderData.currency || 'EUR'}</div>
                </div>

                <div style="margin-bottom: 25px;">
                    <div style="font-size: 16px; opacity: 0.8; margin-bottom: 15px;">Choisir une cryptomonnaie</div>
                    <div id="crypto-selector" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                        ${this.supportedCryptos.map(crypto => `
                            <button onclick="tripleA.selectCrypto('${crypto.code}', '${containerId}', ${JSON.stringify(orderData).replace(/"/g, '&quot;')})" style="
                                padding: 15px 10px;
                                background: rgba(255,255,255,0.1);
                                border: 2px solid rgba(255,255,255,0.2);
                                border-radius: 12px;
                                color: white;
                                cursor: pointer;
                                transition: all 0.3s;
                                font-size: 14px;
                                font-weight: 600;
                            " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                                <div style="font-size: 24px; margin-bottom: 5px;">${crypto.icon}</div>
                                ${crypto.code}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div id="payment-info-${containerId}" style="display: none;">
                    <!-- Les infos de paiement apparaîtront ici -->
                </div>
            </div>
        `;
    }

    // Sélectionner une crypto et afficher les infos de paiement
    async selectCrypto(cryptoCode, containerId, orderData) {
        const infoDiv = document.getElementById(`payment-info-${containerId}`);
        
        // Afficher le chargement
        infoDiv.style.display = 'block';
        infoDiv.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <div style="font-size: 48px; animation: spin 1s linear infinite;">⏳</div>
                <div style="margin-top: 15px;">Génération du paiement...</div>
            </div>
        `;

        // Créer le paiement
        const payment = await this.createPayment({
            ...orderData,
            crypto_currency: cryptoCode
        });

        if (payment.success) {
            infoDiv.innerHTML = `
                <div style="border-top: 2px solid rgba(255,255,255,0.1); padding-top: 25px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 16px; opacity: 0.8; margin-bottom: 10px;">Montant en ${cryptoCode}</div>
                        <div style="font-size: 32px; font-weight: 900; color: #FFD700;">
                            ${payment.payment.crypto_amount} ${cryptoCode}
                        </div>
                    </div>

                    <div style="text-align: center; margin: 25px 0;">
                        <img src="${payment.payment.qr_code}" alt="QR Code" style="max-width: 200px; border-radius: 15px;">
                    </div>

                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin: 20px 0;">
                        <div style="font-size: 14px; opacity: 0.8; margin-bottom: 8px;">Adresse de paiement</div>
                        <div style="font-size: 12px; word-break: break-all; font-family: monospace;">
                            ${payment.payment.wallet_address}
                        </div>
                    </div>

                    <button onclick="tripleA.checkPayment('${payment.payment.id}')" style="
                        width: 100%;
                        padding: 16px;
                        background: linear-gradient(135deg, #11998e, #38ef7d);
                        border: none;
                        border-radius: 15px;
                        color: white;
                        font-size: 16px;
                        font-weight: 700;
                        cursor: pointer;
                        margin-top: 15px;
                    ">
                        ✓ Vérifier le paiement
                    </button>

                    <div style="text-align: center; font-size: 13px; opacity: 0.7; margin-top: 15px;">
                        Expire dans 15 minutes
                    </div>
                </div>
            `;
        } else {
            infoDiv.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #ef4444;">
                    ❌ Erreur: ${payment.error}
                </div>
            `;
        }
    }

    // Vérifier le paiement
    async checkPayment(paymentId) {
        const result = await this.checkPaymentStatus(paymentId);
        
        if (result.success) {
            if (result.payment.status === 'completed') {
                alert('✅ Paiement confirmé ! Merci pour votre achat.');
                window.location.reload();
            } else {
                alert('⏳ Paiement en attente. Veuillez patienter...');
            }
        } else {
            alert('❌ Erreur lors de la vérification du paiement.');
        }
    }
}

// Instance globale
window.tripleA = new TripleAPayment({ testMode: true });

console.log('✅ Triple-A Payment Integration V6.0 chargé');
console.log('💳 Cryptos supportées:', window.tripleA.getSupportedCryptos().map(c => c.code).join(', '));
