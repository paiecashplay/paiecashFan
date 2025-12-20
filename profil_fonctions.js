// === FONCTIONS PROFIL v2.4.4 ===

// Code secret utilisateur
let userCodeSecret = null;

// Statut actuel
let userStatut = 'fan';

// === PROFIL ===

function changerPhoto() {
    alert('📷 Fonctionnalité Changer la Photo\n\nOuvrir la galerie photo ou prendre une nouvelle photo');
}

// Fonction pour changer la photo depuis le header
function changerPhotoHeader() {
    const photoOptions = [
        'https://www.genspark.ai/api/files/s/J0EUy7QV',
        'https://i.pravatar.cc/100?img=33',
        'https://i.pravatar.cc/100?img=12',
        'https://i.pravatar.cc/100?img=68',
        'https://i.pravatar.cc/100?img=15'
    ];
    
    const choice = prompt('📷 Changer votre photo de profil\n\n1. Photo actuelle (ETOT Constantin)\n2. Avatar masculin 1\n3. Avatar masculin 2\n4. Avatar masculin 3\n5. Avatar masculin 4\n\nEntrez 1, 2, 3, 4 ou 5 :');
    
    if (choice && choice >= '1' && choice <= '5') {
        const newPhoto = photoOptions[parseInt(choice) - 1];
        
        // Mettre à jour la photo dans le header
        const headerAvatar = document.getElementById('headerAvatar');
        if (headerAvatar) {
            headerAvatar.src = newPhoto;
        }
        
        // Mettre à jour la photo dans le profil
        const profilePhoto = document.querySelector('.profile-photo');
        if (profilePhoto) {
            profilePhoto.src = newPhoto;
        }
        
        alert('✅ Photo mise à jour avec succès !');
    }
}

function changerStatut(statut) {
    userStatut = statut;
    const licencieDetails = document.getElementById('licencieDetails');
    
    if (statut === 'licencie') {
        licencieDetails.style.display = 'block';
    } else {
        licencieDetails.style.display = 'none';
    }
}

function enregistrerLicence() {
    const numero = document.getElementById('numeroLicence').value;
    const date = document.getElementById('dateAdhesion').value;
    
    if (!numero || !date) {
        alert('❌ Veuillez remplir tous les champs');
        return;
    }
    
    alert(`✅ Informations Licencié PFC enregistrées !\n\n🏟️ Numéro : ${numero}\n📅 Date d'adhésion : ${date}`);
}

// === CODE SECRET ===

function modifierCodeSecret() {
    const modal = document.getElementById('codeSecretModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeCodeSecret() {
    const modal = document.getElementById('codeSecretModal');
    if (modal) {
        modal.style.display = 'none';
    }
    document.getElementById('newCode').value = '';
    document.getElementById('confirmCode').value = '';
}

function enregistrerCodeSecret() {
    const newCode = document.getElementById('newCode').value;
    const confirmCode = document.getElementById('confirmCode').value;
    
    if (!newCode || !confirmCode) {
        alert('❌ Veuillez remplir tous les champs');
        return;
    }
    
    if (newCode.length !== 4 || confirmCode.length !== 4) {
        alert('❌ Le code doit contenir exactement 4 chiffres');
        return;
    }
    
    if (!/^\d{4}$/.test(newCode)) {
        alert('❌ Le code doit contenir uniquement des chiffres');
        return;
    }
    
    if (newCode !== confirmCode) {
        alert('❌ Les codes ne correspondent pas');
        return;
    }
    
    userCodeSecret = newCode;
    alert('✅ Code secret enregistré avec succès !\n\n🔒 Votre code sera demandé pour tous les paiements supérieurs à 30€');
    closeCodeSecret();
}

function verifierCodeSecret(montant) {
    if (montant <= 30) {
        return true; // Pas besoin de code pour <= 30€
    }
    
    if (!userCodeSecret) {
        alert('⚠️ Vous devez d\'abord créer un code secret dans votre profil');
        return false;
    }
    
    const code = prompt('🔒 Paiement supérieur à 30€\n\nEntrez votre code secret à 4 chiffres :');
    
    if (!code) {
        return false;
    }
    
    if (code !== userCodeSecret) {
        alert('❌ Code incorrect');
        return false;
    }
    
    return true;
}

// === AJOUTER AMI ===

function ajouterAmi() {
    const modal = document.getElementById('addFriendModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeAddFriend() {
    const modal = document.getElementById('addFriendModal');
    if (modal) {
        modal.style.display = 'none';
    }
    document.getElementById('friendEmail').value = '';
    document.getElementById('friendPhone').value = '';
}

function ajouterParQR() {
    alert('📱 Scanner QR Code\n\nOuvrir la caméra pour scanner le QR Code de votre ami\n\n✅ Une fois scanné, la demande d\'ajout sera envoyée');
}

function ajouterParContact() {
    const email = document.getElementById('friendEmail').value.trim();
    const phone = document.getElementById('friendPhone').value.trim();
    
    if (!email && !phone) {
        alert('❌ Veuillez entrer au moins un email ou un numéro de téléphone');
        return;
    }
    
    // Vérifier si la base de données d'amis existe
    if (typeof window.amisDatabase === 'undefined' || typeof chargerTousLesUtilisateurs === 'undefined') {
        alert('❌ Système d\'amis non chargé\n\nVeuillez recharger la page (F5)');
        return;
    }
    
    // Recharger la base de données pour avoir les derniers inscrits
    window.amisDatabase = chargerTousLesUtilisateurs();
    
    // Rechercher l'ami dans la base de données
    const amiTrouve = window.amisDatabase.find(ami => 
        (email && ami.email.toLowerCase() === email.toLowerCase()) ||
        (phone && ami.telephone === phone)
    );
    
    if (!amiTrouve) {
        // Afficher la liste des utilisateurs disponibles
        const listeUtilisateurs = window.amisDatabase.length > 0 
            ? window.amisDatabase.map(u => `• ${u.email}`).join('\n')
            : '(Aucun autre utilisateur inscrit pour le moment)';
        
        alert('❌ Aucun utilisateur trouvé\n\n' +
              'Vérifiez l\'email ou le téléphone.\n\n' +
              `Utilisateurs inscrits disponibles (${window.amisDatabase.length}) :\n` +
              listeUtilisateurs + '\n\n' +
              '💡 Astuce : Demandez à votre ami de s\'inscrire sur inscription.html');
        return;
    }
    
    // Vérifier si déjà ami
    const utilisateur = obtenirUtilisateurConnecte() || { id: 'USER_TEST_001' };
    let mesAmisIds = JSON.parse(localStorage.getItem('mesAmis_' + utilisateur.id) || '[]');
    
    if (mesAmisIds.includes(amiTrouve.id)) {
        alert('ℹ️ ' + amiTrouve.nom + ' est déjà dans vos amis !');
        closeAddFriend();
        return;
    }
    
    // Ajouter l'ami
    mesAmisIds.push(amiTrouve.id);
    localStorage.setItem('mesAmis_' + utilisateur.id, JSON.stringify(mesAmisIds));
    
    alert('✅ Ami ajouté avec succès !\n\n' +
          '👤 ' + amiTrouve.nom + '\n' +
          '📧 ' + amiTrouve.email + '\n\n' +
          'Vous pouvez maintenant :\n' +
          '• Lui envoyer de l\'argent\n' +
          '• Lui transférer des OM Coins\n' +
          '• Voir son profil');
    
    closeAddFriend();
    
    // Rafraîchir l'affichage des amis
    if (typeof afficherMesAmis === 'function') {
        afficherMesAmis();
    }
}

// === RETRAIT INSTANTANÉ ===

function retirerVersCarte() {
    const montant = prompt('📥 Retrait instantané vers votre carte bancaire\n\nMontant à retirer depuis votre wallet (en €) :');
    if (!montant || isNaN(montant) || montant <= 0) return;
    
    const montantNum = parseFloat(montant);
    
    // Vérifier code secret si >30€
    if (!verifierCodeSecret(montantNum)) {
        return;
    }
    
    alert(`✅ Retrait effectué par PaieCash\n\n📥 ${montant}€ transférés vers votre carte bancaire\n⚡ INSTANTANÉ - Disponible immédiatement\n\n📧 Confirmation envoyée par email`);
    
    ajouterTransaction({
        type: 'Retrait',
        description: 'Retrait instantané vers carte',
        montant: -parseFloat(montant),
        devise: 'EUR',
        statut: 'Complété'
    });
}

function rechargerWallet() {
    const montant = prompt('📤 Recharger votre Wallet\n\nMontant à recharger depuis votre carte bancaire (en €) :');
    if (!montant || isNaN(montant) || montant <= 0) return;
    
    const montantNum = parseFloat(montant);
    
    // Vérifier code secret si >30€
    if (!verifierCodeSecret(montantNum)) {
        return;
    }
    
    alert(`✅ Rechargement effectué par PaieCash\n\n📤 ${montant}€ ajoutés à votre wallet\n💳 Débité de votre carte bancaire\n⚡ INSTANTANÉ\n\n📊 Nouveau solde disponible`);
    
    ajouterTransaction({
        type: 'Recharge',
        description: 'Recharge depuis carte bancaire',
        montant: parseFloat(montant),
        devise: 'EUR',
        statut: 'Complété'
    });
}

// === NOTIFICATIONS ENRICHIES ===

function ouvrirNotificationAvecLien(notifId) {
    const notif = notifications.find(n => n.id === notifId);
    if (!notif) return;
    
    // Marquer comme lue
    notif.read = true;
    renderNotifications();
    updateNotificationBadge();
    
    // Si la notification a un lien, l'ouvrir
    if (notif.lien) {
        if (confirm(`${notif.title}\n\n${notif.message}\n\n🔗 Voulez-vous ouvrir le lien pour plus d'informations ?`)) {
            window.open(notif.lien, '_blank');
        }
    }
}

// Mettre à jour les notifications avec des liens et géolocalisation
const notificationsEnrichies = [
    {
        id: 1,
        type: 'match',
        title: '⚽ OM 2-1 PSG - Victoire !',
        message: 'L\'OM remporte le Classico ! Revivez les meilleurs moments',
        time: 'Il y a 1h',
        read: false,
        lien: 'https://www.om.fr/actualites/match-report'
    },
    {
        id: 2,
        type: 'promo',
        title: '🍕 -30% Pizza Nearby',
        message: 'Restaurant La Bella à 200m - Code: OM2024',
        time: 'Il y a 30min',
        read: false,
        lien: 'https://maps.google.com',
        geolocalise: true
    },
    {
        id: 3,
        type: 'promo',
        title: '🛒 -20% E-commerce Partenaire',
        message: 'Boutique Sport Direct - Livraison gratuite',
        time: 'Il y a 2h',
        read: false,
        lien: 'https://example.com/promo'
    },
    {
        id: 4,
        type: 'cashback',
        title: '💰 +15€ Cashback reçu',
        message: 'Votre cashback du mois est arrivé !',
        time: 'Il y a 1j',
        read: true
    },
    {
        id: 5,
        type: 'match',
        title: '🎫 Prochain match : OM-Monaco',
        message: 'Samedi 15h - Places encore disponibles',
        time: 'Il y a 2j',
        read: true,
        lien: 'https://www.om.fr/billetterie'
    }
];

// === BNPL (Buy Now Pay Later) ===

function activerBNPLPaiement(item) {
    const prix = item.price || item.montant || 0;
    
    if (prix < 50) {
        alert('❌ BNPL disponible uniquement pour les achats de 50€ et plus');
        return;
    }
    
    const mensualites = Math.ceil(prix / 4); // 4 fois sans frais
    
    const confirm = window.confirm(`💳 Paiement en plusieurs fois (BNPL)\n\n🛍️ ${item.name || item.description}\n💰 Total : ${prix}€\n\n📅 4 mensualités de ${mensualites.toFixed(2)}€\n✅ Sans frais\n\nConfirmer ?`);
    
    if (confirm) {
        alert(`✅ Paiement BNPL activé !\n\n📅 Calendrier de paiement :\n• Aujourd'hui : ${mensualites.toFixed(2)}€\n• Dans 1 mois : ${mensualites.toFixed(2)}€\n• Dans 2 mois : ${mensualites.toFixed(2)}€\n• Dans 3 mois : ${mensualites.toFixed(2)}€\n\n✅ Aucun frais supplémentaire\n📧 Confirmation envoyée par email`);
        
        ajouterTransaction({
            type: 'BNPL',
            description: `${item.name || item.description} (1/4)`,
            montant: -mensualites,
            devise: 'EUR',
            statut: 'Complété'
        });
    }
}

// Modifier les fonctions d'achat pour inclure BNPL

function addToCartAvecBNPL(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const choix = prompt(`🛍️ ${product.name}\n💰 ${product.price}€\n\nChoisissez votre mode de paiement :\n\n1. Payer maintenant\n2. Payer en 4 fois (BNPL)\n\nTapez 1 ou 2 :`);
    
    if (choix === '1') {
        addToCart(productId);
    } else if (choix === '2') {
        activerBNPLPaiement(product);
    }
}

// === RENDER PROFIL ===

function renderProfilTransactions() {
    const container = document.getElementById('profileTransactionsHistory');
    if (!container) return;
    
    if (transactionsHistory.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Aucune transaction pour le moment</p>';
        return;
    }
    
    // Afficher toutes les transactions
    container.innerHTML = transactionsHistory.map(tx => `
        <div class="transaction-item">
            <div class="transaction-icon">${getTransactionIcon(tx.type)}</div>
            <div class="transaction-info">
                <h4>${tx.description}</h4>
                <span class="transaction-date">${tx.date}</span>
            </div>
            <div class="transaction-amount ${tx.montant > 0 ? 'positive' : 'negative'}">
                ${tx.montant > 0 ? '+' : ''}${tx.montant} ${tx.devise}
            </div>
            <div class="transaction-status status-${tx.statut.toLowerCase().replace(' ', '_')}">${tx.statut}</div>
        </div>
    `).join('');
}

// Initialiser le rendu du profil
function initProfil() {
    renderProfilTransactions();
}

// Ajouter à l'initialisation
if (typeof initApp !== 'undefined') {
    const originalInitApp = initApp;
    initApp = function() {
        originalInitApp();
        initProfil();
    };
}
