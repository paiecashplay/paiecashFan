# 💳 PaieCashFan Payment Gateway - Plugin WordPress

**Version** : 1.0.0  
**Compatibilité** : WordPress 5.8+, WooCommerce 5.0+  
**Licence** : GPL v2 or later

---

## 📌 Description

Plugin WooCommerce pour accepter les paiements via **PaieCashFan** :
- 💰 **Wallet PaieCashFan** (+2% cashback)
- 🌐 **300+ Cryptomonnaies** (USDT, USDC, BTC, ETH, etc.)
- 💎 **Stablecoins club** (OMC, PSC, OLC, AFC, LFC... +3% cashback)

---

## 🚀 Installation

### Méthode 1 : Upload via WordPress Admin (Recommandé)

1. **Créer un ZIP** du dossier `wordpress-plugin` :
   ```bash
   # Sur Mac/Linux
   cd wordpress-plugin
   zip -r paiecashfan-gateway.zip .
   
   # Sur Windows
   Sélectionner tous les fichiers → Clic droit → Envoyer vers → Dossier compressé
   ```

2. **Upload dans WordPress** :
   - Dashboard → **Plugins** → **Add New**
   - Cliquer sur **"Upload Plugin"**
   - Choisir `paiecashfan-gateway.zip`
   - Cliquer **"Install Now"**
   - Cliquer **"Activate Plugin"**

### Méthode 2 : Upload via FTP

1. **Upload via FTP** :
   - Connecter à votre serveur FTP
   - Naviguer vers `/wp-content/plugins/`
   - Créer dossier `paiecashfan-gateway`
   - Upload tous les fichiers dedans

2. **Activer** :
   - Dashboard → **Plugins**
   - Trouver "PaieCashFan Payment Gateway"
   - Cliquer **"Activate"**

---

## ⚙️ Configuration

### Étape 1 : Obtenir les clés API

1. Aller sur : https://dashboard.paiecashfan.com/settings/api
2. Créer une nouvelle clé API :
   - Name : `WooCommerce Store`
   - Permissions : `payments.read`, `payments.write`, `wallet.read`
3. Copier la clé générée (ex: `pcf_live_abc123...`)

### Étape 2 : Configurer le plugin

Dashboard → **WooCommerce** → **Settings** → **Payments** → **PaieCashFan**

```
✅ Enable PaieCashFan Gateway: Yes

Title: PaieCashFan (Wallet + Crypto)
Description: Payez avec votre Wallet PaieCashFan, USDT, USDC, BTC, ETH ou stablecoins club.

✅ Test Mode: Yes (pour commencer)

Test API Key: pcf_test_xyz789...
API Key (Production): pcf_live_abc123...
```

Cliquer **"Save changes"**

### Étape 3 : Tester

1. Créer un **produit test** :
   - Products → Add New
   - Name : "Test Maillot"
   - Price : 10.00€
   - Publish

2. **Ajouter au panier** (en navigation privée)

3. **Aller au checkout** :
   - Remplir les informations
   - Choisir **"PaieCashFan"** comme méthode de paiement
   - Sélectionner **Wallet** ou **Crypto**
   - Cliquer **"Place Order"**

4. **Vérifier** :
   - Dashboard → WooCommerce → Orders
   - La commande doit apparaître avec statut "On Hold" ou "Processing"

---

## 🔧 Structure des fichiers

```
wordpress-plugin/
├── paiecashfan-gateway.php          # Plugin principal
├── assets/
│   ├── css/
│   │   └── paiecashfan-gateway.css  # Styles frontend
│   ├── js/
│   │   └── paiecashfan-gateway.js   # Scripts frontend
│   └── images/
│       └── paiecashfan-icon.png     # Icône (à créer)
├── languages/                        # Traductions (optionnel)
│   ├── paiecashfan-gateway-fr_FR.po
│   └── paiecashfan-gateway-fr_FR.mo
└── README.md                         # Ce fichier
```

---

## 🔐 Webhooks

Le plugin écoute automatiquement les webhooks PaieCashFan sur :
```
https://votre-site.com/wc-api/paiecashfan_webhook/
```

### Configurer le webhook sur PaieCashFan :

1. Aller sur : https://dashboard.paiecashfan.com/settings/webhooks
2. Ajouter un nouveau webhook :
   ```
   URL: https://votre-site.com/wc-api/paiecashfan_webhook/
   Events: payment.completed, payment.refunded
   Secret: (généré automatiquement)
   ```
3. Sauvegarder

---

## 🛠️ API Endpoints utilisés

Le plugin communique avec l'API PaieCashFan :

### Production
```
https://api.paiecashfan.com
```

### Sandbox (Test)
```
https://api-sandbox.paiecashfan.com
```

### Endpoints :

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/wallet/balance` | GET | Récupérer le solde wallet |
| `/payments/create` | POST | Créer un nouveau paiement |
| `/payments/refund` | POST | Rembourser un paiement |
| `/payments/{id}` | GET | Récupérer un paiement |

---

## 🎨 Personnalisation CSS

Pour personnaliser l'apparence, ajouter dans votre thème (`style.css`) :

```css
/* Changer la couleur principale */
.paiecashfan-payment-method:hover {
    border-color: #votre-couleur !important;
}

/* Changer l'icône de taille */
.method-icon {
    font-size: 2.5rem !important;
}

/* Style mobile */
@media (max-width: 768px) {
    .paiecashfan-payment-methods {
        gap: 0.75rem;
    }
}
```

---

## 🌐 Multilingue

Le plugin est prêt pour la traduction via `.po/.mo` files.

### Créer une traduction :

1. Installer **Poedit** : https://poedit.net/
2. Ouvrir `languages/paiecashfan-gateway.pot`
3. Créer traduction (ex: `paiecashfan-gateway-es_ES.po`)
4. Compiler (génère `.mo`)
5. Upload dans `/languages/`

---

## ❓ FAQ

### Le plugin ne s'active pas ?
- Vérifier que **WooCommerce est installé et activé**
- Vérifier version PHP >= 7.4
- Vérifier version WordPress >= 5.8

### Les paiements échouent ?
- Vérifier que la **clé API est valide**
- Vérifier que le **mode test** est activé si vous testez
- Vérifier les **logs** : WooCommerce → Status → Logs

### Le solde wallet n'apparaît pas ?
- L'utilisateur doit être **connecté sur PaieCashFan**
- Vérifier la **connexion API**
- Vérifier la console JavaScript (F12)

### Comment changer les commissions ?
Les commissions sont gérées par **Dokan** (marketplace), pas par ce plugin.

---

## 🐛 Debug

### Activer les logs WooCommerce :

Dashboard → **WooCommerce** → **Status** → **Logs**

Le plugin écrit dans `woocommerce-paiecashfan-{date}.log`

### Logs console JavaScript :

Ouvrir la console (F12) et vérifier :
```javascript
console.log(paiecashfan_params); // Doit afficher la config
```

---

## 🔄 Mises à jour

Pour mettre à jour le plugin :

1. **Désactiver** le plugin
2. **Supprimer** les anciens fichiers
3. **Upload** les nouveaux fichiers
4. **Activer** le plugin
5. Vérifier les paramètres

---

## 📞 Support

- **Email** : support@paiecashfan.com
- **Documentation** : https://docs.paiecashfan.com
- **Discord** : https://discord.gg/paiecashfan
- **GitHub** : https://github.com/paiecashfan

---

## 📄 Changelog

### Version 1.0.0 (14 Décembre 2025)
- ✅ Première version
- ✅ Support Wallet PaieCashFan
- ✅ Support 300+ cryptos
- ✅ Support stablecoins club
- ✅ Webhooks
- ✅ Remboursements
- ✅ Mode test/production

---

## 📝 Licence

GPL v2 or later  
https://www.gnu.org/licenses/gpl-2.0.html

---

**Développé avec ❤️ par l'équipe PaieCashFan**
