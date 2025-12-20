// === NOUVELLES FONCTIONS À AJOUTER DANS script.js ===

// === TRANSACTIONS & RÉSERVATIONS ===

function renderTransactions() {
    const container = document.getElementById('transactionsHistory');
    if (!container) return;
    
    if (transactionsHistory.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Aucune transaction pour le moment</p>';
        return;
    }
    
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
            <div class="transaction-status status-${tx.statut.toLowerCase()}">${tx.statut}</div>
        </div>
    `).join('');
}

function getTransactionIcon(type) {
    const icons = {
        'NFT Légende': '🎨',
        'NFT': '🖼️',
        'Billet': '🎫',
        'Produit': '🛍️',
        'Don': '💝',
        'Recharge': '📤',
        'Retrait': '📥',
        'Transfert': '💸',
        'Achat Coin': '💰',
        'Échange': '🔄'
    };
    return icons[type] || '💳';
}

function ajouterTransaction(transaction) {
    const now = new Date();
    const tx = {
        ...transaction,
        id: Date.now(),
        date: now.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    transactionsHistory.unshift(tx);
    renderTransactions();
    
    // Mettre à jour aussi le profil
    if (typeof renderProfilTransactions === 'function') {
        renderProfilTransactions();
    }
}

function renderReservations() {
    const container = document.getElementById('reservationsList');
    if (!container) return;
    
    if (reservations.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Aucune réservation pour le moment</p>';
        return;
    }
    
    container.innerHTML = reservations.map(res => `
        <div class="reservation-card">
            <div class="reservation-header">
                <h4>🎫 ${res.match}</h4>
                <span class="badge-ligue">Ligue 1</span>
            </div>
            <div class="reservation-details">
                <div class="detail-item">
                    <span class="label">📅 Date :</span>
                    <span class="value">${res.date}</span>
                </div>
                <div class="detail-item">
                    <span class="label">🕐 Heure :</span>
                    <span class="value">${res.heure}</span>
                </div>
                <div class="detail-item">
                    <span class="label">📍 Section :</span>
                    <span class="value">${res.section}</span>
                </div>
                <div class="detail-item">
                    <span class="label">💺 Siège :</span>
                    <span class="value">${res.siege}</span>
                </div>
                <div class="detail-item">
                    <span class="label">🆔 Référence :</span>
                    <span class="value">${res.reference}</span>
                </div>
            </div>
            <div class="reservation-actions">
                <button class="btn-action" onclick="telechargerBillet('${res.id}')">📥 Télécharger</button>
                <button class="btn-action" onclick="afficherQRBillet('${res.id}')">📱 QR Code</button>
            </div>
        </div>
    `).join('');
}

function ajouterReservation(reservation) {
    reservations.push({
        ...reservation,
        id: 'RES' + Date.now()
    });
    renderReservations();
}

function telechargerBillet(reservationId) {
    alert(`📥 Téléchargement du billet ${reservationId} en cours...\n\n✅ Le PDF sera disponible dans vos téléchargements`);
}

function afficherQRBillet(reservationId) {
    const res = reservations.find(r => r.id === reservationId);
    if (res) {
        alert(`📱 QR Code du billet\n\n🎫 ${res.match}\n🆔 ${res.reference}\n\nPrésentez ce QR Code à l'entrée du stade`);
    }
}

// === NOTIFICATIONS ===

function initNotifications() {
    const btn = document.getElementById('btnNotifications');
    if (btn) {
        btn.addEventListener('click', openNotifications);
    }
    renderNotifications();
}

function openNotifications() {
    const modal = document.getElementById('notificationsModal');
    if (modal) {
        modal.style.display = 'flex';
        renderNotifications();
    }
}

function closeNotifications() {
    const modal = document.getElementById('notificationsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function renderNotifications() {
    const container = document.getElementById('notificationsBody');
    if (!container) return;
    
    container.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.read ? 'read' : 'unread'}" onclick="handleNotificationClick(${notif.id})">
            <div class="notification-icon">${getNotificationIcon(notif.type)}</div>
            <div class="notification-content">
                <h4>${notif.title}</h4>
                <p>${notif.message}</p>
                ${notif.location ? `<span class="notification-location">📍 ${notif.location}</span>` : ''}
                <span class="notification-time">${notif.time}</span>
                ${notif.link ? `<a href="${notif.link}" target="_blank" class="notification-link" onclick="event.stopPropagation()">➜ Voir plus</a>` : ''}
            </div>
            ${!notif.read ? '<div class="notification-badge">•</div>' : ''}
        </div>
    `).join('');
}

function getNotificationIcon(type) {
    const icons = {
        'match': '🎫',
        'match-resultat': '⚽',
        'match-alerte': '⏰',
        'payment': '💳',
        'promo': '🎉',
        'promo-geo': '📍',
        'promo-digital': '💻',
        'badge': '🏆',
        'reservation': '✅'
    };
    return icons[type] || '🔔';
}

function markAsRead(notifId) {
    const notif = notifications.find(n => n.id === notifId);
    if (notif) {
        notif.read = true;
        renderNotifications();
        updateNotificationBadge();
    }
}

function handleNotificationClick(notifId) {
    markAsRead(notifId);
    const notif = notifications.find(n => n.id === notifId);
    
    // Si la notification a un lien interne (ex: #billetsSection), naviguer vers l'onglet
    if (notif && notif.link && notif.link.startsWith('#')) {
        const sectionName = notif.link.replace('#', '').replace('Section', '');
        if (typeof switchSection === 'function') {
            switchSection(sectionName);
            closeNotifications();
        }
    }
}

function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-btn .badge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

// === INTERACTIONS AMIS (Appel Vocal + Transfert) ===

function initFriendInteractions() {
    // Les stories et posts seront cliquables
    renderStories(); // Re-render avec les listeners
}

function openFriendModal(friendName, friendAvatar) {
    selectedFriend = { name: friendName, avatar: friendAvatar };
    const modal = document.getElementById('friendModal');
    const title = document.getElementById('friendModalTitle');
    if (modal && title) {
        title.textContent = `👤 ${friendName}`;
        modal.style.display = 'flex';
    }
}

function closeFriendModal() {
    const modal = document.getElementById('friendModal');
    if (modal) {
        modal.style.display = 'none';
    }
    selectedFriend = null;
}

function startVoiceCall() {
    if (!selectedFriend) return;
    alert(`📞 Appel vocal en cours vers ${selectedFriend.name}...\n\n🔊 Connexion établie\n⏱️ Durée : 00:00`);
    closeFriendModal();
}

function startMoneyTransfer() {
    if (!selectedFriend) return;
    
    const montant = prompt(`💸 Transférer de l'argent à ${selectedFriend.name}\n\nMontant (en €) :`);
    if (!montant || isNaN(montant) || montant <= 0) return;
    
    const montantNum = parseFloat(montant);
    
    // Demander le code secret (obligatoire si > 30€)
    const codeMessage = montantNum > 30 
        ? '🔒 Code de sécurité OBLIGATOIRE\n\n(Le montant dépasse 30€)\n\nEntrez votre code secret à 4 chiffres :'
        : '🔒 Code de sécurité\n\nEntrez votre code secret à 4 chiffres :';
    
    const code = prompt(codeMessage);
    if (!code || code.length !== 4) {
        alert('❌ Code invalide. Transfert annulé.');
        return;
    }
    
    // Simuler le transfert instantané
    alert(`✅ Transfert instantané effectué par PaieCash\n\n💸 ${montant}€ envoyés à ${selectedFriend.name}\n⚡ Transfert instantané\n🔒 Code vérifié\n\n📧 ${selectedFriend.name} a reçu l'argent immédiatement`);
    
    // Ajouter à l'historique
    ajouterTransaction({
        type: 'Transfert',
        description: `Envoi instantané à ${selectedFriend.name}`,
        montant: -montantNum,
        devise: 'EUR',
        statut: 'Complété'
    });
    
    closeFriendModal();
}

// === CRÉATION LIEN DE PAIEMENT ===

function createPaymentLink() {
    const montant = prompt('🔗 Créer un lien de paiement PaieCash\n\nMontant à demander (en €) :');
    if (!montant || isNaN(montant) || montant <= 0) return;
    
    const description = prompt(`Description du paiement :\n(ex: Vente de billet, Remboursement...)`);
    if (!description) return;
    
    // Générer un lien fictif
    const linkId = 'PC' + Date.now();
    const link = `https://paiecash.com/pay/${linkId}`;
    
    alert(`✅ Lien de paiement PaieCash créé !\n\n🔗 ${link}\n\n💰 Montant : ${montant}€\n📝 ${description}\n\n📋 Lien copié dans le presse-papier`);
    
    // Copier dans le presse-papier
    navigator.clipboard.writeText(link);
}

// === CHOIX MULTIPLE DE PAIEMENT ===

let currentPurchaseItem = null;

function ouvrirChoixPaiement(item) {
    currentPurchaseItem = item;
    const modal = document.getElementById('paymentChoiceModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closePaymentChoice() {
    const modal = document.getElementById('paymentChoiceModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentPurchaseItem = null;
}

function selectPayment(method) {
    if (!currentPurchaseItem) return;
    
    const methodNames = {
        'fiat': 'EUR (Fiat)',
        'omcoin': 'OM Coin',
        'eurc': 'EURC (Stablecoin)',
        'usdt': 'USDT (Tether)',
        'banque': 'Virement Bancaire',
        'bnpl': 'BNPL (Paiement en plusieurs fois)'
    };
    
    const methodName = methodNames[method] || method;
    
    // Si BNPL, proposer les options
    if (method === 'bnpl') {
        const price = currentPurchaseItem.price;
        const options = `💳 BNPL - Paiement en plusieurs fois\n\nMontant total : ${price}€\n\nChoisissez votre formule :\n\n1️⃣ 3x sans frais : ${(price / 3).toFixed(2)}€/mois\n2️⃣ 4x sans frais : ${(price / 4).toFixed(2)}€/mois\n3️⃣ 6x avec frais (1.5%) : ${((price * 1.015) / 6).toFixed(2)}€/mois\n\nEntrez 3, 4 ou 6 :`;
        
        const choice = prompt(options);
        if (!choice || !['3', '4', '6'].includes(choice)) {
            alert('❌ Choix invalide. Paiement annulé.');
            closePaymentChoice();
            return;
        }
        
        const months = parseInt(choice);
        const hasFees = months === 6;
        const total = hasFees ? price * 1.015 : price;
        const monthly = total / months;
        
        alert(`✅ Paiement BNPL confirmé par PaieCash\n\n🛍️ ${currentPurchaseItem.name}\n💰 ${price}€ en ${months}x sans frais\n\n📅 Échéancier :\n• ${months} mensualités de ${monthly.toFixed(2)}€\n• Prélèvement automatique depuis votre Wallet/Carte\n• ${hasFees ? 'Frais de 1.5% inclus' : 'Sans frais'}\n\n✅ Achat immédiat, paiement différé !`);
        
        ajouterTransaction({
            type: 'BNPL ' + months + 'x',
            description: currentPurchaseItem.name + ` (${months} mensualités)`,
            montant: -monthly,
            devise: 'EUR',
            statut: 'En cours'
        });
    } else {
        alert(`✅ Paiement effectué par PaieCash\n\n💳 Mode : ${methodName}\n🛍️ ${currentPurchaseItem.name}\n💰 ${currentPurchaseItem.price}€\n\n✅ Transaction réussie !`);
        
        ajouterTransaction({
            type: currentPurchaseItem.type || 'Produit',
            description: currentPurchaseItem.name,
            montant: -currentPurchaseItem.price,
            devise: method === 'omcoin' ? 'OMC' : 'EUR',
            statut: 'Complété'
        });
    }
    
    closePaymentChoice();
}

// === WALLET <-> CARTE BANCAIRE ===

function rechargerWallet() {
    const montant = prompt('📤 Recharger votre Wallet\n\nMontant à recharger depuis votre carte bancaire (en €) :');
    if (!montant || isNaN(montant) || montant <= 0) return;
    
    const montantNum = parseFloat(montant);
    
    // Si montant > 30€, demander le code secret
    if (montantNum > 30) {
        const code = prompt('🔒 Confirmation de sécurité\n\nVeuillez entrer votre code secret à 4 chiffres :\n(Le montant dépasse 30€)');
        if (!code || code.length !== 4) {
            alert('❌ Code invalide. Transaction annulée.');
            return;
        }
    }
    
    alert(`✅ Rechargement instantané effectué par PaieCash\n\n📤 ${montant}€ ajoutés à votre wallet\n💳 Débité de votre carte bancaire\n⚡ Transfert instantané\n\n📊 Nouveau solde disponible`);
    
    ajouterTransaction({
        type: 'Recharge',
        description: 'Recharge depuis carte bancaire',
        montant: montantNum,
        devise: 'EUR',
        statut: 'Complété'
    });
}

function retirerVersCarte() {
    const montant = prompt('📥 Retirer vers votre carte bancaire\n\nMontant à retirer depuis votre wallet (en €) :');
    if (!montant || isNaN(montant) || montant <= 0) return;
    
    const montantNum = parseFloat(montant);
    
    // Si montant > 30€, demander le code secret
    if (montantNum > 30) {
        const code = prompt('🔒 Confirmation de sécurité\n\nVeuillez entrer votre code secret à 4 chiffres :\n(Le montant dépasse 30€)');
        if (!code || code.length !== 4) {
            alert('❌ Code invalide. Transaction annulée.');
            return;
        }
    }
    
    alert(`✅ Retrait instantané effectué par PaieCash\n\n📥 ${montant}€ transférés vers votre carte bancaire\n⚡ Transfert instantané (disponible immédiatement)\n\n📧 Confirmation envoyée par email`);
    
    ajouterTransaction({
        type: 'Retrait',
        description: 'Retrait instantané vers carte bancaire',
        montant: -montantNum,
        devise: 'EUR',
        statut: 'Complété'
    });
}

function toggleAutoVirement() {
    const choice = confirm('🔄 Virement Automatique\n\nActiver le virement automatique de vos gains vers votre carte bancaire ?\n\n• Seuil : 100€\n• Fréquence : Hebdomadaire');
    
    if (choice) {
        alert('✅ Virement automatique activé !\n\n🔄 Vos gains seront automatiquement transférés chaque semaine vers votre carte bancaire dès que le solde dépasse 100€');
    } else {
        alert('Virement automatique désactivé');
    }
}
