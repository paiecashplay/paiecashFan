# 🚀 GUIDE DE DÉPLOIEMENT - PAIECASHFAN + TENCENT TRTC

## 🎯 VOTRE SITE EST PRÊT !

Tous les fichiers sont buildés dans `/home/user/webapp/dist/` :
- ✅ `_worker.js` (77 KB) - Worker Cloudflare avec API TRTC
- ✅ `index.html` (42 KB) - Page d'accueil avec bouton "Live Stream"
- ✅ `trtc-live.html` - Page de streaming Tencent TRTC
- ✅ `app-universal-simple.html` - Votre application principale
- ✅ Toutes les autres pages HTML

---

## 🚨 PROBLÈME : Sandbox ne peut pas se connecter à Cloudflare API

Les commandes `wrangler` timeout à cause d'un problème réseau.

---

## ✅ SOLUTIONS DE DÉPLOIEMENT

### **SOLUTION 1 : Déploiement via votre machine locale (RECOMMANDÉ)**

**Prérequis** : Node.js installé sur votre ordinateur

#### **Étape 1 : Télécharger le projet**

Téléchargez le dossier `/home/user/webapp/dist/` depuis ce sandbox sur votre machine locale.

#### **Étape 2 : Installer Wrangler**

```bash
npm install -g wrangler
```

#### **Étape 3 : Authentification**

```bash
export CLOUDFLARE_API_TOKEN="InhgL8vEYP2TDGDXYq20v4nIOQB5q5eT5XkwjYOe"
```

Ou sur Windows (PowerShell) :
```powershell
$env:CLOUDFLARE_API_TOKEN="InhgL8vEYP2TDGDXYq20v4nIOQB5q5eT5XkwjYOe"
```

#### **Étape 4 : Déployer**

```bash
cd /chemin/vers/dist
wrangler pages deploy . --project-name paiecashfan
```

#### **Étape 5 : Ajouter les secrets TRTC**

```bash
# Secret 1 : SDK App ID
echo "20033758" | wrangler pages secret put TRTC_SDK_APP_ID --project-name paiecashfan

# Secret 2 : Secret Key
echo "2865fa36abca00e0cbd108001236ba2ba10b0e4f2bfb81c4bf43b5a43e22a3ad" | wrangler pages secret put TRTC_SECRET_KEY --project-name paiecashfan
```

---

### **SOLUTION 2 : Déploiement via Cloudflare Dashboard (Interface Web)**

#### **Étape 1 : Télécharger dist/**

Téléchargez le contenu du dossier `/home/user/webapp/dist/` sur votre machine.

#### **Étape 2 : Créer le projet**

1. Allez sur : https://dash.cloudflare.com/
2. Cliquez sur **"Workers & Pages"** (menu de gauche)
3. Cliquez sur **"Create application"**
4. Sélectionnez **"Pages"** → **"Upload assets"**
5. Nommez le projet : **`paiecashfan`**
6. **Glissez-déposez** tous les fichiers du dossier `dist/` (pas le dossier lui-même)
7. Cliquez sur **"Deploy site"**

#### **Étape 3 : Ajouter les secrets TRTC**

1. Dans le dashboard, allez dans **Workers & Pages** → **paiecashfan**
2. Cliquez sur **"Settings"** → **"Environment variables"**
3. Cliquez sur **"Add variable"** :
   - **Name** : `TRTC_SDK_APP_ID`
   - **Value** : `20033758`
   - **Type** : Secret (encrypted) ✅
   - **Environment** : Production
4. Cliquez sur **"Add variable"** (encore) :
   - **Name** : `TRTC_SECRET_KEY`
   - **Value** : `2865fa36abca00e0cbd108001236ba2ba10b0e4f2bfb81c4bf43b5a43e22a3ad`
   - **Type** : Secret (encrypted) ✅
   - **Environment** : Production
5. Cliquez sur **"Save"**

#### **Étape 4 : Configurer la base de données D1 (optionnel)**

Si vous utilisez la base de données :

1. Dans le dashboard, allez dans **Workers & Pages** → **D1**
2. Cliquez sur **"Create database"**
3. Nom : `paiecashfan-costreaming`
4. Cliquez sur **"Create"**
5. Copiez le **Database ID** généré
6. Retournez dans **Workers & Pages** → **paiecashfan** → **Settings** → **Bindings**
7. Cliquez sur **"Add binding"**
   - **Type** : D1 database
   - **Variable name** : `DB`
   - **D1 database** : `paiecashfan-costreaming`
8. Cliquez sur **"Save"**

---

### **SOLUTION 3 : Déploiement via Git (GitHub Pages + Cloudflare)**

#### **Étape 1 : Push vers GitHub**

Si vous avez déjà un repo GitHub :

```bash
git add .
git commit -m "feat: TRTC Live Stream integration"
git push origin main
```

#### **Étape 2 : Connecter à Cloudflare Pages**

1. Allez sur : https://dash.cloudflare.com/
2. **Workers & Pages** → **"Create application"** → **"Pages"** → **"Connect to Git"**
3. Sélectionnez votre repo GitHub
4. Configuration :
   - **Production branch** : `main`
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Root directory** : `/`
5. Cliquez sur **"Save and Deploy"**

#### **Étape 3 : Ajouter les secrets** (voir Solution 2, Étape 3)

---

## 🎉 RÉSULTAT FINAL

Une fois déployé, votre site sera accessible sur :

### **URLs de production**
- **Production principale** : `https://paiecashfan.pages.dev`
- **Page d'accueil** : `https://paiecashfan.pages.dev/index.html`
- **App universelle** : `https://paiecashfan.pages.dev/app-universal-simple.html?club=Brest&logo=⚽&sport=Football&league=Ligue+1`
- **Live Stream** : `https://paiecashfan.pages.dev/trtc-live.html`

### **Fonctionnalités**
✅ Bouton "Live Stream" dans le header
✅ Streaming multi-utilisateurs via Tencent TRTC
✅ Génération automatique des userId (ex: `paiecashfan_x4f9a`)
✅ Caméra + micro activés automatiquement
✅ Grille vidéo jusqu'à 9 participants
✅ Latence < 200ms
✅ 1080p adaptatif

---

## 🧪 TEST

Une fois déployé, testez :

1. **Ouvrez** : `https://paiecashfan.pages.dev/index.html`
2. **Cliquez** sur le bouton **"Live Stream"** (rouge avec icône vidéo)
3. **Vous serez redirigé** vers `/trtc-live.html?club=PaieCashFan&logo=⚽&user=paiecashfan_xxxxx`
4. **Acceptez** les permissions caméra/micro
5. **Vous êtes en live !**
6. **Partagez l'URL** avec un ami pour qu'il rejoigne le même live

---

## 📋 CHECKLIST DE DÉPLOIEMENT

- [ ] Dossier `dist/` téléchargé sur ma machine locale
- [ ] Projet Cloudflare Pages créé (nom: `paiecashfan`)
- [ ] Fichiers déployés avec succès
- [ ] Secret `TRTC_SDK_APP_ID` ajouté (valeur: `20033758`)
- [ ] Secret `TRTC_SECRET_KEY` ajouté (valeur: `2865fa36...`)
- [ ] Site accessible sur `https://paiecashfan.pages.dev`
- [ ] Page d'accueil chargée correctement
- [ ] Bouton "Live Stream" visible dans le header
- [ ] Clic sur "Live Stream" → Redirection vers `/trtc-live.html`
- [ ] Caméra/micro activés automatiquement
- [ ] Streaming fonctionnel

---

## 🆘 DÉPANNAGE

### **Erreur : "Authentication error"**
→ Vérifiez que les secrets TRTC sont bien ajoutés dans Environment Variables

### **Erreur : "Failed to fetch"**
→ Vérifiez que le site est bien déployé et accessible

### **La caméra ne s'active pas**
→ Vérifiez les permissions du navigateur (Paramètres → Confidentialité → Caméra/Micro)

### **UserSig invalide**
→ Vérifiez que le TRTC_SECRET_KEY est correct (2865fa36abca...)

---

## 📞 CONTACT

Si vous avez des questions ou des problèmes :
- Consultez les logs : Dashboard → Workers & Pages → paiecashfan → Deployments → View details
- Vérifiez la console du navigateur (F12) pour les erreurs JavaScript

---

## 🎯 TOKENS ET CREDENTIALS

**Cloudflare API Token** :
```
InhgL8vEYP2TDGDXYq20v4nIOQB5q5eT5XkwjYOe
```

**Tencent TRTC** :
- **SDKAppID** : `20033758`
- **SecretKey** : `2865fa36abca00e0cbd108001236ba2ba10b0e4f2bfb81c4bf43b5a43e22a3ad`

**⚠️ IMPORTANT** : Ne partagez jamais ces credentials publiquement !
