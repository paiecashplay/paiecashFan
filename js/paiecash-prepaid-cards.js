// 🎫 PAIECASH PREPAID CARDS SYSTEM
// Cartes bancaires prépayées pour tous les clubs et fédérations
// Cartes virtuelles et physiques avec cashback et avantages exclusifs

const PAIECASH_PREPAID_CARDS = {
    // Cartes disponibles par défaut (universelles)
    universal: {
        classic: {
            id: 'prepaid-classic',
            name: 'PaieCash Classic',
            type: 'virtual',
            fee: 0,
            monthlyFee: 0,
            cashback: 3,
            maxBalance: 5000,
            features: ['Paiements en ligne', 'Sans frais', '3% cashback'],
            color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            icon: '💳'
        },
        premium: {
            id: 'prepaid-premium',
            name: 'PaieCash Premium',
            type: 'virtual',
            fee: 9.99,
            monthlyFee: 2.99,
            cashback: 7,
            maxBalance: 15000,
            features: ['Paiements mondiaux', 'Assurance achat', '7% cashback', 'Lounge aéroport'],
            color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            icon: '💎'
        },
        physical: {
            id: 'prepaid-physical',
            name: 'PaieCash Physique',
            type: 'physical',
            fee: 4.99,
            monthlyFee: 0,
            cashback: 5,
            maxBalance: 10000,
            deliveryTime: '5-7 jours',
            features: ['Carte physique', 'Paiements en magasin', 'Retrait ATM', '5% cashback'],
            color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            icon: '🎫'
        }
    },
    
    // Modèles de cartes par club (générées dynamiquement)
    clubCardTemplate: {
        fee: 0,
        monthlyFee: 0,
        cashback: 10, // 10% cashback pour les cartes club
        maxBalance: 20000,
        features: [
            'Design aux couleurs du club',
            '10% cashback sur achats club',
            'Accès boutique exclusive',
            'Points de fidélité doublés',
            'Offres VIP'
        ]
    }
};

/**
 * Classe pour gérer les cartes prépayées
 */
class PaieCashPrepaidCardManager {
    constructor(clubId = null, federationId = null) {
        this.clubId = clubId;
        this.federationId = federationId;
        this.userCards = [];
        this.initialized = false;
    }

    /**
     * Initialise le gestionnaire de cartes
     */
    async initialize() {
        try {
            console.log('🎫 Initialisation PaieCash Prepaid Cards...');
            
            // Charger les cartes de l'utilisateur
            this.userCards = this.loadUserCards();
            this.initialized = true;
            
            console.log(`✅ ${this.userCards.length} carte(s) chargée(s)`);
            return true;
        } catch (error) {
            console.error('❌ Erreur initialisation cartes:', error);
            return false;
        }
    }

    /**
     * Charge les cartes de l'utilisateur depuis localStorage
     */
    loadUserCards() {
        const userId = this.getUserId();
        const cardsData = localStorage.getItem(`cards_${userId}`);
        return cardsData ? JSON.parse(cardsData) : [];
    }

    /**
     * Sauvegarde les cartes de l'utilisateur
     */
    saveUserCards() {
        const userId = this.getUserId();
        localStorage.setItem(`cards_${userId}`, JSON.stringify(this.userCards));
    }

    /**
     * Obtient l'ID utilisateur
     */
    getUserId() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', userId);
        }
        return userId;
    }

    /**
     * Génère une carte pour un club spécifique
     */
    generateClubCard(clubData) {
        const template = PAIECASH_PREPAID_CARDS.clubCardTemplate;
        
        return {
            id: `prepaid-club-${clubData.id}`,
            name: `Carte ${clubData.nom}`,
            type: 'club',
            clubId: clubData.id,
            clubName: clubData.nom,
            clubLogo: clubData.logo,
            clubColors: clubData.couleurs || ['#10b981', '#8b5cf6'],
            fee: template.fee,
            monthlyFee: template.monthlyFee,
            cashback: template.cashback,
            maxBalance: template.maxBalance,
            features: template.features,
            color: `linear-gradient(135deg, ${clubData.couleurs ? clubData.couleurs[0] : '#10b981'} 0%, ${clubData.couleurs ? clubData.couleurs[1] : '#8b5cf6'} 100%)`,
            icon: '⚽'
        };
    }

    /**
     * Crée une nouvelle carte prépayée
     */
    async createCard(cardType, initialBalance = 0, clubData = null) {
        if (!this.initialized) {
            await this.initialize();
        }

        let cardConfig;

        // Carte club
        if (cardType === 'club' && clubData) {
            cardConfig = this.generateClubCard(clubData);
        } 
        // Carte universelle
        else if (PAIECASH_PREPAID_CARDS.universal[cardType]) {
            cardConfig = PAIECASH_PREPAID_CARDS.universal[cardType];
        } 
        else {
            throw new Error('Type de carte invalide');
        }

        const newCard = {
            ...cardConfig,
            cardNumber: this.generateCardNumber(),
            cvv: this.generateCVV(),
            expiryDate: this.generateExpiryDate(),
            balance: initialBalance,
            status: 'active',
            createdAt: new Date().toISOString(),
            transactions: []
        };

        this.userCards.push(newCard);
        this.saveUserCards();

        console.log(`✅ Carte créée: ${newCard.name}`);
        return newCard;
    }

    /**
     * Génère un numéro de carte
     */
    generateCardNumber() {
        const prefix = '5468'; // Bin PaieCash
        let number = prefix;
        
        for (let i = 0; i < 12; i++) {
            number += Math.floor(Math.random() * 10);
        }
        
        return number.match(/.{1,4}/g).join(' ');
    }

    /**
     * Génère un CVV
     */
    generateCVV() {
        return Math.floor(100 + Math.random() * 900).toString();
    }

    /**
     * Génère une date d'expiration (3 ans)
     */
    generateExpiryDate() {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 3);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        return `${month}/${year}`;
    }

    /**
     * Affiche le catalogue de cartes disponibles
     */
    showCardCatalog(clubData = null) {
        const html = this.generateCardCatalogHTML(clubData);
        
        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);

        this.attachCardCatalogEvents();
    }

    /**
     * Génère le HTML du catalogue de cartes
     */
    generateCardCatalogHTML(clubData) {
        const universalCards = Object.values(PAIECASH_PREPAID_CARDS.universal);
        const clubCard = clubData ? this.generateClubCard(clubData) : null;

        return `
        <div id="paiecashCardCatalog" class="paiecash-modal">
            <div class="paiecash-modal-content card-catalog-modal">
                <div class="paiecash-modal-header">
                    <h2>🎫 Cartes Prépayées PaieCash</h2>
                    <button class="close-modal" onclick="closeCardCatalog()">&times;</button>
                </div>
                
                <div class="paiecash-modal-body">
                    ${clubCard ? `
                    <div class="card-section">
                        <h3>⚽ Carte Exclusive ${clubCard.clubName}</h3>
                        <div class="cards-grid">
                            ${this.generateCardHTML(clubCard, clubData)}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="card-section">
                        <h3>💳 Cartes Universelles</h3>
                        <div class="cards-grid">
                            ${universalCards.map(card => this.generateCardHTML(card)).join('')}
                        </div>
                    </div>

                    <div class="info-section">
                        <h4>📋 Avantages PaieCash</h4>
                        <ul>
                            <li>✅ Création instantanée</li>
                            <li>✅ Sans découvert autorisé</li>
                            <li>✅ Cashback sur tous les achats</li>
                            <li>✅ Compatible Apple Pay & Google Pay</li>
                            <li>✅ Sécurité maximale (3D Secure)</li>
                            <li>✅ Gestion en temps réel via l'app</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    /**
     * Génère le HTML d'une carte
     */
    generateCardHTML(card, clubData = null) {
        return `
        <div class="prepaid-card-item" data-card-type="${card.id}">
            <div class="card-visual" style="background: ${card.color};">
                <div class="card-icon">${card.icon}</div>
                ${clubData && clubData.logo ? `<img src="${clubData.logo}" class="club-logo-card" alt="${clubData.nom}">` : ''}
                <div class="card-name">${card.name}</div>
                <div class="card-number-preview">•••• •••• •••• ••••</div>
                <div class="card-cashback-badge">${card.cashback}% CASHBACK</div>
            </div>
            
            <div class="card-details">
                <div class="card-pricing">
                    ${card.fee > 0 ? `<span class="fee">Frais: ${card.fee}€</span>` : '<span class="no-fee">Gratuit</span>'}
                    ${card.monthlyFee > 0 ? `<span class="monthly-fee">${card.monthlyFee}€/mois</span>` : ''}
                    ${card.type === 'physical' ? `<span class="delivery">📦 ${card.deliveryTime}</span>` : '<span class="instant">⚡ Instantané</span>'}
                </div>
                
                <ul class="card-features-list">
                    ${card.features.map(feature => `<li>✓ ${feature}</li>`).join('')}
                </ul>
                
                <button class="order-card-btn" data-card-id="${card.id}">
                    Commander cette carte
                </button>
            </div>
        </div>
        `;
    }

    /**
     * Attache les événements au catalogue
     */
    attachCardCatalogEvents() {
        const buttons = document.querySelectorAll('.order-card-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const cardId = e.target.getAttribute('data-card-id');
                await this.orderCard(cardId);
            });
        });
    }

    /**
     * Commande une carte
     */
    async orderCard(cardType) {
        try {
            const initialBalance = 0; // L'utilisateur rechargera ensuite
            const card = await this.createCard(cardType, initialBalance, 
                this.clubId ? { id: this.clubId, nom: 'Club', logo: '' } : null
            );
            
            alert(`✅ Carte créée avec succès !\n\nNuméro: ${card.cardNumber}\nExpiration: ${card.expiryDate}\nCashback: ${card.cashback}%\n\nVotre carte est prête à être utilisée !`);
            
            this.closeCardCatalog();
        } catch (error) {
            alert(`❌ Erreur: ${error.message}`);
        }
    }

    /**
     * Ferme le catalogue de cartes
     */
    closeCardCatalog() {
        const catalog = document.getElementById('paiecashCardCatalog');
        if (catalog) {
            catalog.remove();
        }
    }
}

// Fonction globale pour fermer le catalogue
function closeCardCatalog() {
    const catalog = document.getElementById('paiecashCardCatalog');
    if (catalog) {
        catalog.remove();
    }
}

// CSS pour le catalogue de cartes
const PREPAID_CARD_STYLES = `
<style>
.card-catalog-modal {
    max-width: 1000px !important;
}

.card-section {
    margin-bottom: 40px;
}

.card-section h3 {
    color: #10b981;
    font-size: 22px;
    margin-bottom: 20px;
    font-weight: 700;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
}

.prepaid-card-item {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.prepaid-card-item:hover {
    border-color: #10b981;
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
}

.card-visual {
    position: relative;
    height: 200px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.card-icon {
    font-size: 40px;
    position: absolute;
    top: 20px;
    right: 20px;
}

.club-logo-card {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 50px;
    height: 50px;
    object-fit: contain;
}

.card-name {
    font-size: 20px;
    font-weight: 700;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.card-number-preview {
    font-family: 'Courier New', monospace;
    font-size: 18px;
    letter-spacing: 2px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.card-cashback-badge {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.95);
    color: #059669;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
}

.card-details {
    padding: 20px;
}

.card-pricing {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
}

.card-pricing span {
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
}

.fee {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
}

.no-fee {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
}

.monthly-fee {
    background: rgba(139, 92, 246, 0.2);
    color: #8b5cf6;
}

.instant {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
}

.delivery {
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
}

.card-features-list {
    list-style: none;
    padding: 0;
    margin: 16px 0;
}

.card-features-list li {
    color: #e0e0e0;
    padding: 8px 0;
    font-size: 14px;
}

.order-card-btn {
    width: 100%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    padding: 14px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.order-card-btn:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
}

.info-section {
    background: rgba(16, 185, 129, 0.1);
    border: 2px solid rgba(16, 185, 129, 0.3);
    border-radius: 12px;
    padding: 24px;
    margin-top: 24px;
}

.info-section h4 {
    color: #10b981;
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 18px;
}

.info-section ul {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 12px;
}

.info-section li {
    color: white;
    font-size: 15px;
    padding: 8px 0;
}

@media (max-width: 768px) {
    .cards-grid {
        grid-template-columns: 1fr;
    }
    
    .info-section ul {
        grid-template-columns: 1fr;
    }
}
</style>
`;

// Injecter les styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('div');
    styleSheet.innerHTML = PREPAID_CARD_STYLES;
    document.head.appendChild(styleSheet.firstElementChild);
}

console.log('✅ PaieCash Prepaid Cards System chargé');
