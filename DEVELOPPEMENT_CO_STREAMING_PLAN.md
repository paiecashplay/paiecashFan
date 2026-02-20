# 🚀 Développement Co-Streaming Web - PaieCashFan

## 📋 Plan de Développement (2 Semaines)

**Objectif** : Solution web complète style Whaazs avec Cloudflare Calls (pay-as-you-go)

**Budget estimé** : $10-50/mois selon utilisation réelle

---

## 📅 SEMAINE 1 : Base Fonctionnelle

### Jour 1-2 : Base de Données & Authentification
- [x] Créer migrations D1 (users + active_streams)
- [ ] API authentification (register, login, JWT)
- [ ] Tests API auth
- [ ] Page inscription/connexion UI

### Jour 3-4 : Liste Streams & Interface
- [ ] API streams (start, live list, end)
- [ ] Page /streams-live.html (liste streams actifs)
- [ ] Interface UI desktop
- [ ] Bouton "Lancer Stream"

### Jour 5 : Cloudflare Calls Setup
- [ ] Configuration Cloudflare Calls dans wrangler.jsonc
- [ ] API endpoint pour créer room Cloudflare Calls
- [ ] Tests connexion WebRTC basique

---

## 📅 SEMAINE 2 : Co-Streaming & Mobile

### Jour 1-2 : Rejoindre Stream
- [ ] Bouton "Rejoindre" sur streams
- [ ] API join/leave stream
- [ ] Interface player multi-participants
- [ ] Grid layout vidéos (2-4 participants)

### Jour 3 : Mobile & QR Code
- [ ] QR code génération pour partage
- [ ] Optimisation responsive mobile
- [ ] Tests mobile (caméra + micro)

### Jour 4-5 : Tests & Finalisation
- [ ] Tests complets desktop + mobile
- [ ] Tests co-streaming 2-4 personnes
- [ ] Optimisation performance
- [ ] Documentation utilisateur
- [ ] Déploiement production

---

## 🏗️ Architecture Technique

### Stack
- **Backend** : Hono API (Cloudflare Workers)
- **Database** : Cloudflare D1 (2 tables)
- **WebRTC** : Cloudflare Calls (pay-as-you-go)
- **Frontend** : HTML/CSS/JS + TailwindCSS
- **Auth** : JWT tokens

### Tables D1
```sql
-- Table users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table active_streams
CREATE TABLE active_streams (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  cloudflare_room_id TEXT,
  status TEXT CHECK(status IN ('live', 'ended')) DEFAULT 'live',
  participants TEXT, -- JSON array
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### API Endpoints (8 total)
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

POST /api/stream/start
GET  /api/stream/live
POST /api/stream/join/:id
POST /api/stream/leave/:id
POST /api/stream/end/:id
```

---

## 💰 Budget Cloudflare Calls

**Tarification** : $0.05/minute de track (après 1,000 min gratuites)

**Exemples** :
- 5 streams × 20 min × 2 personnes = 400 min → **Gratuit**
- 10 streams × 30 min × 3 personnes = 1,800 min → **$40/mois**
- 20 streams × 15 min × 2 personnes = 1,200 min → **$10/mois**

**Votre usage estimé** : ~$10-20/mois (usage modéré)

---

## 🎯 Livrables Finaux

### Fonctionnalités
✅ Authentification (register/login)
✅ Page "Streams Live" - découverte automatique
✅ Lancer un stream en 1 clic
✅ Rejoindre un stream en 1 clic
✅ Co-streaming multi-participants (jusqu'à 100)
✅ Caméra + micro contrôles individuels
✅ QR code pour partage mobile rapide
✅ Interface responsive (desktop + mobile)
✅ Pay-as-you-go (pas d'abonnement fixe)

### Pages
- `/` - Homepage avec bouton "Lancer Stream"
- `/streams-live.html` - Liste streams actifs
- `/stream/:id` - Player co-streaming
- `/auth/register` - Inscription
- `/auth/login` - Connexion

---

## 📱 Expérience Utilisateur

### Desktop (Vous - Hôte)
1. Connexion → PaieCashFan.com
2. Clic "🎥 Lancer Stream"
3. Titre : "PSG vs OM - Analyse"
4. Stream démarre → QR code affiché
5. Vous commentez le match

### Mobile (Ami)
1. Scanne QR code OU ouvre /streams-live
2. Voit "🔴 @username - PSG vs OM"
3. Clic "▶️ Rejoindre"
4. Autorise caméra + micro
5. Il est dans votre stream !

**Résultat** : Vidéos synchronisées, vous vous parlez, viewers voient tout !

---

## 🔄 Workflow Technique

### 1. Lancer Stream
```
User → POST /api/stream/start
Backend → Crée row dans active_streams
Backend → Appelle Cloudflare Calls API (create room)
Backend → Retourne roomId + token WebRTC
Frontend → Démarre stream local
Frontend → Affiche QR code (URL du stream)
```

### 2. Rejoindre Stream
```
Ami → Scanne QR ou visite /streams-live
Ami → Clic "Rejoindre" sur stream
Frontend → POST /api/stream/join/:id
Backend → Ajoute user dans participants
Backend → Génère token WebRTC pour ce user
Backend → Retourne roomId + token
Frontend → Connexion WebRTC à la room
Frontend → Vidéo/audio apparaissent chez tous
```

### 3. Quitter Stream
```
User → Clic "Quitter" ou ferme page
Frontend → POST /api/stream/leave/:id
Backend → Retire user des participants
Backend → Notifie autres participants
Frontend → Vidéo disparaît chez les autres
```

---

## 🧪 Tests à Effectuer

### Semaine 1 (Backend)
- [ ] Inscription utilisateur fonctionne
- [ ] Connexion JWT valide
- [ ] Création stream crée row DB
- [ ] Liste streams retourne actifs seulement

### Semaine 2 (Co-Streaming)
- [ ] Desktop : Lancer stream + partager QR
- [ ] Mobile : Scanner QR + rejoindre
- [ ] 2 personnes streamant ensemble
- [ ] 3-4 personnes streamant ensemble
- [ ] Audio bidirectionnel fonctionne
- [ ] Vidéo synchronisée
- [ ] Quitter stream retire vidéo
- [ ] Terminer stream ferme pour tous

---

## 📦 Prochaines Étapes Immédiates

**JE COMMENCE MAINTENANT** :

1. **Créer migrations D1** (15 min)
2. **Setup Cloudflare Calls dans wrangler.jsonc** (10 min)
3. **API auth basique** (1h)
4. **Commit & update** (5 min)

**Attendez-vous à un premier commit dans ~1h30 avec :**
- Migrations D1 créées
- Cloudflare Calls configuré
- API auth de base fonctionnelle

---

## 💬 Communication

Je vous tiendrai au courant tous les jours :
- **Fin Jour 1** : Auth + DB setup prêts
- **Fin Jour 3** : Interface liste streams visible
- **Fin Jour 5** : Premier test co-streaming possible
- **Fin Jour 8** : Mobile + QR code fonctionnels
- **Fin Jour 10** : Solution complète + tests finalisés

---

**🚀 Je démarre maintenant le développement ! Premier commit dans 1h30.**
