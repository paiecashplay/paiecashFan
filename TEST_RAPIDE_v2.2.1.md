# ⚡ TEST RAPIDE v2.2.1 (10 minutes)

## 🎯 Checklist des fonctionnalités clés

### ✅ 1. BARRE AI EN HAUT (30 sec)
- [ ] Barre violette visible sous le header
- [ ] Avatar avec animation pulse
- [ ] Aperçu texte visible
- [ ] Clic bouton 💬 → Modal s'ouvre

### ✅ 2. AGENT IA TRIVIAT (2 min)
- [ ] Message bienvenue affiché
- [ ] Taper "Quel est mon solde ?" → Réponse avec 1 247,50 € + 2 450,00 OMC
- [ ] Taper "Prochains matchs" → 3 matchs listés
- [ ] Cliquer suggestion → Message envoyé
- [ ] Console F12 : Voir `✅ Triviat authenticated` ou `Fallback mode`

### ✅ 3. MODE VOCAL (1 min)
- [ ] Cliquer onglet "🎤 Vocal"
- [ ] Cliquer "Appuyez pour parler"
- [ ] Autoriser micro
- [ ] Dire "Bonjour" → Transcription visible
- [ ] Réponse IA après relâchement

### ✅ 4. MENU 6 ONGLETS (2 min)
- [ ] **📱 Feed** : Stories + posts visibles
- [ ] **🌍 Découvrir** : Recherche "PSG" fonctionne
- [ ] **🎟️ Billetterie** : 3 matchs affichés
- [ ] **🛍️ Boutique** : 6 produits en grid
- [ ] **💳 Wallet** : Carte 3D + adresse visible
- [ ] **👤 Profil** : Badges + missions visibles

### ✅ 5. SOLDE CARTE VISIBLE (30 sec)
- [ ] Aller "💳 Wallet"
- [ ] Voir **1 247,50 €** sur la carte
- [ ] Voir **+ 37,20 € cashback**
- [ ] Cliquer 👁️ → `• • • • •`
- [ ] Re-cliquer 👁️ → `1 247,50 €`

### ✅ 6. ADRESSE WALLET VISIBLE (30 sec)
- [ ] Dans Wallet, section "Mon Wallet"
- [ ] Voir **0x742d35Cc6634C0532925a3b844Bc9e7595f8f3a**
- [ ] Cliquer 👁️ → `0x742d...8f3a`
- [ ] Cliquer 📋 → Toast "✓ Adresse copiée"

### ✅ 7. OM COIN (30 sec)
- [ ] Voir carte **OM Coin (OMC)** dans Wallet
- [ ] Solde : **2 450,00 OMC**
- [ ] Parité : **1 OMC = 1 EUR**
- [ ] 3 avantages affichés (-5%, priorité, +2%)

### ✅ 8. RECHERCHE P2P (1 min)
- [ ] Taper "+33612345678" → Sophie Martin apparaît
- [ ] Taper "0x9a8b" → Contact avec adresse trouvé
- [ ] Cliquer résultat → Modal transfert s'ouvre

### ✅ 9. TRANSFERT + MOT DE PASSE (1 min)
- [ ] Rechercher "+33612345678"
- [ ] Montant : `50`
- [ ] Mot de passe : `test1234`
- [ ] Cliquer "💸 Envoyer"
- [ ] Toast "✓ 50 OMC envoyés"
- [ ] Confettis 🎉

### ✅ 10. CHECKOUT BOUTIQUE + OM COIN (1 min)
- [ ] Onglet "🛍️ Boutique"
- [ ] Cliquer produit → Panier +1
- [ ] Cliquer 🛒
- [ ] Voir "Paiement avec OM Coin : -5%"
- [ ] Mot de passe : `test1234`
- [ ] Cliquer "Confirmer l'achat"
- [ ] Toast + Confettis 🎉

---

## 🎯 RÉSULTAT ATTENDU

**10/10 coches** = ✅ **PARFAIT** - Toutes les fonctionnalités v2.2.1 opérationnelles

**8-9/10** = ⚠️ **BON** - Vérifier les 1-2 points manquants

**< 8/10** = ❌ **PROBLÈME** - Lire README_v2.2.1.md section Dépannage

---

## 🚀 LANCEMENT

```bash
python3 -m http.server 8000
```

Ouvrir : `http://localhost:8000/fan-app-v2.2.1-complete.html`

Mode mobile : F12 → Toggle Device Toolbar → iPhone 12 Pro

---

## 🐛 DÉPANNAGE EXPRESS

| Problème | Solution |
|----------|----------|
| AI ne répond pas | Vérifier Console F12 → Fallback mode normal |
| Vocal ne marche pas | Chrome uniquement + autoriser micro |
| Stories pas visibles | Onglet "📱 Feed" → En haut |
| Checkout bloqué | Mot de passe : `test1234` |

---

**Temps total** : 10 minutes  
**Fichier** : `fan-app-v2.2.1-complete.html`
