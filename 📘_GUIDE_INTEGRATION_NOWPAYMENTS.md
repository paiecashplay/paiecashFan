# 📘 GUIDE D'INTÉGRATION NOWPAYMENTS

## 🎯 Objectif
Intégrer **NOWPayments** comme solution de paiement crypto dans la boutique PaieCashPlay FAN.

NOWPayments permet d'accepter **300+ cryptomonnaies** (Bitcoin, Ethereum, USDT, USDC, BNB, etc.) avec des frais très bas (0.5%).

---

## 🔐 ÉTAPE 1 : Récupérer Votre Clé API

### Connexion au Dashboard
1. Ouvrez : https://account.nowpayments.io/fr/dashboard
2. **Login** : `etot@paiecash.com`
3. **Password** : `pmC2Mt-Y6hh$Sqa`

### Récupérer la Clé API
1. Une fois connecté, allez dans **Settings** → **API Keys**
2. Cliquez sur **"Generate new API key"** (ou copiez une clé existante)
3. **Copiez la clé API** (format : `XXXXX-XXXXX-XXXXX-XXXXX`)

---

## 🔧 ÉTAPE 2 : Configurer le Module

### Ouvrir le fichier d'intégration
Fichier : **`💰_nowpayments-integration.js`**

### Modifier la configuration (ligne ~20)
```javascript
const NOWPAYMENTS_CONFIG = {
    // API Configuration
    apiBaseURL: 'https://api.nowpayments.io/v1',
    apiKey: 'VOTRE_CLE_API_ICI', // ← COLLEZ VOTRE CLÉ ICI
    
    // Sandbox pour tests (optionnel)
    sandboxURL: 'https://api-sandbox.nowpayments.io/v1',
    sandboxKey: '', // Clé sandbox pour tests
    
    // Mode production ou test
    production: false, // ← Mettre à true en production
    
    // IPN (Instant Payment Notification) URL
    ipnCallbackURL: 'https://votre-domaine.com/api/nowpayments/callback',
    
    // Devise par défaut pour les prix
    defaultFiatCurrency: 'EUR'
};
```

### Exemple avec vraie clé API :
```javascript
const NOWPAYMENTS_CONFIG = {
    apiBaseURL: 'https://api.nowpayments.io/v1',
    apiKey: 'ABC123-DEF456-GHI789-JKL012', // Votre clé API
    production: true, // Mode production activé
    ipnCallbackURL: 'https://paiecashplay.com/api/nowpayments/callback',
    defaultFiatCurrency: 'EUR'
};
```

---

## 🧪 ÉTAPE 3 : Tester l'Intégration

### Test Rapide
1. Ouvrez : `app-universal-simple.html?club=liverpool`
2. Allez dans **Boutique** → **Boutique Officielle**
3. Sélectionnez 2-3 produits
4. Cliquez sur **"PAYER MAINTENANT"**
5. Cliquez sur **"🌐 Payer en Crypto (BTC, ETH, USDT...)"**
6. Choisissez une cryptomonnaie (ex: Bitcoin)
7. Vérifiez que le modal de paiement s'affiche avec :
   - Montant en crypto
   - QR Code
   - Adresse de paiement
   - Instructions

### Mode Sandbox (Tests)
Si vous voulez tester SANS paiement réel :
```javascript
production: false, // Mode test
sandboxKey: 'VOTRE_CLE_SANDBOX', // Clé sandbox
```

Pour obtenir une clé sandbox :
- Dashboard → Settings → Sandbox Mode → Generate Sandbox API Key

---

## 📊 ÉTAPE 4 : Configurer les Webhooks (IPN)

Les webhooks permettent de recevoir des notifications automatiques quand un paiement est confirmé.

### Dans le Dashboard NOWPayments
1. Allez dans **Settings** → **IPN Settings**
2. Activez **"IPN Enabled"**
3. Renseignez votre **IPN Callback URL** :
   ```
   https://votre-domaine.com/api/nowpayments/callback
   ```
4. Sélectionnez les événements à recevoir :
   - ✅ Payment Status Changed
   - ✅ Payment Confirmed
   - ✅ Payment Finished

### Créer l'Endpoint IPN (Backend)
Vous devez créer un endpoint sur votre serveur qui recevra les notifications :

```javascript
// Exemple Node.js/Express
app.post('/api/nowpayments/callback', (req, res) => {
    const notification = req.body;
    
    console.log('📩 Notification NOWPayments reçue:', notification);
    
    // Vérifier le statut
    if (notification.payment_status === 'finished') {
        // Paiement confirmé !
        const orderId = notification.order_id;
        
        // Mettre à jour la commande dans votre base de données
        // Envoyer email de confirmation
        // Déclencher la livraison
        
        console.log(`✅ Paiement confirmé pour commande ${orderId}`);
    }
    
    // Répondre à NOWPayments
    res.status(200).send('OK');
});
```

---

## 🎨 ÉTAPE 5 : Personnaliser l'Interface

### Modifier les cryptos affichées
Fichier : `💰_nowpayments-integration.js` (ligne ~42)

```javascript
const POPULAR_CRYPTOS = [
    { symbol: 'btc', name: 'Bitcoin', logo: '₿' },
    { symbol: 'eth', name: 'Ethereum', logo: 'Ξ' },
    { symbol: 'usdt', name: 'Tether (USDT)', logo: '₮' },
    { symbol: 'usdc', name: 'USD Coin', logo: 'USDC' },
    // Ajoutez vos cryptos préférées ici
];
```

### Personnaliser les couleurs
Dans `app-universal-simple.html`, modifiez le bouton de paiement :

```javascript
<button class="btn" onclick="payerAvecNOWPayments(${total})" 
        style="background: linear-gradient(135deg, #f59e0b, #d97706);">
    🌐 Payer en Crypto (BTC, ETH, USDT...)
</button>
```

---

## 📈 STATISTIQUES & MONITORING

### Dashboard NOWPayments
1. **Paiements** : Voir tous les paiements (statut, montant, crypto)
2. **Statistiques** : Volume, conversions, taux de succès
3. **Exports** : Télécharger les rapports en CSV/PDF
4. **API Logs** : Voir les appels API et erreurs

### Logs Console
Dans votre navigateur (F12 → Console), vous verrez :
```
🚀 Initialisation NOWPayments...
✅ 300+ cryptomonnaies disponibles
💰 100.00 EUR = 0.00234567 BTC
📤 Création paiement NOWPayments: {...}
✅ Paiement créé: {...}
```

---

## 🔄 FLUX DE PAIEMENT COMPLET

### 1. Utilisateur sélectionne des produits
```
Panier : 3 produits
Total : 149.97 €
```

### 2. Utilisateur clique "Payer en Crypto"
```
→ Modal de sélection de crypto s'affiche
→ Utilisateur choisit Bitcoin (BTC)
```

### 3. Système crée le paiement NOWPayments
```
API Call: POST /v1/payment
{
    "price_amount": 149.97,
    "price_currency": "EUR",
    "pay_currency": "btc",
    "order_id": "ORDER-1702393856-ABC123",
    "order_description": "Boutique Liverpool FC - 3 produit(s)"
}

Response:
{
    "payment_id": "5123456789",
    "pay_address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "pay_amount": 0.00234567,
    "pay_currency": "btc",
    "price_amount": 149.97,
    "price_currency": "eur",
    "payment_status": "waiting"
}
```

### 4. Modal de paiement s'affiche
```
→ QR Code avec l'adresse Bitcoin
→ Adresse à copier
→ Montant exact : 0.00234567 BTC
→ Instructions
```

### 5. Utilisateur envoie la crypto
```
Utilisateur envoie 0.00234567 BTC depuis son wallet
→ Transaction sur la blockchain Bitcoin
```

### 6. NOWPayments détecte le paiement
```
Status: waiting → confirming → confirmed → finished

IPN Callback envoyé à votre serveur:
{
    "payment_status": "finished",
    "order_id": "ORDER-1702393856-ABC123",
    "payment_id": "5123456789"
}
```

### 7. Confirmation finale
```
✅ Modal affiche "Paiement confirmé !"
→ Panier vidé
→ Email de confirmation envoyé
→ Commande enregistrée
```

---

## 💰 FRAIS & TARIFICATION

### Frais NOWPayments
- **Standard** : 0.5% par transaction
- **Custodia** (garde des fonds) : +0.5%
- **Auto-conversion** en EUR : +1%

### Exemple de Calcul
```
Vente : 150 €
Frais NOWPayments (0.5%) : 0.75 €
Net reçu : 149.25 €
```

### Options de Réception
1. **Direct** : Recevoir les cryptos sur votre wallet
2. **Auto-conversion** : Conversion automatique en EUR/USD
3. **Custodia** : NOWPayments garde les fonds pour vous

---

## 🛡️ SÉCURITÉ

### Bonnes Pratiques
1. ✅ **Ne jamais** commit la clé API dans Git
2. ✅ Utiliser des **variables d'environnement** en production
3. ✅ Activer la **vérification IPN** (HMAC signature)
4. ✅ Limiter les **permissions API** (si possible)
5. ✅ Utiliser **HTTPS** pour tous les webhooks

### Variables d'Environnement
```javascript
// .env
NOWPAYMENTS_API_KEY=ABC123-DEF456-GHI789-JKL012
NOWPAYMENTS_IPN_SECRET=secret_key_for_hmac

// Dans le code
const NOWPAYMENTS_CONFIG = {
    apiKey: process.env.NOWPAYMENTS_API_KEY,
    production: true
};
```

---

## 🐛 TROUBLESHOOTING

### Erreur : "API Key Invalid"
**Solution** : Vérifiez que vous avez bien copié la clé API complète

### Erreur : "Currency not available"
**Solution** : Vérifiez que la crypto est bien supportée via :
```
GET https://api.nowpayments.io/v1/currencies
```

### Paiement bloqué sur "waiting"
**Solution** : 
- Vérifiez que l'utilisateur a envoyé le montant EXACT
- Attendez les confirmations blockchain (BTC: 2 conf, ETH: 12 conf)

### IPN non reçu
**Solution** :
- Vérifiez que l'URL IPN est accessible publiquement
- Testez avec ngrok en développement
- Vérifiez les logs dans Dashboard → API Logs

---

## 📞 SUPPORT

### Documentation Officielle
- API Docs : https://documenter.getpostman.com/view/7907941/S1a32n38
- FAQ : https://nowpayments.io/help/
- Status : https://status.nowpayments.io/

### Contact NOWPayments
- Email : support@nowpayments.io
- Telegram : @NOWPayments_support
- Live Chat : Disponible dans le dashboard

---

## ✅ CHECKLIST DE MISE EN PRODUCTION

Avant de passer en production, vérifiez :

- [ ] Clé API configurée
- [ ] `production: true` dans la config
- [ ] IPN URL configurée et accessible
- [ ] Tests de paiement effectués
- [ ] Gestion des erreurs implémentée
- [ ] Logs configurés
- [ ] Email de confirmation prêt
- [ ] Base de données prête pour les commandes
- [ ] Conditions générales de vente à jour
- [ ] Politique de remboursement définie

---

## 🎉 FÉLICITATIONS !

Votre intégration NOWPayments est prête ! Vous pouvez maintenant accepter 300+ cryptomonnaies dans votre boutique.

**Prochaines étapes recommandées** :
1. Tester avec de vraies petites transactions
2. Configurer les webhooks pour l'automatisation
3. Monitorer les premières commandes
4. Optimiser l'UX selon les retours utilisateurs

---

*Guide créé le 12 décembre 2024 - PaieCashPlay Assistant*
