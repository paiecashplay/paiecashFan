/**
 * PaieCashFan - Connecteur de Données Clubs
 * Récupère les données en temps réel : résultats, classements, promos
 * 
 * Sources:
 * - API Football-Data.org (résultats, classements)
 * - API interne PaieCashFan (promos, événements)
 * - WooCommerce (produits en promotion)
 */

class ClubDataConnector {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
        
        // Configuration API
        this.apis = {
            footballData: {
                baseURL: 'https://api.football-data.org/v4',
                // ⚠️ Clé API requise: https://www.football-data.org/client/register
                apiKey: null // À configurer
            },
            sofascore: {
                baseURL: 'https://api.sofascore.com/api/v1',
                apiKey: null
            }
        };
        
        // Mapping clubs → IDs API
        this.clubMapping = this.initClubMapping();
    }
    
    /**
     * Initialiser le mapping des clubs
     */
    initClubMapping() {
        return {
            // Ligue 1
            'paris-saint-germain': { footballDataId: 524, sofascoreId: 1644 },
            'olympique-marseille': { footballDataId: 516, sofascoreId: 1641 },
            'olympique-lyonnais': { footballDataId: 523, sofascoreId: 1649 },
            'as-monaco': { footballDataId: 548, sofascoreId: 1643 },
            'lille-osc': { footballDataId: 521, sofascoreId: 1642 },
            'ogc-nice': { footballDataId: 522, sofascoreId: 1640 },
            'rc-lens': { footballDataId: 546, sofascoreId: 1947 },
            'stade-rennais': { footballDataId: 529, sofascoreId: 1645 },
            'toulouse-fc': { footballDataId: 511, sofascoreId: 1648 },
            'stade-de-reims': { footballDataId: 547, sofascoreId: 1646 },
            'montpellier-hsc': { footballDataId: 518, sofascoreId: 1647 },
            'stade-brestois': { footballDataId: 512, sofascoreId: 21072 },
            'fc-nantes': { footballDataId: 543, sofascoreId: 1639 },
            'angers-sco': { footballDataId: 532, sofascoreId: 1950 },
            'havre-ac': { footballDataId: 517, sofascoreId: 1951 },
            'rc-strasbourg': { footballDataId: 576, sofascoreId: 1948 },
            'auxerre': { footballDataId: 1082, sofascoreId: 1949 },
            'paris-fc': { footballDataId: 544, sofascoreId: 2013 }
        };
    }
    
    /**
     * Obtenir les données d'un club
     * @param {String} clubSlug - Slug du club (ex: 'olympique-marseille')
     * @returns {Object} Données complètes du club
     */
    async getClubData(clubSlug) {
        // Vérifier le cache
        const cached = this.getFromCache(`club_${clubSlug}`);
        if (cached) return cached;
        
        const clubIds = this.clubMapping[clubSlug];
        
        if (!clubIds) {
            return this.getMockClubData(clubSlug);
        }
        
        try {
            // Récupérer les données en parallèle
            const [results, nextMatch, standing, promotions] = await Promise.all([
                this.getMatchResults(clubSlug, 5),
                this.getNextMatch(clubSlug),
                this.getStanding(clubSlug),
                this.getPromotions(clubSlug)
            ]);
            
            const data = {
                slug: clubSlug,
                results,
                nextMatch,
                standing,
                promotions,
                updatedAt: Date.now()
            };
            
            // Mettre en cache
            this.setCache(`club_${clubSlug}`, data);
            
            return data;
            
        } catch (error) {
            console.error(`Error fetching data for ${clubSlug}:`, error);
            return this.getMockClubData(clubSlug);
        }
    }
    
    /**
     * Récupérer les derniers résultats
     * @param {String} clubSlug - Slug du club
     * @param {Number} limit - Nombre de matchs
     * @returns {Array} Derniers résultats
     */
    async getMatchResults(clubSlug, limit = 5) {
        const cached = this.getFromCache(`results_${clubSlug}`);
        if (cached) return cached;
        
        const clubIds = this.clubMapping[clubSlug];
        
        if (!clubIds || !this.apis.footballData.apiKey) {
            return this.getMockResults(clubSlug, limit);
        }
        
        try {
            const response = await fetch(
                `${this.apis.footballData.baseURL}/teams/${clubIds.footballDataId}/matches?status=FINISHED&limit=${limit}`,
                {
                    headers: {
                        'X-Auth-Token': this.apis.footballData.apiKey
                    }
                }
            );
            
            if (!response.ok) throw new Error('API Error');
            
            const data = await response.json();
            const results = data.matches.map(match => this.formatMatch(match, clubSlug));
            
            this.setCache(`results_${clubSlug}`, results, 5 * 60 * 1000); // 5 min
            
            return results;
            
        } catch (error) {
            console.error('Error fetching results:', error);
            return this.getMockResults(clubSlug, limit);
        }
    }
    
    /**
     * Récupérer le prochain match
     * @param {String} clubSlug - Slug du club
     * @returns {Object} Prochain match
     */
    async getNextMatch(clubSlug) {
        const cached = this.getFromCache(`nextmatch_${clubSlug}`);
        if (cached) return cached;
        
        const clubIds = this.clubMapping[clubSlug];
        
        if (!clubIds || !this.apis.footballData.apiKey) {
            return this.getMockNextMatch(clubSlug);
        }
        
        try {
            const response = await fetch(
                `${this.apis.footballData.baseURL}/teams/${clubIds.footballDataId}/matches?status=SCHEDULED&limit=1`,
                {
                    headers: {
                        'X-Auth-Token': this.apis.footballData.apiKey
                    }
                }
            );
            
            if (!response.ok) throw new Error('API Error');
            
            const data = await response.json();
            
            if (data.matches.length === 0) {
                return null;
            }
            
            const nextMatch = this.formatMatch(data.matches[0], clubSlug);
            
            this.setCache(`nextmatch_${clubSlug}`, nextMatch, 30 * 60 * 1000); // 30 min
            
            return nextMatch;
            
        } catch (error) {
            console.error('Error fetching next match:', error);
            return this.getMockNextMatch(clubSlug);
        }
    }
    
    /**
     * Récupérer le classement
     * @param {String} clubSlug - Slug du club
     * @returns {Object} Position et points
     */
    async getStanding(clubSlug) {
        const cached = this.getFromCache(`standing_${clubSlug}`);
        if (cached) return cached;
        
        const clubIds = this.clubMapping[clubSlug];
        
        if (!clubIds || !this.apis.footballData.apiKey) {
            return this.getMockStanding(clubSlug);
        }
        
        try {
            // Récupérer le classement de la Ligue 1 (compétition ID: 2015)
            const response = await fetch(
                `${this.apis.footballData.baseURL}/competitions/2015/standings`,
                {
                    headers: {
                        'X-Auth-Token': this.apis.footballData.apiKey
                    }
                }
            );
            
            if (!response.ok) throw new Error('API Error');
            
            const data = await response.json();
            const table = data.standings[0]?.table || [];
            
            const teamStanding = table.find(t => t.team.id === clubIds.footballDataId);
            
            if (!teamStanding) {
                return this.getMockStanding(clubSlug);
            }
            
            const standing = {
                position: teamStanding.position,
                points: teamStanding.points,
                played: teamStanding.playedGames,
                won: teamStanding.won,
                draw: teamStanding.draw,
                lost: teamStanding.lost,
                goalsFor: teamStanding.goalsFor,
                goalsAgainst: teamStanding.goalsAgainst,
                goalDifference: teamStanding.goalDifference
            };
            
            this.setCache(`standing_${clubSlug}`, standing, 60 * 60 * 1000); // 1h
            
            return standing;
            
        } catch (error) {
            console.error('Error fetching standing:', error);
            return this.getMockStanding(clubSlug);
        }
    }
    
    /**
     * Récupérer les promotions de la boutique
     * @param {String} clubSlug - Slug du club
     * @returns {Array} Produits en promotion
     */
    async getPromotions(clubSlug) {
        const cached = this.getFromCache(`promos_${clubSlug}`);
        if (cached) return cached;
        
        try {
            // Si WooCommerce est disponible
            if (window.agenticCommerce?.woocommerce) {
                const promos = await window.agenticCommerce.getPromotions();
                this.setCache(`promos_${clubSlug}`, promos, 15 * 60 * 1000); // 15 min
                return promos;
            }
        } catch (error) {
            console.error('Error fetching promotions:', error);
        }
        
        return this.getMockPromotions(clubSlug);
    }
    
    /**
     * Formater un match
     */
    formatMatch(match, clubSlug) {
        const isHome = match.homeTeam.id === this.clubMapping[clubSlug]?.footballDataId;
        
        return {
            id: match.id,
            date: new Date(match.utcDate),
            dateFormatted: this.formatDate(match.utcDate),
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            homeScore: match.score.fullTime.home,
            awayScore: match.score.fullTime.away,
            competition: match.competition.name,
            status: match.status,
            isHome,
            result: this.getMatchResult(match, isHome)
        };
    }
    
    /**
     * Obtenir le résultat d'un match (V/N/D)
     */
    getMatchResult(match, isHome) {
        if (match.status !== 'FINISHED') return null;
        
        const homeScore = match.score.fullTime.home;
        const awayScore = match.score.fullTime.away;
        
        if (homeScore === awayScore) return 'N';
        
        if (isHome) {
            return homeScore > awayScore ? 'V' : 'D';
        } else {
            return awayScore > homeScore ? 'V' : 'D';
        }
    }
    
    /**
     * Formater une date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    /**
     * Gestion du cache
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > (cached.timeout || this.cacheTimeout)) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }
    
    setCache(key, data, timeout = null) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            timeout: timeout || this.cacheTimeout
        });
    }
    
    clearCache() {
        this.cache.clear();
    }
    
    /**
     * Données fictives (mode démo sans API)
     */
    getMockClubData(clubSlug) {
        return {
            slug: clubSlug,
            results: this.getMockResults(clubSlug, 5),
            nextMatch: this.getMockNextMatch(clubSlug),
            standing: this.getMockStanding(clubSlug),
            promotions: this.getMockPromotions(clubSlug),
            updatedAt: Date.now()
        };
    }
    
    getMockResults(clubSlug, limit) {
        const clubName = this.getClubName(clubSlug);
        const results = [];
        
        for (let i = 0; i < limit; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (i * 7)); // Chaque semaine
            
            const isHome = Math.random() > 0.5;
            const homeScore = Math.floor(Math.random() * 4);
            const awayScore = Math.floor(Math.random() * 4);
            
            results.push({
                date,
                dateFormatted: this.formatDate(date.toISOString()),
                homeTeam: isHome ? clubName : `Adversaire ${i + 1}`,
                awayTeam: isHome ? `Adversaire ${i + 1}` : clubName,
                homeScore,
                awayScore,
                competition: 'Ligue 1',
                status: 'FINISHED',
                isHome,
                result: this.getMatchResult({
                    status: 'FINISHED',
                    score: { fullTime: { home: homeScore, away: awayScore } }
                }, isHome)
            });
        }
        
        return results;
    }
    
    getMockNextMatch(clubSlug) {
        const clubName = this.getClubName(clubSlug);
        const date = new Date();
        date.setDate(date.getDate() + 7); // Dans 1 semaine
        
        return {
            date,
            dateFormatted: this.formatDate(date.toISOString()),
            homeTeam: Math.random() > 0.5 ? clubName : 'Prochain Adversaire',
            awayTeam: Math.random() > 0.5 ? 'Prochain Adversaire' : clubName,
            competition: 'Ligue 1',
            status: 'SCHEDULED',
            isHome: Math.random() > 0.5
        };
    }
    
    getMockStanding(clubSlug) {
        return {
            position: Math.floor(Math.random() * 18) + 1,
            points: Math.floor(Math.random() * 50) + 20,
            played: Math.floor(Math.random() * 20) + 10,
            won: Math.floor(Math.random() * 15) + 5,
            draw: Math.floor(Math.random() * 10),
            lost: Math.floor(Math.random() * 10),
            goalsFor: Math.floor(Math.random() * 40) + 20,
            goalsAgainst: Math.floor(Math.random() * 40) + 10,
            goalDifference: Math.floor(Math.random() * 20) - 10
        };
    }
    
    getMockPromotions(clubSlug) {
        const clubName = this.getClubName(clubSlug);
        
        return [
            {
                id: 1,
                name: `Maillot Domicile ${clubName}`,
                price: '89.99',
                sale_price: '71.99',
                discount: '-20%',
                on_sale: true
            },
            {
                id: 2,
                name: `Écharpe Officielle ${clubName}`,
                price: '19.99',
                sale_price: '13.99',
                discount: '-30%',
                on_sale: true
            }
        ];
    }
    
    getClubName(clubSlug) {
        const names = {
            'olympique-marseille': 'Olympique de Marseille',
            'paris-saint-germain': 'Paris Saint-Germain',
            'olympique-lyonnais': 'Olympique Lyonnais',
            'paris-fc': 'Paris FC'
        };
        return names[clubSlug] || 'Club';
    }
}

// Export global
window.ClubDataConnector = ClubDataConnector;

// Instanciation automatique
if (!window.clubDataConnector) {
    window.clubDataConnector = new ClubDataConnector();
}
