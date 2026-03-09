// ========================================
// CLUBS MAROCAINS DE FOOTBALL
// Botola Pro D1 + Division 1 Féminin
// Dernière mise à jour : Février 2026
// ========================================

const clubsMarocMasculins = [
    {
        name: 'Wydad Casablanca',
        shortName: 'Wydad AC',
        logo: 'assets/logos/clubs/maroc/wydad.png',
        ville: 'Casablanca',
        stade: 'Stade Mohamed V',
        fondation: 1937,
        titres: 22,
        couleurs: ['#C1272D', '#FFFFFF'],
        site: 'www.wydad.com'
    },
    {
        name: 'Raja Club Athletic',
        shortName: 'Raja Casablanca',
        logo: 'assets/logos/clubs/maroc/raja.png',
        ville: 'Casablanca',
        stade: 'Stade Mohamed V',
        fondation: 1949,
        titres: 12,
        couleurs: ['#006233', '#FFFFFF'],
        site: 'www.rajacasablanca.com'
    },
    {
        name: 'AS FAR Rabat',
        shortName: 'AS FAR',
        logo: 'assets/logos/clubs/maroc/far.png',
        ville: 'Rabat',
        stade: 'Stade Moulay Abdellah',
        fondation: 1958,
        titres: 12,
        couleurs: ['#006233', '#C1272D'],
        site: 'www.asfar.ma'
    },
    {
        name: 'Renaissance de Berkane',
        shortName: 'RS Berkane',
        logo: '⚽',
        ville: 'Berkane',
        stade: 'Stade Municipal de Berkane',
        fondation: 1938,
        titres: 1,
        couleurs: ['#FF8C00', '#000000'],
        site: ''
    },
    {
        name: 'FUS Rabat',
        shortName: 'FUS',
        logo: '⚽',
        ville: 'Rabat',
        stade: 'Stade Moulay Abdellah',
        fondation: 1946,
        titres: 3,
        couleurs: ['#C1272D', '#FFFFFF'],
        site: 'www.fusrabat.com'
    },
    {
        name: 'Maghreb de Fès',
        shortName: 'MAS Fès',
        logo: '⚽',
        ville: 'Fès',
        stade: 'Stade de Fès',
        fondation: 1946,
        titres: 3,
        couleurs: ['#FFD700', '#000000'],
        site: ''
    },
    {
        name: 'Union Touarga Sportif',
        shortName: 'Union Touarga',
        logo: '⚽',
        ville: 'Rabat',
        stade: 'Stade Moulay Abdellah',
        fondation: 2004,
        titres: 0,
        couleurs: ['#0066CC', '#FFFFFF'],
        site: ''
    },
    {
        name: 'Hassania d\'Agadir',
        shortName: 'Hassania',
        logo: '⚽',
        ville: 'Agadir',
        stade: 'Stade Adrar',
        fondation: 1946,
        titres: 2,
        couleurs: ['#C1272D', '#FFFFFF'],
        site: ''
    },
    {
        name: 'Olympique Safi',
        shortName: 'OC Safi',
        logo: '⚽',
        ville: 'Safi',
        stade: 'Stade El Massira',
        fondation: 1923,
        titres: 0,
        couleurs: ['#000000', '#FFFFFF'],
        site: ''
    },
    {
        name: 'Renaissance Zemamra',
        shortName: 'RCA Zemamra',
        logo: '⚽',
        ville: 'Zemamra',
        stade: 'Stade Municipal de Zemamra',
        fondation: 1966,
        titres: 0,
        couleurs: ['#006233', '#FFFFFF'],
        site: ''
    },
    {
        name: 'COD Meknès',
        shortName: 'COD Meknès',
        logo: '⚽',
        ville: 'Meknès',
        stade: 'Stade d\'Honneur',
        fondation: 1956,
        titres: 0,
        couleurs: ['#FFD700', '#000000'],
        site: ''
    },
    {
        name: 'Ittihad Tanger',
        shortName: 'Ittihad Tanger',
        logo: '⚽',
        ville: 'Tanger',
        stade: 'Stade Ibn Batouta',
        fondation: 1983,
        titres: 0,
        couleurs: ['#FF8C00', '#FFFFFF'],
        site: ''
    },
    {
        name: 'Kawkab Marrakech',
        shortName: 'KACM Marrakech',
        logo: '⚽',
        ville: 'Marrakech',
        stade: 'Stade El Harti',
        fondation: 1947,
        titres: 2,
        couleurs: ['#C1272D', '#FFD700'],
        site: ''
    },
    {
        name: 'Difaâ El Jadida',
        shortName: 'Difaâ El Jadida',
        logo: '⚽',
        ville: 'El Jadida',
        stade: 'Stade El Abdi',
        fondation: 1956,
        titres: 0,
        couleurs: ['#006233', '#FFFFFF'],
        site: ''
    },
    {
        name: 'Union Yacoub El-Mansour',
        shortName: 'El-Mansour',
        logo: '⚽',
        ville: 'Rabat',
        stade: 'Stade Moulay Abdellah',
        fondation: 2005,
        titres: 0,
        couleurs: ['#0066CC', '#FFFFFF'],
        site: ''
    },
    {
        name: 'Olympique Dcheira',
        shortName: 'Olymp. Dcheira',
        logo: '⚽',
        ville: 'Dcheira',
        stade: 'Stade Municipal',
        fondation: 1996,
        titres: 0,
        couleurs: ['#FF8C00', '#000000'],
        site: ''
    }
];

const clubsMarocFeminins = [
    {
        name: 'FAR Rabat',
        shortName: 'FAR Rabat (F)',
        logo: 'assets/logos/clubs/maroc/far.png',
        ville: 'Rabat',
        stade: 'Stade Moulay Abdellah',
        fondation: 1958,
        titres: 15,
        couleurs: ['#006233', '#C1272D'],
        site: 'www.asfar.ma'
    },
    {
        name: 'Wydad Casablanca',
        shortName: 'Wydad AC (F)',
        logo: 'assets/logos/clubs/maroc/wydad.png',
        ville: 'Casablanca',
        stade: 'Stade Mohamed V',
        fondation: 1937,
        titres: 2,
        couleurs: ['#C1272D', '#FFFFFF'],
        site: 'www.wydad.com'
    },
    {
        name: 'Raja Casablanca',
        shortName: 'Raja CA (F)',
        logo: 'assets/logos/clubs/maroc/raja.png',
        ville: 'Casablanca',
        stade: 'Stade Mohamed V',
        fondation: 1949,
        titres: 1,
        couleurs: ['#006233', '#FFFFFF'],
        site: 'www.rajacasablanca.com'
    },
    {
        name: 'FUS Rabat',
        shortName: 'FUS Rabat (F)',
        logo: '⚽',
        ville: 'Rabat',
        stade: 'Stade Moulay Abdellah',
        fondation: 1946,
        titres: 0,
        couleurs: ['#C1272D', '#FFFFFF'],
        site: 'www.fusrabat.com'
    },
    {
        name: 'RSB Berkane',
        shortName: 'RSB Berkane (F)',
        logo: '⚽',
        ville: 'Berkane',
        stade: 'Stade Municipal de Berkane',
        fondation: 1938,
        titres: 0,
        couleurs: ['#FF8C00', '#000000'],
        site: ''
    },
    {
        name: 'Renaissance Zemamra',
        shortName: 'RCA Zemamra (F)',
        logo: '⚽',
        ville: 'Zemamra',
        stade: 'Stade Municipal',
        fondation: 1966,
        titres: 0,
        couleurs: ['#006233', '#FFFFFF'],
        site: ''
    },
    {
        name: 'Ittihad Tanger',
        shortName: 'Ittihad Tanger (F)',
        logo: '⚽',
        ville: 'Tanger',
        stade: 'Stade Ibn Batouta',
        fondation: 1983,
        titres: 0,
        couleurs: ['#FF8C00', '#FFFFFF'],
        site: ''
    },
    {
        name: 'Difaâ El Jadidi',
        shortName: 'Difaâ El Jadidi (F)',
        logo: '⚽',
        ville: 'El Jadida',
        stade: 'Stade El Abdi',
        fondation: 1956,
        titres: 0,
        couleurs: ['#006233', '#FFFFFF'],
        site: ''
    },
    {
        name: 'Union Touarga',
        shortName: 'Union Touarga (F)',
        logo: '⚽',
        ville: 'Rabat',
        stade: 'Stade Moulay Abdellah',
        fondation: 2004,
        titres: 0,
        couleurs: ['#0066CC', '#FFFFFF'],
        site: ''
    },
    {
        name: 'Hilal Temara',
        shortName: 'Hilal Temara',
        logo: '⚽',
        ville: 'Temara',
        stade: 'Stade Municipal',
        fondation: 1983,
        titres: 0,
        couleurs: ['#0066CC', '#FFFFFF'],
        site: ''
    },
    {
        name: 'CSST Temara',
        shortName: 'CSST Temara',
        logo: '⚽',
        ville: 'Temara',
        stade: 'Stade Municipal',
        fondation: 2010,
        titres: 0,
        couleurs: ['#C1272D', '#FFFFFF'],
        site: ''
    },
    {
        name: 'Ain Atiq Temara',
        shortName: 'Ain Atiq Temara',
        logo: '⚽',
        ville: 'Temara',
        stade: 'Stade Municipal',
        fondation: 2008,
        titres: 0,
        couleurs: ['#006233', '#FFFFFF'],
        site: ''
    }
];
