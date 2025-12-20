// ========================================
// 🏀🤾🏉🏐 MULTI-SPORTS - TOUTES LES LIGUES
// Basketball, Handball, Rugby, Volleyball
// Ligues françaises + européennes + internationales
// ========================================

const multiSportsComplet = {
    // ========== 🏀 BASKETBALL ==========
    basketball: {
        betclicEliteH: [
            // 18 clubs déjà existants dans tousLesClubsBasket
            { name: 'Monaco Basket', logo: '🔴⚪', league: 'Betclic Élite (H)', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=monaco-basket' },
            { name: 'ASVEL Lyon-Villeurbanne', logo: '🔴🔵', league: 'Betclic Élite (H)', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=asvel' },
            { name: 'Paris Basketball', logo: '🟣⚪', league: 'Betclic Élite (H)', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=paris-basketball' }
            // + 15 autres clubs déjà chargés
        ],
        proB: [
            { name: 'Nantes Basket', logo: '🟡🟢', league: 'Pro B', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=nantes-basket' },
            { name: 'Antibes Sharks', logo: '🔵⚪', league: 'Pro B', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=antibes-basket' },
            { name: 'Saint-Chamond', logo: '🟢⚪', league: 'Pro B', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=saint-chamond' },
            { name: 'Aix-Maurienne', logo: '🔵🟡', league: 'Pro B', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=aix-maurienne' },
            { name: 'Évreux', logo: '🟠⚪', league: 'Pro B', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=evreux-basket' },
            { name: 'Blois', logo: '🔵⚪', league: 'Pro B', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=blois-basket' },
            { name: 'Roanne', logo: '🟢⚪', league: 'Pro B', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=roanne' },
            { name: 'Denain', logo: '🔴⚫', league: 'Pro B', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=denain' },
            { name: 'Lille Métropole', logo: '🔴⚪', league: 'Pro B', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=lille-basket' },
            { name: 'Orléans', logo: '🔵🟡', league: 'Pro B', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=orleans-basket' },
            { name: 'Vichy-Clermont', logo: '🟡🔵', league: 'Pro B', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=vichy-clermont' },
            { name: 'Caen', logo: '🔴🔵', league: 'Pro B', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=caen-basket' },
            { name: 'Poitiers', logo: '🟠⚪', league: 'Pro B', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=poitiers-basket' },
            { name: 'Quimper', logo: '🔵⚪', league: 'Pro B', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=quimper-basket' },
            { name: 'Fos-sur-Mer', logo: '🟢⚪', league: 'Pro B', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=fos-basket' },
            { name: 'Champagne Basket', logo: '🟡🔴', league: 'Pro B', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=champagne-basket' }
        ],
        lfb: [
            // 12 clubs féminins déjà existants
            { name: 'Lyon ASVEL Féminin', logo: '🔴🔵', league: 'LFB (F)', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=lyon-asvel-feminin' },
            { name: 'Bourges Basket', logo: '🔵⚪', league: 'LFB (F)', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=bourges-basket' },
            { name: 'Lattes-Montpellier', logo: '🟠🔵', league: 'LFB (F)', country: 'France', sport: 'Basketball', path: 'app-universal-simple.html?club=lattes-montpellier' }
            // + 9 autres clubs déjà chargés
        ],
        euroleague: [
            { name: 'Real Madrid Basket', logo: '⚪🔵', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=real-madrid-basket' },
            { name: 'Barcelona Basket', logo: '🔵🔴', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=barcelona-basket' },
            { name: 'Olympiacos', logo: '🔴⚪', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=olympiacos-basket' },
            { name: 'Panathinaikos', logo: '🟢⚪', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=panathinaikos-basket' },
            { name: 'Fenerbahçe Basket', logo: '🟡🔵', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=fenerbahce-basket' },
            { name: 'Anadolu Efes', logo: '🔵⚪', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=anadolu-efes' },
            { name: 'Zalgiris Kaunas', logo: '🟢⚪', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=zalgiris' },
            { name: 'Maccabi Tel Aviv', logo: '🟡🔵', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=maccabi-tel-aviv' },
            { name: 'Baskonia', logo: '🔵🔴', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=baskonia' },
            { name: 'Bayern Munich Basket', logo: '🔴⚪', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=bayern-basket' },
            { name: 'Partizan Belgrade', logo: '⚫⚪', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=partizan-basket' },
            { name: 'Crvena Zvezda', logo: '🔴⚪', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=crvena-zvezda-basket' },
            { name: 'Virtus Bologna', logo: '⚫⚪', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=virtus-bologna' },
            { name: 'Armani Milano', logo: '🔴⚪', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=armani-milano' },
            { name: 'ASVEL', logo: '🔴🔵', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=asvel-euroleague' },
            { name: 'Monaco Basket', logo: '🔴⚪', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=monaco-basket-euroleague' },
            { name: 'Paris Basketball', logo: '🟣⚪', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=paris-basketball-euroleague' },
            { name: 'Alba Berlin', logo: '🟡🔵', league: 'Euroleague', country: 'International', sport: 'Basketball', path: 'app-universal-simple.html?club=alba-berlin' }
        ]
    },

    // ========== 🤾 HANDBALL ==========
    handball: {
        starligueH: [
            // 16 clubs déjà existants
            { name: 'PSG Handball', logo: '🔴🔵', league: 'Liqui Moly Starligue (H)', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=psg-handball' },
            { name: 'Montpellier HB', logo: '🟠🔵', league: 'Liqui Moly Starligue (H)', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=montpellier-handball' }
            // + 14 autres clubs déjà chargés
        ],
        proligue: [
            { name: 'Billère', logo: '🟢⚪', league: 'Proligue', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=billere' },
            { name: 'Caen', logo: '🔴🔵', league: 'Proligue', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=caen-handball' },
            { name: 'Pontault-Combault', logo: '🔵🟡', league: 'Proligue', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=pontault-combault' },
            { name: 'Cournon', logo: '🟡🔴', league: 'Proligue', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=cournon' },
            { name: 'Sarrebourg', logo: '🔴⚪', league: 'Proligue', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=sarrebourg' },
            { name: 'Sélestat', logo: '🔵⚪', league: 'Proligue', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=selestat' },
            { name: 'Frontignan', logo: '🟠⚪', league: 'Proligue', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=frontignan' },
            { name: 'Angers', logo: '⚫⚪', league: 'Proligue', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=angers-handball' },
            { name: 'Valence', logo: '🔵🔴', league: 'Proligue', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=valence-handball' },
            { name: 'Grand Besançon', logo: '🔵⚪', league: 'Proligue', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=grand-besancon' },
            { name: 'Cherbourg', logo: '🟢⚪', league: 'Proligue', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=cherbourg' },
            { name: 'Tremblay', logo: '🔴⚪', league: 'Proligue', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=tremblay' },
            { name: 'Massy', logo: '🟡🔵', league: 'Proligue', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=massy' },
            { name: 'Saran', logo: '🔵⚪', league: 'Proligue', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=saran' }
        ],
        lbeF: [
            // 14 clubs féminins déjà existants
            { name: 'Metz Handball', logo: '🟠⚫', league: 'Ligue Butagaz Énergie (F)', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=metz-handball' },
            { name: 'Brest Bretagne Handball', logo: '🔴⚪', league: 'Ligue Butagaz Énergie (F)', country: 'France', sport: 'Handball', path: 'app-universal-simple.html?club=brest-handball' }
            // + 12 autres clubs déjà chargés
        ],
        championsLeague: [
            { name: 'Barcelona Handball', logo: '🔵🔴', league: 'Champions League Handball', country: 'International', sport: 'Handball', path: 'app-universal-simple.html?club=barcelona-handball' },
            { name: 'THW Kiel', logo: '🔵⚪', league: 'Champions League Handball', country: 'International', sport: 'Handball', path: 'app-universal-simple.html?club=thw-kiel' },
            { name: 'SG Flensburg', logo: '🔴⚪', league: 'Champions League Handball', country: 'International', sport: 'Handball', path: 'app-universal-simple.html?club=flensburg' },
            { name: 'Aalborg Håndbold', logo: '🔴⚪', league: 'Champions League Handball', country: 'International', sport: 'Handball', path: 'app-universal-simple.html?club=aalborg' },
            { name: 'Veszprém', logo: '🔴⚪', league: 'Champions League Handball', country: 'International', sport: 'Handball', path: 'app-universal-simple.html?club=veszprem' },
            { name: 'PSG Handball', logo: '🔴🔵', league: 'Champions League Handball', country: 'International', sport: 'Handball', path: 'app-universal-simple.html?club=psg-handball-cl' },
            { name: 'Montpellier HB', logo: '🟠🔵', league: 'Champions League Handball', country: 'International', sport: 'Handball', path: 'app-universal-simple.html?club=montpellier-handball-cl' },
            { name: 'Magdeburg', logo: '🟢⚪', league: 'Champions League Handball', country: 'International', sport: 'Handball', path: 'app-universal-simple.html?club=magdeburg-handball' },
            { name: 'Kolding IF', logo: '🔴🔵', league: 'Champions League Handball', country: 'International', sport: 'Handball', path: 'app-universal-simple.html?club=kolding' },
            { name: 'Łomża Vive Kielce', logo: '🟡🔴', league: 'Champions League Handball', country: 'International', sport: 'Handball', path: 'app-universal-simple.html?club=vive-kielce' }
        ]
    },

    // ========== 🏉 RUGBY ==========
    rugby: {
        top14: [
            // 14 clubs déjà existants
            { name: 'Stade Toulousain', logo: '🔴⚫', league: 'Top 14 (H)', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=toulouse-rugby' },
            { name: 'La Rochelle', logo: '🟡⚫', league: 'Top 14 (H)', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=la-rochelle-rugby' }
            // + 12 autres clubs déjà chargés
        ],
        proD2: [
            { name: 'Oyonnax', logo: '🔴⚪', league: 'Pro D2', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=oyonnax' },
            { name: 'Béziers', logo: '🔴🔵', league: 'Pro D2', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=beziers-rugby' },
            { name: 'Colomiers', logo: '🔵⚪', league: 'Pro D2', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=colomiers-rugby' },
            { name: 'Provence Rugby', logo: '🔵⚪', league: 'Pro D2', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=provence-rugby' },
            { name: 'Montauban', logo: '🔵⚪', league: 'Pro D2', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=montauban' },
            { name: 'Grenoble', logo: '🔴🔵', league: 'Pro D2', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=grenoble-rugby' },
            { name: 'Biarritz', logo: '🔴⚪', league: 'Pro D2', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=biarritz' },
            { name: 'Nevers', logo: '🔵⚪', league: 'Pro D2', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=nevers' },
            { name: 'Aurillac', logo: '🟡⚫', league: 'Pro D2', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=aurillac' },
            { name: 'Rouen', logo: '🟡🔴', league: 'Pro D2', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=rouen-rugby' },
            { name: 'Carcassonne', logo: '🟡⚫', league: 'Pro D2', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=carcassonne' },
            { name: 'Bourg-en-Bresse', logo: '🔵⚪', league: 'Pro D2', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=bourg-en-bresse' },
            { name: 'Massy', logo: '🟡🔵', league: 'Pro D2', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=massy-rugby' },
            { name: 'Mont-de-Marsan', logo: '🔴⚪', league: 'Pro D2', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=mont-de-marsan' },
            { name: 'Valence Romans', logo: '🔵🔴', league: 'Pro D2', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=valence-romans' },
            { name: 'Soyaux-Angoulême', logo: '🟢⚪', league: 'Pro D2', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=soyaux-angouleme' }
        ],
        elite1F: [
            // 10 clubs féminins déjà existants
            { name: 'Stade Toulousain Féminin', logo: '🔴⚫', league: 'Élite 1 (F)', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=toulouse-rugby-feminin' },
            { name: 'Blagnac Féminin', logo: '🔵⚪', league: 'Élite 1 (F)', country: 'France', sport: 'Rugby', path: 'app-universal-simple.html?club=blagnac-feminin' }
            // + 8 autres clubs déjà chargés
        ],
        championsCup: [
            { name: 'Leinster Rugby', logo: '🔵⚪', league: 'Champions Cup', country: 'International', sport: 'Rugby', path: 'app-universal-simple.html?club=leinster' },
            { name: 'Munster Rugby', logo: '🔴⚪', league: 'Champions Cup', country: 'International', sport: 'Rugby', path: 'app-universal-simple.html?club=munster' },
            { name: 'Saracens', logo: '⚫🔴', league: 'Champions Cup', country: 'International', sport: 'Rugby', path: 'app-universal-simple.html?club=saracens' },
            { name: 'Leicester Tigers', logo: '🟢🔴⚪', league: 'Champions Cup', country: 'International', sport: 'Rugby', path: 'app-universal-simple.html?club=leicester-tigers' },
            { name: 'Northampton Saints', logo: '🟢⚫⟡', league: 'Champions Cup', country: 'International', sport: 'Rugby', path: 'app-universal-simple.html?club=northampton' },
            { name: 'Exeter Chiefs', logo: '⚫⚪🔴', league: 'Champions Cup', country: 'International', sport: 'Rugby', path: 'app-universal-simple.html?club=exeter-chiefs' },
            { name: 'Ulster Rugby', logo: '⚪🔴', league: 'Champions Cup', country: 'International', sport: 'Rugby', path: 'app-universal-simple.html?club=ulster' },
            { name: 'Glasgow Warriors', logo: '🔵🟡', league: 'Champions Cup', country: 'International', sport: 'Rugby', path: 'app-universal-simple.html?club=glasgow-warriors' },
            { name: 'Toulouse', logo: '🔴⚫', league: 'Champions Cup', country: 'International', sport: 'Rugby', path: 'app-universal-simple.html?club=toulouse-rugby-cl' },
            { name: 'La Rochelle', logo: '🟡⚫', league: 'Champions Cup', country: 'International', sport: 'Rugby', path: 'app-universal-simple.html?club=la-rochelle-cl' }
        ]
    },

    // ========== 🏐 VOLLEYBALL ==========
    volleyball: {
        ligueAH: [
            // 12 clubs déjà existants
            { name: 'Tours VB', logo: '🔵⚪', league: 'Ligue A (H)', country: 'France', sport: 'Volleyball', path: 'app-universal-simple.html?club=tours-vb' },
            { name: 'Chaumont VB', logo: '🔴🔵', league: 'Ligue A (H)', country: 'France', sport: 'Volleyball', path: 'app-universal-simple.html?club=chaumont' }
            // + 10 autres clubs déjà chargés
        ],
        ligueB: [
            { name: 'Martigues', logo: '🔵🟡', league: 'Ligue B', country: 'France', sport: 'Volleyball', path: 'app-universal-simple.html?club=martigues' },
            { name: 'Cambrai', logo: '🔴⚪', league: 'Ligue B', country: 'France', sport: 'Volleyball', path: 'app-universal-simple.html?club=cambrai-volley' },
            { name: 'Rennes', logo: '🔴⚫', league: 'Ligue B', country: 'France', sport: 'Volleyball', path: 'app-universal-simple.html?club=rennes-volley' },
            { name: 'Saint-Nazaire', logo: '🟡🔵', league: 'Ligue B', country: 'France', sport: 'Volleyball', path: 'app-universal-simple.html?club=saint-nazaire' },
            { name: 'Tourcoing', logo: '🔵⚪', league: 'Ligue B', country: 'France', sport: 'Volleyball', path: 'app-universal-simple.html?club=tourcoing-volley' },
            { name: 'Toulouse', logo: '🟣⚪', league: 'Ligue B', country: 'France', sport: 'Volleyball', path: 'app-universal-simple.html?club=toulouse-volley' },
            { name: 'Plessis-Robinson', logo: '🔴🔵', league: 'Ligue B', country: 'France', sport: 'Volleyball', path: 'app-universal-simple.html?club=plessis-robinson' },
            { name: 'Arago de Sète', logo: '🔵⚪', league: 'Ligue B', country: 'France', sport: 'Volleyball', path: 'app-universal-simple.html?club=arago-sete' },
            { name: 'Montpellier', logo: '🟠🔵', league: 'Ligue B', country: 'France', sport: 'Volleyball', path: 'app-universal-simple.html?club=montpellier-volley' },
            { name: 'Beauvais', logo: '🔵⚪', league: 'Ligue B', country: 'France', sport: 'Volleyball', path: 'app-universal-simple.html?club=beauvais-volley' },
            { name: 'Narbonne', logo: '🟡🔴', league: 'Ligue B', country: 'France', sport: 'Volleyball', path: 'app-universal-simple.html?club=narbonne-volley' },
            { name: 'Ajaccio', logo: '🔴⚪', league: 'Ligue B', country: 'France', sport: 'Volleyball', path: 'app-universal-simple.html?club=ajaccio-volley' }
        ],
        ligueAF: [
            // 12 clubs féminins déjà existants
            { name: 'RC Cannes', logo: '🔵⚪', league: 'Ligue A (F)', country: 'France', sport: 'Volleyball', path: 'app-universal-simple.html?club=rc-cannes' },
            { name: 'Mulhouse', logo: '🔴⚪', league: 'Ligue A (F)', country: 'France', sport: 'Volleyball', path: 'app-universal-simple.html?club=mulhouse-volley' }
            // + 10 autres clubs déjà chargés
        ],
        cev: [
            { name: 'Perugia', logo: '⚫⚪', league: 'CEV Champions League', country: 'International', sport: 'Volleyball', path: 'app-universal-simple.html?club=perugia-volley' },
            { name: 'Trentino Volley', logo: '🟡🔵', league: 'CEV Champions League', country: 'International', sport: 'Volleyball', path: 'app-universal-simple.html?club=trentino' },
            { name: 'Zenit Kazan', logo: '🔵⚪', league: 'CEV Champions League', country: 'International', sport: 'Volleyball', path: 'app-universal-simple.html?club=zenit-kazan' },
            { name: 'Zaksa Kędzierzyn-Koźle', logo: '🟢⚫', league: 'CEV Champions League', country: 'International', sport: 'Volleyball', path: 'app-universal-simple.html?club=zaksa' },
            { name: 'Fenerbahçe Volley', logo: '🟡🔵', league: 'CEV Champions League', country: 'International', sport: 'Volleyball', path: 'app-universal-simple.html?club=fenerbahce-volley' },
            { name: 'Cucine Lube Civitanova', logo: '🔴⚪', league: 'CEV Champions League', country: 'International', sport: 'Volleyball', path: 'app-universal-simple.html?club=lube-civitanova' },
            { name: 'Jastrzębski Węgiel', logo: '🔴⚫', league: 'CEV Champions League', country: 'International', sport: 'Volleyball', path: 'app-universal-simple.html?club=jastrzebski' },
            { name: 'Berlin Recycling Volleys', logo: '🔵⚪', league: 'CEV Champions League', country: 'International', sport: 'Volleyball', path: 'app-universal-simple.html?club=berlin-volleys' }
        ]
    }
};

console.log('✅ Multi-Sports Complet - Toutes les ligues chargées');
console.log('🏀 Basketball: Betclic Élite, Pro B, LFB, Euroleague');
console.log('🤾 Handball: Starligue, Proligue, LBE, Champions League');
console.log('🏉 Rugby: Top 14, Pro D2, Élite 1, Champions Cup');
console.log('🏐 Volleyball: Ligue A, Ligue B, CEV Champions League');
