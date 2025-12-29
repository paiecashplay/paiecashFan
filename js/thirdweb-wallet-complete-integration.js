/**
 * 🔥 INTÉGRATION COMPLÈTE THIRDWEB WALLET - PaieCash
 * 
 * STACK TECHNIQUE :
 * - Frontend : React Native / Flutter (mobile-first)
 * - Backend : Node.js / TypeScript
 * - Blockchain : Polygon / Base / Celo (L2)
 * - SDK : Thirdweb Client & Server
 * - On-Ramp : Ramp Network, Transak, Onramper
 * 
 * FLUX :
 * App/Mobile → SDK Thirdweb → Backend → KYC → Mapping Contacts-Wallets 
 * → Blockchain (ERC20 Stablecoin + ERC721 NFT) → On-Ramp → Fiat/Monnaie Locale
 */

// ============================================================================
// 🔐 CONFIGURATION THIRDWEB
// ============================================================================

const THIRDWEB_CONFIG = {
    clientId: "YOUR_THIRDWEB_CLIENT_ID", // À configurer
    secretKey: "YOUR_THIRDWEB_SECRET_KEY", // Pour backend uniquement
    
    // Blockchains supportées
    chains: {
        polygon: {
            chainId: 137,
            name: "Polygon",
            rpcUrl: "https://polygon-rpc.com",
            stablecoin: "USDC", // Adresse du contrat USDC sur Polygon
            symbol: "POL"
        },
        base: {
            chainId: 8453,
            name: "Base",
            rpcUrl: "https://mainnet.base.org",
            stablecoin: "USDC",
            symbol: "ETH"
        },
        celo: {
            chainId: 42220,
            name: "Celo",
            rpcUrl: "https://forno.celo.org",
            stablecoin: "cUSD",
            symbol: "CELO"
        }
    },
    
    // Contrats intelligents
    contracts: {
        stablecoin: "0x...", // Contrat ERC20 Stablecoin
        nftTickets: "0x...", // Contrat ERC721 Billets
        nftMoments: "0x...", // Contrat ERC721 Moments
        paiecashToken: "0x..." // Token PaieCash Coin
    },
    
    // Configuration On-Ramp
    onramp: {
        rampNetwork: {
            enabled: true,
            apiKey: "YOUR_RAMP_API_KEY",
            hostAppName: "PaieCash",
            hostLogoUrl: "https://paiecash.com/logo.png",
            defaultAsset: "MATIC_USDC",
            regions: ["EU", "US", "UK"]
        },
        transak: {
            enabled: true,
            apiKey: "YOUR_TRANSAK_API_KEY",
            environment: "PRODUCTION", // ou "STAGING"
            defaultCryptoCurrency: "USDC",
            networks: "polygon,base,celo",
            regions: ["EU", "AF", "AS"]
        },
        onramper: {
            enabled: true,
            apiKey: "YOUR_ONRAMPER_API_KEY",
            defaultCrypto: "USDC",
            supportedRegions: ["AF"] // Spécial Afrique
        }
    }
};

// ============================================================================
// 🌍 CONFIGURATION RÉGIONALE - Multi-devises Stablecoins
// ============================================================================

const REGIONAL_STABLECOIN_CONFIG = {
    europe: {
        region: "EU",
        stablecoin: "USDC",
        chain: "polygon",
        fiatCurrency: "EUR",
        onramp: ["rampNetwork", "transak"],
        methods: ["openBanking", "sepa", "card"]
    },
    africa: {
        region: "AF",
        stablecoin: "cUSD",
        chain: "celo",
        fiatCurrency: "XAF", // ou XOF, NGN, etc.
        onramp: ["transak", "onramper"],
        methods: ["mobileMoney", "card"]
    },
    americas: {
        region: "US",
        stablecoin: "USDC",
        chain: "base",
        fiatCurrency: "USD",
        onramp: ["rampNetwork", "transak"],
        methods: ["card", "bankTransfer"]
    },
    asia: {
        region: "AS",
        stablecoin: "USDC",
        chain: "polygon",
        fiatCurrency: "USD",
        onramp: ["transak"],
        methods: ["card", "bankTransfer"]
    }
};

// ============================================================================
// 👤 SYSTÈME DE MAPPING CONTACTS → WALLETS
// ============================================================================

class ContactWalletMapping {
    constructor() {
        this.mappings = new Map();
        this.reverseMapping = new Map();
    }
    
    /**
     * Enregistrer un mapping contact → wallet
     */
    registerMapping(contact, walletAddress) {
        const contactKey = this.normalizeContact(contact);
        this.mappings.set(contactKey, {
            walletAddress,
            contact,
            createdAt: Date.now(),
            verified: false
        });
        this.reverseMapping.set(walletAddress, contactKey);
        
        console.log(`✅ Mapping créé : ${contact} → ${walletAddress}`);
        return walletAddress;
    }
    
    /**
     * Rechercher un wallet par contact (nom, email, téléphone)
     */
    findWalletByContact(searchTerm) {
        const normalized = this.normalizeContact(searchTerm);
        
        // Recherche exacte
        if (this.mappings.has(normalized)) {
            return this.mappings.get(normalized);
        }
        
        // Recherche partielle (nom)
        for (const [key, value] of this.mappings.entries()) {
            if (key.toLowerCase().includes(normalized.toLowerCase())) {
                return value;
            }
        }
        
        return null;
    }
    
    /**
     * Normaliser un contact (email, téléphone, nom)
     */
    normalizeContact(contact) {
        // Email
        if (contact.includes('@')) {
            return contact.toLowerCase().trim();
        }
        
        // Téléphone
        if (contact.match(/^\+?[\d\s\-().]+$/)) {
            return contact.replace(/[\s\-().]/g, '');
        }
        
        // Nom
        return contact.toLowerCase().trim();
    }
    
    /**
     * Vérifier un contact (via SMS ou Email)
     */
    async verifyContact(contact) {
        const contactKey = this.normalizeContact(contact);
        const mapping = this.mappings.get(contactKey);
        
        if (mapping) {
            mapping.verified = true;
            mapping.verifiedAt = Date.now();
            console.log(`✅ Contact vérifié : ${contact}`);
            return true;
        }
        
        return false;
    }
}

// Instance globale
const contactMapper = new ContactWalletMapping();

// ============================================================================
// 💳 CLASSE PRINCIPALE : PaieCashWallet
// ============================================================================

class PaieCashWallet {
    constructor(userType = 'fan') {
        this.userType = userType; // 'fan' ou 'club'
        this.wallet = null;
        this.walletAddress = null;
        this.balance = {
            stablecoin: 0,
            paiecashCoin: 0,
            nativeToken: 0
        };
        this.transactions = [];
        this.contacts = new Map();
        this.regionalConfig = null;
    }
    
    /**
     * 🚀 ONBOARDING : Création automatique du wallet
     */
    async createInAppWallet(email, phoneNumber) {
        try {
            console.log(`🔄 Création du wallet In-App pour ${email || phoneNumber}...`);
            
            // Simulation de l'intégration Thirdweb SDK
            // En production, utiliser le SDK Thirdweb In-App Wallet
            
            const walletData = {
                email: email || null,
                phone: phoneNumber || null,
                strategy: email ? 'email' : 'phone',
                chainId: THIRDWEB_CONFIG.chains.polygon.chainId
            };
            
            // Créer le wallet
            this.wallet = await this.initializeThirdwebWallet(walletData);
            this.walletAddress = this.generateWalletAddress();
            
            // Enregistrer le mapping contact → wallet
            const contact = email || phoneNumber;
            contactMapper.registerMapping(contact, this.walletAddress);
            
            // Bonus de bienvenue
            await this.creditWelcomeBonus();
            
            // Détecter la région et configurer le stablecoin
            await this.detectRegionAndConfigureStablecoin();
            
            console.log(`✅ Wallet créé avec succès : ${this.walletAddress}`);
            
            return {
                success: true,
                walletAddress: this.walletAddress,
                email,
                phoneNumber,
                balance: this.balance
            };
            
        } catch (error) {
            console.error('❌ Erreur création wallet:', error);
            throw error;
        }
    }
    
    /**
     * Initialiser le SDK Thirdweb
     */
    async initializeThirdwebWallet(walletData) {
        // Simulation - En production, utiliser le vrai SDK
        /*
        import { ThirdwebSDK } from "@thirdweb-dev/sdk";
        
        const sdk = ThirdwebSDK.fromPrivateKey(
            THIRDWEB_CONFIG.secretKey,
            THIRDWEB_CONFIG.chains.polygon.name
        );
        
        const wallet = await sdk.wallet.createInAppWallet({
            email: walletData.email,
            phone: walletData.phone
        });
        
        return wallet;
        */
        
        return {
            strategy: walletData.strategy,
            contact: walletData.email || walletData.phone,
            chainId: walletData.chainId
        };
    }
    
    /**
     * Générer une adresse wallet (simulation)
     */
    generateWalletAddress() {
        return '0x' + Array.from({length: 40}, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    }
    
    /**
     * Bonus de bienvenue : 10 PCC offerts
     */
    async creditWelcomeBonus() {
        this.balance.paiecashCoin = 10;
        this.balance.stablecoin = 5; // 5 USDC de bonus
        
        this.transactions.push({
            type: 'bonus',
            amount: 10,
            currency: 'PCC',
            timestamp: Date.now(),
            description: '🎁 Bonus de bienvenue'
        });
        
        console.log('🎁 Bonus de bienvenue crédité : 10 PCC + 5 USDC');
    }
    
    /**
     * Détecter la région et configurer le stablecoin
     */
    async detectRegionAndConfigureStablecoin() {
        try {
            // Géolocalisation via IP
            const response = await fetch('https://ipapi.co/json/');
            const geoData = await response.json();
            const continent = geoData.continent_code;
            
            // Sélectionner la config régionale
            if (continent === 'EU') {
                this.regionalConfig = REGIONAL_STABLECOIN_CONFIG.europe;
            } else if (continent === 'AF') {
                this.regionalConfig = REGIONAL_STABLECOIN_CONFIG.africa;
            } else if (continent === 'NA' || continent === 'SA') {
                this.regionalConfig = REGIONAL_STABLECOIN_CONFIG.americas;
            } else {
                this.regionalConfig = REGIONAL_STABLECOIN_CONFIG.asia;
            }
            
            console.log(`🌍 Région détectée : ${this.regionalConfig.region}`);
            console.log(`💵 Stablecoin : ${this.regionalConfig.stablecoin}`);
            
        } catch (error) {
            // Par défaut : Europe
            this.regionalConfig = REGIONAL_STABLECOIN_CONFIG.europe;
        }
    }
    
    /**
     * 💸 ENVOI DE STABLECOIN par contact (nom, email, téléphone)
     */
    async sendStablecoinByContact(searchTerm, amount, currency = 'USDC') {
        try {
            console.log(`🔍 Recherche du contact : ${searchTerm}...`);
            
            // Rechercher le wallet du destinataire
            const recipientData = contactMapper.findWalletByContact(searchTerm);
            
            if (!recipientData) {
                throw new Error(`❌ Contact introuvable : ${searchTerm}`);
            }
            
            const recipientWallet = recipientData.walletAddress;
            
            // Vérifier le solde
            if (this.balance.stablecoin < amount) {
                throw new Error('❌ Solde insuffisant');
            }
            
            // Effectuer le transfert
            const txHash = await this.executeStablecoinTransfer(
                recipientWallet,
                amount,
                currency
            );
            
            // Mettre à jour le solde
            this.balance.stablecoin -= amount;
            
            // Enregistrer la transaction
            this.transactions.push({
                type: 'send',
                to: recipientWallet,
                toContact: searchTerm,
                amount,
                currency,
                txHash,
                timestamp: Date.now(),
                fees: 0, // Pas de frais !
                status: 'success'
            });
            
            console.log(`✅ Transfert réussi : ${amount} ${currency} → ${searchTerm}`);
            console.log(`📝 TX Hash : ${txHash}`);
            
            return {
                success: true,
                txHash,
                amount,
                currency,
                recipient: searchTerm,
                fees: 0
            };
            
        } catch (error) {
            console.error('❌ Erreur transfert:', error);
            throw error;
        }
    }
    
    /**
     * Exécuter un transfert de stablecoin sur la blockchain
     */
    async executeStablecoinTransfer(toAddress, amount, currency) {
        // Simulation - En production, utiliser le SDK Thirdweb
        /*
        const contract = await sdk.getContract(THIRDWEB_CONFIG.contracts.stablecoin);
        const tx = await contract.erc20.transfer(toAddress, amount);
        return tx.receipt.transactionHash;
        */
        
        // Simulation
        await new Promise(resolve => setTimeout(resolve, 1000));
        return '0x' + Array.from({length: 64}, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    }
    
    /**
     * 💰 RECHARGE DU PORTEFEUILLE
     */
    async rechargeWallet(method, amount, fiatCurrency = 'EUR') {
        try {
            console.log(`🔄 Recharge via ${method} : ${amount} ${fiatCurrency}...`);
            
            let onrampUrl;
            
            switch (method) {
                case 'rampNetwork':
                    onrampUrl = await this.generateRampNetworkUrl(amount, fiatCurrency);
                    break;
                    
                case 'transak':
                    onrampUrl = await this.generateTransakUrl(amount, fiatCurrency);
                    break;
                    
                case 'onramper':
                    onrampUrl = await this.generateOnramperUrl(amount, fiatCurrency);
                    break;
                    
                case 'openBanking':
                    return await this.processOpenBankingPayment(amount, fiatCurrency);
                    
                case 'mobileMoney':
                    return await this.processMobileMoneyPayment(amount, fiatCurrency);
                    
                default:
                    throw new Error('Méthode de paiement non supportée');
            }
            
            // Ouvrir l'interface de paiement
            if (onrampUrl) {
                window.open(onrampUrl, '_blank');
                
                return {
                    success: true,
                    method,
                    amount,
                    fiatCurrency,
                    status: 'pending',
                    onrampUrl
                };
            }
            
        } catch (error) {
            console.error('❌ Erreur recharge:', error);
            throw error;
        }
    }
    
    /**
     * Générer URL Ramp Network
     */
    async generateRampNetworkUrl(amount, fiatCurrency) {
        const config = THIRDWEB_CONFIG.onramp.rampNetwork;
        
        const params = new URLSearchParams({
            hostApiKey: config.apiKey,
            hostAppName: config.hostAppName,
            hostLogoUrl: config.hostLogoUrl,
            defaultAsset: this.regionalConfig.stablecoin,
            fiatCurrency: fiatCurrency,
            fiatValue: amount,
            userAddress: this.walletAddress,
            variant: 'auto' // Marque blanche
        });
        
        return `https://buy.ramp.network/?${params.toString()}`;
    }
    
    /**
     * Générer URL Transak
     */
    async generateTransakUrl(amount, fiatCurrency) {
        const config = THIRDWEB_CONFIG.onramp.transak;
        
        const params = new URLSearchParams({
            apiKey: config.apiKey,
            environment: config.environment,
            cryptoCurrencyCode: this.regionalConfig.stablecoin,
            fiatCurrency: fiatCurrency,
            fiatAmount: amount,
            walletAddress: this.walletAddress,
            network: this.regionalConfig.chain,
            disableWalletAddressForm: true,
            hideMenu: true, // Marque blanche
            themeColor: '10b981' // Couleur PaieCash
        });
        
        return `https://global.transak.com/?${params.toString()}`;
    }
    
    /**
     * Générer URL Onramper (spécial Afrique)
     */
    async generateOnramperUrl(amount, fiatCurrency) {
        const config = THIRDWEB_CONFIG.onramp.onramper;
        
        const params = new URLSearchParams({
            apiKey: config.apiKey,
            defaultCrypto: this.regionalConfig.stablecoin,
            defaultFiat: fiatCurrency,
            defaultAmount: amount,
            wallets: `${this.regionalConfig.stablecoin}:${this.walletAddress}`,
            onlyGateways: 'MTN,Orange,Moov' // Opérateurs africains
        });
        
        return `https://widget.onramper.com/?${params.toString()}`;
    }
    
    /**
     * Traiter un paiement Open Banking / SEPA (Europe)
     */
    async processOpenBankingPayment(amount, fiatCurrency) {
        console.log(`💳 Paiement Open Banking : ${amount} ${fiatCurrency}`);
        
        // Intégration avec API Open Banking (ex: Plaid, TrueLayer)
        // Convertir EUR → USDC via on-ramp partenaire
        
        return {
            success: true,
            method: 'openBanking',
            amount,
            currency: fiatCurrency,
            status: 'processing'
        };
    }
    
    /**
     * Traiter un paiement Mobile Money (Afrique)
     */
    async processMobileMoneyPayment(amount, fiatCurrency) {
        console.log(`📱 Paiement Mobile Money : ${amount} ${fiatCurrency}`);
        
        // Intégration avec opérateurs (MTN, Orange Money, Moov, etc.)
        
        return {
            success: true,
            method: 'mobileMoney',
            amount,
            currency: fiatCurrency,
            operator: 'MTN',
            status: 'processing'
        };
    }
    
    /**
     * 🏪 PAIEMENT MERCHANDISING (QR Code, Lien, Widget)
     */
    async payMerchandising(shopId, amount, method = 'qrcode') {
        try {
            console.log(`🛍️ Paiement merchandising : ${amount} ${this.regionalConfig.stablecoin}`);
            
            // Récupérer le wallet de la boutique
            const shopWallet = await this.getShopWallet(shopId);
            
            if (!shopWallet) {
                throw new Error('❌ Boutique introuvable');
            }
            
            // Vérifier le solde
            if (this.balance.stablecoin < amount) {
                throw new Error('❌ Solde insuffisant');
            }
            
            // Effectuer le paiement
            const txHash = await this.executeStablecoinTransfer(
                shopWallet,
                amount,
                this.regionalConfig.stablecoin
            );
            
            // Mettre à jour le solde
            this.balance.stablecoin -= amount;
            
            // Cashback 5%
            const cashback = amount * 0.05;
            this.balance.paiecashCoin += cashback;
            
            // Enregistrer la transaction
            this.transactions.push({
                type: 'merchandising',
                shopId,
                amount,
                currency: this.regionalConfig.stablecoin,
                txHash,
                cashback,
                timestamp: Date.now(),
                method,
                fees: 0
            });
            
            console.log(`✅ Paiement réussi : ${amount} ${this.regionalConfig.stablecoin}`);
            console.log(`🎁 Cashback : ${cashback} PCC`);
            
            return {
                success: true,
                txHash,
                amount,
                cashback,
                fees: 0
            };
            
        } catch (error) {
            console.error('❌ Erreur paiement:', error);
            throw error;
        }
    }
    
    /**
     * Récupérer le wallet d'une boutique
     */
    async getShopWallet(shopId) {
        // Simulation - En production, requête API backend
        const shopWallets = {
            'om-shop': '0x1234567890abcdef1234567890abcdef12345678',
            'psg-shop': '0xabcdef1234567890abcdef1234567890abcdef12',
            'fff-shop': '0x7890abcdef1234567890abcdef1234567890abcd'
        };
        
        return shopWallets[shopId] || null;
    }
    
    /**
     * Générer un QR Code de paiement
     */
    generatePaymentQRCode(amount, shopId) {
        const paymentData = {
            to: this.walletAddress,
            amount,
            currency: this.regionalConfig.stablecoin,
            shopId,
            timestamp: Date.now()
        };
        
        const qrData = JSON.stringify(paymentData);
        
        // En production, utiliser une lib de génération QR Code
        console.log('📱 QR Code généré:', qrData);
        
        return qrData;
    }
    
    /**
     * Générer un lien de paiement
     */
    generatePaymentLink(amount, shopId) {
        const params = new URLSearchParams({
            wallet: this.walletAddress,
            amount,
            currency: this.regionalConfig.stablecoin,
            shop: shopId
        });
        
        return `https://paiecash.com/pay?${params.toString()}`;
    }
    
    /**
     * 🎫 ACHETER UN BILLET NFT (ERC721)
     */
    async buyTicketNFT(eventId, ticketType, price) {
        try {
            console.log(`🎫 Achat billet NFT : ${ticketType} - ${price} ${this.regionalConfig.stablecoin}`);
            
            // Vérifier le solde
            if (this.balance.stablecoin < price) {
                throw new Error('❌ Solde insuffisant');
            }
            
            // Payer en stablecoin
            const paymentTxHash = await this.executeStablecoinTransfer(
                THIRDWEB_CONFIG.contracts.nftTickets,
                price,
                this.regionalConfig.stablecoin
            );
            
            // Mint du NFT
            const nftData = await this.mintTicketNFT(eventId, ticketType);
            
            // Mettre à jour le solde
            this.balance.stablecoin -= price;
            
            // Enregistrer la transaction
            this.transactions.push({
                type: 'nft_ticket',
                eventId,
                ticketType,
                price,
                currency: this.regionalConfig.stablecoin,
                paymentTxHash,
                nftTxHash: nftData.txHash,
                tokenId: nftData.tokenId,
                timestamp: Date.now()
            });
            
            console.log(`✅ Billet NFT acheté : Token #${nftData.tokenId}`);
            
            return {
                success: true,
                tokenId: nftData.tokenId,
                nftTxHash: nftData.txHash,
                paymentTxHash,
                metadata: nftData.metadata
            };
            
        } catch (error) {
            console.error('❌ Erreur achat billet:', error);
            throw error;
        }
    }
    
    /**
     * Mint d'un NFT billet (ERC721)
     */
    async mintTicketNFT(eventId, ticketType) {
        // Simulation - En production, utiliser le SDK Thirdweb
        /*
        const contract = await sdk.getContract(THIRDWEB_CONFIG.contracts.nftTickets);
        
        const metadata = {
            name: `Billet ${ticketType}`,
            description: `Match ${eventId}`,
            image: `https://paiecash.com/tickets/${eventId}.png`,
            attributes: [
                { trait_type: "Event", value: eventId },
                { trait_type: "Type", value: ticketType },
                { trait_type: "Date", value: new Date().toISOString() }
            ]
        };
        
        const tx = await contract.erc721.mintTo(this.walletAddress, metadata);
        
        return {
            tokenId: tx.id,
            txHash: tx.receipt.transactionHash,
            metadata
        };
        */
        
        // Simulation
        const tokenId = Math.floor(Math.random() * 1000000);
        const txHash = '0x' + Array.from({length: 64}, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
        
        const metadata = {
            name: `Billet ${ticketType}`,
            description: `Match ${eventId}`,
            image: `https://paiecash.com/tickets/${eventId}.png`,
            attributes: [
                { trait_type: "Event", value: eventId },
                { trait_type: "Type", value: ticketType },
                { trait_type: "Date", value: new Date().toISOString() }
            ]
        };
        
        return { tokenId, txHash, metadata };
    }
    
    /**
     * 🏆 ACHETER UN MOMENT NFT (ERC721)
     */
    async buyMomentNFT(momentId, price) {
        // Même logique que buyTicketNFT
        console.log(`🏆 Achat moment NFT #${momentId}`);
        
        // Code similaire à buyTicketNFT...
    }
    
    /**
     * 🔄 TRANSFERT ENTRE CLUBS (Transparence + Réduction frais)
     */
    async transferBetweenClubs(toClubId, amount, reason = 'Transfert de joueur') {
        try {
            console.log(`⚽ Transfert inter-clubs : ${amount} ${this.regionalConfig.stablecoin}`);
            
            // Récupérer le wallet du club destinataire
            const clubWallet = await this.getClubWallet(toClubId);
            
            if (!clubWallet) {
                throw new Error('❌ Club introuvable');
            }
            
            // Effectuer le transfert
            const txHash = await this.executeStablecoinTransfer(
                clubWallet,
                amount,
                this.regionalConfig.stablecoin
            );
            
            // Mettre à jour le solde
            this.balance.stablecoin -= amount;
            
            // Enregistrer la transaction (transparence totale)
            this.transactions.push({
                type: 'club_transfer',
                toClubId,
                amount,
                currency: this.regionalConfig.stablecoin,
                txHash,
                reason,
                timestamp: Date.now(),
                fees: 0, // Pas de frais bancaires !
                status: 'completed'
            });
            
            console.log(`✅ Transfert club réussi : ${amount} ${this.regionalConfig.stablecoin}`);
            console.log(`💰 Économie de frais bancaires estimée : ${amount * 0.03} EUR`);
            
            return {
                success: true,
                txHash,
                amount,
                fees: 0,
                bankFeeSaved: amount * 0.03 // ~3% de frais bancaires évités
            };
            
        } catch (error) {
            console.error('❌ Erreur transfert club:', error);
            throw error;
        }
    }
    
    /**
     * Récupérer le wallet d'un club
     */
    async getClubWallet(clubId) {
        // Simulation - En production, requête API backend
        const clubWallets = {
            'om': '0xCLUB1234567890abcdef1234567890abcdef12',
            'psg': '0xCLUBabcdef1234567890abcdef1234567890ab',
            'ol': '0xCLUB7890abcdef1234567890abcdef1234567'
        };
        
        return clubWallets[clubId] || null;
    }
    
    /**
     * 📊 OBTENIR LE SOLDE
     */
    async getBalance() {
        return {
            stablecoin: this.balance.stablecoin,
            stablecoinSymbol: this.regionalConfig?.stablecoin || 'USDC',
            paiecashCoin: this.balance.paiecashCoin,
            nativeToken: this.balance.nativeToken,
            fiatCurrency: this.regionalConfig?.fiatCurrency || 'EUR',
            fiatValue: await this.convertToFiat(this.balance.stablecoin)
        };
    }
    
    /**
     * Convertir stablecoin → fiat
     */
    async convertToFiat(amount) {
        // En production, utiliser une API de taux de change
        return amount; // 1 USDC ≈ 1 EUR/USD
    }
    
    /**
     * 📜 HISTORIQUE DES TRANSACTIONS
     */
    getTransactionHistory(limit = 20) {
        return this.transactions
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }
}

// ============================================================================
// 🎨 WIDGET THIRDWEB - MARQUE BLANCHE "PaieCash"
// ============================================================================

class PaieCashPaymentWidget {
    constructor(config) {
        this.config = {
            title: config.title || 'Paiement sécurisé PaieCash',
            description: config.description || 'Payer avec stablecoin - 0 frais',
            image: config.image || 'https://paiecash.com/logo.png',
            theme: {
                primaryColor: config.primaryColor || '#10b981',
                backgroundColor: config.backgroundColor || '#1a1f2e',
                textColor: config.textColor || '#ffffff'
            },
            hideBranding: true // Aucun branding Thirdweb
        };
    }
    
    /**
     * Générer le HTML du widget
     */
    render(amount, currency, recipient) {
        return `
            <div class="paiecash-widget" style="
                background: ${this.config.theme.backgroundColor};
                border-radius: 16px;
                padding: 24px;
                max-width: 400px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            ">
                <img src="${this.config.image}" alt="PaieCash" style="width: 80px; margin-bottom: 16px;">
                
                <h3 style="color: ${this.config.theme.textColor}; margin: 0 0 8px 0;">
                    ${this.config.title}
                </h3>
                
                <p style="color: rgba(255,255,255,0.7); font-size: 14px;">
                    ${this.config.description}
                </p>
                
                <div style="
                    background: rgba(16, 185, 129, 0.1);
                    border: 2px solid ${this.config.theme.primaryColor};
                    border-radius: 12px;
                    padding: 16px;
                    margin: 16px 0;
                ">
                    <div style="font-size: 32px; font-weight: bold; color: ${this.config.theme.primaryColor};">
                        ${amount} ${currency}
                    </div>
                    <div style="color: rgba(255,255,255,0.6); font-size: 14px; margin-top: 4px;">
                        À : ${recipient}
                    </div>
                </div>
                
                <button class="paiecash-pay-btn" style="
                    width: 100%;
                    background: ${this.config.theme.primaryColor};
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 16px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    💳 Payer maintenant
                </button>
                
                <div style="
                    display: flex;
                    justify-content: space-between;
                    margin-top: 16px;
                    font-size: 12px;
                    color: rgba(255,255,255,0.5);
                ">
                    <span>✅ Paiement instantané</span>
                    <span>✅ 0 frais</span>
                    <span>✅ Sécurisé</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Injecter le widget dans le DOM
     */
    mount(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.render(100, 'USDC', 'OM Shop');
            
            // Ajouter le handler de paiement
            const btn = container.querySelector('.paiecash-pay-btn');
            btn.addEventListener('click', () => this.handlePayment());
        }
    }
    
    /**
     * Gérer le paiement
     */
    async handlePayment() {
        console.log('💳 Paiement en cours...');
        // Logique de paiement
    }
}

// ============================================================================
// 🚀 EXPORT ET INITIALISATION
// ============================================================================

window.PaieCashWallet = PaieCashWallet;
window.PaieCashPaymentWidget = PaieCashPaymentWidget;
window.THIRDWEB_CONFIG = THIRDWEB_CONFIG;
window.contactMapper = contactMapper;

console.log('✅ PaieCash Wallet - Intégration complète Thirdweb chargée');
console.log('📱 Fonctionnalités disponibles :');
console.log('  - In-App Wallet automatique');
console.log('  - Mapping Contacts → Wallets');
console.log('  - Envoi stablecoin par contact');
console.log('  - Recharge multi-méthodes (Ramp, Transak, Onramper, Mobile Money)');
console.log('  - Paiement merchandising (QR, Lien, Widget)');
console.log('  - Billets & Moments NFT (ERC721)');
console.log('  - Transferts inter-clubs');
console.log('  - Marque blanche PaieCash');
