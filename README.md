# PaieCashFan - Plateforme de Co-Streaming & Live Shopping

## 📋 Vue d'ensemble

PaieCashFan est une plateforme moderne de live streaming pour les fans de football, permettant :

1. **Co-Streaming WebRTC P2P** - Streaming collaboratif entre fans (illimité, gratuit)
2. **Live Shopping Multi-Tenant** - Streaming professionnel pour vendeurs (illimité spectateurs, Cloudflare Stream)

## 🌐 URLs

- **Production**: https://paiecashfan.pages.dev
- **Test P2P**: https://paiecashfan.pages.dev/test-p2p.html
- **API Base**: https://paiecashfan.pages.dev/api

## 🏗️ Architecture

### 🎯 Solution 1: Live Shopping Multi-Tenant (Cloudflare Stream)

**Pour**: 1000+ vendeurs simultanés, millions de spectateurs

**Technologies**:
- Backend: Hono + Cloudflare Workers
- Database: Cloudflare D1 (SQLite distribué)
- Streaming: Cloudflare Stream (RTMPS)
- Frontend: Vanilla JS + TailwindCSS

**Avantages**:
- ♾️ Viewers illimités (CDN global)
- 🚀 Latence 10-30s (HLS)
- 💰 $1.80 par vendeur pour 3h
- 📱 Mobile-friendly (OBS, Larix)
- 🎥 Enregistrement VOD automatique
- 📊 Analytics temps réel

### 🎮 Solution 2: Co-Streaming P2P (WebRTC)

**Pour**: 2-10 co-streamers, streaming collaboratif

**Technologies**:
- WebRTC P2P mesh network
- MediaStream API
- Manual SDP exchange (no signaling server)

**Avantages**:
- ✅ Totalement gratuit
- ⚡ Latence <100ms
- 🎯 Simple à utiliser
- 🔒 Décentralisé

## 📊 Base de données D1

### Tables

#### 1. `users`
```sql
- id (UUID, PRIMARY KEY)
- email (TEXT, UNIQUE)
- username (TEXT, UNIQUE)
- password_hash (TEXT)
- display_name (TEXT)
- avatar_url (TEXT)
- created_at (DATETIME)
```

#### 2. `active_streams`
```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID, FOREIGN KEY)
- title (TEXT)
- description (TEXT)
- category (TEXT)
- status (TEXT)
- viewers_count (INTEGER)
- max_participants (INTEGER)
- current_participants (INTEGER)
- started_at (DATETIME)
- cloudflare_stream_id (TEXT)
```

#### 3. `stream_participants`
```sql
- id (UUID, PRIMARY KEY)
- stream_id (UUID, FOREIGN KEY)
- user_id (UUID, FOREIGN KEY)
- joined_at (DATETIME)
- left_at (DATETIME)
- role (TEXT)
```

#### 4. `vendor_streams`
```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID, FOREIGN KEY)
- title (TEXT)
- description (TEXT)
- club_name (TEXT)
- category (TEXT)
- cloudflare_live_input_id (TEXT)
- cloudflare_stream_id (TEXT)
- rtmps_url (TEXT)
- rtmps_stream_key (TEXT)
- playback_url (TEXT)
- status (TEXT)
- viewers_count (INTEGER)
- peak_viewers (INTEGER)
- started_at (DATETIME)
- ended_at (DATETIME)
- duration_seconds (INTEGER)
- is_featured (BOOLEAN)
- is_recorded (BOOLEAN)
- vod_url (TEXT)
```

## 🔌 API Endpoints

### Authentication

#### POST `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "username": "johndoe",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "displayName": "John Doe"
  }
}
```

#### POST `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

#### GET `/api/auth/me`
Headers: `Authorization: Bearer <token>`

### Co-Streaming (WebRTC P2P)

#### POST `/api/costreaming/start`
```json
{
  "title": "Match PSG vs OM - Commentaire live",
  "description": "Commentaires entre fans PSG",
  "category": "match_commentary",
  "maxParticipants": 4
}
```

#### GET `/api/costreaming/active`
Liste tous les streams actifs

#### POST `/api/costreaming/:streamId/join`
Rejoindre un stream

#### POST `/api/costreaming/:streamId/leave`
Quitter un stream

### Vendor Streams (Cloudflare Stream)

#### POST `/api/vendor/stream/start`
```json
{
  "title": "🔴 LIVE: Maillots PSG 2026",
  "description": "Nouveaux maillots en avant-première !",
  "clubName": "PSG",
  "category": "merchandising"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "🔴 LIVE: Maillots PSG 2026",
  "clubName": "PSG",
  "status": "live",
  "rtmpsConfig": {
    "url": "rtmps://live.cloudflare.com:443/live/",
    "streamKey": "MTQ0MTcjM..."
  },
  "playbackUrl": "https://customer-xxx.cloudflarestream.com/xxx/manifest/video.m3u8",
  "viewersCount": 0
}
```

#### GET `/api/vendor/streams/live`
Query params: `?clubName=PSG&category=merchandising&featured=true`

#### GET `/api/vendor/stream/:id`
Détails d'un stream

#### POST `/api/vendor/stream/:id/end`
Terminer un stream

#### GET `/api/vendor/stream/mine`
Mes streams (actifs et passés)

## 📱 Usage

### Vendeur - Démarrer un Live Shopping

1. **S'inscrire / Se connecter**
```bash
curl -X POST https://paiecashfan.pages.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendeur@boutique.com",
    "password": "Secure123!",
    "username": "boutique_psg",
    "displayName": "Boutique PSG Officielle"
  }'
```

2. **Créer un stream**
```bash
curl -X POST https://paiecashfan.pages.dev/api/vendor/stream/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🔴 LIVE: Nouveaux Maillots PSG",
    "description": "Découvrez les maillots 2026",
    "clubName": "PSG",
    "category": "merchandising"
  }'
```

3. **Streamer avec OBS / Larix Broadcaster**
- RTMPS URL: `rtmps://live.cloudflare.com:443/live/`
- Stream Key: (fourni dans la réponse API)

4. **Partager l'URL de visionnage**
- Les fans peuvent regarder sur : `playbackUrl` (fourni dans la réponse)

### Fan - Regarder un Live Shopping

1. **Lister les streams actifs**
```bash
curl "https://paiecashfan.pages.dev/api/vendor/streams/live?clubName=PSG"
```

2. **Regarder un stream**
- Utiliser le `playbackUrl` dans un lecteur HLS (Video.js, hls.js)

### Co-Streaming P2P - Test Simple

1. Ouvrir https://paiecashfan.pages.dev/test-p2p.html dans **2 onglets**

2. **Onglet 1** (Peer A):
   - Cliquer "Start Camera"
   - Cliquer "Create Offer"
   - Copier l'offer

3. **Onglet 2** (Peer B):
   - Cliquer "Start Camera"
   - Coller l'offer dans "Receive SDP"
   - Cliquer "Set Offer"
   - Copier l'answer

4. **Onglet 1**:
   - Coller l'answer dans "Receive SDP"
   - Cliquer "Set Answer"

5. ✅ **Les 2 vidéos apparaissent** (Local + Remote dans chaque onglet)

## 💰 Coûts (Estimation Black Friday: 1000 vendeurs × 3h)

| Service | Usage | Prix unitaire | Total |
|---------|-------|---------------|-------|
| **Cloudflare Stream Recording** | 180,000 min | $5/1000 min | **$900** |
| **Cloudflare Stream Storage** | 180,000 min/mois | $5/1000 min/mois | **$900** |
| **Cloudflare Pages** | Illimité | GRATUIT | $0 |
| **Cloudflare Workers** | <100k req/jour | GRATUIT | $0 |
| **Cloudflare D1** | <5M lignes lues/jour | GRATUIT | $0 |
| **TOTAL** | | | **$1,800** |

**Coût par vendeur**: $1.80 pour 3h de streaming
**Viewers**: Illimités et gratuits (CDN)

## 🚀 Déploiement

### Prérequis

- Compte Cloudflare avec API Token (permissions: D1, Pages, Stream)
- Node.js 18+
- Git

### Installation locale

```bash
# Cloner le repo
git clone https://github.com/VOTRE_USERNAME/paiecashfan.git
cd paiecashfan

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .dev.vars.example .dev.vars
# Éditer .dev.vars avec vos credentials Cloudflare

# Appliquer les migrations D1 (local)
npx wrangler d1 migrations apply paiecashfan-costreaming --local

# Démarrer en développement
npm run build
pm2 start ecosystem.config.cjs

# Tester
curl http://localhost:3000
```

### Déploiement Production

```bash
# 1. Créer la base D1 production
npx wrangler d1 create paiecashfan-costreaming

# 2. Copier le database_id dans wrangler.toml

# 3. Appliquer les migrations
npx wrangler d1 migrations apply paiecashfan-costreaming --remote

# 4. Créer le projet Pages
npx wrangler pages project create paiecashfan --production-branch main

# 5. Déployer
npm run build
npx wrangler pages deploy dist --project-name paiecashfan

# 6. Configurer les secrets
echo "YOUR_JWT_SECRET" | npx wrangler pages secret put JWT_SECRET --project-name paiecashfan
echo "YOUR_ACCOUNT_ID" | npx wrangler pages secret put CLOUDFLARE_ACCOUNT_ID --project-name paiecashfan
echo "YOUR_API_TOKEN" | npx wrangler pages secret put CLOUDFLARE_API_TOKEN --project-name paiecashfan
```

## 📦 Structure du projet

```
webapp/
├── src/
│   ├── index.tsx                 # Main Hono app entry
│   └── routes/
│       ├── auth.ts               # JWT auth endpoints
│       ├── costreaming.ts        # WebRTC P2P endpoints
│       └── vendorStreams.ts      # Cloudflare Stream endpoints
├── public/
│   ├── costreaming.html          # Co-streaming list UI
│   ├── costream-room.html        # Multi-video room UI
│   └── test-p2p.html             # P2P WebRTC test page
├── migrations/
│   ├── 0001_create_users_table.sql
│   ├── 0002_create_streams_table.sql
│   ├── 0003_create_participants_table.sql
│   └── 0004_create_vendor_streams_table.sql
├── wrangler.jsonc                # Wrangler config (dev)
├── wrangler.toml                 # Wrangler config (prod)
├── ecosystem.config.cjs          # PM2 config
├── package.json
└── README.md
```

## 🔧 Configuration

### Variables d'environnement (.dev.vars)

```env
# Cloudflare Account
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

# JWT Secret
JWT_SECRET=your_super_secure_secret_key

# Optional: Cloudflare Email
CLOUDFLARE_EMAIL=your@email.com
```

### Secrets Cloudflare Pages (Production)

- `JWT_SECRET` - Secret pour signer les tokens JWT
- `CLOUDFLARE_ACCOUNT_ID` - ID du compte Cloudflare
- `CLOUDFLARE_API_TOKEN` - Token API avec permissions Stream

## 🧪 Tests

### Test local

```bash
# Démarrer le serveur
npm run build
pm2 start ecosystem.config.cjs

# Test d'inscription
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","username":"test","displayName":"Test User"}'

# Test de création de stream
curl -X POST http://localhost:3000/api/vendor/stream/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Stream","clubName":"PSG","category":"merchandising"}'
```

### Test production

```bash
# Remplacer localhost:3000 par paiecashfan.pages.dev
curl -X POST https://paiecashfan.pages.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"prod@test.com","password":"Prod123!","username":"prodtest","displayName":"Prod Test"}'
```

## 📝 Fonctionnalités actuelles

✅ **Complété**:
- Backend API (Auth JWT, Co-streaming, Vendor Streams)
- Base de données D1 (4 tables, 6 index)
- Page test P2P WebRTC
- Déploiement Cloudflare Pages
- Configuration secrets production
- Documentation complète

⏳ **En cours**:
- Interface vendeur (formulaire start stream, dashboard)
- Marketplace fans (grid streams, filtres, lecteur vidéo)
- Tests production (JWT auth fix)

🔮 **Prochaines étapes**:
1. Fixer JWT auth en production (redéploiement)
2. Interface vendeur mobile-first
3. Marketplace avec filtres avancés
4. Chat temps réel (WebSocket)
5. Système d'amis/invitations
6. Enregistrement VOD automatique
7. Analytics avancés (Cloudflare Analytics)

## 🛠️ Technologies

- **Backend**: Hono 4.x (Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite distribué)
- **Streaming**: Cloudflare Stream (RTMPS/HLS)
- **WebRTC**: Native WebRTC API
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Frontend**: Vanilla JS + TailwindCSS + Font Awesome
- **Deployment**: Cloudflare Pages
- **Process Manager**: PM2 (dev)

## 📚 Documentation technique

- [Architecture complète](./SCALE_ARCHITECTURE_THOUSANDS_STREAMERS.md)
- [Solution WebRTC P2P](./CO_STREAMING_UNLIMITED_SOLUTION.md)
- [Guide déploiement](./DEPLOYMENT_GUIDE_PRODUCTION.md)

## 👥 Contributeurs

- PaieCashFan Team

## 📄 Licence

Propriétaire - © 2026 PaieCashFan

---

**Contact**: etot@paiecash.com
**Dashboard**: https://dash.cloudflare.com/d9c3bb827a16a3b47905cbd6f78bf004
