import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files from public/static directory
app.use('/static/*', serveStatic({ root: './public' }))

// API Routes
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', version: '7.0.0', timestamp: new Date().toISOString() })
})

app.get('/api/stories', (c) => {
  const club = c.req.query('club') || 'Olympique de Marseille'
  
  const stories = [
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
      id: 'story-3',
      type: 'fan',
      name: 'Julie Lefebvre',
      avatar: 'https://i.pravatar.cc/150?img=5',
      content: `Le nouveau maillot ${club} 2026 est juste incroyable ! 😍`,
      timestamp: '7h',
      likes: 521,
      views: 2134
    }
  ]
  
  return c.json({ stories, club })
})

app.get('/api/feed', (c) => {
  const club = c.req.query('club') || 'Olympique de Marseille'
  
  const posts = [
    {
      id: 'post-1',
      club: club,
      clubAvatar: 'https://i.pravatar.cc/150?img=70',
      content: `📢 Nouveau partenariat exclusif ! Découvrez nos offres avec @Nike`,
      image: 'https://picsum.photos/800/600?random=1',
      timestamp: '2h',
      likes: 2456,
      comments: 128,
      shares: 89,
      verified: true,
      pccReward: 5
    }
  ]
  
  return c.json({ posts, club })
})

app.post('/api/wallet/send', async (c) => {
  const { amount, recipient, pin } = await c.req.json()
  
  // Simuler l'envoi d'argent
  return c.json({
    success: true,
    transactionId: `tx_${Date.now()}`,
    amount,
    recipient,
    timestamp: new Date().toISOString()
  })
})

app.get('/api/wallet/balance', (c) => {
  return c.json({
    balance: {
      pcc: 1250,
      stablecoins: {
        omc: 50,
        psc: 75
      }
    }
  })
})

// Main App Page
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
            
            /* Header Style */
            .header {
                position: sticky;
                top: 0;
                z-index: 50;
                background: rgba(10, 14, 26, 0.95);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding: 15px 20px;
            }
            
            /* Stories Container - Horizontal Scroll */
            .stories-container {
                display: flex;
                gap: 15px;
                padding: 20px;
                overflow-x: auto;
                overflow-y: hidden;
                scrollbar-width: none;
                -webkit-overflow-scrolling: touch;
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
            .story-name {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.8);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .live-badge {
                position: absolute;
                bottom: -5px;
                left: 50%;
                transform: translateX(-50%);
                background: #ff0000;
                color: white;
                font-size: 10px;
                font-weight: bold;
                padding: 2px 8px;
                border-radius: 10px;
                border: 2px solid #0a0e1a;
            }
            
            /* Feed Post */
            .feed-post {
                background: rgba(26, 34, 50, 0.8);
                border-radius: 15px;
                margin: 20px;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .post-header {
                display: flex;
                align-items: center;
                padding: 15px;
                gap: 12px;
            }
            .post-avatar {
                width: 45px;
                height: 45px;
                border-radius: 50%;
                border: 2px solid rgba(255, 255, 255, 0.2);
            }
            .post-info h3 {
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .post-time {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.5);
            }
            .post-image {
                width: 100%;
                height: auto;
                display: block;
            }
            .post-actions {
                display: flex;
                justify-content: space-around;
                padding: 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .action-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                background: none;
                border: none;
                color: white;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
                padding: 8px 15px;
                border-radius: 8px;
            }
            .action-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: scale(1.05);
            }
            .action-btn.like { color: #ff4458; }
            .action-btn.comment { color: #4a9eff; }
            .action-btn.share { color: #10b981; }
            
            /* Reward Banner */
            .reward-banner {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                padding: 12px 20px;
                margin: 20px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .reward-text {
                font-size: 14px;
                font-weight: 600;
            }
            .pcc-amount {
                font-size: 18px;
                font-weight: 800;
                background: white;
                color: #10b981;
                padding: 5px 15px;
                border-radius: 8px;
            }
            
            /* Bottom Navigation */
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
                transition: all 0.2s;
                padding: 8px 15px;
                border-radius: 8px;
            }
            .nav-item:hover, .nav-item.active {
                color: #10b981;
                background: rgba(16, 185, 129, 0.1);
            }
            .nav-item i {
                font-size: 22px;
            }
            
            /* Modal */
            .modal {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.9);
                z-index: 100;
                align-items: center;
                justify-content: center;
            }
            .modal.active { display: flex; }
            .modal-content {
                background: linear-gradient(135deg, #1a2332 0%, #0a0e1a 100%);
                border-radius: 20px;
                padding: 30px;
                max-width: 400px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            .modal-header h2 {
                font-size: 24px;
                font-weight: 700;
            }
            .close-modal {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: white;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .close-modal:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            /* Send Money Form */
            .form-group {
                margin-bottom: 20px;
            }
            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-size: 14px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.9);
            }
            .form-group input {
                width: 100%;
                padding: 12px 15px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                color: white;
                font-size: 16px;
                transition: all 0.2s;
            }
            .form-group input:focus {
                outline: none;
                border-color: #10b981;
                background: rgba(255, 255, 255, 0.08);
            }
            .btn-send {
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border: none;
                border-radius: 12px;
                color: white;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s;
            }
            .btn-send:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
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
                <div style="display: flex; gap: 15px;">
                    <button onclick="openSendMoney()" style="background: linear-gradient(135deg, #10b981, #059669); border: none; padding: 10px 20px; border-radius: 10px; color: white; font-weight: 600; cursor: pointer;">
                        <i class="fas fa-paper-plane"></i> Envoyer
                    </button>
                    <div style="position: relative;">
                        <i class="fas fa-bell" style="font-size: 22px; cursor: pointer;"></i>
                        <span style="position: absolute; top: -5px; right: -5px; width: 18px; height: 18px; background: #ff4458; border-radius: 50%; font-size: 11px; display: flex; align-items: center; justify-content: center; font-weight: 700;">3</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Stories Section -->
        <div class="stories-container" id="storiesContainer">
            <!-- Stories will be loaded here -->
        </div>
        
        <!-- Reward Banner -->
        <div class="reward-banner">
            <div>
                <div class="reward-text">🎁 Likez pour gagner !</div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.8);">+2 PCC par like</div>
            </div>
            <div class="pcc-amount">+5 PCC</div>
        </div>
        
        <!-- Feed Section -->
        <div id="feedContainer">
            <!-- Feed posts will be loaded here -->
        </div>
        
        <!-- Bottom Navigation -->
        <div class="bottom-nav">
            <a href="/" class="nav-item active">
                <i class="fas fa-home"></i>
                <span>Accueil</span>
            </a>
            <a href="/streams" class="nav-item">
                <i class="fas fa-video"></i>
                <span>Streams</span>
            </a>
            <a href="/discover" class="nav-item">
                <i class="fas fa-compass"></i>
                <span>Découvrir</span>
            </a>
            <a href="/wallet" class="nav-item">
                <i class="fas fa-wallet"></i>
                <span>Wallet</span>
            </a>
            <a href="/profile" class="nav-item">
                <i class="fas fa-user"></i>
                <span>Profil</span>
            </a>
        </div>
        
        <!-- Send Money Modal -->
        <div id="sendMoneyModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>💸 Envoyer de l'argent</h2>
                    <button class="close-modal" onclick="closeSendMoney()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="sendMoneyForm" onsubmit="sendMoney(event)">
                    <div class="form-group">
                        <label>Destinataire</label>
                        <input type="text" id="recipient" placeholder="@username ou email" required>
                    </div>
                    <div class="form-group">
                        <label>Montant (PCC)</label>
                        <input type="number" id="amount" placeholder="50" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>Code PIN</label>
                        <input type="password" id="pin" placeholder="••••" maxlength="4" required>
                    </div>
                    <button type="submit" class="btn-send">
                        <i class="fas fa-check"></i> Confirmer l'envoi
                    </button>
                </form>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const clubName = '${club}';
            
            // Load Stories
            async function loadStories() {
                try {
                    const response = await axios.get('/api/stories?club=' + encodeURIComponent(clubName));
                    const { stories } = response.data;
                    
                    const container = document.getElementById('storiesContainer');
                    container.innerHTML = stories.map(story => \`
                        <div class="story-item" onclick="viewStory('\${story.id}')">
                            <div class="story-avatar \${story.isLive ? 'live' : ''}">
                                <img src="\${story.avatar}" alt="\${story.name}">
                                \${story.isLive ? '<div class="live-badge">LIVE</div>' : ''}
                            </div>
                            <div class="story-name">\${story.name}</div>
                        </div>
                    \`).join('');
                } catch (error) {
                    console.error('Error loading stories:', error);
                }
            }
            
            // Load Feed
            async function loadFeed() {
                try {
                    const response = await axios.get('/api/feed?club=' + encodeURIComponent(clubName));
                    const { posts } = response.data;
                    
                    const container = document.getElementById('feedContainer');
                    container.innerHTML = posts.map(post => \`
                        <div class="feed-post">
                            <div class="post-header">
                                <img src="\${post.clubAvatar}" alt="\${post.club}" class="post-avatar">
                                <div class="post-info">
                                    <h3>
                                        \${post.club}
                                        \${post.verified ? '<i class="fas fa-check-circle" style="color: #10b981;"></i>' : ''}
                                    </h3>
                                    <div class="post-time">\${post.timestamp}</div>
                                </div>
                            </div>
                            <div style="padding: 0 15px 15px;">
                                <p style="margin-bottom: 12px;">\${post.content}</p>
                            </div>
                            <img src="\${post.image}" alt="Post" class="post-image">
                            <div class="post-actions">
                                <button class="action-btn like" onclick="likePost('\${post.id}')">
                                    <i class="fas fa-heart"></i>
                                    <span>\${post.likes}</span>
                                </button>
                                <button class="action-btn comment">
                                    <i class="fas fa-comment"></i>
                                    <span>\${post.comments}</span>
                                </button>
                                <button class="action-btn share">
                                    <i class="fas fa-share"></i>
                                    <span>\${post.shares}</span>
                                </button>
                            </div>
                            <div class="reward-banner" style="margin: 0; border-radius: 0;">
                                <div class="reward-text">🎉 Vous avez gagné +\${post.pccReward} PCC !</div>
                            </div>
                        </div>
                    \`).join('');
                } catch (error) {
                    console.error('Error loading feed:', error);
                }
            }
            
            // Like Post
            function likePost(postId) {
                console.log('Liked post:', postId);
                alert('❤️ +2 PCC gagnés !');
            }
            
            // View Story
            function viewStory(storyId) {
                console.log('Viewing story:', storyId);
                alert('📖 Story affichée ! +5 PCC gagnés');
            }
            
            // Send Money Modal
            function openSendMoney() {
                document.getElementById('sendMoneyModal').classList.add('active');
            }
            
            function closeSendMoney() {
                document.getElementById('sendMoneyModal').classList.remove('active');
            }
            
            async function sendMoney(event) {
                event.preventDefault();
                
                const recipient = document.getElementById('recipient').value;
                const amount = document.getElementById('amount').value;
                const pin = document.getElementById('pin').value;
                
                try {
                    const response = await axios.post('/api/wallet/send', {
                        recipient,
                        amount: parseFloat(amount),
                        pin
                    });
                    
                    if (response.data.success) {
                        alert(\`✅ \${amount} PCC envoyés avec succès à \${recipient} !\`);
                        closeSendMoney();
                        document.getElementById('sendMoneyForm').reset();
                    }
                } catch (error) {
                    alert('❌ Erreur lors de l\'envoi');
                    console.error(error);
                }
            }
            
            // Initialize
            loadStories();
            loadFeed();
        </script>
    </body>
    </html>
  `)
})

// Federation Pages
app.get('/federation/:fed', (c) => {
  const fed = c.req.param('fed')
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PaieCashFan - ${fed}</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-900 text-white p-8">
        <div class="max-w-6xl mx-auto">
            <h1 class="text-4xl font-bold mb-6">🌍 ${fed}</h1>
            <p class="text-xl mb-8">Fédération de football - Coming soon!</p>
            <a href="/" class="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold">
                Retour à l'accueil
            </a>
        </div>
    </body>
    </html>
  `)
})

export default app
