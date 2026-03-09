// Vercel Function: GET /api/currency/rates
// Retourne les taux de change EUR -> devises locales avec cache 24h

// Cache en mémoire (persiste entre les invocations chaudes)
let ratesCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

// Taux de change de fallback (mis à jour manuellement si l'API échoue)
const FALLBACK_RATES = {
    EUR: 1,
    MAD: 10.85,   // Dirham marocain
    XOF: 655.96,  // Franc CFA (UEMOA) - Sénégal, Côte d'Ivoire, Mali, etc.
    XAF: 655.96,  // Franc CFA (CEMAC) - Cameroun, Gabon, etc.
    NGN: 1650,    // Naira nigérian
    GHS: 15.2,    // Cedi ghanéen
    KES: 155,     // Shilling kényan
    TZS: 2700,    // Shilling tanzanien
    UGX: 4100,    // Shilling ougandais
    MUR: 48,      // Roupie mauricienne
    DZD: 147,     // Dinar algérien
    TND: 3.35,    // Dinar tunisien
    EGP: 52,      // Livre égyptienne
    ZAR: 20.5,    // Rand sud-africain
    USD: 1.08,    // Dollar américain
    GBP: 0.86,    // Livre sterling
    CHF: 0.96,    // Franc suisse
    BRL: 6.2,     // Real brésilien
    ARS: 1100,    // Peso argentin
    MXN: 21,      // Peso mexicain
    JPY: 162,     // Yen japonais
    CNY: 7.8,     // Yuan chinois
    INR: 90,      // Roupie indienne
    AED: 3.97,    // Dirham des Émirats
    SAR: 4.05,    // Riyal saoudien
    QAR: 3.93,    // Riyal qatarien
    MRU: 43,      // Ouguiya mauritanien
    GMD: 73,      // Dalasi gambien
    SLL: 22000,   // Leone sierra-léonais
    GNF: 9300,    // Franc guinéen
    MZN: 69,      // Metical mozambicain
    AOA: 1050,    // Kwanza angolais
    ETB: 60,      // Birr éthiopien
    RWF: 1400,    // Franc rwandais
    BIF: 3100,    // Franc burundais
    CDF: 2900,    // Franc congolais
    ZMW: 28,      // Kwacha zambien
    MWK: 1850,    // Kwacha malawien
    BWP: 14.6,    // Pula botswanais
    NAD: 20.5,    // Dollar namibien
    SZL: 20.5,    // Lilangeni swazilandais
    LSL: 20.5,    // Loti lesothan
    MGA: 4900,    // Ariary malgache
    KMF: 491,     // Franc comorien
    SCR: 15,      // Roupie seychelloise
    CVE: 110.3,   // Escudo cap-verdien
    STN: 24.5,    // Dobra santoméen
    LRD: 205,     // Dollar libérien
    SOS: 615,     // Shilling somalien
    SDG: 650,     // Livre soudanaise
    ERN: 16.2,    // Nakfa érythréen
    DJF: 192,     // Franc djiboutien
    CLP: 1000,    // Peso chilien
    COP: 4500,    // Peso colombien
    PEN: 4.1,     // Sol péruvien
    VEF: 3900000, // Bolivar vénézuélien
    UYU: 43,      // Peso uruguayen
    PYG: 8100,    // Guaraní paraguayen
    BOB: 7.5,     // Boliviano bolivien
    GTQ: 8.4,     // Quetzal guatémaltèque
    HNL: 27,      // Lempira hondurien
    NIO: 39,      // Córdoba nicaraguayen
    CRC: 560,     // Colón costaricain
    PAB: 1.08,    // Balboa panaméen
    DOP: 64,      // Peso dominicain
    HTG: 143,     // Gourde haïtienne
    JMD: 168,     // Dollar jamaïcain
    TTD: 7.3,     // Dollar de Trinité-et-Tobago
    BBD: 2.18,    // Dollar de la Barbade
    XCD: 2.92,    // Dollar des Caraïbes orientales
    KRW: 1450,    // Won sud-coréen
    IDR: 17000,   // Roupie indonésienne
    MYR: 5.1,     // Ringgit malaisien
    PHP: 62,      // Peso philippin
    THB: 38,      // Baht thaïlandais
    VND: 27000,   // Dong vietnamien
    PKR: 300,     // Roupie pakistanaise
    BDT: 118,     // Taka bangladais
    LKR: 340,     // Roupie srilankaise
    NPR: 144,     // Roupie népalaise
    MMK: 2270,    // Kyat birman
    KHR: 4400,    // Riel cambodgien
    LAK: 23000,   // Kip laotien
    MNT: 3700,    // Tugrik mongol
    KZT: 500,     // Tenge kazakh
    UZS: 13500,   // Sum ouzbek
    AZN: 1.84,    // Manat azerbaïdjanais
    GEL: 2.9,     // Lari géorgien
    AMD: 420,     // Dram arménien
    TRY: 35,      // Livre turque
    ILS: 4.1,     // Shekel israélien
    JOD: 0.77,    // Dinar jordanien
    LBP: 97000,   // Livre libanaise
    IQD: 1410,    // Dinar irakien
    IRR: 45500,   // Rial iranien
    KWD: 0.33,    // Dinar koweïtien
    BHD: 0.41,    // Dinar bahreïni
    OMR: 0.42,    // Rial omanais
    YER: 271,     // Rial yéménite
    AFN: 76,      // Afghani afghan
    PLN: 4.3,     // Zloty polonais
    CZK: 25,      // Couronne tchèque
    HUF: 400,     // Forint hongrois
    RON: 5.0,     // Leu roumain
    BGN: 1.96,    // Lev bulgare
    HRK: 7.5,     // Kuna croate
    RSD: 117,     // Dinar serbe
    UAH: 44,      // Hryvnia ukrainienne
    RUB: 100,     // Rouble russe
    NOK: 11.8,    // Couronne norvégienne
    SEK: 11.4,    // Couronne suédoise
    DKK: 7.46,    // Couronne danoise
    ISK: 150,     // Couronne islandaise
    HKD: 8.4,     // Dollar de Hong Kong
    SGD: 1.46,    // Dollar de Singapour
    NZD: 1.82,    // Dollar néo-zélandais
    AUD: 1.67,    // Dollar australien
    CAD: 1.48,    // Dollar canadien
    TWD: 35,      // Dollar taïwanais
};

// Mapping club/ligue -> devise
const CLUB_CURRENCY_MAP = {
    // Maroc
    'maroc': { currency: 'MAD', symbol: 'MAD', name: 'Dirham marocain', flag: '🇲🇦' },
    'botola': { currency: 'MAD', symbol: 'MAD', name: 'Dirham marocain', flag: '🇲🇦' },
    'wydad': { currency: 'MAD', symbol: 'MAD', name: 'Dirham marocain', flag: '🇲🇦' },
    'raja': { currency: 'MAD', symbol: 'MAD', name: 'Dirham marocain', flag: '🇲🇦' },
    // Sénégal
    'senegal': { currency: 'XOF', symbol: 'FCFA', name: 'Franc CFA', flag: '🇸🇳' },
    'sénégal': { currency: 'XOF', symbol: 'FCFA', name: 'Franc CFA', flag: '🇸🇳' },
    // Côte d'Ivoire (toutes les variantes d'URL possibles)
    'cote d\'ivoire': { currency: 'XOF', symbol: 'FCFA', name: 'Franc CFA', flag: '🇨🇮' },
    'côte d\'ivoire': { currency: 'XOF', symbol: 'FCFA', name: 'Franc CFA', flag: '🇨🇮' },
    'cote-divoire': { currency: 'XOF', symbol: 'FCFA', name: 'Franc CFA', flag: '🇨🇮' },
    'cote-d\'ivoire': { currency: 'XOF', symbol: 'FCFA', name: 'Franc CFA', flag: '🇨🇮' },
    'côte-d\'ivoire': { currency: 'XOF', symbol: 'FCFA', name: 'Franc CFA', flag: '🇨🇮' },
    'ivory coast': { currency: 'XOF', symbol: 'FCFA', name: 'Franc CFA', flag: '🇨🇮' },
    'ivoire': { currency: 'XOF', symbol: 'FCFA', name: 'Franc CFA', flag: '🇨🇮' },
    'cdi': { currency: 'XOF', symbol: 'FCFA', name: 'Franc CFA', flag: '🇨🇮' },
    'liga1 ivoire': { currency: 'XOF', symbol: 'FCFA', name: 'Franc CFA', flag: '🇨🇮' },
    'liga1+ivoire': { currency: 'XOF', symbol: 'FCFA', name: 'Franc CFA', flag: '🇨🇮' },
    // Nigeria
    'nigeria': { currency: 'NGN', symbol: '₦', name: 'Naira nigérian', flag: '🇳🇬' },
    'nigéria': { currency: 'NGN', symbol: '₦', name: 'Naira nigérian', flag: '🇳🇬' },
    // Ghana
    'ghana': { currency: 'GHS', symbol: 'GH₵', name: 'Cedi ghanéen', flag: '🇬🇭' },
    // Cameroun
    'cameroun': { currency: 'XAF', symbol: 'FCFA', name: 'Franc CFA', flag: '🇨🇲' },
    'cameroon': { currency: 'XAF', symbol: 'FCFA', name: 'Franc CFA', flag: '🇨🇲' },
    // Algérie
    'algerie': { currency: 'DZD', symbol: 'DA', name: 'Dinar algérien', flag: '🇩🇿' },
    'algérie': { currency: 'DZD', symbol: 'DA', name: 'Dinar algérien', flag: '🇩🇿' },
    'algeria': { currency: 'DZD', symbol: 'DA', name: 'Dinar algérien', flag: '🇩🇿' },
    // Tunisie
    'tunisie': { currency: 'TND', symbol: 'DT', name: 'Dinar tunisien', flag: '🇹🇳' },
    'tunisia': { currency: 'TND', symbol: 'DT', name: 'Dinar tunisien', flag: '🇹🇳' },
    // Égypte
    'egypte': { currency: 'EGP', symbol: 'E£', name: 'Livre égyptienne', flag: '🇪🇬' },
    'égypte': { currency: 'EGP', symbol: 'E£', name: 'Livre égyptienne', flag: '🇪🇬' },
    'egypt': { currency: 'EGP', symbol: 'E£', name: 'Livre égyptienne', flag: '🇪🇬' },
    // Afrique du Sud
    'afrique du sud': { currency: 'ZAR', symbol: 'R', name: 'Rand sud-africain', flag: '🇿🇦' },
    'south africa': { currency: 'ZAR', symbol: 'R', name: 'Rand sud-africain', flag: '🇿🇦' },
    // Kenya
    'kenya': { currency: 'KES', symbol: 'KSh', name: 'Shilling kényan', flag: '🇰🇪' },
    // Tanzanie
    'tanzanie': { currency: 'TZS', symbol: 'TSh', name: 'Shilling tanzanien', flag: '🇹🇿' },
    'tanzania': { currency: 'TZS', symbol: 'TSh', name: 'Shilling tanzanien', flag: '🇹🇿' },
    // Ouganda
    'ouganda': { currency: 'UGX', symbol: 'USh', name: 'Shilling ougandais', flag: '🇺🇬' },
    'uganda': { currency: 'UGX', symbol: 'USh', name: 'Shilling ougandais', flag: '🇺🇬' },
    // Maurice
    'maurice': { currency: 'MUR', symbol: 'Rs', name: 'Roupie mauricienne', flag: '🇲🇺' },
    'mauritius': { currency: 'MUR', symbol: 'Rs', name: 'Roupie mauricienne', flag: '🇲🇺' },
    // Mauritanie
    'mauritanie': { currency: 'MRU', symbol: 'MRU', name: 'Ouguiya mauritanien', flag: '🇲🇷' },
    // Clubs français (EUR par défaut)
    'ligue1': { currency: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    'ligue 1': { currency: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    'ligue2': { currency: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    'ligue 2': { currency: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    'national': { currency: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    // CAF (Afrique - défaut MAD pour les fédérations africaines)
    'caf': { currency: 'XOF', symbol: 'FCFA', name: 'Franc CFA', flag: '🌍' },
    // FIFA/UEFA (EUR)
    'fifa': { currency: 'EUR', symbol: '€', name: 'Euro', flag: '🌍' },
    'uefa': { currency: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
};

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { club, league } = req.query;

    // Déterminer la devise du club - chercher dans club ET league séparément
    // Normaliser les clés : décoder les caractères URL et normaliser les accents
    const normalizeKey = (s) => {
        try { s = decodeURIComponent(s); } catch(e) {}
        return s.toLowerCase().trim()
            .replace(/\u2019|\u2018/g, "'")
            .replace(/\u00e9/g, 'e').replace(/\u00e8/g, 'e').replace(/\u00ea/g, 'e')
            .replace(/\u00e0/g, 'a').replace(/\u00e2/g, 'a')
            .replace(/\u00f4/g, 'o').replace(/\u00fb/g, 'u').replace(/\u00fc/g, 'u')
            .replace(/\u00ee/g, 'i').replace(/\u00ef/g, 'i')
            .replace(/\u00e7/g, 'c');
    };
    const clubKey = normalizeKey(club || '');
    const leagueKey = normalizeKey(league || '');
    // Aussi garder les clés originales pour la recherche
    const clubKeyOrig = (club || '').toLowerCase().trim();
    const leagueKeyOrig = (league || '').toLowerCase().trim();
    let currencyInfo = null;
    
    // Chercher d'abord dans le nom du club (version normalisée + originale)
    for (const [k, v] of Object.entries(CLUB_CURRENCY_MAP)) {
        const kNorm = normalizeKey(k);
        if (clubKey && (clubKey.includes(kNorm) || kNorm.includes(clubKey))) {
            currencyInfo = v;
            break;
        }
        if (clubKeyOrig && (clubKeyOrig.includes(k) || k.includes(clubKeyOrig))) {
            currencyInfo = v;
            break;
        }
    }
    
    // Si pas trouvé, chercher dans la league
    if (!currencyInfo) {
        for (const [k, v] of Object.entries(CLUB_CURRENCY_MAP)) {
            const kNorm = normalizeKey(k);
            if (leagueKey && (leagueKey.includes(kNorm) || kNorm.includes(leagueKey))) {
                currencyInfo = v;
                break;
            }
            if (leagueKeyOrig && (leagueKeyOrig.includes(k) || k.includes(leagueKeyOrig))) {
                currencyInfo = v;
                break;
            }
        }
    }
    
    // Détection par pays dans le nom du club (ex: "Wydad Casablanca" → Maroc)
    const countryKeywords = {
        'casablanca': 'maroc', 'rabat': 'maroc', 'fes': 'maroc', 'marrakech': 'maroc',
        'lagos': 'nigeria', 'abuja': 'nigeria', 'kano': 'nigeria',
        'accra': 'ghana', 'kumasi': 'ghana',
        'dakar': 'senegal', 'saint-louis': 'senegal',
        'abidjan': 'cote d\'ivoire', 'bouake': 'cote d\'ivoire',
        'yaounde': 'cameroun', 'douala': 'cameroun',
        'alger': 'algerie', 'oran': 'algerie', 'constantine': 'algerie',
        'tunis': 'tunisie', 'sfax': 'tunisie',
        'cairo': 'egypte', 'le caire': 'egypte', 'alexandrie': 'egypte',
        'johannesburg': 'afrique du sud', 'cape town': 'afrique du sud',
        'nairobi': 'kenya', 'mombasa': 'kenya',
        'dar es salaam': 'tanzanie', 'dodoma': 'tanzanie',
        'kampala': 'ouganda',
        'harare': 'zimbabwe', 'bulawayo': 'zimbabwe',
        'lusaka': 'zambie', 'ndola': 'zambie',
        'maputo': 'mozambique',
        'luanda': 'angola',
        'libreville': 'gabon',
        'brazzaville': 'congo', 'kinshasa': 'rdc'
    };
    if (!currencyInfo) {
        for (const [city, country] of Object.entries(countryKeywords)) {
            if (clubKey.includes(city)) {
                for (const [k, v] of Object.entries(CLUB_CURRENCY_MAP)) {
                    if (k === country) { currencyInfo = v; break; }
                }
                if (currencyInfo) break;
            }
        }
    }
    
    // Par défaut EUR pour les clubs français
    if (!currencyInfo) {
        currencyInfo = { currency: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' };
    }

    // Si EUR, pas besoin de conversion
    if (currencyInfo.currency === 'EUR') {
        return res.status(200).json({
            currency: 'EUR',
            symbol: '€',
            name: 'Euro',
            flag: '🇪🇺',
            rate: 1,
            source: 'default'
        });
    }

    // Vérifier le cache
    const now = Date.now();
    if (ratesCache && (now - cacheTimestamp) < CACHE_DURATION) {
        const rate = ratesCache[currencyInfo.currency] || FALLBACK_RATES[currencyInfo.currency] || 1;
        return res.status(200).json({
            ...currencyInfo,
            rate,
            source: 'cache'
        });
    }

    // Récupérer les taux depuis l'API gratuite
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/EUR');
        if (response.ok) {
            const data = await response.json();
            if (data.rates) {
                ratesCache = data.rates;
                cacheTimestamp = now;
                const rate = ratesCache[currencyInfo.currency] || FALLBACK_RATES[currencyInfo.currency] || 1;
                return res.status(200).json({
                    ...currencyInfo,
                    rate,
                    source: 'api'
                });
            }
        }
    } catch (e) {
        // Utiliser les taux de fallback
    }

    // Fallback
    const rate = FALLBACK_RATES[currencyInfo.currency] || 1;
    return res.status(200).json({
        ...currencyInfo,
        rate,
        source: 'fallback'
    });
}
