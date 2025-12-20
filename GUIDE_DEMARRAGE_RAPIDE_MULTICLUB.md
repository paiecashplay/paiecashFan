# 🚀 GUIDE DE DÉMARRAGE RAPIDE - Solution MultiClub

## 📍 Vous Êtes Ici : Solution Scalable pour Ligue 1

PaieCashPlay est maintenant déployé pour **2 clubs** avec une architecture **microservices** permettant d'ajouter facilement tous les clubs de Ligue 1 !

---

## ⚡ Démarrage en 3 Étapes

### 🎯 Étape 1 : Accéder au Hub Ligue 1

**Ouvrez le fichier :**
```
📁 ligue1-hub.html
```

**Ou double-cliquez sur :**
```
🌐 ligue1-hub.html
```

➡️ Vous verrez le hub central avec tous les clubs disponibles

---

### 🔵⚪ Étape 2 : Choisir un Club

#### Option A : Olympique de Marseille
1. Cliquez sur la carte **"Olympique de Marseille"**
2. Vous êtes redirigé vers `clubs/olympique-marseille/index.html`
3. **Connexion :** Utilisez l'ancienne connexion racine (`connexion.html`)
4. **Application :** Accédez à l'application OM complète

#### Option B : Paris FC
1. Cliquez sur la carte **"Paris FC"**
2. Vous êtes redirigé vers `clubs/paris-fc/index.html`
3. **Nouvelle connexion :** `clubs/paris-fc/connexion.html`
4. **Nouvelle app :** `clubs/paris-fc/app.html`

---

### 💻 Étape 3 : Lancer les Serveurs Backend

#### Pour Olympique de Marseille (Port 3000)
```bash
cd clubs/olympique-marseille
npm install
node server.js
```

✅ Serveur OM : `http://localhost:3000`

#### Pour Paris FC (Port 3001)
```bash
cd clubs/paris-fc
npm install
node server.js
```

✅ Serveur Paris FC : `http://localhost:3001`

---

## 🎨 Différences Entre les Clubs

### Olympique de Marseille
| Élément | Valeur |
|---------|--------|
| **Couleurs** | Bleu ciel (#2FAEE0) & Blanc |
| **Stade** | Stade Vélodrome |
| **Logo** | [Logo OM](https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg) |
| **Port Backend** | 3000 |
| **Dossier** | `clubs/olympique-marseille/` |

### Paris FC
| Élément | Valeur |
|---------|--------|
| **Couleurs** | Bleu marine (#1e3a8a) & Bleu (#3b82f6) |
| **Stade** | Stade Jean Bouin |
| **Logo** | [Logo PFC](https://upload.wikimedia.org/wikipedia/fr/thumb/2/22/Paris_FC_logo_2020.svg/1200px-Paris_FC_logo_2020.svg.png) |
| **Port Backend** | 3001 |
| **Dossier** | `clubs/paris-fc/` |

---

## 🧪 Tests Recommandés

### Test 1 : Navigation Entre Clubs
1. ✅ Ouvrir `ligue1-hub.html`
2. ✅ Cliquer sur OM → Vérifier redirection
3. ✅ Retour au hub → Cliquer sur Paris FC
4. ✅ Vérifier que les couleurs/logos changent

### Test 2 : Authentification Isolée
1. ✅ Se connecter sur OM
2. ✅ Vérifier localStorage `clubActuel = 'olympique-marseille'`
3. ✅ Aller sur Paris FC
4. ✅ Se connecter avec un compte différent
5. ✅ Vérifier isolation des données

### Test 3 : Paiements Par Club
1. ✅ OM : Tester paiement Alipay (Tribune Vélodrome)
2. ✅ Paris FC : Tester paiement Alipay (Tribune Jean Bouin)
3. ✅ Vérifier que les métadonnées incluent le bon club

---

## 🌍 Moyens de Paiement Disponibles

Sur **tous les clubs** :

### 1. 🇨🇳 Alipay
```javascript
// Exemple : Acheter billet OM
POST http://localhost:3000/api/payment/alipay/create-session
{
    "montant": 399,
    "devise": "cny",
    "description": "OM vs Lens",
    "tribune": "Tribune Ganay"
}
```

### 2. 💎 Stablecoin
```javascript
// Exemple : Recharge Paris FC
POST http://localhost:3001/api/payment/stablecoin/create-session
{
    "montant": 100,
    "crypto": "usdc",
    "description": "Recharge wallet"
}
```

### 3. 🌍 Mobile Money
```javascript
// Exemple : Paiement Mobile Money
POST http://localhost:3000/api/payment/mobilemoney/create-session
{
    "montant": 50,
    "operateur": "orange",
    "telephone": "+225XXXXXXXX"
}
```

---

## 📂 Fichiers Clés

### Hub Central
```
📁 ligue1-hub.html                    ← Point d'entrée principal
```

### Olympique de Marseille
```
📁 clubs/olympique-marseille/
   ├── index.html                     ← Page accueil OM
   ├── connexion.html                 ← Connexion (vers racine)
   └── server.js                      ← Backend OM (port 3000)
```

### Paris FC
```
📁 clubs/paris-fc/
   ├── index.html                     ← Page accueil PFC
   ├── connexion.html                 ← Connexion PFC
   ├── app.html                       ← Application PFC
   └── server.js                      ← Backend PFC (port 3001)
```

### Documentation
```
📁 ARCHITECTURE_MULTICLUB_SCALABLE.md ← Architecture technique
📁 GUIDE_DEMARRAGE_RAPIDE_MULTICLUB.md ← Ce guide
📁 README_MULTICLUB.md                 ← Documentation complète
```

---

## 🔥 Fonctionnalités Avancées

### Basculer Entre Clubs
L'utilisateur peut avoir des comptes sur plusieurs clubs :

```javascript
// Données utilisateur multi-club
{
    email: "superfan@example.com",
    clubs: {
        'olympique-marseille': {
            solde: 1000,
            omcCoins: 5000
        },
        'paris-fc': {
            solde: 500,
            pfcCoins: 2000
        }
    }
}
```

### Cashback Club-Specific
- OM : Cashback en **OMC Coins**
- Paris FC : Cashback en **PFC Coins**
- Chaque club gère sa propre monnaie

---

## ⚠️ Prérequis Techniques

### Navigateur
- Chrome/Edge/Firefox (dernière version)
- JavaScript activé
- LocalStorage activé

### Backend (si vous lancez les serveurs)
- Node.js v16+
- npm v8+
- Compte Stripe (Test Mode)

### Variables d'Environnement
Créez `.env` dans chaque dossier club :

```env
# .env (clubs/olympique-marseille/)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PORT=3000

# .env (clubs/paris-fc/)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PORT=3001
```

---

## 🆘 Dépannage

### Problème : Le Hub ne charge pas
**Solution :**
```bash
# Ouvrir en mode serveur local
python -m http.server 8000
# Puis ouvrir : http://localhost:8000/ligue1-hub.html
```

### Problème : Les logos ne s'affichent pas
**Cause :** URLs Wikipedia bloquées  
**Solution :** Télécharger les logos localement et mettre à jour les chemins

### Problème : Backend ne démarre pas
**Solution :**
```bash
# Vérifier Node.js
node --version  # Doit être >= 16

# Réinstaller dépendances
rm -rf node_modules
npm install

# Vérifier le port
lsof -i :3000  # Si occupé, changer PORT dans .env
```

---

## 📞 Support

### Questions Fréquentes
1. **Puis-je ajouter d'autres clubs ?**  
   ✅ Oui ! Voir `ARCHITECTURE_MULTICLUB_SCALABLE.md` section "Ajouter un Nouveau Club"

2. **Les données sont-elles partagées entre clubs ?**  
   ❌ Non, chaque club a son propre localStorage isolé

3. **Peut-on déployer sur un serveur réel ?**  
   ✅ Oui, voir section Déploiement Production dans la doc

---

## 🎯 Prochaines Étapes

### Pour Tester
1. ✅ Ouvrir `ligue1-hub.html`
2. ✅ Tester OM et Paris FC
3. ✅ Créer des comptes sur les 2 clubs
4. ✅ Tester les paiements Alipay

### Pour Développer
1. ✅ Lire `ARCHITECTURE_MULTICLUB_SCALABLE.md`
2. ✅ Ajouter PSG, OL, Monaco
3. ✅ Personnaliser les couleurs/tribunes
4. ✅ Déployer en production

---

## 🏆 Clubs Disponibles

| Club | Statut | Accès |
|------|--------|-------|
| **Olympique de Marseille** | ✅ Opérationnel | `clubs/olympique-marseille/` |
| **Paris FC** | ✅ Opérationnel | `clubs/paris-fc/` |
| Paris Saint-Germain | ⏳ Prochainement | - |
| Olympique Lyonnais | ⏳ Prochainement | - |
| AS Monaco | ⏳ Prochainement | - |
| LOSC Lille | ⏳ À venir | - |
| Stade Rennais | ⏳ À venir | - |
| RC Lens | ⏳ À venir | - |

**Objectif : 18 clubs Ligue 1** 🚀

---

## 📊 Statistiques Actuelles

```
📌 Clubs Déployés : 2 / 18
📌 Progression : 11%
📌 Moyens de Paiement : 4 (Alipay, Stablecoin, Mobile Money, CB)
📌 Marchés Couverts : Chine, Afrique, Europe, Premium Crypto
```

---

## ✅ Checklist de Vérification

Avant de commencer, assurez-vous que :

- [ ] `ligue1-hub.html` s'ouvre correctement
- [ ] Les 2 clubs sont visibles dans le hub
- [ ] Les logos s'affichent correctement
- [ ] La navigation entre clubs fonctionne
- [ ] Les couleurs sont correctes pour chaque club
- [ ] Les serveurs backend démarrent (si nécessaire)
- [ ] Les paiements Alipay sont configurés (Stripe)

---

**🎉 Félicitations ! Vous êtes prêt à utiliser PaieCashPlay MultiClub !**

Pour plus d'informations : voir `README_MULTICLUB.md`
