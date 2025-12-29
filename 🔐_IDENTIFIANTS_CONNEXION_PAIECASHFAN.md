# 🔐 IDENTIFIANTS DE CONNEXION - PaieCashFan

**Site en ligne :** `paiecashfan.paiecashplay.com`

---

## ✅ COMPTE DE TEST TROUVÉ

D'après les fichiers du projet, voici les identifiants de **test** qui sont codés en dur :

### 🎯 **Mot de passe de test universel**
```
Mot de passe : test1234
```

Ce mot de passe est utilisé dans plusieurs fichiers :
- `fan-app-v2.2.js` (ligne 257)
- `fan-app-v2.2.1.js` (lignes 2349, 2512)
- `script.js` (ligne 1108)

---

## 📧 EMAIL DE TEST

Aucun email spécifique n'est codé en dur, mais vous pouvez essayer :

### Option 1 : **Créer un nouveau compte**
1. Allez sur : `https://paiecashfan.paiecashplay.com`
2. Cliquez sur **"Se Connecter / S'inscrire"**
3. Créez un compte avec :
   - **Email** : Votre email (ex: `admin@paiecashfan.com`)
   - **Mot de passe** : `test1234` (ou votre choix)

### Option 2 : **Compte démo existant**
Essayez ces combinaisons courantes :
```
Email: demo@paiecashfan.com
Mot de passe: test1234

Email: admin@paiecashfan.com
Mot de passe: test1234

Email: test@paiecashfan.com
Mot de passe: test1234

Email: etot@paiecash.com
Mot de passe: test1234
```

> ⚠️ **Note** : Le fichier `auth.js` (ligne 114) mentionne l'existence d'un utilisateur `etot@paiecash.com`

---

## 🛠️ SI LES IDENTIFIANTS NE MARCHENT PAS

### 1️⃣ **Vérifier le système d'authentification**

Le projet utilise **plusieurs systèmes d'authentification** :

#### A) **LocalStorage** (Développement local)
- Stockage dans le navigateur
- Pas de base de données

#### B) **Backend Node.js** (Production)
- Base de données avec comptes réels
- Fichiers backend dans `/backend`

#### C) **JWT Tokens**
- Authentification par tokens
- Fichier : `backend/utils/jwt.js`

### 2️⃣ **Créer un compte administrateur**

Si vous avez accès au backend :

```javascript
// Dans la base de données ou via API
{
  "email": "admin@paiecashfan.com",
  "password_hash": "hash_de_test1234",
  "first_name": "Admin",
  "last_name": "PaieCashFan",
  "metadata": {
    "role": "admin"
  }
}
```

### 3️⃣ **Réinitialiser le mot de passe**

Le système a une fonction de réinitialisation :
- Fichier : `backend/routes/auth.routes.js`
- Token de reset : `generatePasswordResetToken(userId, email)`

---

## 🔑 RECOMMANDATIONS SÉCURITÉ

### ⚠️ **URGENT - AVANT LA MISE EN PRODUCTION**

1. **Changer le mot de passe de test**
   - `test1234` est visible dans le code
   - Remplacer par un système sécurisé

2. **Supprimer les mots de passe en dur**
   - Fichiers à modifier :
     - `fan-app-v2.2.js` (ligne 257)
     - `fan-app-v2.2.1.js` (lignes 2349, 2512)
     - `script.js` (ligne 1108)

3. **Utiliser le backend pour l'authentification**
   - Ne jamais stocker de mots de passe en clair
   - Utiliser bcrypt pour le hashing

4. **Activer le système JWT**
   - Déjà présent dans `backend/utils/jwt.js`
   - Sécurise les sessions utilisateurs

---

## 📂 FICHIERS IMPORTANTS

### Authentification
- `auth.js` - Système d'authentification principal
- `auth_ameliore.js` - Version améliorée
- `backend/routes/auth.routes.js` - Routes API
- `backend/models/user.model.js` - Modèle utilisateur

### Connexion
- `connexion.html` - Page de connexion
- `inscription.html` - Page d'inscription
- `inscription-club.html` - Inscription clubs

---

## 🚀 SOLUTION RAPIDE

### Pour vous connecter MAINTENANT :

1. **Allez sur** : `https://paiecashfan.paiecashplay.com/connexion.html`

2. **Essayez ces identifiants** :
   ```
   Email: admin@paiecashfan.com
   Mot de passe: test1234
   ```

3. **Si ça ne marche pas**, créez un nouveau compte via :
   - `https://paiecashfan.paiecashplay.com/inscription.html`

4. **Une fois inscrit**, votre compte sera sauvegardé

---

## 🆘 BESOIN D'AIDE ?

Si vous ne parvenez pas à vous connecter :

1. **Vérifiez la console du navigateur** (F12)
   - Cherchez les erreurs d'authentification
   - Vérifiez si le backend répond

2. **Testez l'API d'authentification** :
   ```
   POST https://paiecashfan.paiecashplay.com/api/auth/login
   Body: { "email": "test@paiecashfan.com", "password": "test1234" }
   ```

3. **Vérifiez les logs du serveur**
   - Fichiers de logs dans `/backend`
   - Erreurs de connexion à la base de données

---

## 📞 CONTACT DÉVELOPPEMENT

Pour réinitialiser vos identifiants ou créer un compte admin, vous devrez :

1. Accéder au serveur backend
2. Se connecter à la base de données
3. Créer ou modifier un utilisateur avec les droits appropriés

---

**Date** : 27 Décembre 2025  
**Version** : V16.0  
**Status** : ⚠️ Identifiants de test - À sécuriser avant production
