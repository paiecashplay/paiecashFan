// ⚽🇪🇺 FOOTBALL EUROPÉEN - CHAMPIONNATS MAJEURS
// Clubs des 5 grands championnats européens + autres ligues majeures
// Source: Sites officiels des clubs et ligues (2025)

const footballEuropeenData = [
    // ========== 🏴󠁧󠁢󠁥󠁮󠁧󠁿 ANGLETERRE - PREMIER LEAGUE ==========
    {
        name: 'Arsenal FC',
        nameEnglish: 'Arsenal FC',
        logo: '🔴⚪',
        league: 'Premier League',
        country: 'Angleterre',
        colors: { primary: '#EF0107', secondary: '#FFFFFF' },
        stadium: 'Emirates Stadium',
        founded: 1886,
        website: 'https://www.arsenal.com',
        path: 'app-universal-simple.html?club=arsenal-fc'
    },
    {
        name: 'Liverpool FC',
        nameEnglish: 'Liverpool FC',
        logo: '🔴',
        league: 'Premier League',
        country: 'Angleterre',
        colors: { primary: '#C8102E', secondary: '#00B2A9' },
        stadium: 'Anfield',
        founded: 1892,
        website: 'https://www.liverpoolfc.com',
        path: 'app-universal-simple.html?club=liverpool-fc'
    },
    {
        name: 'Manchester City',
        nameEnglish: 'Manchester City',
        logo: '🔵⚪',
        league: 'Premier League',
        country: 'Angleterre',
        colors: { primary: '#6CABDD', secondary: '#1C2C5B' },
        stadium: 'Etihad Stadium',
        founded: 1880,
        website: 'https://www.mancity.com',
        path: 'app-universal-simple.html?club=manchester-city'
    },
    {
        name: 'Manchester United',
        nameEnglish: 'Manchester United',
        logo: '🔴⚫',
        league: 'Premier League',
        country: 'Angleterre',
        colors: { primary: '#DA291C', secondary: '#FBE122' },
        stadium: 'Old Trafford',
        founded: 1878,
        website: 'https://www.manutd.com',
        path: 'app-universal-simple.html?club=manchester-united'
    },
    {
        name: 'Chelsea FC',
        nameEnglish: 'Chelsea FC',
        logo: '🔵⚪',
        league: 'Premier League',
        country: 'Angleterre',
        colors: { primary: '#034694', secondary: '#FFFFFF' },
        stadium: 'Stamford Bridge',
        founded: 1905,
        website: 'https://www.chelseafc.com',
        path: 'app-universal-simple.html?club=chelsea-fc'
    },
    {
        name: 'Tottenham Hotspur',
        nameEnglish: 'Tottenham Hotspur',
        logo: '⚪🔵',
        league: 'Premier League',
        country: 'Angleterre',
        colors: { primary: '#132257', secondary: '#FFFFFF' },
        stadium: 'Tottenham Hotspur Stadium',
        founded: 1882,
        website: 'https://www.tottenhamhotspur.com',
        path: 'app-universal-simple.html?club=tottenham-hotspur'
    },
    {
        name: 'Newcastle United',
        nameEnglish: 'Newcastle United',
        logo: '⚫⚪',
        league: 'Premier League',
        country: 'Angleterre',
        colors: { primary: '#241F20', secondary: '#FFFFFF' },
        stadium: 'St James\' Park',
        founded: 1892,
        website: 'https://www.nufc.co.uk',
        path: 'app-universal-simple.html?club=newcastle-united'
    },
    {
        name: 'Aston Villa',
        nameEnglish: 'Aston Villa',
        logo: '🟣🔵',
        league: 'Premier League',
        country: 'Angleterre',
        colors: { primary: '#670E36', secondary: '#95BFE5' },
        stadium: 'Villa Park',
        founded: 1874,
        website: 'https://www.avfc.co.uk',
        path: 'app-universal-simple.html?club=aston-villa'
    },

    // ========== 🇩🇪 ALLEMAGNE - BUNDESLIGA ==========
    {
        name: 'Bayern Munich',
        nameEnglish: 'FC Bayern München',
        logo: '🔴⚪',
        league: 'Bundesliga',
        country: 'Allemagne',
        colors: { primary: '#DC052D', secondary: '#0066B2' },
        stadium: 'Allianz Arena',
        founded: 1900,
        website: 'https://fcbayern.com',
        path: 'app-universal-simple.html?club=bayern-munich'
    },
    {
        name: 'Borussia Dortmund',
        nameEnglish: 'Borussia Dortmund',
        logo: '🟡⚫',
        league: 'Bundesliga',
        country: 'Allemagne',
        colors: { primary: '#FDE100', secondary: '#000000' },
        stadium: 'Signal Iduna Park',
        founded: 1909,
        website: 'https://www.bvb.de',
        path: 'app-universal-simple.html?club=borussia-dortmund'
    },
    {
        name: 'RB Leipzig',
        nameEnglish: 'RB Leipzig',
        logo: '🔴⚪',
        league: 'Bundesliga',
        country: 'Allemagne',
        colors: { primary: '#DD0741', secondary: '#FFFFFF' },
        stadium: 'Red Bull Arena',
        founded: 2009,
        website: 'https://www.dierotenbullen.com',
        path: 'app-universal-simple.html?club=rb-leipzig'
    },
    {
        name: 'Bayer Leverkusen',
        nameEnglish: 'Bayer 04 Leverkusen',
        logo: '🔴⚫',
        league: 'Bundesliga',
        country: 'Allemagne',
        colors: { primary: '#E32221', secondary: '#000000' },
        stadium: 'BayArena',
        founded: 1904,
        website: 'https://www.bayer04.de',
        path: 'app-universal-simple.html?club=bayer-leverkusen'
    },
    {
        name: 'Borussia Mönchengladbach',
        nameEnglish: 'Borussia Mönchengladbach',
        logo: '⚫⚪🟢',
        league: 'Bundesliga',
        country: 'Allemagne',
        colors: { primary: '#000000', secondary: '#00B140' },
        stadium: 'Borussia-Park',
        founded: 1900,
        website: 'https://www.borussia.de',
        path: 'app-universal-simple.html?club=borussia-monchengladbach'
    },
    {
        name: 'VfB Stuttgart',
        nameEnglish: 'VfB Stuttgart',
        logo: '⚪🔴',
        league: 'Bundesliga',
        country: 'Allemagne',
        colors: { primary: '#FFFFFF', secondary: '#E32219' },
        stadium: 'Mercedes-Benz Arena',
        founded: 1893,
        website: 'https://www.vfb.de',
        path: 'app-universal-simple.html?club=vfb-stuttgart'
    },

    // ========== 🇮🇹 ITALIE - SERIE A ==========
    {
        name: 'Juventus Turin',
        nameEnglish: 'Juventus FC',
        logo: '⚫⚪',
        league: 'Serie A',
        country: 'Italie',
        colors: { primary: '#000000', secondary: '#FFFFFF' },
        stadium: 'Allianz Stadium',
        founded: 1897,
        website: 'https://www.juventus.com',
        path: 'app-universal-simple.html?club=juventus-turin'
    },
    {
        name: 'Inter Milan',
        nameEnglish: 'FC Internazionale Milano',
        logo: '🔵⚫',
        league: 'Serie A',
        country: 'Italie',
        colors: { primary: '#0068A8', secondary: '#000000' },
        stadium: 'San Siro',
        founded: 1908,
        website: 'https://www.inter.it',
        path: 'app-universal-simple.html?club=inter-milan'
    },
    {
        name: 'AC Milan',
        nameEnglish: 'AC Milan',
        logo: '🔴⚫',
        league: 'Serie A',
        country: 'Italie',
        colors: { primary: '#FB090B', secondary: '#000000' },
        stadium: 'San Siro',
        founded: 1899,
        website: 'https://www.acmilan.com',
        path: 'app-universal-simple.html?club=ac-milan'
    },
    {
        name: 'AS Roma',
        nameEnglish: 'AS Roma',
        logo: '🟡🔴',
        league: 'Serie A',
        country: 'Italie',
        colors: { primary: '#C19A6B', secondary: '#8B2342' },
        stadium: 'Stadio Olimpico',
        founded: 1927,
        website: 'https://www.asroma.com',
        path: 'app-universal-simple.html?club=as-roma'
    },
    {
        name: 'SSC Napoli',
        nameEnglish: 'SSC Napoli',
        logo: '🔵⚪',
        league: 'Serie A',
        country: 'Italie',
        colors: { primary: '#037BC7', secondary: '#FFFFFF' },
        stadium: 'Stadio Diego Armando Maradona',
        founded: 1926,
        website: 'https://www.sscnapoli.it',
        path: 'app-universal-simple.html?club=ssc-napoli'
    },
    {
        name: 'Lazio Rome',
        nameEnglish: 'SS Lazio',
        logo: '🔵⚪',
        league: 'Serie A',
        country: 'Italie',
        colors: { primary: '#87D8F7', secondary: '#FFFFFF' },
        stadium: 'Stadio Olimpico',
        founded: 1900,
        website: 'https://www.sslazio.it',
        path: 'app-universal-simple.html?club=lazio-rome'
    },
    {
        name: 'Atalanta Bergame',
        nameEnglish: 'Atalanta BC',
        logo: '🔵⚫',
        league: 'Serie A',
        country: 'Italie',
        colors: { primary: '#1D2951', secondary: '#1AA2DB' },
        stadium: 'Gewiss Stadium',
        founded: 1907,
        website: 'https://www.atalanta.it',
        path: 'app-universal-simple.html?club=atalanta-bergame'
    },

    // ========== 🇪🇸 ESPAGNE - LA LIGA ==========
    {
        name: 'Real Madrid',
        nameEnglish: 'Real Madrid CF',
        logo: '⚪🟡',
        league: 'La Liga',
        country: 'Espagne',
        colors: { primary: '#FFFFFF', secondary: '#00529F' },
        stadium: 'Santiago Bernabéu',
        founded: 1902,
        website: 'https://www.realmadrid.com',
        path: 'app-universal-simple.html?club=real-madrid'
    },
    {
        name: 'FC Barcelone',
        nameEnglish: 'FC Barcelona',
        logo: '🔵🔴',
        league: 'La Liga',
        country: 'Espagne',
        colors: { primary: '#004D98', secondary: '#A50044' },
        stadium: 'Camp Nou',
        founded: 1899,
        website: 'https://www.fcbarcelona.com',
        path: 'app-universal-simple.html?club=fc-barcelone'
    },
    {
        name: 'Atlético Madrid',
        nameEnglish: 'Club Atlético de Madrid',
        logo: '🔴⚪',
        league: 'La Liga',
        country: 'Espagne',
        colors: { primary: '#CE3524', secondary: '#FFFFFF' },
        stadium: 'Cívitas Metropolitano',
        founded: 1903,
        website: 'https://www.atleticodemadrid.com',
        path: 'app-universal-simple.html?club=atletico-madrid'
    },
    {
        name: 'Séville FC',
        nameEnglish: 'Sevilla FC',
        logo: '⚪🔴',
        league: 'La Liga',
        country: 'Espagne',
        colors: { primary: '#FFFFFF', secondary: '#F43333' },
        stadium: 'Ramón Sánchez Pizjuán',
        founded: 1890,
        website: 'https://www.sevillafc.es',
        path: 'app-universal-simple.html?club=seville-fc'
    },
    {
        name: 'Real Sociedad',
        nameEnglish: 'Real Sociedad',
        logo: '🔵⚪',
        league: 'La Liga',
        country: 'Espagne',
        colors: { primary: '#0057AE', secondary: '#FFFFFF' },
        stadium: 'Anoeta',
        founded: 1909,
        website: 'https://www.realsociedad.eus',
        path: 'app-universal-simple.html?club=real-sociedad'
    },
    {
        name: 'Villarreal CF',
        nameEnglish: 'Villarreal CF',
        logo: '🟡🔵',
        league: 'La Liga',
        country: 'Espagne',
        colors: { primary: '#FFE667', secondary: '#005187' },
        stadium: 'Estadio de la Cerámica',
        founded: 1923,
        website: 'https://www.villarrealcf.es',
        path: 'app-universal-simple.html?club=villarreal-cf'
    },

    // ========== 🇫🇷 FRANCE - LIGUE 1 (Top Clubs Européens) ==========
    {
        name: 'Paris Saint-Germain',
        nameEnglish: 'Paris Saint-Germain',
        logo: '🔵🔴',
        league: 'Ligue 1',
        country: 'France',
        colors: { primary: '#004170', secondary: '#DA020E' },
        stadium: 'Parc des Princes',
        founded: 1970,
        website: 'https://www.psg.fr',
        path: 'app-universal-simple.html?club=paris-saint-germain'
    },
    {
        name: 'Olympique de Marseille',
        nameEnglish: 'Olympique de Marseille',
        logo: '⚪🔵',
        league: 'Ligue 1',
        country: 'France',
        colors: { primary: '#2FAEE0', secondary: '#FFFFFF' },
        stadium: 'Stade Vélodrome',
        founded: 1899,
        website: 'https://www.om.fr',
        path: 'app-universal-simple.html?club=olympique-marseille'
    },
    {
        name: 'Olympique Lyonnais',
        nameEnglish: 'Olympique Lyonnais',
        logo: '🔴🔵⚪',
        league: 'Ligue 1',
        country: 'France',
        colors: { primary: '#DA020E', secondary: '#004170' },
        stadium: 'Groupama Stadium',
        founded: 1950,
        website: 'https://www.ol.fr',
        path: 'app-universal-simple.html?club=olympique-lyonnais'
    },
    {
        name: 'AS Monaco',
        nameEnglish: 'AS Monaco FC',
        logo: '🔴⚪',
        league: 'Ligue 1',
        country: 'France',
        colors: { primary: '#E4002B', secondary: '#FFFFFF' },
        stadium: 'Stade Louis II',
        founded: 1924,
        website: 'https://www.asmonaco.com',
        path: 'app-universal-simple.html?club=as-monaco'
    },
    {
        name: 'LOSC Lille',
        nameEnglish: 'LOSC Lille',
        logo: '🔴⚪',
        league: 'Ligue 1',
        country: 'France',
        colors: { primary: '#E4002B', secondary: '#FFFFFF' },
        stadium: 'Stade Pierre-Mauroy',
        founded: 1944,
        website: 'https://www.losc.fr',
        path: 'app-universal-simple.html?club=losc-lille'
    },

    // ========== 🇵🇹 PORTUGAL - PRIMEIRA LIGA ==========
    {
        name: 'Benfica Lisbonne',
        nameEnglish: 'SL Benfica',
        logo: '🔴⚪',
        league: 'Primeira Liga',
        country: 'Portugal',
        colors: { primary: '#E30613', secondary: '#FFFFFF' },
        stadium: 'Estádio da Luz',
        founded: 1904,
        website: 'https://www.slbenfica.pt',
        path: 'app-universal-simple.html?club=benfica-lisbonne'
    },
    {
        name: 'FC Porto',
        nameEnglish: 'FC Porto',
        logo: '🔵⚪',
        league: 'Primeira Liga',
        country: 'Portugal',
        colors: { primary: '#003F8F', secondary: '#FFFFFF' },
        stadium: 'Estádio do Dragão',
        founded: 1893,
        website: 'https://www.fcporto.pt',
        path: 'app-universal-simple.html?club=fc-porto'
    },
    {
        name: 'Sporting CP',
        nameEnglish: 'Sporting CP',
        logo: '🟢⚪',
        league: 'Primeira Liga',
        country: 'Portugal',
        colors: { primary: '#006E3C', secondary: '#FFFFFF' },
        stadium: 'Estádio José Alvalade',
        founded: 1906,
        website: 'https://www.sporting.pt',
        path: 'app-universal-simple.html?club=sporting-cp'
    },

    // ========== 🇳🇱 PAYS-BAS - EREDIVISIE ==========
    {
        name: 'Ajax Amsterdam',
        nameEnglish: 'AFC Ajax',
        logo: '🔴⚪',
        league: 'Eredivisie',
        country: 'Pays-Bas',
        colors: { primary: '#D2122E', secondary: '#FFFFFF' },
        stadium: 'Johan Cruyff Arena',
        founded: 1900,
        website: 'https://www.ajax.nl',
        path: 'app-universal-simple.html?club=ajax-amsterdam'
    },
    {
        name: 'PSV Eindhoven',
        nameEnglish: 'PSV Eindhoven',
        logo: '🔴⚪',
        league: 'Eredivisie',
        country: 'Pays-Bas',
        colors: { primary: '#ED1C24', secondary: '#FFFFFF' },
        stadium: 'Philips Stadion',
        founded: 1913,
        website: 'https://www.psv.nl',
        path: 'app-universal-simple.html?club=psv-eindhoven'
    },
    {
        name: 'Feyenoord Rotterdam',
        nameEnglish: 'Feyenoord',
        logo: '🔴⚪',
        league: 'Eredivisie',
        country: 'Pays-Bas',
        colors: { primary: '#E30613', secondary: '#FFFFFF' },
        stadium: 'De Kuip',
        founded: 1908,
        website: 'https://www.feyenoord.nl',
        path: 'app-universal-simple.html?club=feyenoord-rotterdam'
    },

    // ========== 🇧🇪 BELGIQUE - PRO LEAGUE ==========
    {
        name: 'Club Bruges',
        nameEnglish: 'Club Brugge KV',
        logo: '🔵⚫',
        league: 'Pro League',
        country: 'Belgique',
        colors: { primary: '#004EA3', secondary: '#000000' },
        stadium: 'Jan Breydel Stadium',
        founded: 1891,
        website: 'https://www.clubbrugge.be',
        path: 'app-universal-simple.html?club=club-bruges'
    },
    {
        name: 'RSC Anderlecht',
        nameEnglish: 'RSC Anderlecht',
        logo: '🟣⚪',
        league: 'Pro League',
        country: 'Belgique',
        colors: { primary: '#6B2B8A', secondary: '#FFFFFF' },
        stadium: 'Lotto Park',
        founded: 1908,
        website: 'https://www.rsca.be',
        path: 'app-universal-simple.html?club=rsc-anderlecht'
    },

    // ========== 🏴󠁧󠁢󠁳󠁣󠁴󠁿 ÉCOSSE - SCOTTISH PREMIERSHIP ==========
    {
        name: 'Celtic Glasgow',
        nameEnglish: 'Celtic FC',
        logo: '🟢⚪',
        league: 'Scottish Premiership',
        country: 'Écosse',
        colors: { primary: '#00934E', secondary: '#FFFFFF' },
        stadium: 'Celtic Park',
        founded: 1887,
        website: 'https://www.celticfc.com',
        path: 'app-universal-simple.html?club=celtic-glasgow'
    },
    {
        name: 'Rangers Glasgow',
        nameEnglish: 'Rangers FC',
        logo: '🔵🔴⚪',
        league: 'Scottish Premiership',
        country: 'Écosse',
        colors: { primary: '#0050A8', secondary: '#E30713' },
        stadium: 'Ibrox Stadium',
        founded: 1872,
        website: 'https://www.rangers.co.uk',
        path: 'app-universal-simple.html?club=rangers-glasgow'
    },

    // ========== 🇹🇷 TURQUIE - SÜPER LIG ==========
    {
        name: 'Galatasaray',
        nameEnglish: 'Galatasaray SK',
        logo: '🟡🔴',
        league: 'Süper Lig',
        country: 'Turquie',
        colors: { primary: '#FDB913', secondary: '#C8102E' },
        stadium: 'Türk Telekom Stadium',
        founded: 1905,
        website: 'https://www.galatasaray.org',
        path: 'app-universal-simple.html?club=galatasaray'
    },
    {
        name: 'Fenerbahçe',
        nameEnglish: 'Fenerbahçe SK',
        logo: '🟡🔵',
        league: 'Süper Lig',
        country: 'Turquie',
        colors: { primary: '#FED500', secondary: '#003083' },
        stadium: 'Şükrü Saracoğlu Stadium',
        founded: 1907,
        website: 'https://www.fenerbahce.org',
        path: 'app-universal-simple.html?club=fenerbahce'
    },
    {
        name: 'Beşiktaş',
        nameEnglish: 'Beşiktaş JK',
        logo: '⚫⚪',
        league: 'Süper Lig',
        country: 'Turquie',
        colors: { primary: '#000000', secondary: '#FFFFFF' },
        stadium: 'Vodafone Park',
        founded: 1903,
        website: 'https://www.bjk.com.tr',
        path: 'app-universal-simple.html?club=besiktas'
    }
];

// Statistiques des championnats
const championshipsStats = {
    'Premier League': { country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Angleterre', clubs: 8, emoji: '👑' },
    'Bundesliga': { country: '🇩🇪 Allemagne', clubs: 6, emoji: '⚡' },
    'Serie A': { country: '🇮🇹 Italie', clubs: 7, emoji: '🏆' },
    'La Liga': { country: '🇪🇸 Espagne', clubs: 6, emoji: '⭐' },
    'Ligue 1': { country: '🇫🇷 France', clubs: 5, emoji: '🔵' },
    'Primeira Liga': { country: '🇵🇹 Portugal', clubs: 3, emoji: '🦅' },
    'Eredivisie': { country: '🇳🇱 Pays-Bas', clubs: 3, emoji: '🧡' },
    'Pro League': { country: '🇧🇪 Belgique', clubs: 2, emoji: '🦁' },
    'Scottish Premiership': { country: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Écosse', clubs: 2, emoji: '🏴' },
    'Süper Lig': { country: '🇹🇷 Turquie', clubs: 3, emoji: '🌙' }
};

console.log(`⚽🇪🇺 FOOTBALL EUROPÉEN: ${footballEuropeenData.length} clubs chargés depuis 10 championnats`);
