/**
 * Service WalletConnect pour connexion wallet crypto
 * https://docs.walletconnect.network/wallet-sdk/best-practices
 */

const { ethers } = require('ethers');
const logger = require('../utils/logger');

class WalletConnectService {
  constructor() {
    this.projectId = process.env.WALLETCONNECT_PROJECT_ID;
    this.provider = null;
    this.signer = null;
  }

  /**
   * Initialiser le provider Ethereum
   */
  async initProvider() {
    try {
      if (!process.env.INFURA_API_KEY) {
        throw new Error('INFURA_API_KEY non configurée');
      }

      // Provider Infura pour Ethereum Mainnet
      this.provider = new ethers.InfuraProvider(
        'mainnet',
        process.env.INFURA_API_KEY
      );

      logger.info('Provider Ethereum initialisé');
      return this.provider;
    } catch (error) {
      logger.error(`Erreur lors de l'initialisation du provider: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vérifier qu'une adresse Ethereum est valide
   * @param {string} address - Adresse à vérifier
   * @returns {boolean}
   */
  isValidAddress(address) {
    return ethers.isAddress(address);
  }

  /**
   * Obtenir le solde ETH d'une adresse
   * @param {string} address - Adresse Ethereum
   * @returns {string} - Solde en ETH
   */
  async getEthBalance(address) {
    try {
      if (!this.provider) {
        await this.initProvider();
      }

      if (!this.isValidAddress(address)) {
        throw new Error('Adresse Ethereum invalide');
      }

      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance); // Convertir de Wei en ETH
    } catch (error) {
      logger.error(`Erreur lors de la récupération du solde ETH: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtenir le solde d'un token ERC-20 (USDC, USDT)
   * @param {string} address - Adresse Ethereum
   * @param {string} tokenAddress - Adresse du contrat ERC-20
   * @returns {string} - Solde du token
   */
  async getTokenBalance(address, tokenAddress) {
    try {
      if (!this.provider) {
        await this.initProvider();
      }

      if (!this.isValidAddress(address) || !this.isValidAddress(tokenAddress)) {
        throw new Error('Adresse invalide');
      }

      // ABI minimal pour balanceOf
      const erc20Abi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ];

      const contract = new ethers.Contract(tokenAddress, erc20Abi, this.provider);
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();

      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      logger.error(`Erreur lors de la récupération du solde token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtenir le solde USDC (Ethereum Mainnet)
   * @param {string} address - Adresse Ethereum
   * @returns {string} - Solde USDC
   */
  async getUSDCBalance(address) {
    const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC sur Ethereum Mainnet
    return await this.getTokenBalance(address, USDC_ADDRESS);
  }

  /**
   * Obtenir le solde USDT (Ethereum Mainnet)
   * @param {string} address - Adresse Ethereum
   * @returns {string} - Solde USDT
   */
  async getUSDTBalance(address) {
    const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT sur Ethereum Mainnet
    return await this.getTokenBalance(address, USDT_ADDRESS);
  }

  /**
   * Vérifier si une signature est valide
   * @param {string} message - Message original
   * @param {string} signature - Signature à vérifier
   * @param {string} address - Adresse qui devrait avoir signé
   * @returns {boolean}
   */
  async verifySignature(message, signature, address) {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      logger.error(`Erreur lors de la vérification de la signature: ${error.message}`);
      return false;
    }
  }

  /**
   * Créer un message de signature pour authentification
   * @param {string} userId - ID de l'utilisateur
   * @param {number} nonce - Nonce unique
   * @returns {string} - Message à signer
   */
  createAuthMessage(userId, nonce) {
    return `PaieCashFan - Signature d'authentification\n\nUser ID: ${userId}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;
  }

  /**
   * Obtenir le prix actuel de l'ETH en EUR
   * @returns {number} - Prix en EUR
   */
  async getEthPriceEUR() {
    try {
      // TODO: Implémenter un appel à une API de prix (CoinGecko, Binance, etc.)
      // Pour l'instant, retourner une valeur fixe
      return 2000; // 1 ETH = 2000 EUR (exemple)
    } catch (error) {
      logger.error(`Erreur lors de la récupération du prix ETH: ${error.message}`);
      return 2000;
    }
  }

  /**
   * Convertir une valeur crypto en EUR
   * @param {number} amount - Montant
   * @param {string} currency - Devise (ETH, USDC, USDT)
   * @returns {number} - Valeur en EUR
   */
  async convertToEUR(amount, currency) {
    const rates = {
      'ETH': await this.getEthPriceEUR(),
      'USDC': 0.92, // 1 USDC ≈ 0.92 EUR
      'USDT': 0.92  // 1 USDT ≈ 0.92 EUR
    };

    return amount * (rates[currency] || 0);
  }
}

module.exports = new WalletConnectService();
