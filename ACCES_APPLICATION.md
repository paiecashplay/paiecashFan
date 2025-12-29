# 🚀 ACCÈS À L'APPLICATION PAIECASHFAN

## 🌐 URL DE PRODUCTION

**URL principale**: https://jphbvnok.gensparkspace.com/

Cette URL affiche le **Portail Mondial** avec tous les onglets (Ligue 1, Ligue 2, Europe, Afrique, Fédérations, etc.).

---

## 📁 PAGES PRINCIPALES

### 1. **index.html** (Portail Mondial)
- **URL**: https://jphbvnok.gensparkspace.com/
- **Description**: Portail principal multi-sports avec tous les onglets
- **Fonctionnalités**:
  - Onglets par compétition (Ligue 1, Ligue 2, Europe, Afrique)
  - Recherche multi-clubs et fédérations
  - Accès direct aux Super Apps de chaque club
  - 200+ clubs et 50+ fédérations
  - Multilingue (FR, EN, ES, AR, TR)

### 2. **START.html** (Hub Développeurs)
- **URL**: https://jphbvnok.gensparkspace.com/START.html
- **Description**: Hub central pour développeurs et intégrateurs
- **Fonctionnalités**:
  - Vue d'ensemble des 6 widgets autonomes
  - Accès rapide à la démo complète
  - Documentation technique
  - Statistiques du projet
  - Guide de démarrage SDK

### 3. **full-integration-demo.html** (Démo complète)
- **URL**: https://jphbvnok.gensparkspace.com/examples/full-integration-demo.html
- **Description**: Démonstration interactive complète
- **Fonctionnalités**:
  - 6 widgets visibles simultanément
  - Communication inter-widgets en temps réel
  - Journal des événements
  - 6 scénarios d'interaction testables
  - Statistiques live

### 4. **api-client-demo.html** (Démo API)
- **URL**: https://jphbvnok.gensparkspace.com/examples/api-client-demo.html
- **Description**: Interface de test des 29 endpoints REST
- **Fonctionnalités**:
  - Test de tous les endpoints
  - Affichage JSON en temps réel
  - Exemples de requêtes
  - Documentation API intégrée



---

## 🎯 WIDGETS AUTONOMES

Chaque widget peut être intégré individuellement via iframe :

### 1. **Wallet Widget**
```html
<iframe src="https://jphbvnok.gensparkspace.com/widgets/wallet-widget.html" 
        width="100%" height="600px" frameborder="0"></iframe>
```

### 2. **Chat + Vidéo Widget**
```html
<iframe src="https://jphbvnok.gensparkspace.com/widgets/chat-video-widget.html" 
        width="100%" height="600px" frameborder="0"></iframe>
```

### 3. **IA Hyper-Personnalisation Widget**
```html
<iframe src="https://jphbvnok.gensparkspace.com/widgets/ai-personalization-widget.html" 
        width="100%" height="600px" frameborder="0"></iframe>
```

### 4. **eSIM Widget**
```html
<iframe src="https://jphbvnok.gensparkspace.com/widgets/esim-widget.html" 
        width="100%" height="600px" frameborder="0"></iframe>
```

### 5. **Shop Widget**
```html
<iframe src="https://jphbvnok.gensparkspace.com/widgets/shop-widget.html" 
        width="100%" height="600px" frameborder="0"></iframe>
```

### 6. **Tickets Widget**
```html
<iframe src="https://jphbvnok.gensparkspace.com/widgets/tickets-widget.html" 
        width="100%" height="600px" frameborder="0"></iframe>
```

---

## 🔧 INTÉGRATION VIA SDK

### Installation
```html
<script src="https://jphbvnok.gensparkspace.com/sdk/paiecashfan-sdk.js"></script>
<script src="https://jphbvnok.gensparkspace.com/api/client.js"></script>
```

### Exemple d'utilisation
```javascript
// Initialiser le SDK
const sdk = new PaieCashFanSDK({
    containerId: 'app',
    apiURL: 'http://localhost:3000/api',
    theme: 'dark'
});

// Charger un widget
await sdk.loadWidget('wallet');

// Écouter les événements
sdk.on('WALLET_BALANCE_UPDATED', (data) => {
    console.log('Nouveau solde:', data.balance);
});
```

---

## 🗂️ DOCUMENTATION TECHNIQUE

### Documentation principale
- **README.md**: https://jphbvnok.gensparkspace.com/README.md
- **Architecture Microservices**: https://jphbvnok.gensparkspace.com/ARCHITECTURE_MICROSERVICES_2026.md
- **Vision Réseau Social + IA**: https://jphbvnok.gensparkspace.com/VISION_RESEAU_SOCIAL_IA.md
- **Backend API**: https://jphbvnok.gensparkspace.com/BACKEND_API_COMPLETE.md
- **Database**: https://jphbvnok.gensparkspace.com/DATABASE_COMPLETE.md

### Documentation API
- **API README**: https://jphbvnok.gensparkspace.com/api/README.md
- **Quickstart**: https://jphbvnok.gensparkspace.com/api/QUICKSTART.md

---

## 🚀 BACKEND API REST

### URL Backend (Local)
```
http://localhost:3000/api
```

### Démarrage
```bash
# Option 1: Docker (recommandé)
docker-compose up -d

# Option 2: Node.js local
cd api
npm install
cp .env.example .env
npm run start:db
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Endpoints disponibles (29)
- **Auth**: `/api/auth/register`, `/api/auth/login`
- **Wallet**: `/api/wallet/balance`, `/api/wallet/transactions`, `/api/wallet/send`, `/api/wallet/deposit`
- **eSIM**: `/api/esim/plans`, `/api/esim/activate`, `/api/esim/active`
- **Shop**: `/api/shop/products`, `/api/shop/cart/add`, `/api/shop/cart`, `/api/shop/checkout`
- **Tickets**: `/api/tickets/events`, `/api/tickets/purchase`, `/api/tickets/my-tickets`, `/api/tickets/:id/qr`
- **Social**: `/api/social/conversations`, `/api/social/messages`, `/api/social/feed`
- **IA**: `/api/ai/recommendations`, `/api/ai/insights`, `/api/ai/predictions`
- **System**: `/api/health`, `/api/stats`

---

## 📊 STATISTIQUES DU PROJET

### Code
- **Fichiers HTML**: 10
- **Fichiers JavaScript**: 8
- **Fichiers Markdown**: 15
- **Total lignes de code**: ~50 000

### Architecture
- **Widgets autonomes**: 6
- **Endpoints REST**: 29
- **Tables PostgreSQL**: 13
- **Cache Redis keys**: 10+
- **Microservices**: 9

### Fonctionnalités
- ✅ Wallet multi-crypto
- ✅ Chat + Vidéo temps réel
- ✅ IA Hyper-Personnalisation
- ✅ eSIM international
- ✅ Shop multi-clubs
- ✅ Tickets événements
- ✅ Backend REST API
- ✅ PostgreSQL + Redis
- ✅ Communication inter-widgets

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ **Frontend**: 6 widgets autonomes
2. ✅ **Backend**: API REST 29 endpoints
3. ✅ **Database**: PostgreSQL + Redis
4. ⏳ **Tests**: Tests unitaires
5. ⏳ **WebSocket**: Chat temps réel
6. ⏳ **CI/CD**: Pipeline automatisé
7. ⏳ **Mobile**: React Native app
8. ⏳ **Smart Contracts**: Polygon/Base

---

## 📞 SUPPORT

Pour toute question ou problème:
- 📧 Email: support@paiecashfan.com
- 📱 WhatsApp: +33 X XX XX XX XX
- 🌐 Site: https://paiecashfan.com

---

## 🔐 NOTES DE SÉCURITÉ

- ⚠️ L'URL actuelle est un environnement de **développement**
- ⚠️ Pour la **production**, utiliser un domaine personnalisé
- ⚠️ Activer **HTTPS** obligatoire
- ⚠️ Configurer les **variables d'environnement** sensibles
- ⚠️ Activer **rate limiting** et **CORS** appropriés

---

**Dernière mise à jour**: 28 décembre 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready (Dev)
