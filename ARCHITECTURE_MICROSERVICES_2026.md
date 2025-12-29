# 🏗️ ARCHITECTURE MICROSERVICES PAIECASHFAN 2026

**Version:** 2.0.0  
**Date:** 28 Décembre 2025  
**Statut:** ✅ WIDGETS CRÉÉS + DOCUMENTATION COMPLÈTE

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture Microservices](#architecture-microservices)
3. [Widgets Autonomes](#widgets-autonomes)
4. [SDK JavaScript](#sdk-javascript)
5. [API REST](#api-rest)
6. [Communication Inter-Widgets](#communication-inter-widgets)
7. [Intégration](#intégration)
8. [Sécurité](#sécurité)
9. [Déploiement](#déploiement)
10. [Réseau Social + IA](#réseau-social--ia)

---

## 🎯 VUE D'ENSEMBLE

PaieCashFan est une **super app modulaire** construite sur une architecture microservices où **chaque fonctionnalité est un widget autonome** utilisable via :

- **iframe** : Intégration HTML simple
- **SDK JavaScript** : API programmatique
- **API REST** : Endpoints backend

### Nouveautés V2.0.0

✅ **Widget Chat + Vidéo** créé (réseau social)  
✅ **Widget IA Hyper-Personnalisation** créé  
✅ **Widget Wallet** déjà disponible  
✅ **SDK JavaScript unifié** prêt  
⏳ **Widgets eSIM, Shop, Tickets** (à venir)

---

## 🏗️ ARCHITECTURE MICROSERVICES

### 1. **Wallet Service** ✅ CRÉÉ

**Fichier:** `widgets/wallet-widget.html`  
**Fonctionnalités:**
- Affichage solde PaieCash USD
- Liste des crypto-actifs (BTC, ETH, USDC)
- Historique des transactions
- Actions: Déposer, Envoyer, Recevoir

**Communication:**
```javascript
// Événements émis
window.parent.postMessage({
    type: 'WALLET_BALANCE_UPDATED',
    data: { balance: 1247.50, currency: 'EUR' }
}, '*');

// Événements écoutés
window.addEventListener('message', (event) => {
    if (event.data.type === 'UPDATE_WALLET_BALANCE') {
        // Mise à jour du solde
    }
});
```

**Intégration iframe:**
```html
<iframe 
    src="widgets/wallet-widget.html" 
    width="100%" 
    height="600px"
    frameborder="0">
</iframe>
```

---

### 2. **Chat + Vidéo Service** ✅ CRÉÉ

**Fichier:** `widgets/chat-video-widget.html`  
**Fonctionnalités:**
- Feed social type TikTok/Instagram
- Chat en temps réel (1-1 et groupes)
- Appels vidéo P2P (WebRTC)
- Conversations vidéo courtes (Stories)
- Live streaming

**Communication:**
```javascript
// Événements émis
window.parent.postMessage({
    type: 'NEW_MESSAGE_RECEIVED',
    data: { from: 'userId', message: 'Hello!' }
}, '*');

window.parent.postMessage({
    type: 'VIDEO_CALL_STARTED',
    data: { callId: 'abc123', participants: ['user1', 'user2'] }
}, '*');

// Événements écoutés
window.addEventListener('message', (event) => {
    if (event.data.type === 'SEND_MESSAGE') {
        // Envoyer le message
    }
    if (event.data.type === 'START_VIDEO_CALL') {
        // Démarrer l'appel vidéo
    }
});
```

**Intégration iframe:**
```html
<iframe 
    src="widgets/chat-video-widget.html" 
    width="100%" 
    height="800px"
    frameborder="0">
</iframe>
```

---

### 3. **IA Hyper-Personnalisation** ✅ CRÉÉ

**Fichier:** `widgets/ai-personalization-widget.html`  
**Fonctionnalités:**
- Recommandations personnalisées en temps réel
- Insights fan (équipe favorite, joueur préféré, style shopping)
- Prédictions IA (prochain achat, engagement, valeur)
- Coach personnel IA (conseils, opportunités)

**Communication:**
```javascript
// Événements émis
window.parent.postMessage({
    type: 'AI_RECOMMENDATION_CLICKED',
    data: { id: 1, title: 'Match Monaco vs PSG' }
}, '*');

window.parent.postMessage({
    type: 'AI_INSIGHTS_RESPONSE',
    data: {
        favoriteTeam: 'AS Monaco',
        favoritePlayer: 'Wissam Ben Yedder',
        nextPurchaseProbability: 0.87
    }
}, '*');

// Événements écoutés
window.addEventListener('message', (event) => {
    if (event.data.type === 'UPDATE_USER_PREFERENCES') {
        // Recalculer les recommandations
    }
    if (event.data.type === 'REQUEST_AI_INSIGHTS') {
        // Envoyer les insights IA
    }
});
```

**Intégration iframe:**
```html
<iframe 
    src="widgets/ai-personalization-widget.html" 
    width="100%" 
    height="900px"
    frameborder="0">
</iframe>
```

---

### 4. **eSIM Service** ✅ CRÉÉ

**Fichier:** `widgets/esim-widget.html`  
**Fonctionnalités:**
- Liste des forfaits data internationaux (Europe, Monde)
- Activation eSIM via QR code
- Gestion des forfaits actifs (data utilisée, restante, jours)
- Historique de consommation
- Couverture de 35+ pays européens et 120+ pays mondiaux

**Communication:**
```javascript
// Événements émis
window.parent.postMessage({
    type: 'ESIM_WIDGET_READY',
    data: { activeESIM: true, dataRemaining: 53, daysRemaining: 28 }
}, '*');

window.parent.postMessage({
    type: 'ESIM_PLAN_PURCHASE',
    data: { planId: 'europe-unlimited', timestamp: Date.now() }
}, '*');

// Événements écoutés
window.addEventListener('message', (event) => {
    if (event.data.type === 'UPDATE_ESIM_STATUS') {
        // Mise à jour du statut eSIM
    }
    if (event.data.type === 'ACTIVATE_ESIM') {
        // Activer l'eSIM
    }
});
```

**Intégration iframe:**
```html
<iframe 
    src="widgets/esim-widget.html" 
    width="100%" 
    height="700px"
    frameborder="0">
</iframe>
```

---

### 5. **Shop Service** ✅ CRÉÉ

**Fichier:** `widgets/shop-widget.html`  
**Fonctionnalités:**
- Catalogue produits club/fédération (maillots, accessoires, NFT)
- Panier d'achat avec gestion quantités
- Live Shopping interactif (badge LIVE animé)
- Promotions flash (-20%, -15%, etc.)
- Cashback 5% automatique
- Recherche et filtres par catégories

**Communication:**
```javascript
// Événements émis
window.parent.postMessage({
    type: 'PRODUCT_ADDED_TO_CART',
    data: { productId: 1, cartCount: 3 }
}, '*');

window.parent.postMessage({
    type: 'CHECKOUT_INITIATED',
    data: { total: 123.47, items: 3 }
}, '*');

window.parent.postMessage({
    type: 'LIVE_SHOPPING_JOINED',
    data: { liveId: 'live-123' }
}, '*');

// Événements écoutés
window.addEventListener('message', (event) => {
    if (event.data.type === 'UPDATE_CART') {
        // Mise à jour panier
    }
    if (event.data.type === 'APPLY_DISCOUNT') {
        // Appliquer réduction
    }
});
```

**Intégration iframe:**
```html
<iframe 
    src="widgets/shop-widget.html" 
    width="100%" 
    height="900px"
    frameborder="0">
</iframe>
```

---

### 6. **Tickets Service** ✅ CRÉÉ

**Fichier:** `widgets/tickets-widget.html`  
**Fonctionnalités:**
- Billetterie événements sportifs (Ligue 1, Champions League)
- NFT Tickets avec blockchain
- QR codes d'accès sécurisés
- Marketplace secondaire (revente vérifiée)
- Mes billets (gestion complète)
- Filtres par compétition

**Communication:**
```javascript
// Événements émis
window.parent.postMessage({
    type: 'TICKET_PURCHASE_INITIATED',
    data: { eventId: 1, timestamp: Date.now() }
}, '*');

window.parent.postMessage({
    type: 'TICKET_ACTION',
    data: { action: 'sell', ticketId: 1 }
}, '*');

window.parent.postMessage({
    type: 'MARKETPLACE_ITEM_VIEWED',
    data: { itemId: 1 }
}, '*');

// Événements écoutés
window.addEventListener('message', (event) => {
    if (event.data.type === 'UPDATE_TICKETS') {
        // Mise à jour billets
    }
    if (event.data.type === 'REFRESH_EVENTS') {
        // Rafraîchir événements
    }
});
```

**Intégration iframe:**
```html
<iframe 
    src="widgets/tickets-widget.html" 
    width="100%" 
    height="800px"
    frameborder="0">
</iframe>
```

---

## 🧩 WIDGETS AUTONOMES

Chaque widget est **100% autonome** :

✅ **HTML/CSS/JS inclus** (pas de dépendances externes)  
✅ **Communication via `postMessage`**  
✅ **Responsive et mobile-first**  
✅ **Thème dark mode par défaut**  
✅ **Utilisation iframe ou SDK**

### Structure Standard d'un Widget

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Widget Name - PaieCashFan</title>
    <style>
        /* Styles inline */
    </style>
</head>
<body>
    <div class="container">
        <!-- Contenu du widget -->
    </div>

    <script>
        // Communication avec parent
        function sendToParent(type, data) {
            window.parent.postMessage({ type, data }, '*');
        }

        // Écouter les messages du parent
        window.addEventListener('message', (event) => {
            const { type, data } = event.data;
            // Traiter les événements
        });

        // Signal de prêt
        sendToParent('WIDGET_READY', { version: '1.0.0' });
    </script>
</body>
</html>
```

---

## 💻 SDK JAVASCRIPT

**Fichier:** `sdk/paiecashfan-sdk.js`

### Installation

```html
<script src="https://paiecashfan.com/sdk/paiecashfan-sdk.js"></script>
```

### Utilisation

```javascript
// Initialiser le SDK
const pcf = new PaieCashFan({
    apiKey: 'YOUR_API_KEY',
    environment: 'production' // ou 'sandbox'
});

// Module Wallet
pcf.wallet.mount('#wallet-container');
pcf.wallet.on('balanceUpdated', (data) => {
    console.log('Nouveau solde:', data.balance);
});

// Module Chat + Vidéo
pcf.social.mount('#social-container');
pcf.social.on('newMessage', (data) => {
    console.log('Nouveau message:', data.message);
});

// Module IA
pcf.ai.mount('#ai-container');
pcf.ai.on('recommendationClicked', (data) => {
    console.log('Recommandation cliquée:', data.title);
});
```

### API SDK Complète

```javascript
// Wallet
pcf.wallet.getBalance() → Promise<number>
pcf.wallet.sendPayment(to, amount) → Promise<object>
pcf.wallet.getTransactions(limit) → Promise<array>

// Social
pcf.social.sendMessage(userId, message) → Promise<void>
pcf.social.startVideoCall(userId) → Promise<string>
pcf.social.getConversations() → Promise<array>

// IA
pcf.ai.getRecommendations() → Promise<array>
pcf.ai.getInsights() → Promise<object>
pcf.ai.getPredictions() → Promise<object>

// eSIM (bientôt)
pcf.esim.getPlans() → Promise<array>
pcf.esim.activatePlan(planId) → Promise<object>

// Shop (bientôt)
pcf.shop.getProducts() → Promise<array>
pcf.shop.addToCart(productId, quantity) → Promise<void>

// Tickets (bientôt)
pcf.tickets.getEvents() → Promise<array>
pcf.tickets.purchaseTicket(eventId) → Promise<object>
```

---

## 🔌 API REST

Chaque microservice expose une **API REST** complète.

### Base URL
```
Production: https://api.paiecashfan.com/v1
Sandbox: https://sandbox-api.paiecashfan.com/v1
```

### Authentification
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Endpoints

#### Wallet API
```http
GET    /wallet/balance
GET    /wallet/transactions?limit=20&offset=0
POST   /wallet/send
POST   /wallet/deposit
GET    /wallet/assets
```

#### Social API
```http
GET    /social/conversations?limit=20
GET    /social/messages/:conversationId
POST   /social/messages
POST   /social/video-call/start
POST   /social/video-call/end
GET    /social/feed?page=1&limit=10
```

#### IA API
```http
GET    /ai/recommendations
GET    /ai/insights
GET    /ai/predictions
POST   /ai/preferences
```

#### eSIM API (bientôt)
```http
GET    /esim/plans
POST   /esim/activate
GET    /esim/active
```

#### Shop API (bientôt)
```http
GET    /shop/products?club=monaco
POST   /shop/cart/add
GET    /shop/cart
POST   /shop/checkout
```

#### Tickets API (bientôt)
```http
GET    /tickets/events?club=monaco
POST   /tickets/purchase
GET    /tickets/my-tickets
GET    /tickets/:ticketId/qr
```

---

## 📡 COMMUNICATION INTER-WIDGETS

Les widgets communiquent via **`postMessage`** :

### Événements Standards

```javascript
// Widget → Parent
{
    type: 'WIDGET_READY',
    data: { widgetName: 'wallet', version: '1.0.0' }
}

{
    type: 'WIDGET_ERROR',
    data: { error: 'Error message', code: 500 }
}

{
    type: 'WIDGET_ACTION',
    data: { action: 'buttonClicked', payload: {...} }
}

// Parent → Widget
{
    type: 'UPDATE_DATA',
    data: { userId: '123', preferences: {...} }
}

{
    type: 'EXECUTE_ACTION',
    data: { action: 'refreshData' }
}
```

### Exemple Complet

```javascript
// Parent
const walletIframe = document.getElementById('wallet-iframe');

// Écouter les événements du widget
window.addEventListener('message', (event) => {
    if (event.data.type === 'WALLET_BALANCE_UPDATED') {
        console.log('Nouveau solde:', event.data.data.balance);
    }
});

// Envoyer un message au widget
walletIframe.contentWindow.postMessage({
    type: 'UPDATE_WALLET_BALANCE',
    data: { balance: 1500.00 }
}, '*');
```

---

## 🔗 INTÉGRATION

### Option 1: Iframe (Simple)

```html
<div class="paiecashfan-container">
    <!-- Wallet -->
    <iframe src="widgets/wallet-widget.html" width="100%" height="600px"></iframe>
    
    <!-- Social -->
    <iframe src="widgets/chat-video-widget.html" width="100%" height="800px"></iframe>
    
    <!-- IA -->
    <iframe src="widgets/ai-personalization-widget.html" width="100%" height="900px"></iframe>
</div>
```

### Option 2: SDK (Avancé)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Mon Site avec PaieCashFan</title>
    <script src="https://paiecashfan.com/sdk/paiecashfan-sdk.js"></script>
</head>
<body>
    <div id="wallet"></div>
    <div id="social"></div>
    <div id="ai"></div>

    <script>
        const pcf = new PaieCashFan({
            apiKey: 'YOUR_API_KEY',
            environment: 'production'
        });

        // Monter les widgets
        pcf.wallet.mount('#wallet');
        pcf.social.mount('#social');
        pcf.ai.mount('#ai');

        // Écouter les événements
        pcf.wallet.on('balanceUpdated', (data) => {
            console.log('Solde mis à jour:', data.balance);
        });

        pcf.social.on('newMessage', (data) => {
            console.log('Nouveau message:', data.message);
        });

        pcf.ai.on('recommendationClicked', (data) => {
            console.log('Recommandation:', data.title);
        });
    </script>
</body>
</html>
```

### Option 3: API REST (Backend)

```javascript
// Node.js exemple
const axios = require('axios');

const apiClient = axios.create({
    baseURL: 'https://api.paiecashfan.com/v1',
    headers: {
        'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
    }
});

// Récupérer le solde
const balance = await apiClient.get('/wallet/balance');
console.log('Solde:', balance.data.balance);

// Récupérer les recommandations IA
const recommendations = await apiClient.get('/ai/recommendations');
console.log('Recommandations:', recommendations.data);
```

---

## 🔒 SÉCURITÉ

### 1. Authentification JWT

```javascript
// Flux d'authentification
POST /auth/login
{
    "email": "user@example.com",
    "password": "password123"
}

// Réponse
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
}
```

### 2. CORS Policy

```javascript
// Autoriser uniquement les domaines approuvés
Access-Control-Allow-Origin: https://yoursite.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
```

### 3. CSP (Content Security Policy)

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               frame-src https://paiecashfan.com; 
               script-src 'self' https://paiecashfan.com;">
```

### 4. Validation des Messages

```javascript
// Valider l'origine des messages postMessage
window.addEventListener('message', (event) => {
    // Vérifier l'origine
    if (event.origin !== 'https://paiecashfan.com') {
        return; // Ignorer les messages non autorisés
    }
    
    // Traiter le message
    handleMessage(event.data);
});
```

---

## 🚀 DÉPLOIEMENT

### Architecture Infrastructure

```
┌─────────────────────────────────────────┐
│         Load Balancer (Nginx)           │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌────────▼────────┐
│  Frontend CDN  │    │   API Gateway   │
│   (Widgets)    │    │   (REST API)    │
└────────────────┘    └─────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌─────────▼────────┐  ┌────────▼────────┐
│ Wallet Service │  │ Social Service   │  │  IA Service     │
└────────────────┘  └──────────────────┘  └─────────────────┘
        │                     │                     │
┌───────▼────────┐  ┌─────────▼────────┐  ┌────────▼────────┐
│   PostgreSQL   │  │   PostgreSQL     │  │   PostgreSQL    │
│   (Wallet DB)  │  │   (Social DB)    │  │    (IA DB)      │
└────────────────┘  └──────────────────┘  └─────────────────┘
                              │
                    ┌─────────▼────────┐
                    │  Redis Cache     │
                    └──────────────────┘
```

### Docker Compose

```yaml
version: '3.8'

services:
  wallet-service:
    image: paiecashfan/wallet-service:latest
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/wallet_db
      - REDIS_URL=redis://redis:6379

  social-service:
    image: paiecashfan/social-service:latest
    ports:
      - "3002:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/social_db
      - REDIS_URL=redis://redis:6379

  ai-service:
    image: paiecashfan/ai-service:latest
    ports:
      - "3003:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/ai_db
      - REDIS_URL=redis://redis:6379

  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass

  redis:
    image: redis:7-alpine
```

---

## 🤖 RÉSEAU SOCIAL + IA

### Fonctionnalités Réseau Social

✅ **Chat Temps Réel** (WebSocket)  
✅ **Appels Vidéo** (WebRTC P2P)  
✅ **Feed Social** (type TikTok)  
✅ **Stories Vidéo** (format court)  
✅ **Live Streaming** (événements)  
✅ **Réactions** (likes, commentaires, partages)

### Fonctionnalités IA

✅ **Recommandations Personnalisées**
- Contenu pertinent basé sur vos préférences
- Matchs, produits, événements suggérés

✅ **Insights Fan**
- Équipe favorite détectée (87% confiance)
- Joueur préféré identifié (92% confiance)
- Style shopping analysé (78% confiance)

✅ **Prédictions IA**
- Prochain achat probable (87%)
- Engagement futur (3.2x)
- Valeur prévue (142€)
- Niveau futur (Gold)

✅ **Coach Personnel IA**
- Conseils du jour
- Opportunités détectées
- Suggestions automatiques

---

## 📊 STATISTIQUES

### Widgets Créés

| Widget | Statut | Fichier | Taille |
|--------|--------|---------|--------|
| Wallet | ✅ Prêt | `widgets/wallet-widget.html` | 12 KB |
| Chat + Vidéo | ✅ Prêt | `widgets/chat-video-widget.html` | 17 KB |
| IA Personnalisation | ✅ Prêt | `widgets/ai-personalization-widget.html` | 16 KB |
| eSIM | ✅ Prêt | `widgets/esim-widget.html` | 25 KB |
| Shop | ✅ Prêt | `widgets/shop-widget.html` | 24 KB |
| Tickets | ✅ Prêt | `widgets/tickets-widget.html` | 27 KB |

### SDK JavaScript

- **Fichier:** `sdk/paiecashfan-sdk.js`
- **Taille:** 10 KB (minifié)
- **Modules:** Wallet, Social, IA
- **Compatibilité:** ES6+

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ **Widget Wallet** - FAIT
2. ✅ **Widget Chat + Vidéo** - FAIT
3. ✅ **Widget IA Personnalisation** - FAIT
4. ✅ **Widget eSIM** - FAIT
5. ✅ **Widget Shop** - FAIT
6. ✅ **Widget Tickets** - FAIT
7. ✅ **Démo Intégration Complète** - FAIT
8. ⏳ **API REST Backend** - À implémenter
9. ⏳ **Tests d'intégration** - À effectuer
10. ⏳ **Documentation API complète** - À rédiger
11. ⏳ **Déploiement production** - À planifier

---

## 📞 SUPPORT

**Email:** support@paiecashfan.com  
**Discord:** https://discord.gg/paiecashfan  
**Twitter:** @PaieCashFan  
**Documentation:** https://docs.paiecashfan.com

---

**Version:** 2.0.0 | **Date:** 28 Décembre 2025 | **Statut:** ✅ WIDGETS CRÉÉS + DOCUMENTATION COMPLÈTE
