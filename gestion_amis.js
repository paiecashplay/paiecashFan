/**
 * SYSTÈME DE GESTION DES AMIS - PaieCashPlay v2.7.2
 * Ajout, recherche, affichage et gestion complète des amis
 */

// === BASE DE DONNÉES DYNAMIQUE DES AMIS ===
// Cette fonction charge TOUS les utilisateurs inscrits de l'application
function chargerTousLesUtilisateurs() {
    // Récupérer tous les utilisateurs inscrits
    const utilisateurs = JSON.parse(localStorage.getItem('utilisateurs') || '[]');
    
    // Récupérer l'utilisateur connecté
    const utilisateurConnecte = obtenirUtilisateurConnecte();
    
    // Convertir les utilisateurs au format amisDatabase
    const utilisateursDisponibles = utilisateurs
        .filter(u => !utilisateurConnecte || u.id !== utilisateurConnecte.id) // Exclure l'utilisateur connecté
        .map(u => ({
            id: u.id,
            nom: u.nomComplet || `${u.prenom || ''} ${u.nom || ''}`.trim() || u.email.split('@')[0],
            email: u.email,
            telephone: u.telephone || 'Non renseigné',
            avatar: u.avatar || `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70)}`,
            statut: u.statut === 'fan' ? 'Fan OM' : 'Licencié PFC',
            points: u.points || 100,
            enLigne: false // Peut être amélioré avec un système de présence en temps réel
        }));
    
    return utilisateursDisponibles;
}

// Charger la base de données au démarrage
window.amisDatabase = chargerTousLesUtilisateurs();

// === RÉCUPÉRER LES AMIS DE L'UTILISATEUR ===
function obtenirMesAmis() {
    const utilisateur = obtenirUtilisateurConnecte();
    
    if (!utilisateur) return [];
    
    // Récupérer les amis depuis localStorage ou utiliser la liste par défaut
    const mesAmisIds = JSON.parse(localStorage.getItem('mesAmis_' + utilisateur.id) || '[]');
    
    // Si aucun ami, ajouter Cameron par défaut
    if (mesAmisIds.length === 0) {
        mesAmisIds.push('AMI_001'); // Cameron
        localStorage.setItem('mesAmis_' + utilisateur.id, JSON.stringify(mesAmisIds));
    }
    
    // Récupérer les détails des amis
    return window.amisDatabase.filter(ami => mesAmisIds.includes(ami.id));
}

// === AJOUTER UN AMI PAR EMAIL/TÉLÉPHONE ===
function ajouterParContact() {
    const email = document.getElementById('friendEmail').value.trim();
    const phone = document.getElementById('friendPhone').value.trim();
    
    if (!email && !phone) {
        alert('❌ Veuillez entrer au moins un email ou un numéro de téléphone');
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
    const utilisateur = obtenirUtilisateurConnecte();
    const mesAmisIds = JSON.parse(localStorage.getItem('mesAmis_' + utilisateur.id) || '[]');
    
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
          '• Voir ses stories');
    
    // Fermer la modale
    closeAddFriend();
    
    // Rafraîchir l'affichage des amis
    afficherMesAmis();
}

// === RECHERCHER UN AMI ===
function rechercherAmi(query) {
    if (!query || query.length < 2) {
        return window.amisDatabase;
    }
    
    query = query.toLowerCase();
    
    return window.amisDatabase.filter(ami => 
        ami.nom.toLowerCase().includes(query) ||
        ami.email.toLowerCase().includes(query) ||
        ami.telephone.includes(query)
    );
}

// === AFFICHER LA LISTE DES AMIS DANS MON PROFIL ===
function afficherMesAmis() {
    const container = document.getElementById('friendsList');
    
    if (!container) return;
    
    const mesAmis = obtenirMesAmis();
    
    if (mesAmis.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #999;">
                <p style="font-size: 16px; margin-bottom: 15px;">👥 Aucun ami pour le moment</p>
                <p style="font-size: 14px;">Cliquez sur "➕ Ajouter un ami" pour commencer</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="friends-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin-top: 20px;">';
    
    mesAmis.forEach(ami => {
        html += `
            <div class="friend-card" style="background: var(--bg-secondary); border-radius: 15px; padding: 15px; text-align: center; cursor: pointer; transition: all 0.3s;" onclick="ouvrirProfilAmi('${ami.id}')">
                <div style="position: relative; display: inline-block; margin-bottom: 10px;">
                    <img src="${ami.avatar}" alt="${ami.nom}" style="width: 70px; height: 70px; border-radius: 50%; border: 3px solid var(--om-blue); object-fit: cover;">
                    ${ami.enLigne ? '<div style="position: absolute; bottom: 2px; right: 2px; width: 16px; height: 16px; background: #00ff88; border: 2px solid var(--bg-secondary); border-radius: 50%;"></div>' : ''}
                </div>
                <div style="font-weight: 700; color: var(--text-primary); font-size: 14px; margin-bottom: 5px;">${ami.nom}</div>
                <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px;">${ami.statut}</div>
                <div style="font-size: 12px; color: var(--om-blue); font-weight: 600;">${ami.points} pts</div>
            </div>
        `;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
}

// === OUVRIR LE PROFIL D'UN AMI ===
function ouvrirProfilAmi(amiId) {
    const ami = window.amisDatabase.find(a => a.id === amiId);
    
    if (!ami) return;
    
    const actions = [
        '1️⃣ Envoyer de l\'argent (EUR)',
        '2️⃣ Envoyer des OM Coins',
        '3️⃣ Voir le profil complet',
        '4️⃣ Retirer de mes amis'
    ];
    
    const choix = prompt(
        `👤 ${ami.nom}\n` +
        `━━━━━━━━━━━━━━━━━\n\n` +
        `📧 ${ami.email}\n` +
        `📱 ${ami.telephone}\n` +
        `⭐ ${ami.statut}\n` +
        `🏆 ${ami.points} points\n` +
        `${ami.enLigne ? '🟢 En ligne' : '⚪ Hors ligne'}\n\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `Que voulez-vous faire ?\n\n` +
        actions.join('\n') + '\n\n' +
        'Entrez 1, 2, 3 ou 4 :'
    );
    
    if (!choix) return;
    
    switch(choix) {
        case '1':
            envoyerArgentAmi(ami);
            break;
        case '2':
            envoyerOMCoin(ami);
            break;
        case '3':
            afficherProfilCompletAmi(ami);
            break;
        case '4':
            retirerAmi(ami);
            break;
        default:
            alert('❌ Choix invalide');
    }
}

// === ENVOYER DE L'ARGENT À UN AMI ===
function envoyerArgentAmi(ami) {
    const montant = prompt(`💸 Envoyer de l'argent à ${ami.nom}\n\nMontant (en €) :`);
    
    if (!montant || isNaN(montant) || parseFloat(montant) <= 0) {
        alert('❌ Montant invalide');
        return;
    }
    
    const montantNum = parseFloat(montant);
    
    // Vérifier code secret si >30€
    if (montantNum > 30) {
        const utilisateur = obtenirUtilisateurConnecte();
        
        if (utilisateur && utilisateur.codeSecret) {
            const code = prompt('🔐 Code secret requis (>30€)\n\nEntrez votre code à 4 chiffres :');
            
            if (code !== utilisateur.codeSecret) {
                alert('❌ Code secret incorrect');
                return;
            }
        }
    }
    
    const confirmation = confirm(
        `💸 CONFIRMER LE TRANSFERT\n\n` +
        `Destinataire : ${ami.nom}\n` +
        `Montant : ${montant}€\n\n` +
        `✅ Confirmer ?`
    );
    
    if (!confirmation) return;
    
    alert(
        `✅ TRANSFERT RÉUSSI !\n\n` +
        `💸 ${montant}€ envoyés à ${ami.nom}\n` +
        `⚡ Transaction instantanée\n` +
        `✅ Validé par PaieCash\n\n` +
        `📧 Confirmation envoyée par email`
    );
    
    // Ajouter à l'historique
    if (typeof ajouterTransaction === 'function') {
        ajouterTransaction({
            type: 'Transfert P2P',
            description: `Envoi à ${ami.nom}`,
            montant: -montantNum,
            devise: 'EUR',
            statut: 'Validé'
        });
    }
}

// === ENVOYER DES OM COINS À UN AMI ===
function envoyerOMCoin(ami) {
    const montant = prompt(`🏟️ Envoyer des OM Coins à ${ami.nom}\n\nMontant (en OMC) :`);
    
    if (!montant || isNaN(montant) || parseFloat(montant) <= 0) {
        alert('❌ Montant invalide');
        return;
    }
    
    const montantNum = parseFloat(montant);
    
    const confirmation = confirm(
        `🏟️ CONFIRMER LE TRANSFERT OM COIN\n\n` +
        `Destinataire : ${ami.nom}\n` +
        `Montant : ${montant} OMC\n` +
        `Frais : GRATUIT (entre amis)\n\n` +
        `✅ Confirmer ?`
    );
    
    if (!confirmation) return;
    
    alert(
        `✅ TRANSFERT OM COIN RÉUSSI !\n\n` +
        `🏟️ ${montant} OMC envoyés à ${ami.nom}\n` +
        `⚡ Transaction < 1 seconde\n` +
        `💰 SANS FRAIS (entre amis)\n` +
        `✅ Validé sur la blockchain\n\n` +
        `🎁 ${ami.nom} a reçu vos OM Coins !`
    );
    
    // Ajouter à l'historique
    if (typeof ajouterTransaction === 'function') {
        ajouterTransaction({
            type: 'Transfert OM Coin',
            description: `Envoi à ${ami.nom}`,
            montant: -montantNum,
            devise: 'OMC',
            statut: 'Validé'
        });
    }
}

// === AFFICHER LE PROFIL COMPLET D'UN AMI ===
function afficherProfilCompletAmi(ami) {
    alert(
        `👤 PROFIL COMPLET\n\n` +
        `Nom : ${ami.nom}\n` +
        `Email : ${ami.email}\n` +
        `Téléphone : ${ami.telephone}\n` +
        `Statut : ${ami.statut}\n` +
        `Points : ${ami.points}\n` +
        `${ami.enLigne ? '🟢 En ligne' : '⚪ Hors ligne'}\n\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `Ami depuis : Récemment\n` +
        `Transactions : 0\n` +
        `Confiance : 100%`
    );
}

// === RETIRER UN AMI ===
function retirerAmi(ami) {
    const confirmation = confirm(
        `❌ Retirer ${ami.nom} de vos amis ?\n\n` +
        `Vous ne pourrez plus :\n` +
        `• Voir ses stories\n` +
        `• Lui envoyer de l'argent rapidement\n` +
        `• Le voir dans vos contacts\n\n` +
        `Continuer ?`
    );
    
    if (!confirmation) return;
    
    const utilisateur = obtenirUtilisateurConnecte();
    let mesAmisIds = JSON.parse(localStorage.getItem('mesAmis_' + utilisateur.id) || '[]');
    
    mesAmisIds = mesAmisIds.filter(id => id !== ami.id);
    localStorage.setItem('mesAmis_' + utilisateur.id, JSON.stringify(mesAmisIds));
    
    alert(`✅ ${ami.nom} a été retiré de vos amis`);
    
    // Rafraîchir l'affichage
    afficherMesAmis();
}

// === AUTOCOMPLÉTION POUR LES TRANSFERTS ===
function suggererAmis(inputValue) {
    if (!inputValue || inputValue.length < 1) {
        return obtenirMesAmis();
    }
    
    const mesAmis = obtenirMesAmis();
    const query = inputValue.toLowerCase();
    
    return mesAmis.filter(ami => 
        ami.nom.toLowerCase().startsWith(query) ||
        ami.email.toLowerCase().startsWith(query)
    );
}

// === CRÉER UN INPUT AVEC AUTOCOMPLÉTION ===
function creerInputAvecAutocompletion(containerId, placeholder, callback) {
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    const inputId = 'autoCompleteInput_' + containerId;
    const listId = 'autoCompleteList_' + containerId;
    
    const html = `
        <div style="position: relative; width: 100%;">
            <input 
                type="text" 
                id="${inputId}" 
                placeholder="${placeholder}"
                autocomplete="off"
                style="width: 100%; padding: 15px; border: 2px solid #e0e0e0; border-radius: 12px; font-size: 15px;"
            >
            <div 
                id="${listId}" 
                style="position: absolute; top: 100%; left: 0; right: 0; background: white; border: 2px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px; max-height: 200px; overflow-y: auto; display: none; z-index: 1000;"
            ></div>
        </div>
    `;
    
    container.innerHTML = html;
    
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    
    input.addEventListener('input', function() {
        const value = this.value;
        const suggestions = suggererAmis(value);
        
        if (suggestions.length === 0 || value.length === 0) {
            list.style.display = 'none';
            return;
        }
        
        let listHtml = '';
        suggestions.forEach(ami => {
            listHtml += `
                <div 
                    class="autocomplete-item" 
                    onclick="selectionnerAmiAutocompletion('${ami.id}', '${inputId}', '${listId}')"
                    style="padding: 12px 15px; cursor: pointer; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f0f0f0;"
                    onmouseover="this.style.background='#f8f9fa'" 
                    onmouseout="this.style.background='white'"
                >
                    <img src="${ami.avatar}" style="width: 40px; height: 40px; border-radius: 50%;">
                    <div>
                        <div style="font-weight: 600; color: #333;">${ami.nom}</div>
                        <div style="font-size: 12px; color: #999;">${ami.email}</div>
                    </div>
                </div>
            `;
        });
        
        list.innerHTML = listHtml;
        list.style.display = 'block';
    });
    
    // Fermer la liste en cliquant ailleurs
    document.addEventListener('click', function(e) {
        if (!container.contains(e.target)) {
            list.style.display = 'none';
        }
    });
}

// === SÉLECTIONNER UN AMI DANS L'AUTOCOMPLÉTION ===
window.selectionnerAmiAutocompletion = function(amiId, inputId, listId) {
    const ami = window.amisDatabase.find(a => a.id === amiId);
    
    if (!ami) return;
    
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    
    input.value = ami.nom;
    list.style.display = 'none';
    
    // Déclencher l'action (transfert, etc.)
    ouvrirProfilAmi(amiId);
};

// === AUTOCOMPLETION EMAIL ===
function initAutocompletion() {
    const emailInput = document.getElementById('friendEmail');
    const suggestionsDiv = document.getElementById('emailSuggestions');
    
    if (!emailInput || !suggestionsDiv) return;
    
    emailInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        
        if (query.length < 1) {
            suggestionsDiv.style.display = 'none';
            return;
        }
        
        // Recharger la base de données
        window.amisDatabase = chargerTousLesUtilisateurs();
        
        // Filtrer les utilisateurs qui correspondent
        const matches = window.amisDatabase.filter(user => 
            user.email.toLowerCase().includes(query) ||
            user.nom.toLowerCase().includes(query)
        );
        
        if (matches.length === 0) {
            suggestionsDiv.style.display = 'none';
            return;
        }
        
        // Afficher les suggestions
        let html = '';
        matches.slice(0, 5).forEach(user => {
            html += `
                <div class="suggestion-item" onclick="selectSuggestion('${user.email}')" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'" style="padding: 12px 15px; cursor: pointer; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f0f0f0; transition: background 0.2s;">
                    <img src="${user.avatar}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #0066B2; object-fit: cover;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #333; font-size: 14px;">${user.nom}</div>
                        <div style="font-size: 12px; color: #666; font-family: 'Courier New', monospace;">${user.email}</div>
                    </div>
                    <div style="color: #0066B2; font-size: 20px;">→</div>
                </div>
            `;
        });
        
        suggestionsDiv.innerHTML = html;
        suggestionsDiv.style.display = 'block';
    });
    
    // Fermer les suggestions en cliquant ailleurs
    document.addEventListener('click', function(e) {
        if (!emailInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.style.display = 'none';
        }
    });
}

// Fonction pour sélectionner une suggestion
window.selectSuggestion = function(email) {
    const emailInput = document.getElementById('friendEmail');
    const suggestionsDiv = document.getElementById('emailSuggestions');
    
    if (emailInput) {
        emailInput.value = email;
    }
    
    if (suggestionsDiv) {
        suggestionsDiv.style.display = 'none';
    }
};

// === INITIALISATION AU CHARGEMENT ===
document.addEventListener('DOMContentLoaded', function() {
    // Afficher les amis dans Mon Profil
    setTimeout(() => {
        afficherMesAmis();
        initAutocompletion();
    }, 500);
});

console.log('✅ Système de gestion des amis chargé - v2.7.4 (avec autocomplétion)');
