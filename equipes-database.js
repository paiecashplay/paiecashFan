// ========================================
// BASE DE DONNÉES DES ÉQUIPES
// Structure complète pour tous les clubs et fédérations
// ========================================

const equipesDatabase = {
    // ========== MAROC ==========
    "maroc": {
        name: "Maroc 🇲🇦",
        logo: "🇲🇦",
        colors: ["#C1272D", "#006233"], // Rouge et vert
        appUrl: "app-universal-simple.html?club=Maroc&logo=🇲🇦&sport=Football&league=Fédération",
        categories: [
            {
                title: "🇲🇦 Équipes Nationales",
                teams: [
                    {
                        name: "E.N.A",
                        fullName: "Équipe Nationale A",
                        logo: "🇲🇦",
                        coach: "Walid Regragui",
                        description: "Lions de l'Atlas",
                        achievements: "CAN 1976 • Mondial 2022 (4e place)",
                        url: "app-universal-simple.html?club=Maroc+ENA&logo=🇲🇦&sport=Football&league=Équipe+Nationale"
                    },
                    {
                        name: "E.N. U23",
                        fullName: "Équipe Nationale U23",
                        logo: "🇲🇦",
                        coach: "Tarik Sektioui",
                        description: "Espoirs marocains",
                        achievements: "JO 2024",
                        url: "app-universal-simple.html?club=Maroc+U23&logo=🇲🇦&sport=Football&league=Équipe+Nationale"
                    },
                    {
                        name: "E.N. U20",
                        fullName: "Équipe Nationale U20",
                        logo: "🇲🇦",
                        coach: "Saïd Chiba",
                        description: "Jeunes Lions",
                        achievements: "CAN U20",
                        url: "app-universal-simple.html?club=Maroc+U20&logo=🇲🇦&sport=Football&league=Équipe+Nationale"
                    },
                    {
                        name: "FÉMININE",
                        fullName: "Équipe Nationale Féminine",
                        logo: "🇲🇦",
                        coach: "Lamia Boumehdi",
                        description: "Lionnes de l'Atlas",
                        achievements: "CAN Féminine 2022",
                        url: "app-universal-simple.html?club=Maroc+Féminine&logo=🇲🇦&sport=Football&league=Équipe+Nationale"
                    },
                    {
                        name: "FUTSAL",
                        fullName: "Équipe Nationale Futsal",
                        logo: "🇲🇦",
                        coach: "Hicham Dguig",
                        description: "Champions d'Afrique",
                        achievements: "CAN Futsal 2020, 2024",
                        url: "app-universal-simple.html?club=Maroc+Futsal&logo=🇲🇦&sport=Futsal&league=Équipe+Nationale"
                    }
                ]
            },
            {
                title: "⚽ Clubs Masculins - Botola Pro D1",
                teams: [
                    {
                        name: "Wydad Casablanca",
                        logo: "assets/logos/clubs/maroc/wydad.png",
                        titles: 22,
                        stadium: "Stade Mohamed V",
                        founded: 1937,
                        url: "app-universal-simple.html?club=Wydad&logo=⚽&sport=Football&league=Botola+Pro"
                    },
                    {
                        name: "Raja Club Athletic",
                        logo: "assets/logos/clubs/maroc/raja.png",
                        titles: 12,
                        stadium: "Stade Mohamed V",
                        founded: 1949,
                        url: "app-universal-simple.html?club=Raja&logo=⚽&sport=Football&league=Botola+Pro"
                    },
                    {
                        name: "AS FAR Rabat",
                        logo: "assets/logos/clubs/maroc/far.png",
                        titles: 12,
                        stadium: "Stade Moulay Abdellah",
                        founded: 1958,
                        url: "app-universal-simple.html?club=AS+FAR&logo=⚽&sport=Football&league=Botola+Pro"
                    }
                ]
            }
        ]
    },

    // ========== MARSEILLE ==========
    "marseille": {
        name: "Olympique de Marseille",
        logo: "assets/logos/clubs/marseille.svg",
        colors: ["#2FAEE0", "#FFFFFF"], // Bleu et blanc
        appUrl: "app-universal-simple.html?club=Marseille&logo=⚽&sport=Football&league=Ligue+1",
        categories: [
            {
                title: "⚽ Équipes Masculines",
                teams: [
                    {
                        name: "Équipe Professionnelle",
                        logo: "assets/logos/clubs/marseille.svg",
                        coach: "Jean-Louis Gasset",
                        league: "Ligue 1",
                        stadium: "Stade Vélodrome",
                        url: "app-universal-simple.html?club=Marseille+Pro&logo=⚽&sport=Football&league=Ligue+1"
                    },
                    {
                        name: "Équipe Réserve",
                        logo: "assets/logos/clubs/marseille.svg",
                        coach: "Jean-Pierre Papin",
                        league: "National 3",
                        stadium: "Centre RLD",
                        url: "app-universal-simple.html?club=Marseille+Réserve&logo=⚽&sport=Football&league=National+3"
                    },
                    {
                        name: "U19",
                        logo: "assets/logos/clubs/marseille.svg",
                        coach: "Habib Beye",
                        league: "Championnat National U19",
                        stadium: "Centre RLD",
                        url: "app-universal-simple.html?club=Marseille+U19&logo=⚽&sport=Football&league=U19"
                    },
                    {
                        name: "U17",
                        logo: "assets/logos/clubs/marseille.svg",
                        coach: "Franck Passi",
                        league: "Championnat National U17",
                        stadium: "Centre RLD",
                        url: "app-universal-simple.html?club=Marseille+U17&logo=⚽&sport=Football&league=U17"
                    }
                ]
            },
            {
                title: "👩‍⚽ Équipes Féminines",
                teams: [
                    {
                        name: "OM Féminin",
                        logo: "assets/logos/clubs/marseille.svg",
                        coach: "Sébastien Pérez",
                        league: "D2 Féminine",
                        stadium: "Stade de l'OM",
                        url: "app-universal-simple.html?club=Marseille+Féminine&logo=⚽&sport=Football&league=D2+Féminine"
                    }
                ]
            }
        ]
    },

    // ========== MONACO ==========
    "monaco": {
        name: "AS Monaco",
        logo: "assets/logos/clubs/monaco.png",
        colors: ["#C8102E", "#FFFFFF"], // Rouge et blanc
        appUrl: "app-universal-simple.html?club=Monaco&logo=⚽&sport=Football&league=Ligue+1",
        categories: [
            {
                title: "⚽ Équipes Masculines",
                teams: [
                    {
                        name: "Équipe Professionnelle",
                        logo: "assets/logos/clubs/monaco.png",
                        coach: "Adi Hütter",
                        league: "Ligue 1",
                        stadium: "Stade Louis II",
                        url: "app-universal-simple.html?club=Monaco+Pro&logo=⚽&sport=Football&league=Ligue+1"
                    },
                    {
                        name: "Équipe Réserve",
                        logo: "assets/logos/clubs/monaco.png",
                        coach: "Frédéric Barilaro",
                        league: "National 2",
                        stadium: "Stade Louis II",
                        url: "app-universal-simple.html?club=Monaco+Réserve&logo=⚽&sport=Football&league=National+2"
                    },
                    {
                        name: "U19",
                        logo: "assets/logos/clubs/monaco.png",
                        league: "Championnat National U19",
                        url: "app-universal-simple.html?club=Monaco+U19&logo=⚽&sport=Football&league=U19"
                    }
                ]
            }
        ]
    },

    // ========== PSG ==========
    "psg": {
        name: "Paris Saint-Germain",
        logo: "assets/logos/clubs/paris_sg.png",
        colors: ["#004170", "#C8102E"], // Bleu et rouge
        appUrl: "app-universal-simple.html?club=Paris+SG&logo=⚽&sport=Football&league=Ligue+1",
        categories: [
            {
                title: "⚽ Équipes Masculines",
                teams: [
                    {
                        name: "Équipe Professionnelle",
                        logo: "assets/logos/clubs/paris_sg.png",
                        coach: "Luis Enrique",
                        league: "Ligue 1",
                        stadium: "Parc des Princes",
                        url: "app-universal-simple.html?club=PSG+Pro&logo=⚽&sport=Football&league=Ligue+1"
                    },
                    {
                        name: "Équipe Réserve",
                        logo: "assets/logos/clubs/paris_sg.png",
                        league: "National 3",
                        url: "app-universal-simple.html?club=PSG+Réserve&logo=⚽&sport=Football&league=National+3"
                    },
                    {
                        name: "U19",
                        logo: "assets/logos/clubs/paris_sg.png",
                        league: "Championnat National U19",
                        url: "app-universal-simple.html?club=PSG+U19&logo=⚽&sport=Football&league=U19"
                    }
                ]
            },
            {
                title: "👩‍⚽ Équipes Féminines",
                teams: [
                    {
                        name: "PSG Féminin",
                        logo: "assets/logos/clubs/paris_sg.png",
                        coach: "Fabrice Abriel",
                        league: "D1 Féminine",
                        stadium: "Parc des Princes",
                        url: "app-universal-simple.html?club=PSG+Féminine&logo=⚽&sport=Football&league=D1+Féminine"
                    }
                ]
            }
        ]
    },

    // ========== LYON ==========
    "lyon": {
        name: "Olympique Lyonnais",
        logo: "assets/logos/clubs/lyon.png",
        colors: ["#002366", "#C8102E"], // Bleu marine et rouge
        appUrl: "app-universal-simple.html?club=Lyon&logo=⚽&sport=Football&league=Ligue+1",
        categories: [
            {
                title: "⚽ Équipes Masculines",
                teams: [
                    {
                        name: "Équipe Professionnelle",
                        logo: "assets/logos/clubs/lyon.png",
                        coach: "Pierre Sage",
                        league: "Ligue 1",
                        stadium: "Groupama Stadium",
                        url: "app-universal-simple.html?club=Lyon+Pro&logo=⚽&sport=Football&league=Ligue+1"
                    },
                    {
                        name: "Équipe Réserve",
                        logo: "assets/logos/clubs/lyon.png",
                        league: "National 3",
                        url: "app-universal-simple.html?club=Lyon+Réserve&logo=⚽&sport=Football&league=National+3"
                    }
                ]
            },
            {
                title: "👩‍⚽ Équipes Féminines",
                teams: [
                    {
                        name: "OL Féminin",
                        logo: "assets/logos/clubs/lyon.png",
                        coach: "Sonia Bompastor",
                        league: "D1 Féminine",
                        stadium: "Groupama Stadium",
                        url: "app-universal-simple.html?club=Lyon+Féminine&logo=⚽&sport=Football&league=D1+Féminine"
                    }
                ]
            }
        ]
    },

    // ========== CAF (Confédération Africaine de Football) ==========
    "caf": {
        name: "CAF",
        logo: "🌍",
        colors: ["#006233", "#FCD116"], // Vert et jaune (couleurs africaines)
        appUrl: "app-universal-simple.html?club=CAF&logo=🌍&sport=Football&league=Fédération",
        categories: [
            {
                title: "🌍 Fédérations Africaines",
                teams: [
                    {
                        name: "Maroc",
                        logo: "🇲🇦",
                        president: "Fouzi Lekjaa",
                        founded: 1955,
                        url: "equipes.html?club=maroc"
                    },
                    {
                        name: "Algérie",
                        logo: "🇩🇿",
                        president: "Walid Sadi",
                        founded: 1962,
                        url: "app-universal-simple.html?club=Algérie&logo=🇩🇿&sport=Football&league=Fédération"
                    },
                    {
                        name: "Tunisie",
                        logo: "🇹🇳",
                        president: "Wadie Jary",
                        founded: 1956,
                        url: "app-universal-simple.html?club=Tunisie&logo=🇹🇳&sport=Football&league=Fédération"
                    },
                    {
                        name: "Égypte",
                        logo: "🇪🇬",
                        president: "Ahmed Megahed",
                        founded: 1921,
                        url: "app-universal-simple.html?club=Égypte&logo=🇪🇬&sport=Football&league=Fédération"
                    },
                    {
                        name: "Sénégal",
                        logo: "🇸🇳",
                        president: "Augustin Senghor",
                        founded: 1960,
                        url: "app-universal-simple.html?club=Sénégal&logo=🇸🇳&sport=Football&league=Fédération"
                    },
                    {
                        name: "Cameroun",
                        logo: "🇨🇲",
                        president: "Samuel Eto'o",
                        founded: 1959,
                        url: "app-universal-simple.html?club=Cameroun&logo=🇨🇲&sport=Football&league=Fédération"
                    },
                    {
                        name: "Nigeria",
                        logo: "🇳🇬",
                        president: "Ibrahim Gusau",
                        founded: 1945,
                        url: "app-universal-simple.html?club=Nigeria&logo=🇳🇬&sport=Football&league=Fédération"
                    },
                    {
                        name: "Côte d'Ivoire",
                        logo: "🇨🇮",
                        president: "Yacine Idriss Diallo",
                        founded: 1960,
                        url: "app-universal-simple.html?club=Côte+d'Ivoire&logo=🇨🇮&sport=Football&league=Fédération"
                    }
                ]
            }
        ]
    },

    // ========== UEFA ==========
    "uefa": {
        name: "UEFA",
        logo: "🇪🇺",
        colors: ["#003399", "#FFFFFF"], // Bleu UEFA
        appUrl: "app-universal-simple.html?club=UEFA&logo=🇪🇺&sport=Football&league=Fédération",
        categories: [
            {
                title: "🇪🇺 Fédérations Européennes",
                teams: [
                    {
                        name: "France",
                        logo: "🇫🇷",
                        president: "Philippe Diallo",
                        founded: 1919,
                        url: "app-universal-simple.html?club=France&logo=🇫🇷&sport=Football&league=Fédération"
                    },
                    {
                        name: "Allemagne",
                        logo: "🇩🇪",
                        president: "Bernd Neuendorf",
                        founded: 1900,
                        url: "app-universal-simple.html?club=Allemagne&logo=🇩🇪&sport=Football&league=Fédération"
                    },
                    {
                        name: "Espagne",
                        logo: "🇪🇸",
                        president: "Pedro Rocha",
                        founded: 1909,
                        url: "app-universal-simple.html?club=Espagne&logo=🇪🇸&sport=Football&league=Fédération"
                    },
                    {
                        name: "Italie",
                        logo: "🇮🇹",
                        president: "Gabriele Gravina",
                        founded: 1898,
                        url: "app-universal-simple.html?club=Italie&logo=🇮🇹&sport=Football&league=Fédération"
                    },
                    {
                        name: "Angleterre",
                        logo: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
                        president: "Mark Bullingham",
                        founded: 1863,
                        url: "app-universal-simple.html?club=Angleterre&logo=🏴󠁧󠁢󠁥󠁮󠁧󠁿&sport=Football&league=Fédération"
                    }
                ]
            }
        ]
    }
};

// Fonction pour obtenir les données d'un club/fédération
function getClubData(clubId) {
    return equipesDatabase[clubId.toLowerCase()] || null;
}

// Fonction pour obtenir l'URL de l'application d'un club
function getClubAppUrl(clubId) {
    const data = getClubData(clubId);
    return data ? data.appUrl : "app-universal-simple.html";
}

// Fonction pour obtenir l'URL de la page équipes d'un club
function getClubEquipesUrl(clubId) {
    return `equipes.html?club=${clubId.toLowerCase()}`;
}
