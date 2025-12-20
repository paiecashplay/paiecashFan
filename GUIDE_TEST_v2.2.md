# 🧪 GUIDE COMPLET DE TEST - PaieCashPlay v2.2

## 📋 Table des Matières
1. [Installation Rapide](#installation-rapide)
2. [Navigation Générale](#navigation-générale)
3. [Tests par Fonctionnalité](#tests-par-fonctionnalité)
4. [Scénarios Complets](#scénarios-complets)

---

## 🚀 Installation Rapide

### Méthode 1 : Direct
```bash
# Ouvrir directement dans le navigateur
open fan-app-v2.2.html
```

### Méthode 2 : Serveur Local (Recommandé)
```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx http-server -p 8000

# Puis ouvrir : http://localhost:8000/fan-app-v2.2.html
```

### Méthode 3 : Mode Mobile Chrome
```
1. F12 → Mode Device (Ctrl+Shift+M)
2. Sélectionner "iPhone X" (375x812px)
3. Rafraîchir la page
```

---

## 🎯 Navigation Générale

### Structure de l'App

```
┌─────────────────────────────────┐
│         HEADER (fixe)            │ ← Logo club, nom, notifications
├─────────────────────────────────┤
│    IA ASSISTANT BAR (fixe)       │ ← 🤖 NOUVEAU : IA en haut !
├─────────────────────────────────┤
│                                  │
│      CONTENU PRINCIPAL           │
│       (5 sections)               │
│                                  │
├─────────────────────────────────┤
│   BOTTOM NAV (5 tabs fixe)       │ ← Feed, Billetterie, Boutique,
└─────────────────────────────────┘   Wallet, Profil
```

### Les 5 Tabs Bottom Navigation

| Tab | Icône | Fonctionnalités |
|-----|-------|-----------------|
| **Feed** | 🏠 | Posts sociaux, Stories, Likes, Commentaires |
| **Billetterie** | 🎫 | Matchs disponibles, Mes billets NFT |
| **Boutique** | 🛍️ | Produits officiels, Panier, Checkout |
| **Wallet** | 💰 | Carte 3D, Wallets, OM Coin, P2P, Historique |
| **Profil** | 👤 | Engagement, Badges, Réseaux sociaux, Paramètres |

---

## 🧪 Tests par Fonctionnalité

### ✅ **TEST 1 : IA ASSISTANT EN HAUT**

#### Objectif
Vérifier que l'IA est accessible en haut de l'app (pas dans le menu)

#### Étapes
1. **Ouvrir** l'app
2. **Regarder** juste sous le header
3. **Voir** la barre bleue/verte avec 🤖
4. **Lire** : "L'IA est prête à t'aider..."
5. **Cliquer** sur la barre IA ou le bouton "›"

#### Résultat Attendu
✅ Modal fullscreen s'ouvre avec chatbot IA  
✅ Avatar 🤖 en haut  
✅ Zone messages avec historique  
✅ Input texte + bouton micro 🎤  
✅ Bouton retour "‹" en haut à gauche  

#### Points de Vérification
- [ ] Barre IA visible sous header
- [ ] Animation pulse sur avatar 🤖
- [ ] Clic ouvre modal fullscreen
- [ ] Modal se ferme avec bouton "‹"
- [ ] IA n'est PAS dans bottom navigation

---

### ✅ **TEST 2 : NOUVEAU BOTTOM NAV (5 TABS)**

#### Objectif
Vérifier que le menu bottom a 5 tabs (Feed, Billetterie, Boutique, Wallet, Profil)

#### Étapes
1. **Regarder** en bas de l'écran
2. **Compter** les tabs : doit y en avoir **5**
3. **Lire** les labels :
   - 🏠 Feed
   - 🎫 Billetterie
   - 🛍️ Boutique
   - 💰 Wallet
   - 👤 Profil
4. **Cliquer** sur chaque tab

#### Résultat Attendu
✅ 5 tabs affichés  
✅ Tab actif surligné en bleu  
✅ Chaque tab ouvre sa section  
✅ Smooth transition entre sections  
✅ Pas de tab "IA" ou "Streams" ou "Découvrir"  

#### Points de Vérification
- [ ] Exactement 5 tabs visibles
- [ ] Feed est actif par défaut
- [ ] Billetterie ouvre section matchs
- [ ] Boutique ouvre section produits
- [ ] Wallet ouvre section carte/wallets
- [ ] Profil ouvre section engagement

---

### ✅ **TEST 3 : SOLDE CARTE VISIBLE AVEC MASQUER/AFFICHER**

#### Objectif
Vérifier qu'on peut voir et masquer le solde de la carte

#### Étapes
1. **Aller** dans tab **Wallet** 💰
2. **Scroller** jusqu'à voir la carte 3D
3. **Regarder** sous la carte : "Solde carte"
4. **Voir** le montant : **1 247,50 €**
5. **Voir** le bouton **👁️** à droite du titre
6. **Cliquer** sur 👁️

#### Résultat Attendu
✅ Solde affiché clairement : "1 247,50 €"  
✅ Bouton 👁️ visible  
✅ Clic sur 👁️ → Montant devient flou  
✅ Icône change 👁️ → 🙈  
✅ Re-clic → Montant redevient visible  
✅ Cashback affiché : "+37,20 €" en vert  

#### Points de Vérification
- [ ] Solde affiché par défaut
- [ ] Bouton toggle visible
- [ ] Clic masque le montant (flou)
- [ ] Icône change 👁️ ↔ 🙈
- [ ] Re-clic affiche le montant
- [ ] Cashback reste visible

---

### ✅ **TEST 4 : WALLET ADRESSE VISIBLE**

#### Objectif
Vérifier que chaque wallet affiche son adresse avec toggle

#### Étapes
1. **Rester** dans tab **Wallet** 💰
2. **Scroller** jusqu'à "Mes Wallets"
3. **Regarder** le premier wallet (EUR)
4. **Voir** sous le montant : `0x742d...8f3a` (exemple)
5. **Voir** petit bouton 👁️ à côté de l'adresse
6. **Cliquer** sur 👁️
7. **Répéter** pour les autres wallets (BTC, ETH, etc.)

#### Résultat Attendu
✅ Adresse affichée format court : `0x742d...8f3a`  
✅ Bouton 👁️ visible à côté  
✅ Clic masque l'adresse (flou)  
✅ Re-clic affiche l'adresse  
✅ Clic sur adresse copie dans presse-papier  
✅ Toast "Adresse copiée ✓"  

#### Points de Vérification
- [ ] Adresse visible pour chaque wallet
- [ ] Format raccourci (début...fin)
- [ ] Bouton toggle fonctionne
- [ ] Copie au clic sur adresse
- [ ] Toast confirmation copie

---

### ✅ **TEST 5 : STABLECOIN CLUB (OM COIN)**

#### Objectif
Vérifier la présence du stablecoin OM Coin avec avantages

#### Étapes
1. **Rester** dans tab **Wallet** 💰
2. **Scroller** jusqu'à voir "🪙 OM Coin - Stablecoin Officiel"
3. **Regarder** la carte bleue avec logo OM
4. **Lire** les infos :
   - Nom : "OM Coin (OMC)"
   - Parité : "1 OMC = 1 EUR"
   - Solde : "2 450.00 OMC"
5. **Voir** bouton "Acheter OMC"
6. **Lire** les 3 avantages :
   - ✓ Achats boutique -5%
   - ✓ Billets prioritaires
   - ✓ Cashback +2%
7. **Cliquer** sur bouton "Acheter OMC"

#### Résultat Attendu
✅ Section dédiée OM Coin visible  
✅ Logo OM dans cercle blanc  
✅ Parité 1:1 avec EUR affichée  
✅ Solde OMC affiché : 2450.00 OMC  
✅ Bouton toggle solde OMC (👁️)  
✅ Bouton "Acheter OMC" blanc  
✅ 3 avantages en vert affichés  
✅ Clic "Acheter" ouvre modal (simulation)  

#### Points de Vérification
- [ ] Card OM Coin visible
- [ ] Logo OM affiché
- [ ] Solde 2450 OMC
- [ ] Parité 1:1 EUR mentionnée
- [ ] 3 avantages listés
- [ ] Bouton acheter fonctionnel
- [ ] Toggle solde fonctionne

---

### ✅ **TEST 6 : RECHERCHE P2P PAR ADRESSE OU TÉLÉPHONE**

#### Objectif
Vérifier qu'on peut chercher quelqu'un par adresse wallet OU numéro téléphone

#### Étapes
1. **Rester** dans tab **Wallet** 💰
2. **Scroller** jusqu'à "👥 Envoyer de l'argent"
3. **Voir** barre recherche : "Adresse wallet ou numéro de téléphone"
4. **Taper** dans l'input : `0x742d35f8a` (exemple adresse)
5. **Cliquer** bouton 🔍
6. **Voir** résultat avec photo + nom + adresse
7. **Effacer** et taper : `+33612345678`
8. **Cliquer** 🔍
9. **Voir** résultat avec photo + nom + téléphone
10. **Cliquer** sur un résultat

#### Résultat Attendu
✅ Barre recherche visible avec placeholder  
✅ Bouton 🔍 à droite  
✅ Recherche par adresse fonctionne  
✅ Recherche par téléphone fonctionne  
✅ Résultats affichés avec :  
   - Photo profil  
   - Nom  
   - Identifiant (adresse ou tél)  
✅ Clic résultat ouvre modal P2P  

#### Points de Vérification
- [ ] Barre recherche présente
- [ ] Placeholder correct
- [ ] Bouton recherche visible
- [ ] Accepte adresse wallet
- [ ] Accepte numéro téléphone
- [ ] Résultats affichés
- [ ] Clic ouvre modal transfert

---

### ✅ **TEST 7 : MOT DE PASSE CONFIRMATION P2P**

#### Objectif
Vérifier qu'un mot de passe est demandé avant envoi d'argent

#### Étapes
1. **Continuer** du test précédent (résultat recherche cliqué)
2. **Modal P2P** s'ouvre
3. **Voir** contact sélectionné avec photo
4. **Remplir** montant : `50`
5. **Sélectionner** devise : `OM Coin`
6. **Taper** message : "Pour billets 🎫"
7. **Regarder** NOUVEAU champ : "🔒 Confirme avec ton mot de passe"
8. **Voir** input type password
9. **Taper** mot de passe : `test1234`
10. **Cliquer** "Confirmer l'envoi"

#### Résultat Attendu
✅ Modal P2P complet affiché  
✅ Contact avec photo + nom  
✅ Input montant  
✅ Select devise (EUR, OMC, PAIE, BTC, ETH)  
✅ Textarea message  
✅ **NOUVEAU** : Input password visible  
✅ Label "🔒 Confirme avec ton mot de passe"  
✅ Caractères masqués (•••••)  
✅ Bouton "Confirmer l'envoi"  
✅ Validation : Si password vide → toast erreur  
✅ Si password rempli → transfert + confetti  

#### Points de Vérification
- [ ] Champ password présent
- [ ] Label clair avec 🔒
- [ ] Type password (masqué)
- [ ] Validation avant envoi
- [ ] Toast erreur si vide
- [ ] Transfert si rempli
- [ ] Confetti animation
- [ ] Modal se ferme
- [ ] Toast "50 OMC envoyés !"

---

### ✅ **TEST 8 : BILLETTERIE SECTION**

#### Objectif
Vérifier la nouvelle section billetterie dans bottom nav

#### Étapes
1. **Cliquer** sur tab **🎫 Billetterie**
2. **Voir** header : "🎫 Billetterie - Matchs & Événements"
3. **Section "Prochains Matchs"**
4. **Voir** 3 matchs affichés :
   - OM vs PSG (15 Déc 2025)
   - OM vs OL (22 Déc 2025)
   - OM vs Monaco (5 Jan 2026)
5. **Pour chaque match** voir :
   - Date et heure
   - Badge (Classique, Important, etc.)
   - Logos équipes
   - Prix (à partir de...)
   - Bouton "Acheter"
6. **Cliquer** "Acheter" sur OM vs PSG

#### Résultat Attendu
✅ Tab Billetterie ouvre section matchs  
✅ 3 matchs listés avec détails  
✅ Design card avec border bleu  
✅ Logos clubs affichés  
✅ Date + heure + lieu  
✅ Badge type match (Classique, etc.)  
✅ Prix affiché en vert  
✅ Bouton "Acheter" bleu  
✅ Clic "Acheter" → modal sélection places  

#### Points de Vérification
- [ ] Section ouvre correctement
- [ ] 3 matchs affichés
- [ ] Infos complètes par match
- [ ] Logos clubs corrects
- [ ] Prix visibles
- [ ] Boutons acheter présents

---

### ✅ **TEST 9 : MES BILLETS NFT**

#### Objectif
Vérifier l'affichage des billets NFT achetés

#### Étapes
1. **Rester** dans tab **Billetterie**
2. **Scroller** jusqu'à "Mes Billets NFT"
3. **Voir** grid 2 colonnes
4. **Voir** 3 billets NFT :
   - OM vs PSG (15 Déc)
   - OM vs OL (22 Déc)
   - OM vs LOSC (29 Déc)
5. **Chaque billet** affiche :
   - Image/Icône 🎫
   - Nom match
   - Date
   - Badge NFT
6. **Cliquer** sur un billet

#### Résultat Attendu
✅ Section "Mes Billets NFT" visible  
✅ Grid 2 colonnes responsive  
✅ 3 billets affichés  
✅ Image placeholder avec 🎫  
✅ Infos match lisibles  
✅ Clic ouvre détail billet NFT  
✅ Modal avec QR code validation  
✅ Adresse blockchain  
✅ Bouton "Revendre"  

#### Points de Vérification
- [ ] Section billets visible
- [ ] Grid 2 colonnes
- [ ] 3 billets NFT
- [ ] Design cohérent
- [ ] Clic ouvre détails
- [ ] QR code présent

---

### ✅ **TEST 10 : BOUTIQUE SECTION**

#### Objectif
Vérifier la nouvelle section boutique avec panier

#### Étapes
1. **Cliquer** sur tab **🛍️ Boutique**
2. **Voir** header : "🛍️ Boutique - Produits Officiels"
3. **Voir** catégories : Tous, Maillots, Accessoires, NFT
4. **Cliquer** "Maillots"
5. **Voir** produits filtrés
6. **Pour chaque produit** voir :
   - Image/Icône
   - Badge (NOUVEAU, EXCLUSIF, etc.)
   - Nom
   - Prix en vert
   - Bouton + (ajouter panier)
7. **Cliquer** + sur "Maillot OM Domicile"
8. **Voir** badge panier 🛒 passer de 0 à 1
9. **Ajouter** 2 autres produits
10. **Cliquer** sur 🛒 (floating button bottom right)

#### Résultat Attendu
✅ Tab Boutique ouvre section produits  
✅ 4 catégories visibles  
✅ Filtrage fonctionne  
✅ Grid 2 colonnes produits  
✅ 6 produits affichés (exemple)  
✅ Badge, nom, prix visibles  
✅ Bouton + ajoute au panier  
✅ Badge 🛒 compte augmente  
✅ Animation ajout panier  
✅ Toast "Ajouté au panier ✓"  
✅ Floating button 🛒 visible  
✅ Clic ouvre modal panier  

#### Points de Vérification
- [ ] Section boutique ouvre
- [ ] Catégories présentes
- [ ] Filtrage fonctionne
- [ ] Produits affichés
- [ ] Bouton + ajoute panier
- [ ] Badge 🛒 se met à jour
- [ ] Modal panier s'ouvre

---

### ✅ **TEST 11 : PANIER & CHECKOUT AVEC OM COIN**

#### Objectif
Vérifier le panier et paiement avec OM Coin

#### Étapes
1. **Continuer** du test précédent (panier ouvert)
2. **Voir** modal "Mon Panier"
3. **Voir** 3 articles ajoutés
4. **Pour chaque article** :
   - Image
   - Nom
   - Prix
   - Quantité (- 1 +)
5. **Cliquer** + sur un article
6. **Voir** quantité augmenter
7. **Voir** total se mettre à jour
8. **Voir** footer du panier
9. **Voir** total général : "234,50 €"
10. **Voir** bouton : "Commander avec OM Coin 🪙"
11. **Cliquer** "Commander avec OM Coin"

#### Résultat Attendu
✅ Modal panier fullscreen  
✅ Articles listés avec détails  
✅ Boutons quantité (- +) fonctionnels  
✅ Total se recalcule automatiquement  
✅ Bouton "Commander avec OM Coin 🪙"  
✅ Clic → Modal confirmation  
✅ Affiche : Total, Solde OMC, Économie -5%  
✅ Bouton "Confirmer paiement OMC"  
✅ Password demandé  
✅ Validation → Toast "Commande validée !"  
✅ Confetti animation  
✅ Panier se vide  
✅ Badge 🛒 revient à 0  

#### Points de Vérification
- [ ] Modal panier complet
- [ ] Articles listés
- [ ] Quantité modifiable
- [ ] Total correct
- [ ] Bouton OM Coin visible
- [ ] Modal confirmation
- [ ] Discount -5% affiché
- [ ] Password requis
- [ ] Validation fonctionne
- [ ] Panier se vide après

---

### ✅ **TEST 12 : LYF PAY INTÉGRATION**

#### Objectif
Vérifier l'intégration Lyf Pay dans paiements

#### Étapes
1. **Revenir** à checkout (panier)
2. **Voir** options paiement :
   - 🪙 OM Coin (recommandé -5%)
   - 💳 Carte ConnectPay
   - 💶 Lyf Pay
   - ₿ Crypto (BTC, ETH, USDT)
3. **Cliquer** sur "💶 Lyf Pay"
4. **Voir** modal Lyf Pay
5. **Voir** options :
   - QR code Lyf Pay
   - Apple Pay
   - Google Pay
   - Carte bancaire
   - Titres Restaurant
6. **Voir** montant : 234,50 €
7. **Cliquer** "Payer avec Lyf Pay"

#### Résultat Attendu
✅ Lyf Pay dans options paiement  
✅ Logo Lyf Pay visible  
✅ Clic ouvre modal Lyf Pay  
✅ 5 méthodes affichées  
✅ QR code généré (simulation)  
✅ Montant affiché  
✅ Bouton "Payer" bleu  
✅ Clic → Toast "Paiement Lyf Pay en cours..."  
✅ Après 2s → Toast "Paiement validé ✓"  
✅ Confetti  
✅ Retour boutique  

#### Points de Vérification
- [ ] Lyf Pay dans options
- [ ] Modal Lyf Pay s'ouvre
- [ ] 5 méthodes présentes
- [ ] QR code visible
- [ ] Montant correct
- [ ] Paiement simulé
- [ ] Confirmation toast

---

## 🎬 Scénarios Complets

### 📍 **SCÉNARIO 1 : Parcours Fan Complet (15 min)**

**Objectif** : Tester toutes les fonctionnalités principales dans l'ordre logique

#### Étapes

1. **Ouverture App** (1 min)
   - Voir loader 2s
   - App s'affiche
   - Header OM visible
   - IA bar en haut 🤖
   - Bottom nav 5 tabs

2. **Découverte IA** (2 min)
   - Clic barre IA
   - Modal s'ouvre
   - Taper : "Bonjour"
   - Voir réponse bot
   - Tester micro 🎤 (si navigateur compatible)
   - Dire : "Quel est mon solde ?"
   - Entendre réponse vocale
   - Fermer modal

3. **Feed Social** (2 min)
   - Déjà dans Feed
   - Scroller stories
   - Voir 3 posts
   - Liker post OM (❤️ rouge)
   - Clic commentaires
   - Filtrer "Clubs"
   - Voir posts clubs uniquement

4. **Acheter Billet** (3 min)
   - Clic tab Billetterie 🎫
   - Voir OM vs PSG
   - Lire détails match
   - Clic "Acheter 75€"
   - Modal sélection places
   - Choisir Tribune Nord
   - Confirmer
   - Voir dans "Mes Billets NFT"
   - Clic billet → QR code

5. **Shopping avec OM Coin** (4 min)
   - Clic tab Boutique 🛍️
   - Filtrer "Maillots"
   - Ajouter Maillot Domicile (+)
   - Ajouter Écharpe (+)
   - Badge 🛒 = 2
   - Clic 🛒 floating button
   - Voir panier (2 articles)
   - Total 179,50€
   - Clic "Commander avec OM Coin"
   - Voir économie -5% → 170,52€
   - Solde OMC : 2450 → reste 2279,48
   - Taper password
   - Confirmer
   - Confetti 🎉
   - Toast "Commande validée !"

6. **P2P Transfer** (3 min)
   - Clic tab Wallet 💰
   - Scroller "Envoyer de l'argent"
   - Taper dans recherche : `+33612345678`
   - Clic 🔍
   - Résultat : Pierre
   - Clic Pierre
   - Modal P2P
   - Montant : 30
   - Devise : OM Coin
   - Message : "Merci 🙏"
   - Password : test1234
   - Confirmer
   - Confetti
   - Toast "30 OMC envoyés à Pierre"

#### Résultat Attendu Final
✅ Toutes les fonctionnalités testées  
✅ Aucune erreur console  
✅ Animations fluides  
✅ Toasts clairs  
✅ Haptic feedback (mobile)  
✅ Navigation logique  
✅ UX cohérente  

---

### 📍 **SCÉNARIO 2 : Sécurité & Confidentialité (5 min)**

**Objectif** : Tester toutes les fonctions masquer/afficher

#### Étapes

1. **Solde Carte** (1 min)
   - Tab Wallet
   - Voir "Solde carte : 1 247,50 €"
   - Clic 👁️
   - Montant flou
   - Icône devient 🙈
   - Re-clic
   - Montant visible
   - Icône 👁️

2. **Adresses Wallets** (2 min)
   - Scroller "Mes Wallets"
   - Wallet EUR : voir `0x742d...8f3a`
   - Clic 👁️ sur adresse
   - Adresse floue
   - Re-clic
   - Adresse visible
   - Clic sur adresse (copier)
   - Toast "Adresse copiée ✓"
   - Répéter pour BTC, ETH

3. **Solde OM Coin** (1 min)
   - Scroller "OM Coin"
   - Voir "2 450.00 OMC"
   - Clic 👁️
   - Solde flou
   - Re-clic
   - Solde visible

4. **Numéro Carte** (1 min)
   - Scroller carte 3D
   - Voir "•••• •••• •••• 4567"
   - Clic "Afficher numéro"
   - Voir "4532 1234 5678 4567"
   - Re-clic
   - Masqué

#### Résultat Attendu Final
✅ Tous les toggles fonctionnent  
✅ Animations flou smooth  
✅ Icônes changent 👁️ ↔ 🙈  
✅ États persistent (pas de reset)  
✅ Copie adresse fonctionne  
✅ Sécurité visuelle OK  

---

### 📍 **SCÉNARIO 3 : Performance & Responsiveness (3 min)**

**Objectif** : Tester performance et responsive design

#### Étapes

1. **Navigation Rapide** (1 min)
   - Cliquer rapidement entre tous les tabs
   - Feed → Billetterie → Boutique → Wallet → Profil
   - Retour Feed
   - Vérifier : pas de lag, smooth

2. **Scroll Performance** (1 min)
   - Dans chaque section, scroller vite
   - Feed : scroller posts
   - Billetterie : scroller matchs
   - Boutique : scroller produits
   - Wallet : scroller wallets
   - Profil : scroller badges
   - Vérifier : pas de saccades

3. **Responsive** (1 min)
   - F12 → Mode Device
   - Tester : iPhone SE (375x667)
   - Tester : iPhone 12 Pro (390x844)
   - Tester : iPad (768x1024)
   - Tester : Desktop (1920x1080)
   - Vérifier : layout adaptatif

#### Résultat Attendu Final
✅ Navigation instantanée  
✅ Scroll fluide 60fps  
✅ Aucun lag  
✅ Responsive 4 tailles  
✅ Polices lisibles  
✅ Boutons cliquables  
✅ Images chargées  

---

## 🐛 Bugs Connus & Solutions

### Bug 1 : IA ne s'ouvre pas
**Symptôme** : Clic sur barre IA ne fait rien  
**Solution** : Vérifier que `fan-app-v2.2.js` est chargé  
**Check console** : `Uncaught ReferenceError`

### Bug 2 : Styles cassés
**Symptôme** : Pas de couleurs, layout cassé  
**Solution** : Vérifier que `fan-app-v2.2.css` est chargé  
**Check** : F12 → Network → CSS files

### Bug 3 : Modal ne se ferme pas
**Symptôme** : Clic bouton ‹ ne ferme pas  
**Solution** : Clic en dehors du modal (backdrop)

### Bug 4 : Micro ne fonctionne pas
**Symptôme** : Bouton 🎤 ne fait rien  
**Solution** : Navigateur doit supporter Web Speech API  
**Compatible** : Chrome, Edge (pas Safari mobile)

### Bug 5 : Confetti ne s'affiche pas
**Symptôme** : Pas d'animation après transfert  
**Solution** : Normal, c'est une animation CSS subtile  
**Check** : Regarder attentivement pendant 2s

---

## ✅ Checklist Finale

### Fonctionnalités v2.2

- [ ] IA Assistant barre en haut (pas menu)
- [ ] Bottom nav : 5 tabs (Feed, Billetterie, Boutique, Wallet, Profil)
- [ ] Solde carte visible avec toggle 👁️
- [ ] Adresses wallets visibles avec toggle
- [ ] Stablecoin OM Coin présent
- [ ] Parité 1 OMC = 1 EUR
- [ ] Avantages OM Coin listés
- [ ] Recherche P2P par adresse OU téléphone
- [ ] Mot de passe confirmation P2P
- [ ] Section Billetterie fonctionnelle
- [ ] Mes Billets NFT affichés
- [ ] Section Boutique avec catégories
- [ ] Panier floating button 🛒
- [ ] Checkout avec OM Coin
- [ ] Discount -5% appliqué
- [ ] Lyf Pay dans options paiement
- [ ] Toasts notifications clairs
- [ ] Confetti animations
- [ ] Haptic feedback (mobile)
- [ ] Dark mode actif

### Performance

- [ ] Chargement < 3s
- [ ] Navigation fluide
- [ ] Scroll 60fps
- [ ] Responsive 4 tailles
- [ ] Aucune erreur console
- [ ] Assets chargés

### UX

- [ ] Boutons cliquables
- [ ] Feedback visuel clair
- [ ] Toasts informatifs
- [ ] Modals ferment bien
- [ ] Navigation intuitive
- [ ] Labels compréhensibles

---

## 📊 Rapport de Test

### Template

```
Date : __________
Testeur : __________
Navigateur : __________ (Chrome, Safari, Firefox, Edge)
Device : __________ (Desktop, Mobile, Tablette)

Fonctionnalités testées : ____ / 20
Bugs trouvés : ____
Sévérité bugs :
  - Critique : ____
  - Majeure : ____
  - Mineure : ____

Commentaires :
_________________________________
_________________________________
_________________________________

Note globale : ____ / 10
Recommandation : ☐ Approuvé  ☐ À revoir
```

---

## 🎯 Conclusion

**L'application PaieCashPlay v2.2 est prête pour test !**

Toutes les modifications demandées sont implémentées :
1. ✅ IA en haut
2. ✅ Menu 5 tabs avec Billetterie et Boutique
3. ✅ Stablecoin club (OM Coin)
4. ✅ Solde carte visible avec masquer
5. ✅ Adresses wallets visibles
6. ✅ Recherche P2P par adresse/téléphone
7. ✅ Mot de passe confirmation
8. ✅ Lyf Pay intégré

**Prêt pour démo client ! 🚀**

---

**Développé par PaieCash avec ❤️**  
*Guide de test v2.2 - Décembre 2025*