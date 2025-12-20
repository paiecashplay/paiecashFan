// ========================================
// PAIECASHPLAY FAN APP v2.1 - JAVASCRIPT
// ========================================

// === DONNÉES MOCK ===

// Clubs français avec stats réelles
const clubsData = [
    {
        id: 'psg',
        name: 'Paris Saint-Germain',
        country: 'fr',
        league: 'Ligue 1',
        sport: 'football',
        logo: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
        colors: { primary: '#CF0A2C', secondary: '#004170' },
        followers: '8.7M',
        following: false,
        verified: true,
        socialStats: {
            instagram: '46M',
            facebook: '41M',
            twitter: '14.5M',
            tiktok: '181K',
            youtube: '67M',
            linkedin: '7.42M'
        },
        spectators: 47418
    },
    {
        id: 'om',
        name: 'Olympique de Marseille',
        country: 'fr',
        league: 'Ligue 1',
        sport: 'football',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
        colors: { primary: '#00B0E0', secondary: '#FFFFFF' },
        followers: '6.7M',
        following: true,
        verified: true,
        socialStats: {
            instagram: '6.7M',
            facebook: '3.2M',
            twitter: '4.3M',
            tiktok: '105K',
            youtube: '3.1M',
            linkedin: '607K'
        },
        spectators: 62716
    },
    {
        id: 'ol',
        name: 'Olympique Lyonnais',
        country: 'fr',
        league: 'Ligue 1',
        sport: 'football',
        logo: 'https://upload.wikimedia.org/wikipedia/en/e/e2/Olympique_Lyonnais_logo.svg',
        colors: { primary: '#DA291C', secondary: '#003972' },
        followers: '4.6M',
        following: true,
        verified: true,
        socialStats: {
            instagram: '4.6M',
            facebook: '1.6M',
            twitter: '2.3M',
            tiktok: '72K',
            youtube: '2.3M',
            linkedin: '160K'
        },
        spectators: 46701
    },
    {
        id: 'monaco',
        name: 'AS Monaco',
        country: 'fr',
        league: 'Ligue 1',
        sport: 'football',
        logo: 'https://upload.wikimedia.org/wikipedia/en/c/c8/AS_Monaco_FC_Logo.svg',
        colors: { primary: '#CE1126', secondary: '#FFFFFF' },
        followers: '10M',
        following: false,
        verified: true,
        socialStats: {
            instagram: '10M',
            facebook: '5.5M',
            twitter: '2.2M',
            tiktok: '38K',
            youtube: '2M',
            linkedin: '195K'
        },
        spectators: 6870
    },
    {
        id: 'losc',
        name: 'LOSC Lille',
        country: 'fr',
        league: 'Ligue 1',
        sport: 'football',
        logo: 'https://upload.wikimedia.org/wikipedia/en/6/69/Lille_OSC_logo.svg',
        colors: { primary: '#D2122E', secondary: '#001489' },
        followers: '1.3M',
        following: true,
        verified: true,
        socialStats: {
            instagram: '1.3M',
            facebook: '1.7M',
            twitter: '907K',
            tiktok: '26K',
            youtube: '642K',
            linkedin: '64K'
        },
        spectators: 36187
    },
    {
        id: 'lens',
        name: 'RC Lens',
        country: 'fr',
        league: 'Ligue 1',
        sport: 'football',
        logo: 'https://upload.wikimedia.org/wikipedia/en/c/c3/RC_Lens_logo.svg',
        colors: { primary: '#FDD000', secondary: '#C8102E' },
        followers: '529K',
        following: false,
        verified: true,
        socialStats: {
            instagram: '529K',
            facebook: '1.3M',
            twitter: '359K',
            tiktok: '18K',
            youtube: '337K',
            linkedin: '69K'
        },
        spectators: 37704
    },
    {
        id: 'real',
        name: 'Real Madrid',
        country: 'es',
        league: 'La Liga',
        sport: 'football',
        logo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
        colors: { primary: '#FFFFFF', secondary: '#000000' },
        followers: '12.5M',
        following: false,
        verified: true
    },
    {
        id: 'barca',
        name: 'FC Barcelona',
        country: 'es',
        league: 'La Liga',
        sport: 'football',
        logo: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_(crest).svg',
        colors: { primary: '#A50044', secondary: '#004D98' },
        followers: '11.2M',
        following: false,
        verified: true
    }
];

// User data
const userData = {
    id: 'user1',
    name: 'Maxime Dupont',
    username: '@maxime_om',
    avatar: 'https://i.pravatar.cc/150?img=12',
    mainClub: 'om',
    level: 'Platine',
    points: 8720,
    pointsToNext: 1280,
    socialPoints: 1247,
    streakDays: 12,
    referrals: 8,
    badges: 12,
    totalBadges: 50
};

// Wallets
const walletsData = [
    { id: 'eur', name: 'Euro', symbol: 'EUR', icon: '💶', balance: 1247.50, fiatValue: 1247.50 },
    { id: 'paie', name: 'PaieCash', symbol: 'PAIE', icon: '🪙', balance: 1250, fiatValue: 625.00 },
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: '₿', balance: 0.00523, fiatValue: 234.15 },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: '⧫', balance: 0.1247, fiatValue: 280.19 },
    { id: 'usdt', name: 'Tether', symbol: 'USDT', icon: '💵', balance: 500.00, fiatValue: 500.00 }
];

// Contacts P2P
const contactsData = [
    { id: 1, name: 'Pierre', avatar: 'https://i.pravatar.cc/64?img=1', online: true },
    { id: 2, name: 'Marie', avatar: 'https://i.pravatar.cc/64?img=5', online: false },
    { id: 3, name: 'Thomas', avatar: 'https://i.pravatar.cc/64?img=3', online: true },
    { id: 4, name: 'Julie', avatar: 'https://i.pravatar.cc/64?img=9', online: false },
    { id: 5, name: 'Alex', avatar: 'https://i.pravatar.cc/64?img=8', online: true }
];

// Transactions
const transactionsData = [
    {
        id: 1,
        type: 'purchase',
        icon: '🛍️',
        title: 'Maillot OM Domicile',
        time: 'Il y a 2h',
        amount: -89.99,
        currency: 'EUR',
        status: 'completed'
    },
    {
        id: 2,
        type: 'cashback',
        icon: '🎁',
        title: 'Cashback boutique',
        time: 'Il y a 3h',
        amount: +4.50,
        currency: 'EUR',
        status: 'completed'
    },
    {
        id: 3,
        type: 'ticket',
        icon: '🎫',
        title: 'Billet OM vs PSG',
        time: 'Hier',
        amount: -75.00,
        currency: 'EUR',
        status: 'completed'
    },
    {
        id: 4,
        type: 'p2p',
        icon: '👥',
        title: 'Envoyé à Pierre',
        time: 'Il y a 2 jours',
        amount: -50.00,
        currency: 'EUR',
        status: 'completed'
    },
    {
        id: 5,
        type: 'topup',
        icon: '💳',
        title: 'Recharge wallet',
        time: 'Il y a 3 jours',
        amount: +200.00,
        currency: 'EUR',
        status: 'completed'
    }
];

// Streams live
const streamsData = {
    live: [
        {
            id: 1,
            title: 'OM Live Shopping',
            club: 'Olympique de Marseille',
            clubId: 'om',
            viewers: 3247,
            isLive: true,
            thumbnail: ''
        },
        {
            id: 2,
            title: 'Unboxing Maillot Collector',
            club: 'Jules - Ambassadeur',
            viewers: 1842,
            isLive: true
        },
        {
            id: 3,
            title: 'PSG Match Day Experience',
            club: 'Paris Saint-Germain',
            clubId: 'psg',
            viewers: 8532,
            isLive: true
        }
    ],
    upcoming: [
        {
            id: 4,
            title: 'Drop Maillot Collector',
            club: 'Olympique de Marseille',
            clubId: 'om',
            scheduledTime: 'Demain 20h00'
        },
        {
            id: 5,
            title: 'Behind the Scenes Entraînement',
            club: 'Olympique de Marseille',
            clubId: 'om',
            scheduledTime: 'Vendredi 18h00'
        }
    ],
    replays: [
        {
            id: 6,
            title: 'Drops Écharpe Limitée',
            club: 'Olympique de Marseille',
            clubId: 'om',
            views: 12453,
            duration: '1h24min'
        }
    ]
};

// Posts sociaux
const postsData = [
    {
        id: 1,
        author: {
            name: 'Olympique de Marseille',
            username: '@olympiquedemarseille',
            avatar: clubsData[1].logo,
            verified: true
        },
        time: 'Il y a 2h',
        type: 'club',
        content: '⚽ VICTOIRE ! L\'OM s\'impose 3-1 au Vélodrome ! Un match mémorable grâce au soutien du 12ème homme 💙🔥 #DroitAuBut',
        image: 'https://picsum.photos/400/300?random=1',
        likes: 12847,
        comments: 532,
        shares: 1243,
        liked: true
    },
    {
        id: 2,
        author: {
            name: 'Jules Martin',
            username: '@julesambassadeur',
            avatar: 'https://i.pravatar.cc/64?img=7',
            verified: false
        },
        time: 'Il y a 5h',
        type: 'ambassador',
        content: '🔥 Drop EXCLUSIF demain 20h ! NFT Maillot Collector en édition limitée (100 ex.) Soyez prêts les amis ! 👕⚡',
        image: null,
        likes: 847,
        comments: 142,
        shares: 234,
        liked: false
    },
    {
        id: 3,
        author: {
            name: 'Marie Dubois',
            username: '@marieom',
            avatar: 'https://i.pravatar.cc/64?img=5',
            verified: false
        },
        time: 'Hier',
        type: 'friend',
        content: 'Ma première fois au Vélodrome, une ambiance de folie ! 💙 Merci @maxime_om pour les conseils 🙏',
        image: 'https://picsum.photos/400/300?random=2',
        likes: 124,
        comments: 18,
        shares: 5,
        liked: false
    }
];

// Stories
const storiesData = [
    {
        id: 1,
        username: 'olympiquedemarseille',
        avatar: clubsData[1].logo,
        hasLive: true,
        type: 'club'
    },
    {
        id: 2,
        username: 'julesambassadeur',
        avatar: 'https://i.pravatar.cc/64?img=7',
        hasLive: false,
        type: 'ambassador'
    },
    {
        id: 3,
        username: 'pierreom',
        avatar: 'https://i.pravatar.cc/64?img=1',
        hasLive: false,
        type: 'friend'
    }
];

// Badges (20 badges sociaux)
const badgesData = [
    { id: 1, icon: '🏟️', name: 'Première Visite', unlocked: true, description: 'Premier match au stade' },
    { id: 2, icon: '🎨', name: 'Premier NFT', unlocked: true, description: 'Achat du premier NFT' },
    { id: 3, icon: '⭐', name: 'Superfan', unlocked: true, description: '1000 points gagnés' },
    { id: 4, icon: '👔', name: 'Collector', unlocked: true, description: '10 produits achetés' },
    { id: 5, icon: '💙', name: 'Fan Fidèle', unlocked: true, description: '3 ans d\'ancienneté' },
    { id: 6, icon: '🤝', name: 'Ambassadeur', unlocked: true, description: '10 parrainages' },
    { id: 7, icon: '💰', name: 'Cashback Master', unlocked: false, description: '500€ de cashback' },
    { id: 8, icon: '📱', name: 'Early Adopter', unlocked: false, description: 'Inscrit année 1' },
    { id: 9, icon: '📸', name: 'Social Butterfly', unlocked: true, description: '5 réseaux connectés' },
    { id: 10, icon: '🔥', name: 'Streak Master', unlocked: true, description: '30 jours consécutifs' },
    { id: 11, icon: '👑', name: 'Influenceur', unlocked: false, description: '10K followers' },
    { id: 12, icon: '⭐', name: 'Viral Star', unlocked: false, description: '100K vues contenu' },
    { id: 13, icon: '🤝', name: 'Parrain Légende', unlocked: false, description: '50 filleuls' },
    { id: 14, icon: '📸', name: 'Content Creator', unlocked: true, description: '100 posts créés' },
    { id: 15, icon: '💎', name: 'Diamond', unlocked: false, description: 'Niveau Diamond atteint' },
    { id: 16, icon: '🎤', name: 'Live Master', unlocked: false, description: '10 lives organisés' },
    { id: 17, icon: '🎬', name: 'Réalisateur', unlocked: false, description: '50 vidéos publiées' },
    { id: 18, icon: '🏆', name: 'Top 10', unlocked: false, description: 'Top 10 classement' },
    { id: 19, icon: '🌟', name: 'Star', unlocked: false, description: '1M impressions' },
    { id: 20, icon: '👥', name: 'Community Hero', unlocked: false, description: '1000 commentaires' }
];

// Missions
const missionsData = {
    daily: [
        {
            id: 1,
            title: 'Achète 1 produit',
            description: 'Fais un achat sur la boutique',
            reward: '+10 pts',
            progress: 0,
            target: 1,
            completed: false
        },
        {
            id: 2,
            title: 'Transfert P2P',
            description: 'Envoie de l\'argent à un ami',
            reward: '+5 pts',
            progress: 1,
            target: 1,
            completed: true
        },
        {
            id: 3,
            title: 'Partage un post',
            description: 'Partage un post du club',
            reward: '+5 pts',
            progress: 0,
            target: 1,
            completed: false
        }
    ],
    weekly: [
        {
            id: 4,
            title: 'Assiste à 1 match',
            description: 'Achète et utilise un billet',
            reward: '+50 pts',
            progress: 0,
            target: 1,
            completed: false
        },
        {
            id: 5,
            title: 'Dépense 100€',
            description: 'Volume d\'achats hebdo',
            reward: '+30 pts',
            progress: 67.50,
            target: 100,
            completed: false
        }
    ],
    special: [
        {
            id: 6,
            title: 'Classique OM vs PSG',
            description: 'Participe au match du siècle',
            reward: '+200 pts + NFT',
            progress: 0,
            target: 1,
            completed: false
        },
        {
            id: 7,
            title: 'Parraine 3 amis',
            description: 'Invite tes amis à rejoindre',
            reward: '+100 pts',
            progress: 2,
            target: 3,
            completed: false
        }
    ]
};

// Réseaux sociaux
const socialNetworksData = [
    {
        id: 'instagram',
        name: 'Instagram',
        icon: '📷',
        connected: true,
        followers: '2.4K',
        className: 'instagram'
    },
    {
        id: 'facebook',
        name: 'Facebook',
        icon: '👍',
        connected: true,
        followers: '1.8K',
        className: 'facebook'
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        icon: '🎵',
        connected: false,
        followers: null,
        className: 'tiktok'
    },
    {
        id: 'twitter',
        name: 'Twitter',
        icon: '🐦',
        connected: false,
        followers: null,
        className: 'twitter'
    },
    {
        id: 'youtube',
        name: 'YouTube',
        icon: '▶️',
        connected: false,
        followers: null,
        className: 'youtube'
    }
];

// Recommandations IA
const aiRecommendationsData = [
    {
        id: 1,
        icon: '⚠️',
        title: 'Match OM vs PSG bientôt complet',
        description: 'Il reste 47 places, réserve maintenant !',
        priority: 'high'
    },
    {
        id: 2,
        icon: '👕',
        title: 'Drop Maillot Collector demain 20h',
        description: 'Édition limitée 100 exemplaires',
        priority: 'medium'
    },
    {
        id: 3,
        icon: '💎',
        title: 'Optimise ton cashback',
        description: 'Passe Diamond pour 10% de cashback',
        priority: 'low'
    }
];

// Learning tags IA
const learningTagsData = [
    { name: 'Maillots Collector', confidence: 95 },
    { name: 'Billetterie VIP', confidence: 87 },
    { name: 'NFT Joueurs', confidence: 82 },
    { name: 'Drops Limités', confidence: 78 },
    { name: 'Matchs Domicile', confidence: 92 }
];

// Chat messages preview
const chatMessagesPreview = [
    { content: 'Salut ! Comment puis-je t\'aider aujourd\'hui ?', type: 'bot', time: '14:23' },
    { content: 'Quand est le prochain match OM ?', type: 'user', time: '14:24' },
    { content: 'Le prochain match OM est OM vs PSG le 15 décembre à 21h au Vélodrome ! Veux-tu réserver un billet ?', type: 'bot', time: '14:24' }
];

// === STATE MANAGEMENT ===

let currentSection = 'feedSection';
let currentFilter = 'all';
let currentMissionTab = 'daily';
let cardFlipped = false;
let isRecording = false;
let recognition = null;
let synthesis = window.speechSynthesis;

// === INITIALIZATION ===

document.addEventListener('DOMContentLoaded', () => {
    // Hide loader after 2s
    setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        
        // Initialize app
        init();
    }, 2000);
});

function init() {
    // Navigation
    initNavigation();
    
    // Render content
    renderStories();
    renderPosts();
    renderStreams();
    renderClubs();
    renderWallets();
    renderContacts();
    renderTransactions();
    renderAIRecommendations();
    renderLearningTags();
    renderChatPreview();
    renderSocialNetworks();
    renderBadges();
    renderMissions();
    renderMyClubs();
    
    // Event listeners
    initEventListeners();
    
    // Web Speech API
    initSpeechRecognition();
    
    // Update header with main club
    updateHeaderClub();
}

// === NAVIGATION ===

function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.getAttribute('data-section');
            
            // Update active states
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show section
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');
            
            currentSection = sectionId;
            
            // Haptic feedback
            hapticFeedback('light');
        });
    });
}

// === RENDERING FUNCTIONS ===

function renderStories() {
    const container = document.querySelector('.stories-scroll');
    const addStory = container.querySelector('.story-item.add-story');
    
    storiesData.forEach(story => {
        const storyEl = document.createElement('div');
        storyEl.className = 'story-item';
        storyEl.innerHTML = `
            <div class="story-avatar">
                <img src="${story.avatar}" alt="${story.username}">
                ${story.hasLive ? '<span class="story-live-badge">LIVE</span>' : ''}
            </div>
            <span class="story-username">${story.username}</span>
        `;
        
        storyEl.addEventListener('click', () => {
            if (story.hasLive) {
                openStreamModal(story);
            } else {
                showToast('Stories disponibles bientôt !', 'info');
            }
        });
        
        container.insertBefore(storyEl, addStory);
    });
}

function renderPosts() {
    const container = document.getElementById('postsContainer');
    
    postsData.forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'post-card';
        postEl.setAttribute('data-type', post.type);
        
        postEl.innerHTML = `
            <div class="post-header">
                <div class="post-author">
                    <div class="post-avatar">
                        <img src="${post.author.avatar}" alt="${post.author.name}">
                    </div>
                    <div class="post-author-info">
                        <h4>
                            ${post.author.name}
                            ${post.author.verified ? '<span class="verified-badge">✓</span>' : ''}
                        </h4>
                        <span class="post-time">${post.time}</span>
                    </div>
                </div>
                <button class="btn-icon">⋯</button>
            </div>
            <div class="post-content">
                <p class="post-text">${post.content}</p>
                ${post.image ? `<div class="post-image"><img src="${post.image}" alt="Post"></div>` : ''}
            </div>
            <div class="post-actions">
                <button class="post-action-btn ${post.liked ? 'liked' : ''}" data-action="like">
                    <span>${post.liked ? '❤️' : '🤍'}</span>
                    <span>${formatNumber(post.likes)}</span>
                </button>
                <button class="post-action-btn" data-action="comment">
                    <span>💬</span>
                    <span>${formatNumber(post.comments)}</span>
                </button>
                <button class="post-action-btn" data-action="share">
                    <span>🔄</span>
                    <span>${formatNumber(post.shares)}</span>
                </button>
            </div>
        `;
        
        container.appendChild(postEl);
    });
    
    // Feed filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            filterPosts(filter);
        });
    });
    
    // Post actions
    container.querySelectorAll('.post-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = btn.getAttribute('data-action');
            handlePostAction(action, btn);
        });
    });
}

function filterPosts(filter) {
    const posts = document.querySelectorAll('.post-card');
    
    posts.forEach(post => {
        const type = post.getAttribute('data-type');
        
        if (filter === 'all' || type === filter || (filter === 'clubs' && type === 'club') || (filter === 'ambassadors' && type === 'ambassador') || (filter === 'friends' && type === 'friend')) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
}

function handlePostAction(action, btn) {
    hapticFeedback('light');
    
    switch(action) {
        case 'like':
            btn.classList.toggle('liked');
            const likeIcon = btn.querySelector('span:first-child');
            likeIcon.textContent = btn.classList.contains('liked') ? '❤️' : '🤍';
            break;
        case 'comment':
            showToast('Commentaires bientôt disponibles !', 'info');
            break;
        case 'share':
            showShareModal();
            break;
    }
}

function renderStreams() {
    renderStreamCategory('live', streamsData.live, document.getElementById('liveStreamsContainer'));
    renderStreamCategory('upcoming', streamsData.upcoming, document.getElementById('upcomingStreamsContainer'));
    renderStreamCategory('replay', streamsData.replays, document.getElementById('replayStreamsContainer'));
}

function renderStreamCategory(type, streams, container) {
    streams.forEach(stream => {
        const streamEl = document.createElement('div');
        streamEl.className = 'stream-card';
        
        let badgeHTML = '';
        if (type === 'live') {
            badgeHTML = `
                <span class="stream-badge-live">🔴 LIVE</span>
                <span class="stream-viewers-badge">👁️ ${formatNumber(stream.viewers)}</span>
            `;
        } else if (type === 'upcoming') {
            badgeHTML = `<span class="stream-viewers-badge">🕐 ${stream.scheduledTime}</span>`;
        } else {
            badgeHTML = `<span class="stream-viewers-badge">👁️ ${formatNumber(stream.views)} • ${stream.duration}</span>`;
        }
        
        streamEl.innerHTML = `
            <div class="stream-thumbnail">
                ${badgeHTML}
                <span style="font-size: 48px;">🎥</span>
            </div>
            <div class="stream-info">
                <h4 class="stream-title">${stream.title}</h4>
                <p class="stream-club">${stream.club}</p>
            </div>
        `;
        
        streamEl.addEventListener('click', () => {
            if (type === 'live') {
                openStreamModal(stream);
            } else if (type === 'upcoming') {
                showToast(`Stream programmé ${stream.scheduledTime}`, 'info');
            } else {
                showToast('Replay bientôt disponible !', 'info');
            }
        });
        
        container.appendChild(streamEl);
    });
}

function renderClubs() {
    const proContainer = document.getElementById('proClubsContainer');
    const localContainer = document.getElementById('localClubsContainer');
    
    // Pro clubs
    clubsData.forEach(club => {
        const clubEl = createClubCard(club);
        proContainer.appendChild(clubEl);
    });
    
    // Local clubs (mock 2 clubs)
    for (let i = 0; i < 2; i++) {
        const localClub = {
            id: `local${i}`,
            name: `FC Marseille ${i + 1}`,
            country: 'fr',
            league: 'Amateur',
            sport: 'football',
            logo: 'https://via.placeholder.com/60/00B0E0/FFFFFF?text=FC',
            followers: '2.5K',
            following: false,
            verified: false
        };
        
        const clubEl = createClubCard(localClub);
        localContainer.appendChild(clubEl);
    }
}

function createClubCard(club) {
    const clubEl = document.createElement('div');
    clubEl.className = 'club-card';
    
    clubEl.innerHTML = `
        <div class="club-logo">
            <img src="${club.logo}" alt="${club.name}">
        </div>
        <h4 class="club-name">
            ${club.name}
            ${club.verified ? '<span class="verified-badge">✓</span>' : ''}
        </h4>
        <p class="club-info">${club.league}</p>
        <p class="club-followers">${club.followers} followers</p>
        <button class="btn-follow ${club.following ? 'following' : ''}" data-club-id="${club.id}">
            ${club.following ? 'Ne plus suivre' : 'Suivre'}
        </button>
    `;
    
    const followBtn = clubEl.querySelector('.btn-follow');
    followBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFollowClub(club.id, followBtn);
    });
    
    return clubEl;
}

function toggleFollowClub(clubId, btn) {
    const club = clubsData.find(c => c.id === clubId);
    if (club) {
        club.following = !club.following;
        btn.textContent = club.following ? 'Ne plus suivre' : 'Suivre';
        btn.classList.toggle('following');
        
        showToast(club.following ? `Tu suis maintenant ${club.name}` : `Tu ne suis plus ${club.name}`, 'success');
        hapticFeedback('medium');
    }
}

function renderWallets() {
    const container = document.getElementById('walletsGrid');
    
    walletsData.forEach(wallet => {
        const walletEl = document.createElement('div');
        walletEl.className = 'wallet-card';
        
        walletEl.innerHTML = `
            <div class="wallet-info">
                <div class="wallet-icon">${wallet.icon}</div>
                <div class="wallet-details">
                    <h4>${wallet.name}</h4>
                    <p class="wallet-amount">${wallet.balance.toFixed(wallet.symbol === 'BTC' || wallet.symbol === 'ETH' ? 5 : 2)} ${wallet.symbol}</p>
                </div>
            </div>
            <div class="wallet-balance">
                <span class="wallet-balance-main">${wallet.balance.toFixed(wallet.symbol === 'BTC' || wallet.symbol === 'ETH' ? 5 : 2)}</span>
                <span class="wallet-balance-fiat">${wallet.fiatValue.toFixed(2)} €</span>
            </div>
        `;
        
        container.appendChild(walletEl);
    });
}

function renderContacts() {
    const container = document.getElementById('contactsCarousel');
    
    contactsData.forEach(contact => {
        const contactEl = document.createElement('div');
        contactEl.className = 'contact-item';
        
        contactEl.innerHTML = `
            <div class="contact-avatar">
                <img src="${contact.avatar}" alt="${contact.name}">
                <span class="contact-status ${contact.online ? 'online' : 'offline'}"></span>
            </div>
            <span class="contact-name">${contact.name}</span>
        `;
        
        contactEl.addEventListener('click', () => {
            openP2PModal(contact);
        });
        
        container.appendChild(contactEl);
    });
}

function renderTransactions() {
    const container = document.getElementById('transactionsList');
    
    transactionsData.forEach(tx => {
        const txEl = document.createElement('div');
        txEl.className = 'transaction-item';
        
        txEl.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon">${tx.icon}</div>
                <div class="transaction-details">
                    <h4>${tx.title}</h4>
                    <span class="transaction-time">${tx.time}</span>
                </div>
            </div>
            <div class="transaction-amount">
                <span class="transaction-value ${tx.amount > 0 ? 'positive' : 'negative'}">
                    ${tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)} ${tx.currency}
                </span>
                <span class="transaction-status">✓ ${tx.status === 'completed' ? 'Terminé' : 'En cours'}</span>
            </div>
        `;
        
        container.appendChild(txEl);
    });
}

function renderAIRecommendations() {
    const container = document.getElementById('aiRecommendations');
    
    aiRecommendationsData.forEach(rec => {
        const recEl = document.createElement('div');
        recEl.className = `recommendation-card ${rec.priority}`;
        
        recEl.innerHTML = `
            <div class="recommendation-header">
                <span class="rec-icon">${rec.icon}</span>
                <span class="rec-priority ${rec.priority}">${rec.priority === 'high' ? 'Urgent' : rec.priority === 'medium' ? 'Important' : 'Info'}</span>
            </div>
            <div class="recommendation-content">
                <h4>${rec.title}</h4>
                <p>${rec.description}</p>
            </div>
        `;
        
        container.appendChild(recEl);
    });
}

function renderLearningTags() {
    const container = document.getElementById('learningTags');
    
    learningTagsData.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'learning-tag';
        tagEl.innerHTML = `
            ${tag.name}
            <span class="tag-confidence">${tag.confidence}%</span>
        `;
        
        container.appendChild(tagEl);
    });
}

function renderChatPreview() {
    const container = document.getElementById('chatPreview');
    
    chatMessagesPreview.forEach(msg => {
        const msgEl = document.createElement('div');
        msgEl.className = 'chat-message';
        
        msgEl.innerHTML = `
            <div class="message-content ${msg.type}">${msg.content}</div>
            <span class="message-time">${msg.time}</span>
        `;
        
        container.appendChild(msgEl);
    });
}

function renderSocialNetworks() {
    const container = document.getElementById('socialNetworks');
    
    socialNetworksData.forEach(network => {
        const networkEl = document.createElement('div');
        networkEl.className = 'social-network-item';
        
        networkEl.innerHTML = `
            <div class="social-network-info">
                <div class="social-icon ${network.className}">${network.icon}</div>
                <div class="social-network-details">
                    <h4>${network.name}</h4>
                    <span class="social-network-status ${network.connected ? 'connected' : 'disconnected'}">
                        ${network.connected ? `✓ Connecté • ${network.followers}` : 'Non connecté'}
                    </span>
                </div>
            </div>
            <button class="btn-connect ${network.connected ? 'connected' : ''}" data-network-id="${network.id}">
                ${network.connected ? 'Déconnecter' : 'Connecter'}
            </button>
        `;
        
        const btn = networkEl.querySelector('.btn-connect');
        btn.addEventListener('click', () => {
            toggleSocialNetwork(network.id, btn);
        });
        
        container.appendChild(networkEl);
    });
}

function toggleSocialNetwork(networkId, btn) {
    const network = socialNetworksData.find(n => n.id === networkId);
    if (network) {
        network.connected = !network.connected;
        
        if (network.connected) {
            // Simulate OAuth flow
            showToast(`Connexion à ${network.name}...`, 'info');
            setTimeout(() => {
                showToast(`✓ ${network.name} connecté avec succès !`, 'success');
                btn.textContent = 'Déconnecter';
                btn.classList.add('connected');
                
                // Update points
                userData.socialPoints += 50;
                showToast('+ 50 points sociaux gagnés !', 'success');
            }, 1500);
        } else {
            btn.textContent = 'Connecter';
            btn.classList.remove('connected');
            showToast(`${network.name} déconnecté`, 'info');
        }
        
        hapticFeedback('medium');
    }
}

function renderBadges() {
    const container = document.getElementById('badgesGrid');
    
    badgesData.slice(0, 12).forEach(badge => {
        const badgeEl = document.createElement('div');
        badgeEl.className = `badge-item ${badge.unlocked ? '' : 'locked'}`;
        
        badgeEl.innerHTML = `
            <div class="badge-icon">${badge.unlocked ? badge.icon : '🔒'}</div>
            <span class="badge-name">${badge.name}</span>
        `;
        
        badgeEl.addEventListener('click', () => {
            showToast(badge.description, 'info');
        });
        
        container.appendChild(badgeEl);
    });
    
    // Update badge count
    const unlockedCount = badgesData.filter(b => b.unlocked).length;
    document.getElementById('badgesCount').textContent = unlockedCount;
}

function renderMissions() {
    const container = document.getElementById('missionsContainer');
    
    // Mission tabs
    document.querySelectorAll('.mission-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.mission-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const type = tab.getAttribute('data-type');
            renderMissionsByType(type, container);
        });
    });
    
    // Initial render
    renderMissionsByType('daily', container);
}

function renderMissionsByType(type, container) {
    container.innerHTML = '';
    const missions = missionsData[type];
    
    missions.forEach(mission => {
        const missionEl = document.createElement('div');
        missionEl.className = `mission-card ${mission.completed ? 'completed' : ''}`;
        
        const progress = Math.round((mission.progress / mission.target) * 100);
        
        missionEl.innerHTML = `
            <div class="mission-header">
                <span class="mission-title">${mission.title}</span>
                <span class="mission-reward">${mission.reward}</span>
            </div>
            <p class="mission-description">${mission.description}</p>
            <div class="mission-progress">
                <div class="mission-progress-bar">
                    <div class="mission-progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="mission-progress-text">${mission.progress}/${mission.target}</span>
            </div>
        `;
        
        container.appendChild(missionEl);
    });
}

function renderMyClubs() {
    const container = document.getElementById('myClubsList');
    const followedClubs = clubsData.filter(c => c.following);
    
    followedClubs.forEach(club => {
        const clubEl = document.createElement('div');
        clubEl.className = 'my-club-card';
        
        clubEl.innerHTML = `
            <div class="my-club-logo">
                <img src="${club.logo}" alt="${club.name}">
            </div>
            <div class="my-club-info">
                <h4 class="my-club-name">${club.name}</h4>
                <p class="my-club-followers">${club.followers} followers</p>
            </div>
            <button class="btn-secondary">Voir</button>
        `;
        
        container.appendChild(clubEl);
    });
}

// === EVENT LISTENERS ===

function initEventListeners() {
    // Card 3D flip
    const card3D = document.getElementById('card3DWrapper');
    card3D.addEventListener('click', () => {
        document.getElementById('bankCard3D').classList.toggle('flipped');
        hapticFeedback('medium');
    });
    
    // Card actions
    document.getElementById('btnShowCardNumber').addEventListener('click', () => {
        const numberEl = document.getElementById('cardNumber');
        numberEl.textContent = numberEl.textContent.includes('•') ? '4532 1234 5678 4567' : '•••• •••• •••• 4567';
        hapticFeedback('light');
    });
    
    document.getElementById('btnBlockCard').addEventListener('click', () => {
        showToast('Carte bloquée avec succès', 'success');
        hapticFeedback('heavy');
    });
    
    document.getElementById('btnCardLimits').addEventListener('click', () => {
        showToast('Gestion des limites bientôt disponible', 'info');
    });
    
    // Transfer buttons
    document.getElementById('btnToCard').addEventListener('click', () => {
        showToast('Transfert vers carte : 50€', 'success');
        showConfetti();
        hapticFeedback('medium');
    });
    
    document.getElementById('btnFromCard').addEventListener('click', () => {
        showToast('Transfert depuis carte : 50€', 'success');
        showConfetti();
        hapticFeedback('medium');
    });
    
    // AI quick actions
    document.querySelectorAll('.ai-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            handleAIAction(action);
        });
    });
    
    // Open chat
    document.getElementById('btnOpenChat').addEventListener('click', () => {
        openChatModal();
    });
    
    document.getElementById('floatingChatBtn').addEventListener('click', () => {
        openChatModal();
    });
    
    // Chat modal
    document.getElementById('btnCloseChat').addEventListener('click', () => {
        closeChatModal();
    });
    
    document.getElementById('btnSend').addEventListener('click', () => {
        sendChatMessage();
    });
    
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    // Voice recording
    document.getElementById('btnMic').addEventListener('click', () => {
        toggleVoiceRecording();
    });
    
    document.getElementById('btnStopRecording').addEventListener('click', () => {
        stopVoiceRecording();
    });
    
    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('change', (e) => {
        document.body.classList.toggle('light-mode', !e.target.checked);
        hapticFeedback('light');
    });
    
    // Leaderboard
    document.getElementById('btnViewFullLeaderboard').addEventListener('click', () => {
        openLeaderboardModal();
    });
}

// === MODAL FUNCTIONS ===

function openStreamModal(stream) {
    const modal = document.getElementById('streamModal');
    modal.classList.add('show');
    
    document.getElementById('streamViewers').textContent = stream.viewers || 0;
    
    // Simulate chat messages
    const messagesContainer = document.getElementById('streamMessages');
    messagesContainer.innerHTML = `
        <div style="padding: 10px; background: rgba(0,0,0,0.7); border-radius: 8px; margin-bottom: 8px;">
            <strong>Pierre:</strong> Incroyable ce match ! 🔥
        </div>
        <div style="padding: 10px; background: rgba(0,0,0,0.7); border-radius: 8px; margin-bottom: 8px;">
            <strong>Marie:</strong> Allez l'OM ! 💙
        </div>
    `;
    
    document.getElementById('btnCloseStream').addEventListener('click', () => {
        modal.classList.remove('show');
    });
    
    hapticFeedback('medium');
}

function openP2PModal(contact) {
    const modal = document.getElementById('p2pModal');
    modal.classList.add('show');
    
    document.getElementById('p2pContactSelected').innerHTML = `
        <img src="${contact.avatar}" alt="${contact.name}" style="width: 48px; height: 48px; border-radius: 50%; margin-right: 12px;">
        <div>
            <h4>${contact.name}</h4>
            <span>Envoyer de l'argent</span>
        </div>
    `;
    
    document.getElementById('btnCloseP2P').addEventListener('click', () => {
        modal.classList.remove('show');
    });
    
    document.getElementById('btnConfirmP2P').addEventListener('click', () => {
        const amount = document.getElementById('p2pAmount').value;
        const currency = document.getElementById('p2pCurrency').value;
        
        if (amount && parseFloat(amount) > 0) {
            showToast(`${amount} ${currency} envoyés à ${contact.name}`, 'success');
            showConfetti();
            modal.classList.remove('show');
            hapticFeedback('heavy');
        } else {
            showToast('Montant invalide', 'error');
        }
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    hapticFeedback('medium');
}

function openChatModal() {
    const modal = document.getElementById('chatModal');
    modal.classList.add('show');
    
    // Load chat messages
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    
    chatMessagesPreview.forEach(msg => {
        addChatMessage(msg.content, msg.type);
    });
    
    // Quick replies
    const quickReplies = ['Solde wallet', 'Prochain match', 'Mes badges', 'Aide'];
    document.getElementById('quickReplies').innerHTML = quickReplies.map(reply => 
        `<button class="quick-reply-btn" onclick="sendQuickReply('${reply}')">${reply}</button>`
    ).join('');
    
    hapticFeedback('medium');
}

function closeChatModal() {
    const modal = document.getElementById('chatModal');
    modal.classList.remove('show');
}

function openLeaderboardModal() {
    const modal = document.getElementById('leaderboardModal');
    modal.classList.add('show');
    
    // Generate mock leaderboard
    let leaderboardHTML = '<div style="padding: 20px;">';
    
    for (let i = 1; i <= 20; i++) {
        const isUser = i === 7;
        leaderboardHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${isUser ? 'rgba(0,176,224,0.2)' : 'var(--bg-card)'}; border-radius: 12px; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 18px; font-weight: 700; width: 30px;">#${i}</span>
                    <img src="https://i.pravatar.cc/40?img=${i}" style="width: 40px; height: 40px; border-radius: 50%;">
                    <div>
                        <div style="font-weight: 600;">${isUser ? userData.name : 'Fan ' + i}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${Math.floor(Math.random() * 5000) + 5000} pts</div>
                    </div>
                </div>
                ${isUser ? '<span style="color: var(--primary-blue); font-weight: 700;">TOI</span>' : ''}
            </div>
        `;
    }
    
    leaderboardHTML += '</div>';
    document.getElementById('leaderboardContent').innerHTML = leaderboardHTML;
    
    document.getElementById('btnCloseLeaderboard').addEventListener('click', () => {
        modal.classList.remove('show');
    });
    
    hapticFeedback('medium');
}

// === CHAT FUNCTIONS ===

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        addChatMessage(message, 'user');
        input.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            const responses = [
                'Je peux t\'aider avec ça ! 😊',
                'Voici ce que j\'ai trouvé pour toi.',
                'Besoin d\'autre chose ?',
                'Je suis là pour t\'aider !'
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addChatMessage(randomResponse, 'bot');
            
            // Text-to-speech
            speak(randomResponse);
        }, 1000);
        
        hapticFeedback('light');
    }
}

function addChatMessage(content, type) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message';
    
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    messageEl.innerHTML = `
        <div class="message-content ${type}">${content}</div>
        <span class="message-time">${time}</span>
    `;
    
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendQuickReply(reply) {
    document.getElementById('chatInput').value = reply;
    sendChatMessage();
}

function handleAIAction(action) {
    let message = '';
    
    switch(action) {
        case 'ticket':
            message = 'Réserver billet';
            break;
        case 'product':
            message = 'Trouve-moi un maillot';
            break;
        case 'balance':
            message = 'Quel est mon solde ?';
            break;
        case 'stats':
            message = 'Montre-moi mes statistiques';
            break;
    }
    
    openChatModal();
    setTimeout(() => {
        document.getElementById('chatInput').value = message;
        sendChatMessage();
    }, 300);
}

// === SPEECH RECOGNITION & SYNTHESIS ===

function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chatInput').value = transcript;
            stopVoiceRecording();
            
            // Auto send
            setTimeout(() => {
                sendChatMessage();
            }, 500);
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopVoiceRecording();
            showToast('Erreur de reconnaissance vocale', 'error');
        };
        
        recognition.onend = () => {
            stopVoiceRecording();
        };
    } else {
        console.log('Speech Recognition API not supported');
    }
}

function toggleVoiceRecording() {
    if (!isRecording && recognition) {
        startVoiceRecording();
    } else {
        stopVoiceRecording();
    }
}

function startVoiceRecording() {
    if (recognition) {
        isRecording = true;
        document.getElementById('voiceRecording').style.display = 'flex';
        document.querySelector('.chat-input-wrapper').style.display = 'none';
        
        recognition.start();
        hapticFeedback('medium');
    } else {
        showToast('Reconnaissance vocale non disponible', 'error');
    }
}

function stopVoiceRecording() {
    if (recognition && isRecording) {
        isRecording = false;
        document.getElementById('voiceRecording').style.display = 'none';
        document.querySelector('.chat-input-wrapper').style.display = 'flex';
        
        recognition.stop();
        hapticFeedback('light');
    }
}

function speak(text) {
    if (synthesis) {
        // Cancel any ongoing speech
        synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        synthesis.speak(utterance);
    }
}

// === UTILITY FUNCTIONS ===

function updateHeaderClub() {
    const mainClub = clubsData.find(c => c.id === userData.mainClub);
    if (mainClub) {
        document.getElementById('currentClubLogo').querySelector('img').src = mainClub.logo;
        document.getElementById('headerClubName').textContent = mainClub.name;
        document.getElementById('headerLevel').textContent = `${userData.level} 💎`;
        
        // Update card watermark
        document.getElementById('cardClubWatermark').querySelector('img').src = mainClub.logo;
        
        // Update card gradient to club colors
        const cardFront = document.querySelector('.card-front');
        cardFront.style.background = `linear-gradient(135deg, ${mainClub.colors.primary}, ${mainClub.colors.secondary})`;
    }
}

function hapticFeedback(intensity = 'medium') {
    if ('vibrate' in navigator) {
        const patterns = {
            light: 10,
            medium: 20,
            heavy: 30
        };
        navigator.vibrate(patterns[intensity] || 20);
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showConfetti() {
    const colors = ['#00B0E0', '#00ff88', '#ff3366', '#ff8c42', '#FFD700'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 30);
    }
}

function showShareModal() {
    showToast('Partage sur réseaux sociaux bientôt disponible !', 'info');
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// === PULL TO REFRESH ===

let touchStartY = 0;
let touchEndY = 0;

document.querySelector('.app-main').addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.querySelector('.app-main').addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].clientY;
    
    // Pull down detected
    if (touchEndY - touchStartY > 100 && document.querySelector('.app-main').scrollTop === 0) {
        showToast('🔄 Actualisation...', 'info');
        
        setTimeout(() => {
            showToast('✓ Contenu actualisé', 'success');
            hapticFeedback('medium');
        }, 1500);
    }
}, { passive: true });

// === SERVICE WORKER (PWA) ===

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registered:', registration);
        }).catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

console.log('PaieCashPlay Fan App v2.1 initialized! 🚀');