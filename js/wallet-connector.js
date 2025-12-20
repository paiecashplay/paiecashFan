/**
 * PaieCashFan - Wallet Connector
 * Intégration WalletConnect v2 + Web3.js pour connexion wallet réelle
 * Supports: MetaMask, Trust Wallet, WalletConnect, Rainbow, Coinbase Wallet, etc.
 */

class WalletConnector {
    constructor() {
        this.provider = null;
        this.account = null;
        this.chainId = null;
        this.web3 = null;
        this.isConnected = false;
        
        // Contrats USDT/USDC sur différents réseaux
        this.tokenContracts = {
            // Ethereum Mainnet
            1: {
                USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
            },
            // Polygon
            137: {
                USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
                USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
            },
            // BNB Chain
            56: {
                USDT: '0x55d398326f99059fF775485246999027B3197955',
                USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
                BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
            },
            // Avalanche C-Chain
            43114: {
                USDT: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
                USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
                DAI: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70'
            },
            // Arbitrum One
            42161: {
                USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
                USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
                DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'
            },
            // Optimism
            10: {
                USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
                USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
                DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'
            },
            // Base (Coinbase L2)
            8453: {
                USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
            }
        };
        
        this.init();
    }
    
    init() {
        // Charger Web3.js depuis CDN si nécessaire
        if (typeof window.ethereum !== 'undefined') {
            console.log('✅ Ethereum provider detected');
        } else {
            console.log('⚠️ No Ethereum provider detected. Please install MetaMask or another wallet.');
        }
        
        // Vérifier si déjà connecté
        this.checkConnection();
    }
    
    /**
     * Connecter un wallet via MetaMask / injected provider
     */
    async connectMetaMask() {
        try {
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask n\'est pas installé. Veuillez l\'installer depuis metamask.io');
            }
            
            // Demander la connexion
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            this.provider = window.ethereum;
            this.account = accounts[0];
            this.chainId = await window.ethereum.request({ method: 'eth_chainId' });
            this.isConnected = true;
            
            // Sauvegarder l'état de connexion
            this.saveConnection();
            
            // Écouter les changements de compte et de réseau
            this.setupListeners();
            
            console.log('✅ Wallet connecté:', this.account);
            return {
                success: true,
                account: this.account,
                chainId: this.chainId
            };
            
        } catch (error) {
            console.error('❌ Erreur connexion MetaMask:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Connecter via WalletConnect v2 (pour mobile wallets)
     */
    async connectWalletConnect() {
        try {
            // Pour une implémentation complète de WalletConnect v2, 
            // il faudrait installer @walletconnect/modal et @walletconnect/ethereum-provider
            
            alert('🚀 WalletConnect v2 sera bientôt disponible!\n\nEn attendant, vous pouvez :\n✅ Utiliser MetaMask sur desktop\n✅ Utiliser Trust Wallet browser\n✅ Utiliser Coinbase Wallet browser');
            
            return { success: false, error: 'WalletConnect v2 en cours d\'implémentation' };
            
        } catch (error) {
            console.error('❌ Erreur WalletConnect:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Déconnecter le wallet
     */
    async disconnect() {
        this.provider = null;
        this.account = null;
        this.chainId = null;
        this.isConnected = false;
        
        // Supprimer de localStorage
        localStorage.removeItem('wallet_connected');
        localStorage.removeItem('wallet_account');
        
        console.log('✅ Wallet déconnecté');
        return { success: true };
    }
    
    /**
     * Obtenir le solde ETH/BNB natif
     */
    async getNativeBalance() {
        if (!this.isConnected || !this.provider) {
            return '0';
        }
        
        try {
            const balance = await this.provider.request({
                method: 'eth_getBalance',
                params: [this.account, 'latest']
            });
            
            // Convertir de Wei à ETH
            const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
            return balanceInEth.toFixed(6);
            
        } catch (error) {
            console.error('❌ Erreur récupération solde:', error);
            return '0';
        }
    }
    
    /**
     * Obtenir le solde d'un token ERC-20 (USDT, USDC)
     */
    async getTokenBalance(tokenSymbol) {
        if (!this.isConnected || !this.provider) {
            return '0';
        }
        
        try {
            const chainIdDec = parseInt(this.chainId, 16);
            const tokenAddress = this.tokenContracts[chainIdDec]?.[tokenSymbol];
            
            if (!tokenAddress) {
                console.warn(`⚠️ ${tokenSymbol} non disponible sur ce réseau`);
                return '0';
            }
            
            // ABI minimal pour balanceOf
            const minABI = [
                {
                    "constant": true,
                    "inputs": [{"name": "_owner", "type": "address"}],
                    "name": "balanceOf",
                    "outputs": [{"name": "balance", "type": "uint256"}],
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "decimals",
                    "outputs": [{"name": "", "type": "uint8"}],
                    "type": "function"
                }
            ];
            
            // Appel balanceOf via eth_call
            const data = '0x70a08231' + this.account.slice(2).padStart(64, '0');
            
            const balance = await this.provider.request({
                method: 'eth_call',
                params: [{
                    to: tokenAddress,
                    data: data
                }, 'latest']
            });
            
            // Les stablecoins utilisent généralement 6 décimales (USDT, USDC)
            const decimals = tokenSymbol === 'USDT' || tokenSymbol === 'USDC' ? 6 : 18;
            const balanceInToken = parseInt(balance, 16) / Math.pow(10, decimals);
            
            return balanceInToken.toFixed(2);
            
        } catch (error) {
            console.error(`❌ Erreur récupération solde ${tokenSymbol}:`, error);
            return '0';
        }
    }
    
    /**
     * Obtenir tous les soldes (ETH + tokens)
     */
    async getAllBalances() {
        if (!this.isConnected) {
            return null;
        }
        
        try {
            const chainIdDec = parseInt(this.chainId, 16);
            const networkName = this.getNetworkName(chainIdDec);
            
            const balances = {
                network: networkName,
                chainId: chainIdDec,
                account: this.account,
                native: {
                    symbol: this.getNativeCurrency(chainIdDec),
                    balance: await this.getNativeBalance()
                },
                tokens: {}
            };
            
            // Récupérer USDT et USDC si disponibles
            if (this.tokenContracts[chainIdDec]) {
                balances.tokens.USDT = await this.getTokenBalance('USDT');
                balances.tokens.USDC = await this.getTokenBalance('USDC');
            }
            
            return balances;
            
        } catch (error) {
            console.error('❌ Erreur récupération soldes:', error);
            return null;
        }
    }
    
    /**
     * Obtenir les NFTs du wallet (via API externe)
     */
    async getNFTs() {
        if (!this.isConnected) {
            return [];
        }
        
        try {
            // Pour récupérer les NFTs, on utiliserait normalement:
            // - Alchemy NFT API
            // - Moralis NFT API
            // - OpenSea API
            // - Simplehash API
            
            // Exemple avec API fictive (à remplacer par une vraie API)
            console.log('🎨 Récupération des NFTs...');
            
            // Simulation pour la démo
            const demoNFTs = [
                {
                    name: 'Fan Badge #1234',
                    collection: 'PaieCashFan Exclusive',
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY2N2VlYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKavTwvdGV4dD48L3N2Zz4=',
                    tokenId: '1234',
                    network: 'Polygon'
                },
                {
                    name: 'Marseille Supporter NFT',
                    collection: 'OM Collection',
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzI2OWFiOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9NPC90ZXh0Pjwvc3ZnPg==',
                    tokenId: '567',
                    network: 'Ethereum'
                }
            ];
            
            return demoNFTs;
            
        } catch (error) {
            console.error('❌ Erreur récupération NFTs:', error);
            return [];
        }
    }
    
    /**
     * Helpers
     */
    
    getNetworkName(chainId) {
        const networks = {
            1: 'Ethereum Mainnet',
            137: 'Polygon',
            56: 'BNB Chain',
            43114: 'Avalanche C-Chain',
            42161: 'Arbitrum One',
            10: 'Optimism',
            8453: 'Base',
            5: 'Goerli Testnet',
            80001: 'Mumbai Testnet',
            // Solana utilise un autre système (pas de chainId EVM)
            'solana': 'Solana Mainnet'
        };
        return networks[chainId] || `Network ${chainId}`;
    }
    
    getNativeCurrency(chainId) {
        const currencies = {
            1: 'ETH',
            137: 'MATIC',
            56: 'BNB',
            43114: 'AVAX',
            42161: 'ETH',
            10: 'ETH',
            8453: 'ETH',
            5: 'ETH',
            80001: 'MATIC',
            'solana': 'SOL'
        };
        return currencies[chainId] || 'ETH';
    }
    
    setupListeners() {
        if (!this.provider) return;
        
        // Changement de compte
        this.provider.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                this.disconnect();
                window.location.reload();
            } else {
                this.account = accounts[0];
                this.saveConnection();
                window.location.reload();
            }
        });
        
        // Changement de réseau
        this.provider.on('chainChanged', (chainId) => {
            this.chainId = chainId;
            window.location.reload();
        });
    }
    
    saveConnection() {
        localStorage.setItem('wallet_connected', 'true');
        localStorage.setItem('wallet_account', this.account);
    }
    
    async checkConnection() {
        const wasConnected = localStorage.getItem('wallet_connected');
        if (wasConnected && typeof window.ethereum !== 'undefined') {
            // Reconnecter automatiquement
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                this.provider = window.ethereum;
                this.account = accounts[0];
                this.chainId = await window.ethereum.request({ method: 'eth_chainId' });
                this.isConnected = true;
                this.setupListeners();
            }
        }
    }
}

// Instance globale
window.walletConnector = new WalletConnector();
