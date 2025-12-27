/**
 * 💼 WALLET SERVICE - Gestion des wallets Thirdweb In-App
 * Création, connexion, gestion multi-clubs
 */

import { createThirdwebClient, inAppWallet, getWalletBalance } from "thirdweb";
import { polygon, base } from "thirdweb/chains";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import { logger } from "../utils/logger";

interface CreateWalletParams {
  userId: string;
  email: string;
  strategy?: "email" | "phone" | "google" | "apple";
}

interface LinkClubParams {
  userId: string;
  clubId: string;
}

export class WalletService {
  private thirdwebClient;
  
  constructor() {
    this.thirdwebClient = createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY!
    });
  }
  
  /**
   * Créer un wallet In-App Thirdweb automatiquement au signup
   */
  async createWallet(params: CreateWalletParams): Promise<string> {
    const { userId, email, strategy = "email" } = params;
    
    try {
      logger.info(`Creating wallet for user ${userId}`);
      
      // Vérifier si le wallet existe déjà
      const existingWallet = await prisma.wallet.findUnique({
        where: { userId }
      });
      
      if (existingWallet) {
        logger.info(`Wallet already exists for user ${userId}`);
        return existingWallet.address;
      }
      
      // Créer In-App Wallet Thirdweb
      const wallet = inAppWallet({ client: this.thirdwebClient });
      
      await wallet.connect({ 
        strategy, 
        [strategy]: email 
      });
      
      const address = await wallet.getAddress();
      
      // Sauvegarder en base de données
      await prisma.wallet.create({
        data: {
          userId,
          address,
          provider: "thirdweb",
          strategy,
          email,
          kycLevel: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Cache Redis (1 heure)
      await redis.setex(`wallet:${userId}`, 3600, address);
      
      logger.info(`✅ Wallet created for user ${userId}: ${address}`);
      
      return address;
      
    } catch (error) {
      logger.error(`❌ Error creating wallet for user ${userId}:`, error);
      throw new Error(`Failed to create wallet: ${error.message}`);
    }
  }
  
  /**
   * Récupérer l'adresse wallet d'un utilisateur
   */
  async getWalletAddress(userId: string): Promise<string | null> {
    try {
      // Vérifier cache Redis
      const cached = await redis.get(`wallet:${userId}`);
      if (cached) {
        return cached;
      }
      
      // Récupérer depuis DB
      const wallet = await prisma.wallet.findUnique({
        where: { userId }
      });
      
      if (wallet) {
        // Mettre en cache
        await redis.setex(`wallet:${userId}`, 3600, wallet.address);
        return wallet.address;
      }
      
      return null;
      
    } catch (error) {
      logger.error(`Error getting wallet address for user ${userId}:`, error);
      return null;
    }
  }
  
  /**
   * Récupérer le solde stablecoin d'un utilisateur
   */
  async getBalance(userId: string, clubId?: string): Promise<string> {
    try {
      const address = await this.getWalletAddress(userId);
      
      if (!address) {
        throw new Error("Wallet not found");
      }
      
      // Récupérer le contrat stablecoin
      const stablecoinAddress = clubId 
        ? await this.getClubStablecoinAddress(clubId)
        : process.env.GLOBAL_STABLECOIN_ADDRESS;
      
      const balance = await getWalletBalance({
        client: this.thirdwebClient,
        address,
        chain: polygon,
        tokenAddress: stablecoinAddress
      });
      
      // Convertir de wei en EUR (18 decimals)
      const balanceInEur = (Number(balance.value) / 10**18).toFixed(2);
      
      return balanceInEur;
      
    } catch (error) {
      logger.error(`Error getting balance for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Lier un utilisateur à un club (multi-wallet)
   */
  async linkUserToClub(params: LinkClubParams): Promise<void> {
    const { userId, clubId } = params;
    
    try {
      logger.info(`Linking user ${userId} to club ${clubId}`);
      
      // Vérifier si le lien existe déjà
      const existingLink = await prisma.userClubWallet.findFirst({
        where: { userId, clubId }
      });
      
      if (existingLink) {
        logger.info(`User ${userId} already linked to club ${clubId}`);
        return;
      }
      
      // Récupérer le wallet de l'utilisateur
      const userAddress = await this.getWalletAddress(userId);
      if (!userAddress) {
        throw new Error("User wallet not found");
      }
      
      // Récupérer les infos du club
      const club = await prisma.club.findUnique({
        where: { id: clubId }
      });
      
      if (!club) {
        throw new Error("Club not found");
      }
      
      // Créer le lien multi-wallet
      await prisma.userClubWallet.create({
        data: {
          userId,
          clubId,
          userWalletAddress: userAddress,
          clubWalletAddress: club.walletAddress,
          clubTokenSymbol: club.tokenSymbol,
          balance: "0",
          joinedAt: new Date()
        }
      });
      
      // Invalider cache
      await redis.del(`user:${userId}:clubs`);
      
      logger.info(`✅ User ${userId} linked to club ${clubId}`);
      
    } catch (error) {
      logger.error(`Error linking user ${userId} to club ${clubId}:`, error);
      throw error;
    }
  }
  
  /**
   * Récupérer tous les clubs d'un utilisateur
   */
  async getUserClubs(userId: string): Promise<any[]> {
    try {
      // Vérifier cache Redis
      const cached = await redis.get(`user:${userId}:clubs`);
      if (cached) {
        return JSON.parse(cached);
      }
      
      // Récupérer depuis DB
      const clubs = await prisma.userClubWallet.findMany({
        where: { userId },
        include: {
          club: {
            select: {
              id: true,
              name: true,
              logo: true,
              tokenSymbol: true,
              walletAddress: true
            }
          }
        }
      });
      
      const result = clubs.map(c => ({
        clubId: c.clubId,
        clubName: c.club.name,
        clubLogo: c.club.logo,
        tokenSymbol: c.clubTokenSymbol,
        balance: c.balance,
        walletAddress: c.clubWalletAddress,
        joinedAt: c.joinedAt
      }));
      
      // Mettre en cache (30 min)
      await redis.setex(`user:${userId}:clubs`, 1800, JSON.stringify(result));
      
      return result;
      
    } catch (error) {
      logger.error(`Error getting clubs for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Mettre à jour le niveau KYC d'un utilisateur
   */
  async updateKYCLevel(userId: string, level: 0 | 1 | 2): Promise<void> {
    try {
      logger.info(`Updating KYC level for user ${userId} to ${level}`);
      
      await prisma.wallet.update({
        where: { userId },
        data: { 
          kycLevel: level,
          updatedAt: new Date()
        }
      });
      
      // Invalider cache
      await redis.del(`wallet:${userId}:kyc`);
      
      logger.info(`✅ KYC level updated for user ${userId}`);
      
    } catch (error) {
      logger.error(`Error updating KYC level for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Vérifier le niveau KYC d'un utilisateur
   */
  async checkKYCLevel(userId: string): Promise<number> {
    try {
      // Vérifier cache
      const cached = await redis.get(`wallet:${userId}:kyc`);
      if (cached) {
        return parseInt(cached);
      }
      
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
        select: { kycLevel: true }
      });
      
      const level = wallet?.kycLevel || 0;
      
      // Mettre en cache (1 heure)
      await redis.setex(`wallet:${userId}:kyc`, 3600, level.toString());
      
      return level;
      
    } catch (error) {
      logger.error(`Error checking KYC level for user ${userId}:`, error);
      return 0;
    }
  }
  
  /**
   * Récupérer l'adresse du contrat stablecoin d'un club
   */
  private async getClubStablecoinAddress(clubId: string): Promise<string> {
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { stablecoinAddress: true }
    });
    
    return club?.stablecoinAddress || process.env.GLOBAL_STABLECOIN_ADDRESS!;
  }
}

export const walletService = new WalletService();
