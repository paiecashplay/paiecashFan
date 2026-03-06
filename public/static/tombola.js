// ==========================================
// TOMBOLA API - Système de Loterie Quotidienne
// ==========================================

const TombolaAPI = {
    baseURL: '/api/tombola',
    
    // Récupérer les statistiques globales
    async getStats() {
        try {
            const response = await fetch(`${this.baseURL}/stats`);
            return await response.json();
        } catch (error) {
            console.error('Erreur stats tombola:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Récupérer le catalogue de lots
    async getLots(category = null) {
        try {
            const url = category 
                ? `${this.baseURL}/lots/category/${category}`
                : `${this.baseURL}/lots`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Erreur récupération lots:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Récupérer les campagnes actives
    async getCampaigns(organizationId = null) {
        try {
            const url = organizationId
                ? `${this.baseURL}/campaigns?organization=${organizationId}`
                : `${this.baseURL}/campaigns`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Erreur récupération campagnes:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Récupérer les détails d'une campagne
    async getCampaign(campaignId) {
        try {
            const response = await fetch(`${this.baseURL}/campaigns/${campaignId}`);
            return await response.json();
        } catch (error) {
            console.error('Erreur détails campagne:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Participer à une campagne
    async participate(campaignId, userId, entriesCount = 1) {
        try {
            const response = await fetch(`${this.baseURL}/participate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaign_id: campaignId,
                    user_id: userId,
                    entries_count: entriesCount,
                    payment_method: 'credit_card'
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Erreur participation:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Récupérer mes participations
    async getMyParticipations(userId) {
        try {
            const response = await fetch(`${this.baseURL}/my-participations?user_id=${userId}`);
            return await response.json();
        } catch (error) {
            console.error('Erreur mes participations:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Récupérer les organisations (clubs)
    async getOrganizations(country = null) {
        try {
            const url = country
                ? `${this.baseURL}/organizations?country=${country}`
                : `${this.baseURL}/organizations`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Erreur organisations:', error);
            return { success: false, error: error.message };
        }
    }
};

// ==========================================
// TOMBOLA UI - Interface Utilisateur
// ==========================================

const TombolaUI = {
    currentUserId: 'user_demo_' + Math.random().toString(36).substr(2, 9),
    selectedCategory: null,
    
    // Initialiser l'interface
    async init() {
        console.log('🎰 Initialisation Tombola...');
        await this.loadStats();
        await this.loadLots();
        await this.loadCampaigns();
        this.setupEventListeners();
    },
    
    // Charger les statistiques
    async loadStats() {
        const result = await TombolaAPI.getStats();
        if (result.success) {
            const stats = result.stats;
            document.getElementById('tombola-active-campaigns').textContent = stats.active_campaigns || 0;
            document.getElementById('tombola-total-lots').textContent = stats.total_lots || 0;
            document.getElementById('tombola-total-clubs').textContent = stats.active_organizations || 0;
        }
    },
    
    // Charger le catalogue de lots
    async loadLots(category = null) {
        const result = await TombolaAPI.getLots(category);
        if (result.success && result.lots) {
            this.renderLots(result.lots);
        }
    },
    
    // Afficher les lots
    renderLots(lots) {
        const container = document.getElementById('tombola-lots-grid');
        if (!container) return;
        
        // Grouper par catégorie
        const categories = {
            'superbonus': { name: '🏆 Super Bonus', lots: [] },
            'cash': { name: '💰 Cash', lots: [] },
            'experience': { name: '✨ Expériences VIP', lots: [] },
            'automobile': { name: '🚗 Automobile', lots: [] },
            'voyage': { name: '✈️ Voyages', lots: [] },
            'billetterie': { name: '🎫 Billets', lots: [] },
            'hospitalite': { name: '👑 Hospitalité', lots: [] },
            'merchandise': { name: '👕 Merchandising', lots: [] },
            'boutique': { name: '🛍️ Boutique', lots: [] },
            'digital': { name: '💎 Digital', lots: [] }
        };
        
        lots.forEach(lot => {
            if (categories[lot.category]) {
                categories[lot.category].lots.push(lot);
            }
        });
        
        let html = '';
        
        Object.keys(categories).forEach(catKey => {
            const cat = categories[catKey];
            if (cat.lots.length === 0) return;
            
            html += `
                <div class="tombola-category-section">
                    <h3 class="tombola-category-title">${cat.name}</h3>
                    <div class="tombola-lots-row">
            `;
            
            cat.lots.slice(0, 4).forEach(lot => {
                const badge = lot.frequency === 'daily' ? '📅 Quotidien' 
                           : lot.frequency === '4x_weekly' ? '🗓️ 4x/sem' 
                           : lot.frequency === 'weekly' ? '📆 Hebdo' 
                           : '📅 Mensuel';
                
                html += `
                    <div class="tombola-lot-card" onclick="TombolaUI.showLotDetails('${lot.id}')">
                        <div class="tombola-lot-badge">${badge}</div>
                        <div class="tombola-lot-image">
                            <div class="tombola-lot-placeholder">${this.getCategoryIcon(lot.category)}</div>
                        </div>
                        <div class="tombola-lot-content">
                            <h4 class="tombola-lot-name">${lot.name}</h4>
                            <p class="tombola-lot-description">${lot.description || ''}</p>
                            <div class="tombola-lot-value">
                                <span class="tombola-lot-price">Valeur : ${lot.perceived_value}€</span>
                                <span class="tombola-lot-min">Min. ${lot.min_participants} participants</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    // Icône par catégorie
    getCategoryIcon(category) {
        const icons = {
            'superbonus': '🏆',
            'cash': '💰',
            'experience': '✨',
            'automobile': '🚗',
            'voyage': '✈️',
            'billetterie': '🎫',
            'hospitalite': '👑',
            'merchandise': '👕',
            'boutique': '🛍️',
            'digital': '💎'
        };
        return icons[category] || '🎁';
    },
    
    // Charger les campagnes actives
    async loadCampaigns() {
        const result = await TombolaAPI.getCampaigns();
        if (result.success && result.campaigns) {
            this.renderCampaigns(result.campaigns);
        }
    },
    
    // Afficher les campagnes
    renderCampaigns(campaigns) {
        const container = document.getElementById('tombola-campaigns-list');
        if (!container) return;
        
        if (campaigns.length === 0) {
            container.innerHTML = `
                <div class="tombola-empty-state">
                    <i class="fas fa-calendar-xmark" style="font-size: 48px; opacity: 0.3;"></i>
                    <p>Aucune tombola active pour le moment</p>
                    <p style="font-size: 14px; opacity: 0.7;">Revenez bientôt pour participer !</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        campaigns.forEach(campaign => {
            const progress = (campaign.current_participants / campaign.target_participants) * 100;
            const drawDate = new Date(campaign.draw_datetime);
            const isToday = drawDate.toDateString() === new Date().toDateString();
            
            html += `
                <div class="tombola-campaign-card ${isToday ? 'tombola-campaign-today' : ''}">
                    <div class="tombola-campaign-header">
                        <div>
                            <h4 class="tombola-campaign-name">${campaign.prize_name}</h4>
                            <p class="tombola-campaign-org">${campaign.organization_short_name || campaign.organization_name}</p>
                        </div>
                        <div class="tombola-campaign-value">
                            <span class="tombola-campaign-prize">${campaign.prize_value}€</span>
                        </div>
                    </div>
                    
                    <div class="tombola-campaign-progress">
                        <div class="tombola-progress-bar">
                            <div class="tombola-progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <p class="tombola-progress-text">${campaign.current_participants} / ${campaign.target_participants} participants</p>
                    </div>
                    
                    <div class="tombola-campaign-footer">
                        <div class="tombola-campaign-info">
                            <span class="tombola-campaign-entry">Participation : ${campaign.entry_fee}€</span>
                            <span class="tombola-campaign-date">
                                <i class="far fa-calendar"></i> 
                                ${isToday ? 'Tirage AUJOURD\'HUI' : drawDate.toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                        <button class="btn-tombola-participate" onclick="TombolaUI.participateToCampaign('${campaign.id}')">
                            <i class="fas fa-ticket"></i> Participer
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    // Participer à une campagne
    async participateToCampaign(campaignId) {
        // Afficher modal de confirmation
        if (confirm('Confirmer votre participation à cette tombola ?')) {
            const result = await TombolaAPI.participate(campaignId, this.currentUserId, 1);
            
            if (result.success) {
                alert(`✅ Participation enregistrée !\n\nNuméros de ticket : ${result.ticket_numbers.join(', ')}\n\nMontant à payer : ${result.amount_to_pay}€`);
                // Recharger les campagnes
                await this.loadCampaigns();
            } else {
                alert('❌ Erreur : ' + (result.error || result.message));
            }
        }
    },
    
    // Afficher détails d'un lot
    async showLotDetails(lotId) {
        console.log('Affichage détails lot:', lotId);
        // TODO: Implémenter modal de détails
        alert('Détails du lot : ' + lotId);
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Filtres catégories
        document.querySelectorAll('[data-category-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.categoryFilter;
                this.filterByCategory(category);
            });
        });
        
        // Bouton "Mes participations"
        const myParticipationsBtn = document.getElementById('tombola-my-participations-btn');
        if (myParticipationsBtn) {
            myParticipationsBtn.addEventListener('click', () => this.showMyParticipations());
        }
    },
    
    // Filtrer par catégorie
    async filterByCategory(category) {
        this.selectedCategory = category === 'all' ? null : category;
        await this.loadLots(this.selectedCategory);
    },
    
    // Afficher mes participations
    async showMyParticipations() {
        const result = await TombolaAPI.getMyParticipations(this.currentUserId);
        if (result.success) {
            console.log('Mes participations:', result.participations);
            alert(`Vous avez ${result.count} participation(s)`);
            // TODO: Afficher dans un modal
        }
    },
    
    // Changer d'onglet
    switchTab(tab) {
        // Mettre à jour les boutons
        document.querySelectorAll('.tombola-tab').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Afficher/masquer les conteneurs
        document.getElementById('tombola-campaigns-container').style.display = tab === 'campaigns' ? 'block' : 'none';
        document.getElementById('tombola-lots-container').style.display = tab === 'lots' ? 'block' : 'none';
        document.getElementById('tombola-my-participations-container').style.display = tab === 'my-participations' ? 'block' : 'none';
        
        // Charger les données si nécessaire
        if (tab === 'lots' && !this.lotsLoaded) {
            this.loadLots();
            this.lotsLoaded = true;
        } else if (tab === 'my-participations') {
            this.loadMyParticipations();
        }
    },
    
    // Charger mes participations
    async loadMyParticipations() {
        const result = await TombolaAPI.getMyParticipations(this.currentUserId);
        const container = document.getElementById('tombola-my-participations-list');
        
        if (result.success && result.participations && result.participations.length > 0) {
            let html = '<div style="display: grid; gap: 20px;">';
            result.participations.forEach(part => {
                const drawDate = new Date(part.draw_datetime);
                html += `
                    <div class="tombola-participation-card" style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
                        <h4>${part.campaign_name}</h4>
                        <p>${part.organization_name}</p>
                        <p>Prix: ${part.prize_name}</p>
                        <p>Tirage: ${drawDate.toLocaleDateString('fr-FR')}</p>
                        <p>Numéros: ${JSON.parse(part.ticket_numbers || '[]').join(', ')}</p>
                        <p>Statut: ${part.is_winner ? '🏆 GAGNANT !' : '⏳ En attente'}</p>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px; opacity: 0.7;">
                    <i class="fas fa-info-circle" style="font-size: 48px;"></i>
                    <p style="margin-top: 15px; font-size: 18px;">Vous n'avez pas encore de participations</p>
                    <p style="margin-top: 10px; opacity: 0.8;">Participez aux tirages pour apparaître ici !</p>
                </div>
            `;
        }
    },
    
    // Afficher le règlement
    showRules() {
        alert(`📜 RÈGLEMENT DE LA TOMBOLA

1. PRINCIPE
   - Tirages quotidiens de lots exceptionnels
   - Conformité juridique selon votre pays
   - Transparence totale des tirages

2. PARTICIPATION
   - Frais de participation selon le lot
   - Minimum de participants requis
   - Achat de plusieurs tickets possible

3. TIRAGE
   - Tirage aléatoire certifié
   - Livestream du tirage en direct
   - Résultats publiés immédiatement

4. LOTS
   - Merchandising officiel
   - Billets VIP
   - Expériences exclusives
   - Cash & Super Bonus

5. CONFORMITÉ
   - France: Concours gratuit (envoi postal)
   - Autres pays: Vérifier règles locales
   - KYC obligatoire > seuil pays

Plus d'infos: paiecashfan.paiecashplay.com/reglement`);
    },
    
    // Afficher les derniers gagnants
    showWinners() {
        alert(`🏆 DERNIERS GAGNANTS

🥇 Jean M. - Maillot Signé - Hier
🥈 Marie L. - 500€ Cash - Il y a 2 jours
🥉 Ahmed B. - Billets VIP - Il y a 3 jours

Plus de 1,000 gagnants ce mois !

Consultez la liste complète sur:
paiecashfan.paiecashplay.com/gagnants`);
    }
};

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Attendre 500ms pour s'assurer que la page est chargée
    setTimeout(() => {
        if (document.getElementById('tombola-section')) {
            TombolaUI.init();
        }
    }, 500);
});
