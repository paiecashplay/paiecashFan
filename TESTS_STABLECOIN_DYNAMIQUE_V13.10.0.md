# 🧪 TESTS STABLECOIN DYNAMIQUE V13.10.0

## 📋 DATE : 17 Décembre 2025

---

## 🎯 OBJECTIF DES TESTS

Vérifier que **CHAQUE CLUB** affiche automatiquement son propre stablecoin dans :
1. Section principale stablecoin
2. Carte PaieCash co-brandée
3. Interface de paiement (simulation)
4. Checkout boutique

---

## ✅ CLUBS À TESTER

### 🇫🇷 CLUBS FRANÇAIS
1. **Olympique de Marseille** (par défaut)
   - URL: `https://jphbvnok.gensparkspace.com/app-universal-simple.html`
   - Stablecoin: OMC (OM Coin)
   - Emoji: 🔵⚪
   - Couleurs: Bleu OM (#0052a5, #00b4d8)

2. **Paris Saint-Germain**
   - URL: `https://jphbvnok.gensparkspace.com/app-universal-simple.html?club=paris-saint-germain`
   - Stablecoin: PSC (PSG Coin)
   - Emoji: 🔴🔵
   - Couleurs: Rouge/Bleu PSG (#004170, #E1000F)

3. **Olympique Lyonnais**
   - URL: `https://jphbvnok.gensparkspace.com/app-universal-simple.html?club=olympique-lyonnais`
   - Stablecoin: OLC (OL Coin)
   - Emoji: 🔴🔵
   - Couleurs: Rouge/Bleu OL (#DA020E, #01499D)

4. **AS Monaco**
   - URL: `https://jphbvnok.gensparkspace.com/app-universal-simple.html?club=as-monaco`
   - Stablecoin: ASC (AS Monaco Coin)
   - Emoji: 🔴⚪
   - Couleurs: Rouge/Blanc (#CE1126, #ffffff)

5. **LOSC Lille**
   - URL: `https://jphbvnok.gensparkspace.com/app-universal-simple.html?club=losc-lille`
   - Stablecoin: LSC (LOSC Coin)
   - Emoji: 🔴⚪
   - Couleurs: Rouge/Blanc (#D2122E, #ffffff)

6. **RC Lens**
   - URL: `https://jphbvnok.gensparkspace.com/app-universal-simple.html?club=rc-lens`
   - Stablecoin: RCL (RC Lens Coin)
   - Emoji: 🟡🔴
   - Couleurs: Jaune/Rouge (#FFC627, #D2122E)

### 🇬🇧 CLUBS ANGLAIS
7. **Arsenal FC**
   - URL: `https://jphbvnok.gensparkspace.com/app-universal-simple.html?club=arsenal-fc`
   - Stablecoin: AFC (Arsenal Coin)
   - Emoji: 🔴⚪
   - Couleurs: Rouge/Blanc (#EF0107, #ffffff)

8. **Liverpool FC**
   - URL: `https://jphbvnok.gensparkspace.com/app-universal-simple.html?club=liverpool-fc`
   - Stablecoin: LFC (Liverpool Coin)
   - Emoji: 🔴
   - Couleurs: Rouge Liverpool (#C8102E, #00B2A9)

### 🇩🇪 CLUB ALLEMAND
9. **Bayern Munich**
   - URL: `https://jphbvnok.gensparkspace.com/app-universal-simple.html?club=bayern-munich`
   - Stablecoin: BMC (Bayern Coin)
   - Emoji: 🔴🔵
   - Couleurs: Rouge/Bleu (#DC052D, #0066B2)

### 🇪🇸 CLUB ESPAGNOL
10. **Real Madrid**
    - URL: `https://jphbvnok.gensparkspace.com/app-universal-simple.html?club=real-madrid`
    - Stablecoin: RMC (Real Madrid Coin)
    - Emoji: ⚪🟡
    - Couleurs: Blanc/Jaune (#FEBE10, #00529F)

### 🇹🇷 CLUBS TURCS
11. **Galatasaray**
    - URL: `https://jphbvnok.gensparkspace.com/app-universal-simple.html?club=galatasaray`
    - Stablecoin: GSC (Galatasaray Coin)
    - Emoji: 🟡🔴
    - Couleurs: Jaune/Rouge (#FDB913, #D2122E)

12. **Fenerbahçe**
    - URL: `https://jphbvnok.gensparkspace.com/app-universal-simple.html?club=fenerbahce`
    - Stablecoin: FBC (Fenerbahçe Coin)
    - Emoji: 🟡🔵
    - Couleurs: Jaune/Bleu (#FFED00, #00529F)

13. **Beşiktaş**
    - URL: `https://jphbvnok.gensparkspace.com/app-universal-simple.html?club=besiktas`
    - Stablecoin: BJC (Beşiktaş Coin)
    - Emoji: ⚫⚪
    - Couleurs: Noir/Blanc (#000000, #ffffff)

14. **Trabzonspor** ⭐ NOUVEAU
    - URL: `https://jphbvnok.gensparkspace.com/app-universal-simple.html?club=trabzonspor`
    - Stablecoin: TBC (Trabzonspor Coin)
    - Emoji: 🔵🟤
    - Couleurs: Bordeaux/Grenat (#6e2142, #9b3458)

---

## 📝 CHECKLIST PAR CLUB

Pour **CHAQUE** club listé ci-dessus, vérifier :

### 1. SECTION STABLECOIN PRINCIPALE
- [ ] Le stablecoin affiché correspond au club (code, nom, emoji)
- [ ] Les couleurs du fond correspondent au club
- [ ] Le taux de change est affiché : `1 [CODE] = 1 EUR = 655.96 FCFA`
- [ ] Les avantages mentionnent le nom du club
- [ ] Exemple : "Cashback +10% sur achats Trabzonspor"

### 2. CARTE PAIECASH CO-BRANDÉE
- [ ] Le titre est "Carte PaieCash [ABBREV]"
- [ ] Les couleurs du fond correspondent au club
- [ ] La mention du stablecoin est correcte : "[CODE] (Stablecoin [NOM])"
- [ ] "Tous les Packs Fan [ABBREV]" s'affiche
- [ ] "Abonnement Fan [NOM_COMPLET] (mensuel/annuel)" s'affiche

### 3. INTERFACE DE PAIEMENT (SIMULATION)
- [ ] Le texte intro mentionne le club : "acheter un produit [CLUB]"
- [ ] Le pack affiché est "Pack Fan [ABBREV] - Starter"
- [ ] L'option stablecoin affiche le bon nom, code et emoji
- [ ] Les couleurs du bouton stablecoin correspondent au club
- [ ] Le cashback +10% est mentionné

### 4. CHECKOUT BOUTIQUE
- [ ] Ajouter un produit au panier
- [ ] Cliquer sur "Procéder au paiement"
- [ ] Vérifier que le stablecoin affiché correspond au club
- [ ] Les couleurs de l'option stablecoin sont correctes
- [ ] Sélectionner le stablecoin et finaliser
- [ ] Le message de confirmation affiche le bon stablecoin

---

## 🎯 TESTS PRIORITAIRES (MINIMUM)

Si le temps est limité, tester au minimum ces 5 clubs :

1. ✅ **Olympique de Marseille** (défaut) - OMC
2. ✅ **Paris Saint-Germain** - PSC
3. ✅ **Trabzonspor** ⭐ NOUVEAU - TBC
4. ✅ **Arsenal FC** - AFC
5. ✅ **Galatasaray** - GSC

---

## 🚀 PROCÉDURE DE TEST

### ÉTAPE 1 : DÉPLOYER LE PROJET
1. Aller dans l'onglet **Publish**
2. Cliquer sur **Deploy**
3. Attendre la fin du déploiement
4. Noter l'URL de déploiement (ex: `https://jphbvnok.gensparkspace.com/`)

### ÉTAPE 2 : TESTER CHAQUE CLUB
Pour chaque URL de club :

1. **Ouvrir l'URL dans le navigateur**
2. **Faire un HARD REFRESH** (Ctrl+Shift+R / Cmd+Shift+R)
3. **Scroller vers la section "Moyens de Paiement"**
4. **Vérifier les 4 points de la checklist**
5. **Prendre des captures d'écran si nécessaire**
6. **Noter tout bug ou incohérence**

### ÉTAPE 3 : TESTER LE CHECKOUT
1. **Ajouter un produit au panier**
2. **Cliquer sur l'icône panier (coin haut-droit)**
3. **Cliquer sur "Procéder au paiement"**
4. **Vérifier que le stablecoin du club est affiché**
5. **Sélectionner le stablecoin et finaliser le paiement**
6. **Vérifier le message de confirmation**

---

## 🐛 BUGS CONNUS À VÉRIFIER

### ❌ AVANT V13.10.0
- Stablecoin hardcodé "OMC" partout
- Carte PaieCash toujours "OM"
- Interface de paiement toujours "OM Coin (OMC)"
- Checkout toujours "OM Coin (OMC)"

### ✅ APRÈS V13.10.0 (À CONFIRMER)
- Stablecoin dynamique selon le club actif
- Carte PaieCash adaptée au club
- Interface de paiement dynamique
- Checkout dynamique

---

## 📊 RÉSULTATS ATTENDUS

### 🎯 TRABZONSPOR (EXEMPLE)
URL: `?club=trabzonspor`

**Section Stablecoin:**
```
🔵🟤
Trabzonspor Coin (TBC) - Stablecoin Officiel
1 TBC = 1 EUR = 655.96 FCFA
✅ Avantages:
• Cashback +10% sur achats Trabzonspor
• Transactions instantanées
• Frais réduits (0.5%)
• Utilisable partout dans l'écosystème Trabzonspor
```
Couleurs de fond: #6e2142 → #9b3458 (bordeaux/grenat)

**Carte PaieCash:**
```
💎 Carte PaieCash TB
Rechargeable par:
• TBC (Stablecoin Trabzonspor)
Incluse dans:
• Tous les Packs Fan TB
• Abonnement Fan Trabzonspor (mensuel/annuel)
```
Couleurs de fond: #6e2142 → #9b3458

**Interface de Paiement:**
```
Choisissez votre moyen de paiement préféré pour acheter un produit Trabzonspor
Pack Fan TB - Starter

[BOUTON STABLECOIN]
🔵🟤 Trabzonspor Coin (TBC)
Cashback +10% | Instantané
```
Couleurs du bouton: #6e2142 → #9b3458

---

## 🎉 CRITÈRES DE SUCCÈS

Le test est **RÉUSSI** si :

✅ Tous les clubs affichent leur propre stablecoin  
✅ Les couleurs correspondent aux couleurs du club  
✅ Tous les textes mentionnent le nom du club  
✅ Aucun texte hardcodé "OM" ou "OMC" n'apparaît pour les autres clubs  
✅ Le checkout fonctionne avec le stablecoin du club actif  
✅ ZERO régression sur les fonctionnalités existantes

---

## 📞 REPORTING

Si un bug est détecté :
1. Noter l'URL exacte du club
2. Noter la section concernée (stablecoin/carte/paiement/checkout)
3. Prendre une capture d'écran
4. Décrire le comportement attendu vs observé
5. Rapporter dans le fichier `BUGS_V13.10.0.md`

---

## 🚀 NEXT STEPS SI TESTS OK

Si tous les tests passent :
1. ✅ Marquer V13.10.0 comme PRODUCTION READY
2. ✅ Documenter dans README.md
3. ✅ Préparer la V13.11.0 (Fédérations nationales ?)
4. ✅ Ajouter d'autres clubs européens/africains

---

**📅 Date de création :** 17 Décembre 2025  
**👤 Créé par :** Assistant IA  
**🎯 Version testée :** V13.10.0  
**📁 Fichier modifié :** app-universal-simple.html
