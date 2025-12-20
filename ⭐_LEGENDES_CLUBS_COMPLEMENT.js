/**
 * ⭐ LÉGENDES DES CLUBS - COMPLÉMENT
 * Ajout des légendes manquantes pour clubs européens
 * UNIQUEMENT JOUEURS RETRAITÉS (pour NFT solidaires)
 */

const LEGENDES_CLUBS_COMPLEMENT = {
    // ========================================
    // LIVERPOOL FC
    // ========================================
    'liverpool-fc': {
        club: 'Liverpool FC',
        logo: '🔴',
        legendes: [
            {
                nom: 'Steven Gerrard',
                role: 'Milieu de terrain / Capitaine',
                periode: '1998-2015',
                photo: 'https://www.liverpoolfc.com/gerrard.jpg',
                palmares: [
                    'Ligue des Champions 2005',
                    'FA Cup 2006',
                    '710 matchs',
                    'Capitaine légendaire'
                ],
                bio: 'Mr. Liverpool, capitaine emblématique, héros d\'Istanbul 2005.',
                association: 'Steven Gerrard Foundation',
                ecole: null,
                nft: { disponible: true, prix: 849, rarete: 'LEGENDARY' }
            },
            {
                nom: 'Kenny Dalglish',
                role: 'Attaquant',
                periode: '1977-1990',
                photo: 'https://www.liverpoolfc.com/dalglish.jpg',
                palmares: [
                    '172 buts',
                    '6 championnats',
                    '3 Ligues des Champions',
                    'Légende absolue'
                ],
                bio: 'King Kenny, légende absolue de Liverpool, joueur et entraîneur.',
                association: 'Kenny Dalglish Stand Against Cancer',
                ecole: null,
                nft: { disponible: true, prix: 899, rarete: 'LEGENDARY' }
            },
            {
                nom: 'Ian Rush',
                role: 'Attaquant',
                periode: '1980-1987, 1988-1996',
                photo: 'https://www.liverpoolfc.com/rush.jpg',
                palmares: [
                    '346 buts (meilleur buteur historique)',
                    '5 championnats',
                    '2 Ligues des Champions',
                    'Légende galloise'
                ],
                bio: 'Meilleur buteur de l\'histoire de Liverpool, icône galloise.',
                association: null,
                ecole: 'Ian Rush Football Academy',
                nft: { disponible: true, prix: 849, rarete: 'LEGENDARY' }
            },
            {
                nom: 'John Barnes',
                role: 'Ailier / Milieu offensif',
                periode: '1987-1997',
                photo: 'https://www.liverpoolfc.com/barnes.jpg',
                palmares: [
                    '2 championnats',
                    '2 FA Cup',
                    '108 buts',
                    'Joueur de l\'année 1988'
                ],
                bio: 'Ailier magique, l\'un des meilleurs joueurs de l\'histoire de Liverpool.',
                association: 'John Barnes Foundation',
                ecole: 'John Barnes Football School',
                nft: { disponible: true, prix: 799, rarete: 'LEGENDARY' }
            },
            {
                nom: 'Jamie Carragher',
                role: 'Défenseur central',
                periode: '1996-2013',
                photo: 'https://www.liverpoolfc.com/carragher.jpg',
                palmares: [
                    '737 matchs',
                    'Ligue des Champions 2005',
                    'Vice-capitaine',
                    'One-club man'
                ],
                bio: 'Défenseur légendaire, symbole de fidélité et de combativité.',
                association: '23 Foundation (Fondation Carragher)',
                ecole: null,
                nft: { disponible: true, prix: 749, rarete: 'LEGENDARY' }
            }
        ]
    },

    // ========================================
    // CHELSEA FC
    // ========================================
    'chelsea-fc': {
        club: 'Chelsea FC',
        logo: '🔵⚪',
        legendes: [
            {
                nom: 'Didier Drogba',
                role: 'Attaquant',
                periode: '2004-2012, 2014-2015',
                photo: 'https://www.chelseafc.com/drogba.jpg',
                palmares: [
                    'Ligue des Champions 2012 (but décisif)',
                    '4 Premier League',
                    '164 buts',
                    'Légende ivoirienne'
                ],
                bio: 'Buteur légendaire, héros de la finale 2012, icône africaine.',
                association: 'Fondation Didier Drogba',
                ecole: null,
                nft: { disponible: true, prix: 899, rarete: 'LEGENDARY' },
                note: 'Également légende de l\'OM (2003-2004)'
            },
            {
                nom: 'Frank Lampard',
                role: 'Milieu de terrain',
                periode: '2001-2014',
                photo: 'https://www.chelseafc.com/lampard.jpg',
                palmares: [
                    '211 buts (meilleur buteur historique)',
                    '3 Premier League',
                    'Ligue des Champions 2012',
                    'Ballon d\'Or 2e (2005)'
                ],
                bio: 'Meilleur buteur de l\'histoire de Chelsea, milieu de légende.',
                association: null,
                ecole: 'Frank Lampard Football Academy',
                nft: { disponible: true, prix: 899, rarete: 'LEGENDARY' }
            },
            {
                nom: 'John Terry',
                role: 'Défenseur central / Capitaine',
                periode: '1998-2017',
                photo: 'https://www.chelseafc.com/terry.jpg',
                palmares: [
                    '717 matchs',
                    '5 Premier League',
                    'Ligue des Champions 2012',
                    'Capitaine emblématique'
                ],
                bio: 'Capitaine légendaire, leader défensif, symbole de Chelsea.',
                association: 'John Terry Foundation',
                ecole: null,
                nft: { disponible: true, prix: 849, rarete: 'LEGENDARY' }
            },
            {
                nom: 'Petr Čech',
                role: 'Gardien de but',
                periode: '2004-2015',
                photo: 'https://www.chelseafc.com/cech.jpg',
                palmares: [
                    '4 Premier League',
                    'Ligue des Champions 2012',
                    '494 matchs',
                    '220 clean sheets'
                ],
                bio: 'Gardien tchèque légendaire, l\'un des meilleurs de l\'histoire.',
                association: null,
                ecole: null,
                nft: { disponible: true, prix: 799, rarete: 'LEGENDARY' }
            }
        ]
    },

    // ========================================
    // ARSENAL FC
    // ========================================
    'arsenal-fc': {
        club: 'Arsenal FC',
        logo: '🔴⚪',
        legendes: [
            {
                nom: 'Thierry Henry',
                role: 'Attaquant',
                periode: '1999-2007, 2012',
                photo: 'https://www.arsenal.com/henry.jpg',
                palmares: [
                    '228 buts (meilleur buteur historique)',
                    '2 Premier League',
                    '4 Souliers d\'Or',
                    'Invincibles 2003-04'
                ],
                bio: 'Légende absolue d\'Arsenal, meilleur buteur de l\'histoire du club.',
                association: null,
                ecole: null,
                nft: { disponible: true, prix: 999, rarete: 'LEGENDARY' },
                note: 'Également légende de Monaco (révélation) et Barcelone'
            },
            {
                nom: 'Dennis Bergkamp',
                role: 'Attaquant / Meneur de jeu',
                periode: '1995-2006',
                photo: 'https://www.arsenal.com/bergkamp.jpg',
                palmares: [
                    '120 buts',
                    '3 Premier League',
                    'Invincibles 2003-04',
                    'Joueur de l\'année'
                ],
                bio: 'Magicien néerlandais, l\'un des plus grands techniciens de l\'histoire.',
                association: null,
                ecole: 'Dennis Bergkamp Academy',
                nft: { disponible: true, prix: 899, rarete: 'LEGENDARY' }
            },
            {
                nom: 'Patrick Vieira',
                role: 'Milieu de terrain / Capitaine',
                periode: '1996-2005',
                photo: 'https://www.arsenal.com/vieira.jpg',
                palmares: [
                    '3 Premier League',
                    'Invincibles 2003-04 (capitaine)',
                    'Champion du monde 1998',
                    'Champion d\'Europe 2000'
                ],
                bio: 'Capitaine légendaire, leader des Invincibles, champion du monde.',
                association: null,
                ecole: null,
                nft: { disponible: true, prix: 849, rarete: 'LEGENDARY' }
            },
            {
                nom: 'Ian Wright',
                role: 'Attaquant',
                periode: '1991-1998',
                photo: 'https://www.arsenal.com/wright.jpg',
                palmares: [
                    '185 buts',
                    'Meilleur buteur du club (jusqu\'en 2005)',
                    '1 Premier League',
                    '2 FA Cup'
                ],
                bio: 'Buteur prolifique, légende des années 90, personnalité adorée.',
                association: 'Ian Wright Foundation',
                ecole: null,
                nft: { disponible: true, prix: 799, rarete: 'LEGENDARY' }
            }
        ]
    },

    // ========================================
    // MANCHESTER UNITED
    // ========================================
    'manchester-united': {
        club: 'Manchester United',
        logo: '🔴⚫',
        legendes: [
            {
                nom: 'Eric Cantona',
                role: 'Attaquant',
                periode: '1992-1997',
                photo: 'https://www.manutd.com/cantona.jpg',
                palmares: [
                    '4 Premier League',
                    '2 FA Cup',
                    '82 buts',
                    'Icône du club'
                ],
                bio: 'Le King, personnalité charismatique, révolutionnaire du football anglais.',
                association: null,
                ecole: null,
                nft: { disponible: true, prix: 899, rarete: 'LEGENDARY' }
            },
            {
                nom: 'Ryan Giggs',
                role: 'Ailier',
                periode: '1990-2014',
                photo: 'https://www.manutd.com/giggs.jpg',
                palmares: [
                    '963 matchs (record)',
                    '13 Premier League',
                    '2 Ligues des Champions',
                    'One-club man'
                ],
                bio: 'Légende galloise, symbole de fidélité, carrière exceptionnelle.',
                association: null,
                ecole: 'Ryan Giggs Football Academy',
                nft: { disponible: true, prix: 949, rarete: 'LEGENDARY' }
            }
        ]
    }
};

// ========================================
// FÉDÉRATIONS AFRICAINES (CAF)
// ========================================
const FEDERATIONS_AFRICAINES_CAF = [
    {
        name: 'Sénégal',
        flag: '🇸🇳',
        federation: 'Fédération Sénégalaise de Football',
        legendes: [
            {
                nom: 'El Hadji Diouf',
                role: 'Attaquant',
                periode: '2000-2012',
                palmares: ['Ballon d\'Or africain 2001', '2x CAN'],
                association: 'Fondation El Hadji Diouf',
                nft: { disponible: true, prix: 699, rarete: 'RARE' }
            }
        ]
    },
    {
        name: 'Cameroun',
        flag: '🇨🇲',
        federation: 'Fédération Camerounaise de Football',
        legendes: [
            {
                nom: 'Samuel Eto\'o',
                role: 'Attaquant',
                periode: '1997-2019',
                palmares: ['4x Ballon d\'Or africain', '2x CAN', '3x Ligue des Champions'],
                association: 'Fondation Samuel Eto\'o',
                ecole: 'Académie Samuel Eto\'o',
                nft: { disponible: true, prix: 899, rarete: 'LEGENDARY' }
            }
        ]
    },
    {
        name: 'Côte d\'Ivoire',
        flag: '🇨🇮',
        federation: 'Fédération Ivoirienne de Football',
        legendes: [
            {
                nom: 'Didier Drogba',
                role: 'Attaquant',
                periode: '2002-2018',
                palmares: ['2x Ballon d\'Or africain', 'Ligue des Champions 2012'],
                association: 'Fondation Didier Drogba',
                nft: { disponible: true, prix: 899, rarete: 'LEGENDARY' }
            },
            {
                nom: 'Yaya Touré',
                role: 'Milieu de terrain',
                periode: '2001-2019',
                palmares: ['4x Ballon d\'Or africain', 'Ligue des Champions 2009'],
                association: 'Fondation Yaya Touré',
                nft: { disponible: true, prix: 799, rarete: 'LEGENDARY' }
            }
        ]
    },
    {
        name: 'Nigeria',
        flag: '🇳🇬',
        federation: 'Nigeria Football Federation',
        legendes: [
            {
                nom: 'Jay-Jay Okocha',
                role: 'Milieu offensif',
                periode: '1990-2008',
                palmares: ['2x Ballon d\'Or africain', 'Magicien du ballon'],
                association: 'Jay-Jay Okocha Foundation',
                nft: { disponible: true, prix: 749, rarete: 'LEGENDARY' }
            }
        ]
    }
];

// Export pour utilisation dans index.html
if (typeof window !== 'undefined') {
    window.LEGENDES_CLUBS_COMPLEMENT = LEGENDES_CLUBS_COMPLEMENT;
    window.FEDERATIONS_AFRICAINES_CAF = FEDERATIONS_AFRICAINES_CAF;
}
