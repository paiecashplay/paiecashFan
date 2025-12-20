// =====================================
// INTÉGRATION MODALE PAIEMENT COMPLÈTE
// =====================================

// === MODAL PAIEMENT UNIVERSELLE ===

function ouvrirModalePaiement(produit) {
    // produit = { nom, prix, type }
    const modal = document.getElementById('paymentChoiceModal');
    if (!modal) {
        // Créer la modale si elle n'existe pas
        creerModalePaiement();
    }
    
    // Stocker le produit actuel
    window.currentPurchaseItem = produit;
    
    // Afficher la modale
    const modalCreated = document.getElementById('paymentChoiceModal');
    if (modalCreated) {
        modalCreated.style.display = 'flex';
    }
}

function creerModalePaiement() {
    const modalHTML = `
    <div id="paymentChoiceModal" class="modal-overlay" style="display: none;">
        <div class="modal-content" style="max-width: 500px; background: var(--bg-secondary); border-radius: 20px; padding: 30px;">
            <h2 style="color: var(--om-blue); margin-bottom: 20px;">💳 Choisir le Mode de Paiement</h2>
            
            <div class="payment-options" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                <button class="payment-option-btn" onclick="selectPaymentMethod('fiat')" style="background: linear-gradient(135deg, #4CAF50, #45a049); padding: 20px; border: none; border-radius: 15px; color: white; cursor: pointer; font-size: 16px; font-weight: bold;">
                    💶 EUR (Fiat)<br><span style="font-size: 12px; opacity: 0.8;">Carte bancaire</span>
                </button>
                
                <button class="payment-option-btn" onclick="selectPaymentMethod('omcoin')" style="background: linear-gradient(135deg, #00B0E0, #0088cc); padding: 20px; border: none; border-radius: 15px; color: white; cursor: pointer; font-size: 16px; font-weight: bold;">
                    🏟️ OM Coin<br><span style="font-size: 12px; opacity: 0.8;">⚡ Frais -70%</span>
                </button>
                
                <button class="payment-option-btn" onclick="selectPaymentMethod('eurc')" style="background: linear-gradient(135deg, #2196F3, #1976D2); padding: 20px; border: none; border-radius: 15px; color: white; cursor: pointer; font-size: 16px; font-weight: bold;">
                    💎 EURC<br><span style="font-size: 12px; opacity: 0.8;">Stablecoin Euro</span>
                </button>
                
                <button class="payment-option-btn" onclick="selectPaymentMethod('usdt')" style="background: linear-gradient(135deg, #26A69A, #00897B); padding: 20px; border: none; border-radius: 15px; color: white; cursor: pointer; font-size: 16px; font-weight: bold;">
                    💵 USDT<br><span style="font-size: 12px; opacity: 0.8;">Tether USD</span>
                </button>
                
                <button class="payment-option-btn" onclick="selectPaymentMethod('banque')" style="background: linear-gradient(135deg, #9C27B0, #7B1FA2); padding: 20px; border: none; border-radius: 15px; color: white; cursor: pointer; font-size: 16px; font-weight: bold;">
                    🏦 Virement<br><span style="font-size: 12px; opacity: 0.8;">Bancaire</span>
                </button>
                
                <button class="payment-option-btn" onclick="selectPaymentMethod('bnpl')" style="background: linear-gradient(135deg, #FF6600, #FF9900); padding: 20px; border: none; border-radius: 15px; color: white; cursor: pointer; font-size: 16px; font-weight: bold;">
                    💳 BNPL<br><span style="font-size: 12px; opacity: 0.8;">3x, 4x ou 6x</span>
                </button>
            </div>
            
            <div style="background: rgba(0, 255, 136, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #00ff88;">
                <strong style="color: #00ff88;">💡 Astuce :</strong> Payez en OM Coin, EURC ou USDT et économisez jusqu'à 70% sur les frais de transaction !
            </div>
            
            <button onclick="fermerModalePaiement()" style="width: 100%; padding: 15px; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); border-radius: 10px; color: white; font-size: 16px; cursor: pointer;">
                ❌ Annuler
            </button>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function fermerModalePaiement() {
    const modal = document.getElementById('paymentChoiceModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function selectPaymentMethod(method) {
    const produit = window.currentPurchaseItem;
    if (!produit) return;
    
    const methodNames = {
        'fiat': 'EUR (Carte bancaire)',
        'omcoin': 'OM Coin (Frais -70%)',
        'eurc': 'EURC (Stablecoin Euro)',
        'usdt': 'USDT (Tether USD)',
        'banque': 'Virement Bancaire',
        'bnpl': 'BNPL (Paiement en plusieurs fois)'
    };
    
    // Si BNPL, utiliser la fonction avancée
    if (method === 'bnpl') {
        fermerModalePaiement();
        if (typeof choisirBNPL === 'function') {
            choisirBNPL(produit.prix, produit.nom);
        } else {
            alert('❌ Fonction BNPL non disponible');
        }
        return;
    }
    
    // Calculer les frais
    let frais = 0;
    let fraisTexte = '';
    
    if (method === 'fiat' || method === 'banque') {
        frais = produit.prix * 0.025; // 2.5% frais carte
        fraisTexte = `⚠️ Frais : ${frais.toFixed(2)}€ (2.5%)`;
    } else if (method === 'omcoin' || method === 'eurc' || method === 'usdt') {
        frais = produit.prix * 0.005; // 0.5% frais stablecoin
        fraisTexte = `✅ Frais réduits : ${frais.toFixed(2)}€ (0.5%) - Économie de ${(produit.prix * 0.02).toFixed(2)}€ !`;
    }
    
    const total = produit.prix + frais;
    
    const confirmer = confirm(`💳 Confirmer le paiement\n\n🛍️ ${produit.nom}\n💰 Prix : ${produit.prix}€\n${fraisTexte}\n\n💵 TOTAL : ${total.toFixed(2)}€\n\n💳 Mode : ${methodNames[method]}\n\n✅ Confirmer ?`);
    
    if (confirmer) {
        alert(`✅ Paiement effectué par PaieCash\n\n🛍️ ${produit.nom}\n💰 ${produit.prix}€\n💳 ${methodNames[method]}\n${fraisTexte}\n\n✅ Transaction réussie !`);
        
        // Ajouter à l'historique
        if (typeof ajouterTransaction === 'function') {
            ajouterTransaction({
                type: produit.type || 'Achat',
                description: produit.nom,
                montant: -total,
                devise: method === 'omcoin' ? 'OMC' : (method === 'eurc' ? 'EURC' : (method === 'usdt' ? 'USDT' : 'EUR')),
                statut: 'Validé'
            });
        }
    }
    
    fermerModalePaiement();
}

// === REMPLACER TOUTES LES FONCTIONS D'ACHAT ===

// NFT
window.originalBuyNFT = window.buyNFT;
window.buyNFT = function(nftId) {
    const nft = nftMarketplace.find(n => n.id === nftId);
    if (!nft) return;
    
    ouvrirModalePaiement({
        nom: nft.title,
        prix: nft.price,
        type: 'NFT'
    });
};

// Produits boutique
window.originalAddToCart = window.addToCart;
window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    ouvrirModalePaiement({
        nom: product.name,
        prix: product.price,
        type: 'Produit Boutique'
    });
};

// Produits fans
window.originalAddFanProductToCart = window.addFanProductToCart;
window.addFanProductToCart = function(productId) {
    const product = fanProducts.find(p => p.id === productId);
    if (!product) return;
    
    ouvrirModalePaiement({
        nom: product.name,
        prix: product.price,
        type: 'Produit Fan'
    });
};

// Billets Fan-to-Fan
window.originalBuyFanTicket = window.buyFanTicket;
window.buyFanTicket = function(ticketId) {
    const ticket = fanTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    ouvrirModalePaiement({
        nom: `${ticket.match} - ${ticket.date}`,
        prix: ticket.price,
        type: 'Billet Fan-to-Fan'
    });
};

// Acheter NFT Légende
window.originalAcheterNFTLegende = window.acheterNFTLegende;
window.acheterNFTLegende = function(ambassadeurId) {
    const ambassadeur = ambassadeurs.find(a => a.id === ambassadeurId);
    if (!ambassadeur) return;
    
    ouvrirModalePaiement({
        nom: `NFT ${ambassadeur.nom}`,
        prix: 299,
        type: 'NFT Légende'
    });
};

console.log('✅ Intégration paiement modale universelle chargée');
