// ============================================================
// Mock data pour le fan engagement de la page club (Phase E.1) :
// wallet, fans en ligne, transactions live.
// À remplacer plus tard par des fetch /api/users/me/wallet,
// /api/clubs/:slug/fans, etc.
// ============================================================

export const mockWallet = {
  bank: {
    label: 'Compte Bancaire',
    balance: 1250.50,
    currency: 'EUR',
    note: 'Compte courant principal'
  },
  crypto: {
    label: 'Wallet Crypto',
    balance: 250.00,
    currency: 'USDC',
    address: '0x1234…5678'
  }
};

export const mockFans = [
  { id: 'u1', name: 'AS Monaco', avatar: null,                                                          online: true,  initials: 'AM' },
  { id: 'u2', name: 'Marc Dubois',    avatar: 'https://i.pravatar.cc/100?img=12', online: true  },
  { id: 'u3', name: 'Sophie Martin',  avatar: 'https://i.pravatar.cc/100?img=1',  online: true  },
  { id: 'u4', name: 'Thomas Leroy',   avatar: 'https://i.pravatar.cc/100?img=14', online: false },
  { id: 'u5', name: 'Julie Moreau',   avatar: 'https://i.pravatar.cc/100?img=5',  online: true  },
  { id: 'u6', name: 'Ahmed D.',       avatar: 'https://i.pravatar.cc/100?img=33', online: false },
  { id: 'u7', name: 'Emma Laurent',   avatar: 'https://i.pravatar.cc/100?img=9',  online: true  },
  { id: 'u8', name: 'Lucas Bernard',  avatar: 'https://i.pravatar.cc/100?img=15', online: false },
  { id: 'u9', name: 'Camille Roux',   avatar: 'https://i.pravatar.cc/100?img=10', online: true  }
];

export const mockTransactions = [
  {
    id: 't1',
    label: 'Marc Dubois',
    sub: 'Il y a 2 min',
    amount: 20,
    direction: 'in',
    type: 'p2p',
    icon: '💸'
  },
  {
    id: 't2',
    label: 'Billet Monaco vs PSG',
    sub: 'Il y a 15 min',
    amount: -45,
    direction: 'out',
    type: 'ticket',
    icon: '🎫'
  },
  {
    id: 't3',
    label: 'Cashback Shop',
    sub: 'Il y a 1h',
    amount: 5,
    direction: 'in',
    type: 'cashback',
    icon: '🎁'
  },
  {
    id: 't4',
    label: 'Recharge eSIM Maroc',
    sub: 'Il y a 3h',
    amount: -29.99,
    direction: 'out',
    type: 'esim',
    icon: '📱'
  },
  {
    id: 't5',
    label: 'Tombola du soir',
    sub: 'Hier',
    amount: 100,
    direction: 'in',
    type: 'tombola',
    icon: '🏆'
  }
];

// Stats inline du Hero (TOTAL TROPHIES / YEAR FOUNDED / SQUAD SIZE / FAN TOKENS)
// Fallback générique quand on n'a pas de data réelle pour le club.
export function fallbackHeroStats(club) {
  return {
    trophies: 1,
    founded:  club.founded || '—',
    squad:    1,
    tokens:   '0.0M'
  };
}

// Compte-rendu du nombre de fans online affichés
export function onlineCount(fans) {
  return fans.filter((f) => f.online).length;
}
