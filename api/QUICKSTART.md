# 🚀 QUICKSTART - PostgreSQL + Redis

Guide rapide pour démarrer l'API avec PostgreSQL et Redis.

---

## 📋 PRÉREQUIS

- Node.js >= 18.0.0
- Docker & Docker Compose (recommandé)
- OU PostgreSQL + Redis installés localement

---

## ⚡ OPTION 1: Docker Compose (Recommandé)

### 1. Démarrer la stack complète

```bash
# À la racine du projet
docker-compose up -d
```

Cela démarre :
- ✅ API (Node.js) → `http://localhost:3000`
- ✅ PostgreSQL → `localhost:5432`
- ✅ Redis → `localhost:6379`
- ✅ pgAdmin → `http://localhost:5050`
- ✅ Nginx → `http://localhost:80`

### 2. Vérifier les logs

```bash
# Logs de l'API
docker-compose logs -f api

# Logs de tous les services
docker-compose logs -f
```

### 3. Tester l'API

```bash
# Health check
curl http://localhost:3000/api/health

# Stats
curl http://localhost:3000/api/stats

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@paiecashfan.com",
    "password": "test123",
    "name": "Test User",
    "clubId": "AS_MONACO"
  }'
```

### 4. Accéder à pgAdmin

```
URL: http://localhost:5050
Email: admin@paiecashfan.com
Password: admin

Connexion à PostgreSQL:
Host: postgres
Port: 5432
Database: paiecashfan
Username: postgres
Password: postgres
```

### 5. Arrêter la stack

```bash
docker-compose down

# Avec suppression des données
docker-compose down -v
```

---

## 🔧 OPTION 2: Installation Locale

### 1. Installer PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
Télécharger depuis https://www.postgresql.org/download/windows/

### 2. Créer la base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base
CREATE DATABASE paiecashfan;

# Créer un utilisateur (optionnel)
CREATE USER paiecashfan_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE paiecashfan TO paiecashfan_user;

# Quitter
\q
```

### 3. Installer Redis

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Windows:**
Télécharger depuis https://redis.io/download

### 4. Configurer l'environnement

```bash
# Dans le dossier api/
cd api

# Copier .env.example
cp .env.example .env

# Éditer .env
nano .env
```

Configurer :
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-here

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/paiecashfan
DATABASE_POOL_MAX=10
DATABASE_POOL_MIN=2

REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
```

### 5. Installer les dépendances

```bash
npm install
```

### 6. Démarrer le serveur

```bash
# Mode développement (auto-reload)
npm run dev:db

# Ou mode production
npm run start:db
```

### 7. Vérifier la connexion

Le serveur affichera :
```
✅ PostgreSQL connecté avec succès
✅ PostgreSQL: Tables initialisées avec succès
✅ PostgreSQL: Données de test insérées
✅ Redis: Connexion en cours...
✅ Redis: Prêt à accepter les commandes
✅ Toutes les bases de données sont connectées
```

---

## 📊 STRUCTURE DES TABLES POSTGRESQL

### Tables créées automatiquement

- **users** - Utilisateurs
- **wallets** - Portefeuilles
- **transactions** - Historique transactions
- **esim_plans** - Forfaits eSIM
- **esim_active** - eSIM actifs
- **products** - Produits shop
- **cart** - Paniers
- **orders** - Commandes
- **events** - Événements sportifs
- **tickets** - Billets NFT
- **conversations** - Conversations
- **messages** - Messages
- **ai_recommendations** - Recommandations IA
- **ai_insights** - Insights utilisateur

### Indexes créés

- `idx_transactions_user_id` sur `transactions(user_id)`
- `idx_transactions_timestamp` sur `transactions(timestamp)`
- `idx_cart_user_id` sur `cart(user_id)`
- `idx_tickets_user_id` sur `tickets(user_id)`
- `idx_messages_conversation_id` sur `messages(conversation_id)`

---

## 💾 CACHE REDIS

### Keys utilisées

```
user:{userId}                      # Infos utilisateur (TTL: 30min)
wallet:balance:{userId}            # Solde wallet (TTL: 1min)
esim:plans                         # Forfaits eSIM (TTL: 1h)
esim:active:{userId}               # eSIM actif (TTL: 5min)
products:{club}:{category}         # Produits (TTL: 30min)
events:{club}                      # Événements (TTL: 5min)
stats:global                       # Stats globales (TTL: 1min)
```

### Commandes Redis utiles

```bash
# Se connecter à Redis
redis-cli

# Voir toutes les clés
KEYS *

# Voir une valeur
GET user:abc123

# Vider toute la base (ATTENTION!)
FLUSHALL

# Quitter
EXIT
```

---

## 🧪 TESTER L'API

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

Réponse :
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": 1735389600000,
  "services": {
    "postgres": "operational",
    "redis": "operational",
    "auth": "operational",
    ...
  }
}
```

### 2. Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@paiecashfan.com",
    "password": "demo123",
    "name": "Demo User"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@paiecashfan.com",
    "password": "demo123"
  }'
```

Copier le `token` de la réponse.

### 4. Get Balance

```bash
curl http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. eSIM Plans

```bash
curl http://localhost:3000/api/esim/plans
```

### 6. Products

```bash
curl http://localhost:3000/api/shop/products?club=AS_MONACO
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

### PostgreSQL Queries

```bash
# Se connecter
psql -U postgres -d paiecashfan

# Voir les utilisateurs
SELECT id, email, name FROM users;

# Voir les wallets
SELECT user_id, balance, currency FROM wallets;

# Voir les transactions
SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 10;
```

### Redis Monitoring

```bash
# Se connecter
redis-cli

# Voir les infos
INFO

# Voir les clés par pattern
KEYS user:*

# Monitor en temps réel
MONITOR
```

---

## 🐛 DÉPANNAGE

### Erreur: PostgreSQL connection failed

```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql

# Ou avec Docker
docker ps | grep postgres

# Tester la connexion
psql -U postgres -d paiecashfan -c "SELECT 1"
```

### Erreur: Redis connection failed

```bash
# Vérifier que Redis est démarré
sudo systemctl status redis-server

# Ou avec Docker
docker ps | grep redis

# Tester la connexion
redis-cli PING
# Doit répondre: PONG
```

### Erreur: Port 3000 already in use

```bash
# Trouver le processus
lsof -i :3000

# Ou sur Windows
netstat -ano | findstr :3000

# Tuer le processus
kill -9 <PID>
```

### Réinitialiser les bases

```bash
# PostgreSQL
psql -U postgres -c "DROP DATABASE paiecashfan; CREATE DATABASE paiecashfan;"

# Redis
redis-cli FLUSHALL

# Redémarrer l'API
npm run start:db
```

---

## 📚 RESSOURCES

- **API Documentation:** `api/README.md`
- **Database Config:** `api/config/database.js`
- **Redis Config:** `api/config/redis.js`
- **Server Code:** `api/server-with-db.js`

---

## 🎯 PROCHAINE ÉTAPE

Une fois l'API démarrée, tester avec :

```bash
# Ouvrir la démo interactive
open examples/api-client-demo.html

# Ou visiter
http://localhost:3000/api/health
```

---

**Besoin d'aide ?** → support@paiecashfan.com
