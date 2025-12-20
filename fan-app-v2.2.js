// ========================================
// PAIECASHPLAY FAN APP v2.2 - JAVASCRIPT
// ========================================

// === IMPORT v2.1 DATA & FUNCTIONS ===
// Réutiliser les données de v2.1 et ajouter nouvelles fonctionnalités

// === NOUVELLES DONNÉES v2.2 ===

// Stablecoin Club
const clubStablecoin = {
    id: 'omc',
    name: 'OM Coin',
    symbol: 'OMC',
    balance: 2450.00,
    parity: '1 OMC = 1 EUR',
    discount: 5, // 5% discount in shop
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
    benefits: [
        '✓ Achats boutique -5%',
        '✓ Billets prioritaires',
        '✓ Cashback +2%'
    ]
};

// Matchs billetterie
const matchesData = [
    {
        id: 1,
        homeTeam: 'Olympique de Marseille',
        homeTeamLogo: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
        awayTeam: 'Paris Saint-Germain',
        awayTeamLogo: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
        date: '15 Déc 2025',
        time: '21:00',
        venue: 'Stade Vélodrome',
        price: 75.00,
        badge: 'Classique',
        available: 47
    },
    {
        id: 2,
        homeTeam: 'Olympique de Marseille',
        homeTeamLogo: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
        awayTeam: 'Olympique Lyonnais',
        awayTeamLogo: 'https://upload.wikimedia.org/wikipedia/en/e/e2/Olympique_Lyonnais_logo.svg',
        date: '22 Déc 2025',
        time: '17:00',
        venue: 'Stade Vélodrome',
        price: 45.00,
        badge: 'Important',
        available: 234
    },
    {
        id: 3,
        homeTeam: 'Olympique de Marseille',
        homeTeamLogo: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
        awayTeam: 'AS Monaco',
        awayTeamLogo: 'https://upload.wikimedia.org/wikipedia/en/c/c8/AS_Monaco_FC_Logo.svg',
        date: '5 Jan 2026',
        time: '19:00',
        venue: 'Stade Vélodrome',
        price: 55.00,
        badge: 'Ligue 1',
        available: 1247
    }
];

// Billets NFT possédés
const myTicketsData = [
    {
        id: 1,
        match: 'OM vs PSG',
        date: '15 Déc 2025',
        qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-001',
        blockchainAddress: '0x7a2b...f4e8',
        nftImage: '🎫'
    },
    {
        id: 2,
        match: 'OM vs OL',
        date: '22 Déc 2025',
        qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-002',
        blockchainAddress: '0x5c9d...a3b1',
        nftImage: '🎫'
    },
    {
        id: 3,
        match: 'OM vs LOSC',
        date: '29 Déc 2025',
        qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-003',
        blockchainAddress: '0x8f1e...c7d2',
        nftImage: '🎫'
    }
];

// Produits boutique
const productsData = [
    {
        id: 1,
        name: 'Maillot OM Domicile 2025/26',
        category: 'maillots',
        price: 89.99,
        image: '👕',
        badge: 'NOUVEAU',
        stock: 45
    },
    {
        id: 2,
        name: 'Maillot OM Extérieur 2025/26',
        category: 'maillots',
        price: 89.99,
        image: '👕',
        badge: 'NOUVEAU',
        stock: 38
    },
    {
        id: 3,
        name: 'Écharpe OM Officielle',
        category: 'accessories',
        price: 24.99,
        image: '🧣',
        badge: '',
        stock: 127
    },
    {
        id: 4,
        name: 'Casquette OM',
        category: 'accessories',
        price: 19.99,
        image: '🧢',
        badge: '',
        stock: 89
    },
    {
        id: 5,
        name: 'Maillot Collector NFT',
        category: 'nft',
        price: 149.99,
        image: '✨',
        badge: 'EXCLUSIF',
        stock: 10
    },
    {
        id: 6,
        name: 'Moment Historique NFT',
        category: 'nft',
        price: 199.99,
        image: '🏆',
        badge: 'LIMITÉ',
        stock: 5
    }
];

// Wallets avec adresses
const walletsDataV2 = [
    { 
        id: 'eur', 
        name: 'Euro', 
        symbol: 'EUR', 
        icon: '💶', 
        balance: 1247.50, 
        fiatValue: 1247.50,
        address: '0x742d35f8a2c9b4e1d7f3a6c8e9b2d4f6a8c1e3f5',
        addressShort: '0x742d...e3f5',
        showAddress: true
    },
    { 
        id: 'btc', 
        name: 'Bitcoin', 
        symbol: 'BTC', 
        icon: '₿', 
        balance: 0.00523, 
        fiatValue: 234.15,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        addressShort: '1A1zP...DivfNa',
        showAddress: true
    },
    { 
        id: 'eth', 
        name: 'Ethereum', 
        symbol: 'ETH', 
        icon: '⧫', 
        balance: 0.1247, 
        fiatValue: 280.19,
        address: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
        addressShort: '0x5aAe...BeAed',
        showAddress: true
    },
    { 
        id: 'usdt', 
        name: 'Tether', 
        symbol: 'USDT', 
        icon: '💵', 
        balance: 500.00, 
        fiatValue: 500.00,
        address: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
        addressShort: '0x89d2...0359',
        showAddress: true
    }
];

// Contacts P2P avec téléphones
const contactsDataV2 = [
    { 
        id: 1, 
        name: 'Pierre', 
        avatar: 'https://i.pravatar.cc/64?img=1', 
        online: true,
        address: '0x8f3b2a1c5e7d9f4a6b8c0e2d4f6a8c1e3f5a7b9c',
        phone: '+33612345678'
    },
    { 
        id: 2, 
        name: 'Marie', 
        avatar: 'https://i.pravatar.cc/64?img=5', 
        online: false,
        address: '0x3c7e5f9a1b3d5e7f9a1c3e5f7a9b1d3e5f7a9b1c',
        phone: '+33687654321'
    },
    { 
        id: 3, 
        name: 'Thomas', 
        avatar: 'https://i.pravatar.cc/64?img=3', 
        online: true,
        address: '0x9d4f6a8c0e2b4d6f8a0c2e4f6a8c0e2b4d6f8a0c',
        phone: '+33623456789'
    },
    { 
        id: 4, 
        name: 'Julie', 
        avatar: 'https://i.pravatar.cc/64?img=9', 
        online: false,
        address: '0x7b5d3f1a9c7e5b3d1f9a7c5e3b1d9f7a5c3e1b9d',
        phone: '+33698765432'
    },
    { 
        id: 5, 
        name: 'Alex', 
        avatar: 'https://i.pravatar.cc/64?img=8', 
        online: true,
        address: '0x4e6f8a2c0b4d6e8a2c0b4d6e8a2c0b4d6e8a2c0b',
        phone: '+33634567890'
    }
];

// Panier
let cart = [];
let cartTotal = 0;

// État visibilité
let cardBalanceVisible = true;
let omcBalanceVisible = true;
let cardBalance = 1247.50;

// Password utilisateur (en production, hashé côté serveur)
const userPassword = 'test1234';

// === STATE MANAGEMENT ===
let currentSection = 'feedSection';

// === INITIALIZATION ===

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        init();
    }, 2000);
});

function init() {
    initNavigation();
    initAIAssistant();
    initWallets();
    initStablecoin();
    initP2PSearch();
    initBilletterie();
    initBoutique();
    initCart();
    initCardToggle();
    initEventListeners();
}

// === NAVIGATION ===

function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.getAttribute('data-section');
            
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');
            
            currentSection = sectionId;
            hapticFeedback('light');
        });
    });
}

// === AI ASSISTANT ===

function initAIAssistant() {
    const aiBar = document.getElementById('aiAssistantBar');
    const btnExpandAI = document.getElementById('btnExpandAI');
    const aiChatModal = document.getElementById('aiChatModal');
    const btnCloseAIChat = document.getElementById('btnCloseAIChat');
    
    aiBar.addEventListener('click', openAIChat);
    btnExpandAI.addEventListener('click', openAIChat);
    btnCloseAIChat.addEventListener('click', closeAIChat);
}

function openAIChat() {
    const modal = document.getElementById('aiChatModal');
    modal.classList.add('show');
    
    // Load initial messages
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = `
        <div class="chat-message">
            <div class="message-content bot">
                Bonjour Maxime ! 👋 Comment puis-je t'aider aujourd'hui ?
            </div>
            <span class="message-time">Maintenant</span>
        </div>
    `;
    
    // Quick replies
    const quickReplies = ['Solde wallet', 'Prochain match', 'Acheter OM Coin', 'Aide'];
    document.getElementById('quickReplies').innerHTML = quickReplies.map(reply => 
        `<button class="quick-reply-btn" onclick="sendQuickReply('${reply}')">${reply}</button>`
    ).join('');
    
    hapticFeedback('medium');
}

function closeAIChat() {
    const modal = document.getElementById('aiChatModal');
    modal.classList.remove('show');
}

function sendQuickReply(reply) {
    const input = document.getElementById('chatInput');
    input.value = reply;
    sendChatMessage();
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        addChatMessage(message, 'user');
        input.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            let response = '';
            if (message.toLowerCase().includes('solde')) {
                response = `Ton solde total est de ${(cardBalance + clubStablecoin.balance + 234.15 + 280.19 + 500).toFixed(2)} €. Tu as ${clubStablecoin.balance} OM Coin ! 💰`;
            } else if (message.toLowerCase().includes('match')) {
                response = `Le prochain match est OM vs PSG le 15 Déc à 21h au Vélodrome ! 🎫 Veux-tu réserver ?`;
            } else if (message.toLowerCase().includes('om coin')) {
                response = `Tu as ${clubStablecoin.balance} OM Coin. Avec OMC, tu as -5% en boutique ! Veux-tu acheter plus d'OMC ?`;
            } else {
                response = `Je peux t'aider avec : solde wallet, prochain match, achats, billets. Que veux-tu savoir ? 😊`;
            }
            addChatMessage(response, 'bot');
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

// === WALLETS ===

function initWallets() {
    const container = document.getElementById('walletsGrid');
    
    walletsDataV2.forEach(wallet => {
        const walletEl = document.createElement('div');
        walletEl.className = 'wallet-card';
        
        walletEl.innerHTML = `
            <div class="wallet-info">
                <div class="wallet-icon">${wallet.icon}</div>
                <div class="wallet-details">
                    <h4>${wallet.name}</h4>
                    <p class="wallet-amount">${wallet.balance.toFixed(wallet.symbol === 'BTC' || wallet.symbol === 'ETH' ? 5 : 2)} ${wallet.symbol}</p>
                    <div class="wallet-address">
                        <span class="wallet-address-text ${wallet.showAddress ? '' : 'hidden'}" id="addr-${wallet.id}">${wallet.addressShort}</span>
                        <button class="btn-toggle-visibility" onclick="toggleWalletAddress('${wallet.id}')">
                            <span id="icon-addr-${wallet.id}">👁️</span>
                        </button>
                        <button class="btn-copy-address" onclick="copyAddress('${wallet.address}')">📋</button>
                    </div>
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

function toggleWalletAddress(walletId) {
    const addrEl = document.getElementById(`addr-${walletId}`);
    const iconEl = document.getElementById(`icon-addr-${walletId}`);
    
    addrEl.classList.toggle('hidden');
    iconEl.textContent = addrEl.classList.contains('hidden') ? '🙈' : '👁️';
    
    hapticFeedback('light');
}

function copyAddress(address) {
    navigator.clipboard.writeText(address).then(() => {
        showToast('Adresse copiée ✓', 'success');
        hapticFeedback('medium');
    });
}

// === STABLECOIN ===

function initStablecoin() {
    // Already in HTML, just handle button
    document.getElementById('btnToggleOMC')?.addEventListener('click', toggleOMCBalance);
    document.getElementById('btnBuyOMC')?.addEventListener('click', buyOMC);
}

function toggleOMCBalance() {
    const balanceEl = document.getElementById('omcBalance');
    const iconEl = document.getElementById('iconOMCBalance');
    
    omcBalanceVisible = !omcBalanceVisible;
    
    if (omcBalanceVisible) {
        balanceEl.textContent = `${clubStablecoin.balance.toFixed(2)} OMC`;
        balanceEl.classList.remove('hidden');
        iconEl.textContent = '👁️';
    } else {
        balanceEl.classList.add('hidden');
        iconEl.textContent = '🙈';
    }
    
    hapticFeedback('light');
}

function buyOMC() {
    showToast('Achat OM Coin bientôt disponible ! 🪙', 'info');
    hapticFeedback('medium');
}

// === P2P SEARCH ===

function initP2PSearch() {
    const btnSearchP2P = document.getElementById('btnSearchP2P');
    const input = document.getElementById('p2pSearchInput');
    
    btnSearchP2P?.addEventListener('click', () => {
        const query = input.value.trim();
        if (query) {
            searchP2P(query);
        }
    });
    
    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = input.value.trim();
            if (query) {
                searchP2P(query);
            }
        }
    });
}

function searchP2P(query) {
    const resultsContainer = document.getElementById('p2pSearchResults');
    resultsContainer.innerHTML = '';
    
    // Search by address or phone
    const contact = contactsDataV2.find(c => 
        c.address.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query)
    );
    
    if (contact) {
        const resultEl = document.createElement('div');
        resultEl.className = 'search-result-item';
        
        resultEl.innerHTML = `
            <div class="search-result-avatar">
                <img src="${contact.avatar}" alt="${contact.name}">
            </div>
            <div class="search-result-info">
                <div class="search-result-name">${contact.name}</div>
                <div class="search-result-identifier">${query.includes('0x') ? contact.address.slice(0, 10) + '...' : contact.phone}</div>
            </div>
        `;
        
        resultEl.addEventListener('click', () => {
            openP2PModal(contact);
        });
        
        resultsContainer.appendChild(resultEl);
        showToast(`Contact trouvé : ${contact.name}`, 'success');
        hapticFeedback('medium');
    } else {
        resultsContainer.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;">Aucun contact trouvé</p>';
        showToast('Aucun contact trouvé', 'error');
    }
}

function openP2PModal(contact) {
    const modal = document.getElementById('p2pModal');
    modal.classList.add('show');
    
    document.getElementById('p2pContactSelected').innerHTML = `
        <img src="${contact.avatar}" alt="${contact.name}" style="width: 48px; height: 48px; border-radius: 50%; margin-right: 12px;">
        <div>
            <h4>${contact.name}</h4>
            <span style="font-size:12px;color:var(--text-muted);">${contact.phone}</span>
        </div>
    `;
    
    document.getElementById('btnCloseP2P').addEventListener('click', () => {
        modal.classList.remove('show');
    });
    
    document.getElementById('btnConfirmP2P').addEventListener('click', () => {
        confirmP2PTransfer(contact);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    hapticFeedback('medium');
}

function confirmP2PTransfer(contact) {
    const amount = document.getElementById('p2pAmount').value;
    const currency = document.getElementById('p2pCurrency').value;
    const password = document.getElementById('p2pPassword').value;
    const message = document.getElementById('p2pMessage').value;
    
    // Validate
    if (!amount || parseFloat(amount) <= 0) {
        showToast('Montant invalide', 'error');
        return;
    }
    
    if (!password) {
        showToast('🔒 Mot de passe requis', 'error');
        hapticFeedback('heavy');
        return;
    }
    
    if (password !== userPassword) {
        showToast('🔒 Mot de passe incorrect', 'error');
        hapticFeedback('heavy');
        return;
    }
    
    // Success
    showToast(`${amount} ${currency} envoyés à ${contact.name} ✓`, 'success');
    showConfetti();
    document.getElementById('p2pModal').classList.remove('show');
    
    // Clear form
    document.getElementById('p2pAmount').value = '';
    document.getElementById('p2pPassword').value = '';
    document.getElementById('p2pMessage').value = '';
    
    hapticFeedback('heavy');
}

// === BILLETTERIE ===

function initBilletterie() {
    renderMatches();
    renderMyTickets();
}

function renderMatches() {
    const container = document.getElementById('matchesGrid');
    
    matchesData.forEach(match => {
        const matchEl = document.createElement('div');
        matchEl.className = 'match-card';
        
        matchEl.innerHTML = `
            <div class="match-header">
                <span class="match-date">${match.date} • ${match.time}</span>
                <span class="match-badge">${match.badge}</span>
            </div>
            <div class="match-teams">
                <div class="match-team">
                    <div class="match-team-logo">
                        <img src="${match.homeTeamLogo}" alt="${match.homeTeam}">
                    </div>
                    <span class="match-team-name">OM</span>
                </div>
                <span class="match-vs">VS</span>
                <div class="match-team">
                    <div class="match-team-logo">
                        <img src="${match.awayTeamLogo}" alt="${match.awayTeam}">
                    </div>
                    <span class="match-team-name">${match.awayTeam.split(' ').pop()}</span>
                </div>
            </div>
            <div class="match-info">
                <span class="match-price">À partir de ${match.price.toFixed(2)} €</span>
                <button class="btn-buy-ticket" onclick="buyTicket(${match.id})">Acheter</button>
            </div>
        `;
        
        container.appendChild(matchEl);
    });
}

function renderMyTickets() {
    const container = document.getElementById('myTicketsGrid');
    
    myTicketsData.forEach(ticket => {
        const ticketEl = document.createElement('div');
        ticketEl.className = 'ticket-nft-card';
        
        ticketEl.innerHTML = `
            <div class="ticket-nft-image">${ticket.nftImage}</div>
            <div class="ticket-nft-info">
                <div class="ticket-nft-title">${ticket.match}</div>
                <div class="ticket-nft-date">${ticket.date}</div>
            </div>
        `;
        
        ticketEl.addEventListener('click', () => {
            showTicketDetails(ticket);
        });
        
        container.appendChild(ticketEl);
    });
}

function buyTicket(matchId) {
    const match = matchesData.find(m => m.id === matchId);
    showToast(`Réservation billet ${match.homeTeam} vs ${match.awayTeam} - ${match.price}€`, 'info');
    hapticFeedback('medium');
}

function showTicketDetails(ticket) {
    showToast(`Billet NFT : ${ticket.match} - Blockchain: ${ticket.blockchainAddress}`, 'info');
    hapticFeedback('medium');
}

// === BOUTIQUE ===

function initBoutique() {
    renderProducts();
    initCategoryFilters();
}

function renderProducts(category = 'all') {
    const container = document.getElementById('productsGrid');
    container.innerHTML = '';
    
    const filtered = category === 'all' 
        ? productsData 
        : productsData.filter(p => p.category === category);
    
    filtered.forEach(product => {
        const productEl = document.createElement('div');
        productEl.className = 'product-card';
        
        productEl.innerHTML = `
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <div class="product-name">${product.name}</div>
                <div class="product-price">
                    <span class="product-price-value">${product.price.toFixed(2)} €</span>
                    <button class="btn-add-cart" onclick="addToCart(${product.id})">+</button>
                </div>
            </div>
        `;
        
        container.appendChild(productEl);
    });
}

function initCategoryFilters() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-category');
            renderProducts(category);
            hapticFeedback('light');
        });
    });
}

function addToCart(productId) {
    const product = productsData.find(p => p.id === productId);
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartBadge();
    showToast(`${product.name} ajouté au panier ✓`, 'success');
    hapticFeedback('medium');
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    
    if (totalItems > 0) {
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

// === CART ===

function initCart() {
    document.getElementById('btnCart')?.addEventListener('click', openCart);
    document.getElementById('btnCloseCart')?.addEventListener('click', closeCart);
    document.getElementById('btnCheckout')?.addEventListener('click', checkoutWithOMC);
    document.getElementById('btnClearCart')?.addEventListener('click', clearCart);
}

function openCart() {
    const modal = document.getElementById('cartModal');
    modal.classList.add('show');
    renderCart();
    hapticFeedback('medium');
}

function closeCart() {
    const modal = document.getElementById('cartModal');
    modal.classList.remove('show');
}

function renderCart() {
    const container = document.getElementById('cartContent');
    
    if (cart.length === 0) {
        container.innerHTML = '<div class="cart-empty">Ton panier est vide 🛒</div>';
        document.getElementById('cartTotalPrice').textContent = '0.00 €';
        return;
    }
    
    container.innerHTML = '';
    cartTotal = 0;
    
    cart.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        
        const itemTotal = item.price * item.quantity;
        cartTotal += itemTotal;
        
        itemEl.innerHTML = `
            <div class="cart-item-image">${item.image}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price.toFixed(2)} €</div>
                <div class="cart-item-quantity">
                    <button class="btn-quantity" onclick="updateQuantity(${index}, -1)">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="btn-quantity" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
        `;
        
        container.appendChild(itemEl);
    });
    
    document.getElementById('cartTotalPrice').textContent = `${cartTotal.toFixed(2)} €`;
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    updateCartBadge();
    renderCart();
    hapticFeedback('light');
}

function clearCart() {
    if (confirm('Vider le panier ?')) {
        cart = [];
        updateCartBadge();
        renderCart();
        showToast('Panier vidé', 'info');
        hapticFeedback('medium');
    }
}

function checkoutWithOMC() {
    if (cart.length === 0) {
        showToast('Panier vide', 'error');
        return;
    }
    
    const discount = cartTotal * (clubStablecoin.discount / 100);
    const finalPrice = cartTotal - discount;
    
    const password = prompt(`💰 Commander avec OM Coin 🪙\n\nTotal : ${cartTotal.toFixed(2)} €\nÉconomie -${clubStablecoin.discount}% : -${discount.toFixed(2)} €\nÀ payer : ${finalPrice.toFixed(2)} € (${finalPrice.toFixed(2)} OMC)\n\nSolde OMC : ${clubStablecoin.balance} OMC\nNouveau solde : ${(clubStablecoin.balance - finalPrice).toFixed(2)} OMC\n\n🔒 Entre ton mot de passe :`);
    
    if (!password) {
        showToast('Commande annulée', 'info');
        return;
    }
    
    if (password !== userPassword) {
        showToast('🔒 Mot de passe incorrect', 'error');
        hapticFeedback('heavy');
        return;
    }
    
    if (clubStablecoin.balance < finalPrice) {
        showToast('Solde OM Coin insuffisant', 'error');
        return;
    }
    
    // Success
    clubStablecoin.balance -= finalPrice;
    showToast(`Commande validée ! ${finalPrice.toFixed(2)} OMC débités ✓`, 'success');
    showConfetti();
    
    cart = [];
    updateCartBadge();
    closeCart();
    
    // Update OMC balance display
    document.getElementById('omcBalance').textContent = `${clubStablecoin.balance.toFixed(2)} OMC`;
    
    hapticFeedback('heavy');
}

// === CARD TOGGLE ===

function initCardToggle() {
    document.getElementById('btnToggleCardBalance')?.addEventListener('click', toggleCardBalance);
    document.getElementById('btnShowCardNumber')?.addEventListener('click', toggleCardNumber);
}

function toggleCardBalance() {
    const balanceEl = document.getElementById('cardBalanceValue');
    const iconEl = document.getElementById('iconCardBalance');
    
    cardBalanceVisible = !cardBalanceVisible;
    
    if (cardBalanceVisible) {
        balanceEl.textContent = `${cardBalance.toFixed(2)} €`;
        balanceEl.classList.remove('hidden');
        iconEl.textContent = '👁️';
    } else {
        balanceEl.classList.add('hidden');
        iconEl.textContent = '🙈';
    }
    
    hapticFeedback('light');
}

function toggleCardNumber() {
    const numberEl = document.getElementById('cardNumber');
    const btn = document.getElementById('btnShowCardNumber');
    
    if (numberEl.textContent.includes('•')) {
        numberEl.textContent = '4532 1234 5678 4567';
        btn.textContent = 'Masquer numéro';
    } else {
        numberEl.textContent = '•••• •••• •••• 4567';
        btn.textContent = 'Afficher numéro';
    }
    
    hapticFeedback('light');
}

// === EVENT LISTENERS ===

function initEventListeners() {
    // Card flip
    document.getElementById('card3DWrapper')?.addEventListener('click', () => {
        document.getElementById('bankCard3D').classList.toggle('flipped');
        hapticFeedback('medium');
    });
    
    // Transfer buttons
    document.getElementById('btnToCard')?.addEventListener('click', () => {
        showToast('Transfert vers carte : 50€', 'success');
        showConfetti();
        hapticFeedback('medium');
    });
    
    document.getElementById('btnFromCard')?.addEventListener('click', () => {
        showToast('Transfert depuis carte : 50€', 'success');
        showConfetti();
        hapticFeedback('medium');
    });
    
    // Block card
    document.getElementById('btnBlockCard')?.addEventListener('click', () => {
        showToast('Carte bloquée avec succès', 'success');
        hapticFeedback('heavy');
    });
}

// === UTILITY FUNCTIONS ===

function hapticFeedback(intensity = 'medium') {
    if ('vibrate' in navigator) {
        const patterns = { light: 10, medium: 20, heavy: 30 };
        navigator.vibrate(patterns[intensity] || 20);
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = { success: '✓', error: '✕', info: 'ℹ️' };
    
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

console.log('PaieCashPlay Fan App v2.2 initialized! 🚀');