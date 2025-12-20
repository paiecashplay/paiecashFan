# 📋 FONCTIONNALITÉS VERSION V3 COMPLÈTE

## 🎯 OBJECTIF

Créer **`app-om-complete-v3.html`** et **`app-paris-fc-complete-v3.html`** avec TOUTES les fonctionnalités avancées.

---

## 🏆 LES 7 SECTIONS OBLIGATOIRES

### 1️⃣ ACCUEIL 🏠
**Contenu actuel (à conserver) :**
- Stories bar
- Posts des amis
- Likes, commentaires, partages

**🆕 AJOUTS NÉCESSAIRES :**
- **Bouton "Envoyer de l'argent"** - Transfert rapide P2P
- **Bouton "Appeler"** - Fonction d'appel vidéo/audio

---

### 2️⃣ FIDÉLITÉ 💎
**Contenu actuel (à conserver) :**
- Carte fidélité Platine
- OM Coin / PFC Coin
- Avantages exclusifs
- Badges
- Missions

**Status :** ✅ Complet

---

### 3️⃣ LÉGENDES ⭐
**Contenu actuel (à conserver) :**
- 11 ambassadeurs du club
- Photos, périodes, palmarès

**Status :** ✅ Complet

---

### 4️⃣ BILLETTERIE 🎟️
**Contenu actuel (à conserver) :**
- 3 prochains matchs
- Stade du club
- Prix des billets

**Status :** ✅ Complet

---

### 5️⃣ BOUTIQUE 🛍️
**Contenu actuel (à conserver) :**
- 6 produits officiels
- Catégories
- Panier flottant

**Status :** ✅ Complet

---

### 6️⃣ PAIEMENT 💳
**Contenu actuel (à conserver) :**
- Carte bancaire PaieCash
- Solutions Lyf Pay (QR Code, Lien, NFC)
- Wallet multi-devises
- Contacts P2P

**🆕 AJOUTS NÉCESSAIRES :**

#### 🤝 Partenaires de Paiement (6)
**Section à ajouter après Solutions Lyf Pay**

1. **McDonald's** 🍔
   - Logo : M jaune sur fond rouge
   - Catégorie : Fast Food
   - Cashback : 5%
   - Sponsor officiel Ligue 1
   - Paiement en 1 clic

2. **Carrefour** 🛒
   - Logo : C bleu
   - Catégorie : Grande Distribution
   - Cashback : 3%
   - Paiement en 1 clic

3. **Uber Eats** 🍕
   - Logo : UE vert
   - Catégorie : Livraison de Repas
   - Cashback : 4%
   - Paiement en 1 clic

4. **Décathlon** ⚽
   - Logo : D bleu
   - Catégorie : Articles de Sport
   - Cashback : 6%
   - Paiement en 1 clic

5. **Fnac** 📚
   - Logo : F jaune
   - Catégorie : Multimédia & Culture
   - Cashback : 3%
   - Paiement en 1 clic

6. **Sephora** 💄
   - Logo : S noir/blanc
   - Catégorie : Beauté & Cosmétiques
   - Cashback : 4%
   - Paiement en 1 clic

#### Fonctionnement Partenaires
```javascript
// Clic sur un partenaire
function payerAvecPartenaire(partenaire) {
    // 1. Ouvrir l'app du partenaire
    // 2. Wallet PaieCash déjà connecté
    // 3. Paiement en 1 clic
    // 4. Cashback automatique crédité
}
```

**Avantages :**
- ⚡ Paiement ultra-rapide (1 clic)
- 🎁 Cashback automatique (3% à 6%)
- 🔗 Wallet déjà connecté
- 📊 Historique des transactions

---

### 7️⃣ PROFIL 👤
**Contenu actuel (à conserver) :**
- Avatar utilisateur
- Nom complet
- Badge Platine
- Statistiques (Points, Coins, Badges)
- Menu avec 7 entrées :
  - ⚙️ Paramètres
  - 🎫 Mes billets
  - 🛒 Mes commandes
  - 💳 Moyens de paiement
  - 🔔 Notifications
  - ❓ Aide & Support
  - 🚪 Déconnexion

**🆕 AJOUTS NÉCESSAIRES :**

#### 📸 Upload Photo d'Identité
**Emplacement :** Après l'avatar, dans la carte profil

```html
<div class="identity-upload-section">
    <h4>📸 Vérification d'identité</h4>
    <input type="file" id="uploadIdentity" accept="image/*">
    <button onclick="uploadIdentityPhoto()">Télécharger ma pièce d'identité</button>
    <p class="upload-status" id="identityStatus">Aucune pièce téléchargée</p>
</div>
```

**Fonctionnalités :**
- Upload de carte d'identité, passeport
- Prévisualisation de la photo
- Status de vérification (En attente, Vérifié, Rejeté)
- Sécurité et cryptage

#### 🔐 Gestion Mot de Passe
**Emplacement :** Dans le menu Profil (nouvelle entrée)

```html
<button class="profile-menu-item">
    <span>🔐</span>
    <span>Changer mon mot de passe</span>
</button>
```

**Fonctionnalités :**
- Voir le mot de passe actuel (avec option "👁️ Afficher")
- Changer le mot de passe
- Exigences de sécurité :
  - Minimum 8 caractères
  - Au moins 1 majuscule
  - Au moins 1 chiffre
  - Au moins 1 caractère spécial
- Confirmation par email
- Historique des changements

---

## 💻 FONCTIONNALITÉS JAVASCRIPT À IMPLÉMENTER

### 1. Envoi d'Argent (Accueil)
```javascript
function envoyerArgentRapide() {
    // Modal avec :
    // - Liste des contacts récents
    // - Montant à envoyer
    // - Message optionnel
    // - Confirmation avec code PIN si >30€
    // - Animation de transfert
    // - Notification de succès
}
```

### 2. Fonction d'Appel (Accueil)
```javascript
function demarrerAppel(ami) {
    // Options :
    // - Appel audio 📞
    // - Appel vidéo 📹
    // - Demande de permission micro/caméra
    // - Interface d'appel en cours
    // - Historique des appels
}
```

### 3. Paiement Partenaires
```javascript
const partenaires = [
    {
        nom: "McDonald's",
        logo: "url_logo",
        categorie: "Fast Food",
        cashback: 5,
        couleurPrimaire: "#FFC72C",
        couleurSecondaire: "#DA291C"
    },
    // ... 5 autres partenaires
];

function afficherPartenaires() {
    // Grille de 6 cartes partenaires
    // Clic -> ouvre app partenaire
    // Wallet PaieCash déjà connecté
}
```

### 4. Upload Photo Identité (Profil)
```javascript
function uploadIdentityPhoto() {
    // 1. Sélection fichier (image uniquement)
    // 2. Validation (taille <5MB, format jpg/png)
    // 3. Prévisualisation
    // 4. Upload vers serveur
    // 5. Status de vérification
}
```

### 5. Gestion Mot de Passe (Profil)
```javascript
function changerMotDePasse(ancienMdp, nouveauMdp) {
    // 1. Vérification ancien mot de passe
    // 2. Validation nouveau mot de passe
    // 3. Confirmation
    // 4. Hash et enregistrement
    // 5. Email de confirmation
}

function afficherMotDePasse() {
    // Toggle entre ******* et texte clair
    // Icône 👁️ / 👁️‍🗨️
}
```

---

## 🎨 DESIGN & UI/UX

### Paiement - Section Partenaires
```css
.partners-section {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 24px;
    margin: 20px 0;
}

.partners-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.partner-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
}

.partner-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.partner-logo {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 0 auto 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 900;
}

.partner-cashback {
    background: linear-gradient(135deg, #00ff88, #00c851);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
}
```

### Accueil - Boutons Actions
```css
.action-buttons {
    display: flex;
    gap: 12px;
    margin: 20px 0;
}

.btn-send-money,
.btn-call {
    flex: 1;
    padding: 16px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 16px;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-send-money {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
}

.btn-call {
    background: linear-gradient(135deg, #00ff88, #00c851);
    color: white;
}
```

### Profil - Upload & Password
```css
.identity-upload-section {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
}

.password-section {
    display: flex;
    align-items: center;
    gap: 12px;
}

.password-input {
    flex: 1;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.toggle-password {
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    cursor: pointer;
}
```

---

## 📦 STRUCTURE FINALE

```
app-om-complete-v3.html (ou app-paris-fc-complete-v3.html)
│
├── SECTION 1: ACCUEIL 🏠
│   ├── Stories bar
│   ├── Posts amis
│   ├── ✨ Bouton "Envoyer argent"
│   └── ✨ Bouton "Appeler"
│
├── SECTION 2: FIDÉLITÉ 💎
│   ├── Carte fidélité
│   ├── Club Coin
│   ├── Badges
│   └── Missions
│
├── SECTION 3: LÉGENDES ⭐
│   └── 11 Ambassadeurs
│
├── SECTION 4: BILLETTERIE 🎟️
│   └── 3 Matchs
│
├── SECTION 5: BOUTIQUE 🛍️
│   └── 6 Produits
│
├── SECTION 6: PAIEMENT 💳
│   ├── Carte PaieCash
│   ├── Solutions Lyf Pay
│   ├── ✨ 6 Partenaires (McDonald's, etc.)
│   ├── Wallet multi-devises
│   └── Contacts P2P
│
└── SECTION 7: PROFIL 👤
    ├── Avatar & Stats
    ├── ✨ Upload photo d'identité
    ├── ✨ Gestion mot de passe
    └── Menu 8 entrées (+ mot de passe)
```

---

## ✅ CHECKLIST AVANT CRÉATION

- [ ] Toutes les 7 sections définies
- [ ] Fonction envoi d'argent (Accueil)
- [ ] Fonction d'appel (Accueil)
- [ ] 6 partenaires de paiement (Paiement)
- [ ] Upload photo identité (Profil)
- [ ] Gestion mot de passe (Profil)
- [ ] Design cohérent et responsive
- [ ] JavaScript fonctionnel
- [ ] Animations et transitions
- [ ] Pas d'écrasement de fichiers existants

---

## 🚀 PRÊT À CRÉER

**Fichiers à créer :**
1. `app-om-complete-v3.html` - OM version complète
2. `app-paris-fc-complete-v3.html` - Paris FC version complète
3. `app-complete-v3.js` - JavaScript partagé
4. `app-complete-v3.css` - Styles partagés

**Durée estimée :** 30-35 minutes

---

**Créé le :** 2025-12-08  
**Statut :** SPÉCIFICATIONS COMPLÈTES  
**Prêt pour :** DÉVELOPPEMENT
