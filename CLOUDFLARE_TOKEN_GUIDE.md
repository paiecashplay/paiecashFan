# 🔑 GUIDE DE CONFIGURATION DU TOKEN CLOUDFLARE

## ✅ Permissions minimales requises

Votre token API Cloudflare doit avoir **exactement** ces permissions :

### **1️⃣ Account → Cloudflare Pages → Edit**
- ✅ Déjà configuré sur votre screenshot

### **2️⃣ Account → Account Settings → Read**
- ❌ À ajouter maintenant

---

## 🛠️ ÉTAPES À SUIVRE

### **Étape 1 : Ajouter "Account Settings → Read"**

1. Dans la dernière ligne (celle qui dit "Account → Select → Select")
2. Cliquez sur le **deuxième dropdown** (celui du milieu)
3. Faites défiler la liste jusqu'à trouver **"Account Settings"**
4. Sélectionnez **"Account Settings"**
5. Dans le **troisième dropdown**, sélectionnez **"Read"**

### **Étape 2 : Supprimer les permissions inutiles (optionnel)**

Vous pouvez cliquer sur le **"X"** à droite de ces lignes (pas nécessaires pour Cloudflare Pages) :
- Cloudflare Images
- Account Analytics
- Stream (sauf si vous utilisez Cloudflare Stream)

### **Étape 3 : Finaliser le token**

1. **Faites défiler en bas de la page**
2. Cliquez sur **"Continue to summary"**
3. Vérifiez que tout est correct
4. Cliquez sur **"Create Token"**
5. **IMPORTANT** : Copiez le token immédiatement (il ne sera affiché qu'une seule fois)

---

## 📋 CONFIGURATION FINALE ATTENDUE

```
Token Name: Read and write to Cloudflare Stream and Images

Permissions:
├── Account
│   ├── Cloudflare Pages → Edit
│   └── Account Settings → Read

Account Resources:
└── Include → All accounts
```

---

## 🚀 APRÈS LA CRÉATION DU TOKEN

1. **Copiez le token** (commence par quelque chose comme `abc123...xyz`)
2. **Allez dans l'onglet "Deploy"** de cette interface
3. **Collez le token** dans le champ "Cloudflare API Key"
4. **Cliquez sur "Save"**
5. **Revenez ici et tapez "CONTINUE"**

---

## ⚠️ SI VOUS VOYEZ UNE ERREUR

Si Cloudflare affiche une erreur lors de la création du token :
- Vérifiez que vous êtes sur le **compte principal** (pas un sous-compte)
- Assurez-vous que votre compte est **vérifié** (email + téléphone)
- Si l'erreur persiste, utilisez le template **"Edit Cloudflare Workers"** au lieu de créer un token personnalisé

---

## 🆘 BESOIN D'AIDE ?

Si vous ne trouvez pas "Account Settings" dans la liste :
1. Faites une capture d'écran du dropdown déroulant
2. Ou utilisez la recherche dans le dropdown (tapez "Account" ou "Settings")
