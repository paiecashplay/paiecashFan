# 🚀 GUIDE DE DÉPLOIEMENT - OPTION 1 : Machine Locale

## ✅ PRÉREQUIS

- ✅ Archive `paiecashfan-dist.zip` téléchargée
- ✅ Node.js installé sur votre machine (v16+)
- ✅ Token Cloudflare : `InhgL8vEYP2TDGDXYq20v4nIOQB5q5eT5XkwjYOe`

---

## 📦 ÉTAPE 1 : EXTRAIRE L'ARCHIVE

### **Sur Windows** :
```powershell
# Extraire le ZIP
Expand-Archive -Path paiecashfan-dist.zip -DestinationPath .

# Naviguer dans le dossier
cd dist
```

### **Sur macOS/Linux** :
```bash
# Extraire le ZIP
unzip paiecashfan-dist.zip

# Naviguer dans le dossier
cd dist
```

---

## 🔧 ÉTAPE 2 : INSTALLER WRANGLER

```bash
npm install -g wrangler
```

**Vérification** :
```bash
wrangler --version
# Devrait afficher : ⛅️ wrangler 4.x.x
```

---

## 🔑 ÉTAPE 3 : AUTHENTIFICATION CLOUDFLARE

### **Sur macOS/Linux** :
```bash
export CLOUDFLARE_API_TOKEN="InhgL8vEYP2TDGDXYq20v4nIOQB5q5eT5XkwjYOe"
```

### **Sur Windows (PowerShell)** :
```powershell
$env:CLOUDFLARE_API_TOKEN="InhgL8vEYP2TDGDXYq20v4nIOQB5q5eT5XkwjYOe"
```

### **Sur Windows (CMD)** :
```cmd
set CLOUDFLARE_API_TOKEN=InhgL8vEYP2TDGDXYq20v4nIOQB5q5eT5XkwjYOe
```

**Vérification** :
```bash
wrangler whoami
# Devrait afficher : 👋 You are logged in with an User API Token
```

---

## 🚀 ÉTAPE 4 : DÉPLOIEMENT

```bash
# Assurez-vous d'être dans le dossier dist/
wrangler pages deploy . --project-name paiecashfan
```

**Attendu** :
```
✨ Success! Uploaded 53 files (2.45 sec)
✨ Deployment complete! Take a peek over at https://xxxxx.paiecashfan.pages.dev
```

**Copiez l'URL affichée** (ex: `https://xxxxx.paiecashfan.pages.dev`)

---

## 🔐 ÉTAPE 5 : AJOUTER LES SECRETS TRTC

### **Secret 1 : TRTC_SDK_APP_ID**

**Sur macOS/Linux** :
```bash
echo "20033758" | wrangler pages secret put TRTC_SDK_APP_ID --project-name paiecashfan
```

**Sur Windows (PowerShell)** :
```powershell
"20033758" | wrangler pages secret put TRTC_SDK_APP_ID --project-name paiecashfan
```

**Attendu** :
```
✨ Success! Uploaded secret TRTC_SDK_APP_ID
```

---

### **Secret 2 : TRTC_SECRET_KEY**

**Sur macOS/Linux** :
```bash
echo "2865fa36abca00e0cbd108001236ba2ba10b0e4f2bfb81c4bf43b5a43e22a3ad" | wrangler pages secret put TRTC_SECRET_KEY --project-name paiecashfan
```

**Sur Windows (PowerShell)** :
```powershell
"2865fa36abca00e0cbd108001236ba2ba10b0e4f2bfb81c4bf43b5a43e22a3ad" | wrangler pages secret put TRTC_SECRET_KEY --project-name paiecashfan
```

**Attendu** :
```
✨ Success! Uploaded secret TRTC_SECRET_KEY
```

---

## 🧪 ÉTAPE 6 : TEST

### **Test 1 : Page d'accueil**
```bash
curl https://paiecashfan.pages.dev/index.html
# Devrait retourner du HTML (<!DOCTYPE html>...)
```

### **Test 2 : API TRTC**
```bash
curl -X POST https://paiecashfan.pages.dev/api/trtc/join-room \
  -H "Content-Type: application/json" \
  -d '{"club":"Brest"}'
```

**Attendu** :
```json
{
  "success": true,
  "sdkAppId": 20033758,
  "userId": "brest_x4f9a",
  "userSig": "eJyrVgrxCdYrSy1SslIy0jNQ0gHzM1NS...",
  "roomId": "brest_live",
  "club": "Brest",
  "expire": 86400
}
```

---

## 🎉 ÉTAPE 7 : TEST DANS LE NAVIGATEUR

1. **Ouvrez** : `https://paiecashfan.pages.dev/index.html`
2. **Cherchez le bouton "Live Stream"** (rouge avec icône vidéo dans le header)
3. **Cliquez dessus**
4. **Vous devriez être redirigé** vers `/trtc-live.html?club=PaieCashFan&logo=⚽&user=paiecashfan_xxxxx`
5. **Acceptez les permissions** caméra/micro
6. **Vous êtes en live !** 🎉

---

## 🌐 ÉTAPE 8 : CONFIGURER VOTRE DOMAINE PERSONNALISÉ (OPTIONNEL)

Si vous voulez utiliser `paiecashfan.paiecashplay.com` au lieu de `paiecashfan.pages.dev` :

```bash
wrangler pages domain add paiecashfan.paiecashplay.com --project-name paiecashfan
```

Puis ajoutez un enregistrement CNAME dans vos DNS :
```
CNAME  paiecashfan  paiecashfan.pages.dev
```

---

## 📋 CHECKLIST

- [ ] Archive ZIP extraite
- [ ] Wrangler installé (`wrangler --version`)
- [ ] Token Cloudflare configuré (`wrangler whoami`)
- [ ] Déploiement réussi (`wrangler pages deploy . --project-name paiecashfan`)
- [ ] URL reçue (ex: `https://xxxxx.paiecashfan.pages.dev`)
- [ ] Secret TRTC_SDK_APP_ID ajouté
- [ ] Secret TRTC_SECRET_KEY ajouté
- [ ] Test API TRTC réussi (curl)
- [ ] Page d'accueil accessible dans le navigateur
- [ ] Bouton "Live Stream" visible
- [ ] Clic sur "Live Stream" → Redirection vers `/trtc-live.html`
- [ ] Caméra/micro s'activent automatiquement
- [ ] Streaming fonctionnel

---

## 🆘 DÉPANNAGE

### **Erreur : "wrangler: command not found"**
→ Installez Wrangler : `npm install -g wrangler`

### **Erreur : "Authentication error"**
→ Vérifiez que le token est bien configuré : `echo $CLOUDFLARE_API_TOKEN` (macOS/Linux) ou `echo %CLOUDFLARE_API_TOKEN%` (Windows)

### **Erreur : "Project not found"**
→ Le projet n'existe pas encore, il sera créé automatiquement lors du premier déploiement

### **Erreur : "Failed to fetch" dans le navigateur**
→ Attendez 1-2 minutes que le déploiement se propage

### **La caméra ne s'active pas**
→ Vérifiez les permissions du navigateur (icône de verrouillage à gauche de l'URL)

### **Erreur : "Invalid UserSig"**
→ Vérifiez que les secrets TRTC sont bien ajoutés : `wrangler pages secret list --project-name paiecashfan`

---

## 📞 COMMANDES UTILES

```bash
# Lister les projets
wrangler pages project list

# Lister les secrets
wrangler pages secret list --project-name paiecashfan

# Voir les déploiements
wrangler pages deployment list --project-name paiecashfan

# Supprimer un secret
wrangler pages secret delete SECRET_NAME --project-name paiecashfan

# Logs en temps réel
wrangler pages deployment tail --project-name paiecashfan
```

---

## 🎯 RÉSULTAT FINAL

✅ **Site en ligne** : `https://paiecashfan.pages.dev`
✅ **API TRTC fonctionnelle** : `/api/trtc/join-room`
✅ **Streaming multi-utilisateurs** : Latence < 200ms, 1080p adaptatif
✅ **Bouton Live Stream** : Visible dans le header de toutes les pages
✅ **Génération automatique** : userId type `paiecashfan_x4f9a`

---

## 🚀 PROCHAINES ÉTAPES

Une fois le site déployé, vous pouvez :
1. **Partager l'URL** avec vos utilisateurs
2. **Tester avec plusieurs personnes** en simultané
3. **Ajouter un domaine personnalisé** (paiecashfan.paiecashplay.com)
4. **Consulter les logs** : `wrangler pages deployment tail`
5. **Mettre à jour** : Re-déployer avec la même commande

---

## 💡 ASTUCE

Pour redéployer après des modifications :
```bash
# Depuis le dossier dist/
wrangler pages deploy . --project-name paiecashfan
```

Les secrets restent configurés, pas besoin de les re-ajouter !
