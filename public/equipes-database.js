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
    },

    // ========== TANZANIE ==========
    "tanzanie": {
        name: "Tanzanie 🇹🇿",
        logo: "🇹🇿",
        colors: ["#1EB53A", "#00A3DD"],
        appUrl: "equipes-tanzanie.html",
        categories: []
    },

    // ========== MAURITANIE ==========
    "mauritanie": {
        name: "Mauritanie 🇲🇷",
        logo: "🇲🇷",
        colors: ["#00A95C", "#FFC72C"],
        appUrl: "equipes-mauritanie.html",
        categories: []
    },

    // ========== KENYA ==========
    "kenya": {
        name: "Kenya 🇰🇪",
        logo: "🇰🇪",
        colors: ["#006600", "#DC143C"],
        appUrl: "equipes-kenya.html",
        categories: []
    },

    // ========== OUGANDA ==========
    "ouganda": {
        name: "Ouganda 🇺🇬",
        logo: "🇺🇬",
        colors: ["#FCDC04", "#D90000"],
        appUrl: "equipes-ouganda.html",
        categories: []
    },

    // ========== CAMEROUN ==========
    "cameroun": {
        name: "Cameroun 🇨🇲",
        logo: "🇨🇲",
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
        logo: "🇨🇮",
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
        logo: "🇳🇬",
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
        logo: "🇩🇿",
        colors: ["#006233", "#FFFFFF"],
        appUrl: "app-universal-simple.html?club=Alg%C3%A9rie&logo=🇩🇿&sport=Football+Federation&league=CAF",
        categories: [
            {
                title: "🇩🇿 Équipes Nationales",
                teams: [
                    { name: "Fennecs", fullName: "Équipe Nationale A", logo: "🇩🇿", coach: "Pepe", description: "Fennecs d'Algérie", achievements: "CAN 1990, 2019", sport: "Football", category: "Séniors", type: "nationale", appUrl: "app-universal-simple.html?club=Alg%C3%A9rie+ENA&logo=🇩🇿&sport=Football&league=CAF" }
                ]
            },
            {
                title: "⚽ Clubs Ligue Professionnelle 1",
                teams: [
                    { name: "USM Alger", fullName: "Union Sportive de la Médina d'Alger", logo: "🇩🇿", founded: 1937, stadium: "Stade Omar Hamadi", titles: 11, description: "Club le plus titré d'Algérie", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=USM+Alger&logo=🇩🇿&sport=Football&league=Ligue+Pro+1" },
                    { name: "MC Alger", fullName: "Mouloudia Club d'Alger", logo: "🇩🇿", founded: 1921, stadium: "Stade du 5 Juillet 1962", titles: 9, description: "Le Doyen du football algérien", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=MC+Alger&logo=🇩🇿&sport=Football&league=Ligue+Pro+1" },
                    { name: "CR Belouizdad", fullName: "Club de la Renaissance de Belouizdad", logo: "🇩🇿", founded: 1914, stadium: "Stade du 5 Juillet 1962", titles: 8, description: "Club historique d'Alger", sport: "Football", category: "Professionnel", type: "masculin", appUrl: "app-universal-simple.html?club=CR+Belouizdad&logo=🇩🇿&sport=Football&league=Ligue+Pro+1" }
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
