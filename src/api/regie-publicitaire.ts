/**
 * RÉGIE PUBLICITAIRE SPONSORS - SYSTÈME FOMO
 * PaieCashFan v16.0
 * 
 * Ce module gère:
 * - Tracking des interactions (like, share, comment, purchase, view, referral)
 * - Calcul automatique des récompenses PCC/Stablecoins
 * - Programme ambassadeur 3 niveaux
 * - Gestion des campagnes sponsors (PAYS, VILLE, MARQUE, PRODUIT)
 * - Live Shopping avec cashback doublé
 */

// Types de sponsors
export type SponsorType = 'PAYS' | 'VILLE' | 'MARQUE' | 'PRODUIT';

// Types d'interactions
export type InteractionType = 'LIKE' | 'SHARE' | 'COMMENT' | 'VIEW' | 'PURCHASE' | 'REFERRAL';

// Niveaux ambassadeur
export type AmbassadorLevel = 'JOUEUR' | 'FAN_VIP' | 'AMBASSADEUR_PAIECASH' | null;

// Taux de rémunération (en EUR)
export const REWARD_RATES = {
  LIKE: 0.01,
  SHARE: 0.05,
  COMMENT: 0.02,
  VIEW: 0.005,
  PURCHASE_STANDARD: 0.05, // 5% cashback
  PURCHASE_LIVE: 0.10,     // 10% cashback live shopping
  REFERRAL: 2.00
};

// Commission ambassadeur par niveau
export const AMBASSADOR_COMMISSION = {
  JOUEUR: 0.20,            // 20%
  FAN_VIP: 0.10,           // 10%
  AMBASSADEUR_PAIECASH: 0.15 // 15%
};

// Sponsors actifs
export interface Sponsor {
  id: string;
  name: string;
  type: SponsorType;
  logo: string;
  clubId: string;
  active: boolean;
}

// Campagne sponsor
export interface Campaign {
  id: string;
  sponsorId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  active: boolean;
}

// Interaction trackée
export interface TrackedInteraction {
  id: string;
  userId: string;
  userName: string;
  interactionType: InteractionType;
  campaignId: string;
  campaignName: string;
  sponsorId: string;
  sponsorName: string;
  sponsorType: SponsorType;
  clubId: string;
  postId?: string;
  productId?: string;
  purchaseAmount?: number;
  isLiveShopping?: boolean;
  reward: number;
  currency: string;
  timestamp: string;
  validated: boolean;
}

// Statut ambassadeur
export interface AmbassadorStatus {
  userId: string;
  level: AmbassadorLevel;
  followers: number;
  totalInteractions: number;
  totalReferrals: number;
  commission: number;
  joinedAt: string;
}

/**
 * Classe principale de la Régie Publicitaire
 */
export class RegiePublicitaireSponsors {
  private interactions: TrackedInteraction[] = [];
  private sponsors: Sponsor[] = [];
  private campaigns: Campaign[] = [];
  private ambassadors: Map<string, AmbassadorStatus> = new Map();

  constructor() {
    this.initializeDefaultSponsors();
  }

  /**
   * Initialise les sponsors par défaut
   */
  private initializeDefaultSponsors() {
    this.sponsors = [
      {
        id: 'sponsor_maroc',
        name: 'Maroc Tourisme',
        type: 'PAYS',
        logo: 'https://i.pravatar.cc/50?img=50',
        clubId: 'OM',
        active: true
      },
      {
        id: 'sponsor_marseille',
        name: 'Ville de Marseille',
        type: 'VILLE',
        logo: 'https://i.pravatar.cc/50?img=51',
        clubId: 'OM',
        active: true
      },
      {
        id: 'sponsor_puma',
        name: 'Puma',
        type: 'MARQUE',
        logo: 'https://i.pravatar.cc/50?img=52',
        clubId: 'OM',
        active: true
      },
      {
        id: 'sponsor_pizza',
        name: 'La Pizza du Stade',
        type: 'PRODUIT',
        logo: 'https://i.pravatar.cc/50?img=53',
        clubId: 'OM',
        active: true
      }
    ];

    this.campaigns = [
      {
        id: 'MAROC_2025',
        sponsorId: 'sponsor_maroc',
        name: 'Découvrez le Maroc',
        description: 'Séjours au Maroc -30% pour les fans OM',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        budget: 50000,
        active: true
      },
      {
        id: 'PUMA_COLLECTION_2025',
        sponsorId: 'sponsor_puma',
        name: 'Collection 2025',
        description: 'Nouvelle collection Puma OM',
        startDate: '2025-06-01',
        endDate: '2025-08-31',
        budget: 100000,
        active: true
      }
    ];
  }

  /**
   * Tracker une interaction utilisateur
   */
  trackInteraction(data: {
    userId: string;
    userName: string;
    interactionType: InteractionType;
    campaignId: string;
    campaignName: string;
    sponsorId: string;
    sponsorName: string;
    sponsorType: SponsorType;
    clubId: string;
    postId?: string;
    productId?: string;
    purchaseAmount?: number;
    isLiveShopping?: boolean;
  }): TrackedInteraction {
    // Calculer la récompense
    let reward = 0;

    switch (data.interactionType) {
      case 'LIKE':
        reward = REWARD_RATES.LIKE;
        break;
      case 'SHARE':
        reward = REWARD_RATES.SHARE;
        break;
      case 'COMMENT':
        reward = REWARD_RATES.COMMENT;
        break;
      case 'VIEW':
        reward = REWARD_RATES.VIEW;
        break;
      case 'PURCHASE':
        if (data.purchaseAmount) {
          const rate = data.isLiveShopping 
            ? REWARD_RATES.PURCHASE_LIVE 
            : REWARD_RATES.PURCHASE_STANDARD;
          reward = data.purchaseAmount * rate;
        }
        break;
      case 'REFERRAL':
        reward = REWARD_RATES.REFERRAL;
        break;
    }

    // Créer l'interaction
    const interaction: TrackedInteraction = {
      id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      reward,
      currency: this.getClubStablecoin(data.clubId),
      timestamp: new Date().toISOString(),
      validated: false
    };

    // Sauvegarder l'interaction
    this.interactions.push(interaction);

    // Mettre à jour le wallet utilisateur (via API)
    this.updateUserWallet(data.userId, reward, interaction.currency);

    // Si l'utilisateur est ambassadeur, calculer sa commission
    const ambassador = this.ambassadors.get(data.userId);
    if (ambassador) {
      this.calculateAmbassadorCommission(data.userId, reward);
    }

    return interaction;
  }

  /**
   * Obtenir le stablecoin du club
   */
  private getClubStablecoin(clubId: string): string {
    const stablecoins: Record<string, string> = {
      'OM': 'OMC',
      'PSG': 'PSC',
      'LOSC': 'LOSC',
      'ASM': 'ASC',
      'OL': 'OLC',
      'ASSE': 'ASSE'
    };

    return stablecoins[clubId] || 'PCC';
  }

  /**
   * Mettre à jour le wallet utilisateur
   */
  private async updateUserWallet(userId: string, amount: number, currency: string) {
    // Ici on ferait un appel API réel
    console.log(`💰 Wallet updated: User ${userId} +${amount} ${currency}`);
    
    // Notification utilisateur
    this.notifyUser(userId, {
      type: 'REWARD_EARNED',
      amount,
      currency,
      message: `🎉 Vous avez gagné ${amount.toFixed(2)} ${currency} !`
    });
  }

  /**
   * Notifier l'utilisateur
   */
  private notifyUser(userId: string, notification: any) {
    // Ici on enverrait une vraie notification push
    console.log(`📢 Notification sent to user ${userId}:`, notification);
  }

  /**
   * Calculer la commission ambassadeur
   */
  private calculateAmbassadorCommission(userId: string, baseReward: number) {
    const ambassador = this.ambassadors.get(userId);
    if (!ambassador || !ambassador.level) return;

    const commissionRate = AMBASSADOR_COMMISSION[ambassador.level];
    const commission = baseReward * commissionRate;

    ambassador.commission += commission;

    console.log(`👑 Ambassador ${userId} earned commission: ${commission.toFixed(2)}`);
  }

  /**
   * Obtenir le statut ambassadeur d'un utilisateur
   */
  getAmbassadorStatus(userId: string): AmbassadorStatus | null {
    return this.ambassadors.get(userId) || null;
  }

  /**
   * Mettre à jour le niveau ambassadeur
   */
  updateAmbassadorLevel(userId: string, level: AmbassadorLevel) {
    let ambassador = this.ambassadors.get(userId);

    if (!ambassador) {
      ambassador = {
        userId,
        level,
        followers: 0,
        totalInteractions: 0,
        totalReferrals: 0,
        commission: 0,
        joinedAt: new Date().toISOString()
      };
    } else {
      ambassador.level = level;
    }

    this.ambassadors.set(userId, ambassador);
  }

  /**
   * Obtenir les campagnes actives pour un club
   */
  getActiveCampaigns(clubId: string): Campaign[] {
    return this.campaigns.filter(c => {
      const sponsor = this.sponsors.find(s => s.id === c.sponsorId);
      return c.active && sponsor?.clubId === clubId && sponsor?.active;
    });
  }

  /**
   * Obtenir les sponsors actifs pour un club
   */
  getActiveSponsors(clubId: string): Sponsor[] {
    return this.sponsors.filter(s => s.active && s.clubId === clubId);
  }

  /**
   * Obtenir les statistiques d'un utilisateur
   */
  getUserStats(userId: string) {
    const userInteractions = this.interactions.filter(i => i.userId === userId);
    const totalRewards = userInteractions.reduce((sum, i) => sum + i.reward, 0);
    const ambassador = this.ambassadors.get(userId);

    return {
      totalInteractions: userInteractions.length,
      totalRewards,
      byType: {
        likes: userInteractions.filter(i => i.interactionType === 'LIKE').length,
        shares: userInteractions.filter(i => i.interactionType === 'SHARE').length,
        comments: userInteractions.filter(i => i.interactionType === 'COMMENT').length,
        purchases: userInteractions.filter(i => i.interactionType === 'PURCHASE').length,
        views: userInteractions.filter(i => i.interactionType === 'VIEW').length,
        referrals: userInteractions.filter(i => i.interactionType === 'REFERRAL').length
      },
      ambassador: ambassador ? {
        level: ambassador.level,
        commission: ambassador.commission,
        followers: ambassador.followers
      } : null
    };
  }

  /**
   * Obtenir toutes les interactions
   */
  getAllInteractions(): TrackedInteraction[] {
    return this.interactions;
  }

  /**
   * Obtenir les interactions d'un utilisateur
   */
  getUserInteractions(userId: string): TrackedInteraction[] {
    return this.interactions.filter(i => i.userId === userId);
  }
}

// Instance globale
export const regiePublicitaire = new RegiePublicitaireSponsors();
