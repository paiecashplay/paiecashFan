# 🚀 PaieCashFan REST API

Backend REST API pour l'architecture microservices PaieCashFan.

---

## 📋 TABLE DES MATIÈRES

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Démarrage](#démarrage)
4. [Endpoints API](#endpoints-api)
5. [Authentification](#authentification)
6. [Exemples d'utilisation](#exemples-dutilisation)
7. [Tests](#tests)
8. [Déploiement](#déploiement)

---

## 🔧 INSTALLATION

### Prérequis

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14 (optionnel)
- Redis >= 7 (optionnel)

### Installation des dépendances

```bash
cd api
npm install
```

---

## ⚙️ CONFIGURATION

1. Copier le fichier `.env.example` en `.env`:

```bash
cp .env.example .env
```

2. Éditer `.env` avec vos valeurs:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=votre-secret-jwt-securise
```

---

## 🚀 DÉMARRAGE

### Mode développement (avec auto-reload)

```bash
npm run dev
```

### Mode production

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

---

## 📚 ENDPOINTS API

### Base URL

```
http://localhost:3000/api
```

### 🔐 Authentification

#### POST /api/auth/register

Inscription d'un nouvel utilisateur.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "clubId": "AS_MONACO"
}
```

**Response:**
```json
{
  "message": "Inscription réussie",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "clubId": "AS_MONACO"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "wallet": {
    "id": "uuid",
    "balance": 100.00
  }
}
```

#### POST /api/auth/login

Connexion d'un utilisateur.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "clubId": "AS_MONACO"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 💰 Wallet

Toutes les routes Wallet nécessitent l'authentification JWT.

**Header requis:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### GET /api/wallet/balance

Récupérer le solde du wallet.

**Response:**
```json
{
  "balance": 1247.50,
  "currency": "EUR",
  "assets": [
    {
      "symbol": "PAIECASH_USD",
      "balance": 1247.50,
      "valueEUR": 1247.50
    },
    {
      "symbol": "BTC",
      "balance": 0.0012,
      "valueEUR": 45.23
    }
  ]
}
```

#### GET /api/wallet/transactions

Récupérer l'historique des transactions.

**Query params:**
- `limit` (default: 20): Nombre de transactions
- `offset` (default: 0): Décalage

**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "deposit",
      "amount": 100.00,
      "currency": "EUR",
      "timestamp": 1735389600000,
      "status": "completed"
    }
  ],
  "total": 10
}
```

#### POST /api/wallet/send

Envoyer de l'argent.

**Request:**
```json
{
  "recipientId": "uuid",
  "amount": 50.00,
  "currency": "EUR"
}
```

**Response:**
```json
{
  "message": "Envoi réussi",
  "transaction": {
    "id": "uuid",
    "amount": -50.00,
    "recipient": "uuid",
    "timestamp": 1735389600000
  },
  "newBalance": 1197.50
}
```

#### POST /api/wallet/deposit

Déposer de l'argent.

**Request:**
```json
{
  "amount": 100.00,
  "method": "card"
}
```

**Response:**
```json
{
  "message": "Dépôt réussi",
  "transaction": {
    "id": "uuid",
    "amount": 100.00,
    "method": "card",
    "timestamp": 1735389600000
  },
  "newBalance": 1347.50
}
```

---

### 📡 eSIM

#### GET /api/esim/plans

Récupérer les forfaits eSIM disponibles (pas d'auth requise).

**Response:**
```json
{
  "plans": [
    {
      "id": "europe-unlimited",
      "name": "Europe Unlimited",
      "region": "Europe",
      "data": "100 GB",
      "duration": 30,
      "countries": 35,
      "price": 19.99,
      "currency": "EUR",
      "popular": true
    }
  ]
}
```

#### POST /api/esim/activate

Activer un forfait eSIM (auth requise).

**Request:**
```json
{
  "planId": "europe-unlimited"
}
```

**Response:**
```json
{
  "message": "eSIM activé avec succès",
  "esim": {
    "id": "uuid",
    "planId": "europe-unlimited",
    "activatedAt": 1735389600000,
    "expiresAt": 1737981600000,
    "dataTotal": 100,
    "dataUsed": 0,
    "status": "active",
    "qrCode": "QR-ABC12345"
  },
  "newBalance": 1227.51
}
```

#### GET /api/esim/active

Récupérer l'eSIM actif (auth requise).

**Response:**
```json
{
  "esim": {
    "id": "uuid",
    "planId": "europe-unlimited",
    "dataTotal": 100,
    "dataUsed": 47,
    "status": "active",
    "qrCode": "QR-ABC12345"
  }
}
```

---

### 🛍️ Shop

#### GET /api/shop/products

Récupérer les produits (pas d'auth requise).

**Query params:**
- `club` (default: AS_MONACO): ID du club
- `category` (default: all): jerseys, accessories, training, nft

**Response:**
```json
{
  "products": [
    {
      "id": "1",
      "name": "Maillot Domicile 2025/26",
      "club": "AS_MONACO",
      "category": "jerseys",
      "price": 79.99,
      "oldPrice": 99.99,
      "discount": 20,
      "stock": 142
    }
  ]
}
```

#### POST /api/shop/cart/add

Ajouter au panier (auth requise).

**Request:**
```json
{
  "productId": "1",
  "quantity": 2
}
```

**Response:**
```json
{
  "message": "Produit ajouté au panier",
  "cart": {
    "items": [
      {
        "productId": "1",
        "quantity": 2,
        "addedAt": 1735389600000
      }
    ]
  },
  "itemCount": 2
}
```

#### GET /api/shop/cart

Récupérer le panier (auth requise).

**Response:**
```json
{
  "cart": {
    "items": [
      {
        "productId": "1",
        "quantity": 2
      }
    ]
  }
}
```

#### POST /api/shop/checkout

Payer le panier (auth requise).

**Request:**
```json
{
  "total": 159.98
}
```

**Response:**
```json
{
  "message": "Commande confirmée",
  "order": {
    "id": "uuid",
    "items": [...],
    "total": 159.98,
    "status": "confirmed"
  },
  "newBalance": 1087.52
}
```

---

### 🎟️ Tickets

#### GET /api/tickets/events

Récupérer les événements (pas d'auth requise).

**Query params:**
- `club` (default: AS_MONACO): ID du club

**Response:**
```json
{
  "events": [
    {
      "id": "1",
      "title": "AS Monaco vs Paris Saint-Germain",
      "date": 1739620800000,
      "venue": "Stade Louis II, Monaco",
      "competition": "Ligue 1",
      "priceFrom": 49.99,
      "seatsAvailable": 142,
      "hot": true
    }
  ]
}
```

#### POST /api/tickets/purchase

Acheter un billet (auth requise).

**Request:**
```json
{
  "eventId": "1",
  "category": "premium",
  "price": 89.99
}
```

**Response:**
```json
{
  "message": "Billet acheté avec succès",
  "ticket": {
    "id": "uuid",
    "eventId": "1",
    "category": "premium",
    "price": 89.99,
    "qrCode": "TICKET-ABC12345",
    "nft": true,
    "blockchain": {
      "network": "Polygon",
      "tokenId": 123456
    },
    "status": "valid"
  },
  "newBalance": 1157.51
}
```

#### GET /api/tickets/my-tickets

Récupérer mes billets (auth requise).

**Response:**
```json
{
  "tickets": [
    {
      "id": "uuid",
      "eventId": "1",
      "qrCode": "TICKET-ABC12345",
      "status": "valid"
    }
  ]
}
```

#### GET /api/tickets/:ticketId/qr

Récupérer le QR code (auth requise).

**Response:**
```json
{
  "qrCode": "TICKET-ABC12345",
  "ticketId": "uuid",
  "eventId": "1"
}
```

---

### 💬 Social

#### GET /api/social/conversations

Récupérer les conversations (auth requise).

**Response:**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "participants": ["uuid1", "uuid2"],
      "lastMessage": "Salut!",
      "timestamp": 1735389600000
    }
  ]
}
```

#### POST /api/social/messages

Envoyer un message (auth requise).

**Request:**
```json
{
  "conversationId": "uuid",
  "message": "Hello!"
}
```

**Response:**
```json
{
  "message": "Message envoyé",
  "data": {
    "id": "uuid",
    "conversationId": "uuid",
    "message": "Hello!",
    "timestamp": 1735389600000
  }
}
```

#### GET /api/social/feed

Récupérer le feed social (auth requise).

**Query params:**
- `page` (default: 1): Numéro de page
- `limit` (default: 10): Posts par page

**Response:**
```json
{
  "feed": [
    {
      "id": "1",
      "type": "live",
      "author": {
        "id": "club_monaco",
        "name": "AS Monaco"
      },
      "content": "Match en direct !",
      "likes": 2347,
      "comments": 156,
      "timestamp": 1735389600000
    }
  ],
  "page": 1,
  "total": 2
}
```

---

### 🤖 IA

#### GET /api/ai/recommendations

Récupérer les recommandations IA (auth requise).

**Response:**
```json
{
  "recommendations": [
    {
      "id": "1",
      "type": "event",
      "title": "Match Monaco vs PSG",
      "content": "Votre équipe favorite joue dimanche !",
      "tags": ["Match", "Billet"],
      "confidence": 0.92
    }
  ]
}
```

#### GET /api/ai/insights

Récupérer les insights utilisateur (auth requise).

**Response:**
```json
{
  "insights": {
    "favoriteTeam": {
      "name": "AS Monaco",
      "confidence": 0.87
    },
    "favoritePlayer": {
      "name": "Wissam Ben Yedder",
      "confidence": 0.92
    },
    "shoppingStyle": {
      "style": "Premium",
      "confidence": 0.78
    }
  }
}
```

#### GET /api/ai/predictions

Récupérer les prédictions IA (auth requise).

**Response:**
```json
{
  "predictions": {
    "nextPurchase": {
      "probability": 0.87,
      "category": "jerseys",
      "estimatedAmount": 79.99,
      "timeframe": "7 days"
    }
  }
}
```

---

### 📊 System

#### GET /api/health

Vérifier l'état du serveur (pas d'auth requise).

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": 1735389600000,
  "services": {
    "auth": "operational",
    "wallet": "operational",
    "esim": "operational",
    "shop": "operational",
    "tickets": "operational",
    "social": "operational",
    "ai": "operational"
  }
}
```

#### GET /api/stats

Statistiques globales (pas d'auth requise).

**Response:**
```json
{
  "users": 1234,
  "wallets": 1234,
  "transactions": 5678,
  "esimActive": 456,
  "products": 6,
  "orders": 234,
  "events": 3,
  "tickets": 123
}
```

---

## 🔐 AUTHENTIFICATION

Toutes les routes protégées nécessitent un token JWT dans le header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Obtenir un token

1. S'inscrire via `/api/auth/register`
2. Ou se connecter via `/api/auth/login`
3. Utiliser le `token` retourné dans les requêtes suivantes

### Exemple avec curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Utiliser le token
curl http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🧪 EXEMPLES D'UTILISATION

### JavaScript (Fetch API)

```javascript
// Login
const login = async () => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'password123'
    })
  });
  const data = await response.json();
  return data.token;
};

// Get wallet balance
const getBalance = async (token) => {
  const response = await fetch('http://localhost:3000/api/wallet/balance', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

// Usage
const token = await login();
const balance = await getBalance(token);
console.log('Balance:', balance.balance);
```

### Node.js (Axios)

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Login
const login = async () => {
  const { data } = await api.post('/auth/login', {
    email: 'user@example.com',
    password: 'password123'
  });
  return data.token;
};

// Set token
const setToken = (token) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Get balance
const getBalance = async () => {
  const { data } = await api.get('/wallet/balance');
  return data;
};

// Usage
const token = await login();
setToken(token);
const balance = await getBalance();
console.log('Balance:', balance.balance);
```

---

## 🧪 TESTS

Lancer les tests:

```bash
npm test
```

Avec couverture:

```bash
npm test -- --coverage
```

---

## 🚀 DÉPLOIEMENT

### Docker

1. Créer une image Docker:

```bash
docker build -t paiecashfan-api .
```

2. Lancer le conteneur:

```bash
docker run -p 3000:3000 \
  -e JWT_SECRET=your-secret \
  -e DATABASE_URL=postgresql://... \
  paiecashfan-api
```

### Production

1. Installer les dépendances:

```bash
npm ci --production
```

2. Configurer les variables d'environnement

3. Démarrer le serveur:

```bash
NODE_ENV=production npm start
```

---

## 📝 LICENCE

© 2025 PaieCashFan. Tous droits réservés.

---

## 📞 SUPPORT

- Email: support@paiecashfan.com
- Discord: https://discord.gg/paiecashfan
- Documentation: https://docs.paiecashfan.com
