// ========================================
// AUTHENTIFICATION AMÉLIORÉE v2.9.0
// ========================================

console.log('🔐 Chargement authentification améliorée...');

// === MOT DE PASSE OUBLIÉ ===

function afficherMotDePasseOublie() {
    const email = prompt(
        '📧 Réinitialisation du mot de passe\n\n' +
        'Entrez votre adresse email :\n' +
        '(Un code de réinitialisation vous sera envoyé)'
    );
    
    if (!email) return;
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('❌ Email invalide\n\nVeuillez entrer une adresse email valide.');
        return;
    }
    
    // Vérifier si l'email existe
    const utilisateurs = JSON.parse(localStorage.getItem('utilisateurs') || '[]');
    const utilisateur = utilisateurs.find(u => u.email === email);
    
    if (!utilisateur) {
        alert('❌ Email non trouvé\n\nAucun compte n\'existe avec cet email.\n\nVoulez-vous créer un compte ?');
        return;
    }
    
    // Générer un code de réinitialisation
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Sauvegarder le code temporairement
    localStorage.setItem('reset_code_' + email, JSON.stringify({
        code: code,
        email: email,
        expiration: Date.now() + 15 * 60 * 1000 // 15 minutes
    }));
    
    alert(
        '✅ Code de réinitialisation envoyé !\n\n' +
        '📧 Email : ' + email + '\n' +
        '🔑 Code : ' + code + '\n\n' +
        '⏰ Valide pendant 15 minutes\n\n' +
        '(En production, ce code serait envoyé par email)'
    );
    
    // Demander le code
    const codeEntre = prompt(
        '🔑 Entrez le code de réinitialisation\n\n' +
        'Code reçu par email (6 chiffres) :'
    );
    
    if (!codeEntre) return;
    
    // Vérifier le code
    const savedData = JSON.parse(localStorage.getItem('reset_code_' + email));
    
    if (!savedData) {
        alert('❌ Code expiré ou invalide');
        return;
    }
    
    if (Date.now() > savedData.expiration) {
        alert('❌ Code expiré\n\nLe code est valide pendant 15 minutes seulement.');
        localStorage.removeItem('reset_code_' + email);
        return;
    }
    
    if (codeEntre !== savedData.code) {
        alert('❌ Code incorrect\n\nVeuillez vérifier le code reçu.');
        return;
    }
    
    // Demander le nouveau mot de passe
    const nouveauMdp = prompt(
        '🔒 Nouveau mot de passe\n\n' +
        'Entrez votre nouveau mot de passe :\n' +
        '(Minimum 6 caractères)'
    );
    
    if (!nouveauMdp || nouveauMdp.length < 6) {
        alert('❌ Mot de passe trop court\n\nMinimum 6 caractères requis.');
        return;
    }
    
    const confirmation = prompt('🔒 Confirmez le nouveau mot de passe :');
    
    if (nouveauMdp !== confirmation) {
        alert('❌ Les mots de passe ne correspondent pas');
        return;
    }
    
    // Mettre à jour le mot de passe
    const index = utilisateurs.findIndex(u => u.email === email);
    utilisateurs[index].motdepasse = btoa(nouveauMdp); // Encoder en base64 comme à l'inscription
    localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));
    
    // Supprimer le code
    localStorage.removeItem('reset_code_' + email);
    
    alert(
        '✅ Mot de passe changé avec succès !\n\n' +
        'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.'
    );
}

// === CONNEXION GOOGLE ===

function connexionGoogle() {
    alert(
        '🔵 Connexion Google\n\n' +
        '⚠️ SIMULATION (Mode Démo)\n\n' +
        'En production, vous seriez redirigé vers :\n' +
        '• Google OAuth 2.0\n' +
        '• Autorisation sécurisée\n' +
        '• Retour automatique à l\'app\n\n' +
        '📚 Intégration requise :\n' +
        '→ Google Sign-In JavaScript Library\n' +
        '→ https://developers.google.com/identity'
    );
    
    // Simulation : créer un utilisateur Google
    const choix = confirm(
        '🎭 Mode Démo\n\n' +
        'Voulez-vous simuler une connexion Google réussie ?\n\n' +
        '(Un compte de test sera créé)'
    );
    
    if (!choix) return;
    
    const utilisateurGoogle = {
        id: 'google_' + Date.now(),
        nomComplet: 'Utilisateur Google',
        prenom: 'Utilisateur',
        nom: 'Google',
        email: 'google.user@gmail.com',
        telephone: '+33 6 00 00 00 00',
        dateNaissance: '1990-01-01',
        ville: 'Marseille',
        avatar: 'https://i.pravatar.cc/150?img=68',
        motDePasse: 'google_auth_' + Math.random().toString(36),
        solde: 1000.00,
        omcBalance: 1000.00,
        loyaltyPoints: 500,
        authProvider: 'google',
        dateInscription: new Date().toISOString()
    };
    
    // Sauvegarder l'utilisateur
    const utilisateurs = JSON.parse(localStorage.getItem('utilisateurs') || '[]');
    
    // Vérifier si l'utilisateur Google existe déjà
    const existant = utilisateurs.find(u => u.authProvider === 'google');
    
    if (!existant) {
        utilisateurs.push(utilisateurGoogle);
        localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));
    }
    
    // Connecter l'utilisateur
    localStorage.setItem('utilisateurConnecte', JSON.stringify(existant || utilisateurGoogle));
    
    alert('✅ Connexion Google réussie !\n\nRedirection vers l\'application...');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// === CONNEXION FACEBOOK ===

function connexionFacebook() {
    alert(
        '🔵 Connexion Facebook\n\n' +
        '⚠️ SIMULATION (Mode Démo)\n\n' +
        'En production, vous seriez redirigé vers :\n' +
        '• Facebook Login\n' +
        '• Autorisation sécurisée\n' +
        '• Retour automatique à l\'app\n\n' +
        '📚 Intégration requise :\n' +
        '→ Facebook JavaScript SDK\n' +
        '→ https://developers.facebook.com/docs/facebook-login'
    );
    
    const choix = confirm(
        '🎭 Mode Démo\n\n' +
        'Voulez-vous simuler une connexion Facebook réussie ?\n\n' +
        '(Un compte de test sera créé)'
    );
    
    if (!choix) return;
    
    const utilisateurFacebook = {
        id: 'facebook_' + Date.now(),
        nomComplet: 'Utilisateur Facebook',
        prenom: 'Utilisateur',
        nom: 'Facebook',
        email: 'facebook.user@fb.com',
        telephone: '+33 6 11 11 11 11',
        dateNaissance: '1990-01-01',
        ville: 'Marseille',
        avatar: 'https://i.pravatar.cc/150?img=12',
        motDePasse: 'facebook_auth_' + Math.random().toString(36),
        solde: 1000.00,
        omcBalance: 1000.00,
        loyaltyPoints: 500,
        authProvider: 'facebook',
        dateInscription: new Date().toISOString()
    };
    
    const utilisateurs = JSON.parse(localStorage.getItem('utilisateurs') || '[]');
    const existant = utilisateurs.find(u => u.authProvider === 'facebook');
    
    if (!existant) {
        utilisateurs.push(utilisateurFacebook);
        localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));
    }
    
    localStorage.setItem('utilisateurConnecte', JSON.stringify(existant || utilisateurFacebook));
    
    alert('✅ Connexion Facebook réussie !\n\nRedirection vers l\'application...');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// === CONNEXION APPLE ===

function connexionApple() {
    alert(
        '🍎 Connexion Apple\n\n' +
        '⚠️ SIMULATION (Mode Démo)\n\n' +
        'En production, vous seriez redirigé vers :\n' +
        '• Sign in with Apple\n' +
        '• Autorisation sécurisée\n' +
        '• Retour automatique à l\'app\n\n' +
        '📚 Intégration requise :\n' +
        '→ Sign in with Apple JS\n' +
        '→ https://developer.apple.com/sign-in-with-apple'
    );
    
    const choix = confirm(
        '🎭 Mode Démo\n\n' +
        'Voulez-vous simuler une connexion Apple réussie ?\n\n' +
        '(Un compte de test sera créé)'
    );
    
    if (!choix) return;
    
    const utilisateurApple = {
        id: 'apple_' + Date.now(),
        nomComplet: 'Utilisateur Apple',
        prenom: 'Utilisateur',
        nom: 'Apple',
        email: 'apple.user@icloud.com',
        telephone: '+33 6 22 22 22 22',
        dateNaissance: '1990-01-01',
        ville: 'Marseille',
        avatar: 'https://i.pravatar.cc/150?img=25',
        motDePasse: 'apple_auth_' + Math.random().toString(36),
        solde: 1000.00,
        omcBalance: 1000.00,
        loyaltyPoints: 500,
        authProvider: 'apple',
        dateInscription: new Date().toISOString()
    };
    
    const utilisateurs = JSON.parse(localStorage.getItem('utilisateurs') || '[]');
    const existant = utilisateurs.find(u => u.authProvider === 'apple');
    
    if (!existant) {
        utilisateurs.push(utilisateurApple);
        localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));
    }
    
    localStorage.setItem('utilisateurConnecte', JSON.stringify(existant || utilisateurApple));
    
    alert('✅ Connexion Apple réussie !\n\nRedirection vers l\'application...');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Exposer les fonctions globalement
window.afficherMotDePasseOublie = afficherMotDePasseOublie;
window.connexionGoogle = connexionGoogle;
window.connexionFacebook = connexionFacebook;
window.connexionApple = connexionApple;

console.log('✅ Authentification améliorée chargée (v2.9.0)');
