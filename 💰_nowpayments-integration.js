// ========================================
// MODULE INTÉGRATION NOWPAYMENTS
// PaieCashPlay x NOWPayments
// Documentation: https://documenter.getpostman.com/view/7907941/S1a32n38
// ========================================

/**
 * Configuration NOWPayments
 * IMPORTANT: La clé API doit être récupérée depuis:
 * https://account.nowpayments.io/settings/api-keys
 * 
 * Login: etot@paiecash.com
 * Password: pmC2Mt-Y6hh$Sqa
 */
const NOWPAYMENTS_CONFIG = {
    // API Configuration
    apiBaseURL: 'https://api.nowpayments.io/v1',
    apiKey: 'VOTRE_CLE_API_ICI', // À récupérer depuis le dashboard
    
    // Sandbox pour tests (optionnel)
    sandboxURL: 'https://api-sandbox.nowpayments.io/v1',
    sandboxKey: '', // Clé sandbox pour tests
    
    // Mode production ou test
    production: false, // Mettre à true en production
    
    // IPN (Instant Payment Notification) URL
    ipnCallbackURL: 'https://votre-domaine.com/api/nowpayments/callback',
    
    // Devise par défaut pour les prix
    defaultFiatCurrency: 'EUR'
};

/**
 * Cryptomonnaies supportées populaires
 * Liste complète: https://api.nowpayments.io/v1/currencies
 */
const POPULAR_CRYPTOS = [
    { symbol: 'btc', name: 'Bitcoin', logo: '₿' },
    { symbol: 'eth', name: 'Ethereum', logo: 'Ξ' },
    { symbol: 'usdt', name: 'Tether (USDT)', logo: '₮' },
    { symbol: 'usdc', name: 'USD Coin', logo: 'USDC' },
    { symbol: 'bnb', name: 'Binance Coin', logo: 'BNB' },
    { symbol: 'ltc', name: 'Litecoin', logo: 'Ł' },
    { symbol: 'trx', name: 'TRON', logo: 'TRX' },
    { symbol: 'doge', name: 'Dogecoin', logo: 'Ð' },
    { symbol: 'sol', name: 'Solana', logo: 'SOL' },
    { symbol: 'matic', name: 'Polygon', logo: 'MATIC' }
];

/**
 * Cache des cryptos disponibles
 */
let availableCurrencies = [];
let estimatedPrices = {};

/**
 * Récupère la liste des cryptomonnaies disponibles
 * @returns {Promise<Array>} Liste des cryptos
 */
async function getAvailableCurrencies() {
    try {
        const apiURL = NOWPAYMENTS_CONFIG.production 
            ? NOWPAYMENTS_CONFIG.apiBaseURL 
            : NOWPAYMENTS_CONFIG.sandboxURL;
            
        const response = await fetch(`${apiURL}/currencies`, {
            method: 'GET',
            headers: {
                'x-api-key': NOWPAYMENTS_CONFIG.production 
                    ? NOWPAYMENTS_CONFIG.apiKey 
                    : NOWPAYMENTS_CONFIG.sandboxKey
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }
        
        const data = await response.json();
        availableCurrencies = data.currencies || [];
        console.log(`✅ ${availableCurrencies.length} cryptomonnaies disponibles`);
        
        return availableCurrencies;
    } catch (error) {
        console.error('❌ Erreur chargement cryptos:', error);
        
        // Fallback: retourner les cryptos populaires
        return POPULAR_CRYPTOS.map(c => c.symbol);
    }
}

/**
 * Estime le prix en crypto pour un montant en fiat
 * @param {number} amount - Montant en EUR
 * @param {string} cryptoCurrency - Symbole crypto (ex: 'btc')
 * @returns {Promise<Object>} Estimation du prix
 */
async function estimatePrice(amount, cryptoCurrency = 'btc') {
    try {
        const apiURL = NOWPAYMENTS_CONFIG.production 
            ? NOWPAYMENTS_CONFIG.apiBaseURL 
            : NOWPAYMENTS_CONFIG.sandboxURL;
            
        const params = new URLSearchParams({
            amount: amount,
            currency_from: NOWPAYMENTS_CONFIG.defaultFiatCurrency,
            currency_to: cryptoCurrency
        });
        
        const response = await fetch(`${apiURL}/estimate?${params}`, {
            method: 'GET',
            headers: {
                'x-api-key': NOWPAYMENTS_CONFIG.production 
                    ? NOWPAYMENTS_CONFIG.apiKey 
                    : NOWPAYMENTS_CONFIG.sandboxKey
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Mettre en cache
        estimatedPrices[cryptoCurrency] = {
            amount: amount,
            estimatedAmount: data.estimated_amount,
            currency: cryptoCurrency,
            timestamp: Date.now()
        };
        
        console.log(`💰 ${amount} EUR = ${data.estimated_amount} ${cryptoCurrency.toUpperCase()}`);
        
        return data;
    } catch (error) {
        console.error('❌ Erreur estimation prix:', error);
        return null;
    }
}

/**
 * Crée un paiement NOWPayments
 * @param {Object} orderData - Données de la commande
 * @returns {Promise<Object>} Détails du paiement créé
 */
async function createPayment(orderData) {
    try {
        const {
            priceAmount,      // Montant en EUR
            priceCurrency,    // 'EUR'
            payCurrency,      // Crypto choisie (ex: 'btc')
            orderId,          // ID unique de commande
            orderDescription, // Description
            ipnCallbackUrl,   // URL de callback (optionnel)
            successUrl,       // URL de succès (optionnel)
            cancelUrl         // URL d'annulation (optionnel)
        } = orderData;
        
        const apiURL = NOWPAYMENTS_CONFIG.production 
            ? NOWPAYMENTS_CONFIG.apiBaseURL 
            : NOWPAYMENTS_CONFIG.sandboxURL;
        
        const paymentData = {
            price_amount: priceAmount,
            price_currency: priceCurrency || NOWPAYMENTS_CONFIG.defaultFiatCurrency,
            pay_currency: payCurrency,
            order_id: orderId,
            order_description: orderDescription,
            ipn_callback_url: ipnCallbackUrl || NOWPAYMENTS_CONFIG.ipnCallbackURL,
            success_url: successUrl,
            cancel_url: cancelUrl
        };
        
        console.log('📤 Création paiement NOWPayments:', paymentData);
        
        const response = await fetch(`${apiURL}/payment`, {
            method: 'POST',
            headers: {
                'x-api-key': NOWPAYMENTS_CONFIG.production 
                    ? NOWPAYMENTS_CONFIG.apiKey 
                    : NOWPAYMENTS_CONFIG.sandboxKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erreur HTTP ${response.status}: ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json();
        console.log('✅ Paiement créé:', data);
        
        return data;
    } catch (error) {
        console.error('❌ Erreur création paiement:', error);
        throw error;
    }
}

/**
 * Vérifie le statut d'un paiement
 * @param {string} paymentId - ID du paiement
 * @returns {Promise<Object>} Statut du paiement
 */
async function getPaymentStatus(paymentId) {
    try {
        const apiURL = NOWPAYMENTS_CONFIG.production 
            ? NOWPAYMENTS_CONFIG.apiBaseURL 
            : NOWPAYMENTS_CONFIG.sandboxURL;
        
        const response = await fetch(`${apiURL}/payment/${paymentId}`, {
            method: 'GET',
            headers: {
                'x-api-key': NOWPAYMENTS_CONFIG.production 
                    ? NOWPAYMENTS_CONFIG.apiKey 
                    : NOWPAYMENTS_CONFIG.sandboxKey
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔍 Statut paiement:', data.payment_status);
        
        return data;
    } catch (error) {
        console.error('❌ Erreur vérification statut:', error);
        return null;
    }
}

/**
 * Affiche le modal de sélection de crypto
 * @param {number} totalAmount - Montant total en EUR
 * @param {Function} onCryptoSelected - Callback quand crypto sélectionnée
 */
async function showCryptoSelectionModal(totalAmount, onCryptoSelected) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    title.textContent = '💰 Payer en Cryptomonnaie';
    
    body.innerHTML = `
        <div style="max-width: 600px;">
            <div style="background: rgba(16,185,129,0.1); padding: 20px; border-radius: 15px; margin-bottom: 25px; text-align: center;">
                <div style="font-size: 18px; font-weight: 700; margin-bottom: 10px;">Total à payer</div>
                <div style="font-size: 36px; font-weight: 900; color: #10b981;">${totalAmount.toFixed(2)} €</div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 15px; opacity: 0.9;">
                    🌟 Cryptomonnaies Populaires
                </h4>
                <div id="crypto-list-popular" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                    <div style="text-align: center; padding: 20px;">
                        <div class="spinner" style="border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #10b981; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                        <p style="margin-top: 15px; opacity: 0.7;">Chargement...</p>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
                <button class="btn btn-secondary" onclick="closeModal()" style="width: 100%;">
                    Annuler
                </button>
            </div>
        </div>
        
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .crypto-card {
                background: rgba(255,255,255,0.1);
                border: 2px solid rgba(255,255,255,0.2);
                border-radius: 12px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
            }
            
            .crypto-card:hover {
                border-color: #10b981;
                background: rgba(16,185,129,0.2);
                transform: scale(1.05);
            }
            
            .crypto-card .logo {
                font-size: 32px;
                margin-bottom: 8px;
            }
            
            .crypto-card .name {
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 5px;
            }
            
            .crypto-card .estimate {
                font-size: 12px;
                opacity: 0.8;
            }
        </style>
    `;
    
    modal.classList.add('active');
    
    // Charger les cryptos populaires avec estimation
    try {
        const popularList = document.getElementById('crypto-list-popular');
        popularList.innerHTML = '';
        
        for (const crypto of POPULAR_CRYPTOS) {
            // Estimer le prix
            const estimation = await estimatePrice(totalAmount, crypto.symbol);
            
            const card = document.createElement('div');
            card.className = 'crypto-card';
            card.innerHTML = `
                <div class="logo">${crypto.logo}</div>
                <div class="name">${crypto.name}</div>
                <div class="estimate">
                    ${estimation ? `~${parseFloat(estimation.estimated_amount).toFixed(8)}` : 'Calcul...'}
                </div>
            `;
            
            card.onclick = () => {
                onCryptoSelected(crypto.symbol, estimation);
                closeModal();
            };
            
            popularList.appendChild(card);
        }
    } catch (error) {
        console.error('Erreur chargement cryptos:', error);
    }
}

/**
 * Affiche le modal de paiement crypto
 * @param {Object} paymentData - Données du paiement créé
 */
function showCryptoPaymentModal(paymentData) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    title.textContent = '💳 Paiement Cryptomonnaie';
    
    const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${paymentData.pay_address}`;
    
    body.innerHTML = `
        <div style="max-width: 600px; text-align: center;">
            <div style="background: rgba(16,185,129,0.1); padding: 25px; border-radius: 15px; margin-bottom: 25px;">
                <div style="font-size: 16px; margin-bottom: 10px; opacity: 0.9;">Montant à payer</div>
                <div style="font-size: 42px; font-weight: 900; color: #10b981; margin-bottom: 5px;">
                    ${paymentData.pay_amount} ${paymentData.pay_currency.toUpperCase()}
                </div>
                <div style="font-size: 14px; opacity: 0.7;">
                    ≈ ${paymentData.price_amount} ${paymentData.price_currency}
                </div>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 15px; margin-bottom: 25px; display: inline-block;">
                <img src="${qrCodeURL}" alt="QR Code" style="width: 250px; height: 250px; display: block;">
            </div>
            
            <div style="background: rgba(59,130,246,0.1); padding: 20px; border-radius: 15px; margin-bottom: 25px; text-align: left;">
                <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 15px;">📋 Adresse de paiement</h4>
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; font-family: 'Courier New', monospace; word-break: break-all; font-size: 13px; margin-bottom: 15px;">
                    ${paymentData.pay_address}
                </div>
                <button class="btn" onclick="navigator.clipboard.writeText('${paymentData.pay_address}'); alert('✅ Adresse copiée !')" style="width: 100%; background: linear-gradient(135deg, #3b82f6, #2563eb);">
                    📋 Copier l'adresse
                </button>
            </div>
            
            <div style="background: rgba(239,68,68,0.1); padding: 20px; border-radius: 15px; margin-bottom: 25px; text-align: left;">
                <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 10px;">⚠️ Important</h4>
                <ul style="font-size: 14px; line-height: 1.8; padding-left: 20px; opacity: 0.9;">
                    <li>Envoyez EXACTEMENT ${paymentData.pay_amount} ${paymentData.pay_currency.toUpperCase()}</li>
                    <li>Réseau : ${paymentData.pay_currency.toUpperCase()}</li>
                    <li>Le paiement sera confirmé après les confirmations blockchain</li>
                    <li>Ne fermez pas cette page pendant le paiement</li>
                </ul>
            </div>
            
            <div id="payment-status" style="background: rgba(59,130,246,0.1); padding: 20px; border-radius: 15px; margin-bottom: 25px;">
                <div style="font-size: 16px; font-weight: 700; margin-bottom: 15px;">
                    ⏳ En attente du paiement...
                </div>
                <div style="font-size: 14px; opacity: 0.8;">
                    Nous vérifions automatiquement la blockchain.
                </div>
            </div>
            
            <button class="btn btn-secondary" onclick="closeModal()" style="width: 100%;">
                Fermer
            </button>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Vérifier le statut toutes les 10 secondes
    const statusInterval = setInterval(async () => {
        const status = await getPaymentStatus(paymentData.payment_id);
        updatePaymentStatus(status, statusInterval);
    }, 10000);
}

/**
 * Met à jour l'affichage du statut de paiement
 * @param {Object} status - Statut du paiement
 * @param {number} interval - ID de l'interval à arrêter si terminé
 */
function updatePaymentStatus(status, interval) {
    const statusDiv = document.getElementById('payment-status');
    if (!statusDiv) return;
    
    const statusMessages = {
        'waiting': { icon: '⏳', text: 'En attente du paiement...', color: 'rgba(59,130,246,0.1)' },
        'confirming': { icon: '🔄', text: 'Paiement en cours de confirmation...', color: 'rgba(251,191,36,0.1)' },
        'confirmed': { icon: '✅', text: 'Paiement confirmé !', color: 'rgba(16,185,129,0.1)' },
        'finished': { icon: '🎉', text: 'Paiement terminé avec succès !', color: 'rgba(16,185,129,0.1)' },
        'failed': { icon: '❌', text: 'Paiement échoué', color: 'rgba(239,68,68,0.1)' },
        'refunded': { icon: '↩️', text: 'Paiement remboursé', color: 'rgba(239,68,68,0.1)' },
        'expired': { icon: '⏱️', text: 'Paiement expiré', color: 'rgba(239,68,68,0.1)' }
    };
    
    const statusInfo = statusMessages[status.payment_status] || statusMessages['waiting'];
    
    statusDiv.style.background = statusInfo.color;
    statusDiv.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">${statusInfo.icon}</div>
        <div style="font-size: 18px; font-weight: 700; margin-bottom: 10px;">
            ${statusInfo.text}
        </div>
        <div style="font-size: 14px; opacity: 0.8;">
            Statut : ${status.payment_status}
        </div>
    `;
    
    // Arrêter la vérification si terminé
    if (['finished', 'failed', 'refunded', 'expired'].includes(status.payment_status)) {
        clearInterval(interval);
        
        if (status.payment_status === 'finished') {
            setTimeout(() => {
                alert('✅ Paiement confirmé ! Merci pour votre achat.');
                closeModal();
                // Vider le panier
                if (typeof state !== 'undefined') {
                    state.produitsSelectionnes = [];
                    if (typeof updatePanier === 'function') updatePanier();
                }
            }, 2000);
        }
    }
}

/**
 * Initialise le module NOWPayments
 */
async function initNOWPayments() {
    console.log('🚀 Initialisation NOWPayments...');
    
    try {
        // Charger les cryptos disponibles
        await getAvailableCurrencies();
        
        console.log('✅ NOWPayments initialisé avec succès');
    } catch (error) {
        console.error('❌ Erreur initialisation NOWPayments:', error);
    }
}

// Initialiser au chargement de la page
if (typeof window !== 'undefined') {
    window.addEventListener('load', initNOWPayments);
}

// Export des fonctions pour utilisation
if (typeof window !== 'undefined') {
    window.NOWPayments = {
        showCryptoSelectionModal,
        createPayment,
        getPaymentStatus,
        estimatePrice,
        getAvailableCurrencies
    };
}
