# 📘 ARCHITECTURE PAIECASHFAN V16.0 - GLOBAL PLATFORM

## 🎯 Vue d'Ensemble

PaieCashFan V16.0 est la **première plateforme mondiale** qui permet à n'importe quel club de sport de:
- S'inscrire en 3 minutes avec auto-détection de boutique
- Vendre ses produits sur une marketplace unifiée
- Créer son propre stablecoin (1:1 avec EUR)
- Générer des revenus via la gamification sponsorisée
- Accepter 8 cryptos + carte bancaire + mobile money

---

## 🏗️ Architecture Globale

### Niveaux de l'Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NIVEAU 1 : FRONTEND                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Fan App      │  │ Club Portal  │  │ Sponsor      │     │
│  │ (Mobile/Web) │  │ (Dashboard)  │  │ Dashboard    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  NIVEAU 2 : API GATEWAY                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ REST API (Express.js / Node.js)                      │  │
│  │ - Authentication (JWT + OAuth)                       │  │
│  │ - Rate Limiting                                      │  │
│  │ - Request Validation                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              NIVEAU 3 : SERVICES MÉTIER                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Club     │  │ Market   │  │ Wallet   │  │ Gamifi   │  │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         NIVEAU 4 : INTÉGRATIONS EXTERNES                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Shopify  │  │ WooComm  │  │ Thirdweb │  │ NOWPay   │  │
│  │ API      │  │ API      │  │ SDK      │  │ API      │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              NIVEAU 5 : STOCKAGE DONNÉES                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ MongoDB  │  │ Redis    │  │ IPFS     │  │ Blockchain│  │
│  │ (BDD)    │  │ (Cache)  │  │ (Files)  │  │ (Ledger) │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Modules Clés

### 1. **Club Service** - Gestion des Clubs

**Responsabilités:**
- Inscription/Onboarding des clubs
- Auto-détection de boutique (Shopify, WooCommerce, PrestaShop)
- Profil et configuration club
- Gestion des stablecoins club
- Analytics et statistiques

**API Endpoints:**
```
POST   /api/clubs/register          → Inscription nouveau club
GET    /api/clubs/:slug             → Récupérer infos club
PUT    /api/clubs/:slug             → Modifier club
DELETE /api/clubs/:slug             → Supprimer club
POST   /api/clubs/:slug/detect-shop → Auto-détection boutique
GET    /api/clubs/:slug/analytics   → Analytics club
```

**Base de Données:**
```javascript
// Collection: clubs
{
  _id: ObjectId,
  slug: "as-monaco",
  name: "AS Monaco",
  sport: "football",
  league: "Ligue 1",
  country: "France",
  website: "https://www.asmonaco.com",
  contactEmail: "contact@asmonaco.com",
  shop: {
    type: "shopify", // "shopify", "woocommerce", "prestashop", "native", "none"
    url: "https://boutique.asmonaco.com",
    apiKey: "encrypted_key",
    productsCount: 250,
    lastSync: ISODate("2025-12-27T00:00:00Z")
  },
  stablecoin: {
    enabled: true,
    symbol: "ASC",
    name: "AS Monaco Coin",
    totalSupply: 10000000,
    contractAddress: "0x...",
    network: "polygon"
  },
  gamification: {
    enabled: true,
    activeSponsors: ["nike", "adidas"],
    revenueShare: 0.70 // Club gets 70%
  },
  status: "active", // "pending", "active", "suspended"
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

### 2. **Marketplace Service** - Catalogue Unifié

**Responsabilités:**
- Import/Sync produits depuis boutiques externes
- Upload produits pour clubs sans boutique
- Recherche multi-clubs
- Gestion catégories, tags, filtres
- Gestion stock et prix

**API Endpoints:**
```
GET    /api/products                → Liste tous les produits (pagination)
GET    /api/products/:id            → Détails produit
POST   /api/products                → Créer produit (clubs sans boutique)
PUT    /api/products/:id            → Modifier produit
DELETE /api/products/:id            → Supprimer produit
GET    /api/products/search         → Recherche produits
GET    /api/products/club/:slug     → Produits d'un club
POST   /api/products/import         → Import depuis boutique externe
```

**Base de Données:**
```javascript
// Collection: products
{
  _id: ObjectId,
  clubSlug: "as-monaco",
  externalId: "shopify_12345", // ID source externe (si sync)
  name: "Maillot Domicile AS Monaco 2024/25",
  description: "Maillot officiel...",
  price: 94.99,
  currency: "EUR",
  images: [
    "https://cdn.asmonaco.com/product1.jpg",
    "https://cdn.asmonaco.com/product1_back.jpg"
  ],
  category: "Maillots",
  tags: ["nouveau", "domicile", "2024-2025"],
  variants: [
    { size: "M", color: "Rouge/Blanc", stock: 50, sku: "ASM-ML-DOM-M" },
    { size: "L", color: "Rouge/Blanc", stock: 30, sku: "ASM-ML-DOM-L" }
  ],
  specifications: {
    composition: "100% Polyester recyclé",
    brand: "Kappa",
    technology: "Dri-FIT"
  },
  stock: 80,
  available: true,
  source: "shopify", // "shopify", "woocommerce", "prestashop", "native"
  syncedAt: ISODate,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

### 3. **Wallet Service** - Multi-Devises

**Responsabilités:**
- Création wallet In-App (Thirdweb)
- Gestion multi-devises (EUR, USDC, BTC, ETH, Stablecoins Clubs)
- Conversion automatique en temps réel
- Historique transactions
- KYC/AML compliance

**API Endpoints:**
```
POST   /api/wallet/create           → Créer wallet user
GET    /api/wallet/:userId          → Infos wallet
GET    /api/wallet/:userId/balance  → Soldes multi-devises
POST   /api/wallet/deposit          → Dépôt (crypto/carte)
POST   /api/wallet/withdraw         → Retrait
POST   /api/wallet/convert          → Conversion EUR↔Crypto↔Stablecoin
GET    /api/wallet/transactions     → Historique
POST   /api/wallet/transfer         → Transfer user à user
```

**Base de Données:**
```javascript
// Collection: wallets
{
  _id: ObjectId,
  userId: ObjectId,
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Thirdweb address
  balances: {
    EUR: 625.00,
    USDC: 847.30,
    BTC: 0.012,
    ETH: 0.25,
    OMC: 2450.00,  // Olympique Marseille Coin
    PSC: 150.00,   // Paris Saint-Germain Coin
    ASC: 50.00,    // AS Monaco Coin
    OLC: 75.00,    // Olympique Lyonnais Coin
    LSC: 100.00,   // LOSC Lille Coin
    RCL: 80.00     // RC Lens Coin
  },
  kycStatus: "verified", // "pending", "verified", "rejected"
  kycLevel: 2, // 0: None, 1: Basic, 2: Full
  createdAt: ISODate,
  updatedAt: ISODate
}

// Collection: transactions
{
  _id: ObjectId,
  userId: ObjectId,
  walletId: ObjectId,
  type: "deposit", // "deposit", "withdraw", "transfer", "purchase", "convert"
  fromCurrency: "EUR",
  toCurrency: "ASC",
  amount: 50.00,
  fee: 0.00, // 0% pour stablecoins clubs
  exchangeRate: 1.00, // 1:1 parité
  status: "completed", // "pending", "completed", "failed"
  metadata: {
    productId: ObjectId, // Si achat
    clubSlug: "as-monaco",
    paymentMethod: "card" // "crypto", "card", "mobile_money"
  },
  createdAt: ISODate
}
```

---

### 4. **Gamification Service** - Quiz/Votes/Analytics

**Responsabilités:**
- Dashboard sponsor (création campagnes)
- Gestion quiz, votes, challenges
- Attribution récompenses automatiques
- Analytics temps réel (impressions, clics, conversions)
- Revenue sharing (Club 70% - Platform 30%)

**API Endpoints:**
```
POST   /api/gamification/campaigns          → Créer campagne sponsor
GET    /api/gamification/campaigns          → Liste campagnes
GET    /api/gamification/campaigns/:id      → Détails campagne
POST   /api/gamification/quiz               → Créer quiz
POST   /api/gamification/vote               → Créer vote ("Homme du Match")
POST   /api/gamification/participate        → User participe
GET    /api/gamification/analytics/:id      → Analytics campagne
POST   /api/gamification/payout             → Déclencher paiement revenue share
```

**Base de Données:**
```javascript
// Collection: campaigns
{
  _id: ObjectId,
  sponsorId: ObjectId,
  clubSlug: "as-monaco",
  name: "Homme du Match - Nike",
  type: "vote", // "quiz", "vote", "challenge"
  description: "Votez pour l'homme du match AS Monaco vs PSG",
  startDate: ISODate,
  endDate: ISODate,
  budget: 5000.00, // EUR
  targetAudience: {
    country: ["France", "Monaco"],
    ageRange: [18, 45],
    interests: ["football", "as-monaco"]
  },
  rewards: {
    type: "stablecoin", // "stablecoin", "nft", "discount"
    amount: 10, // 10 ASC par participant
    winnersCount: 100
  },
  analytics: {
    impressions: 25000,
    clicks: 8500,
    participations: 3200,
    conversions: 120, // Achats après participation
    revenueGenerated: 4800.00,
    costPerParticipation: 1.56
  },
  status: "active", // "pending", "active", "completed", "cancelled"
  createdAt: ISODate,
  updatedAt: ISODate
}

// Collection: participations
{
  _id: ObjectId,
  campaignId: ObjectId,
  userId: ObjectId,
  clubSlug: "as-monaco",
  answers: {
    question1: "Mbappé",
    question2: "Paris"
  },
  rewardClaimed: true,
  rewardAmount: 10, // 10 ASC
  participatedAt: ISODate
}
```

---

### 5. **Payment Service** - Multi-Providers

**Responsabilités:**
- Intégration NOWPayments (8 cryptos)
- Intégration Stripe (carte bancaire)
- Intégration Mobile Money (Orange Money, MTN Money, etc.)
- Smart Checkout (panier multi-clubs)
- Conversion automatique
- Facturation et reçus

**API Endpoints:**
```
POST   /api/payment/checkout        → Créer session paiement
POST   /api/payment/confirm         → Confirmer paiement
GET    /api/payment/:id             → Status paiement
POST   /api/payment/refund          → Remboursement
GET    /api/payment/methods         → Méthodes disponibles
POST   /api/payment/convert         → Conversion avant achat
```

**Providers Intégrés:**
```javascript
// NOWPayments (Cryptos)
{
  provider: "nowpayments",
  currencies: ["BTC", "ETH", "USDT", "USDC", "BNB", "MATIC", "SOL", "ADA"],
  fees: "0.5%",
  settlementTime: "10-60 min"
}

// Stripe (Carte Bancaire)
{
  provider: "stripe",
  methods: ["card", "sepa_debit"],
  fees: "1.4% + 0.25€",
  settlementTime: "instant"
}

// Mobile Money (Afrique)
{
  provider: "flutterwave",
  methods: ["orange_money", "mtn_money", "moov_money", "airtel_money"],
  fees: "1-3%",
  regions: ["West Africa", "East Africa", "Central Africa"]
}
```

---

## 🔄 Flux de Données

### Flux 1 : Inscription Club

```
1. Club remplit formulaire (inscription-club-v16.html)
   ↓
2. Frontend envoie POST /api/clubs/register
   {
     name: "AS Monaco",
     sport: "football",
     website: "https://www.asmonaco.com",
     shopUrl: "https://boutique.asmonaco.com"
   }
   ↓
3. Backend vérifie si club existe déjà
   ↓
4. Si shopUrl fourni → POST /api/clubs/:slug/detect-shop
   - Scraping HTML de la boutique
   - Détection patterns (Shopify, WooCommerce, PrestaShop)
   - Test appels API (/products, /admin/api/products.json)
   - Comptage produits disponibles
   ↓
5. Création enregistrement club dans MongoDB
   ↓
6. Si stablecoin activé → Déploiement smart contract ERC20
   - Nom: "AS Monaco Coin"
   - Symbol: "ASC"
   - Supply: 10,000,000 ASC
   - Network: Polygon (gas fees bas)
   ↓
7. Envoi email de bienvenue + guide onboarding
   ↓
8. Redirection vers Dashboard Club avec token d'accès
```

### Flux 2 : Achat Fan (Parcours Complet)

```
1. Fan découvre app → inscription.html
   ↓
2. Création compte + wallet Thirdweb In-App
   POST /api/wallet/create
   ↓
3. Fan dépose 100 EUR (carte bancaire via Stripe)
   POST /api/payment/checkout
   {
     amount: 100.00,
     currency: "EUR",
     method: "card"
   }
   ↓
4. Wallet balance: EUR 100.00
   ↓
5. Fan navigue vers produits AS Monaco
   GET /api/products/club/as-monaco
   ↓
6. Fan ajoute produit au panier (Maillot 94.99 EUR)
   ↓
7. Checkout → Option "Payer en ASC (AS Monaco Coin)"
   POST /api/payment/convert
   {
     from: "EUR",
     to: "ASC",
     amount: 94.99
   }
   ↓
8. Conversion instantanée: 94.99 EUR → 94.99 ASC (parité 1:1)
   Nouveau balance: EUR 5.01, ASC 0.00 (dépensé)
   ↓
9. Achat confirmé
   POST /api/payment/confirm
   {
     products: [{ id: "...", quantity: 1 }],
     total: 94.99,
     currency: "ASC",
     clubSlug: "as-monaco"
   }
   ↓
10. Club reçoit 94.99 ASC dans son wallet
    ↓
11. Gamification déclenchée : +50 points fidélité, badge "Premier Achat ASM"
```

### Flux 3 : Gamification Sponsorisée

```
1. Sponsor (Nike) crée campagne via Dashboard
   POST /api/gamification/campaigns
   {
     type: "vote",
     name: "Homme du Match - AS Monaco vs PSG",
     budget: 5000 EUR,
     rewards: { amount: 10, currency: "ASC" },
     targetAudience: { country: ["France"], interests: ["football"] }
   }
   ↓
2. Campagne apparaît dans app (section Gamification)
   ↓
3. Fan participe au vote
   POST /api/gamification/participate
   {
     campaignId: "...",
     vote: "Kylian Mbappé"
   }
   ↓
4. Récompense automatique : +10 ASC dans wallet fan
   POST /api/wallet/deposit
   {
     userId: "...",
     amount: 10,
     currency: "ASC",
     type: "reward",
     source: "campaign_nike_homme_du_match"
   }
   ↓
5. Analytics temps réel mises à jour
   - Impressions +1
   - Participations +1
   - Cost par participation recalculé
   ↓
6. Fin de campagne → Revenue Sharing
   - Budget dépensé: 3200 participations × 10 ASC = 32,000 ASC (≈ 32,000 EUR)
   - Club reçoit: 70% = 22,400 EUR
   - PaieCashFan reçoit: 30% = 9,600 EUR
   POST /api/gamification/payout
```

---

## 🔐 Sécurité & Compliance

### 1. **Authentication & Authorization**

```javascript
// JWT Token Structure
{
  userId: "507f1f77bcf86cd799439011",
  email: "fan@example.com",
  role: "user", // "user", "club", "sponsor", "admin"
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  iat: 1703635200,
  exp: 1703721600 // 24h expiration
}

// Middlewares de protection
router.get('/api/wallet/:userId', 
  authenticate,           // Vérifier JWT valide
  authorize(['user']),    // Vérifier rôle
  checkWalletOwnership,   // Vérifier propriété wallet
  getWallet
);
```

### 2. **KYC/AML (Know Your Customer)**

**Niveaux KYC:**
- **Niveau 0** : Aucune vérification → Limite 100 EUR/mois
- **Niveau 1** : Email + Téléphone → Limite 1,000 EUR/mois
- **Niveau 2** : ID + Selfie + Adresse → Limite 10,000 EUR/mois

**Providers KYC:**
- **Sumsub** (Intégration API)
- **Onfido** (Backup)
- **Veriff** (Alternative)

### 3. **Encryption & Storage**

```javascript
// Encryption des données sensibles
const encryptAPIKey = (apiKey) => {
  const cipher = crypto.createCipher('aes-256-gcm', process.env.ENCRYPTION_KEY);
  return cipher.update(apiKey, 'utf8', 'hex') + cipher.final('hex');
};

// Variables d'environnement (.env)
ENCRYPTION_KEY=random_32_char_key
JWT_SECRET=random_64_char_secret
STRIPE_SECRET_KEY=sk_live_...
NOWPAYMENTS_API_KEY=...
SHOPIFY_API_KEY=...
WOOCOMMERCE_CONSUMER_KEY=...
WOOCOMMERCE_CONSUMER_SECRET=...
THIRDWEB_CLIENT_ID=...
THIRDWEB_SECRET_KEY=...
```

### 4. **Rate Limiting & DDoS Protection**

```javascript
// Express Rate Limiter
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max
  message: 'Trop de requêtes depuis cette IP, réessayez dans 15 minutes'
});

app.use('/api/', apiLimiter);
```

---

## 📊 Analytics & Monitoring

### 1. **Métriques Clés (KPIs)**

**Clubs:**
- Nombre de clubs inscrits
- Produits vendus / club
- Revenue moyen / club
- Taux d'activation stablecoin

**Fans:**
- Users actifs (DAU, MAU)
- Transactions / user
- Average transaction value
- Retention rate (D1, D7, D30)

**Marketplace:**
- GMV (Gross Merchandise Value)
- Conversion rate
- Average basket size
- Top produits / top clubs

**Gamification:**
- Campagnes actives
- Participation rate
- Revenue par campagne
- Cost per participation

### 2. **Stack Monitoring**

```javascript
// Prometheus + Grafana
- Uptime API
- Response time moyenne
- Error rate (4xx, 5xx)
- Database queries/sec
- Cache hit rate (Redis)

// Sentry (Error Tracking)
- JavaScript errors (frontend)
- API errors (backend)
- Smart contract errors
- Payment failures

// LogRocket (Session Replay)
- User journey replay
- Console logs
- Network requests
- Performance metrics
```

---

## 🚀 Déploiement & Scaling

### 1. **Infrastructure Cloud**

**Option A : AWS**
```
- EC2 (API servers) × 3 instances
- RDS (MongoDB) managed database
- ElastiCache (Redis) pour cache
- S3 (Static files + IPFS mirror)
- CloudFront (CDN)
- Route 53 (DNS)
- Load Balancer (ALB)
```

**Option B : Vercel + MongoDB Atlas**
```
- Vercel (Frontend + Serverless API)
- MongoDB Atlas (Database)
- Redis Cloud (Cache)
- Cloudflare (CDN)
```

### 2. **Scaling Strategy**

**Horizontal Scaling:**
- API replicas avec Load Balancer
- Database sharding (par région géographique)
- Cache distribué (Redis Cluster)

**Vertical Scaling:**
- Plus de CPU/RAM si nécessaire
- SSD storage pour MongoDB

**CDN & Caching:**
- Static assets (images, CSS, JS) → CDN
- API responses caching (Redis) → 5 min TTL
- Product catalog caching → 1 hour TTL

---

## ✅ Checklist Implémentation V16.0

### Phase 1 : Marketplace & Auto-Onboarding ✅
- [x] Page inscription club (inscription-club-v16.html)
- [x] Auto-détection boutique (Shopify, WooCommerce, PrestaShop)
- [ ] Marketplace native (upload produits)
- [ ] Catalogue unifié multi-clubs
- [ ] API Club Service (`POST /api/clubs/register`)
- [ ] API Marketplace Service (`GET /api/products`, `POST /api/products`)

### Phase 2 : Paiement Multi-Token
- [ ] Wallet multi-devises (EUR, USDC, Stablecoins clubs)
- [ ] Conversion automatique en temps réel
- [ ] Smart Checkout (panier multi-clubs)
- [ ] API Wallet Service (`POST /api/wallet/convert`)
- [ ] Intégration NOWPayments (8 cryptos)
- [ ] Intégration Stripe (carte)

### Phase 3 : Gamification Sponsorisée
- [ ] Dashboard Sponsor (création campagnes)
- [ ] Quiz/Votes/Challenges
- [ ] Analytics temps réel
- [ ] Revenue Sharing automatique (70%/30%)
- [ ] API Gamification Service

---

## 📞 Support & Contact

**Email** : support@paiecashfan.com  
**Discord** : [PaieCashFan Community]  
**Twitter** : @PaieCashFan  
**GitHub** : github.com/paiecashfan

---

**Version** : V16.0.0 - Global Platform  
**Date** : 27 Décembre 2025  
**Auteur** : PaieCashFan Team  
**Statut** : 🚧 En Développement (Phase 1 en cours)
