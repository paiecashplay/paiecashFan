// ========================================
// TOUTES LES COMPÉTITIONS 2026
// Coupe du Monde 2026, CAN 2026, JOJ 2026 Dakar
// ========================================

// ========== COUPE DU MONDE 2026 (48 ÉQUIPES) ==========
// 46 qualifiées + 2 à déterminer via playoffs intercontinentaux
const coupeDuMonde2026 = [
    // 🇪🇺 EUROPE (16 qualifiés) 
    { name: 'Angleterre', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Angleterre&logo=🏴󠁧󠁢󠁥󠁮󠁧󠁿&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Autriche', code: 'AUT', flag: '🇦🇹', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Autriche&logo=🇦🇹&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Belgique', code: 'BEL', flag: '🇧🇪', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Belgique&logo=🇧🇪&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Croatie', code: 'CRO', flag: '🇭🇷', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Croatie&logo=🇭🇷&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Écosse', code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Écosse&logo=🏴󠁧󠁢󠁳󠁣󠁴󠁿&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Espagne', code: 'ESP', flag: '🇪🇸', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Espagne&logo=🇪🇸&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'France', code: 'FRA', flag: '🇫🇷', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=France&logo=🇫🇷&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Allemagne', code: 'GER', flag: '🇩🇪', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Allemagne&logo=🇩🇪&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Italie', code: 'ITA', flag: '🇮🇹', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Italie&logo=🇮🇹&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Norvège', code: 'NOR', flag: '🇳🇴', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Norvège&logo=🇳🇴&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Pays-Bas', code: 'NED', flag: '🇳🇱', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Pays-Bas&logo=🇳🇱&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Pologne', code: 'POL', flag: '🇵🇱', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Pologne&logo=🇵🇱&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Portugal', code: 'POR', flag: '🇵🇹', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Portugal&logo=🇵🇹&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Serbie', code: 'SRB', flag: '🇷🇸', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Serbie&logo=🇷🇸&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Suisse', code: 'SUI', flag: '🇨🇭', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Suisse&logo=🇨🇭&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Turquie', code: 'TUR', flag: '🇹🇷', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Turquie&logo=🇹🇷&sport=Football&league=Coupe+du+Monde+2026' },
    
    // 🌍 AFRIQUE (9 qualifiés)
    { name: 'Algérie', code: 'ALG', flag: '🇩🇿', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Algérie&logo=🇩🇿&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Afrique du Sud', code: 'RSA', flag: '🇿🇦', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Afrique+du+Sud&logo=🇿🇦&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Cameroun', code: 'CMR', flag: '🇨🇲', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Cameroun&logo=🇨🇲&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Côte d\'Ivoire', code: 'CIV', flag: '🇨🇮', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Côte+d%27Ivoire&logo=🇨🇮&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Égypte', code: 'EGY', flag: '🇪🇬', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Égypte&logo=🇪🇬&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Ghana', code: 'GHA', flag: '🇬🇭', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Ghana&logo=🇬🇭&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Mali', code: 'MLI', flag: '🇲🇱', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Mali&logo=🇲🇱&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Maroc', code: 'MAR', flag: '🇲🇦', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Maroc&logo=🇲🇦&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Nigeria', code: 'NGA', flag: '🇳🇬', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Nigeria&logo=🇳🇬&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Sénégal', code: 'SEN', flag: '🇸🇳', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Sénégal&logo=🇸🇳&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Tunisie', code: 'TUN', flag: '🇹🇳', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Tunisie&logo=🇹🇳&sport=Football&league=Coupe+du+Monde+2026' },
    
    // 🌏 ASIE (8 qualifiés)
    { name: 'Arabie Saoudite', code: 'KSA', flag: '🇸🇦', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Arabie+Saoudite&logo=🇸🇦&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Australie', code: 'AUS', flag: '🇦🇺', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Australie&logo=🇦🇺&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Chine', code: 'CHN', flag: '🇨🇳', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Chine&logo=🇨🇳&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Corée du Sud', code: 'KOR', flag: '🇰🇷', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Corée+du+Sud&logo=🇰🇷&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Iran', code: 'IRN', flag: '🇮🇷', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Iran&logo=🇮🇷&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Japon', code: 'JPN', flag: '🇯🇵', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Japon&logo=🇯🇵&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Qatar', code: 'QAT', flag: '🇶🇦', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Qatar&logo=🇶🇦&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Ouzbékistan', code: 'UZB', flag: '🇺🇿', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Ouzbékistan&logo=🇺🇿&sport=Football&league=Coupe+du+Monde+2026' },
    
    // 🌎 CONCACAF (6 qualifiés)
    { name: 'Canada', code: 'CAN', flag: '🇨🇦', competition: 'Coupe du Monde 2026', host: true, path: 'app-universal-simple.html?club=Canada&logo=🇨🇦&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Costa Rica', code: 'CRC', flag: '🇨🇷', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Costa+Rica&logo=🇨🇷&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'États-Unis', code: 'USA', flag: '🇺🇸', competition: 'Coupe du Monde 2026', host: true, path: 'app-universal-simple.html?club=États-Unis&logo=🇺🇸&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Jamaïque', code: 'JAM', flag: '🇯🇲', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Jamaïque&logo=🇯🇲&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Mexique', code: 'MEX', flag: '🇲🇽', competition: 'Coupe du Monde 2026', host: true, path: 'app-universal-simple.html?club=Mexique&logo=🇲🇽&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Panama', code: 'PAN', flag: '🇵🇦', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Panama&logo=🇵🇦&sport=Football&league=Coupe+du+Monde+2026' },
    
    // 🇧🇷 AMÉRIQUE DU SUD (6 qualifiés)
    { name: 'Argentine', code: 'ARG', flag: '🇦🇷', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Argentine&logo=🇦🇷&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Brésil', code: 'BRA', flag: '🇧🇷', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Brésil&logo=🇧🇷&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Colombie', code: 'COL', flag: '🇨🇴', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Colombie&logo=🇨🇴&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Équateur', code: 'ECU', flag: '🇪🇨', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Équateur&logo=🇪🇨&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Paraguay', code: 'PAR', flag: '🇵🇾', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Paraguay&logo=🇵🇾&sport=Football&league=Coupe+du+Monde+2026' },
    { name: 'Uruguay', code: 'URU', flag: '🇺🇾', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Uruguay&logo=🇺🇾&sport=Football&league=Coupe+du+Monde+2026' },
    
    // 🇳🇿 OCÉANIE (1 qualifié)
    { name: 'Nouvelle-Zélande', code: 'NZL', flag: '🇳🇿', competition: 'Coupe du Monde 2026', path: 'app-universal-simple.html?club=Nouvelle-Zélande&logo=🇳🇿&sport=Football&league=Coupe+du+Monde+2026' }
];

// ========== CAN 2025 - COUPE D'AFRIQUE DES NATIONS ==========
// Maroc, décembre 2025 - janvier 2026 - 24 équipes qualifiées
const can2025 = [
    { name: 'Maroc', code: 'MAR', flag: '🇲🇦', competition: 'CAN 2025', host: true, path: 'app-universal-simple.html?club=Maroc&logo=🇲🇦&sport=Football&league=CAN+2025' },
    { name: 'Algérie', code: 'ALG', flag: '🇩🇿', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Algérie&logo=🇩🇿&sport=Football&league=CAN+2025' },
    { name: 'Sénégal', code: 'SEN', flag: '🇸🇳', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Sénégal&logo=🇸🇳&sport=Football&league=CAN+2025' },
    { name: 'Tunisie', code: 'TUN', flag: '🇹🇳', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Tunisie&logo=🇹🇳&sport=Football&league=CAN+2025' },
    { name: 'Égypte', code: 'EGY', flag: '🇪🇬', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Égypte&logo=🇪🇬&sport=Football&league=CAN+2025' },
    { name: 'Cameroun', code: 'CMR', flag: '🇨🇲', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Cameroun&logo=🇨🇲&sport=Football&league=CAN+2025' },
    { name: 'Nigeria', code: 'NGA', flag: '🇳🇬', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Nigeria&logo=🇳🇬&sport=Football&league=CAN+2025' },
    { name: 'Côte d\'Ivoire', code: 'CIV', flag: '🇨🇮', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Côte+d%27Ivoire&logo=🇨🇮&sport=Football&league=CAN+2025' },
    { name: 'Ghana', code: 'GHA', flag: '🇬🇭', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Ghana&logo=🇬🇭&sport=Football&league=CAN+2025' },
    { name: 'Mali', code: 'MLI', flag: '🇲🇱', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Mali&logo=🇲🇱&sport=Football&league=CAN+2025' },
    { name: 'Burkina Faso', code: 'BFA', flag: '🇧🇫', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Burkina+Faso&logo=🇧🇫&sport=Football&league=CAN+2025' },
    { name: 'Guinée', code: 'GUI', flag: '🇬🇳', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Guinée&logo=🇬🇳&sport=Football&league=CAN+2025' },
    { name: 'Afrique du Sud', code: 'RSA', flag: '🇿🇦', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Afrique+du+Sud&logo=🇿🇦&sport=Football&league=CAN+2025' },
    { name: 'Cap-Vert', code: 'CPV', flag: '🇨🇻', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Cap-Vert&logo=🇨🇻&sport=Football&league=CAN+2025' },
    { name: 'Gabon', code: 'GAB', flag: '🇬🇦', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Gabon&logo=🇬🇦&sport=Football&league=CAN+2025' },
    { name: 'Zambie', code: 'ZAM', flag: '🇿🇲', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Zambie&logo=🇿🇲&sport=Football&league=CAN+2025' },
    { name: 'RD Congo', code: 'COD', flag: '🇨🇩', competition: 'CAN 2025', path: 'app-universal-simple.html?club=RD+Congo&logo=🇨🇩&sport=Football&league=CAN+2025' },
    { name: 'Congo', code: 'CGO', flag: '🇨🇬', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Congo&logo=🇨🇬&sport=Football&league=CAN+2025' },
    { name: 'Guinée équatoriale', code: 'EQG', flag: '🇬🇶', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Guinée+équatoriale&logo=🇬🇶&sport=Football&league=CAN+2025' },
    { name: 'Mauritanie', code: 'MTN', flag: '🇲🇷', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Mauritanie&logo=🇲🇷&sport=Football&league=CAN+2025' },
    { name: 'Bénin', code: 'BEN', flag: '🇧🇯', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Bénin&logo=🇧🇯&sport=Football&league=CAN+2025' },
    { name: 'Madagascar', code: 'MAD', flag: '🇲🇬', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Madagascar&logo=🇲🇬&sport=Football&league=CAN+2025' },
    { name: 'Sierra Leone', code: 'SLE', flag: '🇸🇱', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Sierra+Leone&logo=🇸🇱&sport=Football&league=CAN+2025' },
    { name: 'Ouganda', code: 'UGA', flag: '🇺🇬', competition: 'CAN 2025', path: 'app-universal-simple.html?club=Ouganda&logo=🇺🇬&sport=Football&league=CAN+2025' }
];

// ========== JOJ 2026 DAKAR - JEUX OLYMPIQUES DE LA JEUNESSE ==========
// Dakar, Sénégal - 31 octobre - 13 novembre 2026
// Football U18 (18 équipes participantes prévues)
const joj2026Dakar = [
    { name: 'Sénégal U18', code: 'SEN', flag: '🇸🇳', competition: 'JOJ 2026 Dakar', host: true, sport: 'Football U18', path: 'app-universal-simple.html?club=Sénégal+U18&logo=🇸🇳&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Nigeria U18', code: 'NGA', flag: '🇳🇬', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Nigeria+U18&logo=🇳🇬&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Cameroun U18', code: 'CMR', flag: '🇨🇲', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Cameroun+U18&logo=🇨🇲&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Ghana U18', code: 'GHA', flag: '🇬🇭', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Ghana+U18&logo=🇬🇭&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Égypte U18', code: 'EGY', flag: '🇪🇬', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Égypte+U18&logo=🇪🇬&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Algérie U18', code: 'ALG', flag: '🇩🇿', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Algérie+U18&logo=🇩🇿&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Maroc U18', code: 'MAR', flag: '🇲🇦', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Maroc+U18&logo=🇲🇦&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Tunisie U18', code: 'TUN', flag: '🇹🇳', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Tunisie+U18&logo=🇹🇳&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Afrique du Sud U18', code: 'RSA', flag: '🇿🇦', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Afrique+du+Sud+U18&logo=🇿🇦&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Mali U18', code: 'MLI', flag: '🇲🇱', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Mali+U18&logo=🇲🇱&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Côte d\'Ivoire U18', code: 'CIV', flag: '🇨🇮', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Côte+d%27Ivoire+U18&logo=🇨🇮&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Kenya U18', code: 'KEN', flag: '🇰🇪', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Kenya+U18&logo=🇰🇪&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Éthiopie U18', code: 'ETH', flag: '🇪🇹', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Éthiopie+U18&logo=🇪🇹&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Zambie U18', code: 'ZAM', flag: '🇿🇲', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Zambie+U18&logo=🇿🇲&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Zimbabwe U18', code: 'ZIM', flag: '🇿🇼', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Zimbabwe+U18&logo=🇿🇼&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Tanzanie U18', code: 'TAN', flag: '🇹🇿', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Tanzanie+U18&logo=🇹🇿&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Angola U18', code: 'ANG', flag: '🇦🇴', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Angola+U18&logo=🇦🇴&sport=Football+U18&league=JOJ+2026+Dakar' },
    { name: 'Mozambique U18', code: 'MOZ', flag: '🇲🇿', competition: 'JOJ 2026 Dakar', sport: 'Football U18', path: 'app-universal-simple.html?club=Mozambique+U18&logo=🇲🇿&sport=Football+U18&league=JOJ+2026+Dakar' }
];

// ========== RÉCAPITULATIF TOTAL ==========
const toutesLesCompetitions2025_2026 = {
    coupeDuMonde: coupeDuMonde2026,
    can: can2025,
    jojDakar: joj2026Dakar,
    total: coupeDuMonde2026.length + can2025.length + joj2026Dakar.length
};

console.log(`✅ ${coupeDuMonde2026.length} équipes Coupe du Monde 2026 chargées`);
console.log(`✅ ${can2025.length} équipes CAN 2025 chargées`);
console.log(`✅ ${joj2026Dakar.length} équipes JOJ 2026 Dakar chargées`);
console.log(`🌍 TOTAL: ${toutesLesCompetitions2025_2026.total} équipes de compétitions 2025-2026`);
