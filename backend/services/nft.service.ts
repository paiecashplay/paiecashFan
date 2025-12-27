/**
 * 🎫 NFT SERVICE - Gestion des NFT tickets et moments sportifs
 * Mint, transfer, validation, métadonnées
 */

import { createThirdwebClient, getContract } from "thirdweb";
import { claimTo, getNFT, transfer } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";
import { privateKeyToAccount } from "thirdweb/wallets";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import { rabbitmq } from "../lib/rabbitmq";
import { logger } from "../utils/logger";
import { walletService } from "./wallet.service";
import { generateQRCode } from "../utils/qrcode";
import { uploadToIPFS } from "../utils/ipfs";

interface MintTicketParams {
  userId: string;
  eventId: string;
  clubId: string;
  paymentTransactionHash: string;
  seatNumber?: string;
}

interface ValidateTicketParams {
  tokenId: string;
  eventId: string;
  validatorId: string;
}

export class NFTService {
  private thirdwebClient;
  private backendWallet;
  private ticketContract;
  
  constructor() {
    this.thirdwebClient = createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY!
    });
    
    this.backendWallet = privateKeyToAccount({
      client: this.thirdwebClient,
      privateKey: process.env.BACKEND_WALLET_PRIVATE_KEY!
    });
    
    // Contrat NFT Ticket ERC721
    this.ticketContract = getContract({
      client: this.thirdwebClient,
      address: process.env.NFT_TICKET_CONTRACT_ADDRESS!,
      chain: polygon
    });
  }
  
  /**
   * Mint un NFT ticket après paiement réussi
   */
  async mintTicket(params: MintTicketParams): Promise<{
    tokenId: string;
    contractAddress: string;
    qrCode: string;
    metadata: any;
  }> {
    const { userId, eventId, clubId, paymentTransactionHash, seatNumber } = params;
    
    try {
      logger.info(`Minting ticket NFT for user ${userId}, event ${eventId}`);
      
      // 1. Vérifier que le paiement est confirmé
      const payment = await prisma.transaction.findFirst({
        where: { hash: paymentTransactionHash, status: "completed" }
      });
      
      if (!payment) {
        throw new Error("Payment not found or not completed");
      }
      
      // 2. Vérifier que le ticket n'a pas déjà été mint
      const existingTicket = await prisma.ticket.findFirst({
        where: { paymentTransactionHash }
      });
      
      if (existingTicket) {
        logger.info(`Ticket already minted: ${existingTicket.tokenId}`);
        return {
          tokenId: existingTicket.tokenId,
          contractAddress: existingTicket.contractAddress,
          qrCode: existingTicket.qrCode,
          metadata: existingTicket.metadata
        };
      }
      
      // 3. Récupérer les infos de l'événement
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { club: true }
      });
      
      if (!event) {
        throw new Error("Event not found");
      }
      
      // 4. Récupérer l'adresse wallet de l'utilisateur
      const userAddress = await walletService.getWalletAddress(userId);
      if (!userAddress) {
        throw new Error("User wallet not found");
      }
      
      // 5. Créer les métadonnées NFT
      const metadata = {
        name: `${event.name} - Ticket`,
        description: `Billet officiel pour ${event.name} le ${event.date.toLocaleDateString()}`,
        image: event.posterUrl,
        attributes: [
          { trait_type: "Club", value: event.club.name },
          { trait_type: "Event", value: event.name },
          { trait_type: "Date", value: event.date.toISOString() },
          { trait_type: "Venue", value: event.venue },
          { trait_type: "Seat", value: seatNumber || "General Admission" },
          { trait_type: "Price", value: payment.amount },
          { trait_type: "Payment Hash", value: paymentTransactionHash }
        ],
        external_url: `${process.env.APP_URL}/tickets/${eventId}`
      };
      
      // 6. Uploader les métadonnées sur IPFS
      const metadataURI = await uploadToIPFS(metadata);
      
      // 7. Mint le NFT
      const transaction = claimTo({
        contract: this.ticketContract,
        to: userAddress,
        quantity: 1n
      });
      
      const result = await this.backendWallet.sendTransaction(transaction);
      const mintHash = result.transactionHash;
      
      // Récupérer le tokenId mint
      const nft = await getNFT({
        contract: this.ticketContract,
        tokenId: result.tokenId
      });
      
      const tokenId = nft.id.toString();
      
      // 8. Générer QR code pour validation
      const qrCodeData = {
        tokenId,
        contractAddress: this.ticketContract.address,
        eventId,
        userId,
        chain: "polygon"
      };
      
      const qrCode = await generateQRCode(JSON.stringify(qrCodeData));
      
      // 9. Enregistrer le ticket en DB
      await prisma.ticket.create({
        data: {
          tokenId,
          contractAddress: this.ticketContract.address,
          ownerAddress: userAddress,
          userId,
          eventId,
          clubId,
          paymentTransactionHash,
          mintTransactionHash: mintHash,
          metadataURI,
          metadata,
          qrCode,
          seatNumber,
          status: "active",
          used: false,
          createdAt: new Date()
        }
      });
      
      // 10. Publier événement
      await rabbitmq.publish("nft.ticket.minted", {
        tokenId,
        userId,
        eventId,
        clubId
      });
      
      logger.info(`✅ Ticket NFT minted: ${tokenId}`);
      
      return {
        tokenId,
        contractAddress: this.ticketContract.address,
        qrCode,
        metadata
      };
      
    } catch (error) {
      logger.error(`❌ Error minting ticket:`, error);
      throw error;
    }
  }
  
  /**
   * Valider un ticket NFT à l'entrée d'un événement
   */
  async validateTicket(params: ValidateTicketParams): Promise<boolean> {
    const { tokenId, eventId, validatorId } = params;
    
    try {
      logger.info(`Validating ticket ${tokenId} for event ${eventId}`);
      
      // 1. Récupérer le ticket
      const ticket = await prisma.ticket.findFirst({
        where: { tokenId, eventId }
      });
      
      if (!ticket) {
        throw new Error("Ticket not found");
      }
      
      // 2. Vérifier que le ticket n'a pas déjà été utilisé
      if (ticket.used) {
        throw new Error("Ticket already used");
      }
      
      // 3. Vérifier la propriété on-chain
      const nft = await getNFT({
        contract: this.ticketContract,
        tokenId: BigInt(tokenId)
      });
      
      if (nft.owner !== ticket.ownerAddress) {
        throw new Error("NFT ownership mismatch");
      }
      
      // 4. Marquer le ticket comme utilisé
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          used: true,
          usedAt: new Date(),
          validatedBy: validatorId
        }
      });
      
      // 5. Publier événement
      await rabbitmq.publish("nft.ticket.validated", {
        tokenId,
        eventId,
        validatorId
      });
      
      logger.info(`✅ Ticket ${tokenId} validated`);
      
      return true;
      
    } catch (error) {
      logger.error(`❌ Error validating ticket:`, error);
      throw error;
    }
  }
  
  /**
   * Transférer un NFT ticket à un autre utilisateur
   */
  async transferTicket(params: {
    tokenId: string;
    fromUserId: string;
    toAddress: string;
  }): Promise<string> {
    const { tokenId, fromUserId, toAddress } = params;
    
    try {
      logger.info(`Transferring ticket ${tokenId} from ${fromUserId} to ${toAddress}`);
      
      // 1. Récupérer le ticket
      const ticket = await prisma.ticket.findFirst({
        where: { tokenId, userId: fromUserId }
      });
      
      if (!ticket) {
        throw new Error("Ticket not found or not owned by user");
      }
      
      // 2. Vérifier que le ticket n'est pas utilisé
      if (ticket.used) {
        throw new Error("Cannot transfer used ticket");
      }
      
      // 3. Transférer le NFT on-chain
      const transaction = transfer({
        contract: this.ticketContract,
        to: toAddress,
        tokenId: BigInt(tokenId)
      });
      
      const result = await this.backendWallet.sendTransaction(transaction);
      const transferHash = result.transactionHash;
      
      // 4. Mettre à jour la DB
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          ownerAddress: toAddress,
          transferHistory: {
            push: {
              from: ticket.ownerAddress,
              to: toAddress,
              transactionHash: transferHash,
              timestamp: new Date()
            }
          }
        }
      });
      
      // 5. Publier événement
      await rabbitmq.publish("nft.ticket.transferred", {
        tokenId,
        fromUserId,
        toAddress,
        transferHash
      });
      
      logger.info(`✅ Ticket ${tokenId} transferred: ${transferHash}`);
      
      return transferHash;
      
    } catch (error) {
      logger.error(`❌ Error transferring ticket:`, error);
      throw error;
    }
  }
  
  /**
   * Récupérer tous les tickets NFT d'un utilisateur
   */
  async getUserTickets(userId: string): Promise<any[]> {
    try {
      // Vérifier cache
      const cacheKey = `tickets:${userId}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      
      const tickets = await prisma.ticket.findMany({
        where: { userId },
        include: {
          event: {
            include: {
              club: {
                select: {
                  name: true,
                  logo: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      // Mettre en cache (5 min)
      await redis.setex(cacheKey, 300, JSON.stringify(tickets));
      
      return tickets;
      
    } catch (error) {
      logger.error(`Error getting user tickets:`, error);
      throw error;
    }
  }
  
  /**
   * Récupérer les statistiques des tickets d'un événement
   */
  async getEventTicketStats(eventId: string): Promise<{
    totalMinted: number;
    totalUsed: number;
    totalRevenue: string;
  }> {
    try {
      const stats = await prisma.ticket.aggregate({
        where: { eventId },
        _count: { id: true },
        _sum: { 
          used: true 
        }
      });
      
      const payments = await prisma.transaction.aggregate({
        where: { 
          metadata: { path: ['eventId'], equals: eventId }
        },
        _sum: { amount: true }
      });
      
      return {
        totalMinted: stats._count.id,
        totalUsed: stats._sum.used || 0,
        totalRevenue: payments._sum.amount?.toString() || "0"
      };
      
    } catch (error) {
      logger.error(`Error getting event ticket stats:`, error);
      throw error;
    }
  }
}

export const nftService = new NFTService();
