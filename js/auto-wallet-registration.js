// 🎟️ AUTO WALLET REGISTRATION SYSTEM
// Inscription automatique avec création du wallet PaieCash

const AUTO_WALLET_CONFIG = {
    welcomeBonus: 10, // 10 PCC offerts à l'inscription
    referralBonus: 5, // 5 PCC pour le parrain
    clubTokenBonus: 100 // 100 tokens du club à l'inscription
};

/**
 * Classe pour gérer l'inscription automatique
 */
class AutoWalletRegistration {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialise le système d'inscription
     */
    async initialize() {
        try {
            console.log('🎟️ Initialisation Auto Wallet Registration...');
            
            // Vérifier si l'utilisateur est déjà enregistré
            const userId = localStorage.getItem('userId');
            const isRegistered = localStorage.getItem('userRegistered');
            
            if (!userId || !isRegistered) {
                // Créer automatiquement un wallet
                await this.autoCreateWallet();
            }
            
            this.initialized = true;
            console.log('✅ Auto Wallet Registration initialisé');
            return true;
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            return false;
        }
    }

    /**
     * Crée automatiquement un wallet pour l'utilisateur
     */
    async autoCreateWallet() {
        console.log('🎯 Création automatique du wallet...');

        // Générer un ID utilisateur unique
        const userId = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
        
        // Créer le wallet
        const wallet = {
            userId: userId,
            balance: AUTO_WALLET_CONFIG.welcomeBonus, // Bonus de bienvenue
            currency: 'PCC',
            clubTokens: {},
            cryptoBalances: {
                BTC: 0,
                ETH: 0,
                USDC: 0,
                USDT: 0
            },
            cards: [],
            esims: [],
            transactions: [],
            createdAt: new Date().toISOString(),
            welcomeBonusReceived: true
        };

        // Sauvegarder dans localStorage
        localStorage.setItem('userId', userId);
        localStorage.setItem(`wallet_${userId}`, JSON.stringify(wallet));
        localStorage.setItem('userRegistered', 'true');
        
        console.log(`✅ Wallet créé automatiquement ! Bonus: ${AUTO_WALLET_CONFIG.welcomeBonus} PCC`);
        
        // Afficher le message de bienvenue
        this.showWelcomeMessage(wallet);
        
        return wallet;
    }

    /**
     * Inscription manuelle avec email/password
     */
    async registerUser(email, password, clubId = null) {
        console.log(`📝 Inscription utilisateur: ${email}`);

        // Vérifier si l'email existe déjà
        const existingUser = localStorage.getItem(`user_email_${email}`);
        if (existingUser) {
            throw new Error('Cet email est déjà enregistré');
        }

        // Créer un ID utilisateur
        const userId = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
        
        // Créer le profil utilisateur
        const userProfile = {
            userId: userId,
            email: email,
            passwordHash: this.hashPassword(password), // En production, utiliser bcrypt
            clubId: clubId,
            createdAt: new Date().toISOString(),
            verified: false
        };

        // Créer le wallet automatiquement
        const wallet = {
            userId: userId,
            balance: AUTO_WALLET_CONFIG.welcomeBonus,
            currency: 'PCC',
            clubTokens: clubId ? { [clubId]: AUTO_WALLET_CONFIG.clubTokenBonus } : {},
            cryptoBalances: {
                BTC: 0,
                ETH: 0,
                USDC: 0,
                USDT: 0
            },
            cards: [],
            esims: [],
            transactions: [
                {
                    id: 'tx_welcome',
                    type: 'bonus',
                    amount: AUTO_WALLET_CONFIG.welcomeBonus,
                    description: 'Bonus de bienvenue PaieCash',
                    timestamp: new Date().toISOString()
                }
            ],
            createdAt: new Date().toISOString(),
            welcomeBonusReceived: true
        };

        // Si un club est sélectionné, ajouter la transaction des tokens
        if (clubId) {
            wallet.transactions.push({
                id: 'tx_club_tokens',
                type: 'club_bonus',
                amount: AUTO_WALLET_CONFIG.clubTokenBonus,
                description: `Tokens de club offerts`,
                clubId: clubId,
                timestamp: new Date().toISOString()
            });
        }

        // Sauvegarder
        localStorage.setItem('userId', userId);
        localStorage.setItem(`user_email_${email}`, userId);
        localStorage.setItem(`user_profile_${userId}`, JSON.stringify(userProfile));
        localStorage.setItem(`wallet_${userId}`, JSON.stringify(wallet));
        localStorage.setItem('userRegistered', 'true');
        localStorage.setItem('userEmail', email);
        
        console.log(`✅ Inscription réussie ! Wallet créé avec ${AUTO_WALLET_CONFIG.welcomeBonus} PCC`);
        
        // Afficher le message de bienvenue
        this.showWelcomeMessage(wallet, userProfile);
        
        return { user: userProfile, wallet: wallet };
    }

    /**
     * Connexion utilisateur
     */
    async loginUser(email, password) {
        console.log(`🔐 Connexion: ${email}`);

        // Récupérer l'ID utilisateur
        const userId = localStorage.getItem(`user_email_${email}`);
        if (!userId) {
            throw new Error('Email ou mot de passe incorrect');
        }

        // Récupérer le profil
        const userProfile = JSON.parse(localStorage.getItem(`user_profile_${userId}`) || '{}');
        
        // Vérifier le mot de passe
        const passwordMatch = this.verifyPassword(password, userProfile.passwordHash);
        if (!passwordMatch) {
            throw new Error('Email ou mot de passe incorrect');
        }

        // Récupérer le wallet
        const wallet = JSON.parse(localStorage.getItem(`wallet_${userId}`) || '{}');

        // Mettre à jour la session
        localStorage.setItem('userId', userId);
        localStorage.setItem('userRegistered', 'true');
        localStorage.setItem('userEmail', email);

        console.log('✅ Connexion réussie !');
        
        return { user: userProfile, wallet: wallet };
    }

    /**
     * Hash simple du mot de passe (en production, utiliser bcrypt)
     */
    hashPassword(password) {
        // Simulation simple - en production, utiliser bcrypt ou argon2
        return btoa(password + '_paiecash_salt');
    }

    /**
     * Vérifie le mot de passe
     */
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    /**
     * Affiche le message de bienvenue
     */
    showWelcomeMessage(wallet, userProfile = null) {
        const html = `
        <div id="welcomeModal" class="paiecash-modal">
            <div class="paiecash-modal-content welcome-modal">
                <div class="welcome-header">
                    <div class="welcome-icon">🎉</div>
                    <h2>Bienvenue sur PaieCash !</h2>
                    <p>${userProfile ? `Bonjour ${userProfile.email} !` : 'Votre wallet a été créé automatiquement'}</p>
                </div>
                
                <div class="welcome-body">
                    <div class="wallet-created-card">
                        <div class="card-icon">💼</div>
                        <h3>Votre Wallet PaieCash</h3>
                        <div class="bonus-amount">${AUTO_WALLET_CONFIG.welcomeBonus} PCC</div>
                        <p class="bonus-label">Bonus de bienvenue offert !</p>
                    </div>

                    ${Object.keys(wallet.clubTokens).length > 0 ? `
                    <div class="club-tokens-card">
                        <div class="card-icon">⚽</div>
                        <h3>Tokens de Club</h3>
                        <div class="bonus-amount">${Object.values(wallet.clubTokens)[0]} Tokens</div>
                        <p class="bonus-label">Pour supporter votre club !</p>
                    </div>
                    ` : ''}

                    <div class="welcome-features">
                        <h4>🎁 Ce que vous pouvez faire maintenant :</h4>
                        <div class="features-grid">
                            <div class="feature-item">
                                <div class="feature-icon">💳</div>
                                <p>Commander une carte prépayée</p>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">📱</div>
                                <p>Acheter une eSIM</p>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">🎫</div>
                                <p>Acheter des billets</p>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">🛍️</div>
                                <p>Faire du shopping</p>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">💰</div>
                                <p>Gagner du cashback</p>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">⚡</div>
                                <p>Paiements instantanés</p>
                            </div>
                        </div>
                    </div>

                    <button class="start-exploring-btn" onclick="closeWelcomeModal()">
                        Commencer à explorer 🚀
                    </button>
                </div>
            </div>
        </div>
        `;

        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);
    }

    /**
     * Affiche le formulaire d'inscription
     */
    showRegistrationForm(clubId = null) {
        const html = `
        <div id="registrationModal" class="paiecash-modal">
            <div class="paiecash-modal-content registration-modal">
                <div class="paiecash-modal-header">
                    <h2>📝 Inscription PaieCash</h2>
                    <button class="close-modal" onclick="closeRegistrationModal()">&times;</button>
                </div>
                
                <div class="paiecash-modal-body">
                    <form id="registrationForm" class="registration-form">
                        <div class="form-group">
                            <label for="regEmail">Email</label>
                            <input type="email" id="regEmail" placeholder="votre@email.com" required>
                        </div>

                        <div class="form-group">
                            <label for="regPassword">Mot de passe</label>
                            <input type="password" id="regPassword" placeholder="••••••••" required>
                        </div>

                        <div class="form-group">
                            <label for="regPasswordConfirm">Confirmer le mot de passe</label>
                            <input type="password" id="regPasswordConfirm" placeholder="••••••••" required>
                        </div>

                        <div class="bonus-info">
                            <h4>🎁 Bonus d'inscription :</h4>
                            <ul>
                                <li>✓ ${AUTO_WALLET_CONFIG.welcomeBonus} PCC offerts</li>
                                ${clubId ? `<li>✓ ${AUTO_WALLET_CONFIG.clubTokenBonus} Tokens de club offerts</li>` : ''}
                                <li>✓ Wallet créé automatiquement</li>
                                <li>✓ Sans frais</li>
                            </ul>
                        </div>

                        <button type="submit" class="register-btn">
                            S'inscrire et créer mon wallet 🚀
                        </button>

                        <div class="login-link">
                            Déjà inscrit ? <a href="#" onclick="showLoginForm(); return false;">Se connecter</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        `;

        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);

        // Attacher l'événement submit
        document.getElementById('registrationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const passwordConfirm = document.getElementById('regPasswordConfirm').value;

            if (password !== passwordConfirm) {
                alert('❌ Les mots de passe ne correspondent pas');
                return;
            }

            try {
                await this.registerUser(email, password, clubId);
                this.closeRegistrationModal();
            } catch (error) {
                alert(`❌ ${error.message}`);
            }
        });
    }

    /**
     * Ferme le modal de bienvenue
     */
    closeRegistrationModal() {
        const modal = document.getElementById('registrationModal');
        if (modal) {
            modal.remove();
        }
    }
}

// Fonctions globales
function closeWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.remove();
    }
}

function closeRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    if (modal) {
        modal.remove();
    }
}

function showLoginForm() {
    // À implémenter
    alert('Formulaire de connexion - À venir');
}

// CSS pour l'inscription
const REGISTRATION_STYLES = `
<style>
.welcome-modal, .registration-modal {
    max-width: 600px !important;
}

.welcome-header {
    text-align: center;
    padding: 32px 24px 24px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 20px 20px 0 0;
    color: white;
}

.welcome-icon {
    font-size: 72px;
    margin-bottom: 16px;
}

.welcome-header h2 {
    margin: 0 0 8px 0;
    font-size: 28px;
}

.welcome-header p {
    margin: 0;
    opacity: 0.95;
    font-size: 16px;
}

.welcome-body {
    padding: 32px 24px;
}

.wallet-created-card, .club-tokens-card {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
    border: 2px solid rgba(16, 185, 129, 0.3);
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    margin-bottom: 24px;
}

.card-icon {
    font-size: 48px;
    margin-bottom: 12px;
}

.wallet-created-card h3, .club-tokens-card h3 {
    color: white;
    margin: 0 0 12px 0;
    font-size: 20px;
}

.bonus-amount {
    font-size: 36px;
    font-weight: 900;
    background: linear-gradient(135deg, #10b981 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
}

.bonus-label {
    color: #10b981;
    font-weight: 600;
    margin: 0;
}

.welcome-features {
    margin-bottom: 24px;
}

.welcome-features h4 {
    color: white;
    margin-bottom: 20px;
    font-size: 18px;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.feature-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    transition: all 0.3s ease;
}

.feature-item:hover {
    background: rgba(16, 185, 129, 0.1);
    border-color: #10b981;
    transform: translateY(-3px);
}

.feature-icon {
    font-size: 32px;
    margin-bottom: 8px;
}

.feature-item p {
    color: #e0e0e0;
    margin: 0;
    font-size: 13px;
    line-height: 1.4;
}

.start-exploring-btn {
    width: 100%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    padding: 18px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 6px 25px rgba(16, 185, 129, 0.4);
}

.start-exploring-btn:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(16, 185, 129, 0.6);
}

/* Registration Form */
.registration-form {
    max-width: 100%;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    color: #e0e0e0;
    margin-bottom: 8px;
    font-weight: 600;
}

.form-group input {
    width: 100%;
    padding: 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: white;
    font-size: 15px;
    transition: all 0.3s ease;
}

.form-group input:focus {
    outline: none;
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.1);
}

.bonus-info {
    background: rgba(16, 185, 129, 0.1);
    border: 2px solid rgba(16, 185, 129, 0.3);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
}

.bonus-info h4 {
    color: #10b981;
    margin: 0 0 12px 0;
}

.bonus-info ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.bonus-info li {
    color: white;
    padding: 6px 0;
    font-size: 14px;
}

.register-btn {
    width: 100%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    padding: 16px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 16px;
}

.register-btn:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-2px);
}

.login-link {
    text-align: center;
    color: #a0a0a0;
    font-size: 14px;
}

.login-link a {
    color: #10b981;
    text-decoration: none;
    font-weight: 600;
}

.login-link a:hover {
    text-decoration: underline;
}

@media (max-width: 768px) {
    .features-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
`;

// Injecter les styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('div');
    styleSheet.innerHTML = REGISTRATION_STYLES;
    document.head.appendChild(styleSheet.firstElementChild);
}

// Auto-initialisation au chargement de la page
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        const autoWallet = new AutoWalletRegistration();
        await autoWallet.initialize();
        
        // Rendre l'instance disponible globalement
        window.autoWalletRegistration = autoWallet;
    });
}

console.log('✅ Auto Wallet Registration System chargé');
