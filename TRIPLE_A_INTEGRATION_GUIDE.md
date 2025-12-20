# 💳 Guide d'Intégration Triple-A Payment API

## 📚 Documentation Postman fournie
Lien : `https://static.triple-a.io/assets/triple-a-io/Payment_API_Documentation_New.postman_collection.json`

---

## ✅ INTÉGRATION ACTUELLE (Mode Démo)

### 📍 Fichier : `js/triple-a-payment.js`

L'intégration Triple-A est **déjà fonctionnelle en mode sandbox/démo** dans l'application.

### 🪙 Cryptomonnaies supportées (8)
```javascript
const supportedCryptos = [
    { code: 'BTC', name: 'Bitcoin', icon: '₿' },
    { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
    { code: 'USDT', name: 'Tether', icon: '₮' },
    { code: 'USDC', name: 'USD Coin', icon: '$' },
    { code: 'BNB', name: 'Binance Coin', icon: '🔶' },
    { code: 'LTC', name: 'Litecoin', icon: 'Ł' },
    { code: 'DAI', name: 'Dai', icon: '◈' },
    { code: 'BUSD', name: 'Binance USD', icon: '$' }
];
```

---

## 🔧 CONFIGURATION ACTUELLE (SANDBOX)

### Code dans `js/triple-a-payment.js` :
```javascript
class TripleAPayment {
    constructor(config = {}) {
        this.merchantKey = config.merchantKey || '';
        this.testMode = config.testMode !== false; // Mode test par défaut
        this.apiUrl = this.testMode 
            ? 'https://api.sandbox.triple-a.io/api/v2' 
            : 'https://api.triple-a.io/api/v2';
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
        
        // Mode production : appel API réel
        try {
            const response = await fetch(`${this.apiUrl}/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.merchantKey}`
                },
                body: JSON.stringify({
                    merchant_key: this.merchantKey,
                    order_currency: orderData.currency || 'EUR',
                    order_amount: orderData.amount,
                    payer_currency: orderData.crypto_currency,
                    order_id: orderData.order_id,
                    merchant_reference: orderData.merchant_reference,
                    success_url: orderData.success_url,
                    cancel_url: orderData.cancel_url,
                    notify_url: orderData.notify_url
                })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erreur API Triple-A:', error);
            return { success: false, error: error.message };
        }
    }
}
```

---

## 🚀 PASSER EN MODE PRODUCTION

### Étape 1 : Créer un compte Triple-A
1. Allez sur [https://www.triple-a.io/](https://www.triple-a.io/)
2. Cliquez sur **"Get Started"** ou **"Sign Up"**
3. Remplissez le formulaire d'inscription
4. Validez votre email

### Étape 2 : Obtenir vos clés API
1. Connectez-vous à votre **Dashboard Triple-A**
2. Allez dans **"Settings"** → **"API Keys"**
3. Générez une nouvelle clé API (Merchant Key)
4. Copiez la clé (format : `sk_live_...` ou `sk_test_...`)

### Étape 3 : Configurer l'application
Dans `js/triple-a-payment.js`, remplacez :
```javascript
// AVANT (Mode démo)
const tripleA = new TripleAPayment({
    testMode: true
});

// APRÈS (Mode production)
const tripleA = new TripleAPayment({
    merchantKey: 'VOTRE_CLÉ_API_ICI',  // sk_live_xxxxx
    testMode: false
});
```

### Étape 4 : Configurer les URLs de callback
```javascript
const orderData = {
    amount: 89.99,
    currency: 'EUR',
    crypto_currency: 'BTC',
    order_id: 'ORDER_12345',
    merchant_reference: 'REF_12345',
    success_url: 'https://votresite.com/payment/success',
    cancel_url: 'https://votresite.com/payment/cancel',
    notify_url: 'https://votresite.com/api/payment/webhook'
};
```

---

## 📡 API ENDPOINTS (d'après Postman Collection)

### 1. Créer un paiement
**POST** `/api/v2/payment`

**Headers:**
```json
{
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_MERCHANT_KEY"
}
```

**Body:**
```json
{
    "merchant_key": "YOUR_MERCHANT_KEY",
    "order_currency": "EUR",
    "order_amount": "89.99",
    "payer_currency": "BTC",
    "order_id": "ORDER_12345",
    "merchant_reference": "REF_12345",
    "success_url": "https://yoursite.com/success",
    "cancel_url": "https://yoursite.com/cancel",
    "notify_url": "https://yoursite.com/webhook"
}
```

**Response:**
```json
{
    "success": true,
    "payment": {
        "id": "PAY_xxxxx",
        "status": "pending",
        "payment_url": "https://payment.triple-a.io/checkout/PAY_xxxxx",
        "qr_code": "data:image/png;base64,...",
        "wallet_address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        "crypto_amount": "0.00234567",
        "expires_at": "2025-12-11T15:30:00Z"
    }
}
```

### 2. Vérifier le statut d'un paiement
**GET** `/api/v2/payment/{payment_id}`

**Headers:**
```json
{
    "Authorization": "Bearer YOUR_MERCHANT_KEY"
}
```

**Response:**
```json
{
    "success": true,
    "payment": {
        "id": "PAY_xxxxx",
        "status": "completed", // ou "pending", "expired", "failed"
        "order_id": "ORDER_12345",
        "amount_paid": "0.00234567",
        "crypto_currency": "BTC",
        "transaction_hash": "0xabc123...",
        "completed_at": "2025-12-11T14:45:00Z"
    }
}
```

### 3. Liste des paiements
**GET** `/api/v2/payments?page=1&limit=10`

### 4. Taux de conversion
**GET** `/api/v2/exchange_rate?from=EUR&to=BTC`

---

## 🔔 WEBHOOKS (Notifications)

Triple-A envoie des webhooks pour chaque changement de statut :

### URL à configurer :
```
https://votresite.com/api/payment/webhook
```

### Payload reçu :
```json
{
    "event": "payment.completed",
    "payment_id": "PAY_xxxxx",
    "order_id": "ORDER_12345",
    "status": "completed",
    "amount": "89.99",
    "currency": "EUR",
    "crypto_amount": "0.00234567",
    "crypto_currency": "BTC",
    "transaction_hash": "0xabc123...",
    "timestamp": "2025-12-11T14:45:00Z",
    "signature": "sha256_signature_here"
}
```

### Vérification de la signature :
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
    const hash = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
    
    return hash === signature;
}
```

---

## 🎯 UTILISATION DANS L'APP

### Dans `app.html`, onglet "Paiement" :
```javascript
// Sélectionner une crypto
function selectCrypto(crypto) {
    const tripleA = new TripleAPayment({
        merchantKey: 'VOTRE_CLÉ_API',
        testMode: false
    });
    
    // Créer un paiement
    const orderData = {
        amount: 89.99,
        currency: 'EUR',
        crypto_currency: crypto,
        order_id: 'ORDER_' + Date.now(),
        merchant_reference: 'PAIECASH_' + Date.now(),
        success_url: window.location.origin + '/payment/success',
        cancel_url: window.location.origin + '/payment/cancel',
        notify_url: window.location.origin + '/api/payment/webhook'
    };
    
    tripleA.createPayment(orderData).then(result => {
        if (result.success) {
            // Rediriger vers la page de paiement
            window.location.href = result.payment.payment_url;
        } else {
            alert('Erreur : ' + result.error);
        }
    });
}
```

---

## 🧪 TESTS RECOMMANDÉS

### Mode Sandbox (testMode: true)
- ✅ Sélectionner BTC → Voir adresse démo
- ✅ Sélectionner ETH → Voir QR Code
- ✅ Tester tous les cryptos (8)
- ✅ Simuler un paiement complété

### Mode Production (testMode: false)
- 🔐 Utiliser de petits montants (0.01€) pour tester
- 📊 Vérifier les webhooks dans le Dashboard Triple-A
- ✅ Tester les 3 états : pending → completed → expired
- 🔄 Tester les remboursements

---

## 📊 TAUX DE CONVERSION (Exemples)

| Montant | EUR | BTC | ETH | USDT |
|---------|-----|-----|-----|------|
| Petit | 10€ | ~0.0003 | ~0.004 | ~10 |
| Moyen | 50€ | ~0.0015 | ~0.02 | ~50 |
| Grand | 100€ | ~0.003 | ~0.04 | ~100 |

**Note :** Les taux changent en temps réel selon le marché.

---

## 🛡️ SÉCURITÉ

### ✅ Bonnes pratiques :
1. **Ne JAMAIS exposer votre clé API** dans le code frontend
2. Créer un **backend** (Node.js, PHP, Python) pour gérer les paiements
3. **Vérifier TOUJOURS** les webhooks avec la signature
4. Utiliser **HTTPS** obligatoirement
5. Logger tous les paiements dans une **base de données**

### ⚠️ Architecture recommandée :
```
Frontend (app.html)
    ↓
Backend API (votre serveur)
    ↓
Triple-A API (paiements crypto)
```

---

## 🎉 RÉSUMÉ

✅ **Mode démo** : Fonctionne MAINTENANT dans l'app  
✅ **8 cryptos** supportées (BTC, ETH, USDT, etc.)  
✅ **Interface UI** complète dans l'onglet "Paiement"  
✅ **QR Code** et adresses générées automatiquement  

🔜 **Pour activer en production** :
1. Créer compte Triple-A
2. Obtenir clé API
3. Remplacer dans `js/triple-a-payment.js`
4. Configurer webhooks
5. Tester avec petits montants

---

## 📞 SUPPORT TRIPLE-A

- **Site web** : https://www.triple-a.io/
- **Documentation** : https://triple-a.io/docs
- **Email** : support@triple-a.io
- **Postman** : https://static.triple-a.io/assets/triple-a-io/Payment_API_Documentation_New.postman_collection.json

---

**💰 Prêt pour les paiements crypto !**
