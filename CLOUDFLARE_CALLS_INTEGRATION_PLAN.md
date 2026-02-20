# 🎥 Intégration Cloudflare Calls - Plan Complet

## 📌 Contexte

**Besoin client :**
- Co-streaming réel (plusieurs personnes streament ENSEMBLE)
- Participants streamant depuis mobile (caméra + micro + discussion)
- Budget pay-as-you-go (compte test $5 + 1,000 min gratuites)
- Test aujourd'hui puis solution complète sous 2 semaines

**Solution retenue : Cloudflare Calls**
- ✅ Pay-as-you-go : seulement ce qui est consommé
- ✅ Mobile natif : navigateur mobile (Chrome/Safari)
- ✅ Découverte automatique style Whaazs
- ✅ Latence ultra-faible (~100ms)
- ✅ Participants illimités

---

## 💰 Estimation Coûts Réels (Pay-as-you-go)

### Tarification Cloudflare Calls

```
Gratuit : 1,000 minutes/mois
Payant : $0.05/minute ($3/heure)
```

### Exemples de Coûts Réels

#### Scénario 1 : Test Initial (Votre cas)
```
- Compte test : $5.00
- Minutes gratuites : 1,000 min
- Total disponible : 1,000 min + 100 min ($5)
- Durée test possible : ~18 heures de co-streaming
- Coût réel : $0 (utilisation des minutes gratuites)
```

#### Scénario 2 : Usage Léger (10 streams/mois)
```
- 10 streams d'1h avec 3 participants
- Calcul : 10 streams × 1h × 3 participants = 30h = 1,800 min
- Gratuit : 1,000 min
- Payant : 800 min × $0.05 = $40
- Coût mensuel : $40
```

#### Scénario 3 : Usage Modéré (50 streams/mois)
```
- 50 streams d'1h avec 2 participants
- Calcul : 50 × 1h × 2 = 100h = 6,000 min
- Gratuit : 1,000 min
- Payant : 5,000 min × $0.05 = $250
- Coût mensuel : $250
```

#### Scénario 4 : Usage Intensif (100 streams/mois)
```
- 100 streams d'1h avec 4 participants
- Calcul : 100 × 1h × 4 = 400h = 24,000 min
- Gratuit : 1,000 min
- Payant : 23,000 min × $0.05 = $1,150
- Coût mensuel : $1,150
```

### 📊 Tableau Récapitulatif

| Scénario | Streams/mois | Participants | Heures totales | Coût/mois |
|----------|--------------|--------------|----------------|-----------|
| Test Initial | 1-5 | 2-3 | ~18h | $0-5 |
| Usage Léger | 10 | 3 | 30h | $40 |
| Usage Modéré | 50 | 2 | 100h | $250 |
| Usage Intensif | 100 | 4 | 400h | $1,150 |

**⚠️ Important :** Vous ne payez QUE si vous utilisez. Si personne ne streame = $0.

---

## 🏗️ Architecture Technique

### Stack Technologique

```
Frontend : HTML/CSS/JavaScript (Tailwind CSS)
Backend : Hono (Cloudflare Workers)
Database : Cloudflare D1 (SQLite)
Auth : JWT (Hono middleware)
WebRTC : Cloudflare Calls API
Real-time : Cloudflare Durable Objects (WebSocket)
```

### Base de Données (D1)

#### Table `users`
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

#### Table `active_streams`
```sql
CREATE TABLE active_streams (
  id TEXT PRIMARY KEY,
  host_user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cloudflare_calls_session_id TEXT NOT NULL,
  cloudflare_stream_uid TEXT,
  max_participants INTEGER DEFAULT 10,
  current_participants INTEGER DEFAULT 1,
  status TEXT DEFAULT 'live',
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME,
  FOREIGN KEY (host_user_id) REFERENCES users(id)
);

CREATE INDEX idx_active_streams_host ON active_streams(host_user_id);
CREATE INDEX idx_active_streams_status ON active_streams(status);
```

#### Table `stream_participants`
```sql
CREATE TABLE stream_participants (
  id TEXT PRIMARY KEY,
  stream_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'participant',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  left_at DATETIME,
  FOREIGN KEY (stream_id) REFERENCES active_streams(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_participants_stream ON stream_participants(stream_id);
CREATE INDEX idx_participants_user ON stream_participants(user_id);
```

### API Endpoints

#### **Auth API** (`/api/auth/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Créer un compte utilisateur |
| `/api/auth/login` | POST | Se connecter (retourne JWT) |
| `/api/auth/me` | GET | Infos utilisateur connecté |
| `/api/auth/logout` | POST | Se déconnecter |

#### **Streams API** (`/api/streams/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/streams/start` | POST | Démarrer un nouveau co-stream |
| `/api/streams/live` | GET | Liste des streams actifs |
| `/api/streams/:id` | GET | Détails d'un stream |
| `/api/streams/:id/join` | POST | Rejoindre un stream |
| `/api/streams/:id/leave` | POST | Quitter un stream |
| `/api/streams/:id/end` | DELETE | Terminer un stream (host seulement) |

#### **Cloudflare Calls API** (`/api/calls/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/calls/session` | POST | Créer une session Cloudflare Calls |
| `/api/calls/token` | POST | Obtenir un token WebRTC |
| `/api/calls/tracks` | GET | Liste des tracks actifs |

---

## 🚀 Plan de Développement (2 semaines)

### Semaine 1 : Backend + Auth + DB

#### Jour 1-2 : Base de données + Auth
- ✅ Créer migrations D1 (users, active_streams, stream_participants)
- ✅ Implémenter Auth API (register, login, JWT, me)
- ✅ Créer middleware JWT pour routes protégées
- ✅ Tests unitaires Auth

#### Jour 3-4 : Streams API + Cloudflare Calls
- ✅ Implémenter Streams API (start, list, join, leave, end)
- ✅ Intégrer Cloudflare Calls API (create session, get token)
- ✅ Gérer participants (add, remove, list)
- ✅ Tests unitaires Streams

#### Jour 5 : WebSocket + Real-time
- ✅ Créer Durable Object pour WebSocket
- ✅ Events : user_joined, user_left, stream_started, stream_ended
- ✅ Notifications temps réel

### Semaine 2 : Frontend + Testing + Déploiement

#### Jour 6-7 : UI Principale
- ✅ Page `/streams-live.html` (liste streams, découverte auto)
- ✅ Composant "Découverte Streams" (cards avec bouton Rejoindre)
- ✅ Formulaire "Démarrer un stream"
- ✅ Interface responsive (mobile-first)

#### Jour 8-9 : Co-streaming UI
- ✅ Page `/co-stream.html` (multi-video layout)
- ✅ Intégration Cloudflare Calls SDK
- ✅ Contrôles : caméra on/off, micro on/off, quitter
- ✅ Layout adaptatif (1-10 participants)
- ✅ Chat en temps réel (WebSocket)

#### Jour 10 : Mobile + QR Codes
- ✅ Optimisation mobile (Chrome/Safari)
- ✅ Génération QR codes (accès rapide)
- ✅ Tests cross-browser
- ✅ Tests multi-devices

#### Jour 11 : Tests Complets
- ✅ Test 2 utilisateurs (desktop + desktop)
- ✅ Test 2 utilisateurs (desktop + mobile)
- ✅ Test 5 utilisateurs (multi-devices)
- ✅ Test latence, qualité vidéo, stabilité
- ✅ Test déconnexion/reconnexion

#### Jour 12 : Documentation + Déploiement
- ✅ Guide utilisateur (comment co-streamer)
- ✅ Guide développeur (architecture, API)
- ✅ README mis à jour
- ✅ Déploiement Cloudflare Pages
- ✅ Configuration domaine

---

## 📱 Expérience Utilisateur

### Scénario d'Utilisation

#### Étape 1 : Créer un compte
```
1. Aller sur paiecashfan.com
2. Cliquer "S'inscrire"
3. Remplir : username, email, password
4. Valider → Connecté automatiquement
```

#### Étape 2 : Démarrer un co-stream
```
1. Cliquer "Démarrer un Stream"
2. Remplir : titre, description
3. Autoriser caméra + micro
4. Cliquer "Lancer" → Stream créé
5. Partager lien ou QR code avec amis
```

#### Étape 3 : Amis rejoignent le stream
```
Option A : Via liste
1. Aller sur paiecashfan.com/streams-live
2. Voir la liste des streams actifs
3. Cliquer "Rejoindre" sur votre stream
4. Autoriser caméra + micro
5. Apparaître dans le stream

Option B : Via QR code (mobile)
1. Scanner le QR code avec mobile
2. Ouvrir lien dans navigateur
3. Autoriser caméra + micro
4. Rejoindre automatiquement
```

#### Étape 4 : Co-streamer ensemble
```
- Tous les participants se voient
- Chacun peut parler (micro)
- Chacun peut activer/désactiver sa caméra
- Host peut retirer un participant
- Chat en temps réel (optionnel)
```

#### Étape 5 : Terminer le stream
```
1. Host clique "Terminer le stream"
2. Tous les participants sont déconnectés
3. VOD automatiquement enregistré (si activé)
4. Statistiques affichées (durée, nb participants)
```

---

## 🔧 Configuration Technique

### 1. Cloudflare Calls Setup

```bash
# Activer Cloudflare Calls (si pas déjà fait)
npx wrangler calls enable

# Créer un App ID
npx wrangler calls apps create paiecashfan-costream

# Récupérer App ID + App Secret
npx wrangler calls apps list
```

### 2. Variables d'Environnement

**`.dev.vars` (développement local)**
```bash
CLOUDFLARE_ACCOUNT_ID=4a0b3e35f24b28cd17c247aef02dc728
CLOUDFLARE_API_TOKEN=hKBiveHL8A5Vd1diM2wS_bo1i_YJMXKRqHM2C7Cm
CLOUDFLARE_CALLS_APP_ID=your-app-id-here
CLOUDFLARE_CALLS_APP_SECRET=your-app-secret-here
JWT_SECRET=your-super-secret-jwt-key-here
```

**`wrangler.jsonc` (production)**
```jsonc
{
  "name": "paiecashfan",
  "compatibility_date": "2024-01-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "paiecashfan-production",
      "database_id": "your-db-id"
    }
  ],
  "durable_objects": {
    "bindings": [
      {
        "name": "STREAM_WEBSOCKET",
        "class_name": "StreamWebSocket",
        "script_name": "paiecashfan"
      }
    ]
  },
  "vars": {
    "CLOUDFLARE_CALLS_APP_ID": "your-app-id"
  }
}
```

**Secrets (production)**
```bash
echo "your-app-secret" | npx wrangler secret put CLOUDFLARE_CALLS_APP_SECRET
echo "your-jwt-secret" | npx wrangler secret put JWT_SECRET
```

---

## 📦 Dépendances NPM

```json
{
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/zod-validator": "^0.2.0",
    "zod": "^3.22.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "@cloudflare/calls": "^1.0.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.0.0",
    "wrangler": "^3.78.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 🎯 Prochaines Étapes

### Aujourd'hui : Validation du Plan
1. ✅ Lire ce document
2. ✅ Confirmer que c'est bien ce que vous voulez
3. ✅ Poser toutes vos questions
4. ✅ Donner le feu vert pour commencer

### Demain : Démarrage Développement
1. 🚀 Créer migrations DB
2. 🚀 Implémenter Auth API
3. 🚀 Tester Auth API

### Dans 2 semaines : Go Live
1. 🎉 Système complet fonctionnel
2. 🎉 Tests avec 2-3 utilisateurs
3. 🎉 Documentation complète
4. 🎉 Déploiement production

---

## ❓ FAQ

### Q1 : Combien ça coûte réellement ?
**R :** Avec votre compte test $5 + 1,000 min gratuites, vous avez ~18h de test gratuites. Ensuite, seulement $0.05/min utilisé.

### Q2 : Peut-on limiter le nombre de participants ?
**R :** Oui, configurable par stream. Par défaut : 10 participants max. Modifiable dans DB.

### Q3 : Fonctionne sur tous les mobiles ?
**R :** Oui, navigateur Chrome/Safari. Pas d'app à installer.

### Q4 : Peut-on enregistrer les co-streams ?
**R :** Oui, Cloudflare Stream peut enregistrer automatiquement en VOD.

### Q5 : Latence moyenne ?
**R :** ~100ms (WebRTC), plus rapide que YouTube (~5-10s).

### Q6 : Peut-on monétiser les co-streams ?
**R :** Oui, système crypto paywall déjà existant dans PaieCashFan.

### Q7 : Sécurité des streams ?
**R :** Oui, JWT + Cloudflare Calls tokens. Seuls utilisateurs invités peuvent rejoindre.

### Q8 : Peut-on faire du multi-streaming (Twitch, YouTube, etc.) ?
**R :** Pas dans cette version. Focus sur co-streaming interne PaieCashFan.

---

## 📞 Support

**Email :** etot@paiecash.com
**Documentation :** Ce fichier + guides à venir
**Cloudflare Dashboard :** https://dash.cloudflare.com/4a0b3e35f24b28cd17c247aef02dc728

---

**🎉 Prêt à démarrer ? Donnez-moi le feu vert et je commence l'implémentation !**
