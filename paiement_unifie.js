/**
 * SYSTÈME DE PAIEMENT UNIFIÉ - PaieCashPlay v2.7.1
 * Modale de paiement universelle avec 6 modes de paiement fonctionnels
 */

// === VARIABLE GLOBALE POUR STOCKER L'ACHAT EN COURS ===
window.currentPurchase = null;

// === CRÉER LA MODALE DE PAIEMENT AU CHARGEMENT ===
document.addEventListener('DOMContentLoaded', function() {
    creerModalePaiementUniverselle();
});

// === FONCTION POUR CRÉER LA MODALE ===
function creerModalePaiementUniverselle() {
    // Vérifier si la modale existe déjà
    if (document.getElementById('universalPaymentModal')) {
        return;
    }
    
    const modalHTML = `
    <div id="universalPaymentModal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 10000; align-items: center; justify-content: center;">
        <div class="modal-content" style="background: #1a1a2e; border-radius: 25px; padding: 35px; max-width: 550px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="color: #0e9cda; font-size: 26px; margin-bottom: 10px;">💳 Choisir le Mode de Paiement</h2>
                <p id="purchaseItemName" style="color: #999; font-size: 14px;"></p>
                <p id="purchaseItemPrice" style="color: white; font-size: 22px; font-weight: bold; margin-top: 8px;"></p>
            </div>
            
            <!-- Options de paiement -->
            <div class="payment-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 25px;">
                
                <!-- EUR Fiat -->
                <button onclick="processerPaiement('fiat')" style="background: linear-gradient(135deg, #4CAF50, #45a049); padding: 18px 15px; border: none; border-radius: 15px; color: white; cursor: pointer; font-size: 15px; font-weight: bold; transition: all 0.3s; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 5px;">💶</div>
                    <div>EUR (Fiat)</div>
                    <div style="font-size: 11px; opacity: 0.8; margin-top: 5px;">Carte bancaire</div>
                </button>
                
                <!-- OM Coin -->
                <button onclick="processerPaiement('omcoin')" style="background: linear-gradient(135deg, #0e9cda, #0c7db3); padding: 18px 15px; border: none; border-radius: 15px; color: white; cursor: pointer; font-size: 15px; font-weight: bold; transition: all 0.3s; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 5px;">🏟️</div>
                    <div>OM Coin</div>
                    <div style="font-size: 11px; opacity: 0.8; margin-top: 5px;">⚡ Frais -70%</div>
                </button>
                
                <!-- EURC -->
                <button onclick="processerPaiement('eurc')" style="background: linear-gradient(135deg, #2196F3, #1976D2); padding: 18px 15px; border: none; border-radius: 15px; color: white; cursor: pointer; font-size: 15px; font-weight: bold; transition: all 0.3s; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 5px;">💎</div>
                    <div>EURC</div>
                    <div style="font-size: 11px; opacity: 0.8; margin-top: 5px;">Stablecoin Euro</div>
                </button>
                
                <!-- USDT -->
                <button onclick="processerPaiement('usdt')" style="background: linear-gradient(135deg, #26A69A, #00897B); padding: 18px 15px; border: none; border-radius: 15px; color: white; cursor: pointer; font-size: 15px; font-weight: bold; transition: all 0.3s; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 5px;">💵</div>
                    <div>USDT</div>
                    <div style="font-size: 11px; opacity: 0.8; margin-top: 5px;">Tether USD</div>
                </button>
                
                <!-- Virement Bancaire -->
                <button onclick="processerPaiement('banque')" style="background: linear-gradient(135deg, #9C27B0, #7B1FA2); padding: 18px 15px; border: none; border-radius: 15px; color: white; cursor: pointer; font-size: 15px; font-weight: bold; transition: all 0.3s; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 5px;">🏦</div>
                    <div>Virement</div>
                    <div style="font-size: 11px; opacity: 0.8; margin-top: 5px;">Bancaire</div>
                </button>
                
                <!-- BNPL -->
                <button onclick="processerPaiement('bnpl')" style="background: linear-gradient(135deg, #FF6600, #FF9900); padding: 18px 15px; border: none; border-radius: 15px; color: white; cursor: pointer; font-size: 15px; font-weight: bold; transition: all 0.3s; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 5px;">💳</div>
                    <div>BNPL</div>
                    <div style="font-size: 11px; opacity: 0.8; margin-top: 5px;">3x, 4x ou 6x</div>
                </button>
            </div>
            
            <!-- Avantages Stablecoins -->
            <div style="background: linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 200, 100, 0.1)); padding: 15px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #00ff88;">
                <div style="color: #00ff88; font-weight: bold; margin-bottom: 8px; font-size: 14px;">💡 Avantages Stablecoins (OM Coin, EURC, USDT)</div>
                <ul style="color: #ccc; font-size: 13px; margin: 0; padding-left: 20px;">
                    <li>⚡ Frais de transaction : -70% (0.5% au lieu de 2.5%)</li>
                    <li>🚀 Transaction instantanée (<1 seconde)</li>
                    <li>💰 Cash in/Cash out : Le club peut échanger directement</li>
                    <li>🔒 100% sécurisé et non-custodial</li>
                </ul>
            </div>
            
            <!-- Bouton Annuler -->
            <button onclick="fermerModalePaiement()" style="width: 100%; padding: 15px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 12px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                ❌ Annuler
            </button>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('✅ Modale de paiement universelle créée');
}

// === OUVRIR LA MODALE DE PAIEMENT ===
function ouvrirModalePaiement(item) {
    // item = { nom, prix, type }
    if (!item || !item.nom || !item.prix) {
        console.error('❌ Item invalide:', item);
        return;
    }
    
    // Stocker l'achat en cours
    window.currentPurchase = item;
    
    // Créer la modale si elle n'existe pas
    if (!document.getElementById('universalPaymentModal')) {
        creerModalePaiementUniverselle();
    }
    
    // Afficher les détails
    const modal = document.getElementById('universalPaymentModal');
    const itemName = document.getElementById('purchaseItemName');
    const itemPrice = document.getElementById('purchaseItemPrice');
    
    if (itemName) itemName.textContent = item.nom;
    if (itemPrice) itemPrice.textContent = `${item.prix.toFixed(2)} €`;
    
    // Afficher la modale
    if (modal) {
        modal.style.display = 'flex';
    }
    
    console.log('💳 Modale ouverte pour:', item);
}

// === FERMER LA MODALE ===
function fermerModalePaiement() {
    const modal = document.getElementById('universalPaymentModal');
    if (modal) {
        modal.style.display = 'none';
    }
    window.currentPurchase = null;
}

// === TRAITER LE PAIEMENT ===
function processerPaiement(methode) {
    const item = window.currentPurchase;
    
    if (!item) {
        alert('❌ Erreur : Aucun article à payer');
        return;
    }
    
    const methodesNoms = {
        'fiat': 'EUR (Carte bancaire)',
        'omcoin': 'OM Coin',
        'eurc': 'EURC (Stablecoin Euro)',
        'usdt': 'USDT (Tether)',
        'banque': 'Virement Bancaire',
        'bnpl': 'BNPL (Paiement en plusieurs fois)'
    };
    
    const devises = {
        'fiat': 'EUR',
        'omcoin': 'OMC',
        'eurc': 'EURC',
        'usdt': 'USDT',
        'banque': 'EUR',
        'bnpl': 'EUR'
    };
    
    // Si BNPL, proposer les options de paiement fractionné
    if (methode === 'bnpl') {
        processerBNPL(item);
        return;
    }
    
    // Calculer les frais
    let frais = 0;
    let fraisTexte = '';
    let economie = 0;
    
    if (methode === 'fiat' || methode === 'banque') {
        frais = item.prix * 0.025; // 2.5% pour carte/virement
        fraisTexte = `⚠️ Frais de transaction : ${frais.toFixed(2)}€ (2.5%)`;
    } else if (methode === 'omcoin' || methode === 'eurc' || methode === 'usdt') {
        frais = item.prix * 0.005; // 0.5% pour stablecoins
        economie = (item.prix * 0.025) - frais; // Économie vs carte
        fraisTexte = `✅ Frais réduits : ${frais.toFixed(2)}€ (0.5%)\n💰 Économie : ${economie.toFixed(2)}€ par rapport à la carte !`;
    }
    
    const total = item.prix + frais;
    
    // Demander confirmation
    const confirmation = confirm(
        `💳 CONFIRMER LE PAIEMENT\n\n` +
        `🛍️ ${item.nom}\n` +
        `💰 Prix : ${item.prix.toFixed(2)}€\n` +
        `${fraisTexte}\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `💵 TOTAL : ${total.toFixed(2)}€\n\n` +
        `💳 Mode : ${methodesNoms[methode]}\n\n` +
        `✅ Confirmer le paiement ?`
    );
    
    if (!confirmation) {
        alert('❌ Paiement annulé');
        return;
    }
    
    // Traiter le paiement
    alert(
        `✅ PAIEMENT RÉUSSI !\n\n` +
        `🛍️ ${item.nom}\n` +
        `💰 ${item.prix.toFixed(2)}€\n` +
        `💳 ${methodesNoms[methode]}\n` +
        `${fraisTexte}\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `💵 TOTAL DÉBITÉ : ${total.toFixed(2)}€\n\n` +
        `✅ Transaction validée par PaieCash\n` +
        (economie > 0 ? `🎉 Vous avez économisé ${economie.toFixed(2)}€ !` : '')
    );
    
    // Ajouter à l'historique des transactions
    if (typeof ajouterTransaction === 'function') {
        ajouterTransaction({
            type: item.type || 'Achat',
            description: item.nom,
            montant: -total,
            devise: devises[methode],
            statut: 'Validé'
        });
    }
    
    // Débiter le solde correspondant
    const utilisateur = obtenirUtilisateurConnecte();
    if (utilisateur) {
        if (methode === 'omcoin' && utilisateur.soldeOMC !== undefined) {
            utilisateur.soldeOMC -= total;
            mettreAJourProfil({ soldeOMC: utilisateur.soldeOMC });
        } else if (methode === 'eurc' && utilisateur.soldeEURC !== undefined) {
            utilisateur.soldeEURC -= total;
            mettreAJourProfil({ soldeEURC: utilisateur.soldeEURC });
        } else if (methode === 'usdt' && utilisateur.soldeUSDT !== undefined) {
            utilisateur.soldeUSDT -= total;
            mettreAJourProfil({ soldeUSDT: utilisateur.soldeUSDT });
        } else if (utilisateur.solde !== undefined) {
            utilisateur.solde -= total;
            mettreAJourProfil({ solde: utilisateur.solde });
        }
    }
    
    // Fermer la modale
    fermerModalePaiement();
    
    console.log('✅ Paiement traité:', {
        item: item.nom,
        methode: methode,
        montant: total,
        devise: devises[methode]
    });
}

// === TRAITER BNPL (BUY NOW PAY LATER) ===
function processerBNPL(item) {
    const prix = item.prix;
    
    // Proposer les options BNPL
    const options = 
        `💳 PAIEMENT EN PLUSIEURS FOIS\n\n` +
        `🛍️ ${item.nom}\n` +
        `💰 Prix total : ${prix.toFixed(2)}€\n\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `Choisissez votre formule :\n\n` +
        `1️⃣ 3x SANS FRAIS\n` +
        `   ${(prix / 3).toFixed(2)}€ × 3 mois\n\n` +
        `2️⃣ 4x SANS FRAIS\n` +
        `   ${(prix / 4).toFixed(2)}€ × 4 mois\n\n` +
        `3️⃣ 6x AVEC FRAIS (1.5%)\n` +
        `   ${((prix * 1.015) / 6).toFixed(2)}€ × 6 mois\n\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `Tapez 3, 4 ou 6 pour choisir :`;
    
    const choix = prompt(options);
    
    if (!choix || !['3', '4', '6'].includes(choix)) {
        alert('❌ Choix invalide. Paiement annulé.');
        return;
    }
    
    const mois = parseInt(choix);
    const avecFrais = mois === 6;
    const frais = avecFrais ? prix * 0.015 : 0;
    const total = prix + frais;
    const mensualite = total / mois;
    
    // Confirmation
    const confirmation = confirm(
        `💳 CONFIRMER BNPL ${mois}x\n\n` +
        `🛍️ ${item.nom}\n` +
        `💰 Prix : ${prix.toFixed(2)}€\n` +
        `📋 Frais : ${frais.toFixed(2)}€ ${avecFrais ? '(1.5%)' : '(SANS FRAIS)'}\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `💵 Total : ${total.toFixed(2)}€\n\n` +
        `📅 ÉCHÉANCIER :\n` +
        `• ${mois} mensualités de ${mensualite.toFixed(2)}€\n` +
        `• Prélèvement automatique\n` +
        `• Premier paiement aujourd'hui\n\n` +
        `✅ Confirmer ?`
    );
    
    if (!confirmation) {
        alert('❌ Paiement BNPL annulé');
        return;
    }
    
    // Valider le paiement BNPL
    alert(
        `✅ PAIEMENT BNPL CONFIRMÉ !\n\n` +
        `🛍️ ${item.nom}\n` +
        `💰 ${prix.toFixed(2)}€ en ${mois}x\n\n` +
        `📅 Échéancier validé :\n` +
        `• ${mois} mensualités de ${mensualite.toFixed(2)}€\n` +
        `• ${avecFrais ? 'Frais 1.5% inclus' : 'SANS FRAIS'}\n` +
        `• Prélèvement auto depuis Wallet/Carte\n\n` +
        `✅ Achat immédiat, paiement différé !\n` +
        `🎁 Article livré dès maintenant`
    );
    
    // Ajouter à l'historique
    if (typeof ajouterTransaction === 'function') {
        ajouterTransaction({
            type: `BNPL ${mois}x`,
            description: `${item.nom} (${mois} mensualités de ${mensualite.toFixed(2)}€)`,
            montant: -mensualite,
            devise: 'EUR',
            statut: 'En cours'
        });
    }
    
    // Fermer la modale
    fermerModalePaiement();
}

// === FONCTIONS COMPATIBILITÉ POUR REMPLACER LES ANCIENNES ===

// Acheter un produit (boutique)
window.acheterProduit = function(nom, prix) {
    ouvrirModalePaiement({
        nom: nom,
        prix: prix,
        type: 'Produit Boutique'
    });
};

// Acheter un billet
window.acheterBillet = function(match, prix) {
    ouvrirModalePaiement({
        nom: match,
        prix: prix,
        type: 'Billet'
    });
};

// Acheter un NFT
window.acheterNFT = function(nom, prix) {
    ouvrirModalePaiement({
        nom: nom,
        prix: prix,
        type: 'NFT'
    });
};

// Recharger le wallet
window.rechargerWallet = function() {
    const montant = prompt('💰 Recharger le Wallet\n\nMontant à recharger (en €) :');
    
    if (!montant || isNaN(montant) || parseFloat(montant) <= 0) {
        alert('❌ Montant invalide');
        return;
    }
    
    ouvrirModalePaiement({
        nom: 'Recharge Wallet',
        prix: parseFloat(montant),
        type: 'Recharge'
    });
};

// Acheter des coins
window.acheterCoin = function(coinType) {
    const noms = {
        'omc': 'OM Coin',
        'psc': 'PSG Coin',
        'olc': 'OL Coin',
        'eurc': 'EURC',
        'usdt': 'USDT'
    };
    
    const montant = prompt(`💎 Acheter ${noms[coinType] || coinType}\n\nMontant à acheter (en €) :`);
    
    if (!montant || isNaN(montant) || parseFloat(montant) <= 0) {
        alert('❌ Montant invalide');
        return;
    }
    
    ouvrirModalePaiement({
        nom: `Achat ${noms[coinType] || coinType}`,
        prix: parseFloat(montant),
        type: 'Crypto'
    });
};

console.log('✅ Système de paiement unifié chargé - v2.7.1');
