/**
 * 🌍 TRADUCTIONS POUR FÉDÉRATIONS ET CLUBS
 * ========================================
 * 
 * Traductions automatiques pour :
 * - Ligues de football (Ligue 1, Premier League, etc.)
 * - Compétitions (Champions League, Coupe du Monde, etc.)
 * - Fédérations (FIFA, UEFA, CAF, etc.)
 * 
 * SUPPORT : 11 LANGUES
 * - fr (Français), en (English), es (Español), de (Deutsch)
 * - it (Italiano), pt (Português), tr (Türkçe), ru (Русский)
 * - zh (中文), ar (العربية), ja (日本語)
 */

// =========================
// 🏆 TRADUCTIONS LIGUES
// =========================
const TRADUCTIONS_LIGUES = {
    // FRANCE
    "Ligue 1": {
        fr: "Ligue 1",
        en: "Ligue 1",
        es: "Liga 1",
        de: "Liga 1",
        it: "Ligue 1",
        pt: "Liga 1",
        tr: "Ligue 1",
        ru: "Лига 1",
        zh: "法甲联赛",
        ar: "الدوري الفرنسي",
        ja: "リーグ1"
    },
    "Ligue 2": {
        fr: "Ligue 2",
        en: "Ligue 2",
        es: "Liga 2",
        de: "Liga 2",
        it: "Ligue 2",
        pt: "Liga 2",
        tr: "Ligue 2",
        ru: "Лига 2",
        zh: "法乙联赛",
        ar: "الدوري الفرنسي الثاني",
        ja: "リーグ2"
    },
    "National 1": {
        fr: "National 1",
        en: "National 1",
        es: "Nacional 1",
        de: "National 1",
        it: "National 1",
        pt: "Nacional 1",
        tr: "National 1",
        ru: "Насьональ 1",
        zh: "法国全国联赛1",
        ar: "الدوري الوطني 1",
        ja: "ナショナル1"
    },
    "National 2": {
        fr: "National 2",
        en: "National 2",
        es: "Nacional 2",
        de: "National 2",
        it: "National 2",
        pt: "Nacional 2",
        tr: "National 2",
        ru: "Насьональ 2",
        zh: "法国全国联赛2",
        ar: "الدوري الوطني 2",
        ja: "ナショナル2"
    },
    "National 3": {
        fr: "National 3",
        en: "National 3",
        es: "Nacional 3",
        de: "National 3",
        it: "National 3",
        pt: "Nacional 3",
        tr: "National 3",
        ru: "Насьональ 3",
        zh: "法国全国联赛3",
        ar: "الدوري الوطني 3",
        ja: "ナショナル3"
    },

    // ANGLETERRE
    "Premier League": {
        fr: "Premier League",
        en: "Premier League",
        es: "Premier League",
        de: "Premier League",
        it: "Premier League",
        pt: "Premier League",
        tr: "Premier Lig",
        ru: "Премьер-лига",
        zh: "英超联赛",
        ar: "الدوري الإنجليزي الممتاز",
        ja: "プレミアリーグ"
    },
    "Championship": {
        fr: "Championship",
        en: "Championship",
        es: "Championship",
        de: "Championship",
        it: "Championship",
        pt: "Championship",
        tr: "Championship",
        ru: "Чемпионшип",
        zh: "英冠联赛",
        ar: "الدرجة الثانية الإنجليزية",
        ja: "チャンピオンシップ"
    },

    // ESPAGNE
    "La Liga": {
        fr: "La Liga",
        en: "La Liga",
        es: "La Liga",
        de: "La Liga",
        it: "La Liga",
        pt: "La Liga",
        tr: "La Liga",
        ru: "Ла Лига",
        zh: "西甲联赛",
        ar: "الدوري الإسباني",
        ja: "ラ・リーガ"
    },
    "Segunda División": {
        fr: "Segunda División",
        en: "Segunda División",
        es: "Segunda División",
        de: "Segunda División",
        it: "Segunda División",
        pt: "Segunda Divisão",
        tr: "İkinci Lig",
        ru: "Сегунда",
        zh: "西乙联赛",
        ar: "الدوري الإسباني الثاني",
        ja: "セグンダ・ディビシオン"
    },

    // ITALIE
    "Serie A": {
        fr: "Serie A",
        en: "Serie A",
        es: "Serie A",
        de: "Serie A",
        it: "Serie A",
        pt: "Série A",
        tr: "Serie A",
        ru: "Серия А",
        zh: "意甲联赛",
        ar: "الدوري الإيطالي",
        ja: "セリエA"
    },
    "Serie B": {
        fr: "Serie B",
        en: "Serie B",
        es: "Serie B",
        de: "Serie B",
        it: "Serie B",
        pt: "Série B",
        tr: "Serie B",
        ru: "Серия Б",
        zh: "意乙联赛",
        ar: "الدوري الإيطالي الثاني",
        ja: "セリエB"
    },

    // ALLEMAGNE
    "Bundesliga": {
        fr: "Bundesliga",
        en: "Bundesliga",
        es: "Bundesliga",
        de: "Bundesliga",
        it: "Bundesliga",
        pt: "Bundesliga",
        tr: "Bundesliga",
        ru: "Бундеслига",
        zh: "德甲联赛",
        ar: "الدوري الألماني",
        ja: "ブンデスリーガ"
    },
    "2. Bundesliga": {
        fr: "2. Bundesliga",
        en: "2. Bundesliga",
        es: "2. Bundesliga",
        de: "2. Bundesliga",
        it: "2. Bundesliga",
        pt: "2. Bundesliga",
        tr: "2. Bundesliga",
        ru: "2. Бундеслига",
        zh: "德乙联赛",
        ar: "الدوري الألماني الثاني",
        ja: "2.ブンデスリーガ"
    },

    // PORTUGAL
    "Primeira Liga": {
        fr: "Primeira Liga",
        en: "Primeira Liga",
        es: "Primeira Liga",
        de: "Primeira Liga",
        it: "Primeira Liga",
        pt: "Primeira Liga",
        tr: "Primeira Liga",
        ru: "Примейра Лига",
        zh: "葡超联赛",
        ar: "الدوري البرتغالي",
        ja: "プリメイラ・リーガ"
    },

    // PAYS-BAS
    "Eredivisie": {
        fr: "Eredivisie",
        en: "Eredivisie",
        es: "Eredivisie",
        de: "Eredivisie",
        it: "Eredivisie",
        pt: "Eredivisie",
        tr: "Eredivisie",
        ru: "Эредивизи",
        zh: "荷甲联赛",
        ar: "الدوري الهولندي",
        ja: "エールディビジ"
    },

    // COMPÉTITIONS EUROPÉENNES
    "UEFA Champions League": {
        fr: "Ligue des Champions UEFA",
        en: "UEFA Champions League",
        es: "Liga de Campeones de la UEFA",
        de: "UEFA Champions League",
        it: "UEFA Champions League",
        pt: "Liga dos Campeões da UEFA",
        tr: "UEFA Şampiyonlar Ligi",
        ru: "Лига Чемпионов УЕФА",
        zh: "欧洲冠军联赛",
        ar: "دوري أبطال أوروبا",
        ja: "UEFAチャンピオンズリーグ"
    },
    "UEFA Europa League": {
        fr: "Ligue Europa UEFA",
        en: "UEFA Europa League",
        es: "Liga Europa de la UEFA",
        de: "UEFA Europa League",
        it: "UEFA Europa League",
        pt: "Liga Europa da UEFA",
        tr: "UEFA Avrupa Ligi",
        ru: "Лига Европы УЕФА",
        zh: "欧洲联赛",
        ar: "الدوري الأوروبي",
        ja: "UEFAヨーロッパリーグ"
    },
    "UEFA Conference League": {
        fr: "Ligue Europa Conférence UEFA",
        en: "UEFA Conference League",
        es: "Liga Europa Conference de la UEFA",
        de: "UEFA Conference League",
        it: "UEFA Conference League",
        pt: "Liga Conferência da UEFA",
        tr: "UEFA Konferans Ligi",
        ru: "Лига Конференций УЕФА",
        zh: "欧洲协会联赛",
        ar: "دوري المؤتمر الأوروبي",
        ja: "UEFAカンファレンスリーグ"
    }
};

// =========================
// 🏆 TRADUCTIONS COMPÉTITIONS
// =========================
const TRADUCTIONS_COMPETITIONS = {
    "Coupe du Monde 2026": {
        fr: "Coupe du Monde 2026",
        en: "2026 World Cup",
        es: "Copa Mundial 2026",
        de: "Weltmeisterschaft 2026",
        it: "Coppa del Mondo 2026",
        pt: "Copa do Mundo 2026",
        tr: "2026 Dünya Kupası",
        ru: "Чемпионат мира 2026",
        zh: "2026年世界杯",
        ar: "كأس العالم 2026",
        ja: "2026年ワールドカップ"
    },
    "CAN 2025": {
        fr: "CAN 2025",
        en: "AFCON 2025",
        es: "Copa Africana 2025",
        de: "Afrika-Cup 2025",
        it: "Coppa d'Africa 2025",
        pt: "Copa Africana 2025",
        tr: "Afrika Uluslar Kupası 2025",
        ru: "КАН 2025",
        zh: "2025年非洲杯",
        ar: "كأس أمم أفريقيا 2025",
        ja: "アフリカネイションズカップ2025"
    },
    "JOJ 2026 Dakar": {
        fr: "JOJ 2026 Dakar",
        en: "YOG 2026 Dakar",
        es: "JOJ 2026 Dakar",
        de: "YOG 2026 Dakar",
        it: "GOG 2026 Dakar",
        pt: "JOJ 2026 Dakar",
        tr: "Gençlik Olimpiyatları 2026 Dakar",
        ru: "ЮОИ 2026 Дакар",
        zh: "2026年达喀尔青年奥运会",
        ar: "الألعاب الأولمبية للشباب 2026 داكار",
        ja: "2026年ユースオリンピック・ダカール"
    }
};

// =========================
// 🏛️ TRADUCTIONS FÉDÉRATIONS
// =========================
const TRADUCTIONS_FEDERATIONS = {
    // FÉDÉRATIONS FIFA
    "FIFA": {
        fr: "FIFA",
        en: "FIFA",
        es: "FIFA",
        de: "FIFA",
        it: "FIFA",
        pt: "FIFA",
        tr: "FIFA",
        ru: "ФИФА",
        zh: "国际足联",
        ar: "الفيفا",
        ja: "FIFA"
    },
    "UEFA": {
        fr: "UEFA",
        en: "UEFA",
        es: "UEFA",
        de: "UEFA",
        it: "UEFA",
        pt: "UEFA",
        tr: "UEFA",
        ru: "УЕФА",
        zh: "欧洲足联",
        ar: "الاتحاد الأوروبي",
        ja: "UEFA"
    },
    "CAF": {
        fr: "CAF",
        en: "CAF",
        es: "CAF",
        de: "CAF",
        it: "CAF",
        pt: "CAF",
        tr: "CAF",
        ru: "КАФ",
        zh: "非洲足联",
        ar: "الاتحاد الأفريقي",
        ja: "CAF"
    },
    "CONMEBOL": {
        fr: "CONMEBOL",
        en: "CONMEBOL",
        es: "CONMEBOL",
        de: "CONMEBOL",
        it: "CONMEBOL",
        pt: "CONMEBOL",
        tr: "CONMEBOL",
        ru: "КОНМЕБОЛ",
        zh: "南美足联",
        ar: "اتحاد أمريكا الجنوبية",
        ja: "CONMEBOL"
    },
    "AFC": {
        fr: "AFC",
        en: "AFC",
        es: "AFC",
        de: "AFC",
        it: "AFC",
        pt: "AFC",
        tr: "AFC",
        ru: "АФК",
        zh: "亚洲足联",
        ar: "الاتحاد الآسيوي",
        ja: "AFC"
    },
    "CONCACAF": {
        fr: "CONCACAF",
        en: "CONCACAF",
        es: "CONCACAF",
        de: "CONCACAF",
        it: "CONCACAF",
        pt: "CONCACAF",
        tr: "CONCACAF",
        ru: "КОНКАКАФ",
        zh: "中北美及加勒比足联",
        ar: "الكونكاكاف",
        ja: "CONCACAF"
    },
    "OFC": {
        fr: "OFC",
        en: "OFC",
        es: "OFC",
        de: "OFC",
        it: "OFC",
        pt: "OFC",
        tr: "OFC",
        ru: "ОФК",
        zh: "大洋洲足联",
        ar: "اتحاد أوقيانوسيا",
        ja: "OFC"
    },

    // PAYS (Exemples pour les pages de fédérations)
    "France": {
        fr: "France",
        en: "France",
        es: "Francia",
        de: "Frankreich",
        it: "Francia",
        pt: "França",
        tr: "Fransa",
        ru: "Франция",
        zh: "法国",
        ar: "فرنسا",
        ja: "フランス"
    },
    "England": {
        fr: "Angleterre",
        en: "England",
        es: "Inglaterra",
        de: "England",
        it: "Inghilterra",
        pt: "Inglaterra",
        tr: "İngiltere",
        ru: "Англия",
        zh: "英格兰",
        ar: "إنجلترا",
        ja: "イングランド"
    },
    "Germany": {
        fr: "Allemagne",
        en: "Germany",
        es: "Alemania",
        de: "Deutschland",
        it: "Germania",
        pt: "Alemanha",
        tr: "Almanya",
        ru: "Германия",
        zh: "德国",
        ar: "ألمانيا",
        ja: "ドイツ"
    },
    "Spain": {
        fr: "Espagne",
        en: "Spain",
        es: "España",
        de: "Spanien",
        it: "Spagna",
        pt: "Espanha",
        tr: "İspanya",
        ru: "Испания",
        zh: "西班牙",
        ar: "إسبانيا",
        ja: "スペイン"
    },
    "Italy": {
        fr: "Italie",
        en: "Italy",
        es: "Italia",
        de: "Italien",
        it: "Italia",
        pt: "Itália",
        tr: "İtalya",
        ru: "Италия",
        zh: "意大利",
        ar: "إيطاليا",
        ja: "イタリア"
    }
};

// =========================
// 🏀 TRADUCTIONS SPORTS
// =========================
const TRADUCTIONS_SPORTS = {
    "Basketball": {
        fr: "Basket-ball",
        en: "Basketball",
        es: "Baloncesto",
        de: "Basketball",
        it: "Pallacanestro",
        pt: "Basquetebol",
        tr: "Basketbol",
        ru: "Баскетбол",
        zh: "篮球",
        ar: "كرة السلة",
        ja: "バスケットボール"
    },
    "Handball": {
        fr: "Handball",
        en: "Handball",
        es: "Balonmano",
        de: "Handball",
        it: "Pallamano",
        pt: "Andebol",
        tr: "Hentbol",
        ru: "Гандбол",
        zh: "手球",
        ar: "كرة اليد",
        ja: "ハンドボール"
    },
    "Rugby": {
        fr: "Rugby",
        en: "Rugby",
        es: "Rugby",
        de: "Rugby",
        it: "Rugby",
        pt: "Rugby",
        tr: "Rugby",
        ru: "Регби",
        zh: "橄榄球",
        ar: "الرغبي",
        ja: "ラグビー"
    },
    "Volleyball": {
        fr: "Volley-ball",
        en: "Volleyball",
        es: "Voleibol",
        de: "Volleyball",
        it: "Pallavolo",
        pt: "Voleibol",
        tr: "Voleybol",
        ru: "Волейбол",
        zh: "排球",
        ar: "كرة الطائرة",
        ja: "バレーボール"
    }
};

// =========================
// 🔧 FONCTIONS DE TRADUCTION
// =========================

/**
 * Traduit le nom d'une ligue/compétition
 * @param {string} nom - Nom de la ligue en français
 * @param {string} langue - Code langue (fr, en, es, de, etc.)
 * @returns {string} Nom traduit ou nom original si pas de traduction
 */
function traduireLigue(nom, langue = 'fr') {
    if (!nom) return '';
    
    // Cherche d'abord dans les ligues
    if (TRADUCTIONS_LIGUES[nom]) {
        return TRADUCTIONS_LIGUES[nom][langue] || nom;
    }
    
    // Puis dans les compétitions
    if (TRADUCTIONS_COMPETITIONS[nom]) {
        return TRADUCTIONS_COMPETITIONS[nom][langue] || nom;
    }
    
    // Retourne le nom original si pas de traduction
    return nom;
}

/**
 * Traduit le nom d'une fédération
 * @param {string} nom - Nom de la fédération
 * @param {string} langue - Code langue (fr, en, es, de, etc.)
 * @returns {string} Nom traduit ou nom original si pas de traduction
 */
function traduireFederation(nom, langue = 'fr') {
    if (!nom) return '';
    
    if (TRADUCTIONS_FEDERATIONS[nom]) {
        return TRADUCTIONS_FEDERATIONS[nom][langue] || nom;
    }
    
    // Retourne le nom original si pas de traduction
    return nom;
}

/**
 * Traduit le nom d'un sport
 * @param {string} nom - Nom du sport
 * @param {string} langue - Code langue (fr, en, es, de, etc.)
 * @returns {string} Nom traduit ou nom original si pas de traduction
 */
function traduireSport(nom, langue = 'fr') {
    if (!nom) return '';
    
    if (TRADUCTIONS_SPORTS[nom]) {
        return TRADUCTIONS_SPORTS[nom][langue] || nom;
    }
    
    // Retourne le nom original si pas de traduction
    return nom;
}

// Log de chargement
console.log('✅ Fichier de traductions fédérations/clubs chargé');
console.log(`📊 ${Object.keys(TRADUCTIONS_LIGUES).length} ligues, ${Object.keys(TRADUCTIONS_FEDERATIONS).length} fédérations, ${Object.keys(TRADUCTIONS_SPORTS).length} sports traduits`);
