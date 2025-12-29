// 🔥 STORIES MANAGER - TEMPS RÉEL + SPONSORS + CALL-TO-ACTION
// Système de stories qui défilent comme TikTok/Instagram avec sponsors intégrés

class StoriesManager {
    constructor() {
        this.currentIndex = 0;
        this.allStories = [];
        this.autoPlayInterval = null;
        this.isPlaying = false;
    }
    
    // Données des stories (amis, club, plateforme)
    getStoriesData() {
        return {
            // Stories Amis
            friends: [
                {
                    id: 'friend1',
                    name: 'Marc Dubois',
                    avatar: 'https://i.pravatar.cc/150?img=12',
                    type: 'fan',
                    story: {
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
                        caption: '⚽ Au stade aujourd\'hui ! Allez les bleus ! 🔥',
                        timestamp: Date.now() - 300000, // Il y a 5 min
                        likes: 124,
                        comments: 15
                    }
                },
                {
                    id: 'friend2',
                    name: 'Sophie Martin',
                    avatar: 'https://i.pravatar.cc/150?img=5',
                    type: 'fan',
                    story: {
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400',
                        caption: '🎉 Soirée entre fans ! #TeamOM',
                        timestamp: Date.now() - 600000, // Il y a 10 min
                        likes: 89,
                        comments: 8
                    }
                },
                {
                    id: 'friend3',
                    name: 'Thomas Leroy',
                    avatar: 'https://i.pravatar.cc/150?img=33',
                    type: 'fan',
                    story: {
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=400',
                        caption: '📸 Nouvelle collection du club !',
                        timestamp: Date.now() - 900000, // Il y a 15 min
                        likes: 156,
                        comments: 23
                    }
                }
            ],
            
            // Stories Club (sponsors)
            club: {
                name: 'AS Monaco',
                logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c8/AS_Monaco_FC_logo.svg/200px-AS_Monaco_FC_logo.svg.png',
                stories: [
                    {
                        id: 'club-sponsor1',
                        type: 'sponsor',
                        sponsor: 'Nike',
                        sponsorLogo: '✓',
                        title: '🔥 Nouveau Maillot 2025',
                        description: 'Edition limitée - 20% de réduction jusqu\'à dimanche',
                        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
                        cta: {
                            text: 'Acheter maintenant',
                            action: 'buyProduct',
                            productId: 'nike-kit-2025',
                            price: 89.99,
                            originalPrice: 112.49
                        }
                    },
                    {
                        id: 'club-sponsor2',
                        type: 'sponsor',
                        sponsor: 'Adidas',
                        sponsorLogo: '⚡',
                        title: '⚽ Ballons Officiels',
                        description: 'Préparez-vous pour la saison avec nos ballons pro',
                        image: 'https://images.unsplash.com/photo-1511404393463-28558226402f?w=400',
                        cta: {
                            text: 'Découvrir',
                            action: 'buyProduct',
                            productId: 'adidas-ball-2025',
                            price: 39.99,
                            originalPrice: 49.99
                        }
                    }
                ]
            },
            
            // Stories PaieCashFan (sponsors plateforme)
            platform: {
                name: 'PaieCashFan',
                logo: '💎',
                stories: [
                    {
                        id: 'platform1',
                        type: 'platform-sponsor',
                        sponsor: 'Puma',
                        sponsorLogo: '🐆',
                        title: '⚡ Promo Flash - 48h',
                        description: 'Chaussures de foot à -50% sur toute la collection',
                        image: 'https://images.unsplash.com/photo-1608667287745-4876e75c6c4b?w=400',
                        cta: {
                            text: 'J\'en profite',
                            action: 'viewOffer',
                            url: '/shop/puma-flash',
                            price: 59.99,
                            originalPrice: 119.99
                        }
                    },
                    {
                        id: 'platform2',
                        type: 'platform-sponsor',
                        sponsor: 'Decathlon',
                        sponsorLogo: '🏃',
                        title: '🎁 Équipement Complet',
                        description: 'Tenue de sport complète -30%',
                        image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400',
                        cta: {
                            text: 'Voir l\'offre',
                            action: 'viewOffer',
                            url: '/shop/decathlon-pack',
                            price: 79.99,
                            originalPrice: 114.99
                        }
                    }
                ]
            }
        };
    }
    
    // Charger toutes les stories
    loadAllStories() {
        const data = this.getStoriesData();
        
        // Mélanger les stories : amis + sponsors
        this.allStories = [
            ...data.friends.map(f => ({ ...f.story, author: f.name, avatar: f.avatar, userType: 'fan' })),
            ...data.club.stories.map(s => ({ ...s, author: data.club.name, avatar: data.club.logo, userType: 'club' })),
            ...data.platform.stories.map(s => ({ ...s, author: data.platform.name, avatar: data.platform.logo, userType: 'platform' }))
        ];
        
        console.log(`✅ ${this.allStories.length} stories chargées`);
    }
    
    // Démarrer le défilement automatique
    startAutoPlay() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.displayCurrentStory();
        
        this.autoPlayInterval = setInterval(() => {
            this.nextStory();
        }, 5000); // 5 secondes par story
        
        console.log('▶️ Auto-play démarré');
    }
    
    // Arrêter le défilement
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        this.isPlaying = false;
        console.log('⏸️ Auto-play arrêté');
    }
    
    // Story suivante
    nextStory() {
        this.currentIndex = (this.currentIndex + 1) % this.allStories.length;
        this.displayCurrentStory();
    }
    
    // Story précédente
    previousStory() {
        this.currentIndex = (this.currentIndex - 1 + this.allStories.length) % this.allStories.length;
        this.displayCurrentStory();
    }
    
    // Afficher la story courante
    displayCurrentStory() {
        const story = this.allStories[this.currentIndex];
        
        if (story.type === 'sponsor' || story.type === 'platform-sponsor') {
            this.displaySponsorStory(story);
        } else {
            this.displayUserStory(story);
        }
    }
    
    // Afficher story sponsor avec CTA
    displaySponsorStory(story) {
        const discount = Math.round(((story.cta.originalPrice - story.cta.price) / story.cta.originalPrice) * 100);
        
        const html = `
            <div class="story-container sponsor-story">
                <!-- Header -->
                <div class="story-header">
                    <div class="story-author">
                        <div class="author-avatar">${story.avatar}</div>
                        <div class="author-info">
                            <div class="author-name">${story.author}</div>
                            <div class="author-time">Sponsorisé • ${story.sponsor}</div>
                        </div>
                    </div>
                    <div class="story-close" onclick="storiesManager.stopAutoPlay()">✕</div>
                </div>
                
                <!-- Image principale -->
                <div class="story-image" style="background-image: url('${story.image}')"></div>
                
                <!-- Badge sponsor -->
                <div class="sponsor-badge">${story.sponsorLogo} ${story.sponsor}</div>
                
                <!-- Contenu overlay -->
                <div class="story-overlay">
                    <h3 class="story-title">${story.title}</h3>
                    <p class="story-description">${story.description}</p>
                    
                    <!-- Prix -->
                    <div class="story-price">
                        <span class="price-current">${story.cta.price}€</span>
                        <span class="price-original">${story.cta.originalPrice}€</span>
                        <span class="price-discount">-${discount}%</span>
                    </div>
                    
                    <!-- CTA Button -->
                    <button class="cta-button" onclick="storiesManager.handleCTA('${story.id}')">
                        ${story.cta.text} 🛒
                    </button>
                </div>
                
                <!-- Navigation -->
                <div class="story-nav">
                    <div class="story-nav-btn prev" onclick="storiesManager.previousStory()">‹</div>
                    <div class="story-nav-btn next" onclick="storiesManager.nextStory()">›</div>
                </div>
            </div>
        `;
        
        document.getElementById('storiesDisplay').innerHTML = html;
    }
    
    // Afficher story utilisateur normale
    displayUserStory(story) {
        const timeAgo = this.getTimeAgo(story.timestamp);
        
        const html = `
            <div class="story-container user-story">
                <!-- Header -->
                <div class="story-header">
                    <div class="story-author">
                        <img src="${story.avatar}" alt="${story.author}" class="author-avatar">
                        <div class="author-info">
                            <div class="author-name">${story.author}</div>
                            <div class="author-time">${timeAgo}</div>
                        </div>
                    </div>
                    <div class="story-close" onclick="storiesManager.stopAutoPlay()">✕</div>
                </div>
                
                <!-- Image principale -->
                <div class="story-image" style="background-image: url('${story.url}')"></div>
                
                <!-- Caption -->
                <div class="story-caption">
                    <p>${story.caption}</p>
                    <div class="story-stats">
                        <span>❤️ ${story.likes}</span>
                        <span>💬 ${story.comments}</span>
                    </div>
                </div>
                
                <!-- Navigation -->
                <div class="story-nav">
                    <div class="story-nav-btn prev" onclick="storiesManager.previousStory()">‹</div>
                    <div class="story-nav-btn next" onclick="storiesManager.nextStory()">›</div>
                </div>
            </div>
        `;
        
        document.getElementById('storiesDisplay').innerHTML = html;
    }
    
    // Gérer le clic sur CTA
    handleCTA(storyId) {
        const story = this.allStories.find(s => s.id === storyId);
        if (!story) return;
        
        this.stopAutoPlay();
        
        if (story.cta.action === 'buyProduct') {
            this.openQuickBuyModal(story);
        } else if (story.cta.action === 'viewOffer') {
            window.location.href = story.cta.url;
        }
    }
    
    // Modal d'achat rapide (2 clics)
    openQuickBuyModal(story) {
        const modal = document.createElement('div');
        modal.className = 'quick-buy-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-close" onclick="this.parentElement.parentElement.remove()">✕</div>
                
                <img src="${story.image}" alt="${story.title}" class="modal-image">
                
                <h3 class="modal-title">${story.title}</h3>
                <p class="modal-description">${story.description}</p>
                
                <div class="modal-price">
                    <span class="price-current">${story.cta.price}€</span>
                    <span class="price-original">${story.cta.originalPrice}€</span>
                </div>
                
                <!-- CLIC 1: Ajouter au panier -->
                <button class="modal-btn primary" onclick="storiesManager.addToCart('${story.id}'); this.parentElement.parentElement.remove();">
                    🛒 Ajouter au panier
                </button>
                
                <!-- Acheter directement -->
                <button class="modal-btn secondary" onclick="storiesManager.openPaymentChoice('${story.id}')">
                    💳 Payer
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Ajouter au panier
    addToCart(storyId) {
        alert('✅ Produit ajouté au panier !');
        console.log(`🛒 Ajout au panier: ${storyId}`);
    }
    
    // Ouvrir choix de paiement
    openPaymentChoice(storyId) {
        // Fermer le modal de produit
        const productModal = document.getElementById('productModal');
        if (productModal) productModal.remove();
        
        // Créer le modal de choix de paiement
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'paymentModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <button class="modal-close" onclick="document.getElementById('paymentModal').remove()">×</button>
                <h3 style="margin-bottom: 20px; text-align: center;">💳 Choisir le mode de paiement</h3>
                
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <button class="modal-btn primary" onclick="storiesManager.finalizePayment('${storyId}', 'card')" style="padding: 20px; font-size: 1.1rem;">
                        💳 Carte Bancaire
                    </button>
                    <button class="modal-btn primary" onclick="storiesManager.finalizePayment('${storyId}', 'crypto')" style="padding: 20px; font-size: 1.1rem;">
                        🪙 Crypto (USDC)
                    </button>
                    <button class="modal-btn primary" onclick="storiesManager.finalizePayment('${storyId}', 'wallet')" style="padding: 20px; font-size: 1.1rem;">
                        💰 Wallet PaieCash
                    </button>
                    <button class="modal-btn secondary" onclick="document.getElementById('paymentModal').remove()" style="padding: 15px;">
                        ❌ Annuler
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Finaliser le paiement
    finalizePayment(storyId, method) {
        const methodNames = {
            'card': 'Carte Bancaire',
            'crypto': 'Crypto (USDC)',
            'wallet': 'Wallet PaieCash'
        };
        
        // Fermer le modal
        const modal = document.getElementById('paymentModal');
        if (modal) modal.remove();
        
        // Afficher confirmation
        alert(`✅ Paiement confirmé !\n\nMode: ${methodNames[method]}\nProduit: ${storyId}\n\nMerci de votre achat ! 🎉`);
        console.log(`💳 Paiement finalisé: ${storyId} via ${method}`);
        
        // Ici : appeler API de paiement réelle
    }
    
    // Calculer "il y a X minutes"
    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'À l\'instant';
        if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
        return `Il y a ${Math.floor(seconds / 86400)}j`;
    }
}

// Créer une instance globale
window.storiesManager = new StoriesManager();

console.log('✅ StoriesManager chargé');
