// ========================================
// HANDBALL - FÉDÉRATIONS & CLUBS
// IHF, LNH (France), Championnats Européens
// Équipes Masculines & Féminines
// ========================================

// ========== FÉDÉRATIONS INTERNATIONALES HANDBALL ==========
const handballFederations = [
    // Fédérations Européennes
    { name: 'France Handball (FFHB)', code: 'FRA', flag: '🇫🇷', sport: 'Handball', gender: 'Mixte', path: 'app-universal-simple.html?club=France+Handball&logo=🇫🇷&sport=Handball&league=IHF' },
    { name: 'Allemagne Handball (DHB)', code: 'GER', flag: '🇩🇪', sport: 'Handball', gender: 'Mixte', path: 'app-universal-simple.html?club=Allemagne+Handball&logo=🇩🇪&sport=Handball&league=IHF' },
    { name: 'Espagne Handball (RFEBM)', code: 'ESP', flag: '🇪🇸', sport: 'Handball', gender: 'Mixte', path: 'app-universal-simple.html?club=Espagne+Handball&logo=🇪🇸&sport=Handball&league=IHF' },
    { name: 'Danemark Handball (DHF)', code: 'DEN', flag: '🇩🇰', sport: 'Handball', gender: 'Mixte', path: 'app-universal-simple.html?club=Danemark+Handball&logo=🇩🇰&sport=Handball&league=IHF' },
    { name: 'Norvège Handball (NHF)', code: 'NOR', flag: '🇳🇴', sport: 'Handball', gender: 'Mixte', path: 'app-universal-simple.html?club=Norvège+Handball&logo=🇳🇴&sport=Handball&league=IHF' },
    { name: 'Suède Handball (SHF)', code: 'SWE', flag: '🇸🇪', sport: 'Handball', gender: 'Mixte', path: 'app-universal-simple.html?club=Suède+Handball&logo=🇸🇪&sport=Handball&league=IHF' },
    { name: 'Croatie Handball (HRS)', code: 'CRO', flag: '🇭🇷', sport: 'Handball', gender: 'Mixte', path: 'app-universal-simple.html?club=Croatie+Handball&logo=🇭🇷&sport=Handball&league=IHF' },
    { name: 'Islande Handball (HSI)', code: 'ISL', flag: '🇮🇸', sport: 'Handball', gender: 'Mixte', path: 'app-universal-simple.html?club=Islande+Handball&logo=🇮🇸&sport=Handball&league=IHF' },
    { name: 'Pologne Handball (ZPRP)', code: 'POL', flag: '🇵🇱', sport: 'Handball', gender: 'Mixte', path: 'app-universal-simple.html?club=Pologne+Handball&logo=🇵🇱&sport=Handball&league=IHF' },
    { name: 'Hongrie Handball (MKSZ)', code: 'HUN', flag: '🇭🇺', sport: 'Handball', gender: 'Mixte', path: 'app-universal-simple.html?club=Hongrie+Handball&logo=🇭🇺&sport=Handball&league=IHF' },
    
    // Fédérations Africaines
    { name: 'Égypte Handball', code: 'EGY', flag: '🇪🇬', sport: 'Handball', gender: 'Mixte', path: 'app-universal-simple.html?club=Égypte+Handball&logo=🇪🇬&sport=Handball&league=IHF' },
    { name: 'Tunisie Handball', code: 'TUN', flag: '🇹🇳', sport: 'Handball', gender: 'Mixte', path: 'app-universal-simple.html?club=Tunisie+Handball&logo=🇹🇳&sport=Handball&league=IHF' },
    { name: 'Algérie Handball', code: 'ALG', flag: '🇩🇿', sport: 'Handball', gender: 'Mixte', path: 'app-universal-simple.html?club=Algérie+Handball&logo=🇩🇿&sport=Handball&league=IHF' },
    { name: 'Angola Handball', code: 'ANG', flag: '🇦🇴', sport: 'Handball', gender: 'Mixte', path: 'app-universal-simple.html?club=Angola+Handball&logo=🇦🇴&sport=Handball&league=IHF' }
];

// ========== CLUBS PROFESSIONNELS FRANCE (LNH + D1F) ==========

// LIQUI MOLY STARLIGUE - Hommes (16 clubs)
const starligueMasculine = [
    { name: 'Paris Saint-Germain Handball', logo: '🤾', league: 'Liqui Moly Starligue', gender: 'Hommes', path: 'app-universal-simple.html?club=PSG+Handball&logo=🤾&sport=Handball&league=Starligue' },
    { name: 'Montpellier Handball', logo: '🤾', league: 'Liqui Moly Starligue', gender: 'Hommes', path: 'app-universal-simple.html?club=Montpellier+HB&logo=🤾&sport=Handball&league=Starligue' },
    { name: 'Nantes Atlantique Handball', logo: '🤾', league: 'Liqui Moly Starligue', gender: 'Hommes', path: 'app-universal-simple.html?club=Nantes+HB&logo=🤾&sport=Handball&league=Starligue' },
    { name: 'Chambéry Savoie Mont Blanc Handball', logo: '🤾', league: 'Liqui Moly Starligue', gender: 'Hommes', path: 'app-universal-simple.html?club=Chambéry+HB&logo=🤾&sport=Handball&league=Starligue' },
    { name: 'Fenix Toulouse Handball', logo: '🤾', league: 'Liqui Moly Starligue', gender: 'Hommes', path: 'app-universal-simple.html?club=Toulouse+HB&logo=🤾&sport=Handball&league=Starligue' },
    { name: 'Limoges Handball', logo: '🤾', league: 'Liqui Moly Starligue', gender: 'Hommes', path: 'app-universal-simple.html?club=Limoges+HB&logo=🤾&sport=Handball&league=Starligue' },
    { name: 'HBC Nîmes', logo: '🤾', league: 'Liqui Moly Starligue', gender: 'Hommes', path: 'app-universal-simple.html?club=Nîmes+HB&logo=🤾&sport=Handball&league=Starligue' },
    { name: 'USAM Nîmes Gard', logo: '🤾', league: 'Liqui Moly Starligue', gender: 'Hommes', path: 'app-universal-simple.html?club=USAM+Nîmes&logo=🤾&sport=Handball&league=Starligue' },
    { name: 'Dunkerque Handball Grand Littoral', logo: '🤾', league: 'Liqui Moly Starligue', gender: 'Hommes', path: 'app-universal-simple.html?club=Dunkerque+HB&logo=🤾&sport=Handball&league=Starligue' },
    { name: 'Saint-Raphaël Var Handball', logo: '🤾', league: 'Liqui Moly Starligue', gender: 'Hommes', path: 'app-universal-simple.html?club=Saint-Raphael+HB&logo=🤾&sport=Handball&league=Starligue' },
    { name: 'Pays d\'Aix Université Club', logo: '🤾', league: 'Liqui Moly Starligue', gender: 'Hommes', path: 'app-universal-simple.html?club=Aix+HB&logo=🤾&sport=Handball&league=Starligue' },
    { name: 'Cesson Rennes Métropole Handball', logo: '🤾', league: 'Liqui Moly Starligue', gender: 'Hommes', path: 'app-universal-simple.html?club=Cesson+Rennes&logo=🤾&sport=Handball&league=Starligue' },
    { name: 'Istres Provence Handball', logo: '🤾', league: 'Liqui Moly Starligue', gender: 'Hommes', path: 'app-universal-simple.html?club=Istres+HB&logo=🤾&sport=Handball&league=Starligue' },
    { name: 'Chartres Métropole 28', logo: '🤾', league: 'Liqui Moly Starligue', gender: 'Hommes', path: 'app-universal-simple.html?club=Chartres+HB&logo=🤾&sport=Handball&league=Starligue' },
    { name: 'Pontault-Combault Handball', logo: '🤾', league: 'Liqui Moly Starligue', gender: 'Hommes', path: 'app-universal-simple.html?club=Pontault+Combault&logo=🤾&sport=Handball&league=Starligue' },
    { name: 'Tremblay-en-France Handball', logo: '🤾', league: 'Liqui Moly Starligue', gender: 'Hommes', path: 'app-universal-simple.html?club=Tremblay+HB&logo=🤾&sport=Handball&league=Starligue' }
];

// LIGUE BUTAGAZ ÉNERGIE (D1F) - Femmes (14 clubs)
const d1fFeminine = [
    { name: 'Metz Handball', logo: '🤾', league: 'Ligue Butagaz Énergie', gender: 'Femmes', path: 'app-universal-simple.html?club=Metz+Handball+Feminin&logo=🤾&sport=Handball+Feminin&league=D1F' },
    { name: 'Brest Bretagne Handball', logo: '🤾', league: 'Ligue Butagaz Énergie', gender: 'Femmes', path: 'app-universal-simple.html?club=Brest+HB+Feminin&logo=🤾&sport=Handball+Feminin&league=D1F' },
    { name: 'Paris 92', logo: '🤾', league: 'Ligue Butagaz Énergie', gender: 'Femmes', path: 'app-universal-simple.html?club=Paris+92+Feminin&logo=🤾&sport=Handball+Feminin&league=D1F' },
    { name: 'Nice Côte d\'Azur Handball', logo: '🤾', league: 'Ligue Butagaz Énergie', gender: 'Femmes', path: 'app-universal-simple.html?club=Nice+HB+Feminin&logo=🤾&sport=Handball+Feminin&league=D1F' },
    { name: 'Nantes Atlantique Handball', logo: '🤾', league: 'Ligue Butagaz Énergie', gender: 'Femmes', path: 'app-universal-simple.html?club=Nantes+HB+Feminin&logo=🤾&sport=Handball+Feminin&league=D1F' },
    { name: 'Fleury Loiret Handball', logo: '🤾', league: 'Ligue Butagaz Énergie', gender: 'Femmes', path: 'app-universal-simple.html?club=Fleury+Loiret&logo=🤾&sport=Handball+Feminin&league=D1F' },
    { name: 'Besançon Handball', logo: '🤾', league: 'Ligue Butagaz Énergie', gender: 'Femmes', path: 'app-universal-simple.html?club=Besançon+HB&logo=🤾&sport=Handball+Feminin&league=D1F' },
    { name: 'Toulon Saint-Cyr Var Handball', logo: '🤾', league: 'Ligue Butagaz Énergie', gender: 'Femmes', path: 'app-universal-simple.html?club=Toulon+HB&logo=🤾&sport=Handball+Feminin&league=D1F' },
    { name: 'Chambray Touraine Handball', logo: '🤾', league: 'Ligue Butagaz Énergie', gender: 'Femmes', path: 'app-universal-simple.html?club=Chambray+Touraine&logo=🤾&sport=Handball+Feminin&league=D1F' },
    { name: 'Plan de Cuques Handball', logo: '🤾', league: 'Ligue Butagaz Énergie', gender: 'Femmes', path: 'app-universal-simple.html?club=Plan+de+Cuques&logo=🤾&sport=Handball+Feminin&league=D1F' },
    { name: 'Dijon Métropole Handball', logo: '🤾', league: 'Ligue Butagaz Énergie', gender: 'Femmes', path: 'app-universal-simple.html?club=Dijon+HB&logo=🤾&sport=Handball+Feminin&league=D1F' },
    { name: 'Neptunes de Nantes', logo: '🤾', league: 'Ligue Butagaz Énergie', gender: 'Femmes', path: 'app-universal-simple.html?club=Neptunes+Nantes&logo=🤾&sport=Handball+Feminin&league=D1F' },
    { name: 'Mérignac Handball', logo: '🤾', league: 'Ligue Butagaz Énergie', gender: 'Femmes', path: 'app-universal-simple.html?club=Mérignac+HB&logo=🤾&sport=Handball+Feminin&league=D1F' },
    { name: 'Handball Cercle Nîmes', logo: '🤾', league: 'Ligue Butagaz Énergie', gender: 'Femmes', path: 'app-universal-simple.html?club=Nîmes+HB+Feminin&logo=🤾&sport=Handball+Feminin&league=D1F' }
];

// ========== ÉQUIPES NATIONALES ==========
const equipesNationalesHandball = [
    { name: 'France Hommes Handball', logo: '🇫🇷', gender: 'Hommes', path: 'app-universal-simple.html?club=France+Hommes+Handball&logo=🇫🇷&sport=Handball&league=IHF' },
    { name: 'France Femmes Handball', logo: '🇫🇷', gender: 'Femmes', path: 'app-universal-simple.html?club=France+Femmes+Handball&logo=🇫🇷&sport=Handball+Feminin&league=IHF' }
];

// ========== RÉCAPITULATIF ==========
const tousLesClubsHandball = [
    ...starligueMasculine,
    ...d1fFeminine,
    ...equipesNationalesHandball,
    ...handballFederations
];

console.log('✅ Handball chargé');
console.log('🤾 Liqui Moly Starligue (H):', starligueMasculine.length, 'clubs');
console.log('🤾 Ligue Butagaz Énergie (F):', d1fFeminine.length, 'clubs');
console.log('🌍 Fédérations:', handballFederations.length);
console.log('🤾 TOTAL HANDBALL:', tousLesClubsHandball.length, 'équipes');
