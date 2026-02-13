// Type definitions for PaieCashFan API
export type User = {
  id: string;
  email: string;
  name: string;
  clubId: string;
  createdAt: string;
};

export type WalletBalance = {
  pcc: number; // PaieCash Coins
  eur: number;
  stablecoins: {
    [key: string]: number; // OMC, PSC, LOSC, etc.
  };
};

export type Transaction = {
  id: string;
  userId: string;
  type: 'send' | 'receive' | 'deposit' | 'withdraw' | 'cashback';
  amount: number;
  currency: string;
  timestamp: string;
  description: string;
};

export type Story = {
  id: string;
  type: 'club' | 'fan' | 'sponsor';
  name: string;
  avatar: string;
  content?: string;
  isLive?: boolean;
  timestamp: string;
  likes?: number;
  views?: number;
};

export type Post = {
  id: string;
  club: string;
  clubAvatar: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  verified: boolean;
  pccReward: number;
  sponsor?: Sponsor;
};

export type Sponsor = {
  id: string;
  name: string;
  type: 'PAYS' | 'VILLE' | 'MARQUE' | 'PRODUIT';
  logo: string;
  campaignId: string;
  campaignName: string;
};

export type Interaction = {
  id: string;
  userId: string;
  type: 'LIKE' | 'SHARE' | 'COMMENT' | 'PURCHASE' | 'VIEW' | 'REFERRAL';
  campaignId: string;
  sponsorId: string;
  reward: number;
  currency: string;
  timestamp: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  club: string;
  stock: number;
  discount?: number;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  venue: string;
  club: string;
  competition: string;
  price: number;
  available: boolean;
};

export type ESIMPlan = {
  id: string;
  name: string;
  data: string;
  duration: string;
  coverage: string;
  price: number;
};

export type AIRecommendation = {
  id: number;
  type: 'match' | 'product' | 'event';
  title: string;
  description: string;
  confidence: number;
};

export type AIInsights = {
  favoriteTeam: string;
  favoritePlayer: string;
  shoppingStyle: string;
  engagementLevel: string;
  nextPurchaseProbability: number;
};

export type AIPredictions = {
  nextPurchase: string;
  nextPurchaseProbability: number;
  predictedSpending: number;
  futureEngagement: string;
  recommendedLevel: string;
};
