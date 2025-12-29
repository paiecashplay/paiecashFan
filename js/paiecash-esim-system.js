// 📱 PAIECASH eSIM SYSTEM
// eSIM pour tous les clubs et fédérations
// Plans data internationaux avec cashback

const PAIECASH_ESIM_PLANS = {
    europe: {
        id: 'esim-europe',
        name: 'Europe Pass',
        region: 'Europe',
        countries: 35,
        icon: '🇪🇺',
        plans: [
            { data: '5GB', days: 7, price: 9.99, cashback: 5 },
            { data: '10GB', days: 15, price: 17.99, cashback: 5 },
            { data: '20GB', days: 30, price: 29.99, cashback: 7 },
            { data: '50GB', days: 30, price: 49.99, cashback: 10 }
        ],
        features: ['35 pays européens', 'Activation instantanée', 'Réseau 4G/5G', 'Hotspot inclus']
    },
    world: {
        id: 'esim-world',
        name: 'World Pass',
        region: 'Mondial',
        countries: 120,
        icon: '🌍',
        plans: [
            { data: '3GB', days: 7, price: 14.99, cashback: 5 },
            { data: '10GB', days: 15, price: 34.99, cashback: 7 },
            { data: '25GB', days: 30, price: 69.99, cashback: 10 },
            { data: '50GB', days: 30, price: 99.99, cashback: 12 }
        ],
        features: ['120+ pays', 'Activation instantanée', 'Réseau 4G/5G', 'Support 24/7']
    },
    africa: {
        id: 'esim-africa',
        name: 'Africa Pass',
        region: 'Afrique',
        countries: 25,
        icon: '🌍',
        plans: [
            { data: '5GB', days: 7, price: 12.99, cashback: 5 },
            { data: '15GB', days: 15, price: 24.99, cashback: 7 },
            { data: '30GB', days: 30, price: 39.99, cashback: 10 }
        ],
        features: ['25 pays africains', 'Activation instantanée', 'Réseau 4G/5G', 'Orange & MTN']
    },
    asia: {
        id: 'esim-asia',
        name: 'Asia Pass',
        region: 'Asie',
        countries: 30,
        icon: '🌏',
        plans: [
            { data: '5GB', days: 7, price: 11.99, cashback: 5 },
            { data: '15GB', days: 15, price: 22.99, cashback: 7 },
            { data: '30GB', days: 30, price: 44.99, cashback: 10 }
        ],
        features: ['30 pays asiatiques', 'Activation instantanée', 'Réseau 4G/5G', 'Chine incluse']
    },
    americas: {
        id: 'esim-americas',
        name: 'Americas Pass',
        region: 'Amériques',
        countries: 20,
        icon: '🌎',
        plans: [
            { data: '5GB', days: 7, price: 13.99, cashback: 5 },
            { data: '15GB', days: 15, price: 25.99, cashback: 7 },
            { data: '30GB', days: 30, price: 49.99, cashback: 10 }
        ],
        features: ['20 pays', 'USA & Canada', 'Activation instantanée', 'Réseau 4G/5G']
    },
    // Plans par club (avec branding club)
    clubPlan: {
        dataBonus: 20, // +20% de data
        cashbackBonus: 5, // +5% cashback supplémentaire
        features: [
            'Data bonus +20%',
            'Cashback club exclusif',
            'Numéro de téléphone virtuel',
            'Design aux couleurs du club'
        ]
    }
};

/**
 * Classe pour gérer les eSIM
 */
class PaieCasheSIMManager {
    constructor(clubId = null, federationId = null) {
        this.clubId = clubId;
        this.federationId = federationId;
        this.usereSIMs = [];
        this.initialized = false;
    }

    /**
     * Initialise le gestionnaire eSIM
     */
    async initialize() {
        try {
            console.log('📱 Initialisation PaieCash eSIM System...');
            
            // Charger les eSIM de l'utilisateur
            this.usereSIMs = this.loadUsereSIMs();
            this.initialized = true;
            
            console.log(`✅ ${this.usereSIMs.length} eSIM(s) chargée(s)`);
            return true;
        } catch (error) {
            console.error('❌ Erreur initialisation eSIM:', error);
            return false;
        }
    }

    /**
     * Charge les eSIM de l'utilisateur
     */
    loadUsereSIMs() {
        const userId = this.getUserId();
        const esimsData = localStorage.getItem(`esims_${userId}`);
        return esimsData ? JSON.parse(esimsData) : [];
    }

    /**
     * Sauvegarde les eSIM de l'utilisateur
     */
    saveUsereSIMs() {
        const userId = this.getUserId();
        localStorage.setItem(`esims_${userId}`, JSON.stringify(this.usereSIMs));
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
     * Affiche le catalogue eSIM
     */
    showeSIMCatalog(clubData = null) {
        const html = this.generateeSIMCatalogHTML(clubData);
        
        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);

        this.attacheSIMCatalogEvents(clubData);
    }

    /**
     * Génère le HTML du catalogue eSIM
     */
    generateeSIMCatalogHTML(clubData) {
        const regions = Object.values(PAIECASH_ESIM_PLANS).filter(p => p.id);

        return `
        <div id="paiecasheSIMCatalog" class="paiecash-modal">
            <div class="paiecash-modal-content esim-catalog-modal">
                <div class="paiecash-modal-header">
                    <h2>📱 eSIM PaieCash - Connecté Partout</h2>
                    <button class="close-modal" onclick="closeeSIMCatalog()">&times;</button>
                </div>
                
                <div class="paiecash-modal-body">
                    ${clubData ? `
                    <div class="club-esim-banner">
                        <div class="club-esim-content">
                            <img src="${clubData.logo}" alt="${clubData.nom}" class="club-logo-esim">
                            <div>
                                <h3>⚽ eSIM Officielle ${clubData.nom}</h3>
                                <p>+20% de data | +5% cashback exclusif | Design club</p>
                            </div>
                        </div>
                    </div>
                    ` : ''}

                    <div class="esim-info-banner">
                        <h4>📲 Qu'est-ce qu'une eSIM ?</h4>
                        <p>Une eSIM (carte SIM électronique) vous permet d'avoir une connexion data internationale sans changer de carte physique. Activation instantanée par QR code !</p>
                    </div>

                    <div class="regions-grid">
                        ${regions.map(region => this.generateRegionHTML(region, clubData)).join('')}
                    </div>

                    <div class="esim-advantages">
                        <h4>✨ Avantages PaieCash eSIM</h4>
                        <div class="advantages-grid">
                            <div class="advantage-item">
                                <div class="advantage-icon">⚡</div>
                                <div class="advantage-text">
                                    <strong>Activation Instantanée</strong>
                                    <p>QR code reçu immédiatement</p>
                                </div>
                            </div>
                            <div class="advantage-item">
                                <div class="advantage-icon">💰</div>
                                <div class="advantage-text">
                                    <strong>Cashback Jusqu'à 12%</strong>
                                    <p>Sur chaque recharge eSIM</p>
                                </div>
                            </div>
                            <div class="advantage-item">
                                <div class="advantage-icon">📶</div>
                                <div class="advantage-text">
                                    <strong>Réseau Premium</strong>
                                    <p>4G/5G dans tous les pays</p>
                                </div>
                            </div>
                            <div class="advantage-item">
                                <div class="advantage-icon">🌍</div>
                                <div class="advantage-text">
                                    <strong>120+ Pays</strong>
                                    <p>Couverture mondiale</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    /**
     * Génère le HTML d'une région
     */
    generateRegionHTML(region, clubData) {
        return `
        <div class="esim-region-card">
            <div class="region-header">
                <div class="region-icon">${region.icon}</div>
                <div>
                    <h3>${region.name}</h3>
                    <p>${region.countries} pays • ${region.region}</p>
                </div>
            </div>

            <div class="region-plans">
                ${region.plans.map(plan => this.generatePlanHTML(plan, region.id, clubData)).join('')}
            </div>

            <div class="region-features">
                ${region.features.map(feature => `<span class="feature-tag">✓ ${feature}</span>`).join('')}
            </div>
        </div>
        `;
    }

    /**
     * Génère le HTML d'un plan
     */
    generatePlanHTML(plan, regionId, clubData) {
        // Bonus club si applicable
        const clubBonus = clubData ? PAIECASH_ESIM_PLANS.clubPlan : null;
        const finalData = clubBonus ? plan.data.replace(/(\d+)/, (match) => Math.round(parseInt(match) * 1.2)) : plan.data;
        const finalCashback = clubBonus ? plan.cashback + clubBonus.cashbackBonus : plan.cashback;

        return `
        <div class="esim-plan-item" data-region="${regionId}" data-data="${plan.data}" data-days="${plan.days}">
            <div class="plan-data">${finalData}</div>
            <div class="plan-duration">${plan.days} jours</div>
            <div class="plan-price">${plan.price}€</div>
            <div class="plan-cashback">+${finalCashback}% cashback</div>
            ${clubBonus ? '<div class="club-bonus-badge">⚽ Bonus Club</div>' : ''}
            <button class="buy-esim-btn" data-plan='${JSON.stringify({...plan, regionId, finalData, finalCashback})}'>
                Acheter
            </button>
        </div>
        `;
    }

    /**
     * Attache les événements
     */
    attacheSIMCatalogEvents(clubData) {
        const buttons = document.querySelectorAll('.buy-esim-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const planData = JSON.parse(e.target.getAttribute('data-plan'));
                await this.purchaseeSIM(planData, clubData);
            });
        });
    }

    /**
     * Achète une eSIM
     */
    async purchaseeSIM(plan, clubData = null) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            // Créer l'eSIM
            const neweSIM = {
                id: 'esim_' + Math.random().toString(36).substr(2, 12),
                regionId: plan.regionId,
                data: plan.finalData || plan.data,
                days: plan.days,
                price: plan.price,
                cashback: plan.finalCashback || plan.cashback,
                status: 'active',
                dataRemaining: plan.finalData || plan.data,
                qrCode: this.generateQRCode(),
                activationCode: this.generateActivationCode(),
                expiresAt: this.calculateExpiry(plan.days),
                clubId: clubData ? clubData.id : null,
                clubName: clubData ? clubData.nom : null,
                createdAt: new Date().toISOString()
            };

            this.usereSIMs.push(neweSIM);
            this.saveUsereSIMs();

            // Afficher le QR code
            this.showeSIMActivation(neweSIM);

            console.log(`✅ eSIM créée: ${neweSIM.id}`);
        } catch (error) {
            alert(`❌ Erreur: ${error.message}`);
        }
    }

    /**
     * Génère un QR code (simulé)
     */
    generateQRCode() {
        return `QR-${Math.random().toString(36).substr(2, 16).toUpperCase()}`;
    }

    /**
     * Génère un code d'activation
     */
    generateActivationCode() {
        return `ACT-${Math.random().toString(36).substr(2, 10).toUpperCase()}`;
    }

    /**
     * Calcule la date d'expiration
     */
    calculateExpiry(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString();
    }

    /**
     * Affiche l'écran d'activation eSIM
     */
    showeSIMActivation(esim) {
        const html = `
        <div id="esimActivationModal" class="paiecash-modal">
            <div class="paiecash-modal-content esim-activation-modal">
                <div class="paiecash-modal-header">
                    <h2>📱 Votre eSIM est prête !</h2>
                    <button class="close-modal" onclick="closeeSIMActivation()">&times;</button>
                </div>
                
                <div class="paiecash-modal-body">
                    <div class="activation-success">
                        <div class="success-icon">✅</div>
                        <h3>eSIM Activée avec Succès</h3>
                        <p>${esim.data} • ${esim.days} jours</p>
                    </div>

                    <div class="qr-code-section">
                        <div class="qr-code-placeholder">
                            <div class="qr-pattern"></div>
                            <p class="qr-label">${esim.qrCode}</p>
                        </div>
                        <p class="qr-instructions">Scannez ce QR code depuis les réglages de votre téléphone</p>
                    </div>

                    <div class="activation-details">
                        <h4>📋 Informations d'Activation</h4>
                        <div class="detail-row">
                            <span>Code d'activation:</span>
                            <strong>${esim.activationCode}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Expire le:</span>
                            <strong>${new Date(esim.expiresAt).toLocaleDateString('fr-FR')}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Cashback gagné:</span>
                            <strong class="cashback-earned">+${esim.cashback}% (${(esim.price * esim.cashback / 100).toFixed(2)}€)</strong>
                        </div>
                    </div>

                    <div class="activation-guide">
                        <h4>🔧 Comment activer ?</h4>
                        <ol>
                            <li>Ouvrez <strong>Réglages</strong> sur votre téléphone</li>
                            <li>Allez dans <strong>Réseau mobile</strong> ou <strong>Données cellulaires</strong></li>
                            <li>Sélectionnez <strong>Ajouter un forfait</strong></li>
                            <li>Scannez le QR code ci-dessus</li>
                            <li>Suivez les instructions à l'écran</li>
                        </ol>
                    </div>

                    <button class="download-qr-btn" onclick="alert('QR Code téléchargé !')">
                        📥 Télécharger le QR Code
                    </button>
                </div>
            </div>
        </div>
        `;

        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);

        // Fermer le catalogue
        this.closeeSIMCatalog();
    }

    /**
     * Ferme le catalogue eSIM
     */
    closeeSIMCatalog() {
        const catalog = document.getElementById('paiecasheSIMCatalog');
        if (catalog) {
            catalog.remove();
        }
    }
}

// Fonctions globales
function closeeSIMCatalog() {
    const catalog = document.getElementById('paiecasheSIMCatalog');
    if (catalog) {
        catalog.remove();
    }
}

function closeeSIMActivation() {
    const modal = document.getElementById('esimActivationModal');
    if (modal) {
        modal.remove();
    }
}

// CSS pour le système eSIM
const ESIM_STYLES = `
<style>
.esim-catalog-modal, .esim-activation-modal {
    max-width: 1100px !important;
}

.club-esim-banner {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 24px;
}

.club-esim-content {
    display: flex;
    align-items: center;
    gap: 20px;
    color: white;
}

.club-logo-esim {
    width: 60px;
    height: 60px;
    object-fit: contain;
}

.club-esim-content h3 {
    margin: 0 0 8px 0;
    font-size: 22px;
}

.club-esim-content p {
    margin: 0;
    opacity: 0.9;
}

.esim-info-banner {
    background: rgba(59, 130, 246, 0.1);
    border: 2px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
}

.esim-info-banner h4 {
    color: #3b82f6;
    margin: 0 0 12px 0;
}

.esim-info-banner p {
    color: #e0e0e0;
    margin: 0;
    line-height: 1.6;
}

.regions-grid {
    display: grid;
    gap: 24px;
    margin-bottom: 32px;
}

.esim-region-card {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    transition: all 0.3s ease;
}

.esim-region-card:hover {
    border-color: #10b981;
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
}

.region-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
}

.region-icon {
    font-size: 48px;
}

.region-header h3 {
    color: white;
    margin: 0;
    font-size: 22px;
}

.region-header p {
    color: #a0a0a0;
    margin: 4px 0 0 0;
}

.region-plans {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
}

.esim-plan-item {
    background: rgba(16, 185, 129, 0.1);
    border: 2px solid rgba(16, 185, 129, 0.3);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    transition: all 0.3s ease;
    position: relative;
}

.esim-plan-item:hover {
    background: rgba(16, 185, 129, 0.2);
    transform: translateY(-3px);
}

.plan-data {
    font-size: 28px;
    font-weight: 900;
    color: #10b981;
    margin-bottom: 4px;
}

.plan-duration {
    color: #a0a0a0;
    font-size: 13px;
    margin-bottom: 8px;
}

.plan-price {
    font-size: 20px;
    font-weight: 700;
    color: white;
    margin-bottom: 4px;
}

.plan-cashback {
    color: #8b5cf6;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 12px;
}

.club-bonus-badge {
    position: absolute;
    top: -10px;
    right: -10px;
    background: #f59e0b;
    color: white;
    font-size: 10px;
    padding: 4px 8px;
    border-radius: 12px;
    font-weight: 700;
}

.buy-esim-btn {
    width: 100%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    padding: 10px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.buy-esim-btn:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-2px);
}

.region-features {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.feature-tag {
    background: rgba(139, 92, 246, 0.2);
    color: #8b5cf6;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.esim-advantages {
    background: rgba(139, 92, 246, 0.1);
    border: 2px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    padding: 24px;
}

.esim-advantages h4 {
    color: #8b5cf6;
    margin: 0 0 20px 0;
    font-size: 18px;
}

.advantages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
}

.advantage-item {
    display: flex;
    gap: 12px;
}

.advantage-icon {
    font-size: 32px;
    min-width: 40px;
}

.advantage-text strong {
    color: white;
    display: block;
    margin-bottom: 4px;
}

.advantage-text p {
    color: #a0a0a0;
    margin: 0;
    font-size: 13px;
}

/* Activation Modal */
.activation-success {
    text-align: center;
    padding: 32px;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 12px;
    margin-bottom: 24px;
}

.success-icon {
    font-size: 64px;
    margin-bottom: 16px;
}

.activation-success h3 {
    color: white;
    margin: 0 0 8px 0;
}

.qr-code-section {
    text-align: center;
    margin-bottom: 24px;
}

.qr-code-placeholder {
    width: 250px;
    height: 250px;
    margin: 0 auto 16px;
    background: white;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.qr-pattern {
    width: 200px;
    height: 200px;
    background: repeating-linear-gradient(90deg, #000 0px, #000 10px, #fff 10px, #fff 20px),
                repeating-linear-gradient(0deg, #000 0px, #000 10px, #fff 10px, #fff 20px);
    background-blend-mode: multiply;
}

.qr-label {
    color: #333;
    font-size: 10px;
    margin-top: 8px;
    font-family: monospace;
}

.qr-instructions {
    color: #a0a0a0;
    font-size: 14px;
}

.activation-details {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
}

.activation-details h4 {
    color: white;
    margin: 0 0 16px 0;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row:last-child {
    border-bottom: none;
}

.detail-row span {
    color: #a0a0a0;
}

.detail-row strong {
    color: white;
}

.cashback-earned {
    color: #10b981 !important;
}

.activation-guide {
    background: rgba(59, 130, 246, 0.1);
    border: 2px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
}

.activation-guide h4 {
    color: #3b82f6;
    margin: 0 0 16px 0;
}

.activation-guide ol {
    color: #e0e0e0;
    padding-left: 20px;
}

.activation-guide li {
    margin: 8px 0;
    line-height: 1.6;
}

.download-qr-btn {
    width: 100%;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border: none;
    padding: 16px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.download-qr-btn:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .regions-grid {
        grid-template-columns: 1fr;
    }
    
    .advantages-grid {
        grid-template-columns: 1fr;
    }
}
</style>
`;

// Injecter les styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('div');
    styleSheet.innerHTML = ESIM_STYLES;
    document.head.appendChild(styleSheet.firstElementChild);
}

console.log('✅ PaieCash eSIM System chargé');
