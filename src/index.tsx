import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { 
  User, WalletBalance, Transaction, Story, Post, 
  Product, Event, ESIMPlan, AIRecommendation, AIInsights, AIPredictions,
  Interaction, Sponsor
} from './api/types'
import whaazs from './routes/whaazs'
import stream from './routes/stream'
import auth from './routes/auth'
import costreaming from './routes/costreaming'
import vendorStreams from './routes/vendorStreams'

const app = new Hono()

// Enable CORS
app.use('/api/*', cors())

// Mount Whaazs routes
app.route('/api/whaazs', whaazs)

// Mount Cloudflare Stream routes
app.route('/api/stream', stream)

// Mount Authentication routes
app.route('/api/auth', auth)

// Mount Co-Streaming routes
app.route('/api/costreaming', costreaming)

// Mount Vendor Streams routes (Live Shopping Multi-Tenant)
app.route('/api/vendor/stream', vendorStreams)
app.route('/api/vendor/streams', vendorStreams)

// ==========================================
// FEDERATIONS API (NEW - NO EMOJIS)
// ==========================================

app.get('/api/federations', (c) => {
  const federations = [
    {
      id: 'caf',
      name: 'CAF',
      fullName: 'Confederation Africaine de Football',
      flag: 'AF',
      region: 'Africa',
      clubsCount: 54,
      merchandisingEnabled: true
    },
    {
      id: 'uefa',
      name: 'UEFA',
      fullName: 'Union of European Football Associations',
      flag: 'EU',
      region: 'Europe',
      clubsCount: 55,
      merchandisingEnabled: false
    },
    {
      id: 'conmebol',
      name: 'CONMEBOL',
      fullName: 'Confederacion Sudamericana de Futbol',
      flag: 'SA',
      region: 'South America',
      clubsCount: 10,
      merchandisingEnabled: false
    },
    {
      id: 'concacaf',
      name: 'CONCACAF',
      fullName: 'Confederation of North, Central America and Caribbean',
      flag: 'NA',
      region: 'North America',
      clubsCount: 35,
      merchandisingEnabled: false
    },
    {
      id: 'afc',
      name: 'AFC',
      fullName: 'Asian Football Confederation',
      flag: 'AS',
      region: 'Asia',
      clubsCount: 47,
      merchandisingEnabled: false
    },
    {
      id: 'ofc',
      name: 'OFC',
      fullName: 'Oceania Football Confederation',
      flag: 'OC',
      region: 'Oceania',
      clubsCount: 11,
      merchandisingEnabled: false
    }
  ]
  
  return c.json({ success: true, federations })
})

app.get('/api/federations/:fedId/clubs', (c) => {
  const fedId = c.req.param('fedId')
  
  const clubsData: Record<string, any[]> = {
    caf: [
      { id: 'ma', name: 'Maroc', flag: 'MA', type: 'national', region: 'North Africa' },
      { id: 'dz', name: 'Algerie', flag: 'DZ', type: 'national', region: 'North Africa' },
      { id: 'eg', name: 'Egypte', flag: 'EG', type: 'national', region: 'North Africa' },
      { id: 'tn', name: 'Tunisie', flag: 'TN', type: 'national', region: 'North Africa' },
      { id: 'sn', name: 'Senegal', flag: 'SN', type: 'national', region: 'West Africa' },
      { id: 'ci', name: 'Cote d\'Ivoire', flag: 'CI', type: 'national', region: 'West Africa' },
      { id: 'ng', name: 'Nigeria', flag: 'NG', type: 'national', region: 'West Africa' },
      { id: 'gh', name: 'Ghana', flag: 'GH', type: 'national', region: 'West Africa' },
      { id: 'cm', name: 'Cameroun', flag: 'CM', type: 'national', region: 'Central Africa' },
      { id: 'za', name: 'Afrique du Sud', flag: 'ZA', type: 'national', region: 'Southern Africa' }
    ],
    uefa: [
      { id: 'fr', name: 'France', flag: 'FR', type: 'national', region: 'Western Europe' },
      { id: 'es', name: 'Espagne', flag: 'ES', type: 'national', region: 'Southern Europe' },
      { id: 'de', name: 'Allemagne', flag: 'DE', type: 'national', region: 'Western Europe' },
      { id: 'it', name: 'Italie', flag: 'IT', type: 'national', region: 'Southern Europe' },
      { id: 'gb-eng', name: 'Angleterre', flag: 'GB', type: 'national', region: 'Northern Europe' },
      { id: 'pt', name: 'Portugal', flag: 'PT', type: 'national', region: 'Southern Europe' }
    ],
    conmebol: [
      { id: 'br', name: 'Bresil', flag: 'BR', type: 'national', region: 'South America' },
      { id: 'ar', name: 'Argentine', flag: 'AR', type: 'national', region: 'South America' },
      { id: 'uy', name: 'Uruguay', flag: 'UY', type: 'national', region: 'South America' }
    ]
  }
  
  const clubs = clubsData[fedId] || []
  
  return c.json({ success: true, federation: fedId, clubs })
})

// ==========================================
// CLUBS & MERCHANDISING (NO EMOJIS)
// ==========================================

app.get('/api/clubs/:clubId', (c) => {
  const clubId = c.req.param('clubId')
  
  const club = {
    id: clubId,
    name: 'Maroc',
    flag: 'MA',
    federation: 'CAF',
    type: 'national',
    colors: {
      primary: '#FF0000',
      secondary: '#007A33'
    },
    sponsors: [
      { name: 'ONMT', type: 'Principal', logo: 'ONMT' },
      { name: 'Maroc Telecom', type: 'Partenaire Officiel', logo: 'IAM' }
    ],
    stats: {
      fans: 15000000,
      products: 25,
      revenue: 5000000
    }
  }
  
  return c.json({ success: true, club })
})

app.get('/api/clubs/:clubId/merchandising', (c) => {
  const clubId = c.req.param('clubId')
  
  const products = [
    {
      id: 'jersey-home',
      name: 'Maillot Domicile 2026',
      category: 'jersey',
      price: { eur: 79.99, fcfa: 52479 },
      stock: 150,
      image: '/static/images/jersey-home.jpg',
      hot: true
    },
    {
      id: 'scarf',
      name: 'Echarpe Officielle',
      category: 'accessories',
      price: { eur: 19.99, fcfa: 13113 },
      stock: 300,
      image: '/static/images/scarf.jpg'
    },
    {
      id: 'cap',
      name: 'Casquette Officielle',
      category: 'accessories',
      price: { eur: 17.99, fcfa: 11801 },
      stock: 200,
      image: '/static/images/cap.jpg'
    }
  ]
  
  return c.json({ success: true, clubId, products })
})

app.post('/api/merchandising/purchase', async (c) => {
  const body = await c.req.json()
  const { productId, clubId, quantity, paymentMethod } = body
  
  const order = {
    success: true,
    orderId: `ORD-${Date.now()}`,
    productId,
    clubId,
    quantity,
    total: { eur: 79.99 * quantity, fcfa: 52479 * quantity },
    paymentMethod,
    status: 'pending',
    timestamp: new Date().toISOString()
  }
  
  return c.json(order)
})

// ==========================================
// AUTH ENDPOINTS (2)
// ==========================================

app.post('/api/auth/register', async (c) => {
  const { email, password, name, clubId } = await c.req.json()
  
  const user: User = {
    id: `user_${Date.now()}`,
    email,
    name,
    clubId,
    createdAt: new Date().toISOString()
  }
  
  const token = `jwt_${Buffer.from(user.id).toString('base64')}`
  
  return c.json({ success: true, user, token })
})

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  
  const user: User = {
    id: `user_${Date.now()}`,
    email,
    name: 'Demo User',
    clubId: 'OM',
    createdAt: new Date().toISOString()
  }
  
  const token = `jwt_${Buffer.from(user.id).toString('base64')}`
  
  return c.json({ success: true, user, token })
})

// ==========================================
// WALLET ENDPOINTS (4)
// ==========================================

app.get('/api/wallet/balance', (c) => {
  const balance: WalletBalance = {
    pcc: 1247.50,
    eur: 1247.50,
    stablecoins: {
      OMC: 50.00,
      PSC: 75.00,
      LOSC: 25.00,
      ASC: 30.00
    }
  }
  
  return c.json({ success: true, balance })
})

app.get('/api/wallet/transactions', (c) => {
  const transactions: Transaction[] = [
    {
      id: 'tx_1',
      userId: 'user_123',
      type: 'cashback',
      amount: 5.00,
      currency: 'OMC',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      description: 'Cashback achat maillot OM'
    },
    {
      id: 'tx_2',
      userId: 'user_123',
      type: 'receive',
      amount: 2.00,
      currency: 'PCC',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      description: 'Parrainage nouveau fan'
    },
    {
      id: 'tx_3',
      userId: 'user_123',
      type: 'send',
      amount: 20.00,
      currency: 'EUR',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      description: 'Envoi a @JeanMartin'
    }
  ]
  
  return c.json({ success: true, transactions })
})

app.post('/api/wallet/send', async (c) => {
  const { recipient, amount, currency, pin } = await c.req.json()
  
  const transaction: Transaction = {
    id: `tx_${Date.now()}`,
    userId: 'user_123',
    type: 'send',
    amount,
    currency,
    timestamp: new Date().toISOString(),
    description: `Envoi a ${recipient}`
  }
  
  return c.json({ success: true, transaction })
})

app.post('/api/wallet/deposit', async (c) => {
  const { amount, currency } = await c.req.json()
  
  const transaction: Transaction = {
    id: `tx_${Date.now()}`,
    userId: 'user_123',
    type: 'deposit',
    amount,
    currency,
    timestamp: new Date().toISOString(),
    description: `Depot de ${amount} ${currency}`
  }
  
  return c.json({ success: true, transaction })
})

// ==========================================
// STORIES & FEED ENDPOINTS (3 - NO EMOJIS)
// ==========================================

app.get('/api/stories', (c) => {
  const club = c.req.query('club') || 'Olympique de Marseille'
  
  const stories: Story[] = [
    {
      id: 'club-live',
      type: 'club',
      name: club,
      avatar: 'https://i.pravatar.cc/150?img=70',
      isLive: true,
      timestamp: '2h'
    },
    {
      id: 'story-1',
      type: 'fan',
      name: 'Sophie Martin',
      avatar: 'https://i.pravatar.cc/150?img=1',
      content: `Quelle victoire hier soir ! ${club} est de retour au sommet !`,
      timestamp: '3h',
      likes: 245,
      views: 1203
    },
    {
      id: 'story-2',
      type: 'fan',
      name: 'Thomas Dupont',
      avatar: 'https://i.pravatar.cc/150?img=12',
      content: `J'ai mes billets pour le prochain match de ${club} !`,
      timestamp: '5h',
      likes: 189,
      views: 892
    },
    {
      id: 'story-sponsor',
      type: 'sponsor',
      name: 'Maroc Tourisme',
      avatar: 'https://i.pravatar.cc/150?img=50',
      content: 'Decouvrez le Maroc avec -30% sur les sejours !',
      timestamp: '1h',
      likes: 521,
      views: 2134
    }
  ]
  
  return c.json({ success: true, stories, club })
})

app.get('/api/feed', (c) => {
  const club = c.req.query('club') || 'Olympique de Marseille'
  
  const sponsor: Sponsor = {
    id: 'sponsor_maroc',
    name: 'Maroc Tourisme',
    type: 'PAYS',
    logo: 'https://i.pravatar.cc/50?img=50',
    campaignId: 'MAROC_2025',
    campaignName: 'Decouvrez le Maroc'
  }
  
  const posts: Post[] = [
    {
      id: 'post-1',
      club: club,
      clubAvatar: 'https://i.pravatar.cc/150?img=70',
      content: `Nouveau partenariat exclusif entre ${club} et Maroc Tourisme ! Decouvrez nos offres speciales pour les fans.`,
      image: 'https://picsum.photos/800/600?random=1',
      timestamp: '2h',
      likes: 2456,
      comments: 128,
      shares: 89,
      verified: true,
      pccReward: 5,
      sponsor
    },
    {
      id: 'post-2',
      club: club,
      clubAvatar: 'https://i.pravatar.cc/150?img=70',
      content: `LIVE SHOPPING ! Nouveau maillot ${club} 2025-2026 disponible maintenant avec 10% cashback !`,
      image: 'https://picsum.photos/800/600?random=2',
      timestamp: '5h',
      likes: 3892,
      comments: 256,
      shares: 145,
      verified: true,
      pccReward: 10
    }
  ]
  
  return c.json({ success: true, posts, club })
})

app.post('/api/interactions/track', async (c) => {
  const { type, campaignId, sponsorId, postId, amount } = await c.req.json()
  
  const rewards = {
    'LIKE': 0.01,
    'SHARE': 0.05,
    'COMMENT': 0.02,
    'VIEW': 0.005,
    'PURCHASE': amount ? amount * 0.05 : 0,
    'REFERRAL': 2.00
  }
  
  const interaction: Interaction = {
    id: `int_${Date.now()}`,
    userId: 'user_123',
    type,
    campaignId,
    sponsorId,
    reward: rewards[type] || 0,
    currency: 'OMC',
    timestamp: new Date().toISOString()
  }
  
  return c.json({ success: true, interaction })
})

// ==========================================
// ESIM ENDPOINTS (3)
// ==========================================

app.get('/api/esim/plans', (c) => {
  const plans: ESIMPlan[] = [
    {
      id: 'europe-unlimited',
      name: 'Europe Unlimited',
      data: 'Illimite',
      duration: '30 jours',
      coverage: '35 pays europeens',
      price: 29.99
    },
    {
      id: 'world-5gb',
      name: 'World 5GB',
      data: '5 GB',
      duration: '15 jours',
      coverage: '120+ pays',
      price: 19.99
    },
    {
      id: 'france-10gb',
      name: 'France 10GB',
      data: '10 GB',
      duration: '30 jours',
      coverage: 'France',
      price: 9.99
    }
  ]
  
  return c.json({ success: true, plans })
})

app.post('/api/esim/activate', async (c) => {
  const { planId } = await c.req.json()
  
  return c.json({
    success: true,
    activation: {
      planId,
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      activatedAt: new Date().toISOString()
    }
  })
})

app.get('/api/esim/active', (c) => {
  return c.json({
    success: true,
    active: {
      planId: 'europe-unlimited',
      name: 'Europe Unlimited',
      dataUsed: 47,
      dataTotal: 100,
      daysRemaining: 28,
      expiresAt: new Date(Date.now() + 28 * 24 * 3600000).toISOString()
    }
  })
})

// ==========================================
// SHOP ENDPOINTS (4)
// ==========================================

app.get('/api/shop/products', (c) => {
  const club = c.req.query('club') || 'OM'
  const category = c.req.query('category')
  
  const products: Product[] = [
    {
      id: 'prod-1',
      name: `Maillot ${club} Domicile 2025`,
      price: 94.99,
      image: 'https://picsum.photos/400/400?random=10',
      category: 'maillots',
      club,
      stock: 150,
      discount: 20
    },
    {
      id: 'prod-2',
      name: `Echarpe ${club} Officielle`,
      price: 24.99,
      image: 'https://picsum.photos/400/400?random=11',
      category: 'accessoires',
      club,
      stock: 300
    },
    {
      id: 'prod-3',
      name: `NFT Badge ${club} Gold`,
      price: 149.99,
      image: 'https://picsum.photos/400/400?random=12',
      category: 'nft',
      club,
      stock: 50
    }
  ]
  
  const filtered = category 
    ? products.filter(p => p.category === category)
    : products
  
  return c.json({ success: true, products: filtered })
})

app.post('/api/shop/cart/add', async (c) => {
  const { productId, quantity } = await c.req.json()
  
  return c.json({
    success: true,
    cart: {
      items: [{ productId, quantity }],
      total: 94.99,
      itemCount: 1
    }
  })
})

app.get('/api/shop/cart', (c) => {
  return c.json({
    success: true,
    cart: {
      items: [],
      total: 0,
      itemCount: 0
    }
  })
})

app.post('/api/shop/checkout', async (c) => {
  const { items, total } = await c.req.json()
  
  return c.json({
    success: true,
    order: {
      id: `order_${Date.now()}`,
      items,
      total,
      cashback: total * 0.05,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    }
  })
})

// ==========================================
// TICKETS ENDPOINTS (4)
// ==========================================

app.get('/api/tickets/events', (c) => {
  const club = c.req.query('club') || 'OM'
  
  const events: Event[] = [
    {
      id: 'event-1',
      title: `${club} vs PSG`,
      date: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
      venue: 'Orange Velodrome',
      club,
      competition: 'Ligue 1',
      price: 89.99,
      available: true
    },
    {
      id: 'event-2',
      title: `${club} vs Monaco`,
      date: new Date(Date.now() + 14 * 24 * 3600000).toISOString(),
      venue: 'Orange Velodrome',
      club,
      competition: 'Ligue 1',
      price: 69.99,
      available: true
    }
  ]
  
  return c.json({ success: true, events })
})

app.post('/api/tickets/purchase', async (c) => {
  const { eventId, category, price } = await c.req.json()
  
  return c.json({
    success: true,
    ticket: {
      id: `ticket_${Date.now()}`,
      eventId,
      category,
      price,
      qrCode: 'QR_CODE_DATA',
      purchasedAt: new Date().toISOString()
    }
  })
})

app.get('/api/tickets/my-tickets', (c) => {
  return c.json({
    success: true,
    tickets: []
  })
})

app.get('/api/tickets/:id/qr', (c) => {
  const id = c.req.param('id')
  
  return c.json({
    success: true,
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  })
})

// ==========================================
// SOCIAL ENDPOINTS (3)
// ==========================================

app.get('/api/social/conversations', (c) => {
  return c.json({
    success: true,
    conversations: [
      {
        id: 'conv-1',
        name: 'Groupe Fans OM',
        avatar: 'https://i.pravatar.cc/150?img=20',
        lastMessage: 'Super match hier !',
        timestamp: new Date().toISOString(),
        unread: 2
      }
    ]
  })
})

app.post('/api/social/messages', async (c) => {
  const { conversationId, message } = await c.req.json()
  
  return c.json({
    success: true,
    message: {
      id: `msg_${Date.now()}`,
      conversationId,
      message,
      sentAt: new Date().toISOString()
    }
  })
})

app.get('/api/social/feed', (c) => {
  return c.json({
    success: true,
    feed: []
  })
})

// ==========================================
// AI ENDPOINTS (3)
// ==========================================

app.get('/api/ai/recommendations', (c) => {
  const recommendations: AIRecommendation[] = [
    {
      id: 1,
      type: 'match',
      title: 'OM vs PSG - Classique',
      description: 'Ne ratez pas le Classique ! Billets disponibles',
      confidence: 0.92
    },
    {
      id: 2,
      type: 'product',
      title: 'Nouveau maillot OM 2025',
      description: 'Base sur vos achats precedents',
      confidence: 0.87
    },
    {
      id: 3,
      type: 'event',
      title: 'Rencontre avec Drogba',
      description: 'Evenement exclusif pour fans VIP',
      confidence: 0.78
    }
  ]
  
  return c.json({ success: true, recommendations })
})

app.get('/api/ai/insights', (c) => {
  const insights: AIInsights = {
    favoriteTeam: 'Olympique de Marseille',
    favoritePlayer: 'Dimitri Payet',
    shoppingStyle: 'Premium collector',
    engagementLevel: 'Gold Fan',
    nextPurchaseProbability: 0.87
  }
  
  return c.json({ success: true, insights })
})

app.get('/api/ai/predictions', (c) => {
  const predictions: AIPredictions = {
    nextPurchase: 'Maillot Third 2025',
    nextPurchaseProbability: 0.87,
    predictedSpending: 142.50,
    futureEngagement: '3.2x more active',
    recommendedLevel: 'Platinum'
  }
  
  return c.json({ success: true, predictions })
})

// ==========================================
// SYSTEM ENDPOINTS (2)
// ==========================================

app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    version: '8.0.0',
    timestamp: new Date().toISOString(),
    services: {
      auth: 'ok',
      wallet: 'ok',
      esim: 'ok',
      shop: 'ok',
      tickets: 'ok',
      social: 'ok',
      ai: 'ok'
    }
  })
})

app.get('/api/stats', (c) => {
  return c.json({
    success: true,
    stats: {
      totalUsers: 125847,
      totalTransactions: 1456789,
      totalVolume: 45678901.23,
      activeClubs: 500,
      activeFederations: 211
    }
  })
})

// ==========================================
// MAIN ROUTES - SERVE HTML
// ==========================================

// Redirect root to index.html
app.get('/', (c) => {
  return c.redirect('/index.html')
})

export default app
