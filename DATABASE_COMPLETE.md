# ✅ CONNEXION POSTGRESQL + REDIS - COMPLET

**Date:** 28 Décembre 2025  
**Version:** 2.0.0  
**Statut:** ✅ BASES DE DONNÉES CONNECTÉES

---

## 🎉 CE QUI A ÉTÉ CRÉÉ

| Fichier | Description | Taille |
|---------|-------------|--------|
| **api/config/database.js** | Configuration PostgreSQL | 13 KB |
| **api/config/redis.js** | Configuration Redis | 12 KB |
| **api/server-with-db.js** | Serveur avec vraies BDD | 24 KB |
| **api/migrations/001_initial_schema.sql** | Schema SQL complet | 10 KB |
| **api/QUICKSTART.md** | Guide de démarrage rapide | 8 KB |
| **DATABASE_COMPLETE.md** | Ce fichier | - |

---

## 📊 ARCHITECTURE DES BASES

### PostgreSQL - 13 Tables

```
users                      # Utilisateurs
  ├── id (UUID)
  ├── email (unique)
  ├── password (hashed)
  ├── name
  ├── club_id
  └── timestamps

wallets                    # Portefeuilles
  ├── id (UUID)
  ├── user_id (FK → users)
  ├── balance (DECIMAL)
  ├── currency
  └── assets (JSONB)

transactions               # Transactions
  ├── id (UUID)
  ├── user_id (FK → users)
  ├── type (deposit, send, purchase, etc.)
  ├── amount
  ├── currency
  └── metadata (recipient, order_id, etc.)

esim_plans                 # Forfaits eSIM
  ├── id
  ├── name
  ├── region
  ├── data
  ├── duration
  ├── countries
  ├── price
  └── popular (boolean)

esim_active                # eSIM actifs
  ├── id (UUID)
  ├── user_id (FK → users, UNIQUE)
  ├── plan_id
  ├── activated_at
  ├── expires_at
  ├── data_total
  ├── data_used
  └── qr_code

products                   # Produits shop
  ├── id
  ├── name
  ├── club
  ├── category
  ├── price
  ├── old_price
  ├── discount
  ├── stock
  └── nft (boolean)

cart                       # Paniers
  ├── id (UUID)
  ├── user_id (FK → users)
  ├── product_id
  ├── quantity
  └── added_at

orders                     # Commandes
  ├── id (UUID)
  ├── user_id (FK → users)
  ├── items (JSONB)
  ├── total
  ├── status
  └── created_at

events                     # Événements sportifs
  ├── id
  ├── title
  ├── club
  ├── date
  ├── venue
  ├── competition
  ├── price_from
  ├── seats_available
  └── hot/vip (boolean)

tickets                    # Billets NFT
  ├── id (UUID)
  ├── user_id (FK → users)
  ├── event_id
  ├── category
  ├── price
  ├── qr_code
  ├── nft (boolean)
  ├── blockchain (JSONB)
  └── status

conversations              # Conversations
  ├── id (UUID)
  ├── participants (UUID[])
  ├── last_message
  └── timestamps

messages                   # Messages
  ├── id (UUID)
  ├── conversation_id (FK → conversations)
  ├── user_id (FK → users)
  ├── message
  ├── timestamp
  └── read (boolean)

ai_recommendations         # Recommandations IA
  ├── id (UUID)
  ├── user_id (FK → users)
  ├── type
  ├── title
  ├── content
  ├── tags (JSONB)
  └── confidence

ai_insights                # Insights IA
  ├── id (UUID)
  ├── user_id (FK → users, UNIQUE)
  ├── favorite_team (JSONB)
  ├── favorite_player (JSONB)
  ├── shopping_style (JSONB)
  ├── predictions
  └── updated_at
```

### Redis - Structure du Cache

```
# User data
user:{userId}                      # Infos utilisateur (TTL: 30min)

# Wallet
wallet:balance:{userId}            # Solde (TTL: 1min)
transactions:{userId}              # Historique (TTL: 5min)

# eSIM
esim:plans                         # Tous les forfaits (TTL: 1h)
esim:active:{userId}               # eSIM actif (TTL: 5min)

# Shop
products:{club}:{category}         # Produits (TTL: 30min)
cart:{userId}                      # Panier (TTL: 1h)

# Tickets
events:{club}                      # Événements (TTL: 5min)
tickets:{userId}                   # Mes billets (TTL: 5min)

# Social
conversations:{userId}             # Conversations (TTL: 5min)
feed:{userId}:{page}               # Feed social (TTL: 1min)

# IA
ai:recommendations:{userId}        # Recommandations (TTL: 5min)
ai:insights:{userId}               # Insights (TTL: 30min)
ai:predictions:{userId}            # Prédictions (TTL: 30min)

# System
stats:global                       # Stats (TTL: 1min)
rate:{ip}:{endpoint}               # Rate limiting (TTL: 15min)
```

---

## 🚀 DÉMARRAGE

### Option 1: Docker Compose (Tout-en-un)

```bash
# Démarrer tout
docker-compose up -d

# Vérifier
docker-compose ps

# Logs
docker-compose logs -f api

# Tester
curl http://localhost:3000/api/health
```

### Option 2: Local avec PostgreSQL + Redis installés

```bash
# 1. Créer la base PostgreSQL
psql -U postgres -c "CREATE DATABASE paiecashfan"

# 2. Démarrer Redis
redis-server

# 3. Configurer l'environnement
cd api
cp .env.example .env
nano .env

# 4. Installer les dépendances
npm install

# 5. Démarrer le serveur
npm run start:db

# 6. Tester
curl http://localhost:3000/api/health
```

---

## 💾 FONCTIONNALITÉS IMPLÉMENTÉES

### 1. **Authentification**
- ✅ Register → Crée user + wallet dans PostgreSQL
- ✅ Login → Vérifie password + génère JWT
- ✅ Cache user dans Redis (30min)

### 2. **Wallet**
- ✅ Get balance → PostgreSQL + cache Redis (1min)
- ✅ Transactions → PostgreSQL avec index optimisé
- ✅ Deposit → Transaction atomique (BEGIN/COMMIT)
- ✅ Cache invalidation automatique

### 3. **eSIM**
- ✅ Get plans → PostgreSQL + cache Redis (1h)
- ✅ Activate → Transaction atomique (wallet + eSIM + transaction)
- ✅ Get active → PostgreSQL + cache Redis (5min)

### 4. **Shop**
- ✅ Get products → PostgreSQL + cache Redis (30min)
- ✅ Add to cart → Upsert avec ON CONFLICT
- ✅ Checkout → Transaction atomique (wallet + order + clear cart)

### 5. **Tickets**
- ✅ Get events → PostgreSQL + cache Redis (5min)
- ✅ My tickets → PostgreSQL sans cache (données sensibles)

### 6. **Cache Strategy**
- ✅ Cache-aside pattern
- ✅ Invalidation automatique après update
- ✅ TTL adaptatifs selon type de données
- ✅ Parse automatique JSON

---

## 🔄 WORKFLOW COMPLET

### Exemple: Achat d'un billet

```
1. User demande GET /api/tickets/events
   ↓
2. Vérifier cache Redis (events:AS_MONACO)
   ↓ (cache miss)
3. Query PostgreSQL
   ↓
4. Mettre en cache (TTL: 5min)
   ↓
5. Retourner les événements

6. User achète POST /api/tickets/purchase
   ↓
7. BEGIN transaction PostgreSQL
   ↓
8. Vérifier wallet balance
   ↓
9. Débiter wallet (-89.99€)
   ↓
10. Créer ticket NFT
   ↓
11. Créer transaction
   ↓
12. COMMIT transaction
   ↓
13. Invalider cache wallet
   ↓
14. Retourner le ticket
```

---

## 📊 PERFORMANCES

### PostgreSQL
- **Connexion pool:** 2-10 connexions
- **Indexes:** 9 indexes optimisés
- **Transactions:** ACID garanties
- **Query time:** < 10ms (avec indexes)

### Redis
- **In-memory:** Latence < 1ms
- **Cache hit ratio:** ~80% visé
- **TTL:** Adaptatifs (1min - 1h)
- **Persistence:** AOF activé (Docker)

### Optimisations
- ✅ Indexes sur foreign keys
- ✅ Indexes sur colonnes fréquemment filtrées
- ✅ JSONB pour données flexibles
- ✅ Cache-aside pattern
- ✅ Transaction atomiques (BEGIN/COMMIT)
- ✅ ON CONFLICT pour upserts

---

## 🧪 TESTER

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

Réponse :
```json
{
  "status": "healthy",
  "services": {
    "postgres": "operational",
    "redis": "operational",
    ...
  }
}
```

### 2. Register + Login

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@paiecashfan.com",
    "password": "test123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@paiecashfan.com",
    "password": "test123"
  }'
```

### 3. Wallet Balance

```bash
curl http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. eSIM Plans

```bash
curl http://localhost:3000/api/esim/plans
```

### 5. Products

```bash
curl http://localhost:3000/api/shop/products?club=AS_MONACO
```

---

## 🔍 VÉRIFIER LES DONNÉES

### PostgreSQL

```bash
# Se connecter
psql -U postgres -d paiecashfan

# Voir les tables
\dt

# Voir les utilisateurs
SELECT id, email, name FROM users;

# Voir les wallets
SELECT user_id, balance FROM wallets;

# Voir les transactions
SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 10;

# Quitter
\q
```

### Redis

```bash
# Se connecter
redis-cli

# Voir toutes les clés
KEYS *

# Voir une valeur
GET user:abc-123

# Voir les clés par pattern
KEYS wallet:*

# Vider (ATTENTION!)
FLUSHALL

# Quitter
EXIT
```

---

## 📈 MONITORING

### Logs API

```bash
# Docker
docker-compose logs -f api

# Local
# Les logs s'affichent dans le terminal
```

### Statistiques PostgreSQL

```sql
-- Taille de la base
SELECT pg_size_pretty(pg_database_size('paiecashfan'));

-- Nombre de connexions
SELECT count(*) FROM pg_stat_activity WHERE datname = 'paiecashfan';

-- Requêtes lentes
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Statistiques Redis

```bash
redis-cli INFO

# Voir memory usage
redis-cli INFO memory

# Voir hits/misses
redis-cli INFO stats
```

---

## 🔐 SÉCURITÉ

### PostgreSQL
- ✅ Prepared statements (prévention SQL injection)
- ✅ Cascade delete sur foreign keys
- ✅ Passwords hashés (bcrypt)
- ✅ Transactions atomiques

### Redis
- ✅ Parse sécurisé des JSON
- ✅ TTL sur toutes les clés sensibles
- ✅ Password optionnel (production)

### API
- ✅ JWT authentication
- ✅ Helmet.js (security headers)
- ✅ CORS configuré
- ✅ Rate limiting (TODO)

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ **PostgreSQL + Redis** - FAIT
2. ⏳ **WebSocket pour Social** - À ajouter
3. ⏳ **Rate limiting Redis** - À implémenter
4. ⏳ **Tests unitaires** - À créer
5. ⏳ **Migration système** - À améliorer
6. ⏳ **Monitoring Sentry** - À intégrer
7. ⏳ **Backup automatique** - À configurer

---

## 📚 FICHIERS IMPORTANTS

- **api/config/database.js** - Configuration PostgreSQL
- **api/config/redis.js** - Configuration Redis
- **api/server-with-db.js** - Serveur avec BDD
- **api/migrations/001_initial_schema.sql** - Schema SQL
- **api/QUICKSTART.md** - Guide démarrage
- **docker-compose.yml** - Stack Docker

---

## 📞 SUPPORT

- **Documentation:** `api/README.md`
- **Quickstart:** `api/QUICKSTART.md`
- **Email:** support@paiecashfan.com

---

**Version:** 2.0.0 | **Date:** 28 Décembre 2025 | **Statut:** ✅ BASES DE DONNÉES CONNECTÉES
