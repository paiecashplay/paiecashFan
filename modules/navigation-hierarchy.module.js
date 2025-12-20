/**
 * ============================================
 * MODULE NAVIGATION HIÉRARCHIQUE V11.0
 * ============================================
 * Classification intelligente : Pays → Sport → Ligue → Équipe M/F
 * 
 * RÉSOUT LE PROBLÈME:
 * - Plus de scroll infini
 * - Navigation claire et intuitive
 * - Filtrage intelligent par niveau
 * 
 * @version 1.0.0
 * @requires core-system.js
 */

(function(global) {
    'use strict';

    const { BaseModule } = global.PaieCashFan;

    class NavigationHierarchyModule extends BaseModule {
        constructor(core, options = {}) {
            super(core, options);
            this.version = '1.0.0';
            this.name = 'NavigationHierarchy';
            this.dependencies = [];

            // Configuration
            this.config = {
                defaultView: 'countries', // 'countries', 'sports', 'competitions'
                animationDuration: 300,
                ...options
            };

            // État de la navigation
            this.currentView = null;
            this.breadcrumbs = [];
            this.allTeams = [];
            this.hierarchy = {
                countries: new Map(),
                sports: new Map(),
                competitions: new Map(),
                teams: new Map()
            };
        }

        /**
         * Initialisation
         */
        async init() {
            this.log('Initialisation...', 'module');

            // Charger les données d'équipes
            await this.loadTeamsData();

            // Construire la hiérarchie
            this.buildHierarchy();

            // Afficher la vue par défaut
            this.showView(this.config.defaultView);

            this.initialized = true;
            this.log('✅ Module initialisé', 'success');
            this.emit('ready');
        }

        /**
         * Charger les données des équipes depuis le global scope
         */
        async loadTeamsData() {
            this.log('Chargement des données d\'équipes...', 'info');

            // Récupérer depuis window (chargé par les scripts précédents)
            const teams = window.teamsData || [];
            
            if (teams.length === 0) {
                this.log('⚠️ Aucune équipe trouvée dans window.teamsData', 'warning');
            }

            this.allTeams = teams;
            this.log(`✅ ${teams.length} équipes chargées`, 'success');
        }

        /**
         * Construire la hiérarchie complète
         */
        buildHierarchy() {
            this.log('Construction de la hiérarchie...', 'info');

            this.allTeams.forEach(team => {
                // Par pays
                if (team.country) {
                    if (!this.hierarchy.countries.has(team.country)) {
                        this.hierarchy.countries.set(team.country, {
                            name: team.country,
                            flag: this.getCountryFlag(team.country),
                            sports: new Map(),
                            teams: []
                        });
                    }
                    const country = this.hierarchy.countries.get(team.country);
                    
                    // Par sport dans ce pays
                    if (!country.sports.has(team.sport)) {
                        country.sports.set(team.sport, {
                            name: team.sport,
                            icon: this.getSportIcon(team.sport),
                            leagues: new Map(),
                            teams: []
                        });
                    }
                    const sport = country.sports.get(team.sport);
                    
                    // Par ligue dans ce sport
                    if (team.league) {
                        if (!sport.leagues.has(team.league)) {
                            sport.leagues.set(team.league, {
                                name: team.league,
                                teams: []
                            });
                        }
                        sport.leagues.get(team.league).teams.push(team);
                    }
                    
                    sport.teams.push(team);
                    country.teams.push(team);
                }

                // Par sport global
                if (!this.hierarchy.sports.has(team.sport)) {
                    this.hierarchy.sports.set(team.sport, {
                        name: team.sport,
                        icon: this.getSportIcon(team.sport),
                        teams: []
                    });
                }
                this.hierarchy.sports.get(team.sport).teams.push(team);

                // Par compétition
                if (team.league && (team.league.includes('Coupe') || team.league.includes('CAN') || team.league.includes('JOJ'))) {
                    if (!this.hierarchy.competitions.has(team.league)) {
                        this.hierarchy.competitions.set(team.league, {
                            name: team.league,
                            icon: '🏆',
                            teams: []
                        });
                    }
                    this.hierarchy.competitions.get(team.league).teams.push(team);
                }
            });

            this.log(`✅ Hiérarchie construite: ${this.hierarchy.countries.size} pays, ${this.hierarchy.sports.size} sports`, 'success');
        }

        /**
         * Afficher une vue
         */
        showView(viewType, data = null) {
            this.currentView = viewType;
            
            switch (viewType) {
                case 'countries':
                    this.renderCountriesView();
                    break;
                case 'country':
                    this.renderCountryView(data);
                    break;
                case 'sport':
                    this.renderSportView(data);
                    break;
                case 'league':
                    this.renderLeagueView(data);
                    break;
                case 'sports':
                    this.renderSportsView();
                    break;
                case 'competitions':
                    this.renderCompetitionsView();
                    break;
                default:
                    this.renderCountriesView();
            }

            this.emit('view:changed', { viewType, data });
        }

        /**
         * RENDU: Vue des pays
         */
        renderCountriesView() {
            this.breadcrumbs = [{ label: 'Accueil', view: 'countries' }];
            
            const html = `
                <div class="hierarchy-view">
                    <div class="hierarchy-header">
                        <h2>🌍 Choisissez un pays</h2>
                        <p>${this.hierarchy.countries.size} pays disponibles</p>
                    </div>
                    
                    <div class="hierarchy-tabs">
                        <button class="tab active" onclick="PaieCashFan.modules.navigation.showView('countries')">
                            🌍 Par Pays
                        </button>
                        <button class="tab" onclick="PaieCashFan.modules.navigation.showView('sports')">
                            ⚽ Par Sport
                        </button>
                        <button class="tab" onclick="PaieCashFan.modules.navigation.showView('competitions')">
                            🏆 Compétitions
                        </button>
                    </div>

                    <div class="hierarchy-grid">
                        ${this.renderCountriesGrid()}
                    </div>
                </div>
            `;

            this.updateContainer(html);
        }

        renderCountriesGrid() {
            let html = '';
            
            // Grouper les pays par popularité
            const popularCountries = ['france', 'international'];
            const otherCountries = Array.from(this.hierarchy.countries.keys())
                .filter(c => !popularCountries.includes(c))
                .sort();

            const allCountries = [...popularCountries, ...otherCountries];

            allCountries.forEach(countryKey => {
                if (!this.hierarchy.countries.has(countryKey)) return;
                
                const country = this.hierarchy.countries.get(countryKey);
                const teamCount = country.teams.length;
                const sportCount = country.sports.size;

                html += `
                    <div class="country-card" onclick="PaieCashFan.modules.navigation.selectCountry('${countryKey}')">
                        <div class="card-icon">${country.flag}</div>
                        <div class="card-content">
                            <h3>${this.formatCountryName(countryKey)}</h3>
                            <p>${teamCount} équipes • ${sportCount} sports</p>
                        </div>
                        <div class="card-arrow">→</div>
                    </div>
                `;
            });

            return html;
        }

        /**
         * RENDU: Vue d'un pays spécifique
         */
        renderCountryView(countryKey) {
            const country = this.hierarchy.countries.get(countryKey);
            if (!country) return;

            this.breadcrumbs = [
                { label: 'Accueil', view: 'countries' },
                { label: this.formatCountryName(countryKey), view: 'country', data: countryKey }
            ];

            const html = `
                <div class="hierarchy-view">
                    ${this.renderBreadcrumbs()}
                    
                    <div class="hierarchy-header">
                        <h2>${country.flag} ${this.formatCountryName(countryKey)}</h2>
                        <p>${country.teams.length} équipes • ${country.sports.size} sports</p>
                    </div>

                    <div class="sports-list">
                        ${this.renderCountrySports(country)}
                    </div>
                </div>
            `;

            this.updateContainer(html);
        }

        renderCountrySports(country) {
            let html = '';
            
            country.sports.forEach((sport, sportKey) => {
                const maleTeams = sport.teams.filter(t => !this.isFemaleTeam(t)).length;
                const femaleTeams = sport.teams.filter(t => this.isFemaleTeam(t)).length;

                html += `
                    <div class="sport-section">
                        <div class="sport-header" onclick="PaieCashFan.modules.navigation.toggleSport('${sportKey}')">
                            <div class="sport-info">
                                <span class="sport-icon">${sport.icon}</span>
                                <h3>${this.formatSportName(sportKey)}</h3>
                                <span class="team-count">${sport.teams.length} équipes</span>
                            </div>
                            <span class="expand-icon">▼</span>
                        </div>
                        
                        <div class="sport-content" id="sport-${sportKey}" style="display: none;">
                            ${femaleTeams > 0 ? `
                                <div class="gender-tabs">
                                    <button class="gender-tab active" onclick="PaieCashFan.modules.navigation.filterGender('${sportKey}', 'male')">
                                        👨 Hommes (${maleTeams})
                                    </button>
                                    <button class="gender-tab" onclick="PaieCashFan.modules.navigation.filterGender('${sportKey}', 'female')">
                                        👩 Femmes (${femaleTeams})
                                    </button>
                                    <button class="gender-tab" onclick="PaieCashFan.modules.navigation.filterGender('${sportKey}', 'all')">
                                        👥 Tous (${sport.teams.length})
                                    </button>
                                </div>
                            ` : ''}
                            
                            <div class="leagues-list">
                                ${this.renderLeagues(sport)}
                            </div>
                        </div>
                    </div>
                `;
            });

            return html;
        }

        renderLeagues(sport) {
            let html = '';
            
            sport.leagues.forEach((league, leagueKey) => {
                html += `
                    <div class="league-block">
                        <h4 class="league-title">${leagueKey}</h4>
                        <div class="teams-grid">
                            ${this.renderTeams(league.teams)}
                        </div>
                    </div>
                `;
            });

            return html;
        }

        renderTeams(teams) {
            return teams.map(team => `
                <div class="team-card" onclick="PaieCashFan.modules.navigation.openTeam('${team.slug}')">
                    <div class="team-logo">${team.emoji}</div>
                    <div class="team-info">
                        <h5>${team.name}</h5>
                        <p>${team.league}</p>
                    </div>
                </div>
            `).join('');
        }

        /**
         * RENDU: Breadcrumbs
         */
        renderBreadcrumbs() {
            return `
                <div class="breadcrumbs">
                    ${this.breadcrumbs.map((crumb, index) => `
                        <span class="breadcrumb ${index === this.breadcrumbs.length - 1 ? 'active' : ''}"
                              onclick="PaieCashFan.modules.navigation.navigateTo('${crumb.view}', '${crumb.data || ''}')">
                            ${crumb.label}
                        </span>
                        ${index < this.breadcrumbs.length - 1 ? '<span class="breadcrumb-separator">›</span>' : ''}
                    `).join('')}
                </div>
            `;
        }

        /**
         * Actions utilisateur
         */
        selectCountry(countryKey) {
            this.showView('country', countryKey);
        }

        toggleSport(sportKey) {
            const element = document.getElementById(`sport-${sportKey}`);
            if (element) {
                element.style.display = element.style.display === 'none' ? 'block' : 'none';
            }
        }

        filterGender(sportKey, gender) {
            // À implémenter: filtrer les équipes par genre
            this.log(`Filtre genre: ${sportKey} → ${gender}`, 'info');
        }

        openTeam(teamSlug) {
            window.location.href = `app-universal-simple.html?club=${teamSlug}`;
        }

        navigateTo(view, data) {
            this.showView(view, data);
        }

        /**
         * Mettre à jour le container
         */
        updateContainer(html) {
            const container = document.getElementById('hierarchyContainer') || 
                            document.getElementById('teamsGrid')?.parentElement;
            
            if (container) {
                container.innerHTML = html;
            }
        }

        /**
         * Utilitaires
         */
        getCountryFlag(country) {
            const flags = {
                'france': '🇫🇷',
                'international': '🌍',
                'spain': '🇪🇸',
                'germany': '🇩🇪',
                'england': '🇬🇧',
                'italy': '🇮🇹'
            };
            return flags[country] || '🌍';
        }

        getSportIcon(sport) {
            const icons = {
                'football': '⚽',
                'basketball': '🏀',
                'handball': '🤾',
                'rugby': '🏉',
                'volleyball': '🏐'
            };
            return icons[sport] || '🏃';
        }

        formatCountryName(country) {
            const names = {
                'france': 'France',
                'international': 'International',
                'spain': 'Espagne',
                'germany': 'Allemagne',
                'england': 'Angleterre',
                'italy': 'Italie'
            };
            return names[country] || country.charAt(0).toUpperCase() + country.slice(1);
        }

        formatSportName(sport) {
            const names = {
                'football': 'Football',
                'basketball': 'Basketball',
                'handball': 'Handball',
                'rugby': 'Rugby',
                'volleyball': 'Volleyball'
            };
            return names[sport] || sport.charAt(0).toUpperCase() + sport.slice(1);
        }

        isFemaleTeam(team) {
            const name = team.name.toLowerCase();
            const league = (team.league || '').toLowerCase();
            return name.includes('féminin') || name.includes('femmes') || 
                   league.includes('féminin') || league.includes('femmes') || 
                   league.includes('(f)') || team.gender === 'Femmes';
        }
    }

    // Export global
    global.PaieCashFan = global.PaieCashFan || {};
    global.PaieCashFan.NavigationHierarchyModule = NavigationHierarchyModule;

    // Auto-enregistrement
    if (global.PaieCashFan.core) {
        global.PaieCashFan.core.registerModule('NavigationHierarchy', NavigationHierarchyModule);
    }

})(window);
