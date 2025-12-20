// ========================================
// RUGBY & VOLLEYBALL - FÉDÉRATIONS & CLUBS
// World Rugby, FIVB, Top 14, Ligue A
// Équipes Masculines & Féminines
// ========================================

// ========== RUGBY - FÉDÉRATIONS ==========
const rugbyFederations = [
    { name: 'France Rugby (FFR)', code: 'FRA', flag: '🇫🇷', sport: 'Rugby', gender: 'Mixte', path: 'app-universal-simple.html?club=France+Rugby&logo=🇫🇷&sport=Rugby&league=World+Rugby' },
    { name: 'Angleterre Rugby (RFU)', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', sport: 'Rugby', gender: 'Mixte', path: 'app-universal-simple.html?club=Angleterre+Rugby&logo=🏴󠁧󠁢󠁥󠁮󠁧󠁿&sport=Rugby&league=World+Rugby' },
    { name: 'Irlande Rugby (IRFU)', code: 'IRL', flag: '🇮🇪', sport: 'Rugby', gender: 'Mixte', path: 'app-universal-simple.html?club=Irlande+Rugby&logo=🇮🇪&sport=Rugby&league=World+Rugby' },
    { name: 'Écosse Rugby (SRU)', code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', sport: 'Rugby', gender: 'Mixte', path: 'app-universal-simple.html?club=Écosse+Rugby&logo=🏴󠁧󠁢󠁳󠁣󠁴󠁿&sport=Rugby&league=World+Rugby' },
    { name: 'Pays de Galles Rugby (WRU)', code: 'WAL', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', sport: 'Rugby', gender: 'Mixte', path: 'app-universal-simple.html?club=Pays+de+Galles+Rugby&logo=🏴󠁧󠁢󠁷󠁬󠁳󠁿&sport=Rugby&league=World+Rugby' },
    { name: 'Nouvelle-Zélande Rugby (NZRU)', code: 'NZL', flag: '🇳🇿', sport: 'Rugby', gender: 'Mixte', path: 'app-universal-simple.html?club=All+Blacks&logo=🇳🇿&sport=Rugby&league=World+Rugby' },
    { name: 'Afrique du Sud Rugby (SARU)', code: 'RSA', flag: '🇿🇦', sport: 'Rugby', gender: 'Mixte', path: 'app-universal-simple.html?club=Springboks&logo=🇿🇦&sport=Rugby&league=World+Rugby' },
    { name: 'Australie Rugby (RA)', code: 'AUS', flag: '🇦🇺', sport: 'Rugby', gender: 'Mixte', path: 'app-universal-simple.html?club=Wallabies&logo=🇦🇺&sport=Rugby&league=World+Rugby' },
    { name: 'Argentine Rugby (UAR)', code: 'ARG', flag: '🇦🇷', sport: 'Rugby', gender: 'Mixte', path: 'app-universal-simple.html?club=Pumas&logo=🇦🇷&sport=Rugby&league=World+Rugby' },
    { name: 'Japon Rugby (JRFU)', code: 'JPN', flag: '🇯🇵', sport: 'Rugby', gender: 'Mixte', path: 'app-universal-simple.html?club=Japon+Rugby&logo=🇯🇵&sport=Rugby&league=World+Rugby' },
    { name: 'Italie Rugby (FIR)', code: 'ITA', flag: '🇮🇹', sport: 'Rugby', gender: 'Mixte', path: 'app-universal-simple.html?club=Italie+Rugby&logo=🇮🇹&sport=Rugby&league=World+Rugby' },
    { name: 'Fidji Rugby (FRU)', code: 'FIJ', flag: '🇫🇯', sport: 'Rugby', gender: 'Mixte', path: 'app-universal-simple.html?club=Fidji+Rugby&logo=🇫🇯&sport=Rugby&league=World+Rugby' }
];

// ========== TOP 14 RUGBY - Hommes (14 clubs) ==========
const top14Rugby = [
    { name: 'Stade Toulousain', logo: '🏉', league: 'Top 14', gender: 'Hommes', path: 'app-universal-simple.html?club=Stade+Toulousain&logo=🏉&sport=Rugby&league=Top+14' },
    { name: 'Stade Rochelais', logo: '🏉', league: 'Top 14', gender: 'Hommes', path: 'app-universal-simple.html?club=La+Rochelle&logo=🏉&sport=Rugby&league=Top+14' },
    { name: 'Union Bordeaux-Bègles', logo: '🏉', league: 'Top 14', gender: 'Hommes', path: 'app-universal-simple.html?club=UBB&logo=🏉&sport=Rugby&league=Top+14' },
    { name: 'ASM Clermont Auvergne', logo: '🏉', league: 'Top 14', gender: 'Hommes', path: 'app-universal-simple.html?club=Clermont&logo=🏉&sport=Rugby&league=Top+14' },
    { name: 'Racing 92', logo: '🏉', league: 'Top 14', gender: 'Hommes', path: 'app-universal-simple.html?club=Racing+92&logo=🏉&sport=Rugby&league=Top+14' },
    { name: 'Stade Français Paris', logo: '🏉', league: 'Top 14', gender: 'Hommes', path: 'app-universal-simple.html?club=Stade+Francais&logo=🏉&sport=Rugby&league=Top+14' },
    { name: 'LOU Rugby', logo: '🏉', league: 'Top 14', gender: 'Hommes', path: 'app-universal-simple.html?club=Lyon+Rugby&logo=🏉&sport=Rugby&league=Top+14' },
    { name: 'Montpellier Hérault Rugby', logo: '🏉', league: 'Top 14', gender: 'Hommes', path: 'app-universal-simple.html?club=Montpellier+Rugby&logo=🏉&sport=Rugby&league=Top+14' },
    { name: 'Castres Olympique', logo: '🏉', league: 'Top 14', gender: 'Hommes', path: 'app-universal-simple.html?club=Castres&logo=🏉&sport=Rugby&league=Top+14' },
    { name: 'RC Toulon', logo: '🏉', league: 'Top 14', gender: 'Hommes', path: 'app-universal-simple.html?club=Toulon&logo=🏉&sport=Rugby&league=Top+14' },
    { name: 'Section Paloise', logo: '🏉', league: 'Top 14', gender: 'Hommes', path: 'app-universal-simple.html?club=Pau&logo=🏉&sport=Rugby&league=Top+14' },
    { name: 'Aviron Bayonnais', logo: '🏉', league: 'Top 14', gender: 'Hommes', path: 'app-universal-simple.html?club=Bayonne&logo=🏉&sport=Rugby&league=Top+14' },
    { name: 'USA Perpignan', logo: '🏉', league: 'Top 14', gender: 'Hommes', path: 'app-universal-simple.html?club=Perpignan&logo=🏉&sport=Rugby&league=Top+14' },
    { name: 'Vannes Olympique Club', logo: '🏉', league: 'Top 14', gender: 'Hommes', path: 'app-universal-simple.html?club=Vannes&logo=🏉&sport=Rugby&league=Top+14' }
];

// ========== ÉLITE 1 RUGBY FÉMININ (10 clubs) ==========
const elite1RugbyFeminin = [
    { name: 'Stade Toulousain Féminin', logo: '🏉', league: 'Élite 1 Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Toulouse+Rugby+Feminin&logo=🏉&sport=Rugby+Feminin&league=Elite+1' },
    { name: 'Stade Bordelais Féminin', logo: '🏉', league: 'Élite 1 Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Bordeaux+Rugby+Feminin&logo=🏉&sport=Rugby+Feminin&league=Elite+1' },
    { name: 'ASM Romagnat', logo: '🏉', league: 'Élite 1 Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Romagnat+Feminin&logo=🏉&sport=Rugby+Feminin&league=Elite+1' },
    { name: 'Blagnac SCR Féminin', logo: '🏉', league: 'Élite 1 Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Blagnac+Feminin&logo=🏉&sport=Rugby+Feminin&league=Elite+1' },
    { name: 'Bobigny Féminin', logo: '🏉', league: 'Élite 1 Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Bobigny+Feminin&logo=🏉&sport=Rugby+Feminin&league=Elite+1' },
    { name: 'Lyon OU Féminin', logo: '🏉', league: 'Élite 1 Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Lyon+OU+Feminin&logo=🏉&sport=Rugby+Feminin&league=Elite+1' },
    { name: 'Lille Métropole RC Féminin', logo: '🏉', league: 'Élite 1 Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Lille+Rugby+Feminin&logo=🏉&sport=Rugby+Feminin&league=Elite+1' },
    { name: 'Montpellier Rugby Féminin', logo: '🏉', league: 'Élite 1 Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Montpellier+Feminin&logo=🏉&sport=Rugby+Feminin&league=Elite+1' },
    { name: 'Stade Rennais Rugby Féminin', logo: '🏉', league: 'Élite 1 Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Rennes+Rugby+Feminin&logo=🏉&sport=Rugby+Feminin&league=Elite+1' },
    { name: 'Chilly-Mazarin Féminin', logo: '🏉', league: 'Élite 1 Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Chilly+Mazarin&logo=🏉&sport=Rugby+Feminin&league=Elite+1' }
];

// ========== VOLLEYBALL - FÉDÉRATIONS ==========
const volleyballFederations = [
    { name: 'France Volleyball (FFVB)', code: 'FRA', flag: '🇫🇷', sport: 'Volleyball', gender: 'Mixte', path: 'app-universal-simple.html?club=France+Volleyball&logo=🇫🇷&sport=Volleyball&league=FIVB' },
    { name: 'Brésil Volleyball (CBV)', code: 'BRA', flag: '🇧🇷', sport: 'Volleyball', gender: 'Mixte', path: 'app-universal-simple.html?club=Brésil+Volleyball&logo=🇧🇷&sport=Volleyball&league=FIVB' },
    { name: 'USA Volleyball (USAV)', code: 'USA', flag: '🇺🇸', sport: 'Volleyball', gender: 'Mixte', path: 'app-universal-simple.html?club=USA+Volleyball&logo=🇺🇸&sport=Volleyball&league=FIVB' },
    { name: 'Russie Volleyball', code: 'RUS', flag: '🇷🇺', sport: 'Volleyball', gender: 'Mixte', path: 'app-universal-simple.html?club=Russie+Volleyball&logo=🇷🇺&sport=Volleyball&league=FIVB' },
    { name: 'Italie Volleyball (FIPAV)', code: 'ITA', flag: '🇮🇹', sport: 'Volleyball', gender: 'Mixte', path: 'app-universal-simple.html?club=Italie+Volleyball&logo=🇮🇹&sport=Volleyball&league=FIVB' },
    { name: 'Pologne Volleyball (PZPS)', code: 'POL', flag: '🇵🇱', sport: 'Volleyball', gender: 'Mixte', path: 'app-universal-simple.html?club=Pologne+Volleyball&logo=🇵🇱&sport=Volleyball&league=FIVB' },
    { name: 'Chine Volleyball', code: 'CHN', flag: '🇨🇳', sport: 'Volleyball', gender: 'Mixte', path: 'app-universal-simple.html?club=Chine+Volleyball&logo=🇨🇳&sport=Volleyball&league=FIVB' },
    { name: 'Serbie Volleyball', code: 'SRB', flag: '🇷🇸', sport: 'Volleyball', gender: 'Mixte', path: 'app-universal-simple.html?club=Serbie+Volleyball&logo=🇷🇸&sport=Volleyball&league=FIVB' },
    { name: 'Japon Volleyball', code: 'JPN', flag: '🇯🇵', sport: 'Volleyball', gender: 'Mixte', path: 'app-universal-simple.html?club=Japon+Volleyball&logo=🇯🇵&sport=Volleyball&league=FIVB' },
    { name: 'Argentine Volleyball', code: 'ARG', flag: '🇦🇷', sport: 'Volleyball', gender: 'Mixte', path: 'app-universal-simple.html?club=Argentine+Volleyball&logo=🇦🇷&sport=Volleyball&league=FIVB' }
];

// ========== LIGUE A VOLLEYBALL MASCULIN (12 clubs) ==========
const ligueAVolleyHommes = [
    { name: 'Tours VB', logo: '🏐', league: 'Ligue A Masculine', gender: 'Hommes', path: 'app-universal-simple.html?club=Tours+VB&logo=🏐&sport=Volleyball&league=Ligue+A' },
    { name: 'Chaumont VB 52', logo: '🏐', league: 'Ligue A Masculine', gender: 'Hommes', path: 'app-universal-simple.html?club=Chaumont+VB&logo=🏐&sport=Volleyball&league=Ligue+A' },
    { name: 'AS Cannes Volley-Ball', logo: '🏐', league: 'Ligue A Masculine', gender: 'Hommes', path: 'app-universal-simple.html?club=Cannes+VB&logo=🏐&sport=Volleyball&league=Ligue+A' },
    { name: 'Montpellier Volley UC', logo: '🏐', league: 'Ligue A Masculine', gender: 'Hommes', path: 'app-universal-simple.html?club=Montpellier+VB&logo=🏐&sport=Volleyball&league=Ligue+A' },
    { name: 'Paris Volley', logo: '🏐', league: 'Ligue A Masculine', gender: 'Hommes', path: 'app-universal-simple.html?club=Paris+Volley&logo=🏐&sport=Volleyball&league=Ligue+A' },
    { name: 'Tourcoing Lille Métropole', logo: '🏐', league: 'Ligue A Masculine', gender: 'Hommes', path: 'app-universal-simple.html?club=Tourcoing+VB&logo=🏐&sport=Volleyball&league=Ligue+A' },
    { name: 'Nantes Rezé Métropole Volley', logo: '🏐', league: 'Ligue A Masculine', gender: 'Hommes', path: 'app-universal-simple.html?club=Nantes+VB&logo=🏐&sport=Volleyball&league=Ligue+A' },
    { name: 'Ajaccio Volley-Ball', logo: '🏐', league: 'Ligue A Masculine', gender: 'Hommes', path: 'app-universal-simple.html?club=Ajaccio+VB&logo=🏐&sport=Volleyball&league=Ligue+A' },
    { name: 'Poitiers Volley-Ball', logo: '🏐', league: 'Ligue A Masculine', gender: 'Hommes', path: 'app-universal-simple.html?club=Poitiers+VB&logo=🏐&sport=Volleyball&league=Ligue+A' },
    { name: 'Arago de Sète', logo: '🏐', league: 'Ligue A Masculine', gender: 'Hommes', path: 'app-universal-simple.html?club=Sete+VB&logo=🏐&sport=Volleyball&league=Ligue+A' },
    { name: 'Nice Volley-Ball', logo: '🏐', league: 'Ligue A Masculine', gender: 'Hommes', path: 'app-universal-simple.html?club=Nice+VB&logo=🏐&sport=Volleyball&league=Ligue+A' },
    { name: 'Plessis-Robinson Volley', logo: '🏐', league: 'Ligue A Masculine', gender: 'Hommes', path: 'app-universal-simple.html?club=Plessis+Robinson&logo=🏐&sport=Volleyball&league=Ligue+A' }
];

// ========== LIGUE A VOLLEYBALL FÉMININ (12 clubs) ==========
const ligueAVolleyFemmes = [
    { name: 'RC Cannes Volley-Ball', logo: '🏐', league: 'Ligue A Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Cannes+VB+Feminin&logo=🏐&sport=Volleyball+Feminin&league=Ligue+A' },
    { name: 'Le Cannet Rocheville Volley', logo: '🏐', league: 'Ligue A Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Le+Cannet+VB&logo=🏐&sport=Volleyball+Feminin&league=Ligue+A' },
    { name: 'Volero Le Cannet', logo: '🏐', league: 'Ligue A Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Volero+Le+Cannet&logo=🏐&sport=Volleyball+Feminin&league=Ligue+A' },
    { name: 'Mulhouse Alsace Volley', logo: '🏐', league: 'Ligue A Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Mulhouse+VB&logo=🏐&sport=Volleyball+Feminin&league=Ligue+A' },
    { name: 'Béziers Volley', logo: '🏐', league: 'Ligue A Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Béziers+VB&logo=🏐&sport=Volleyball+Feminin&league=Ligue+A' },
    { name: 'Nantes Rezé Métropole Volley', logo: '🏐', league: 'Ligue A Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Nantes+VB+Feminin&logo=🏐&sport=Volleyball+Feminin&league=Ligue+A' },
    { name: 'Venelles Volley-Ball', logo: '🏐', league: 'Ligue A Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Venelles+VB&logo=🏐&sport=Volleyball+Feminin&league=Ligue+A' },
    { name: 'Chamalières Volley', logo: '🏐', league: 'Ligue A Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Chamalières+VB&logo=🏐&sport=Volleyball+Feminin&league=Ligue+A' },
    { name: 'France Avenir 2024', logo: '🏐', league: 'Ligue A Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=France+Avenir+2024&logo=🏐&sport=Volleyball+Feminin&league=Ligue+A' },
    { name: 'Quimper Volley 29', logo: '🏐', league: 'Ligue A Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Quimper+VB&logo=🏐&sport=Volleyball+Feminin&league=Ligue+A' },
    { name: 'Vandoeuvre Nancy Volley-Ball', logo: '🏐', league: 'Ligue A Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Nancy+VB&logo=🏐&sport=Volleyball+Feminin&league=Ligue+A' },
    { name: 'Saint-Raphaël Var Volley-Ball', logo: '🏐', league: 'Ligue A Féminine', gender: 'Femmes', path: 'app-universal-simple.html?club=Saint-Raphael+VB&logo=🏐&sport=Volleyball+Feminin&league=Ligue+A' }
];

// ========== RÉCAPITULATIF ==========
const tousLesClubsRugby = [...top14Rugby, ...elite1RugbyFeminin, ...rugbyFederations];
const tousLesClubsVolley = [...ligueAVolleyHommes, ...ligueAVolleyFemmes, ...volleyballFederations];

console.log('✅ Rugby chargé');
console.log('🏉 Top 14 (H):', top14Rugby.length, 'clubs');
console.log('🏉 Élite 1 (F):', elite1RugbyFeminin.length, 'clubs');
console.log('🌍 Fédérations Rugby:', rugbyFederations.length);
console.log('🏉 TOTAL RUGBY:', tousLesClubsRugby.length, 'équipes');

console.log('✅ Volleyball chargé');
console.log('🏐 Ligue A (H):', ligueAVolleyHommes.length, 'clubs');
console.log('🏐 Ligue A (F):', ligueAVolleyFemmes.length, 'clubs');
console.log('🌍 Fédérations Volley:', volleyballFederations.length);
console.log('🏐 TOTAL VOLLEYBALL:', tousLesClubsVolley.length, 'équipes');
