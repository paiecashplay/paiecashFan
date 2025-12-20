# 🚀 GUIDE DE LANCEMENT - PAIECASHPLAY

## ⚠️ PROBLÈME : "Site inaccessible"

Si vous voyez "Ce site est inaccessible", c'est que **le serveur n'est pas lancé** ou **le port est incorrect**.

---

## ✅ SOLUTION : 4 MÉTHODES

### 🔷 MÉTHODE 1 : Python 3 (Recommandée)

#### Étape 1 : Ouvrir le terminal
- **Windows** : Touche Windows → Taper "cmd" → Entrée
- **Mac** : Cmd + Espace → Taper "terminal" → Entrée
- **Linux** : Ctrl + Alt + T

#### Étape 2 : Aller dans le dossier du projet
```bash
cd /chemin/vers/le/dossier
```

**Exemple Windows** :
```bash
cd C:\Users\VotreNom\Documents\paiecashplay
```

**Exemple Mac/Linux** :
```bash
cd ~/Documents/paiecashplay
```

#### Étape 3 : Lancer le serveur
```bash
python3 -m http.server 8000
```

**Si erreur "python3 not found"**, essayer :
```bash
python -m http.server 8000
```

#### Étape 4 : Vérifier que ça fonctionne
Vous devez voir :
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

#### Étape 5 : Ouvrir le navigateur
1. Ouvrir **Chrome** ou **Firefox**
2. Aller à : **`http://localhost:8000/test.html`**
3. Si vous voyez "✅ Le serveur fonctionne !", cliquer sur le bouton

---

### 🔷 MÉTHODE 2 : Python 2

Si Python 3 ne fonctionne pas :

```bash
python -m SimpleHTTPServer 8000
```

Puis ouvrir : **`http://localhost:8000/test.html`**

---

### 🔷 MÉTHODE 3 : Node.js (npx)

Si vous avez Node.js installé :

```bash
npx http-server -p 8000
```

Puis ouvrir : **`http://localhost:8000/test.html`**

---

### 🔷 MÉTHODE 4 : Live Server (VS Code)

Si vous utilisez Visual Studio Code :

1. Installer l'extension **"Live Server"**
2. Clic droit sur `app.html`
3. **"Open with Live Server"**

L'application s'ouvre automatiquement !

---

## 🐛 DÉPANNAGE

### Problème : "Port 8000 déjà utilisé"

**Solution 1** : Utiliser un autre port
```bash
python3 -m http.server 8001
```
Puis ouvrir : `http://localhost:8001/test.html`

**Solution 2** : Arrêter le serveur existant
- **Windows** : Ctrl + C dans le terminal
- **Mac/Linux** : Ctrl + C dans le terminal

### Problème : "python3 not found"

**Solution** : Installer Python

1. Aller sur : https://www.python.org/downloads/
2. Télécharger Python 3.11 ou supérieur
3. Installer (cocher "Add to PATH")
4. Relancer le terminal
5. Réessayer : `python3 -m http.server 8000`

### Problème : "ERR_CONNECTION_REFUSED"

**Cause** : Le serveur n'est pas lancé

**Solution** : 
1. Vérifier que le terminal affiche "Serving HTTP..."
2. Si non, relancer la commande
3. Ne pas fermer le terminal pendant l'utilisation

### Problème : Page blanche

**Solution** :
1. Vérifier l'URL : doit être `http://localhost:8000/app.html` (pas `file:///`)
2. F12 → Console → Vérifier les erreurs
3. Recharger la page (Ctrl + R ou Cmd + R)

---

## ✅ CHECKLIST DE VÉRIFICATION

Avant de dire "ça ne marche pas", vérifier :

- [ ] Le terminal est ouvert
- [ ] Je suis dans le bon dossier (`cd /chemin/vers/projet`)
- [ ] La commande est lancée (`python3 -m http.server 8000`)
- [ ] Le terminal affiche "Serving HTTP..."
- [ ] L'URL est correcte (`http://localhost:8000/test.html`)
- [ ] Le port est correct (8000, pas 3000 ou autre)
- [ ] Le navigateur est Chrome ou Firefox
- [ ] Je n'ai pas fermé le terminal

---

## 🎯 TEST DE CONNEXION

### Test 1 : Page de test
```
http://localhost:8000/test.html
```
✅ Devrait afficher "Le serveur fonctionne !"

### Test 2 : Application
```
http://localhost:8000/app.html
```
✅ Devrait afficher l'application complète

---

## 📱 MODE MOBILE (après lancement)

Une fois que `app.html` fonctionne :

1. **F12** (Outils développeur)
2. **Ctrl + Shift + M** (Toggle device toolbar)
3. Sélectionner **"iPhone 12 Pro"**

---

## 🔍 VÉRIFIER LES FICHIERS

Les 3 fichiers doivent être dans le même dossier :

```
📁 Dossier projet
├── app.html       (16.6 KB)
├── app.css        (24.1 KB)
├── app.js         (18.9 KB)
└── test.html      (1.4 KB)
```

**Vérification** :
```bash
ls -lh app.*
```

Ou sur Windows :
```bash
dir app.*
```

---

## 💡 ASTUCES

### Astuce 1 : Garder le terminal ouvert
Ne fermez JAMAIS le terminal pendant l'utilisation de l'app.

### Astuce 2 : Arrêter proprement
Pour arrêter le serveur :
- **Ctrl + C** dans le terminal

### Astuce 3 : Relancer après modification
Si vous modifiez les fichiers :
1. Ctrl + C (arrêter serveur)
2. `python3 -m http.server 8000` (relancer)
3. Ctrl + R dans le navigateur (recharger)

### Astuce 4 : Port déjà utilisé
Si le port 8000 est occupé, utiliser 8001, 8002, etc.

---

## 📞 AIDE RAPIDE

### Commandes rapides

**Lancer serveur** :
```bash
python3 -m http.server 8000
```

**Tester la connexion** :
```bash
curl http://localhost:8000/test.html
```

**Lister les fichiers** :
```bash
ls -lh *.html *.css *.js
```

---

## 🎬 PROCÉDURE COMPLÈTE (COPIER-COLLER)

### Windows

```bash
cd C:\Users\VotreNom\Documents\paiecashplay
python -m http.server 8000
```

Puis ouvrir Chrome : `http://localhost:8000/test.html`

### Mac

```bash
cd ~/Documents/paiecashplay
python3 -m http.server 8000
```

Puis ouvrir Chrome : `http://localhost:8000/test.html`

### Linux

```bash
cd ~/Documents/paiecashplay
python3 -m http.server 8000
```

Puis ouvrir Firefox : `http://localhost:8000/test.html`

---

## ✅ ÇA MARCHE !

Si vous voyez la page de test avec "✅ Le serveur fonctionne !", 
**cliquez sur le bouton "Ouvrir l'application"**.

L'application PaieCashPlay va se charger avec :
- 🏠 Accueil (réseau social + amis)
- 💎 Fidélité (OM Coin + badges)
- ⭐ Légendes (11 ambassadeurs)
- 🎟️ Billets (3 matchs)
- 🛍️ Boutique (6 produits)
- 💳 Paiement (Carte PaieCash + Lyf Pay)

---

## 📞 SUPPORT

**Email** : etot@paiecash.com  
**Téléphone** : +33 7 67 12 96 52

---

## 🎯 RÉSUMÉ EN 3 ÉTAPES

1. **Terminal** : `python3 -m http.server 8000`
2. **Navigateur** : `http://localhost:8000/test.html`
3. **Cliquer** : Bouton "Ouvrir l'application"

**C'EST TOUT !** 🚀

---

*Guide de lancement - 5 Décembre 2025*
