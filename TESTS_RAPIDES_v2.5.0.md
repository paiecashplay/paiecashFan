# ✅ TESTS RAPIDES - Version 2.5.0

## 🎯 CHECKLIST DE TEST (10 minutes)

### 📱 Préparation
- [ ] Ouvrir : https://www.genspark.ai/api/code_sandbox_light/preview/5ffa0bbe-dea2-49ff-8fa2-3b12ad7066e4/index.html
- [ ] Appuyer sur **F12** (DevTools)
- [ ] Appuyer sur **Ctrl+Shift+M** (Mode mobile)
- [ ] Sélectionner **"iPhone 12 Pro"**

---

## ✅ TEST 1 : Notifications (2 min)

### Actions :
1. Cliquer sur la 🔔 en haut à droite
2. Vérifier qu'il y a **8 notifications**

### À vérifier :
- [ ] Notification "⚽ Résultat : OM 3-1 Lyon" avec lien
- [ ] Notification "📍 Bar Le Droit au But à 500m" avec localisation
- [ ] Notification "💳 Cashback 10% Orange Bank" avec lien
- [ ] Cliquer sur "➜ Voir plus" → Ouvre le lien externe
- [ ] Cliquer sur une notification avec lien interne (#billetsSection) → Navigation automatique

### Résultat attendu :
✅ Les liens s'ouvrent correctement  
✅ La localisation "500m" ou "1.2km" est affichée  
✅ Les notifications se marquent comme "lues"

---

## ✅ TEST 2 : Paiements Instantanés + Code Secret (3 min)

### Actions :
1. Aller dans **Paiement** (6e onglet)
2. Cliquer "Recharger Wallet"
3. Entrer **50€**

### À vérifier :
- [ ] Demande du code secret (car 50 > 30)
- [ ] Message "🔒 Confirmation de sécurité (Le montant dépasse 30€)"
- [ ] Après validation : "⚡ Transfert instantané"

### Actions (suite) :
4. Cliquer "Retirer vers Carte"
5. Entrer **100€**

### À vérifier :
- [ ] Demande du code secret
- [ ] Message "⚡ Retrait instantané (disponible immédiatement)"
- [ ] Ajout à l'historique des transactions

### Test Transfert P2P :
6. Cliquer sur une story d'ami (ex: "Marc Durand")
7. Cliquer "💸 Transférer de l'argent"
8. Entrer **80€**

### À vérifier :
- [ ] Message "🔒 Code de sécurité OBLIGATOIRE"
- [ ] Après validation : "⚡ Transfert instantané"

---

## ✅ TEST 3 : BNPL (Buy Now Pay Later) (2 min)

### Actions :
1. Aller dans **Boutique** (5e onglet)
2. Cliquer "Ajouter au panier" sur un produit (ex: "Maillot OM 2024/25")
3. Sélectionner "BNPL (Paiement en plusieurs fois)"

### À vérifier :
- [ ] Modal avec 6 options de paiement s'ouvre
- [ ] Option BNPL présente
- [ ] Après sélection BNPL : choix 3x, 4x ou 6x
- [ ] Échéancier détaillé affiché
- [ ] Message "Sans frais" pour 3x et 4x
- [ ] Message "Frais de 1.5% inclus" pour 6x

### Test sur Billetterie :
4. Aller dans **Billets** (4e onglet)
5. Cliquer "Acheter" sur un billet Fan-to-Fan
6. Vérifier que BNPL est disponible

---

## ✅ TEST 4 : Mon Profil (2 min)

### Actions :
1. Aller dans **Profil** (7e onglet - dernier)

### À vérifier :
- [ ] Photo de profil visible (avec "📷 Changer la photo")
- [ ] Nom : **ETOT Constantin Nicolas**
- [ ] Email : **etot@paiecash.com**
- [ ] Téléphone : **+33 7 67 12 96 52**
- [ ] Date de naissance : **09/06/1966**
- [ ] Lieu : **ESEKA, France**

### Test Statut :
2. Sélectionner "Licencié PFC"

### À vérifier :
- [ ] Champs supplémentaires apparaissent :
  - Numéro de licence
  - Date d'adhésion
  - Bouton "💾 Enregistrer"

### Test Code Secret :
3. Cliquer "✏️ Modifier" le code secret

### À vérifier :
- [ ] Modal de modification s'ouvre
- [ ] Demande code actuel + nouveau code

### Test Transactions :
4. Scroller jusqu'à "📜 Historique Complet des Transactions"

### À vérifier :
- [ ] Liste des transactions précédentes affichée
- [ ] Chaque transaction montre :
  - Icône du type
  - Description
  - Date et heure
  - Montant (+ ou -)
  - Devise (EUR, OMC)
  - Statut (Complété, En cours)

---

## ✅ TEST 5 : Shopping Direct - Publicité Sponsor (1 min)

### Actions :
1. Aller dans **Boutique** (5e onglet)
2. Regarder la vidéo en haut

### À vérifier :
- [ ] Vidéo présente
- [ ] Texte "📺 Publicité Sponsor Officiel OM (58 secondes)"
- [ ] Mention "🤝 Partenariat Orange Bank x OM"
- [ ] Offre "-20% sur tous les produits OM"
- [ ] Bouton "🎁 Profiter de l'offre Orange Bank"
- [ ] Statistiques "👁️ 15 247 spectateurs en direct"

### Actions (suite) :
3. Cliquer sur le bouton "🎁 Profiter de l'offre"

### À vérifier :
- [ ] S'ouvre dans un nouvel onglet

---

## 🎯 RÉSUMÉ DES TESTS

| Test | Temps | Statut |
|------|-------|--------|
| 1. Notifications | 2 min | ⬜ |
| 2. Paiements Instantanés | 3 min | ⬜ |
| 3. BNPL | 2 min | ⬜ |
| 4. Mon Profil | 2 min | ⬜ |
| 5. Shopping Direct | 1 min | ⬜ |

**Total** : 10 minutes

---

## 🐛 BUGS POTENTIELS À VÉRIFIER

### Notifications
- [ ] Les liens externes s'ouvrent correctement
- [ ] La géolocalisation "500m" s'affiche bien
- [ ] Les notifications se marquent comme "lues"

### Paiements
- [ ] Le code secret est demandé uniquement si > 30€
- [ ] Les transferts sont vraiment instantanés (message confirmé)
- [ ] Les transactions apparaissent dans l'historique

### BNPL
- [ ] Le calcul des mensualités est correct
- [ ] Les frais de 1.5% pour 6x sont appliqués
- [ ] Le message "Sans frais" s'affiche pour 3x et 4x

### Profil
- [ ] Les informations personnelles sont complètes
- [ ] Le changement de statut (Fan/Licencié) fonctionne
- [ ] L'historique des transactions s'affiche correctement

---

## ✅ TESTS SUPPLÉMENTAIRES (Optionnel)

### Navigation
- [ ] Tous les 7 onglets sont cliquables
- [ ] Le passage d'un onglet à l'autre est fluide
- [ ] L'onglet actif est bien mis en surbrillance

### Wallet & Carte
- [ ] Les 6 stablecoins sont cliquables
- [ ] Le menu "Acheter/Échanger/Envoyer" s'ouvre
- [ ] La carte bancaire PaieCash s'affiche correctement

### Stories & Amis
- [ ] Les stories des amis sont affichées horizontalement
- [ ] Cliquer sur une story ouvre le modal ami
- [ ] Les actions "📞 Appel vocal" et "💸 Transférer" fonctionnent

---

## 📞 SUPPORT EN CAS DE PROBLÈME

**Email** : etot@paiecash.com  
**Téléphone** : +33 7 67 12 96 52

---

🎉 **Si tous les tests passent, l'application est prête pour la production !**
