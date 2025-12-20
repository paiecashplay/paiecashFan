// ========================================
// SECTION PAIEMENT AMÉLIORÉE - Version 2.8.0
// ========================================

// === GESTION DES TRANSACTIONS ===

// Générer quelques transactions de démo
const transactionsDemo = [
    {
        id: 'TX' + Date.now() + 1,
        type: 'Achat Partenaire',
        description: 'Big Mac Menu - McDonald\'s',
        montant: -9.50,
        cashback: +0.48,
        devise: 'EUR',
        statut: 'Complété',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString('fr-FR'),
        details: {
            partenaire: 'McDonald\'s',
            adresse: '123 Avenue du Prado, Marseille',
            reference: 'MCD-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        }
    },
    {
        id: 'TX' + Date.now() + 2,
        type: 'Recharge Wallet',
        description: 'Recharge depuis carte bancaire',
        montant: +50.00,
        devise: 'EUR',
        statut: 'Complété',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString('fr-FR'),
        details: {
            carte: '**** **** **** 5678',
            reference: 'RCH-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        }
    },
    {
        id: 'TX' + Date.now() + 3,
        type: 'Transfert P2P',
        description: 'Envoi instantané à Sophie Martin',
        montant: -25.00,
        devise: 'EUR',
        statut: 'Complété',
        date: new Date(Date.now() - 48 * 60 * 60 * 1000).toLocaleString('fr-FR'),
        details: {
            destinataire: 'Sophie Martin',
            email: 'sophie.martin@paiecash.com',
            reference: 'P2P-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        }
    },
    {
        id: 'TX' + Date.now() + 4,
        type: 'Achat OM Coin',
        description: 'Achat de 100 OM Coins',
        montant: -100.00,
        devise: 'EUR',
        statut: 'Complété',
        date: new Date(Date.now() - 72 * 60 * 60 * 1000).toLocaleString('fr-FR'),
        details: {
            quantite: '100 OMC',
            taux: '1 OMC = 1 EUR',
            reference: 'OMC-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        }
    },
    {
        id: 'TX' + Date.now() + 5,
        type: 'Cashback',
        description: 'Cashback Carrefour',
        montant: +1.35,
        devise: 'EUR',
        statut: 'Complété',
        date: new Date(Date.now() - 96 * 60 * 60 * 1000).toLocaleString('fr-FR'),
        details: {
            partenaire: 'Carrefour',
            pourcentage: '3%',
            achatOriginal: '45.00 EUR'
        }
    },
    {
        id: 'TX' + Date.now() + 6,
        type: 'Retrait',
        description: 'Retrait vers carte bancaire',
        montant: -75.00,
        devise: 'EUR',
        statut: 'Complété',
        date: new Date(Date.now() - 120 * 60 * 60 * 1000).toLocaleString('fr-FR'),
        details: {
            carte: '**** **** **** 5678',
            reference: 'RET-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        }
    },
    {
        id: 'TX' + Date.now() + 7,
        type: 'Achat NFT',
        description: 'But de Basile Boli - Finale C1 1993',
        montant: -499,
        devise: 'OMC',
        statut: 'Complété',
        date: new Date(Date.now() - 144 * 60 * 60 * 1000).toLocaleString('fr-FR'),
        details: {
            nft: 'But de Basile Boli',
            edition: '100/1993',
            reference: 'NFT-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        }
    }
];

// Fonction pour afficher toutes les transactions
function afficherTransactions() {
    const container = document.getElementById('transactionsContainer');
    if (!container) return;
    
    if (transactionsDemo.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Aucune transaction pour le moment</p>';
        return;
    }
    
    let html = '<div class="transactions-list">';
    
    transactionsDemo.forEach(tx => {
        const isPositive = tx.montant > 0;
        const icon = getTransactionIcon(tx.type);
        const statusColor = tx.statut === 'Complété' ? '#00ff88' : (tx.statut === 'En cours' ? '#ffa500' : '#ff4444');
        
        html += `
            <div class="transaction-item" onclick="afficherDetailsTransaction('${tx.id}')" style="cursor: pointer;">
                <div class="transaction-icon" style="font-size: 32px; margin-right: 15px;">${icon}</div>
                <div class="transaction-info" style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; font-size: 15px; color: #333;">${tx.description}</h4>
                    <span style="font-size: 12px; color: #999;">${tx.date}</span>
                    <div style="margin-top: 5px;">
                        <span class="badge" style="background: ${statusColor}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">${tx.statut}</span>
                    </div>
                </div>
                <div class="transaction-amount" style="text-align: right;">
                    <div style="font-size: 18px; font-weight: 700; color: ${isPositive ? '#00ff88' : '#ff4444'};">
                        ${isPositive ? '+' : ''}${tx.montant.toFixed(2)} ${tx.devise}
                    </div>
                    ${tx.cashback ? `<div style="font-size: 12px; color: #00ff88; margin-top: 3px;">+${tx.cashback.toFixed(2)} € cashback</div>` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Fonction pour obtenir l'icône selon le type
function getTransactionIcon(type) {
    const icons = {
        'Achat Partenaire': '🛍️',
        'Recharge Wallet': '📤',
        'Transfert P2P': '💸',
        'Achat OM Coin': '🏟️',
        'Cashback': '🎁',
        'Retrait': '📥',
        'Achat NFT': '🎨',
        'Billet': '🎫',
        'BNPL 3x': '💳',
        'BNPL 4x': '💳',
        'BNPL 6x': '💳'
    };
    return icons[type] || '💳';
}

// Fonction pour afficher les détails d'une transaction
function afficherDetailsTransaction(txId) {
    const tx = transactionsDemo.find(t => t.id === txId);
    if (!tx) return;
    
    let detailsHtml = `
        <div style="padding: 20px;">
            <h3 style="margin-top: 0; color: #0e9cda; display: flex; align-items: center; gap: 10px;">
                ${getTransactionIcon(tx.type)} ${tx.description}
            </h3>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 10px; margin: 20px 0;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Montant</div>
                        <div style="font-size: 20px; font-weight: 700; color: ${tx.montant > 0 ? '#00ff88' : '#ff4444'};">
                            ${tx.montant > 0 ? '+' : ''}${tx.montant.toFixed(2)} ${tx.devise}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Statut</div>
                        <div style="font-size: 16px; font-weight: 600; color: #00ff88;">${tx.statut}</div>
                    </div>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-weight: 600; margin-bottom: 10px; color: #333;">📋 Détails de la transaction</div>
                <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px;">
                    <div style="margin-bottom: 10px;">
                        <span style="color: #666;">Type :</span>
                        <span style="font-weight: 600; margin-left: 10px;">${tx.type}</span>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <span style="color: #666;">Date :</span>
                        <span style="font-weight: 600; margin-left: 10px;">${tx.date}</span>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <span style="color: #666;">ID Transaction :</span>
                        <span style="font-weight: 600; margin-left: 10px; font-family: monospace; font-size: 12px;">${tx.id}</span>
                    </div>
    `;
    
    // Ajouter les détails spécifiques
    if (tx.details) {
        Object.keys(tx.details).forEach(key => {
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            detailsHtml += `
                <div style="margin-bottom: 10px;">
                    <span style="color: #666;">${label} :</span>
                    <span style="font-weight: 600; margin-left: 10px;">${tx.details[key]}</span>
                </div>
            `;
        });
    }
    
    if (tx.cashback) {
        detailsHtml += `
            <div style="margin-top: 15px; padding: 10px; background: linear-gradient(135deg, #00ff88, #00c851); border-radius: 8px; color: white;">
                <div style="font-weight: 600;">🎁 Cashback reçu</div>
                <div style="font-size: 18px; font-weight: 700; margin-top: 5px;">+${tx.cashback.toFixed(2)} EUR</div>
            </div>
        `;
    }
    
    detailsHtml += `
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 25px;">
                <button onclick="exporterTransactionPDF('${tx.id}')" style="flex: 1; padding: 12px; background: #0e9cda; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    📄 Exporter en PDF
                </button>
                <button onclick="partagerTransaction('${tx.id}')" style="flex: 1; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    📤 Partager
                </button>
            </div>
        </div>
    `;
    
    const modal = document.getElementById('transactionDetailsModal');
    if (modal) {
        document.getElementById('transactionDetailsContent').innerHTML = detailsHtml;
        modal.style.display = 'flex';
    }
}

// Fonction pour exporter une transaction en PDF
function exporterTransactionPDF(txId) {
    const tx = transactionsDemo.find(t => t.id === txId);
    if (!tx) return;
    
    alert(`📄 Export PDF en cours...\n\n✅ Le reçu de transaction sera téléchargé :\n\n📝 ${tx.description}\n💰 ${tx.montant} ${tx.devise}\n📅 ${tx.date}\n🆔 ${tx.id}\n\n✅ Parfait pour votre comptabilité !`);
}

// Fonction pour partager une transaction
function partagerTransaction(txId) {
    const tx = transactionsDemo.find(t => t.id === txId);
    if (!tx) return;
    
    const text = `Transaction PaieCash\n${tx.description}\n${tx.montant} ${tx.devise}\n${tx.date}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Transaction PaieCash',
            text: text
        });
    } else {
        alert(`📤 Partage :\n\n${text}\n\n✅ Informations copiées !`);
    }
}

// Fonction pour exporter TOUTES les transactions (comptabilité)
function exporterToutesTransactions() {
    const format = prompt('📊 Export Comptabilité\n\nChoisissez le format d\'export :\n\n1️⃣ PDF (Rapport complet)\n2️⃣ CSV (Excel)\n3️⃣ JSON (Données brutes)\n\nEntrez 1, 2 ou 3 :');
    
    if (!format || !['1', '2', '3'].includes(format)) {
        return;
    }
    
    const formatNames = { '1': 'PDF', '2': 'CSV', '3': 'JSON' };
    const formatName = formatNames[format];
    
    let totalDebits = 0;
    let totalCredits = 0;
    let totalCashback = 0;
    
    transactionsDemo.forEach(tx => {
        if (tx.montant < 0) totalDebits += Math.abs(tx.montant);
        else totalCredits += tx.montant;
        if (tx.cashback) totalCashback += tx.cashback;
    });
    
    alert(`✅ Export ${formatName} généré !\n\n📊 Récapitulatif :\n• ${transactionsDemo.length} transactions\n• Débits : ${totalDebits.toFixed(2)} EUR\n• Crédits : ${totalCredits.toFixed(2)} EUR\n• Cashback total : ${totalCashback.toFixed(2)} EUR\n\n📥 Le fichier sera téléchargé dans quelques secondes\n\n✅ Parfait pour votre expert-comptable !`);
}

// Fonction pour fermer le modal de détails
function fermerDetailsTransaction() {
    const modal = document.getElementById('transactionDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// === INTERACTION VISUELLE WALLET <-> CARTE ===

let soldeWallet = 1247.50;
let soldeCarte = 1247.50;

function mettreAJourSoldes() {
    // Mettre à jour l'affichage des soldes
    const walletBalance = document.getElementById('walletBalanceDisplay');
    const cardBalance = document.getElementById('cardBalance');
    
    if (walletBalance) {
        walletBalance.textContent = soldeWallet.toFixed(2) + ' €';
    }
    if (cardBalance) {
        cardBalance.textContent = soldeCarte.toFixed(2) + ' €';
    }
}

function rechargerWalletVisuel() {
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
    
    // Animation visuelle
    afficherAnimationTransfert('carte', 'wallet', montantNum);
    
    // Mettre à jour les soldes
    setTimeout(() => {
        soldeWallet += montantNum;
        soldeCarte -= montantNum;
        mettreAJourSoldes();
        
        alert(`✅ Rechargement instantané effectué !\n\n📤 ${montant}€ ajoutés à votre wallet\n💳 Débité de votre carte bancaire\n⚡ Transfert instantané\n\n📊 Nouveau solde wallet : ${soldeWallet.toFixed(2)} €`);
        
        // Ajouter à l'historique
        transactionsDemo.unshift({
            id: 'TX' + Date.now(),
            type: 'Recharge Wallet',
            description: 'Recharge depuis carte bancaire',
            montant: montantNum,
            devise: 'EUR',
            statut: 'Complété',
            date: new Date().toLocaleString('fr-FR'),
            details: {
                carte: '**** **** **** 5678',
                reference: 'RCH-' + Math.random().toString(36).substr(2, 9).toUpperCase()
            }
        });
        
        afficherTransactions();
    }, 1500);
}

function retirerVersCarteVisuel() {
    const montant = prompt('📥 Retirer vers votre carte bancaire\n\nMontant à retirer depuis votre wallet (en €) :');
    if (!montant || isNaN(montant) || montant <= 0) return;
    
    const montantNum = parseFloat(montant);
    
    if (montantNum > soldeWallet) {
        alert('❌ Solde insuffisant dans votre wallet.');
        return;
    }
    
    // Si montant > 30€, demander le code secret
    if (montantNum > 30) {
        const code = prompt('🔒 Confirmation de sécurité\n\nVeuillez entrer votre code secret à 4 chiffres :\n(Le montant dépasse 30€)');
        if (!code || code.length !== 4) {
            alert('❌ Code invalide. Transaction annulée.');
            return;
        }
    }
    
    // Animation visuelle
    afficherAnimationTransfert('wallet', 'carte', montantNum);
    
    // Mettre à jour les soldes
    setTimeout(() => {
        soldeWallet -= montantNum;
        soldeCarte += montantNum;
        mettreAJourSoldes();
        
        alert(`✅ Retrait instantané effectué !\n\n📥 ${montant}€ transférés vers votre carte bancaire\n⚡ Transfert instantané (disponible immédiatement)\n\n📊 Nouveau solde wallet : ${soldeWallet.toFixed(2)} €\n💳 Nouveau solde carte : ${soldeCarte.toFixed(2)} €`);
        
        // Ajouter à l'historique
        transactionsDemo.unshift({
            id: 'TX' + Date.now(),
            type: 'Retrait',
            description: 'Retrait instantané vers carte bancaire',
            montant: -montantNum,
            devise: 'EUR',
            statut: 'Complété',
            date: new Date().toLocaleString('fr-FR'),
            details: {
                carte: '**** **** **** 5678',
                reference: 'RET-' + Math.random().toString(36).substr(2, 9).toUpperCase()
            }
        });
        
        afficherTransactions();
    }, 1500);
}

function afficherAnimationTransfert(source, destination, montant) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    `;
    
    const animation = document.createElement('div');
    animation.innerHTML = `
        <div style="text-align: center; color: white;">
            <div style="font-size: 80px; margin-bottom: 20px;">
                ${source === 'carte' ? '💳' : '👛'}
            </div>
            <div style="font-size: 60px; margin-bottom: 20px; animation: pulse 0.5s infinite;">
                ↓
            </div>
            <div style="font-size: 48px; font-weight: 700; color: #00ff88; margin-bottom: 20px;">
                ${montant.toFixed(2)} €
            </div>
            <div style="font-size: 60px; margin-bottom: 20px; animation: pulse 0.5s infinite;">
                ↓
            </div>
            <div style="font-size: 80px;">
                ${destination === 'carte' ? '💳' : '👛'}
            </div>
            <div style="margin-top: 30px; font-size: 20px; color: #00ff88;">
                ⚡ Transfert en cours...
            </div>
        </div>
        <style>
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
        </style>
    `;
    
    overlay.appendChild(animation);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        document.body.removeChild(overlay);
    }, 1500);
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('transactionsContainer')) {
        afficherTransactions();
        mettreAJourSoldes();
    }
});
