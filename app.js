// ========================================
// PAIECASHPLAY FAN APP - JAVASCRIPT FINAL
// ========================================

// === DONNÉES ===

// Amis et leurs stories
const friends = [
    {
        id: 1,
        name: 'Sophie Martin',
        username: '@sophie_om',
        avatar: 'https://i.pravatar.cc/150?img=45',
        hasStory: true
    },
    {
        id: 2,
        name: 'Thomas Dubois',
        username: '@thomas_marseille',
        avatar: 'https://i.pravatar.cc/150?img=33',
        hasStory: true
    },
    {
        id: 3,
        name: 'Julie Bernard',
        username: '@julie_om13',
        avatar: 'https://i.pravatar.cc/150?img=47',
        hasStory: true
    },
    {
        id: 4,
        name: 'Marc Petit',
        username: '@marc_velodrome',
        avatar: 'https://i.pravatar.cc/150?img=51',
        hasStory: true
    },
    {
        id: 5,
        name: 'Emma Leroy',
        username: '@emma_om_forever',
        avatar: 'https://i.pravatar.cc/150?img=29',
        hasStory: true
    }
];

// Posts d'amis qui parlent du match
const friendsPosts = [
    {
        id: 1,
        author: friends[0],
        time: 'Il y a 15 min',
        text: '⚽ Quelle victoire hier soir ! L\'OM est de retour au sommet ! 💙 Le Vélodrome était en feu ! #AllezLOM',
        image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800',
        likes: 142,
        comments: 23,
        shares: 8,
        liked: false
    },
    {
        id: 2,
        author: friends[1],
        time: 'Il y a 1h',
        text: 'Déjà mes places pour OM-PSG ! 🎟️ Qui vient avec moi au Classico ? Avec mon OM Coin j\'ai eu -5% 💰',
        image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
        likes: 89,
        comments: 34,
        shares: 12,
        liked: true
    },
    {
        id: 3,
        author: friends[2],
        time: 'Il y a 2h',
        text: 'Le nouveau maillot domicile est juste parfait ! 🤩 Commandé via PaieCashPlay, livré en 24h ⚡',
        image: 'https://images.unsplash.com/photo-1551318180-655c3a79bbdd?w=800',
        likes: 215,
        comments: 45,
        shares: 18,
        liked: false
    },
    {
        id: 4,
        author: friends[3],
        time: 'Il y a 3h',
        text: 'Ambiance de dingue au stade ! 😍 47 000 supporters derrière l\'équipe ! Allez l\'OM ! 🏟️💙',
        image: 'https://images.unsplash.com/photo-1522778526004-d6f42794f9f6?w=800',
        likes: 178,
        comments: 28,
        shares: 15,
        liked: true
    },
    {
        id: 5,
        author: friends[4],
        time: 'Il y a 4h',
        text: 'Rencontre avec Habib Beye aujourd\'hui à l\'événement PaieCashPlay ! ⭐ Quelle légende ! Photo souvenir 📸',
        image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
        likes: 302,
        comments: 56,
        shares: 24,
        liked: false
    }
];

// Ambassadeurs OM
const ambassadors = [
    {
        id: 1,
        name: 'Abedi Pelé',
        role: 'Ambassadeur Légende',
        photo: 'https://i.pravatar.cc/150?img=11',
        period: '1987-1993',
        achievements: 'Ballon d\'Or Africain 1991, 1992, 1993'
    },
    {
        id: 2,
        name: 'Didier Drogba',
        role: 'Ambassadeur Légende',
        photo: 'https://i.pravatar.cc/150?img=13',
        period: '2003-2004',
        achievements: 'Champion d\'Europe 2012, 4x Champion d\'Angleterre'
    },
    {
        id: 3,
        name: 'Mamadou Niang',
        role: 'Ambassadeur Officiel',
        photo: 'https://i.pravatar.cc/150?img=52',
        period: '2005-2011',
        achievements: 'Meilleur buteur 2005-2006 (14 buts)'
    },
    {
        id: 4,
        name: 'Djamel Belmadi',
        role: 'Sélectionneur Algérie',
        photo: 'https://i.pravatar.cc/150?img=32',
        period: '2003-2005',
        achievements: 'Champion d\'Afrique 2019 (sélectionneur)'
    },
    {
        id: 5,
        name: 'Taye Taiwo',
        role: 'Ambassadeur Officiel',
        photo: 'https://i.pravatar.cc/150?img=28',
        period: '2005-2011',
        achievements: '3x Champion de France (2008, 2009, 2010)'
    },
    {
        id: 6,
        name: 'Habib Beye',
        role: 'Ambassadeur & Consultant',
        photo: 'https://i.pravatar.cc/150?img=23',
        period: '2007-2009',
        achievements: '2x Champion de France, Finaliste C1 2004'
    },
    {
        id: 7,
        name: 'Souleymane Diawara',
        role: 'Ambassadeur Officiel',
        photo: 'https://i.pravatar.cc/150?img=17',
        period: '2004-2012',
        achievements: 'Champion de France 2010, Finaliste C1 2004'
    },
    {
        id: 8,
        name: 'Stéphane Mbia',
        role: 'Ambassadeur Officiel',
        photo: 'https://i.pravatar.cc/150?img=19',
        period: '2009-2012',
        achievements: 'Champion de France 2010, Coupe de France 2010'
    },
    {
        id: 9,
        name: 'François Omam-Biyik',
        role: 'Ambassadeur Légende',
        photo: 'https://i.pravatar.cc/150?img=26',
        period: '1993-1997',
        achievements: 'Champion d\'Afrique 1988, Quart CM 1990'
    },
    {
        id: 10,
        name: 'Joseph-Antoine Bell',
        role: 'Ambassadeur Légende',
        photo: 'https://i.pravatar.cc/150?img=31',
        period: '1985-1991',
        achievements: '3x Coupe de France (1986, 1987, 1989)'
    },
    {
        id: 11,
        name: 'André Ayew',
        role: 'Ambassadeur Actif',
        photo: 'https://i.pravatar.cc/150?img=41',
        period: '2007-2015',
        achievements: 'Champion de France 2010, Capitaine Ghana'
    }
];

// Badges
const badges = [
    { icon: '🏟️', name: 'Fan Fidèle', unlocked: true },
    { icon: '⚽', name: 'Supporter', unlocked: true },
    { icon: '🎯', name: 'Actif', unlocked: true },
    { icon: '💎', name: 'Platine', unlocked: true },
    { icon: '🔥', name: 'En Feu', unlocked: true },
    { icon: '⭐', name: 'Pro', unlocked: true },
    { icon: '👑', name: 'VIP', unlocked: false },
    { icon: '🏆', name: 'Champion', unlocked: false }
];

// Missions
const missions = [
    { icon: '📱', title: 'Partager un post', reward: '+50 pts' },
    { icon: '🎟️', title: 'Acheter un billet', reward: '+100 pts' },
    { icon: '🛍️', title: 'Commander boutique', reward: '+75 pts' },
    { icon: '👥', title: 'Inviter 3 amis', reward: '+200 pts' }
];

// Matchs
const matches = [
    {
        id: 1,
        date: 'Dimanche 15 Dec, 21:00',
        competition: 'Ligue 1',
        homeTeam: 'Olympique de Marseille',
        homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
        awayTeam: 'Paris Saint-Germain',
        awayLogo: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
        price: 45
    },
    {
        id: 2,
        date: 'Samedi 21 Dec, 19:00',
        competition: 'Ligue 1',
        homeTeam: 'Olympique de Marseille',
        homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
        awayTeam: 'Olympique Lyonnais',
        awayLogo: 'https://upload.wikimedia.org/wikipedia/en/f/f2/Olympique_Lyonnais_logo.svg',
        price: 38
    },
    {
        id: 3,
        date: 'Mercredi 28 Dec, 20:45',
        competition: 'Coupe de France',
        homeTeam: 'Olympique de Marseille',
        homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
        awayTeam: 'AS Monaco',
        awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/4/47/AS_Monaco_FC.svg',
        price: 42
    }
];

// Produits
const products = [
    {
        id: 1,
        name: 'Maillot Domicile 2024',
        category: 'maillots',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1551318180-655c3a79bbdd?w=400'
    },
    {
        id: 2,
        name: 'Maillot Extérieur 2024',
        category: 'maillots',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1511423549597-935cdb1d1281?w=400'
    },
    {
        id: 3,
        name: 'Écharpe OM',
        category: 'accessoires',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1617606002779-51d866e40a27?w=400'
    },
    {
        id: 4,
        name: 'Casquette OM',
        category: 'accessoires',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400'
    },
    {
        id: 5,
        name: 'Sweat à capuche',
        category: 'maillots',
        price: 69.99,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'
    },
    {
        id: 6,
        name: 'Short Training',
        category: 'accessoires',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400'
    }
];

// Contacts
const contacts = [
    { id: 1, name: 'Sophie', avatar: 'https://i.pravatar.cc/150?img=45' },
    { id: 2, name: 'Thomas', avatar: 'https://i.pravatar.cc/150?img=33' },
    { id: 3, name: 'Julie', avatar: 'https://i.pravatar.cc/150?img=47' },
    { id: 4, name: 'Marc', avatar: 'https://i.pravatar.cc/150?img=51' },
    { id: 5, name: 'Emma', avatar: 'https://i.pravatar.cc/150?img=29' },
    { id: 6, name: 'Lucas', avatar: 'https://i.pravatar.cc/150?img=12' }
];

// === STATE ===
let cart = [];
let balanceVisible = true;
let addressVisible = false;

// === INIT ===
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        init();
    }, 1500);
});

function init() {
    renderStories();
    renderPosts();
    renderBadges();
    renderMissions();
    renderAmbassadors();
    renderMatches();
    renderProducts();
    renderContacts();
    setupNavigation();
    setupEventListeners();
}

// === RENDER FUNCTIONS ===

function renderStories() {
    const container = document.getElementById('storiesContainer');
    container.innerHTML = friends.map(friend => `
        <div class="story-item">
            <div class="story-avatar">
                <img src="${friend.avatar}" alt="${friend.name}">
            </div>
            <span class="story-username">${friend.name.split(' ')[0]}</span>
        </div>
    `).join('');
}

function renderPosts() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = friendsPosts.map(post => `
        <div class="post-card">
            <div class="post-header">
                <img src="${post.author.avatar}" alt="${post.author.name}" class="post-avatar">
                <div class="post-user-info">
                    <div class="post-username">
                        ${post.author.name} ✓
                    </div>
                    <div class="post-time">${post.time}</div>
                </div>
            </div>
            ${post.image ? `<img src="${post.image}" class="post-image" alt="Post">` : ''}
            <div class="post-content">
                <p class="post-text">${post.text}</p>
            </div>
            <div class="post-actions">
                <button class="post-action-btn ${post.liked ? 'liked' : ''}" onclick="likePost(${post.id})">
                    ❤️ <span id="likes-${post.id}">${post.likes}</span>
                </button>
                <button class="post-action-btn">
                    💬 ${post.comments}
                </button>
                <button class="post-action-btn">
                    🔄 ${post.shares}
                </button>
            </div>
        </div>
    `).join('');
}

function renderBadges() {
    const container = document.getElementById('badgesGrid');
    container.innerHTML = badges.map(badge => `
        <div class="badge-item ${badge.unlocked ? '' : 'locked'}">
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
        </div>
    `).join('');
}

function renderMissions() {
    const container = document.getElementById('missionsGrid');
    container.innerHTML = missions.map(mission => `
        <div class="mission-card">
            <div class="mission-icon">${mission.icon}</div>
            <div class="mission-info">
                <div class="mission-title">${mission.title}</div>
                <div class="mission-reward">${mission.reward}</div>
            </div>
        </div>
    `).join('');
}

function renderAmbassadors() {
    const container = document.getElementById('ambassadeursGrid');
    container.innerHTML = ambassadors.map(amb => `
        <div class="ambassadeur-card">
            <img src="${amb.photo}" alt="${amb.name}" class="ambassadeur-photo">
            <div class="ambassadeur-info">
                <div class="ambassadeur-name">${amb.name} ✓</div>
                <div class="ambassadeur-role">${amb.role}</div>
                <div class="ambassadeur-period">📅 ${amb.period}</div>
                <div class="ambassadeur-achievements">${amb.achievements}</div>
            </div>
        </div>
    `).join('');
}

function renderMatches() {
    const container = document.getElementById('matchesGrid');
    container.innerHTML = matches.map(match => `
        <div class="match-card">
            <div class="match-header">
                <div class="match-date">${match.date}</div>
                <div class="match-competition">${match.competition}</div>
            </div>
            <div class="match-teams">
                <div class="match-team">
                    <img src="${match.homeLogo}" class="match-team-logo">
                    <div class="match-team-name">${match.homeTeam}</div>
                </div>
                <div class="match-vs">VS</div>
                <div class="match-team">
                    <img src="${match.awayLogo}" class="match-team-logo">
                    <div class="match-team-name">${match.awayTeam}</div>
                </div>
            </div>
            <div class="match-footer">
                <div class="match-price">${match.price}€</div>
                <button class="btn-buy-ticket" onclick="buyTicket(${match.id})">Réserver</button>
            </div>
        </div>
    `).join('');
}

function renderProducts() {
    const container = document.getElementById('productsGrid');
    container.innerHTML = products.map(product => `
        <div class="product-card" onclick="addToCart(${product.id})">
            <img src="${product.image}" class="product-image">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price.toFixed(2)}€</div>
            </div>
        </div>
    `).join('');
}

function renderContacts() {
    const container = document.getElementById('contactsGrid');
    container.innerHTML = contacts.map(contact => `
        <div class="contact-card" onclick="sendMoney(${contact.id})">
            <div class="contact-avatar">
                <img src="${contact.avatar}" alt="${contact.name}">
            </div>
            <div class="contact-name">${contact.name}</div>
        </div>
    `).join('');
}

// === NAVIGATION ===
function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.section;
            
            // Hide all sections
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            
            // Show target section
            document.getElementById(sectionId).classList.add('active');
            
            // Update nav buttons
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// === EVENT LISTENERS ===
function setupEventListeners() {
    // AI Button
    document.getElementById('btnAI').addEventListener('click', () => {
        document.getElementById('aiModal').classList.add('active');
    });
    
    // Balance Toggle
    document.getElementById('toggleBalance').addEventListener('click', () => {
        balanceVisible = !balanceVisible;
        document.getElementById('cardBalance').textContent = balanceVisible ? '1 247,50 €' : '• • • • •';
    });
    
    // Address Toggle
    document.getElementById('toggleAddress').addEventListener('click', () => {
        addressVisible = !addressVisible;
        document.getElementById('walletAddress').textContent = addressVisible 
            ? '0x742d35Cc6634C0532925a3b844Bc9e7595f8f3a'
            : '0x742d...8f3a';
    });
    
    // Shop categories
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterProducts(btn.dataset.cat);
        });
    });
}

// === ACTIONS ===
function likePost(postId) {
    const post = friendsPosts.find(p => p.id === postId);
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    document.getElementById(`likes-${postId}`).textContent = post.likes;
    document.querySelector(`button[onclick="likePost(${postId})"]`).classList.toggle('liked');
}

function buyTicket(matchId) {
    alert('Réservation pour le match #' + matchId);
}

function addToCart(productId) {
    cart.push(productId);
    document.querySelector('.cart-count').textContent = cart.length;
    alert('Produit ajouté au panier !');
}

function sendMoney(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    alert('Envoyer de l\'argent à ' + contact.name);
}

function filterProducts(category) {
    // Filter logic here
    console.log('Filter:', category);
}

// === MODAL FUNCTIONS ===
function closeAIModal() {
    document.getElementById('aiModal').classList.remove('active');
}

function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value;
    if (message) {
        alert('Message IA: ' + message);
        input.value = '';
    }
}

function showQRCode() {
    document.getElementById('qrModal').classList.add('active');
}

function closeQRModal() {
    document.getElementById('qrModal').classList.remove('active');
}

function createPaymentLink() {
    alert('Créer un lien de paiement PaieCash');
}

function enableNFC() {
    alert('Activer le paiement sans contact');
}

function copyAddress() {
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f8f3a';
    navigator.clipboard.writeText(address);
    alert('✓ Adresse copiée');
}

console.log('PaieCashPlay Fan App initialized! 🚀');
