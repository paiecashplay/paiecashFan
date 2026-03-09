// ========================================
// BASE DE DONNÉES DES ÉQUIPES
// Structure complète pour tous les clubs et fédérations
// ========================================

const equipesDatabase = {
    // ========== MAROC ==========
    "maroc": {
        name: "Maroc 🇲🇦",
        logo: "/logos/maroc-frmf.png",
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
        colors: ["#DA291C", "#004F9E"], // Rouge et bleu
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

    // ========== NICE ==========
    "nice": {
        name: "OGC Nice",
        logo: "assets/logos/clubs/nice.png",
        colors: ["#E2001A", "#000000"], // Rouge et noir
        appUrl: "app-universal-simple.html?club=Nice&logo=⚽&sport=Football&league=Ligue+1",
        categories: [
            {
                title: "⚽ Équipes Masculines",
                teams: [
                    {
                        name: "Équipe Professionnelle",
                        logo: "assets/logos/clubs/nice.png",
                        coach: "Francesco Farioli",
                        league: "Ligue 1",
                        stadium: "Allianz Riviera",
                        url: "app-universal-simple.html?club=Nice+Pro&logo=⚽&sport=Football&league=Ligue+1"
                    }
                ]
            }
        ]
    },

    // ========== LENS ==========
    "lens": {
        name: "RC Lens",
        logo: "assets/logos/clubs/lens.png",
        colors: ["#FFC627", "#DA291C"], // Or et rouge
        appUrl: "app-universal-simple.html?club=Lens&logo=⚽&sport=Football&league=Ligue+1",
        categories: [
            {
                title: "⚽ Équipes Masculines",
                teams: [
                    {
                        name: "Équipe Professionnelle",
                        logo: "assets/logos/clubs/lens.png",
                        coach: "Franck Haise",
                        league: "Ligue 1",
                        stadium: "Stade Bollaert-Delelis",
                        url: "app-universal-simple.html?club=Lens+Pro&logo=⚽&sport=Football&league=Ligue+1"
                    }
                ]
            }
        ]
    },

    // ========== LILLE ==========
    "lille": {
        name: "LOSC Lille",
        logo: "assets/logos/clubs/lille.png",
        colors: ["#E30613", "#FFFFFF"], // Rouge et blanc
        appUrl: "app-universal-simple.html?club=Lille&logo=⚽&sport=Football&league=Ligue+1",
        categories: [
            {
                title: "⚽ Équipes Masculines",
                teams: [
                    {
                        name: "Équipe Professionnelle",
                        logo: "assets/logos/clubs/lille.png",
                        coach: "Paulo Fonseca",
                        league: "Ligue 1",
                        stadium: "Stade Pierre-Mauroy",
                        url: "app-universal-simple.html?club=Lille+Pro&logo=⚽&sport=Football&league=Ligue+1"
                    }
                ]
            }
        ]
    },

    // ========== RENNES ==========
    "rennes": {
        name: "Stade Rennais",
        logo: "assets/logos/clubs/rennes.png",
        colors: ["#E30613", "#000000"], // Rouge et noir
        appUrl: "app-universal-simple.html?club=Rennes&logo=⚽&sport=Football&league=Ligue+1",
        categories: [
            {
                title: "⚽ Équipes Masculines",
                teams: [
                    {
                        name: "Équipe Professionnelle",
                        logo: "assets/logos/clubs/rennes.png",
                        coach: "Julien Stéphan",
                        league: "Ligue 1",
                        stadium: "Roazhon Park",
                        url: "app-universal-simple.html?club=Rennes+Pro&logo=⚽&sport=Football&league=Ligue+1"
                    }
                ]
            }
        ]
    },

    // ========== NANTES ==========
    "nantes": {
        name: "FC Nantes",
        logo: "assets/logos/clubs/nantes.png",
        colors: ["#FFC627", "#006A32"], // Jaune et vert
        appUrl: "app-universal-simple.html?club=Nantes&logo=⚽&sport=Football&league=Ligue+1",
        categories: [
            {
                title: "⚽ Équipes Masculines",
                teams: [
                    {
                        name: "Équipe Professionnelle",
                        logo: "assets/logos/clubs/nantes.png",
                        coach: "Jocelyn Gourvennec",
                        league: "Ligue 1",
                        stadium: "Stade de la Beaujoire",
                        url: "app-universal-simple.html?club=Nantes+Pro&logo=⚽&sport=Football&league=Ligue+1"
                    }
                ]
            }
        ]
    },

    // ========== STRASBOURG ==========
    "strasbourg": {
        name: "RC Strasbourg",
        logo: "assets/logos/clubs/strasbourg.png",
        colors: ["#009FE3", "#FFFFFF"], // Bleu ciel et blanc
        appUrl: "app-universal-simple.html?club=Strasbourg&logo=⚽&sport=Football&league=Ligue+1",
        categories: [
            {
                title: "⚽ Équipes Masculines",
                teams: [
                    {
                        name: "Équipe Professionnelle",
                        logo: "assets/logos/clubs/strasbourg.png",
                        coach: "Patrick Vieira",
                        league: "Ligue 1",
                        stadium: "Stade de la Meinau",
                        url: "app-universal-simple.html?club=Strasbourg+Pro&logo=⚽&sport=Football&league=Ligue+1"
                    }
                ]
            }
        ]
    },

    // ========== BREST ==========
    "brest": {
        name: "Stade Brestois",
        logo: "assets/logos/clubs/brest.png",
        colors: ["#E30613", "#FFFFFF"], // Rouge et blanc
        appUrl: "app-universal-simple.html?club=Brest&logo=⚽&sport=Football&league=Ligue+1",
        categories: [
            {
                title: "⚽ Équipes Masculines",
                teams: [
                    {
                        name: "Équipe Professionnelle",
                        logo: "assets/logos/clubs/brest.png",
                        coach: "Éric Roy",
                        league: "Ligue 1",
                        stadium: "Stade Francis-Le Blé",
                        url: "app-universal-simple.html?club=Brest+Pro&logo=⚽&sport=Football&league=Ligue+1"
                    }
                ]
            }
        ]
    },

    // ========== MONTPELLIER ==========
    "montpellier": {
        name: "Montpellier HSC",
        logo: "assets/logos/clubs/montpellier.png",
        colors: ["#003366", "#FF6600"], // Bleu marine et orange
        appUrl: "app-universal-simple.html?club=Montpellier&logo=⚽&sport=Football&league=Ligue+1",
        categories: [
            {
                title: "⚽ Équipes Masculines",
                teams: [
                    {
                        name: "Équipe Professionnelle",
                        logo: "assets/logos/clubs/montpellier.png",
                        coach: "Michel Der Zakarian",
                        league: "Ligue 1",
                        stadium: "Stade de la Mosson",
                        url: "app-universal-simple.html?club=Montpellier+Pro&logo=⚽&sport=Football&league=Ligue+1"
                    }
                ]
            }
        ]
    },

    // ========== REIMS ==========
    "reims": {
        name: "Stade de Reims",
        logo: "assets/logos/clubs/reims.png",
        colors: ["#E30613", "#FFFFFF"], // Rouge et blanc
        appUrl: "app-universal-simple.html?club=Reims&logo=⚽&sport=Football&league=Ligue+1",
        categories: [
            {
                title: "⚽ Équipes Masculines",
                teams: [
                    {
                        name: "Équipe Professionnelle",
                        logo: "assets/logos/clubs/reims.png",
                        coach: "Will Still",
                        league: "Ligue 1",
                        stadium: "Stade Auguste-Delaune",
                        url: "app-universal-simple.html?club=Reims+Pro&logo=⚽&sport=Football&league=Ligue+1"
                    }
                ]
            }
        ]
    },

    // ========== CAF (Confédération Africaine de Football) ==========
    "caf": {
        name: "CAF",
        logo: "/logos/caf.png",
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
    },

    // ========== TANZANIE ==========
    "tanzanie": {
        name: "Tanzanie 🇹🇿",
        logo: "🇹🇿",
        colors: ["#1EB53A", "#FCD116"],
        appUrl: "app-universal-simple.html?club=Tanzanie&logo=🇹🇿&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇹🇿 Équipes Nationales",
                teams: [
                    { name: "Taifa Stars", fullName: "Équipe Nationale A", logo: "🇹🇿", description: "Les Taifa Stars de Tanzanie", achievements: "CECAFA Cup 1974, 2017", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Tanzanie+ENA&logo=🇹🇿&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Tanzania Premier League",
                teams: [
                    { name: "Simba SC", fullName: "Simba Sports Club", logo: "🇹🇿", founded: 1936, stadium: "Benjamin Mkapa Stadium", titles: 26, description: "Club le plus titré de Tanzanie", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Simba+SC&logo=🇹🇿&sport=Football&league=Tanzania+Premier+League" },
                    { name: "Young Africans", fullName: "Young Africans SC", logo: "🇹🇿", founded: 1935, stadium: "Benjamin Mkapa Stadium", titles: 28, description: "Le grand rival de Simba", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Young+Africans&logo=🇹🇿&sport=Football&league=Tanzania+Premier+League" }
                ]
            }
        ]
    },

    // ========== MAURITANIE ==========
    "mauritanie": {
        name: "Mauritanie 🇲🇷",
        logo: "🇲🇷",
        colors: ["#00A95C", "#FFC72C"],
        appUrl: "app-universal-simple.html?club=Mauritanie&logo=🇲🇷&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇲🇷 Équipes Nationales",
                teams: [
                    { name: "Mourabitounes", fullName: "Équipe Nationale A", logo: "🇲🇷", description: "Les Mourabitounes de Mauritanie", achievements: "Première participation CAN 2019", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Mauritanie+ENA&logo=🇲🇷&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Ligue 1 Mauritanie",
                teams: [
                    { name: "FC Tevragh-Zeina", fullName: "FC Tevragh-Zeina", logo: "🇲🇷", founded: 1999, stadium: "Stade Olympique de Nouakchott", titles: 5, description: "Club le plus titré de Mauritanie", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=FC+Tevragh-Zeina&logo=🇲🇷&sport=Football&league=Ligue+1+Mauritanie" },
                    { name: "ASC Ksar", fullName: "ASC Ksar", logo: "🇲🇷", founded: 1962, stadium: "Stade Olympique de Nouakchott", titles: 4, description: "Club historique de Nouakchott", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=ASC+Ksar&logo=🇲🇷&sport=Football&league=Ligue+1+Mauritanie" }
                ]
            }
        ]
    },

    // ========== KENYA ==========
    "kenya": {
        name: "Kenya 🇰🇪",
        logo: "🇰🇪",
        colors: ["#006600", "#BB0000"],
        appUrl: "app-universal-simple.html?club=Kenya&logo=🇰🇪&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇰🇪 Équipes Nationales",
                teams: [
                    { name: "Harambee Stars", fullName: "Équipe Nationale A", logo: "🇰🇪", description: "Les Harambee Stars du Kenya", achievements: "CECAFA Cup 1975, 1981, 1982", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Kenya+ENA&logo=🇰🇪&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Kenya Premier League",
                teams: [
                    { name: "Gor Mahia", fullName: "Gor Mahia FC", logo: "🇰🇪", founded: 1968, stadium: "Nyayo National Stadium", titles: 20, description: "Club le plus titré du Kenya", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Gor+Mahia&logo=🇰🇪&sport=Football&league=Kenya+Premier+League" },
                    { name: "AFC Leopards", fullName: "AFC Leopards SC", logo: "🇰🇪", founded: 1964, stadium: "Nyayo National Stadium", titles: 13, description: "Grand rival de Gor Mahia", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=AFC+Leopards&logo=🇰🇪&sport=Football&league=Kenya+Premier+League" }
                ]
            }
        ]
    },

    // ========== OUGANDA ==========
    "ouganda": {
        name: "Ouganda 🇺🇬",
        logo: "🇺🇬",
        colors: ["#000000", "#FCDC04"],
        appUrl: "app-universal-simple.html?club=Ouganda&logo=🇺🇬&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇺🇬 Équipes Nationales",
                teams: [
                    { name: "Cranes", fullName: "Équipe Nationale A", logo: "🇺🇬", description: "Les Cranes d'Ouganda", achievements: "CECAFA Cup 1976, 2003", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Ouganda+ENA&logo=🇺🇬&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Uganda Premier League",
                teams: [
                    { name: "KCCA FC", fullName: "Kampala Capital City Authority FC", logo: "🇺🇬", founded: 2008, stadium: "StarTimes Stadium", titles: 14, description: "Club le plus titré d'Ouganda", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=KCCA+FC&logo=🇺🇬&sport=Football&league=Uganda+Premier+League" },
                    { name: "Express FC", fullName: "Express Football Club", logo: "🇺🇬", founded: 1957, stadium: "Mutesa II Wankulukuku Stadium", titles: 9, description: "Club historique de Kampala", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Express+FC&logo=🇺🇬&sport=Football&league=Uganda+Premier+League" }
                ]
            }
        ]
    },

    // ========== CAMEROUN ==========
    "cameroun": {
        name: "Cameroun 🇨🇲",
        logo: "/logos/cameroun-fecafoot.png",
        colors: ["#007A5E", "#CE1126"],
        appUrl: "app-universal-simple.html?club=Cameroun&logo=🇨🇲&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇨🇲 Équipes Nationales",
                teams: [
                    { name: "Lions Indomptables", fullName: "Équipe Nationale A", logo: "🇨🇲", coach: "Marc Brys", description: "Lions Indomptables du Cameroun", achievements: "CAN 1984, 1988, 2000, 2002, 2017", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Cameroun+ENA&logo=🇨🇲&sport=Football&league=CAF" },
                    { name: "Lions U23", fullName: "Équipe Nationale U23", logo: "🇨🇲", coach: "Martin Ndtoungou Mpile", description: "Espoirs camerounais", achievements: "CAN U23", sport: "Football", category: "U23", type: "nationale", appUrl: "app-universal-simple.html?club=Cameroun+U23&logo=🇨🇲&sport=Football&league=CAF" },
                    { name: "Lionnes Indomptables", fullName: "Équipe Nationale Féminine", logo: "🇨🇲", coach: "Gabriel Zabo", description: "Lionnes Indomptables", achievements: "CAN Féminine 2016", sport: "Football", category: "Féminine", type: "nationale", appUrl: "app-universal-simple.html?club=Cameroun+F%C3%A9minine&logo=🇨🇲&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Élite One (D1)",
                teams: [
                    { name: "Canon Yaoundé", fullName: "Canon Sportif de Yaoundé", logo: "🇨🇲", founded: 1930, stadium: "Stade Ahmadou Ahidjo", titles: 10, description: "Club le plus titré du Cameroun", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Canon+Yaound%C3%A9&logo=🇨🇲&sport=Football&league=Elite+One" },
                    { name: "Coton Sport", fullName: "Coton Sport de Garoua", logo: "🇨🇲", founded: 1986, stadium: "Stade Roumdé Adjia", titles: 14, description: "Champion du Cameroun en titre", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Coton+Sport&logo=🇨🇲&sport=Football&league=Elite+One" },
                    { name: "Tonnerre Yaoundé", fullName: "Tonnerre Kalara Club", logo: "🇨🇲", founded: 1934, stadium: "Stade Ahmadou Ahidjo", titles: 8, description: "Légende du football camerounais", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Tonnerre+Yaound%C3%A9&logo=🇨🇲&sport=Football&league=Elite+One" },
                    { name: "Union Douala", fullName: "Union Sportive de Douala", logo: "🇨🇲", founded: 1958, stadium: "Stade de la Réunion", titles: 6, description: "Club historique de Douala", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Union+Douala&logo=🇨🇲&sport=Football&league=Elite+One" },
                    { name: "Eding Sport", fullName: "Eding Sport FC", logo: "🇨🇲", founded: 2002, stadium: "Stade Municipal de Sa’a", titles: 3, description: "Club de Sa’a", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Eding+Sport&logo=🇨🇲&sport=Football&league=Elite+One" },
                    { name: "PWD Bamenda", fullName: "PWD Bamenda FC", logo: "🇨🇲", founded: 1959, stadium: "Stade Municipal de Bamenda", titles: 2, description: "Club des Hautes Terres", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=PWD+Bamenda&logo=🇨🇲&sport=Football&league=Elite+One" }
                ]
            }
        ]
    },

    // ========== CÔTE D'IVOIRE ==========
    "cote-divoire": {
        name: "Côte d'Ivoire 🇨🇮",
        logo: "/logos/cote-ivoire-fif.png",
        colors: ["#F77F00", "#009A44"],
        appUrl: "app-universal-simple.html?club=C%C3%B4te+d'Ivoire&logo=🇨🇮&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇨🇮 Équipes Nationales",
                teams: [
                    { name: "Eléphants", fullName: "Équipe Nationale A", logo: "🇨🇮", coach: "Emerse Faé", description: "Eléphants de Côte d'Ivoire", achievements: "CAN 1992, 2015, 2023", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=C%C3%B4te+d'Ivoire+ENA&logo=🇨🇮&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs LIGA 1 Ivoirienne",
                teams: [
                    { name: "ASEC Mimosas", fullName: "ASEC Mimosas d'Abidjan", logo: "🇨🇮", founded: 1948, stadium: "Stade Félix Houphouët-Boigny", titles: 26, description: "Club le plus titré de Côte d'Ivoire", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=ASEC+Mimosas&logo=🇨🇮&sport=Football&league=LIGA1+Ivoire" },
                    { name: "Africa Sports", fullName: "Africa Sports National d'Abidjan", logo: "🇨🇮", founded: 1947, stadium: "Stade Félix Houphouët-Boigny", titles: 14, description: "Club historique d'Abidjan", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Africa+Sports&logo=🇨🇮&sport=Football&league=LIGA1+Ivoire" },
                    { name: "Stade d'Abidjan", fullName: "Stade d'Abidjan FC", logo: "🇨🇮", founded: 1936, stadium: "Stade Félix Houphouët-Boigny", titles: 9, description: "Doyen des clubs ivoiriens", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Stade+d'Abidjan&logo=🇨🇮&sport=Football&league=LIGA1+Ivoire" }
                ]
            }
        ]
    },

    // ========== SÉNÉGAL ==========
    "senegal": {
        name: "Sénégal 🇸🇳",
        logo: "🇸🇳",
        colors: ["#00853F", "#FDEF42"],
        appUrl: "app-universal-simple.html?club=S%C3%A9n%C3%A9gal&logo=🇸🇳&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇸🇳 Équipes Nationales",
                teams: [
                    { name: "Lions de la Teranga", fullName: "Équipe Nationale A", logo: "🇸🇳", coach: "Aliou Cissé", description: "Lions de la Teranga", achievements: "CAN 2021, 2022", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=S%C3%A9n%C3%A9gal+ENA&logo=🇸🇳&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Ligue 1 Sénégalaise",
                teams: [
                    { name: "Jaraaf", fullName: "ASC Jaraaf de Dakar", logo: "🇸🇳", founded: 1969, stadium: "Stade Léopold Sédar Senghor", titles: 11, description: "Club le plus titré du Sénégal", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Jaraaf&logo=🇸🇳&sport=Football&league=Ligue1+S%C3%A9n%C3%A9gal" },
                    { name: "Diaraf", fullName: "ASC Diaraf de Dakar", logo: "🇸🇳", founded: 1956, stadium: "Stade Léopold Sédar Senghor", titles: 9, description: "Club historique de Dakar", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Diaraf&logo=🇸🇳&sport=Football&league=Ligue1+S%C3%A9n%C3%A9gal" },
                    { name: "Generation Foot", fullName: "Génération Foot", logo: "🇸🇳", founded: 1999, stadium: "Stade Lat Dior", titles: 4, description: "Académie et club professionnel", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Generation+Foot&logo=🇸🇳&sport=Football&league=Ligue1+S%C3%A9n%C3%A9gal" }
                ]
            }
        ]
    },

    // ========== NIGERIA ==========
    "nigeria": {
        name: "Nigeria 🇳🇬",
        logo: "/logos/nigeria-nff.png",
        colors: ["#008751", "#FFFFFF"],
        appUrl: "app-universal-simple.html?club=Nigeria&logo=🇳🇬&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇳🇬 Équipes Nationales",
                teams: [
                    { name: "Super Eagles", fullName: "Équipe Nationale A", logo: "🇳🇬", coach: "Augustine Eguavoen", description: "Super Eagles du Nigeria", achievements: "CAN 1980, 1994, 2013 • JO 1996", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Nigeria+ENA&logo=🇳🇬&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Nigeria Premier League",
                teams: [
                    { name: "Enyimba FC", fullName: "Enyimba International FC", logo: "🇳🇬", founded: 1976, stadium: "Enyimba International Stadium", titles: 8, description: "Club le plus titré du Nigeria", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Enyimba&logo=🇳🇬&sport=Football&league=Nigeria+Premier+League" },
                    { name: "Kano Pillars", fullName: "Kano Pillars FC", logo: "🇳🇬", founded: 1990, stadium: "Sani Abacha Stadium", titles: 4, description: "Club du nord du Nigeria", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Kano+Pillars&logo=🇳🇬&sport=Football&league=Nigeria+Premier+League" },
                    { name: "Rivers United", fullName: "Rivers United FC", logo: "🇳🇬", founded: 2016, stadium: "Adokiye Amiesimaka Stadium", titles: 2, description: "Champion du Nigeria 2022, 2023", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Rivers+United&logo=🇳🇬&sport=Football&league=Nigeria+Premier+League" }
                ]
            }
        ]
    },

    // ========== ALGÉRIE ==========
    "algerie": {
        name: "Algérie 🇩🇿",
        logo: "/logos/algerie-faf.png",
        colors: ["#006233", "#FFFFFF"],
        appUrl: "app-universal-simple.html?club=Alg%C3%A9rie&logo=🇩🇿&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇩🇿 Équipes Nationales",
                teams: [
                    { name: "Fennecs", fullName: "Équipe Nationale A", logo: "/logos/algerie-faf.png", coach: "Pepe", description: "Fennecs d'Algérie", achievements: "CAN 1990, 2019", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Alg%C3%A9rie+ENA&logo=🇩🇿&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Ligue Professionnelle 1",
                teams: [
                    { name: "USM Alger", fullName: "Union Sportive de la Médina d'Alger", logo: "/logos/usm-alger.png", founded: 1937, stadium: "Stade Omar Hamadi", titles: 11, description: "Club le plus titré d'Algérie", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=USM+Alger&logo=🇩🇿&sport=Football&league=Ligue+Pro+1" },
                    { name: "MC Alger", fullName: "Mouloudia Club d'Alger", logo: "/logos/mc-alger.png", founded: 1921, stadium: "Stade du 5 Juillet 1962", titles: 9, description: "Le Doyen du football algérien", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=MC+Alger&logo=🇩🇿&sport=Football&league=Ligue+Pro+1" },
                    { name: "CR Belouizdad", fullName: "Club de la Renaissance de Belouizdad", logo: "/logos/cr-belouizdad.png", founded: 1914, stadium: "Stade du 5 Juillet 1962", titles: 8, description: "Club historique d'Alger", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=CR+Belouizdad&logo=🇩🇿&sport=Football&league=Ligue+Pro+1" }
                ]
            }
        ]
    },

    // ========== ÉGYPTE ==========
    "egypte": {
        name: "Égypte 🇪🇬",
        logo: "/logos/egypte-fa.png",
        colors: ["#CE1126", "#000000"],
        appUrl: "app-universal-simple.html?club=Egypte&logo=🇪🇬&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇪🇬 Équipes Nationales",
                teams: [
                    { name: "Pharaons", fullName: "Équipe Nationale A", logo: "/logos/egypte-fa.png", coach: "Hossam Hassan", description: "Les Pharaons d'Égypte", achievements: "CAN 1957, 1959, 1986, 1998, 2006, 2008, 2010 (7 titres)", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Egypte+ENA&logo=🇪🇬&sport=Football&league=CAF" },
                    { name: "Pharaons U23", fullName: "Équipe Nationale Olympique", logo: "🇪🇬", description: "Sélection olympique égyptienne", sport: "Football", category: "U23", type: "nationale", appUrl: "app-universal-simple.html?club=Egypte+U23&logo=🇪🇬&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Egyptian Premier League",
                teams: [
                    { name: "Al Ahly", fullName: "Al Ahly Sporting Club", logo: "/logos/al-ahly.png", founded: 1907, stadium: "Al-Salam Stadium", titles: 44, description: "Le club le plus titré d'Afrique", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al+Ahly&logo=🇪🇬&sport=Football&league=Egyptian+Premier+League" },
                    { name: "Zamalek", fullName: "Zamalek Sporting Club", logo: "/logos/zamalek.png", founded: 1911, stadium: "Cairo International Stadium", titles: 13, description: "Le grand rival d'Al Ahly", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Zamalek&logo=🇪🇬&sport=Football&league=Egyptian+Premier+League" },
                    { name: "Pyramids FC", fullName: "Pyramids Football Club", logo: "/logos/pyramids-fc.png", founded: 2008, stadium: "Air Defence Stadium", titles: 1, description: "Club ambitieux du Caire", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Pyramids+FC&logo=🇪🇬&sport=Football&league=Egyptian+Premier+League" },
                    { name: "Ismaily", fullName: "Ismaily Sporting Club", logo: "/logos/ismaily.png", founded: 1924, stadium: "Ismailia Stadium", titles: 3, description: "Club historique d'Ismaïlia", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Ismaily&logo=🇪🇬&sport=Football&league=Egyptian+Premier+League" }
                ]
            }
        ]
    },

    // ========== TUNISIE ==========
    "tunisie": {
        name: "Tunisie 🇹🇳",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Federation_Tunisienne_de_Football_logo.png/200px-Federation_Tunisienne_de_Football_logo.png",
        colors: ["#E70013", "#FFFFFF"],
        appUrl: "app-universal-simple.html?club=Tunisie&logo=🇹🇳&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇹🇳 Équipes Nationales",
                teams: [
                    { name: "Aigles de Carthage", fullName: "Équipe Nationale A", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Federation_Tunisienne_de_Football_logo.png/200px-Federation_Tunisienne_de_Football_logo.png", coach: "Faouzi Benzarti", description: "Les Aigles de Carthage", achievements: "CAN 2004", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Tunisie+ENA&logo=🇹🇳&sport=Football&league=CAF" },
                    { name: "Aigles U23", fullName: "Équipe Nationale Olympique", logo: "🇹🇳", description: "Sélection olympique tunisienne", sport: "Football", category: "U23", type: "nationale", appUrl: "app-universal-simple.html?club=Tunisie+U23&logo=🇹🇳&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Ligue Professionnelle 1",
                teams: [
                    { name: "Espérance Tunis", fullName: "Espérance Sportive de Tunis", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/37/Esperance_Sportive_de_Tunis.png/200px-Esperance_Sportive_de_Tunis.png", founded: 1919, stadium: "Stade Olympique de Radès", titles: 32, description: "Club le plus titré de Tunisie", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Esperance+Tunis&logo=🇹🇳&sport=Football&league=Ligue+Pro+1+Tunisie" },
                    { name: "Club Africain", fullName: "Club Africain", logo: "🇹🇳", founded: 1920, stadium: "Stade Olympique de Radès", titles: 13, description: "Grand rival de l'Espérance", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Club+Africain&logo=🇹🇳&sport=Football&league=Ligue+Pro+1+Tunisie" },
                    { name: "Étoile du Sahel", fullName: "Étoile Sportive du Sahel", logo: "🇹🇳", founded: 1925, stadium: "Stade Taïeb Mhiri", titles: 12, description: "Club de Sousse", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Etoile+Sahel&logo=🇹🇳&sport=Football&league=Ligue+Pro+1+Tunisie" },
                    { name: "CS Sfaxien", fullName: "Club Sportif Sfaxien", logo: "🇹🇳", founded: 1928, stadium: "Stade Taïeb Mhiri", titles: 9, description: "Le club de Sfax", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=CS+Sfaxien&logo=🇹🇳&sport=Football&league=Ligue+Pro+1+Tunisie" }
                ]
            }
        ]
    },

    // ========== LIBYE ==========
    "libye": {
        name: "Libye 🇱🇾",
        logo: "/logos/libye-lff.png",
        colors: ["#000000", "#FFFFFF", "#009A44"],
        appUrl: "app-universal-simple.html?club=Libye&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇱🇾 Équipes Nationales",
                teams: [
                    { name: "Chevaliers de la Méditerranée", fullName: "Équipe Nationale A", logo: "/logos/libye-lff.png", description: "Équipe nationale de Libye", achievements: "Finaliste CAN 1982", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Libye+ENA&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Libyan Premier League",
                teams: [
                    { name: "Al-Ahly Tripoli", fullName: "Al-Ahly Tripoli SC", logo: "/logos/al-ahly-tripoli.png", founded: 1950, stadium: "Stade du 11 Juin", titles: 14, description: "Club le plus titré de Tripoli (14 titres)", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al-Ahly+Tripoli&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Al-Ittihad Tripoli", fullName: "Al-Ittihad Tripoli SC", logo: "/logos/al-ittihad-tripoli.png", founded: 1944, stadium: "Stade Jumayl", titles: 18, description: "Club le plus titré de Libye (18 titres)", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al-Ittihad+Tripoli&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Al-Ahly Benghazi", fullName: "Al-Ahly Benghazi SC", logo: "/logos/al-ahly-benghazi.png", founded: 1947, stadium: "Martyrs of February Stadium", titles: 4, description: "Grand club de Benghazi (4 titres)", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al-Ahly+Benghazi&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Al-Nasr Benghazi", fullName: "Al-Nasr Benghazi SC", logo: "/logos/al-nasr-benghazi.png", founded: 1954, stadium: "Martyrs of February Stadium", titles: 3, description: "Champion 2023-24", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al-Nasr+Benghazi&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Al-Tahaddy Benghazi", fullName: "Al-Tahaddy Benghazi SC", logo: "/logos/al-tahaddy-benghazi.png", founded: 1954, stadium: "March 28 Stadium", titles: 3, description: "Club historique de Benghazi (3 titres)", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al-Tahaddy+Benghazi&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Al-Madina Tripoli", fullName: "Al-Madina Tripoli SC", logo: "/logos/al-madina.png", founded: 1953, stadium: "GMR Stadium", titles: 3, description: "Club de Tripoli (3 titres)", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al-Madina+Tripoli&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Al-Hilal Benghazi", fullName: "Al-Hilal Benghazi SC", logo: "/logos/al-hilal-benghazi.png", founded: 1956, stadium: "Martyrs of February Stadium", titles: 0, description: "Club de Benghazi", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al-Hilal+Benghazi&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Al-Akhdar", fullName: "Al-Akhdar SC", logo: "/logos/al-akhdar.png", founded: 1958, stadium: "Sheikh Chadae Stadium", titles: 0, description: "Club de Bayda (Cyrénaïque)", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al-Akhdar&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Al-Ta'awon Ajdabiya", fullName: "Al-Ta'awon SC Ajdabiya", logo: "/logos/al-taawon-ejdabiya.png", founded: 1960, stadium: "10 June Stadium", titles: 0, description: "Club d'Ajdabiya", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al-Taawon+Ajdabiya&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Al-Suqoor Tobruk", fullName: "Al-Suqoor SC Tobruk", logo: "🇱🇾", founded: 1965, stadium: "Tobruk Stadium", titles: 0, description: "Club de Tobrouk", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al-Suqoor+Tobruk&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Al-Sadaqa Shahhat", fullName: "Al-Sadaqa SC Shahhat", logo: "🇱🇾", founded: 1970, stadium: "Shahhat Stadium", titles: 0, description: "Club de Shahhat", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al-Sadaqa+Shahhat&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Al-Morouj Marj", fullName: "Al-Morouj SC Marj", logo: "🇱🇾", founded: 1968, stadium: "Al Marj Stadium", titles: 0, description: "Club de Marj", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al-Morouj+Marj&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Al-Anwar Al-Abyar", fullName: "Al-Anwar SC Al-Abyar", logo: "🇱🇾", founded: 1972, stadium: "Martyrs of Al-Abyar Stadium", titles: 0, description: "Club d'Al-Abyar", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al-Anwar+Al-Abyar&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Al-Ittihad Misrata", fullName: "Al-Ittihad Misrata SC", logo: "🇱🇾", founded: 1960, stadium: "Al-Shumooa Stadium", titles: 0, description: "Club de Misrata", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al-Ittihad+Misrata&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Asswehly Misrata", fullName: "Asswehly SC Misrata", logo: "🇱🇾", founded: 1975, stadium: "Al-Shumooa Stadium", titles: 0, description: "Club de Misrata", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Asswehly+Misrata&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Al-Bashayr Misrata", fullName: "Al-Bashayr SC Misrata", logo: "🇱🇾", founded: 1980, stadium: "Al-Shumooa Stadium", titles: 0, description: "Club de Misrata", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al-Bashayr+Misrata&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Olympic Azzaweya", fullName: "Olympic Azzaweya SC", logo: "🇱🇾", founded: 1963, stadium: "Olympic Stadium Zawiya", titles: 1, description: "Club de Zawiya (1 titre 2003-04)", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Olympic+Azzaweya&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Asaria Zawiya", fullName: "Asaria SC Zawiya", logo: "🇱🇾", founded: 1970, stadium: "Olympic Stadium Zawiya", titles: 0, description: "Club de Zawiya", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Asaria+Zawiya&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Al-Khums", fullName: "Al-Khums SC", logo: "🇱🇾", founded: 1958, stadium: "Al-Khums Stadium", titles: 0, description: "Club d'Al Khums (Leptis Magna)", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Al-Khums&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" },
                    { name: "Abu Salem Tripoli", fullName: "Abu Salem SC Tripoli", logo: "🇱🇾", founded: 1965, stadium: "Abu Salem Stadium", titles: 0, description: "Club de Tripoli", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Abu+Salem+Tripoli&logo=%F0%9F%87%B1%F0%9F%87%BE&sport=Football&league=Libyan+Premier+League" }
                ]
            }
        ]
    },
        // ========== GHANA ==========
    "ghana": {
        name: "Ghana 🇬🇭",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/Ghana_Football_Association_logo.svg/200px-Ghana_Football_Association_logo.svg.png",
        colors: ["#006B3F", "#FCD116"],
        appUrl: "app-universal-simple.html?club=Ghana&logo=🇬🇭&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇬🇭 Équipes Nationales",
                teams: [
                    { name: "Black Stars", fullName: "Équipe Nationale A", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/Ghana_Football_Association_logo.svg/200px-Ghana_Football_Association_logo.svg.png", coach: "Otto Addo", description: "Les Black Stars du Ghana", achievements: "CAN 1963, 1965, 1978, 1982", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Ghana+ENA&logo=🇬🇭&sport=Football&league=CAF" },
                    { name: "Black Satellites", fullName: "Équipe Nationale U20", logo: "🇬🇭", description: "Champions du Monde U20 2009", sport: "Football", category: "U20", type: "nationale", appUrl: "app-universal-simple.html?club=Ghana+U20&logo=🇬🇭&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Ghana Premier League",
                teams: [
                    { name: "Asante Kotoko", fullName: "Asante Kotoko Sporting Club", logo: "🇬🇭", founded: 1935, stadium: "Baba Yara Stadium", titles: 25, description: "Club le plus titré du Ghana", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Asante+Kotoko&logo=🇬🇭&sport=Football&league=Ghana+Premier+League" },
                    { name: "Hearts of Oak", fullName: "Accra Hearts of Oak SC", logo: "🇬🇭", founded: 1911, stadium: "Accra Sports Stadium", titles: 21, description: "Club historique d'Accra", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Hearts+of+Oak&logo=🇬🇭&sport=Football&league=Ghana+Premier+League" },
                    { name: "Medeama SC", fullName: "Medeama Sporting Club", logo: "🇬🇭", founded: 1956, stadium: "Akoon Community Park", titles: 2, description: "Club de Tarkwa", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Medeama+SC&logo=🇬🇭&sport=Football&league=Ghana+Premier+League" }
                ]
            }
        ]
    },

    // ========== MALI ==========
    "mali": {
        name: "Mali 🇲🇱",
        logo: "/logos/mali-femafoot.png",
        colors: ["#009A00", "#CE1126"],
        appUrl: "app-universal-simple.html?club=Mali&logo=🇲🇱&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇲🇱 Équipes Nationales",
                teams: [
                    { name: "Aigles du Mali", fullName: "Équipe Nationale A", logo: "🇲🇱", coach: "Eric Chelle", description: "Les Aigles du Mali", achievements: "Finaliste CAN 1972", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Mali+ENA&logo=🇲🇱&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Ligue 1 Mali",
                teams: [
                    { name: "Stade Malien", fullName: "Stade Malien de Bamako", logo: "🇲🇱", founded: 1960, stadium: "Stade du 26 Mars", titles: 19, description: "Club le plus titré du Mali", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Stade+Malien&logo=🇲🇱&sport=Football&league=Ligue+1+Mali" },
                    { name: "Djoliba AC", fullName: "Djoliba Athletic Club", logo: "🇲🇱", founded: 1960, stadium: "Stade du 26 Mars", titles: 17, description: "Grand rival du Stade Malien", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Djoliba+AC&logo=🇲🇱&sport=Football&league=Ligue+1+Mali" }
                ]
            }
        ]
    },

    // ========== GUINÉE ==========
    "guinee": {
        name: "Guinée 🇬🇳",
        logo: "🇬🇳",
        colors: ["#CE1126", "#FCD116"],
        appUrl: "app-universal-simple.html?club=Guinee&logo=🇬🇳&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇬🇳 Équipes Nationales",
                teams: [
                    { name: "Syli National", fullName: "Équipe Nationale A", logo: "🇬🇳", description: "Le Syli National de Guinée", achievements: "Demi-finaliste CAN 1976", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Guinee+ENA&logo=🇬🇳&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Ligue 1 Guinée",
                teams: [
                    { name: "Horoya AC", fullName: "Horoya Athletic Club", logo: "🇬🇳", founded: 1952, stadium: "Stade du 28 Septembre", titles: 20, description: "Club le plus titré de Guinée", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Horoya+AC&logo=🇬🇳&sport=Football&league=Ligue+1+Guinee" },
                    { name: "Hafia FC", fullName: "Hafia Football Club", logo: "🇬🇳", founded: 1954, stadium: "Stade du 28 Septembre", titles: 15, description: "3x Champion d'Afrique (1972, 1975, 1977)", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Hafia+FC&logo=🇬🇳&sport=Football&league=Ligue+1+Guinee" }
                ]
            }
        ]
    },

    // ========== BURKINA FASO ==========
    "burkina-faso": {
        name: "Burkina Faso 🇧🇫",
        logo: "/logos/burkina-faso-fbf.jpg",
        colors: ["#EF2B2D", "#009A44"],
        appUrl: "app-universal-simple.html?club=Burkina+Faso&logo=🇧🇫&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇧🇫 Équipes Nationales",
                teams: [
                    { name: "Étalons", fullName: "Équipe Nationale A", logo: "🇧🇫", description: "Les Étalons du Burkina Faso", achievements: "Finaliste CAN 2013", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Burkina+ENA&logo=🇧🇫&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Ligue 1 Burkina",
                teams: [
                    { name: "ASFA Yennenga", fullName: "ASFA Yennenga", logo: "🇧🇫", founded: 1959, stadium: "Stade du 4 Août", titles: 10, description: "Club le plus titré du Burkina", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=ASFA+Yennenga&logo=🇧🇫&sport=Football&league=Ligue+1+Burkina" },
                    { name: "Étoile Filante", fullName: "Étoile Filante de Ouagadougou", logo: "🇧🇫", founded: 1946, stadium: "Stade du 4 Août", titles: 8, description: "Club historique de Ouagadougou", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Etoile+Filante&logo=🇧🇫&sport=Football&league=Ligue+1+Burkina" }
                ]
            }
        ]
    },

    // ========== ÉTHIOPIE ==========
    "ethiopie": {
        name: "Éthiopie 🇪🇹",
        logo: "🇪🇹",
        colors: ["#078930", "#FCDD09"],
        appUrl: "app-universal-simple.html?club=Ethiopie&logo=🇪🇹&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇪🇹 Équipes Nationales",
                teams: [
                    { name: "Walias", fullName: "Équipe Nationale A", logo: "🇪🇹", description: "Les Walias d'Éthiopie", achievements: "CAN 1962", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Ethiopie+ENA&logo=🇪🇹&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Ethiopian Premier League",
                teams: [
                    { name: "St. George SA", fullName: "Saint George Sporting Association", logo: "🇪🇹", founded: 1935, stadium: "Addis Ababa Stadium", titles: 28, description: "Club le plus titré d'Éthiopie", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=St+George+SA&logo=🇪🇹&sport=Football&league=Ethiopian+Premier+League" },
                    { name: "Ethiopian Coffee", fullName: "Ethiopian Coffee SC", logo: "🇪🇹", founded: 1948, stadium: "Addis Ababa Stadium", titles: 9, description: "Club historique d'Addis-Abeba", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Ethiopian+Coffee&logo=🇪🇹&sport=Football&league=Ethiopian+Premier+League" }
                ]
            }
        ]
    },

    // ========== AFRIQUE DU SUD ==========
    "afrique-du-sud": {
        name: "Afrique du Sud 🇿🇦",
        logo: "/logos/afrique-du-sud-safa.png",
        colors: ["#007A4D", "#FFB81C"],
        appUrl: "app-universal-simple.html?club=Afrique+du+Sud&logo=🇿🇦&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇿🇦 Équipes Nationales",
                teams: [
                    { name: "Bafana Bafana", fullName: "Équipe Nationale A", logo: "🇿🇦", coach: "Hugo Broos", description: "Les Bafana Bafana d'Afrique du Sud", achievements: "CAN 1996", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Afrique+du+Sud+ENA&logo=🇿🇦&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs DStv Premiership",
                teams: [
                    { name: "Kaizer Chiefs", fullName: "Kaizer Chiefs FC", logo: "🇿🇦", founded: 1970, stadium: "FNB Stadium", titles: 18, description: "Club le plus populaire d'Afrique du Sud", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Kaizer+Chiefs&logo=🇿🇦&sport=Football&league=DStv+Premiership" },
                    { name: "Orlando Pirates", fullName: "Orlando Pirates FC", logo: "🇿🇦", founded: 1937, stadium: "Orlando Stadium", titles: 4, description: "Grand rival des Kaizer Chiefs", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Orlando+Pirates&logo=🇿🇦&sport=Football&league=DStv+Premiership" },
                    { name: "Mamelodi Sundowns", fullName: "Mamelodi Sundowns FC", logo: "🇿🇦", founded: 1970, stadium: "Loftus Versfeld Stadium", titles: 13, description: "Champion d'Afrique 2016", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Mamelodi+Sundowns&logo=🇿🇦&sport=Football&league=DStv+Premiership" }
                ]
            }
        ]
    },

    // ========== ZIMBABWE ==========
    "zimbabwe": {
        name: "Zimbabwe 🇿🇼",
        logo: "🇿🇼",
        colors: ["#006400", "#FFD200"],
        appUrl: "app-universal-simple.html?club=Zimbabwe&logo=🇿🇼&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇿🇼 Équipes Nationales",
                teams: [
                    { name: "Warriors", fullName: "Équipe Nationale A", logo: "🇿🇼", description: "Les Warriors du Zimbabwe", achievements: "COSAFA Cup 2000, 2003", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Zimbabwe+ENA&logo=🇿🇼&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Zimbabwe Premier Soccer League",
                teams: [
                    { name: "Dynamos FC", fullName: "Dynamos Football Club", logo: "🇿🇼", founded: 1963, stadium: "National Sports Stadium", titles: 20, description: "Club le plus titré du Zimbabwe", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Dynamos+FC&logo=🇿🇼&sport=Football&league=Zimbabwe+PSL" },
                    { name: "CAPS United", fullName: "CAPS United FC", logo: "🇿🇼", founded: 1965, stadium: "National Sports Stadium", titles: 12, description: "Club historique de Harare", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=CAPS+United&logo=🇿🇼&sport=Football&league=Zimbabwe+PSL" }
                ]
            }
        ]
    },

    // ========== ANGOLA ==========
    "angola": {
        name: "Angola 🇦🇴",
        logo: "🇦🇴",
        colors: ["#CC0000", "#000000"],
        appUrl: "app-universal-simple.html?club=Angola&logo=🇦🇴&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇦🇴 Équipes Nationales",
                teams: [
                    { name: "Palancas Negras", fullName: "Équipe Nationale A", logo: "🇦🇴", description: "Les Palancas Negras d'Angola", achievements: "Demi-finaliste CAN 2010", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Angola+ENA&logo=🇦🇴&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Girabola",
                teams: [
                    { name: "Petro de Luanda", fullName: "Atlético Petróleos de Luanda", logo: "🇦🇴", founded: 1947, stadium: "Estádio 11 de Novembro", titles: 16, description: "Club le plus titré d'Angola", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Petro+Luanda&logo=🇦🇴&sport=Football&league=Girabola" },
                    { name: "Primeiro de Agosto", fullName: "Primeiro de Agosto", logo: "🇦🇴", founded: 1977, stadium: "Estádio 11 de Novembro", titles: 13, description: "Club ambitieux de Luanda", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=Primeiro+Agosto&logo=🇦🇴&sport=Football&league=Girabola" }
                ]
            }
        ]
    },

    // ========== CONGO RDC ==========
    "congo-rdc": {
        name: "Congo RDC 🇨🇩",
        logo: "🇨🇩",
        colors: ["#007FFF", "#F7D618"],
        appUrl: "app-universal-simple.html?club=Congo+RDC&logo=🇨🇩&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇨🇩 Équipes Nationales",
                teams: [
                    { name: "Léopards", fullName: "Équipe Nationale A", logo: "🇨🇩", description: "Les Léopards du Congo RDC", achievements: "CAN 1968, 1974", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Congo+RDC+ENA&logo=🇨🇩&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Linafoot",
                teams: [
                    { name: "TP Mazembe", fullName: "Tout Puissant Mazembe", logo: "🇨🇩", founded: 1939, stadium: "Stade TP Mazembe", titles: 20, description: "5x Champion d'Afrique", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=TP+Mazembe&logo=🇨🇩&sport=Football&league=Linafoot" },
                    { name: "AS Vita Club", fullName: "Association Sportive Vita Club", logo: "🇨🇩", founded: 1935, stadium: "Stade des Martyrs", titles: 14, description: "Club historique de Kinshasa", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=AS+Vita+Club&logo=🇨🇩&sport=Football&league=Linafoot" }
                ]
            }
        ]
    },
};

// Fonction pour obtenir les données d'un club/fédération
function getClubData(clubId) {
    if (!clubId) return null;
    // Normaliser l'ID : décoder l'URL, enlever les accents, normaliser les séparateurs
    let id = clubId;
    try { id = decodeURIComponent(id); } catch(e) {}
    id = id.toLowerCase().trim()
        .replace(/\u2019|\u2018/g, "'")
        .replace(/\u00e9|\u00e8|\u00ea/g, 'e')
        .replace(/\u00e0|\u00e2/g, 'a')
        .replace(/\u00f4/g, 'o')
        .replace(/\u00fb|\u00fc/g, 'u')
        .replace(/\u00ee|\u00ef/g, 'i')
        .replace(/\u00e7/g, 'c');
    // Cherche d'abord la clé exacte normalisée
    if (equipesDatabase[id]) return equipesDatabase[id];
    // Cherche la clé originale non normalisée
    if (equipesDatabase[clubId.toLowerCase()]) return equipesDatabase[clubId.toLowerCase()];
    // Recherche partielle : la clé contient l'ID ou vice versa
    for (const [k, v] of Object.entries(equipesDatabase)) {
        const kNorm = k.toLowerCase()
            .replace(/\u00e9|\u00e8|\u00ea/g, 'e')
            .replace(/\u00e0|\u00e2/g, 'a')
            .replace(/\u00f4/g, 'o')
            .replace(/\u00fb|\u00fc/g, 'u')
            .replace(/\u00ee|\u00ef/g, 'i')
            .replace(/\u00e7/g, 'c');
        if (kNorm === id || kNorm.replace(/[-\s']/g,'') === id.replace(/[-\s']/g,'')) {
            return v;
        }
    }
    return null;
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
