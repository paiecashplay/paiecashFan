# 🔑 Guide : Trouver votre Cloudflare Account ID

## ⚡ Méthode Rapide (2 minutes)

### Option 1 : Via le Dashboard Cloudflare (RECOMMANDÉ)

1. **Connectez-vous** à https://dash.cloudflare.com/
   - Email : `etot@paiecash.com`
   - Mot de passe : votre mot de passe Cloudflare

2. **Méthode A : Via n'importe quel site**
   - Cliquez sur n'importe quel site dans votre Dashboard
   - Regardez la barre latérale droite
   - Trouvez "Account ID" avec un bouton "Copy" 📋
   - Cliquez sur "Copy"

3. **Méthode B : Via l'URL**
   - Une fois connecté, regardez l'URL dans votre navigateur
   - Elle ressemble à : `https://dash.cloudflare.com/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/...`
   - Les 32 caractères hexadécimaux après `dash.cloudflare.com/` = votre Account ID

4. **Méthode C : Via Stream (si activé)**
   - Allez dans le menu de gauche → cherchez "Stream"
   - Ou allez directement à : https://dash.cloudflare.com/?to=/:account/stream
   - L'URL affichera : `https://dash.cloudflare.com/ACCOUNT_ID/stream`
   - Copiez la partie ACCOUNT_ID (32 caractères)

### Option 2 : Via les paramètres de compte

1. Cliquez sur votre profil (en haut à droite)
2. Sélectionnez "Manage Account"
3. L'Account ID s'affiche dans la section "Account Details"

---

## 📋 Format de l'Account ID

- **Longueur** : 32 caractères
- **Format** : Hexadécimal (chiffres 0-9 et lettres a-f)
- **Exemple** : `abc123def456ghi789jkl012mno345pq`

---

## ✅ Une fois l'Account ID trouvé

Envoyez-le dans le chat au format :

```
CLOUDFLARE_ACCOUNT_ID=votre_account_id_ici
```

Exemple :
```
CLOUDFLARE_ACCOUNT_ID=abc123def456ghi789jkl012mno345pq
```

---

## 🚨 Note Importante

L'Account ID que vous avez fourni (`5eac6f439dc6d9bb836f18a632c8dce8ad308`) n'est **pas valide** car :
- Il contient 41 caractères (au lieu de 32)
- Il ne correspond pas au format hexadécimal standard

C'est pourquoi nous devons récupérer le bon Account ID depuis le Dashboard.

---

## 🆘 Besoin d'aide ?

Si vous ne trouvez pas l'Account ID :
1. Vérifiez que vous êtes bien connecté à votre compte Cloudflare
2. Assurez-vous d'avoir accès à au moins un site/domaine
3. Contactez le support Cloudflare si nécessaire

Une fois l'ID récupéré, je pourrai :
✅ Configurer la connexion API
✅ Créer 3 Live Inputs (Match, Shopping, Creator)
✅ Récupérer les URLs RTMPS pour OBS Studio
✅ Mettre à jour les players avec les vrais UIDs
✅ Fournir la documentation complète pour streamer
