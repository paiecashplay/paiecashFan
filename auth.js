/**
 * SYSTEME D'AUTHENTIFICATION - PaieCashPlay v2.7.0
 * Gestion de l'inscription, connexion, déconnexion et persistance utilisateur
 */

// ==============================================
// 1. VERIFICATION DE LA SESSION AU CHARGEMENT
// ==============================================

function verifierSession() {
    const utilisateurConnecte = localStorage.getItem('utilisateurConnecte');
    
    // Si on est sur la page d'accueil ou une page publique, ne rien faire
    const pagesPubliques = ['DEMARRER_ICI.html', 'inscription.html', 'connexion.html'];
    const pageCourante = window.location.pathname.split('/').pop();
    
    if (pagesPubliques.includes(pageCourante)) {
        return;
    }
    
    // Si pas connecté sur une page protégée, rediriger vers connexion
    if (!utilisateurConnecte) {
        alert('⚠️ Vous devez être connecté pour accéder à l\'application');
        window.location.href = 'connexion.html';
        return;
    }
    
    // Charger les données utilisateur dans l'interface
    const utilisateur = JSON.parse(utilisateurConnecte);
    chargerDonneesUtilisateur(utilisateur);
}

// ==============================================
// 2. CHARGER LES DONNEES UTILISATEUR DANS L'UI
// ==============================================

function chargerDonneesUtilisateur(utilisateur) {
    // Mettre à jour le header
    const userName = document.querySelector('.user-name');
    const userEmail = document.querySelector('.user-email');
    const headerAvatar = document.getElementById('headerAvatar');
    
    if (userName) userName.textContent = utilisateur.nomComplet || `${utilisateur.prenom} ${utilisateur.nom}`;
    if (userEmail) userEmail.textContent = utilisateur.email;
    if (headerAvatar) headerAvatar.src = utilisateur.avatar || 'https://i.pravatar.cc/100?img=33';
    
    // Mettre à jour la section Mon Profil
    const profilNom = document.getElementById('profilNom');
    const profilEmail = document.getElementById('profilEmail');
    const profilTelephone = document.getElementById('profilTelephone');
    const profilDateNaissance = document.getElementById('profilDateNaissance');
    const profilVille = document.getElementById('profilVille');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (profilNom) profilNom.textContent = utilisateur.nomComplet || `${utilisateur.prenom} ${utilisateur.nom}`;
    if (profilEmail) profilEmail.textContent = utilisateur.email;
    if (profilTelephone) profilTelephone.textContent = utilisateur.telephone;
    if (profilDateNaissance && utilisateur.dateNaissance) {
        const date = new Date(utilisateur.dateNaissance);
        profilDateNaissance.textContent = date.toLocaleDateString('fr-FR');
    }
    if (profilVille) profilVille.textContent = utilisateur.ville || 'Non renseignée';
    if (profileAvatar) profileAvatar.src = utilisateur.avatar || 'https://i.pravatar.cc/150?img=33';
    
    // Mettre à jour le solde
    const soldeDisplay = document.querySelector('.card-balance');
    if (soldeDisplay && utilisateur.solde !== undefined) {
        soldeDisplay.textContent = `${utilisateur.solde.toFixed(2)} €`;
    }
    
    // Mettre à jour les points de fidélité
    const pointsDisplay = document.querySelector('.level-points');
    if (pointsDisplay && utilisateur.points !== undefined) {
        pointsDisplay.textContent = `${utilisateur.points} points`;
    }
    
    // Mettre à jour OM Coin
    const omcDisplay = document.querySelector('.omc-balance');
    if (omcDisplay && utilisateur.soldeOMC !== undefined) {
        omcDisplay.textContent = `${utilisateur.soldeOMC.toFixed(2)} OMC`;
    }
    
    console.log('✅ Données utilisateur chargées:', utilisateur.nomComplet);
}

// ==============================================
// 3. FONCTION DE DECONNEXION
// ==============================================

function seDeconnecter() {
    const confirmer = confirm('🔓 Êtes-vous sûr de vouloir vous déconnecter ?');
    
    if (!confirmer) return;
    
    // Supprimer la session
    localStorage.removeItem('utilisateurConnecte');
    localStorage.removeItem('rememberMe');
    
    // Message de confirmation
    alert('👋 Vous êtes déconnecté\n\nÀ bientôt sur PaieCashPlay !');
    
    // Rediriger vers la page de connexion
    window.location.href = 'connexion.html';
}

// ==============================================
// 4. CREER UN UTILISATEUR DE TEST (ETOT Constantin)
// ==============================================

function creerUtilisateurTest() {
    const utilisateurs = JSON.parse(localStorage.getItem('utilisateurs') || '[]');
    
    // Vérifier si ETOT Constantin existe déjà
    const etotExists = utilisateurs.some(u => u.email === 'etot@paiecash.com');
    
    if (!etotExists) {
        const utilisateurTest = {
            id: 'USER_TEST_001',
            prenom: 'Constantin',
            nom: 'ETOT',
            nomComplet: 'ETOT Constantin Nicolas',
            email: 'etot@paiecash.com',
            telephone: '+33 7 67 12 96 52',
            dateNaissance: '1990-05-15',
            ville: 'Marseille',
            reseauxSociaux: {
                facebook: null,
                instagram: '@constantin_om',
                twitter: '@etot_om',
                linkedin: null
            },
            motdepasse: btoa('Marseille13'), // Password: Marseille13
            newsletter: true,
            dateInscription: '2024-01-01T00:00:00.000Z',
            statut: 'fan',
            niveau: 'Platine',
            points: 4250,
            solde: 1247.50,
            soldeOMC: 2450.00,
            soldeEURC: 500.00,
            soldeUSDT: 250.00,
            avatar: 'https://www.genspark.ai/api/files/s/J0EUy7QV',
            codeSecret: '1234'
        };
        
        utilisateurs.push(utilisateurTest);
        localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));
        
        console.log('✅ Utilisateur test ETOT Constantin créé');
        console.log('📧 Email: etot@paiecash.com');
        console.log('🔑 Password: Marseille13');
    }
}

// ==============================================
// 5. METTRE A JOUR LE PROFIL UTILISATEUR
// ==============================================

function mettreAJourProfil(champsMisAJour) {
    const utilisateurConnecte = localStorage.getItem('utilisateurConnecte');
    
    if (!utilisateurConnecte) {
        alert('❌ Vous devez être connecté');
        return false;
    }
    
    const utilisateur = JSON.parse(utilisateurConnecte);
    
    // Mettre à jour les champs
    Object.keys(champsMisAJour).forEach(champ => {
        utilisateur[champ] = champsMisAJour[champ];
    });
    
    // Sauvegarder dans la session
    localStorage.setItem('utilisateurConnecte', JSON.stringify(utilisateur));
    
    // Mettre à jour dans la liste des utilisateurs
    const utilisateurs = JSON.parse(localStorage.getItem('utilisateurs') || '[]');
    const index = utilisateurs.findIndex(u => u.id === utilisateur.id);
    
    if (index !== -1) {
        utilisateurs[index] = utilisateur;
        localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));
    }
    
    // Recharger l'interface
    chargerDonneesUtilisateur(utilisateur);
    
    return true;
}

// ==============================================
// 6. OBTENIR L'UTILISATEUR CONNECTE
// ==============================================

function obtenirUtilisateurConnecte() {
    const utilisateurConnecte = localStorage.getItem('utilisateurConnecte');
    return utilisateurConnecte ? JSON.parse(utilisateurConnecte) : null;
}

// ==============================================
// 7. MODIFIER LA PHOTO DE PROFIL
// ==============================================

function changerPhotoHeader() {
    const utilisateur = obtenirUtilisateurConnecte();
    
    if (!utilisateur) {
        alert('❌ Vous devez être connecté');
        return;
    }
    
    const nouvellePhoto = prompt(
        '📷 Modification de la photo de profil\n\n' +
        '1. Entrez l\'URL de votre photo, OU\n' +
        '2. Laissez vide pour générer un avatar aléatoire',
        utilisateur.avatar
    );
    
    if (nouvellePhoto === null) return; // Annulé
    
    const avatar = nouvellePhoto.trim() || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
    
    // Mettre à jour
    if (mettreAJourProfil({ avatar: avatar })) {
        alert('✅ Photo de profil mise à jour !');
    }
}

// ==============================================
// 8. CHANGER LE CODE SECRET
// ==============================================

function modifierCodeSecret() {
    const utilisateur = obtenirUtilisateurConnecte();
    
    if (!utilisateur) {
        alert('❌ Vous devez être connecté');
        return;
    }
    
    // Vérifier l'ancien code si il existe
    if (utilisateur.codeSecret) {
        const ancienCode = prompt('🔐 Entrez votre code secret actuel (4 chiffres):');
        
        if (!ancienCode) return;
        
        if (ancienCode !== utilisateur.codeSecret) {
            alert('❌ Code secret incorrect');
            return;
        }
    }
    
    // Nouveau code
    const nouveauCode = prompt('🔑 Entrez votre nouveau code secret (4 chiffres):');
    
    if (!nouveauCode) return;
    
    if (!/^\d{4}$/.test(nouveauCode)) {
        alert('❌ Le code doit contenir exactement 4 chiffres');
        return;
    }
    
    // Confirmation
    const confirmation = prompt('✅ Confirmez votre nouveau code secret:');
    
    if (confirmation !== nouveauCode) {
        alert('❌ Les codes ne correspondent pas');
        return;
    }
    
    // Mettre à jour
    if (mettreAJourProfil({ codeSecret: nouveauCode })) {
        alert('✅ Code secret modifié avec succès !');
    }
}

// ==============================================
// 9. INITIALISATION AU CHARGEMENT DE LA PAGE
// ==============================================

// Vérifier la session dès le chargement
document.addEventListener('DOMContentLoaded', function() {
    // Créer l'utilisateur test si nécessaire
    creerUtilisateurTest();
    
    // Vérifier la session utilisateur
    verifierSession();
});

console.log('🔐 Système d\'authentification PaieCashPlay chargé');
