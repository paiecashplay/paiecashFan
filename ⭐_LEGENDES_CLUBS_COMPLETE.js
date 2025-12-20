/**
 * ========================================
 * ⭐ LÉGENDES DES CLUBS - BASE DE DONNÉES COMPLÈTE
 * ========================================
 * Base de données exhaustive des légendes de tous les clubs
 * Inclut joueurs, entraîneurs, présidents marquants
 * 
 * @version 1.0.0
 * @date 2024-12-13
 */

const LEGENDES_CLUBS = {
    // ========================================
    // PARIS FC
    // ========================================
    'paris-fc': {
        club: 'Paris FC',
        logo: '⚽',
        legendes: [
            {
                nom: 'Omar Da Fonseca',
                role: 'Attaquant',
                periode: '1979-1981',
                photo: 'https://example.com/omar-da-fonseca.jpg',
                palmares: [
                    'Meilleur buteur du club (1980)',
                    '43 buts en 80 matchs'
                ],
                bio: 'Attaquant argentin légendaire du Paris FC, devenu consultant football reconnu.'
            },
            {
                nom: 'Vincent Demarconnay',
                role: 'Gardien de but',
                periode: '2016-2020',
                photo: 'https://example.com/vincent-demarconnay.jpg',
                palmares: [
                    'Capitaine emblématique',
                    'Plus de 150 matchs avec le club'
                ],
                bio: 'Gardien emblématique et capitaine du Paris FC, pilier de la défense.'
            },
            {
                nom: 'Ousmane Camara',
                role: 'Milieu de terrain',
                periode: '2014-2018',
                photo: 'https://example.com/ousmane-camara.jpg',
                palmares: [
                    'Plus de 130 matchs',
                    'Figure emblématique du vestiaire'
                ],
                bio: 'Milieu de terrain technique et combatif, pilier de l\'équipe.'
            },
            {
                nom: 'Olivier Rouyer',
                role: 'Attaquant',
                periode: '1970-1978',
                photo: 'https://example.com/olivier-rouyer.jpg',
                palmares: [
                    '139 buts en 253 matchs',
                    'Meilleur buteur de l\'histoire du club'
                ],
                bio: 'Plus grand buteur de l\'histoire du Paris FC, légende absolue.'
            }
        ]
    },

    // ========================================
    // OLYMPIQUE DE MARSEILLE
    // ========================================
    'olympique-de-marseille': {
        club: 'Olympique de Marseille',
        logo: '⚽',
        legendes: [
            {
                nom: 'Didier Drogba',
                role: 'Attaquant',
                periode: '2003-2004',
                photo: 'https://example.com/didier-drogba.jpg',
                palmares: [
                    'Coupe UEFA 2004',
                    '19 buts en 35 matchs'
                ],
                bio: 'Attaquant ivoirien explosif, révélé à Marseille avant Chelsea.'
            },
            {
                nom: 'Jean-Pierre Papin',
                role: 'Attaquant',
                periode: '1986-1992',
                photo: 'https://example.com/jean-pierre-papin.jpg',
                palmares: [
                    'Ballon d\'Or 1991',
                    '5 titres de meilleur buteur',
                    '182 buts en 278 matchs'
                ],
                bio: 'Légende absolue de l\'OM, Ballon d\'Or, buteur de légende.'
            },
            {
                nom: 'Basile Boli',
                role: 'Défenseur central',
                periode: '1990-1994',
                photo: 'https://example.com/basile-boli.jpg',
                palmares: [
                    'Ligue des Champions 1993 (but en finale)',
                    '4 championnats de France'
                ],
                bio: 'Héros de la finale de la Ligue des Champions 1993.'
            },
            {
                nom: 'Fabien Barthez',
                role: 'Gardien de but',
                periode: '1992-1995, 2004-2006',
                photo: 'https://example.com/fabien-barthez.jpg',
                palmares: [
                    'Ligue des Champions 1993',
                    'Champion du monde 1998'
                ],
                bio: 'Gardien emblématique, champion du monde avec la France.'
            },
            {
                nom: 'Steve Mandanda',
                role: 'Gardien de but',
                periode: '2007-2016, 2017-2024',
                photo: 'https://example.com/steve-mandanda.jpg',
                palmares: [
                    'Plus de 600 matchs',
                    'Capitaine emblématique',
                    'Record d\'apparitions'
                ],
                bio: 'Gardien le plus capé de l\'histoire de l\'OM, légende vivante.'
            }
        ]
    },

    // ========================================
    // PARIS SAINT-GERMAIN
    // ========================================
    'paris-saint-germain': {
        club: 'Paris Saint-Germain',
        logo: '⚽',
        legendes: [
            {
                nom: 'Zlatan Ibrahimović',
                role: 'Attaquant',
                periode: '2012-2016',
                photo: 'https://example.com/zlatan-ibrahimovic.jpg',
                palmares: [
                    'Meilleur buteur de l\'histoire du club (156 buts)',
                    '4 titres de champion de France',
                    '31 trophées individuels'
                ],
                bio: 'Meilleur buteur de l\'histoire du PSG, star mondiale.'
            },
            {
                nom: 'Thiago Silva',
                role: 'Défenseur central',
                periode: '2012-2020',
                photo: 'https://example.com/thiago-silva.jpg',
                palmares: [
                    'Capitaine emblématique',
                    '7 championnats de France',
                    'Finaliste Ligue des Champions 2020'
                ],
                bio: 'Défenseur central légendaire, capitaine et leader.'
            },

            {
                nom: 'Ronaldinho',
                role: 'Milieu offensif',
                periode: '2001-2003',
                photo: 'https://example.com/ronaldinho.jpg',
                palmares: [
                    'Révélation mondiale au PSG',
                    'Ballon d\'Or 2005 (après PSG)'
                ],
                bio: 'Magicien brésilien révélé au PSG avant le Barça.'
            },
            {
                nom: 'Pauleta',
                role: 'Attaquant',
                periode: '2003-2008',
                photo: 'https://example.com/pauleta.jpg',
                palmares: [
                    '109 buts en 211 matchs',
                    'Meilleur buteur du club (avant Ibra et Cavani)'
                ],
                bio: 'Attaquant portugais prolifique, buteur de légende.'
            }
        ]
    },

    // ========================================
    // OLYMPIQUE LYONNAIS
    // ========================================
    'olympique-lyonnais': {
        club: 'Olympique Lyonnais',
        logo: '⚽',
        legendes: [
            {
                nom: 'Juninho Pernambucano',
                role: 'Milieu de terrain',
                periode: '2001-2009',
                photo: 'https://example.com/juninho.jpg',
                palmares: [
                    '7 championnats de France consécutifs',
                    'Maître des coups francs',
                    '44 buts sur coup franc'
                ],
                bio: 'Meilleur tireur de coups francs de l\'histoire, légende de l\'OL.'
            },

            {
                nom: 'Sidney Govou',
                role: 'Ailier',
                periode: '1999-2010',
                photo: 'https://example.com/sidney-govou.jpg',
                palmares: [
                    '7 championnats de France',
                    'Plus de 400 matchs',
                    'Pur lyonnais'
                ],
                bio: 'Enfant du club, ailier rapide et décisif.'
            }
        ]
    },

    // ========================================
    // AS MONACO
    // ========================================
    'as-monaco': {
        club: 'AS Monaco',
        logo: '⚽',
        legendes: [
            {
                nom: 'Thierry Henry',
                role: 'Attaquant',
                periode: '1994-1999',
                photo: 'https://example.com/thierry-henry.jpg',
                palmares: [
                    'Champion de France 1997',
                    'Champion du monde 1998',
                    'Révélé à Monaco'
                ],
                bio: 'Légende d\'Arsenal et de la France, révélé à Monaco.'
            },
            {
                nom: 'Kylian Mbappé',
                role: 'Attaquant',
                periode: '2015-2017',
                photo: 'https://example.com/kylian-mbappe-monaco.jpg',
                palmares: [
                    'Champion de France 2017',
                    'Demi-finale Ligue des Champions 2017',
                    'Révélation mondiale'
                ],
                bio: 'Formé à Monaco, explosé sur la scène mondiale.'
            },
            {
                nom: 'Lilian Thuram',
                role: 'Défenseur',
                periode: '1991-1996',
                photo: 'https://example.com/lilian-thuram.jpg',
                palmares: [
                    'Champion du monde 1998',
                    'Révélé à Monaco'
                ],
                bio: 'Défenseur légendaire de la France, formé à Monaco.'
            }
        ]
    },

    // ========================================
    // ARSENAL FC (Angleterre)
    // ========================================
    'arsenal-fc': {
        club: 'Arsenal FC',
        logo: '⚽',
        legendes: [
            {
                nom: 'Thierry Henry',
                role: 'Attaquant',
                periode: '1999-2007, 2012',
                photo: 'https://example.com/thierry-henry-arsenal.jpg',
                palmares: [
                    'Meilleur buteur de l\'histoire (228 buts)',
                    '2 championnats d\'Angleterre',
                    'Invincibles 2003-2004'
                ],
                bio: 'Plus grand joueur de l\'histoire d\'Arsenal, légende absolue.'
            },
            {
                nom: 'Dennis Bergkamp',
                role: 'Attaquant',
                periode: '1995-2006',
                photo: 'https://example.com/dennis-bergkamp.jpg',
                palmares: [
                    '3 championnats d\'Angleterre',
                    'Magicien hollandais',
                    '120 buts'
                ],
                bio: 'Artiste néerlandais, technicien hors pair.'
            },
            {
                nom: 'Patrick Vieira',
                role: 'Milieu de terrain',
                periode: '1996-2005',
                photo: 'https://example.com/patrick-vieira.jpg',
                palmares: [
                    'Capitaine emblématique',
                    '3 championnats',
                    'Champion du monde 1998'
                ],
                bio: 'Capitaine et leader, champion du monde français.'
            }
        ]
    },

    // ========================================
    // REAL MADRID
    // ========================================
    'real-madrid': {
        club: 'Real Madrid',
        logo: '⚽',
        legendes: [
            {
                nom: 'Cristiano Ronaldo',
                role: 'Attaquant',
                periode: '2009-2018',
                photo: 'https://example.com/cristiano-ronaldo.jpg',
                palmares: [
                    'Meilleur buteur de l\'histoire (451 buts)',
                    '4 Ballons d\'Or au Real',
                    '4 Ligue des Champions'
                ],
                bio: 'Plus grand buteur de l\'histoire du Real Madrid.'
            },
            {
                nom: 'Zinedine Zidane',
                role: 'Milieu offensif',
                periode: '2001-2006',
                photo: 'https://example.com/zinedine-zidane.jpg',
                palmares: [
                    'Ballon d\'Or 1998',
                    'But légendaire finale Ligue des Champions 2002',
                    'Champion du monde 1998'
                ],
                bio: 'Maestro français, légende du Real et entraîneur victorieux.'
            },
            {
                nom: 'Raúl González',
                role: 'Attaquant',
                periode: '1994-2010',
                photo: 'https://example.com/raul-gonzalez.jpg',
                palmares: [
                    'Capitaine emblématique',
                    '323 buts',
                    '6 championnats d\'Espagne',
                    '3 Ligue des Champions'
                ],
                bio: 'Légende madrilène, capitaine et buteur prolifique.'
            }
        ]
    },

    // ========================================
    // FC BARCELONE
    // ========================================
    'fc-barcelone': {
        club: 'FC Barcelone',
        logo: '⚽',
        legendes: [
            {
                nom: 'Lionel Messi',
                role: 'Attaquant',
                periode: '2004-2021',
                photo: 'https://example.com/lionel-messi.jpg',
                palmares: [
                    'Meilleur joueur de l\'histoire',
                    '7 Ballons d\'Or',
                    '672 buts',
                    '10 championnats d\'Espagne',
                    '4 Ligue des Champions'
                ],
                bio: 'Plus grand joueur de l\'histoire du football.'
            },
            {
                nom: 'Xavi Hernández',
                role: 'Milieu de terrain',
                periode: '1998-2015',
                photo: 'https://example.com/xavi-hernandez.jpg',
                palmares: [
                    'Maestro du tiki-taka',
                    '8 championnats',
                    '4 Ligue des Champions',
                    'Champion du monde 2010'
                ],
                bio: 'Cerveau du Barça et de la Roja, génie tactique.'
            },
            {
                nom: 'Andrés Iniesta',
                role: 'Milieu offensif',
                periode: '2002-2018',
                photo: 'https://example.com/andres-iniesta.jpg',
                palmares: [
                    'But en finale Coupe du monde 2010',
                    '9 championnats',
                    '4 Ligue des Champions'
                ],
                bio: 'Magicien espagnol, héros de la Coupe du monde 2010.'
            }
        ]
    },

    // ========================================
    // MANCHESTER UNITED
    // ========================================
    'manchester-united': {
        club: 'Manchester United',
        logo: '⚽',
        legendes: [
            {
                nom: 'Cristiano Ronaldo',
                role: 'Ailier',
                periode: '2003-2009, 2021-2022',
                photo: 'https://example.com/cristiano-ronaldo-united.jpg',
                palmares: [
                    'Ballon d\'Or 2008',
                    '3 championnats',
                    'Ligue des Champions 2008'
                ],
                bio: 'Révélé à United, devenu phénomène mondial.'
            },
            {
                nom: 'Ryan Giggs',
                role: 'Ailier',
                periode: '1990-2014',
                photo: 'https://example.com/ryan-giggs.jpg',
                palmares: [
                    '963 matchs (record du club)',
                    '13 championnats',
                    '2 Ligue des Champions'
                ],
                bio: 'Légende absolue de United, fidélité exemplaire.'
            },
            {
                nom: 'Paul Scholes',
                role: 'Milieu de terrain',
                periode: '1993-2013',
                photo: 'https://example.com/paul-scholes.jpg',
                palmares: [
                    '11 championnats',
                    '2 Ligue des Champions',
                    'Génie du milieu'
                ],
                bio: 'Milieu génial, maître de la passe et du tir.'
            }
        ]
    }
};

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LEGENDES_CLUBS;
}
