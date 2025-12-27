/**
 * 💳 PAYMENT SERVICE - Gestion des paiements stablecoin, SEPA, Mobile Money
 * Mint/burn stablecoin, transferts, recharges
 */

import { createThirdwebClient, getContract } from "thirdweb";
import { transfer, mint, burn } from "thirdweb/extensions/erc20";
import { polygon, base } from "thirdweb/chains";
import { privateKeyToAccount } from "thirdweb/wallets";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import { rabbitmq } from "../lib/rabbitmq";
import { logger } from "../utils/logger";
import { walletService } from "./wallet.service";

interface TransferParams {
  fromUserId: string;
  toAddress: string;
  amount: string;
  clubId?: string;
  metadata?: any;
}

interface MintParams {
  toUserId: string;
  amount: string;
  method: "sepa" | "mobile-money" | "card";
  transactionId: string;
}

interface BurnParams {
  fromUserId: string;
  amount: string;
  reason: string;
}

export class PaymentService {
  private thirdwebClient;
  private backendWallet;
  private stablecoinContract;
  
  constructor() {
    // Initialiser Thirdweb Client
    this.thirdwebClient = createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY!
    });
    
    // Créer wallet backend pour signer les transactions
    this.backendWallet = privateKeyToAccount({
      client: this.thirdwebClient,
      privateKey: process.env.BACKEND_WALLET_PRIVATE_KEY!
    });
    
    // Contrat stablecoin global
    this.stablecoinContract = getContract({
      client: this.thirdwebClient,
      address: process.env.GLOBAL_STABLECOIN_ADDRESS!,
      chain: polygon
    });
  }
  
  /**
   * Transférer des stablecoins d'un utilisateur à un autre
   */
  async transferStablecoin(params: TransferParams): Promise<string> {
    const { fromUserId, toAddress, amount, clubId, metadata } = params;
    
    try {
      logger.info(`Transfer ${amount} from ${fromUserId} to ${toAddress}`);
      
      // 1. Vérifier KYC
      const kycLevel = await walletService.checkKYCLevel(fromUserId);
      if (kycLevel < 1 && parseFloat(amount) > 100) {
        throw new Error("KYC level 1 required for amounts > 100 EUR");
      }
      
      // 2. Récupérer l'adresse wallet de l'utilisateur
      const fromAddress = await walletService.getWalletAddress(fromUserId);
      if (!fromAddress) {
        throw new Error("Wallet not found");
      }
      
      // 3. Vérifier le solde
      const balance = await walletService.getBalance(fromUserId, clubId);
      if (parseFloat(balance) < parseFloat(amount)) {
        throw new Error("Insufficient balance");
      }
      
      // 4. Préparer la transaction
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 10**18));
      
      const transaction = transfer({
        contract: this.stablecoinContract,
        to: toAddress,
        amount: amountInWei
      });
      
      // 5. Signer et envoyer (gasless via backend wallet)
      const result = await this.backendWallet.sendTransaction(transaction);
      const transactionHash = result.transactionHash;
      
      // 6. Enregistrer en base de données
      await prisma.transaction.create({
        data: {
          hash: transactionHash,
          fromUserId,
          fromAddress,
          toAddress,
          amount,
          currency: "EUR",
          type: "transfer",
          status: "completed",
          clubId,
          metadata,
          createdAt: new Date()
        }
      });
      
      // 7. Publier événement RabbitMQ
      await rabbitmq.publish("payment.transfer", {
        transactionHash,
        fromUserId,
        toAddress,
        amount,
        clubId
      });
      
      logger.info(`✅ Transfer successful: ${transactionHash}`);
      
      return transactionHash;
      
    } catch (error) {
      logger.error(`❌ Transfer error:`, error);
      throw error;
    }
  }
  
  /**
   * Mint stablecoin après recharge (SEPA, Mobile Money, etc.)
   */
  async mintStablecoin(params: MintParams): Promise<string> {
    const { toUserId, amount, method, transactionId } = params;
    
    try {
      logger.info(`Minting ${amount} stablecoin for user ${toUserId} via ${method}`);
      
      // 1. Vérifier si la recharge existe déjà (idempotence)
      const existingRecharge = await prisma.recharge.findUnique({
        where: { transactionId }
      });
      
      if (existingRecharge) {
        logger.info(`Recharge already processed: ${transactionId}`);
        return existingRecharge.mintTransactionHash;
      }
      
      // 2. Récupérer l'adresse wallet de l'utilisateur
      const toAddress = await walletService.getWalletAddress(toUserId);
      if (!toAddress) {
        throw new Error("Wallet not found");
      }
      
      // 3. Mint stablecoin (backend wallet est autorisé)
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 10**18));
      
      const transaction = mint({
        contract: this.stablecoinContract,
        to: toAddress,
        amount: amountInWei
      });
      
      const result = await this.backendWallet.sendTransaction(transaction);
      const mintHash = result.transactionHash;
      
      // 4. Enregistrer la recharge
      await prisma.recharge.create({
        data: {
          transactionId,
          userId: toUserId,
          walletAddress: toAddress,
          amount,
          currency: "EUR",
          method,
          status: "completed",
          mintTransactionHash: mintHash,
          createdAt: new Date()
        }
      });
      
      // 5. Publier événement
      await rabbitmq.publish("payment.recharge", {
        userId: toUserId,
        amount,
        method,
        mintHash
      });
      
      logger.info(`✅ Stablecoin minted: ${mintHash}`);
      
      return mintHash;
      
    } catch (error) {
      logger.error(`❌ Mint error:`, error);
      throw error;
    }
  }
  
  /**
   * Burn stablecoin (retrait vers compte bancaire)
   */
  async burnStablecoin(params: BurnParams): Promise<string> {
    const { fromUserId, amount, reason } = params;
    
    try {
      logger.info(`Burning ${amount} stablecoin for user ${fromUserId}`);
      
      // 1. Vérifier KYC niveau 2 (retraits > 1000 EUR)
      const kycLevel = await walletService.checkKYCLevel(fromUserId);
      if (kycLevel < 2 && parseFloat(amount) > 1000) {
        throw new Error("KYC level 2 required for withdrawals > 1000 EUR");
      }
      
      // 2. Récupérer l'adresse wallet
      const fromAddress = await walletService.getWalletAddress(fromUserId);
      if (!fromAddress) {
        throw new Error("Wallet not found");
      }
      
      // 3. Vérifier le solde
      const balance = await walletService.getBalance(fromUserId);
      if (parseFloat(balance) < parseFloat(amount)) {
        throw new Error("Insufficient balance");
      }
      
      // 4. Burn stablecoin
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 10**18));
      
      const transaction = burn({
        contract: this.stablecoinContract,
        from: fromAddress,
        amount: amountInWei
      });
      
      const result = await this.backendWallet.sendTransaction(transaction);
      const burnHash = result.transactionHash;
      
      // 5. Enregistrer le retrait
      await prisma.withdrawal.create({
        data: {
          userId: fromUserId,
          walletAddress: fromAddress,
          amount,
          currency: "EUR",
          status: "pending_bank_transfer",
          burnTransactionHash: burnHash,
          reason,
          createdAt: new Date()
        }
      });
      
      // 6. Publier événement pour traiter le virement bancaire
      await rabbitmq.publish("payment.withdrawal", {
        userId: fromUserId,
        amount,
        burnHash
      });
      
      logger.info(`✅ Stablecoin burned: ${burnHash}`);
      
      return burnHash;
      
    } catch (error) {
      logger.error(`❌ Burn error:`, error);
      throw error;
    }
  }
  
  /**
   * Initier un paiement SEPA via Plaid/Bridge
   */
  async initiateSEPAPayment(params: {
    userId: string;
    amount: string;
    clubId?: string;
  }): Promise<{ paymentUrl: string; transactionId: string }> {
    const { userId, amount, clubId } = params;
    
    try {
      logger.info(`Initiating SEPA payment ${amount} for user ${userId}`);
      
      // Appel API Plaid/Bridge pour créer session de paiement
      const response = await fetch("https://api.bridge.io/v1/payments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.BRIDGE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: "EUR",
          user_id: userId,
          redirect_url: `${process.env.APP_URL}/payment/sepa/callback`,
          metadata: { clubId }
        })
      });
      
      const data = await response.json();
      
      // Sauvegarder la session
      await prisma.paymentSession.create({
        data: {
          transactionId: data.transaction_id,
          userId,
          amount,
          currency: "EUR",
          method: "sepa",
          status: "pending",
          paymentUrl: data.authorization_url,
          clubId,
          createdAt: new Date()
        }
      });
      
      logger.info(`✅ SEPA payment initiated: ${data.transaction_id}`);
      
      return {
        paymentUrl: data.authorization_url,
        transactionId: data.transaction_id
      };
      
    } catch (error) {
      logger.error(`❌ SEPA payment error:`, error);
      throw error;
    }
  }
  
  /**
   * Initier un paiement Mobile Money via Flutterwave
   */
  async initiateMobileMoneyPayment(params: {
    userId: string;
    amount: string;
    phoneNumber: string;
    provider: "orange_money" | "mtn_money" | "m_pesa";
    clubId?: string;
  }): Promise<{ transactionId: string; instructions: string }> {
    const { userId, amount, phoneNumber, provider, clubId } = params;
    
    try {
      logger.info(`Initiating Mobile Money payment ${amount} for user ${userId}`);
      
      // Appel API Flutterwave
      const response = await fetch("https://api.flutterwave.com/v3/charges?type=mobile_money", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tx_ref: `mm_${Date.now()}`,
          amount: parseFloat(amount),
          currency: "EUR",
          network: provider.toUpperCase(),
          email: `${userId}@paiecashfan.com`,
          phone_number: phoneNumber,
          fullname: userId,
          redirect_url: `${process.env.APP_URL}/payment/mobile-money/callback`
        })
      });
      
      const data = await response.json();
      
      // Sauvegarder la session
      await prisma.paymentSession.create({
        data: {
          transactionId: data.data.tx_ref,
          userId,
          amount,
          currency: "EUR",
          method: "mobile-money",
          status: "pending",
          metadata: { provider, phoneNumber },
          clubId,
          createdAt: new Date()
        }
      });
      
      logger.info(`✅ Mobile Money payment initiated: ${data.data.tx_ref}`);
      
      return {
        transactionId: data.data.tx_ref,
        instructions: data.data.meta.authorization.note
      };
      
    } catch (error) {
      logger.error(`❌ Mobile Money payment error:`, error);
      throw error;
    }
  }
  
  /**
   * Récupérer l'historique des transactions d'un utilisateur
   */
  async getTransactionHistory(userId: string, limit = 20): Promise<any[]> {
    try {
      // Vérifier cache
      const cacheKey = `transactions:${userId}:${limit}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      
      const transactions = await prisma.transaction.findMany({
        where: {
          OR: [
            { fromUserId: userId },
            { toAddress: await walletService.getWalletAddress(userId) }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      
      // Mettre en cache (5 min)
      await redis.setex(cacheKey, 300, JSON.stringify(transactions));
      
      return transactions;
      
    } catch (error) {
      logger.error(`Error getting transaction history for user ${userId}:`, error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
