# ⚽ PaieCashFan - Plateforme Multi-Sport Web3

> La plateforme de fans nouvelle génération qui combine sport, crypto-paiements, NFT, et IA.

[![Version](https://img.shields.io/badge/version-11.3.1-brightgreen.svg)](https://github.com/votreusername/paiecashfan)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-production-success.svg)](https://jphbvnok.gensparkspace.com/)

---

## 📌 Vue d'ensemble

**PaieCashFan** est une plateforme web complète pour les fans de sport qui révolutionne l'expérience supporter en intégrant :

- 🏆 **353 équipes** (Football, Basketball, Handball, Rugby, Volleyball)
- 💎 **Crypto-paiements** (13 stablecoins, 300+ cryptos via NowPayments)
- 🛍️ **Boutique unifiée** (WooCommerce integration)
- ⭐ **NFT de légendes** (50+ légendes avec modèle solidaire)
- 🤖 **Assistant IA** multilingue
- 🎮 **Gamification** (récompenses, badges, cashback)

---

## ✨ Fonctionnalités principales

### 🔐 Authentification
- ✅ Inscription / Connexion avec persistance
- ✅ Gestion de session (localStorage)
- ✅ Récupération de mot de passe

### 💳 Paiements
- ✅ **5 méthodes actives** : Wallet, Carte, Stablecoin club, Mode Touriste, Crypto
- ✅ **Cashback automatique** : 3% stablecoin, 2% wallet
- ✅ **300+ cryptos** supportées (via NowPayments)
- ✅ **Stablecoin par club** (OMC, PSC, OLC, AFC, LFC, etc.)

### 🛒 Boutique
- ✅ Intégration WooCommerce
- ✅ Panier persistant
- ✅ Produits club + NFT + e-SIM
- ✅ Paiement en 1 clic

### ⚽ Multi-Sport
- ⚽ **Football** : 163 clubs (France + Europe)
- 🏀 **Basketball** : 48 équipes
- 🤾 **Handball** : 46 équipes
- 🏉 **Rugby** : 36 équipes
- 🏐 **Volleyball** : 34 équipes

### 🌍 International
- 🇫🇷 Français
- 🇬🇧 English
- 🇪🇸 Español
- 🇩🇪 Deutsch
- 🇮🇹 Italiano
- 🇵🇹 Português

---

## 🚀 Démarrage rapide

### Prérequis
- Navigateur moderne (Chrome, Firefox, Safari, Edge)
- Serveur web (Apache, Nginx, ou serveur local)
- (Optionnel) Node.js pour outils de développement

### Installation

1. **Cloner le repository** :
```bash
git clone https://github.com/votreusername/paiecashfan.git
cd paiecashfan
```

2. **Ouvrir avec un serveur local** :

**Option A - Python** :
```bash
python -m http.server 8000
```

**Option B - Node.js** :
```bash
npx http-server -p 8000
```

**Option C - PHP** :
```bash
php -S localhost:8000
```

3. **Accéder à l'application** :
```
http://localhost:8000
```

4. **Fichiers de démarrage** :
- `🚀_COMMENCER_ICI_V11.3.1.html` - Point d'entrée rapide
- `index.html` - Page d'accueil principale
- `app-universal-simple.html?club=olympique-de-marseille` - Page club

---

## 📁 Structure du projet

```
paiecashfan/
├── index.html                          # Page d'accueil
├── app-universal-simple.html           # Application club universelle
│
├── modules/                            # Modules JavaScript V11.0
│   ├── core-system.js                  # Système core
│   ├── auth-persistent.module.js       # Authentification
│   ├── wallet-unified.module.js        # Wallet crypto
│   ├── payment-unified.module.js       # Paiements
│   ├── shop-unified.module.js          # Boutique
│   ├── social-tiktok.module.js         # Intégration TikTok
│   ├── ai-support.module.js            # Assistant IA
│   ├── gamification-fomo.module.js     # Gamification
│   └── navigation-hierarchy.module.js  # Navigation
│
├── data/                               # Données des équipes
│   ├── clubs-football-complet.js       # Football France
│   ├── football-europeen-data.js       # Football Europe
│   ├── ⭐_LEGENDES_CLUBS_COMPLETE.js  # Légendes
│   ├── 🏀_BASKET_FEDERATIONS_CLUBS.js
│   ├── 🤾_HANDBALL_FEDERATIONS_CLUBS.js
│   ├── 🏉_RUGBY_VOLLEY_FEDERATIONS_CLUBS.js
│   └── 🌍_TOUTES_COMPETITIONS_2026.js
│
├── js/                                 # Scripts JavaScript
│   ├── qr-payment.js                   # Paiements QR Code
│   ├── sms-payment.js                  # Paiements SMS
│   ├── triple-a-payment.js             # API Triple-A
│   └── woocommerce-connector.js        # Connecteur WooCommerce
│
├── 💰_nowpayments-integration.js      # Intégration NowPayments
├── woocommerce-integration.js          # Intégration WooCommerce
│
├── sdk/                                # SDK Widget
│   ├── paiecashfan-widget.js
│   ├── demo-widget.html
│   └── README_SDK.md
│
├── README.md                           # Documentation principale
├── LICENSE                             # Licence MIT
└── .gitignore                          # Fichiers ignorés
```

---

## 🔧 Configuration

### 1️⃣ NowPayments (Crypto)

**Fichier** : `💰_nowpayments-integration.js`

```javascript
API_KEY: 'VOTRE_CLE_API_ICI', // Ligne 50
```

**Obtenir une clé** : https://account.nowpayments.io/fr/dashboard

### 2️⃣ WooCommerce (Boutique)

**Fichier** : `woocommerce-integration.js`

```javascript
STORE_URL: 'https://votre-boutique.com',     // Ligne 10
CONSUMER_KEY: 'ck_VOTRE_CLE',                // Ligne 11
CONSUMER_SECRET: 'cs_VOTRE_SECRET',          // Ligne 12
```

**Générer les clés** : WooCommerce → Settings → Advanced → REST API

---

## 🧪 Tests

### Test Authentification
```bash
# Ouvrir dans le navigateur :
🔍_VERIFIER_BOUTONS_AUTH.html
```

### Test Paiements
```bash
# Ouvrir dans le navigateur :
🧪_TESTER_PAIEMENTS_BOUTIQUE.html
```

### Test Complet
```bash
# Ouvrir dans le navigateur :
🚀_COMMENCER_ICI_V11.3.1.html
```

---

## 📊 Statistiques

| Métrique | Valeur |
|----------|--------|
| Équipes | 353 |
| Sports | 5 (Football, Basketball, Handball, Rugby, Volleyball) |
| Clubs avec légendes | 50+ |
| Stablecoins supportés | 13 |
| Cryptos supportés | 300+ |
| Modules JavaScript | 8 |
| Langues | 6 |
| Méthodes de paiement | 5+ |

---

## 🛠️ Technologies utilisées

- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Crypto** : NowPayments API, Triple-A API
- **E-commerce** : WooCommerce REST API
- **Stockage** : localStorage, IndexedDB
- **Icons** : Font Awesome 6.4.0
- **Fonts** : Google Fonts (Inter)
- **CDN** : jsDelivr

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. **Fork** le projet
2. **Créer** une branche (`git checkout -b feature/AmazingFeature`)
3. **Commiter** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

---

## 📝 Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Auteurs

- **Équipe PaieCashFan** - *Développement initial* - [GitHub](https://github.com/votreusername)

---

## 🙏 Remerciements

- **NowPayments** pour l'intégration crypto
- **WooCommerce** pour l'API e-commerce
- **Font Awesome** pour les icônes
- **Communauté open source** pour les inspirations

---

## 📞 Support

- 📧 Email : support@paiecashfan.com
- 🌐 Site web : https://paiecashfan.com
- 💬 Discord : [Rejoindre](https://discord.gg/paiecashfan)
- 🐦 Twitter : [@PaieCashFan](https://twitter.com/paiecashfan)

---

## 🗺️ Roadmap

### ✅ V11.3.1 (Actuelle)
- [x] Authentification complète
- [x] Paiements boutique fonctionnels
- [x] 353 équipes multi-sport
- [x] NFT légendes avec modèle solidaire

### 🚀 V12.0 (À venir)
- [ ] Intégration Alipay / Mobile Money
- [ ] Programme de fidélité avancé
- [ ] Marketplace NFT
- [ ] Application mobile (React Native)

### 🔮 V13.0 (Futur)
- [ ] Streaming live intégré
- [ ] Prédictions avec blockchain
- [ ] DAO pour les décisions communautaires

---

## ⚠️ Notes importantes

### Clés API
⚠️ **ATTENTION** : Ne commitez JAMAIS vos vraies clés API sur GitHub !

Utilisez des variables d'environnement ou un fichier `.env` :

```bash
# .env (à ajouter dans .gitignore)
NOWPAYMENTS_API_KEY=votre_cle_api
WOOCOMMERCE_CONSUMER_KEY=votre_cle
WOOCOMMERCE_CONSUMER_SECRET=votre_secret
```

### Sécurité
- ✅ Toutes les clés API doivent être côté serveur en production
- ✅ Utilisez HTTPS pour les transactions
- ✅ Validez toutes les entrées utilisateur
- ✅ Activez CORS uniquement pour vos domaines

---

## 📸 Screenshots

### Page d'accueil
![Accueil](docs/screenshots/home.png)

### Boutique Club
![Boutique](docs/screenshots/shop.png)

### Paiements
![Paiements](docs/screenshots/payments.png)

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=votreusername/paiecashfan&type=Date)](https://star-history.com/#votreusername/paiecashfan&Date)

---

**Fait avec ❤️ par l'équipe PaieCashFan**
