import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { 
  User, WalletBalance, Transaction, Story, Post, 
  Product, Event, ESIMPlan, AIRecommendation, AIInsights, AIPredictions,
  Interaction, Sponsor
} from './api/types'

const app = new Hono()

// Enable CORS
app.use('/*', cors())

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
      OMC: 50.00,  // Olympique de Marseille Coin
      PSC: 75.00,  // Paris Saint-Germain Coin
      LOSC: 25.00, // Lille OSC Coin
      ASC: 30.00   // AS Monaco Coin
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
      description: 'Envoi à @JeanMartin'
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
    description: `Envoi à ${recipient}`
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
    description: `Dépôt de ${amount} ${currency}`
  }
  
  return c.json({ success: true, transaction })
})

// ==========================================
// STORIES & FEED ENDPOINTS (3)
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
      content: `⚽ Quelle victoire hier soir ! ${club} est de retour au sommet !`,
      timestamp: '3h',
      likes: 245,
      views: 1203
    },
    {
      id: 'story-2',
      type: 'fan',
      name: 'Thomas Dupont',
      avatar: 'https://i.pravatar.cc/150?img=12',
      content: `🎟️ J'ai mes billets pour le prochain match de ${club} !`,
      timestamp: '5h',
      likes: 189,
      views: 892
    },
    {
      id: 'story-sponsor',
      type: 'sponsor',
      name: 'Maroc Tourisme',
      avatar: 'https://i.pravatar.cc/150?img=50',
      content: '🌍 Découvrez le Maroc avec -30% sur les séjours !',
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
    campaignName: 'Découvrez le Maroc'
  }
  
  const posts: Post[] = [
    {
      id: 'post-1',
      club: club,
      clubAvatar: 'https://i.pravatar.cc/150?img=70',
      content: `📢 Nouveau partenariat exclusif entre ${club} et Maroc Tourisme ! Découvrez nos offres spéciales pour les fans.`,
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
      content: `🔴 LIVE SHOPPING ! Nouveau maillot ${club} 2025-2026 disponible maintenant avec 10% cashback !`,
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
      data: 'Illimité',
      duration: '30 jours',
      coverage: '35 pays européens',
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
      name: `Écharpe ${club} Officielle`,
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
      venue: 'Orange Vélodrome',
      club,
      competition: 'Ligue 1',
      price: 89.99,
      available: true
    },
    {
      id: 'event-2',
      title: `${club} vs Monaco`,
      date: new Date(Date.now() + 14 * 24 * 3600000).toISOString(),
      venue: 'Orange Vélodrome',
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
      description: 'Basé sur vos achats précédents',
      confidence: 0.87
    },
    {
      id: 3,
      type: 'event',
      title: 'Rencontre avec Drogba',
      description: 'Événement exclusif pour fans VIP',
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
    version: '7.0.0',
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
// MAIN APP PAGE
// ==========================================

app.get('/', (c) => {
  const club = c.req.query('club') || 'Olympique de Marseille'
  const logo = c.req.query('logo') || '⚽'
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PaieCashFan - ${club}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Inter', sans-serif; 
                background: linear-gradient(135deg, #0a0e1a 0%, #1a2332 100%);
                color: white;
                overflow-x: hidden;
            }
            
            /* Header Sticky */
            .header {
                position: sticky;
                top: 0;
                z-index: 50;
                background: rgba(10, 14, 26, 0.95);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding: 15px 20px;
            }
            
            /* Stories Horizontal Scroll */
            .stories-container {
                display: flex;
                gap: 15px;
                padding: 20px;
                overflow-x: auto;
                scrollbar-width: none;
            }
            .stories-container::-webkit-scrollbar { display: none; }
            
            .story-item {
                flex-shrink: 0;
                width: 80px;
                text-align: center;
                cursor: pointer;
                transition: transform 0.2s;
            }
            .story-item:hover { transform: scale(1.05); }
            
            .story-avatar {
                width: 70px;
                height: 70px;
                border-radius: 50%;
                background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
                padding: 3px;
                margin: 0 auto 8px;
                position: relative;
            }
            .story-avatar.live {
                background: linear-gradient(45deg, #ff0000, #ff4400);
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            .story-avatar img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 3px solid #0a0e1a;
                object-fit: cover;
            }
            
            /* Feed Post */
            .feed-post {
                background: rgba(26, 34, 50, 0.8);
                border-radius: 15px;
                margin: 20px;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            /* Bottom Nav */
            .bottom-nav {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(10, 14, 26, 0.95);
                backdrop-filter: blur(10px);
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-around;
                padding: 12px 0;
                z-index: 50;
            }
            .nav-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
                color: rgba(255, 255, 255, 0.6);
                text-decoration: none;
                font-size: 12px;
                padding: 8px 15px;
                border-radius: 8px;
            }
            .nav-item:hover, .nav-item.active {
                color: #10b981;
                background: rgba(16, 185, 129, 0.1);
            }
        </style>
    </head>
    <body>
        <!-- Header -->
        <div class="header">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                        ${logo}
                    </div>
                    <div>
                        <h1 style="font-size: 18px; font-weight: 700;">${club}</h1>
                        <p style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">PaieCashFan</p>
                    </div>
                </div>
                <div style="display: flex; gap: 15px; align-items: center;">
                    <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 8px 16px; border-radius: 8px; font-weight: 600;">
                        1,247.50 PCC
                    </div>
                    <i class="fas fa-bell" style="font-size: 22px; cursor: pointer;"></i>
                </div>
            </div>
        </div>
        
        <!-- Stories -->
        <div class="stories-container" id="storiesContainer">
            <!-- Loaded dynamically -->
        </div>
        
        <!-- Feed -->
        <div id="feedContainer">
            <!-- Loaded dynamically -->
        </div>
        
        <!-- Bottom Nav -->
        <div class="bottom-nav">
            <a href="/" class="nav-item active">
                <i class="fas fa-home" style="font-size: 22px;"></i>
                <span>Accueil</span>
            </a>
            <a href="/wallet" class="nav-item">
                <i class="fas fa-wallet" style="font-size: 22px;"></i>
                <span>Wallet</span>
            </a>
            <a href="/shop" class="nav-item">
                <i class="fas fa-shopping-bag" style="font-size: 22px;"></i>
                <span>Shop</span>
            </a>
            <a href="/tickets" class="nav-item">
                <i class="fas fa-ticket-alt" style="font-size: 22px;"></i>
                <span>Billets</span>
            </a>
            <a href="/profile" class="nav-item">
                <i class="fas fa-user" style="font-size: 22px;"></i>
                <span>Profil</span>
            </a>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const clubName = '${club}';
            const API_BASE = '/api';
            
            // Load Stories
            async function loadStories() {
                try {
                    const response = await axios.get(\`\${API_BASE}/stories?club=\${encodeURIComponent(clubName)}\`);
                    const { stories } = response.data;
                    
                    const container = document.getElementById('storiesContainer');
                    container.innerHTML = stories.map(story => \`
                        <div class="story-item" onclick="viewStory('\${story.id}')">
                            <div class="story-avatar \${story.isLive ? 'live' : ''}">
                                <img src="\${story.avatar}" alt="\${story.name}">
                                \${story.isLive ? '<div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); background: #ff0000; color: white; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 10px; border: 2px solid #0a0e1a;">LIVE</div>' : ''}
                            </div>
                            <div style="font-size: 12px; color: rgba(255, 255, 255, 0.8);">\${story.name}</div>
                        </div>
                    \`).join('');
                } catch (error) {
                    console.error('Error loading stories:', error);
                }
            }
            
            // Load Feed
            async function loadFeed() {
                try {
                    const response = await axios.get(\`\${API_BASE}/feed?club=\${encodeURIComponent(clubName)}\`);
                    const { posts } = response.data;
                    
                    const container = document.getElementById('feedContainer');
                    container.innerHTML = posts.map(post => \`
                        <div class="feed-post">
                            <div style="display: flex; align-items: center; padding: 15px; gap: 12px;">
                                <img src="\${post.clubAvatar}" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.2);">
                                <div>
                                    <h3 style="font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 5px;">
                                        \${post.club}
                                        \${post.verified ? '<i class="fas fa-check-circle" style="color: #10b981;"></i>' : ''}
                                    </h3>
                                    <div style="font-size: 13px; color: rgba(255, 255, 255, 0.5);">\${post.timestamp}</div>
                                </div>
                            </div>
                            <div style="padding: 0 15px 15px;">
                                <p style="margin-bottom: 12px;">\${post.content}</p>
                            </div>
                            <img src="\${post.image}" style="width: 100%; height: auto; display: block;">
                            <div style="display: flex; justify-content: space-around; padding: 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                <button onclick="likePost('\${post.id}')" style="background: none; border: none; color: #ff4458; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 15px; border-radius: 8px;">
                                    <i class="fas fa-heart"></i>
                                    <span>\${post.likes}</span>
                                </button>
                                <button style="background: none; border: none; color: #4a9eff; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 15px; border-radius: 8px;">
                                    <i class="fas fa-comment"></i>
                                    <span>\${post.comments}</span>
                                </button>
                                <button style="background: none; border: none; color: #10b981; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 15px; border-radius: 8px;">
                                    <i class="fas fa-share"></i>
                                    <span>\${post.shares}</span>
                                </button>
                            </div>
                            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 12px 20px; display: flex; align-items: center; justify-content: space-between;">
                                <div style="font-size: 14px; font-weight: 600;">🎉 Vous avez gagné +\${post.pccReward} PCC !</div>
                            </div>
                        </div>
                    \`).join('');
                } catch (error) {
                    console.error('Error loading feed:', error);
                }
            }
            
            // Like Post
            async function likePost(postId) {
                try {
                    await axios.post(\`\${API_BASE}/interactions/track\`, {
                        type: 'LIKE',
                        campaignId: 'POST_' + postId,
                        sponsorId: 'sponsor_maroc',
                        postId
                    });
                    alert('❤️ +0.01 PCC gagné !');
                } catch (error) {
                    console.error('Error liking post:', error);
                }
            }
            
            // View Story
            function viewStory(storyId) {
                alert('📖 Story affichée ! +0.005 PCC gagné');
            }
            
            // Initialize
            loadStories();
            loadFeed();
        </script>
    </body>
    </html>
  `)
})

export default app
