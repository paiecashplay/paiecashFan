// ========================================
// BASKETBALL - FÉDÉRATIONS & CLUBS
// FIBA, NBA, Euroleague, LNB (France)
// Équipes Masculines & Féminines
// ========================================

// ========== FÉDÉRATIONS INTERNATIONALES BASKET ==========
const basketFederations = [
    // Fédérations Européennes
    { name: 'France Basketball (FFBB)', code: 'FRA', flag: '🇫🇷', sport: 'Basketball', gender: 'Mixte', path: 'app-universal-simple.html?club=France+Basketball&logo=🇫🇷&sport=Basketball&league=FIBA' },
    { name: 'Espagne Basketball (FEB)', code: 'ESP', flag: '🇪🇸', sport: 'Basketball', gender: 'Mixte', path: 'app-universal-simple.html?club=Espagne+Basketball&logo=🇪🇸&sport=Basketball&league=FIBA' },
    { name: 'Italie Basketball (FIP)', code: 'ITA', flag: '🇮🇹', sport: 'Basketball', gender: 'Mixte', path: 'app-universal-simple.html?club=Italie+Basketball&logo=🇮🇹&sport=Basketball&league=FIBA' },
    { name: 'Allemagne Basketball (DBB)', code: 'GER', flag: '🇩🇪', sport: 'Basketball', gender: 'Mixte', path: 'app-universal-simple.html?club=Allemagne+Basketball&logo=🇩🇪&sport=Basketball&league=FIBA' },
    { name: 'Grèce Basketball (EOK)', code: 'GRE', flag: '🇬🇷', sport: 'Basketball', gender: 'Mixte', path: 'app-universal-simple.html?club=Grèce+Basketball&logo=🇬🇷&sport=Basketball&league=FIBA' },
    { name: 'Serbie Basketball (KSS)', code: 'SRB', flag: '🇷🇸', sport: 'Basketball', gender: 'Mixte', path: 'app-universal-simple.html?club=Serbie+Basketball&logo=🇷🇸&sport=Basketball&league=FIBA' },
    { name: 'Turquie Basketball (TBF)', code: 'TUR', flag: '🇹🇷', sport: 'Basketball', gender: 'Mixte', path: 'app-universal-simple.html?club=Turquie+Basketball&logo=🇹🇷&sport=Basketball&league=FIBA' },
    
    // Fédérations Américaines
    { name: 'USA Basketball', code: 'USA', flag: '🇺🇸', sport: 'Basketball', gender: 'Mixte', path: 'app-universal-simple.html?club=USA+Basketball&logo=🇺🇸&sport=Basketball&league=FIBA' },
    { name: 'Canada Basketball', code: 'CAN', flag: '🇨🇦', sport: 'Basketball', gender: 'Mixte', path: 'app-universal-simple.html?club=Canada+Basketball&logo=🇨🇦&sport=Basketball&league=FIBA' },
    { name: 'Argentine Basketball', code: 'ARG', flag: '🇦🇷', sport: 'Basketball', gender: 'Mixte', path: 'app-universal-simple.html?club=Argentine+Basketball&logo=🇦🇷&sport=Basketball&league=FIBA' },
    { name: 'Brésil Basketball', code: 'BRA', flag: '🇧🇷', sport: 'Basketball', gender: 'Mixte', path: 'app-universal-simple.html?club=Brésil+Basketball&logo=🇧🇷&sport=Basketball&league=FIBA' },
    
    // Fédérations Africaines
    { name: 'Sénégal Basketball', code: 'SEN', flag: '🇸🇳', sport: 'Basketball', gender: 'Mixte', path: 'app-universal-simple.html?club=Sénégal+Basketball&logo=🇸🇳&sport=Basketball&league=FIBA' },
    { name: 'Nigeria Basketball', code: 'NGA', flag: '🇳🇬', sport: 'Basketball', gender: 'Mixte', path: 'app-universal-simple.html?club=Nigeria+Basketball&logo=🇳🇬&sport=Basketball&league=FIBA' },
    
    // Fédérations Asie-Océanie
    { name: 'Australie Basketball', code: 'AUS', flag: '🇦🇺', sport: 'Basketball', gender: 'Mixte', path: 'app-universal-simple.html?club=Australie+Basketball&logo=🇦🇺&sport=Basketball&league=FIBA' },
    { name: 'Chine Basketball', code: 'CHN', flag: '🇨🇳', sport: 'Basketball', gender: 'Mixte', path: 'app-universal-simple.html?club=Chine+Basketball&logo=🇨🇳&sport=Basketball&league=FIBA' },
    { name: 'Japon Basketball', code: 'JPN', flag: '🇯🇵', sport: 'Basketball', gender: 'Mixte', path: 'app-universal-simple.html?club=Japon+Basketball&logo=🇯🇵&sport=Basketball&league=FIBA' }
];

// ========== CLUBS PROFESSIONNELS FRANCE (LNB + LFB) ==========

// BETCLIC ÉLITE - Hommes (18 clubs)
const betclicEliteHommes = [
    { name: 'ASVEL Lyon-Villeurbanne', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=ASVEL&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'AS Monaco Basket', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=Monaco+Basket&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'Paris Basketball', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=Paris+Basketball&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'JL Bourg-en-Bresse', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=JL+Bourg&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'Metropolitans 92', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=Metropolitans+92&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'ESSM Le Portel', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=Le+Portel&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'Cholet Basket', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=Cholet&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'Limoges CSP', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=Limoges+CSP&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'SIG Strasbourg', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=SIG+Strasbourg&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'Nanterre 92', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=Nanterre+92&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'JDA Dijon', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=JDA+Dijon&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'Élan Chalon', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=Elan+Chalon&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'Fos Provence Basket', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=Fos+Provence&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'Gravelines-Dunkerque', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=Gravelines&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'Champagne Basket', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=Champagne+Basket&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'Saint-Quentin Basket-Ball', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=Saint-Quentin&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'Blois Basket 41', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=Blois&logo=🏀&sport=Basketball&league=Betclic+Elite' },
    { name: 'Rouen Métropole Basket', logo: '🏀', league: 'Betclic Élite', gender: 'Hommes', path: 'app-universal-simple.html?club=Rouen&logo=🏀&sport=Basketball&league=Betclic+Elite' }
];

// LIGUE FÉMININE DE BASKETBALL (LFB) - Femmes (12 clubs)
const lfbFemmes = [
    { name: 'Lyon ASVEL Féminin', logo: '🏀', league: 'LFB', gender: 'Femmes', path: 'app-universal-simple.html?club=ASVEL+Feminin&logo=🏀&sport=Basketball+Feminin&league=LFB' },
    { name: 'Bourges Basket', logo: '🏀', league: 'LFB', gender: 'Femmes', path: 'app-universal-simple.html?club=Bourges+Basket&logo=🏀&sport=Basketball+Feminin&league=LFB' },
    { name: 'Villeneuve d\'Ascq', logo: '🏀', league: 'LFB', gender: 'Femmes', path: 'app-universal-simple.html?club=Villeneuve+Ascq&logo=🏀&sport=Basketball+Feminin&league=LFB' },
    { name: 'Basket Lattes Montpellier', logo: '🏀', league: 'LFB', gender: 'Femmes', path: 'app-universal-simple.html?club=Lattes+Montpellier&logo=🏀&sport=Basketball+Feminin&league=LFB' },
    { name: 'Angers Basket 49', logo: '🏀', league: 'LFB', gender: 'Femmes', path: 'app-universal-simple.html?club=Angers+Basket&logo=🏀&sport=Basketball+Feminin&league=LFB' },
    { name: 'Landerneau Bretagne Basket', logo: '🏀', league: 'LFB', gender: 'Femmes', path: 'app-universal-simple.html?club=Landerneau&logo=🏀&sport=Basketball+Feminin&league=LFB' },
    { name: 'Saint-Amand-les-Eaux', logo: '🏀', league: 'LFB', gender: 'Femmes', path: 'app-universal-simple.html?club=Saint-Amand&logo=🏀&sport=Basketball+Feminin&league=LFB' },
    { name: 'Tarbes Gespe Bigorre', logo: '🏀', league: 'LFB', gender: 'Femmes', path: 'app-universal-simple.html?club=Tarbes&logo=🏀&sport=Basketball+Feminin&league=LFB' },
    { name: 'La Roche Vendée Basket', logo: '🏀', league: 'LFB', gender: 'Femmes', path: 'app-universal-simple.html?club=La+Roche+Vendee&logo=🏀&sport=Basketball+Feminin&league=LFB' },
    { name: 'Flammes Carolo Basket', logo: '🏀', league: 'LFB', gender: 'Femmes', path: 'app-universal-simple.html?club=Flammes+Carolo&logo=🏀&sport=Basketball+Feminin&league=LFB' },
    { name: 'Charnay Basket Bourgogne Sud', logo: '🏀', league: 'LFB', gender: 'Femmes', path: 'app-universal-simple.html?club=Charnay&logo=🏀&sport=Basketball+Feminin&league=LFB' },
    { name: 'Basket Landes', logo: '🏀', league: 'LFB', gender: 'Femmes', path: 'app-universal-simple.html?club=Basket+Landes&logo=🏀&sport=Basketball+Feminin&league=LFB' }
];

// ========== ÉQUIPES NATIONALES ==========
const equipesNationalesBasket = [
    { name: 'France Hommes Basketball', logo: '🇫🇷', gender: 'Hommes', path: 'app-universal-simple.html?club=France+Hommes+Basketball&logo=🇫🇷&sport=Basketball&league=FIBA' },
    { name: 'France Femmes Basketball', logo: '🇫🇷', gender: 'Femmes', path: 'app-universal-simple.html?club=France+Femmes+Basketball&logo=🇫🇷&sport=Basketball+Feminin&league=FIBA' }
];

// ========== RÉCAPITULATIF ==========
const tousLesClubsBasket = [
    ...betclicEliteHommes,
    ...lfbFemmes,
    ...equipesNationalesBasket,
    ...basketFederations
];

console.log('✅ Basketball chargé');
console.log('🏀 Betclic Élite (H):', betclicEliteHommes.length, 'clubs');
console.log('🏀 LFB (F):', lfbFemmes.length, 'clubs');
console.log('🌍 Fédérations:', basketFederations.length);
console.log('🏀 TOTAL BASKET:', tousLesClubsBasket.length, 'équipes');
