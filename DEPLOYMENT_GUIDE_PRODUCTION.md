# 🚀 Guide de Déploiement Production - PaieCashFan

## ⚠️ PRÉREQUIS : Configurer les Permissions Cloudflare

L'API token actuel **n'a pas les permissions D1**. Suivez ces étapes :

### 1. Créer un Nouveau Token avec Permissions Complètes

**Option A : Via Dashboard Cloudflare (Recommandé)**

1. Allez sur : https://dash.cloudflare.com/profile/api-tokens
2. Cliquez sur **"Create Token"**
3. Utilisez le template **"Edit Cloudflare Workers"**
4. Ajoutez ces permissions supplémentaires :
   - ✅ **Account → D1 → Edit**
   - ✅ **Account → Cloudflare Stream → Edit** (déjà présent)
   - ✅ **Account → Pages → Edit**
   - ✅ **User → User Details → Read**
5. Zone Resources : **All zones** (ou sélectionnez votre zone)
6. Cliquez **"Continue to summary"** → **"Create Token"**
7. **Copiez le nouveau token** (vous ne pourrez plus le voir après)

**Option B : Permissions Minimales Requises**

Si vous voulez être plus restrictif, voici les permissions exactes nécessaires :

```
Account Permissions:
├── D1
│   └── Edit
├── Cloudflare Stream  
│   └── Edit
└── Pages
    └── Edit

User Permissions:
└── User Details
    └── Read
```

---

## 🗄️ ÉTAPE 1 : Créer la Base D1 Production

**Une fois le token avec permissions D1 créé :**

```bash
cd /home/user/webapp

# Exporter le NOUVEAU token
export CLOUDFLARE_API_TOKEN="VOTRE_NOUVEAU_TOKEN_ICI"
export CLOUDFLARE_ACCOUNT_ID="4a0b3e35f24b28cd17c247aef02dc728"

# Créer la base D1
npx wrangler d1 create paiecashfan-costreaming

# Output attendu :
# ✅ Successfully created DB 'paiecashfan-costreaming'
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "paiecashfan-costreaming"
# database_id = "abc123def456-7890-abcd-ef12-34567890abcd"

# COPIEZ le database_id !
```

---

## 📝 ÉTAPE 2 : Mettre à Jour wrangler.jsonc

**Éditez `/home/user/webapp/wrangler.jsonc` :**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "webapp",
  "compatibility_date": "2026-02-13",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "vars": {
    "STREAM_ENABLED": "true"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "paiecashfan-costreaming",
      "database_id": "COLLEZ_VOTRE_DATABASE_ID_ICI"  // ← Remplacez !
    }
  ]
}
```

---

## 🗃️ ÉTAPE 3 : Appliquer les Migrations en Production

```bash
cd /home/user/webapp

# Appliquer les 4 migrations sur la base production
npx wrangler d1 migrations apply paiecashfan-costreaming

# Vérifier que les tables sont créées
npx wrangler d1 execute paiecashfan-costreaming \
  --command="SELECT name FROM sqlite_master WHERE type='table';"

# Output attendu :
# ✅ users
# ✅ active_streams
# ✅ stream_participants
# ✅ vendor_streams
```

---

## 🔐 ÉTAPE 4 : Configurer les Secrets Cloudflare Pages

**Note:** Utilisez le **nom du projet Cloudflare Pages** que nous avons dans `meta_info`.

```bash
# Vérifier le nom du projet
# (Devrait être "webapp" ou un nom que vous avez configuré)

# JWT Secret (générez un secret aléatoire fort)
npx wrangler pages secret put JWT_SECRET --project-name webapp
# Entrez : paiecashfan_jwt_secret_2026_ultra_secure_change_in_production

# Cloudflare Account ID
npx wrangler pages secret put CLOUDFLARE_ACCOUNT_ID --project-name webapp
# Entrez : 4a0b3e35f24b28cd17c247aef02dc728

# Cloudflare API Token
npx wrangler pages secret put CLOUDFLARE_API_TOKEN --project-name webapp
# Entrez : VOTRE_NOUVEAU_TOKEN_ICI

# Cloudflare Email
npx wrangler pages secret put CLOUDFLARE_EMAIL --project-name webapp
# Entrez : etot@paiecash.com
```

---

## 📦 ÉTAPE 5 : Build et Déploiement

```bash
cd /home/user/webapp

# Build l'application
npm run build

# Déployer vers Cloudflare Pages
npx wrangler pages deploy dist --project-name webapp

# Output attendu :
# ✨ Deployment complete!
# ✅ https://abc123.webapp.pages.dev
# ✅ https://webapp.pages.dev
```

---

## ✅ ÉTAPE 6 : Tester l'API en Production

**Une fois déployé, testez les endpoints :**

```bash
# URL de production (remplacez par votre URL)
PROD_URL="https://webapp.pages.dev"

# 1. Créer un compte
curl -X POST "$PROD_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@psg.com",
    "password": "test123",
    "username": "vendor_psg",
    "displayName": "Vendeur PSG"
  }'

# Copiez le token retourné

# 2. Créer un stream vendeur
curl -X POST "$PROD_URL/api/vendor/stream/start" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Maillots PSG signés",
    "description": "Edition limitée",
    "clubId": "psg",
    "clubName": "Paris Saint-Germain",
    "category": "shopping"
  }'

# Devrait retourner :
# - rtmpsConfig (URL + Stream Key pour OBS)
# - playbackUrl (pour les spectateurs)
# - cloudflareStreamUid

# 3. Voir les streams live
curl "$PROD_URL/api/vendor/streams/live"
```

---

## 🎥 ÉTAPE 7 : Tester le Stream avec OBS

**Une fois le stream créé via API :**

1. Téléchargez **OBS Studio** : https://obsproject.com/
2. **Settings** → **Stream** :
   - Service : **Custom**
   - Server : `rtmps://live.cloudflare.com:443/live/`
   - Stream Key : `COLLER_LA_STREAM_KEY_DE_L_API`
3. Cliquez **"Start Streaming"**
4. Allez sur `playbackUrl` dans le navigateur → Vous voyez votre stream ! 🎉

---

## 📱 ÉTAPE 8 : Tester avec Mobile (Larix)

**Pour streamer depuis un téléphone :**

1. Installez **Larix Broadcaster** (iOS/Android)
2. **Settings** → **Connections** → **New Connection** :
   - Name : PaieCashFan
   - URL : `rtmps://live.cloudflare.com:443/live/STREAM_KEY`
3. Retournez à l'écran principal → **Start Broadcast**
4. Votre stream apparaît automatiquement sur le marketplace !

---

## 🐛 Troubleshooting

### Erreur "Authentication error [code: 10000]"
→ L'API token n'a pas les bonnes permissions. Recréez un token avec permissions D1.

### Erreur "Database not found"
→ Le `database_id` dans `wrangler.jsonc` est incorrect. Vérifiez avec `npx wrangler d1 list`.

### Erreur "JWT_SECRET not configured"
→ Configurez les secrets avec `npx wrangler pages secret put`.

### Stream ne démarre pas
→ Vérifiez que la Stream Key est correcte et que OBS est configuré en RTMPS.

---

## 📊 Coûts en Production

**Pour 1000 vendeurs × 3 heures (Black Friday) :**
- Cloudflare Stream Recording : $900
- Cloudflare Stream Storage : $900
- Cloudflare Pages : **GRATUIT**
- Cloudflare Workers : **GRATUIT** (< 100k req/day)
- Cloudflare D1 : **GRATUIT** (< 5M lectures/day)
- **Total : $1,800** ($1.80 par vendeur)

---

## 🎯 URLs Importantes

**Dashboard Cloudflare :**
- Account : https://dash.cloudflare.com/4a0b3e35f24b28cd17c247aef02dc728
- Stream : https://dash.cloudflare.com/4a0b3e35f24b28cd17c247aef02dc728/stream
- D1 : https://dash.cloudflare.com/4a0b3e35f24b28cd17c247aef02dc728/workers/d1
- Pages : https://dash.cloudflare.com/4a0b3e35f24b28cd17c247aef02dc728/pages

**API Tokens :**
- https://dash.cloudflare.com/profile/api-tokens

**Documentation :**
- Cloudflare Stream : https://developers.cloudflare.com/stream/
- Cloudflare D1 : https://developers.cloudflare.com/d1/
- Cloudflare Pages : https://developers.cloudflare.com/pages/

---

## 📞 Support

Si vous avez des questions pendant le déploiement, consultez les logs :

```bash
# Logs wrangler (locaux)
cat ~/.config/.wrangler/logs/wrangler-*.log

# Logs Cloudflare Pages (production)
npx wrangler pages deployment tail --project-name webapp
```

---

**Auteur:** Assistant AI  
**Date:** 2026-02-20  
**Version:** 1.0.0  
**Stack:** Hono + Cloudflare Pages + D1 + Stream + Multi-Tenant
