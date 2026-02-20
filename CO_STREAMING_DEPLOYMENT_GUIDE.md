# 🎥 Guide de Déploiement Co-Streaming PaieCashFan

## ✅ Ce qui a été implémenté

### Architecture Complète
- ✅ **Base de données D1** avec 3 tables (users, active_streams, stream_participants)
- ✅ **API d'authentification JWT** (register, login, session management)
- ✅ **API de gestion des streams** (start, join, leave, end, list)
- ✅ **Interface web complète** (liste des streams + salle multi-vidéo)
- ✅ **QR codes** pour connexion mobile instantanée
- ✅ **Intégration Cloudflare Calls** pour WebRTC multi-participants
- ✅ **Layout adaptatif** (1-100 participants, grille responsive)
- ✅ **Contrôles média** (micro, caméra, partage d'écran)

### Fichiers Créés

**Backend API:**
- `src/routes/auth.ts` - Authentification JWT (register, login, me)
- `src/routes/costreaming.ts` - Gestion des streams (start, join, leave, end)

**Frontend:**
- `public/costreaming.html` - Liste des streams + formulaire login/register
- `public/costream-room.html` - Salle de co-streaming multi-vidéo avec QR codes

**Base de données:**
- `migrations/0001_create_users_table.sql`
- `migrations/0002_create_streams_table.sql`
- `migrations/0003_create_participants_table.sql`

**Configuration:**
- `wrangler.jsonc` - Configuration Cloudflare D1 + Calls
- `.dev.vars` - Variables d'environnement (JWT_SECRET, Cloudflare credentials)

## 🚀 Déploiement Production

### Étape 1: Créer la Base de Données D1 Production

```bash
cd /home/user/webapp

# Créer la base de données sur Cloudflare
npx wrangler d1 create paiecashfan-costreaming

# Output exemple:
# database_id: "abc123def456-7890-abcd-ef12-34567890abcd"
```

Copier le `database_id` et mettre à jour `wrangler.jsonc`:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "paiecashfan-costreaming",
      "database_id": "VOTRE_DATABASE_ID_ICI"  // ← Remplacer
    }
  ]
}
```

### Étape 2: Appliquer les Migrations

```bash
# Appliquer les migrations sur la base de production
npx wrangler d1 migrations apply paiecashfan-costreaming

# Vérifier que les tables sont créées
npx wrangler d1 execute paiecashfan-costreaming \
  --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### Étape 3: Configurer les Secrets Production

```bash
# JWT Secret (générer un secret aléatoire sécurisé)
npx wrangler pages secret put JWT_SECRET --project-name paiecashfan

# Cloudflare Account ID et API Token (déjà configurés)
npx wrangler pages secret put CLOUDFLARE_ACCOUNT_ID --project-name paiecashfan
npx wrangler pages secret put CLOUDFLARE_API_TOKEN --project-name paiecashfan
```

### Étape 4: Build et Déploiement

```bash
# Build l'application
npm run build

# Déployer vers Cloudflare Pages
npx wrangler pages deploy dist --project-name paiecashfan

# URLs de production:
# https://paiecashfan.pages.dev/costreaming.html
# https://paiecashfan.pages.dev/costream-room.html
```

## 📱 Utilisation du Système

### Pour l'utilisateur final:

1. **S'inscrire/Se connecter:**
   - Aller sur `/costreaming.html`
   - Cliquer sur "Connexion" → "S'inscrire"
   - Créer un compte (email, username, password)

2. **Créer un stream:**
   - Cliquer sur "Nouveau Stream"
   - Remplir le formulaire (titre, description, catégorie, max participants)
   - Cliquer sur "Lancer le Stream"
   - Autoriser l'accès à la caméra/micro

3. **Rejoindre un stream:**
   - Voir la liste des streams actifs sur `/costreaming.html`
   - Cliquer sur un stream pour le rejoindre
   - Autoriser l'accès à la caméra/micro

4. **Inviter des amis (mobile):**
   - Dans la salle, cliquer sur l'icône QR code (📱)
   - Scanner le QR code avec le téléphone
   - Ou copier le lien et l'envoyer

5. **Contrôles pendant le stream:**
   - 🎤 Micro on/off
   - 📹 Caméra on/off
   - 🖥️ Partager l'écran
   - ☎️ Quitter le stream

## 🔧 API Endpoints

### Authentification
```
POST /api/auth/register
Body: { email, password, username, displayName }
Response: { success, token, user }

POST /api/auth/login
Body: { email, password }
Response: { success, token, user }

GET /api/auth/me
Headers: Authorization: Bearer {token}
Response: { success, user }
```

### Streams
```
POST /api/costreaming/start
Headers: Authorization: Bearer {token}
Body: { title, description, category, maxParticipants, isPublic }
Response: { success, stream, sessionToken, iceServers }

GET /api/costreaming/active?category=all
Response: { success, streams[], count }

GET /api/costreaming/:streamId
Response: { success, stream, participants[] }

POST /api/costreaming/:streamId/join
Headers: Authorization: Bearer {token}
Response: { success, sessionToken, iceServers, stream }

POST /api/costreaming/:streamId/leave
Headers: Authorization: Bearer {token}
Response: { success }

POST /api/costreaming/:streamId/end
Headers: Authorization: Bearer {token} (host uniquement)
Response: { success }
```

## 💰 Coûts Cloudflare

### Cloudflare D1 (Base de données)
- **Gratuit:** 5 millions de lectures/jour, 100k écritures/jour
- **Payant:** $0.001 par 1k lectures supplémentaires
- **Estimation:** $0-10/mois pour 1000 utilisateurs

### Cloudflare Calls (WebRTC)
- **Gratuit:** 1,000 minutes/mois
- **Payant:** $0.05/minute supplémentaire
- **Exemple:** 100 streams de 10 minutes avec 3 participants = 3,000 min = $100/mois
- **Estimation:** $50-200/mois selon l'usage

### Cloudflare Pages (Hébergement)
- **Gratuit:** Bande passante illimitée, builds illimités
- **Coût total estimé:** $50-210/mois pour usage moyen

## ⚙️ Configuration D1 Locale (Développement)

**⚠️ Important:** Le développement local avec D1 nécessite une configuration spéciale.

### Problème connu:
`wrangler pages dev` avec `--d1 DB` crée sa propre base D1 locale indépendante et n'utilise pas la base créée par `wrangler d1 migrations apply --local`.

### Solution temporaire:
1. Utiliser la production D1 pour les tests (avec vrai `database_id`)
2. Ou attendre la mise à jour de Wrangler qui résoudra ce problème

### Alternative pour tests locaux:
```bash
# Option 1: Utiliser un mock en mémoire (à implémenter)
# Option 2: Déployer en production et tester là-bas
# Option 3: Utiliser une vraie base D1 de développement sur Cloudflare
```

## 🔍 Troubleshooting

### "Token invalide ou expiré"
- Vérifier que JWT_SECRET est configuré dans `.dev.vars` (local) ou comme secret Pages (prod)
- Le token expire après 30 jours

### "Base de données non disponible"
- Vérifier que le `database_id` dans `wrangler.jsonc` est correct
- Appliquer les migrations: `npx wrangler d1 migrations apply paiecashfan-costreaming`

### "Cloudflare Calls non configuré"
- Ajouter CLOUDFLARE_ACCOUNT_ID et CLOUDFLARE_API_TOKEN dans `.dev.vars` ou secrets Pages
- Vérifier que l'API token a les permissions "Cloudflare Calls"

### WebRTC ne fonctionne pas
- Autoriser l'accès caméra/micro dans le navigateur
- Tester sur HTTPS (WebRTC nécessite HTTPS sauf localhost)
- Vérifier la configuration ICE servers dans Cloudflare Calls

## 📊 Fonctionnalités Futures (Non Implémentées)

- ⏳ Enregistrement automatique des streams → Cloudflare Stream
- ⏳ Chat en temps réel entre participants (WebSocket)
- ⏳ Modération (kick participants, mute, ban)
- ⏳ Système de "friends" pour invitations privées
- ⏳ Notifications push pour invitations
- ⏳ Analytics en temps réel (viewers, duration, engagement)
- ⏳ Monétisation (abonnements, dons, NFTs)

## 📞 Support

Pour toute question sur le déploiement:
- Email: etot@paiecash.com
- Dashboard Cloudflare: https://dash.cloudflare.com/4a0b3e35f24b28cd17c247aef02dc728
- Documentation Cloudflare Calls: https://developers.cloudflare.com/calls/

---

**Auteur:** Assistant AI  
**Date:** 2026-02-20  
**Version:** 1.0.0  
**Stack:** Hono + Cloudflare Pages + Cloudflare D1 + Cloudflare Calls + WebRTC
