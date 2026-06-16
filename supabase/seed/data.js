// ═════════════════════════════════════════════════════════════
// Données à seed dans Supabase.
// Source de vérité : paiecashfan-app/src/data/*.js
// Recopiées ici pour éviter les imports croisés et garantir la
// stabilité du seeder (les fichiers frontend peuvent changer
// structurellement sans casser le seed).
//
// ⚠️  Quand on ajoute un club / joueur dans le frontend, il faut
//    aussi l'ajouter ici. Long terme (Phase 2), le BO supprimera
//    cette duplication car les data viendront directement de la DB.
// ═════════════════════════════════════════════════════════════

// ─── FÉDÉRATIONS NATIONALES ──────────────────────────────────
export const federations = [
  {
    slug:               'tanzanie',
    name:               'Tanzania Football Federation',
    name_en:            'Tanzania Football Federation',
    short_code:         'TFF',
    country:            'Tanzanie',
    country_code:       'TZ',
    flag_emoji:         '🇹🇿',
    confederation_code: 'CAF',
    region:             'Afrique de l\'Est',
    founded_year:       1930,
    fifa_member_since:  1964,
    president:          'Wallace Karia',
    motto:              'Taifa Stars',
    motto_color:        '#FCD116',
    primary_color:      '#1EB53A',
    accent_color:       '#FCD116',
    logo_url:           '/images/logos/clubs-tanzanie/tanzania-federation-logo.png',
    stadium:            'Benjamin Mkapa Stadium',
    stadium_image_url:  '/images/tanzania-stadium.webp',
    card_image_url:     '/images/clubs/tanzania-stadium-card.jpg',
    website:            'www.tff.or.tz',
    email:              'tff@tff.or.tz',
    national_team_name: 'Taifa Stars',
    national_team_coach:'Hemed Morocco'
  },
  {
    slug:               'zanzibar',
    name:               'Fédération de Zanzibar de Football',
    name_en:            'Zanzibar Football Federation',
    short_code:         'ZFF',
    country:            'Zanzibar',
    country_code:       'TZ',
    flag_emoji:         '🇹🇿',
    confederation_code: 'CAF',
    region:             'Afrique de l\'Est',
    founded_year:       1926,
    president:          'Salum Madadi',
    motto:              'Pamoja kwa Zanzibar',
    motto_color:        '#FFD700',
    primary_color:      '#007A33',
    accent_color:       '#FFD700',
    stadium:            'Amaan Stadium'
  }
];

// ─── TENANTS (clubs + hubs nationaux) ────────────────────────
// is_federation_hub = TRUE : la page affiche la grille des clubs
// au lieu de la boutique (ex: /clubs/tanzanie).
export const tenants = [
  // Hub fédération Tanzanie (= sélection Taifa Stars)
  {
    slug:                'tanzanie',
    name:                'Tanzanie',
    short_code:          'TAN',
    type:                'national_team',
    federationSlug:      'tanzanie',
    confederation_code:  'CAF',
    country:             'Tanzanie',
    country_code:        'TZ',
    league_name:         'CAF',
    founded_year:        1930,
    stadium:             'Benjamin Mkapa Stadium',
    stadium_image_url:   '/images/tanzania-stadium.webp',
    card_image_url:      '/images/clubs/tanzania-stadium-card.jpg',
    motto:               'Taifa Stars',
    motto_color:         '#FCD116',
    primary_color:       '#1EB53A',
    accent_color:        '#FCD116',
    logo_url:            '/images/logos/clubs-tanzanie/tanzania-federation-logo.png',
    coach:               'Hemed Morocco',
    president:           'Wallace Karia',
    is_federation_hub:   true,
    status:              'active'
  },
  // Hub fédération Zanzibar
  {
    slug:                'federation-de-zanzibar-de-football',
    name:                'Fédération de Zanzibar de Football',
    short_code:          'ZFF',
    type:                'national_team',
    federationSlug:      'zanzibar',
    confederation_code:  'CAF',
    country:             'Zanzibar',
    country_code:        'TZ',
    league_name:         'CAF',
    founded_year:        1926,
    stadium:             'Amaan Stadium',
    motto:               'Pamoja kwa Zanzibar',
    motto_color:         '#FFD700',
    primary_color:       '#007A33',
    accent_color:        '#FFD700',
    coach:               '—',
    president:           'Salum Madadi',
    is_federation_hub:   false,
    status:              'active'
  },
  // NBC Premier League — 8 clubs Tanzanie
  { slug: 'young-africans-sc', name: 'Young Africans SC', short_code: 'YANGA', type: 'club',
    federationSlug: 'tanzanie', confederation_code: 'CAF', country: 'Tanzanie', country_code: 'TZ',
    city: 'Dar es Salaam', league_name: 'NBC Premier League',
    founded_year: 1935, stadium: 'Benjamin Mkapa Stadium',
    stadium_image_url: '/images/tanzania-stadium.webp',
    motto: 'Yanga, mon amour', motto_color: '#007A33',
    primary_color: '#007A33', accent_color: '#007A33',
    logo_url: '/images/logos/clubs-tanzanie/young-africans-sc.png',
    status: 'active' },
  { slug: 'simba-sc', name: 'Simba SC', short_code: 'SIMBA', type: 'club',
    federationSlug: 'tanzanie', confederation_code: 'CAF', country: 'Tanzanie', country_code: 'TZ',
    city: 'Dar es Salaam', league_name: 'NBC Premier League',
    founded_year: 1936, stadium: 'Benjamin Mkapa Stadium',
    stadium_image_url: '/images/tanzania-stadium.webp',
    motto: 'Les Lions de Tanzanie', motto_color: '#C8102E',
    primary_color: '#C8102E', accent_color: '#C8102E',
    logo_url: '/images/logos/clubs-tanzanie/simba-sc.png',
    status: 'active' },
  { slug: 'azam-fc', name: 'Azam FC', short_code: 'AZAM', type: 'club',
    federationSlug: 'tanzanie', confederation_code: 'CAF', country: 'Tanzanie', country_code: 'TZ',
    city: 'Dar es Salaam', league_name: 'NBC Premier League',
    founded_year: 2003, stadium: 'Chamazi Complex',
    stadium_image_url: '/images/tanzania-stadium.webp',
    motto: 'Force et Honneur', motto_color: '#1B3A6E',
    primary_color: '#1B3A6E', accent_color: '#1B3A6E',
    logo_url: '/images/logos/clubs-tanzanie/azam-fc.png',
    status: 'active' },
  { slug: 'coastal-union', name: 'Coastal Union', short_code: 'COAST', type: 'club',
    federationSlug: 'tanzanie', confederation_code: 'CAF', country: 'Tanzanie', country_code: 'TZ',
    city: 'Tanga', league_name: 'NBC Premier League',
    founded_year: 1953, stadium: 'Mkwakwani Stadium',
    stadium_image_url: '/images/tanzania-stadium.webp',
    motto: "L'Union de la Côte", motto_color: '#B22222',
    primary_color: '#B22222', accent_color: '#B22222',
    logo_url: '/images/logos/clubs-tanzanie/coastal-union.png',
    status: 'active' },
  { slug: 'jkt-tanzania', name: 'JKT Tanzania', short_code: 'JKT', type: 'club',
    federationSlug: 'tanzanie', confederation_code: 'CAF', country: 'Tanzanie', country_code: 'TZ',
    city: 'Dar es Salaam', league_name: 'NBC Premier League',
    founded_year: 1970, stadium: 'Uhuru Stadium',
    stadium_image_url: '/images/tanzania-stadium.webp',
    motto: 'Pour la Patrie', motto_color: '#4F7942',
    primary_color: '#4F7942', accent_color: '#4F7942',
    logo_url: '/images/logos/clubs-tanzanie/jkt-tanzania.png',
    status: 'active' },
  { slug: 'namungo-fc', name: 'Namungo FC', short_code: 'NAMUN', type: 'club',
    federationSlug: 'tanzanie', confederation_code: 'CAF', country: 'Tanzanie', country_code: 'TZ',
    city: 'Mtwara', league_name: 'NBC Premier League',
    founded_year: 2007, stadium: 'Majaliwa Stadium',
    stadium_image_url: '/images/tanzania-stadium.webp',
    motto: "L'Esprit de Ruangwa", motto_color: '#1E40AF',
    primary_color: '#1E40AF', accent_color: '#1E40AF',
    logo_url: '/images/logos/clubs-tanzanie/namungo-fc.png',
    status: 'active' },
  { slug: 'geita-gold-fc', name: 'Geita Gold FC', short_code: 'GEITA', type: 'club',
    federationSlug: 'tanzanie', confederation_code: 'CAF', country: 'Tanzanie', country_code: 'TZ',
    city: 'Geita', league_name: 'NBC Premier League',
    founded_year: 2013, stadium: 'Geita Stadium',
    stadium_image_url: '/images/tanzania-stadium.webp',
    motto: 'Or de Geita', motto_color: '#DAA520',
    primary_color: '#DAA520', accent_color: '#DAA520',
    logo_url: '/images/logos/clubs-tanzanie/geita-gold-fc.png',
    status: 'active' },
  { slug: 'kagera-sugar', name: 'Kagera Sugar', short_code: 'KAGER', type: 'club',
    federationSlug: 'tanzanie', confederation_code: 'CAF', country: 'Tanzanie', country_code: 'TZ',
    city: 'Kagera', league_name: 'NBC Premier League',
    founded_year: 2002, stadium: 'Kaitaba Stadium',
    stadium_image_url: '/images/tanzania-stadium.webp',
    motto: 'La Douceur de Kagera', motto_color: '#C49A0E',
    primary_color: '#C49A0E', accent_color: '#C49A0E',
    logo_url: '/images/logos/clubs-tanzanie/kagera-sugar.png',
    status: 'active' },
  // Olympique de Marseille (Ligue 1)
  { slug: 'olympique-de-marseille', name: 'Olympique de Marseille', short_code: 'OM', type: 'club',
    confederation_code: 'UEFA', country: 'France', country_code: 'FR',
    city: 'Marseille', league_name: 'Ligue 1',
    founded_year: 1899, stadium: 'Orange Vélodrome',
    stadium_image_url: '/images/clubs/velodrome-om.jpg',
    motto: 'Droit au But', motto_color: '#0099D8',
    primary_color: '#0099D8', accent_color: '#FFFFFF',
    logo_url: 'https://crests.football-data.org/516.png',
    coach: 'Roberto De Zerbi', president: 'Pablo Longoria',
    status: 'active' },
  // Paris Saint-Germain (Ligue 1)
  { slug: 'paris-saint-germain', name: 'Paris Saint-Germain', short_code: 'PSG', type: 'club',
    confederation_code: 'UEFA', country: 'France', country_code: 'FR',
    city: 'Paris', league_name: 'Ligue 1',
    founded_year: 1970, stadium: 'Parc des Princes',
    stadium_image_url: '/images/clubs/psg-stadium.jpg',
    motto: 'Ici, c\'est Paris', motto_color: '#004170',
    primary_color: '#004170', accent_color: '#DA291C',
    logo_url: 'https://crests.football-data.org/524.png',
    coach: 'Luis Enrique', president: 'Nasser Al-Khelaïfi',
    status: 'active' }
];

// ─── PLAYERS ─────────────────────────────────────────────────
// Format : { tenantSlug | federationSlug, shirt_number, full_name, position, image_url, stats, is_star_player }
export const players = [
  // Star Player Tanzanie (Taifa Stars)
  { tenantSlug: 'tanzanie', shirt_number: 10, full_name: 'Mbwana Samatta', position: 'Attaquant',
    image_url: '/images/players/ZFF/mbwana-samatta.jpg',
    stats: { goals: 25, assists: 7 }, is_star_player: true },
  // ZFF Squad
  { tenantSlug: 'federation-de-zanzibar-de-football', shirt_number: 1, full_name: 'Mudathir Yahya', position: 'Gardien de but',
    image_url: '/images/players/ZFF/Mudathir-Yahya.webp', nationality_code: 'TZ' },
  { tenantSlug: 'federation-de-zanzibar-de-football', shirt_number: 8, full_name: 'Feisal Salum', position: 'Milieu de terrain',
    image_url: '/images/players/ZFF/Feisal-Salum.jpeg', nationality_code: 'TZ' },
  { tenantSlug: 'federation-de-zanzibar-de-football', shirt_number: 9, full_name: 'Abdulaziz Makame', position: 'Attaquant',
    image_url: '/images/players/ZFF/Abdulaziz-Makame.jpeg', nationality_code: 'TZ',
    stats: { goals: 8, assists: 3 }, is_star_player: true },
  // Star Players NBC Tanzanie
  { tenantSlug: 'simba-sc', shirt_number: 10, full_name: 'Clatous Chama', position: 'Attaquant',
    image_url: '/images/players/ZFF/clatous-chama.jpeg',
    stats: { goals: 19, assists: 8 }, is_star_player: true },
  { tenantSlug: 'young-africans-sc', shirt_number: 9, full_name: 'Fiston Mayele', position: 'Attaquant',
    image_url: '/images/players/ZFF/Fiston-Mayele.webp',
    stats: { goals: 21, assists: 5 }, is_star_player: true },
  { tenantSlug: 'azam-fc', shirt_number: 10, full_name: 'Prince Dube', position: 'Attaquant',
    image_url: '/images/players/ZFF/Prince-Dube.jpg',
    stats: { goals: 14, assists: 6 }, is_star_player: true },
  { tenantSlug: 'coastal-union', shirt_number: 9, full_name: 'Hassan Dilunga', position: 'Attaquant',
    image_url: '/images/players/ZFF/Hassan-Dilunga.jpg',
    stats: { goals: 9, assists: 4 }, is_star_player: true },
  { tenantSlug: 'jkt-tanzania', shirt_number: 7, full_name: 'Bakari Mwamnyeto', position: 'Milieu de terrain',
    image_url: '/images/players/ZFF/Bakari-Mwamnyeto.jpg',
    stats: { goals: 8, assists: 7 }, is_star_player: true },
  { tenantSlug: 'namungo-fc', shirt_number: 9, full_name: 'Pius Buswita', position: 'Attaquant',
    image_url: '/images/players/ZFF/Pius-Buswita.jpg',
    stats: { goals: 11, assists: 3 }, is_star_player: true },
  { tenantSlug: 'kagera-sugar', shirt_number: 8, full_name: 'Farid Mussa', position: 'Milieu de terrain',
    image_url: '/images/players/ZFF/Farid-Mussa.jpg',
    stats: { goals: 5, assists: 6 }, is_star_player: true },
  { tenantSlug: 'geita-gold-fc', shirt_number: 11, full_name: 'Said Ndemla', position: 'Milieu de terrain',
    stats: { goals: 6, assists: 5 }, is_star_player: true },

  // OM Squad 2025-26 (26 joueurs, Aubameyang star player)
  // Gardiens
  { tenantSlug: 'olympique-de-marseille', shirt_number: 1,  full_name: 'Gerónimo Rulli',           position: 'Gardien de but',    image_url: '/images/players/OM/rulli.jpg',         nationality_code: 'AR' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 12, full_name: 'Jeffrey De Lange',         position: 'Gardien de but',    image_url: '/images/players/OM/deLange.jpg',       nationality_code: 'NL' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 40, full_name: 'Jelle Van Neck',           position: 'Gardien de but',    image_url: '/images/players/OM/vanNeck.jpg',       nationality_code: 'BE' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 92, full_name: 'Théo Vermot',              position: 'Gardien de but',    image_url: '/images/players/OM/vermot.jpg',        nationality_code: 'FR' },
  // Défenseurs
  { tenantSlug: 'olympique-de-marseille', shirt_number: 4,  full_name: 'CJ Egan-Riley',            position: 'Défenseur',         image_url: '/images/players/OM/egan-riley.jpg',    nationality_code: 'GB' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 5,  full_name: 'Leonardo Balerdi',         position: 'Défenseur',         image_url: '/images/players/OM/balerdi.jpg',       nationality_code: 'AR' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 21, full_name: 'Nayef Aguerd',             position: 'Défenseur',         image_url: '/images/players/OM/aguerd.jpg',        nationality_code: 'MA' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 22, full_name: 'Timothy Weah',             position: 'Défenseur',         image_url: '/images/players/OM/weah.jpg',          nationality_code: 'US' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 28, full_name: 'Benjamin Pavard',          position: 'Défenseur',         image_url: '/images/players/OM/pavard.jpg',        nationality_code: 'FR' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 32, full_name: 'Facundo Medina',           position: 'Défenseur',         image_url: '/images/players/OM/medina.jpg',        nationality_code: 'AR' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 33, full_name: 'Emerson Palmieri',         position: 'Défenseur',         image_url: '/images/players/OM/palmieri.jpg',      nationality_code: 'IT' },
  // Milieux
  { tenantSlug: 'olympique-de-marseille', shirt_number: 6,  full_name: 'Tochukwu Nnadi',           position: 'Milieu de terrain', image_url: '/images/players/OM/tochukwu.jpg',      nationality_code: 'NG' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 8,  full_name: 'Himad Abdelli',            position: 'Milieu de terrain', image_url: '/images/players/OM/abdelli.jpg',       nationality_code: 'DZ' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 18, full_name: 'Arthur Vermeeren',         position: 'Milieu de terrain', image_url: '/images/players/OM/vermeeren.jpg',     nationality_code: 'BE' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 19, full_name: 'Geoffrey Kondogbia',       position: 'Milieu de terrain', image_url: '/images/players/OM/kondogbia.jpg',     nationality_code: 'CF' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 23, full_name: 'Pierre-Emile Højbjerg',    position: 'Milieu de terrain', image_url: '/images/players/OM/hojbjerg.jpg',      nationality_code: 'DK' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 26, full_name: 'Bilal Nadir',              position: 'Milieu de terrain', image_url: '/images/players/OM/nadir.jpg',         nationality_code: 'MA' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 27, full_name: 'Quinten Timber',           position: 'Milieu de terrain', image_url: '/images/players/OM/timber.jpg',        nationality_code: 'NL' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 45, full_name: 'Yanis Sellami',            position: 'Milieu de terrain', image_url: '/images/players/OM/sellami.jpg',       nationality_code: 'FR' },
  // Attaquants
  { tenantSlug: 'olympique-de-marseille', shirt_number: 9,  full_name: 'Amine Gouiri',             position: 'Attaquant',         image_url: '/images/players/OM/gouiri.jpg',        nationality_code: 'DZ' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 10, full_name: 'Mason Greenwood',          position: 'Attaquant',         image_url: '/images/players/OM/greenwood.jpg',     nationality_code: 'GB' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 11, full_name: 'Ethan Nwaneri',            position: 'Attaquant',         image_url: '/images/players/OM/nwaneri.jpg',       nationality_code: 'GB' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 14, full_name: 'Igor Paixão',              position: 'Attaquant',         image_url: '/images/players/OM/paixao.jpg',        nationality_code: 'BR' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 17, full_name: 'Pierre-Emerick Aubameyang',position: 'Attaquant',         image_url: '/images/players/OM/aubameyang.jpg',    nationality_code: 'GA',
    stats: { goals: 15, assists: 4 }, is_star_player: true },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 20, full_name: 'Hamed Traoré',             position: 'Attaquant',         image_url: '/images/players/OM/traore.jpg',        nationality_code: 'CI' },
  { tenantSlug: 'olympique-de-marseille', shirt_number: 76, full_name: 'Tadjidine Mmadi',          position: 'Attaquant',         image_url: '/images/players/OM/mmadi.jpg',         nationality_code: 'KM' },

  // PSG Squad (Ligue 1) — 24 joueurs, Dembélé star player
  { tenantSlug: 'paris-saint-germain', shirt_number: 2,  full_name: 'Achraf Hakimi',          position: 'Défenseur',         image_url: '/images/players/PSG/hakimi.jpg',           nationality_code: 'MA' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 5,  full_name: 'Marquinhos',             position: 'Défenseur',         image_url: '/images/players/PSG/marquinhos.jpg',       nationality_code: 'BR' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 6,  full_name: 'Illia Zabarnyi',         position: 'Défenseur',         image_url: '/images/players/PSG/Zabarnyi.jpg',         nationality_code: 'UA' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 7,  full_name: 'Khvicha Kvaratskhelia',  position: 'Attaquant',         image_url: '/images/players/PSG/Kvaratskhelia.jpg',    nationality_code: 'GE' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 8,  full_name: 'Fabián Ruiz',            position: 'Milieu de terrain', image_url: '/images/players/PSG/ruiz.jpg',             nationality_code: 'ES' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 9,  full_name: 'Gonçalo Ramos',          position: 'Attaquant',         image_url: '/images/players/PSG/ramos.jpg',            nationality_code: 'PT' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 10, full_name: 'Ousmane Dembélé',        position: 'Attaquant',         image_url: '/images/players/PSG/ousmane-dembele.jpg',  nationality_code: 'FR',
    stats: { goals: 33, assists: 14 }, is_star_player: true },
  { tenantSlug: 'paris-saint-germain', shirt_number: 14, full_name: 'Désiré Doué',            position: 'Attaquant',         image_url: '/images/players/PSG/doué.jpg',             nationality_code: 'FR' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 17, full_name: 'Vitinha',                position: 'Milieu de terrain', image_url: '/images/players/PSG/vitinha.jpg',          nationality_code: 'PT' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 19, full_name: 'Kang-In Lee',            position: 'Milieu de terrain', image_url: '/images/players/PSG/lee.jpg',              nationality_code: 'KR' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 21, full_name: 'Lucas Hernández',        position: 'Défenseur',         image_url: '/images/players/PSG/hernandez.jpg',        nationality_code: 'FR' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 25, full_name: 'Nuno Mendes',            position: 'Défenseur',         image_url: '/images/players/PSG/mendes.jpg',           nationality_code: 'PT' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 27, full_name: 'Dro Fernández',          position: 'Milieu de terrain', image_url: '/images/players/PSG/Dro Fernández.jpg',    nationality_code: 'ES' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 29, full_name: 'Bradley Barcola',        position: 'Attaquant',         image_url: '/images/players/PSG/barcola.jpg',          nationality_code: 'FR' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 30, full_name: 'Lucas Chevalier',        position: 'Gardien de but',    image_url: '/images/players/PSG/chevalier.jpg',        nationality_code: 'FR' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 33, full_name: 'Warren Zaïre-Emery',     position: 'Milieu de terrain', image_url: '/images/players/PSG/Zaïre-Emery.jpg',      nationality_code: 'FR' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 35, full_name: 'Lucas Beraldo',          position: 'Défenseur',         image_url: '/images/players/PSG/beraldo.jpg',          nationality_code: 'BR' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 39, full_name: 'Matvey Safonov',         position: 'Gardien de but',    image_url: '/images/players/PSG/safonov.jpg',          nationality_code: 'RU' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 41, full_name: 'Senny Mayulu',           position: 'Milieu de terrain', image_url: '/images/players/PSG/mayulu.jpg',           nationality_code: 'FR' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 44, full_name: 'Quentin Ndjantou',       position: 'Attaquant',         image_url: '/images/players/PSG/Ndjantou.jpg',         nationality_code: 'FR' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 49, full_name: 'Ibrahim Mbaye',          position: 'Attaquant',         image_url: '/images/players/PSG/mbaye.jpg',            nationality_code: 'FR' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 51, full_name: 'Willian Pacho',          position: 'Défenseur',         image_url: '/images/players/PSG/pacho.jpg',            nationality_code: 'EC' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 87, full_name: 'João Neves',             position: 'Milieu de terrain', image_url: '/images/players/PSG/neves.jpg',            nationality_code: 'PT' },
  { tenantSlug: 'paris-saint-germain', shirt_number: 89, full_name: 'Renato Marin',           position: 'Gardien de but',    image_url: '/images/players/PSG/marin.jpg',            nationality_code: 'BR' }
];

// ─── TROPHIES ────────────────────────────────────────────────
export const trophies = [
  // OM (palmarès résumé)
  { tenantSlug: 'olympique-de-marseille', label: 'Ligue des Champions UEFA',   count: 1,  years_text: '1992-93', scope: 'european', display_order: 1 },
  { tenantSlug: 'olympique-de-marseille', label: 'Coupe Intertoto',            count: 1,  years_text: '2005',    scope: 'european', display_order: 2 },
  { tenantSlug: 'olympique-de-marseille', label: 'Championnat de France',      count: 9,  years_text: '1937, 1948, 1971, 1972, 1989, 1990, 1991, 1992, 2010', scope: 'domestic', display_order: 10 },
  { tenantSlug: 'olympique-de-marseille', label: 'Coupe de France',            count: 10, years_text: '1924, 1926, 1927, 1935, 1938, 1943, 1969, 1972, 1976, 1989', scope: 'domestic', display_order: 11 },
  { tenantSlug: 'olympique-de-marseille', label: 'Coupe de la Ligue',          count: 3,  years_text: '2010, 2011, 2012', scope: 'domestic', display_order: 12 },
  { tenantSlug: 'olympique-de-marseille', label: 'Trophée des Champions',      count: 3,  years_text: '1971, 2010, 2011', scope: 'domestic', display_order: 13 },
  // Simba SC
  { tenantSlug: 'simba-sc', label: 'NBC Premier League', count: 23, years_text: '1965, 1971-1973, 1976-1981, 1992-1995, 2000, 2002, 2009-2012, 2018, 2020-2023', scope: 'domestic', display_order: 1 },
  { tenantSlug: 'simba-sc', label: 'Coupe de Tanzanie',  count: 6,  years_text: '1974, 1975, 1976, 2000, 2010, 2024', scope: 'domestic', display_order: 2 },
  // Young Africans SC
  { tenantSlug: 'young-africans-sc', label: 'NBC Premier League', count: 30, years_text: '1968-1970, 1974, 1978, 1981, 1982, 1984-1987, 1992, 1996-1998, 2005, 2006, 2008, 2011, 2013, 2015-2017, 2019, 2024-2025', scope: 'domestic', display_order: 1 },
  { tenantSlug: 'young-africans-sc', label: 'Coupe de Tanzanie',  count: 5,  years_text: '1975, 1999, 2003, 2018, 2023', scope: 'domestic', display_order: 2 },
  // Azam FC
  { tenantSlug: 'azam-fc', label: 'NBC Premier League',     count: 1, years_text: '2014',       scope: 'domestic', display_order: 1 },
  { tenantSlug: 'azam-fc', label: 'Coupe de Tanzanie',      count: 2, years_text: '2013, 2018', scope: 'domestic', display_order: 2 },
  { tenantSlug: 'azam-fc', label: 'Community Shield TZ',    count: 1, years_text: '2014',       scope: 'domestic', display_order: 3 },
  // Namungo FC
  { tenantSlug: 'namungo-fc', label: 'Coupe de Tanzanie', count: 1, years_text: '2020', scope: 'domestic', display_order: 1 },

  // PSG (58 trophées au total — palmarès complet)
  { tenantSlug: 'paris-saint-germain', label: 'Ligue des champions',           count: 2,  years_text: '2025, 2026',                                                                            scope: 'european', display_order: 1 },
  { tenantSlug: 'paris-saint-germain', label: 'Coupe intercontinentale',       count: 1,  years_text: '2025',                                                                                  scope: 'world',    display_order: 2 },
  { tenantSlug: 'paris-saint-germain', label: 'Supercoupe d\'Europe',          count: 1,  years_text: '2025',                                                                                  scope: 'european', display_order: 3 },
  { tenantSlug: 'paris-saint-germain', label: 'Coupe des vainqueurs de coupe', count: 1,  years_text: '1996',                                                                                  scope: 'european', display_order: 4 },
  { tenantSlug: 'paris-saint-germain', label: 'Championnat de France',         count: 14, years_text: '1986, 1994, 2013-2016, 2018-2020, 2022-2026',                                           scope: 'domestic', display_order: 10 },
  { tenantSlug: 'paris-saint-germain', label: 'Coupe de France',               count: 16, years_text: '1982, 1983, 1993, 1995, 1998, 2004, 2006, 2010, 2015-2018, 2020, 2021, 2024, 2025',    scope: 'domestic', display_order: 11 },
  { tenantSlug: 'paris-saint-germain', label: 'Coupe de la Ligue',             count: 9,  years_text: '1995, 1998, 2008, 2014-2018, 2020',                                                     scope: 'domestic', display_order: 12 },
  { tenantSlug: 'paris-saint-germain', label: 'Trophée des champions',         count: 14, years_text: '1995, 1998, 2013-2020, 2022-2025',                                                     scope: 'domestic', display_order: 13 }
];

// ─── PRODUCTS ────────────────────────────────────────────────
// Helper pour générer les 4 produits standard d'un club tanzanien.
function tzClubProducts(slug, folder) {
  const base = `/images/products/${folder}`;
  return [
    { tenantSlug: slug, category_slug: 'jersey',    name: 'Maillot Officiel',   pcc_price: 75, eur_price: 75,
      image_url: `${base}/jersey-recto.png`,
      images: [`${base}/jersey-recto.png`, `${base}/jersey-verso.png`],
      sizes: ['XS','S','M','L','XL','XXL','XXXL'], emoji: '👕', display_order: 1 },
    { tenantSlug: slug, category_slug: 'hoodie',    name: 'Sweat à capuche',    pcc_price: 55, eur_price: 55,
      image_url: `${base}/sweet-porte-recto.png`,
      images: [`${base}/sweet-porte-recto.png`, `${base}/sweet-porte-verso.png`],
      sizes: ['S','M','L','XL','XXL'], emoji: '🥋', display_order: 2 },
    { tenantSlug: slug, category_slug: 'tshirt',    name: 'T-Shirt Officiel',   pcc_price: 30, eur_price: 30,
      image_url: `${base}/Tshirt-recto.png`,
      images: [`${base}/Tshirt-recto.png`, `${base}/Tshirt-verso.png`],
      sizes: ['XS','S','M','L','XL','XXL','XXXL'], emoji: '👕', display_order: 3 },
    { tenantSlug: slug, category_slug: 'accessory', name: 'Casquette Officielle', pcc_price: 20, eur_price: 20,
      image_url: `${base}/casquette-recto.png`,
      images: [`${base}/casquette-recto.png`, `${base}/casquette-verso.png`],
      emoji: '🧢', display_order: 4 }
  ];
}

export const products = [
  // 8 clubs Tanzanie : boutique standard
  ...tzClubProducts('azam-fc',           'Azam-FC'),
  ...tzClubProducts('coastal-union',     'Coastal-Union'),
  ...tzClubProducts('geita-gold-fc',     'Geita-Gold-FC'),
  ...tzClubProducts('jkt-tanzania',      'JKT-Tanzania'),
  ...tzClubProducts('kagera-sugar',      'Kagera-Sugar'),
  ...tzClubProducts('namungo-fc',        'Namungo-FC'),
  ...tzClubProducts('simba-sc',          'Simba-SC'),
  ...tzClubProducts('young-africans-sc', 'Young-Africans-SC'),

  // ZFF — 1 t-shirt
  { tenantSlug: 'federation-de-zanzibar-de-football', category_slug: 'tshirt',
    name: 'T-Shirt Fédération Zanzibar',
    description: 'T-shirt officiel aux couleurs de la Fédération de Zanzibar de Football.',
    pcc_price: 30, eur_price: 30,
    image_url: '/images/products/federation-de-zanzibar-de-football/Tshirt-recto.jpg',
    images: [
      '/images/products/federation-de-zanzibar-de-football/Tshirt-recto.jpg',
      '/images/products/federation-de-zanzibar-de-football/Tshirt-verso.jpg'
    ],
    sizes: ['XS','S','M','L','XL','XXL'], emoji: '👕', display_order: 1 },

  // OM — boutique complète (9 produits)
  { tenantSlug: 'olympique-de-marseille', category_slug: 'jersey',
    name: 'Maillot Domicile 2025-26',
    description: 'Maillot officiel à domicile, design Puma × OM, sponsor CMA CGM, blanc à liserés bleu et or.',
    pcc_price: 100, eur_price: 100,
    image_url: '/images/products/olympique-de-marseille/home-jersey.png',
    images: [
      '/images/products/olympique-de-marseille/home-jersey.png',
      '/images/products/olympique-de-marseille/home-jersey-2.png'
    ],
    sizes: ['XS','S','M','L','XL','XXL','XXXL'], emoji: '👕', display_order: 1 },
  { tenantSlug: 'olympique-de-marseille', category_slug: 'jersey',
    name: 'Maillot Extérieur 2025-26',
    description: 'Maillot officiel à l\'extérieur, design Puma × OM, sponsor CMA CGM.',
    pcc_price: 100, eur_price: 100,
    image_url: '/images/products/olympique-de-marseille/out-jersey-recto.png',
    images: [
      '/images/products/olympique-de-marseille/out-jersey-recto.png',
      '/images/products/olympique-de-marseille/out-jersey-verso.png'
    ],
    sizes: ['XS','S','M','L','XL','XXL','XXXL'], emoji: '👕', display_order: 2 },
  { tenantSlug: 'olympique-de-marseille', category_slug: 'jersey',
    name: 'Maillot d\'Entraînement OM',
    description: 'Maillot d\'entraînement officiel Puma × OM, idéal pour l\'effort.',
    pcc_price: 50, eur_price: 50,
    image_url: '/images/products/olympique-de-marseille/training-recto.png',
    images: [
      '/images/products/olympique-de-marseille/training-recto.png',
      '/images/products/olympique-de-marseille/training1-recto.png',
      '/images/products/olympique-de-marseille/training verso.png'
    ],
    sizes: ['XS','S','M','L','XL','XXL','XXXL'], emoji: '👕', display_order: 3 },
  { tenantSlug: 'olympique-de-marseille', category_slug: 'hoodie',
    name: 'Sweat à capuche OM',
    description: 'Sweat à capuche officiel OM, coupe ample, parfait pour la tribune.',
    pcc_price: 85, eur_price: 85,
    image_url: '/images/products/olympique-de-marseille/sweet-recto.png',
    images: [
      '/images/products/olympique-de-marseille/sweet-recto.png',
      '/images/products/olympique-de-marseille/sweet-verso.png',
      '/images/products/olympique-de-marseille/sweet-porte.png'
    ],
    sizes: ['S','M','L','XL','XXL'], emoji: '🥋', display_order: 4 },
  { tenantSlug: 'olympique-de-marseille', category_slug: 'tshirt',
    name: 'T-Shirt OM Travel',
    description: 'T-shirt officiel OM Travel, coton premium, esprit Droit au but.',
    pcc_price: 45, eur_price: 45,
    image_url: '/images/products/olympique-de-marseille/Tshirt-travel.png',
    images: [
      '/images/products/olympique-de-marseille/Tshirt-travel.png',
      '/images/products/olympique-de-marseille/Tshirt-travel-verso.png',
      '/images/products/olympique-de-marseille/Tshirt-travel2.png'
    ],
    sizes: ['XS','S','M','L','XL','XXL','XXXL'], emoji: '👕', display_order: 5 },
  { tenantSlug: 'olympique-de-marseille', category_slug: 'accessory',
    name: 'Écharpe Allez l\'OM',
    description: 'Écharpe tricotée officielle aux couleurs marseillaises, design Allez l\'OM.',
    pcc_price: 15, eur_price: 15,
    image_url: '/images/products/olympique-de-marseille/echarp-allez.png',
    images: [
      '/images/products/olympique-de-marseille/echarp-allez.png',
      '/images/products/olympique-de-marseille/echarp-allez2.png',
      '/images/products/olympique-de-marseille/echarp-allez3.png'
    ],
    emoji: '🧣', display_order: 6 },
  { tenantSlug: 'olympique-de-marseille', category_slug: 'accessory',
    name: 'Casquette OM',
    description: 'Casquette officielle aux couleurs de l\'OM, taille unique ajustable.',
    pcc_price: 30, eur_price: 30,
    image_url: '/images/products/olympique-de-marseille/casquette-recto.png',
    images: [
      '/images/products/olympique-de-marseille/casquette-recto.png',
      '/images/products/olympique-de-marseille/casquette-verso.png',
      '/images/products/olympique-de-marseille/casquette-verso2.png',
      '/images/products/olympique-de-marseille/casquette2recto.png'
    ],
    emoji: '🧢', display_order: 7 },
  { tenantSlug: 'olympique-de-marseille', category_slug: 'other',
    name: 'Ballon Officiel OM',
    description: 'Ballon officiel aux couleurs de l\'Olympique de Marseille. Sous licence officielle.',
    pcc_price: 25, eur_price: 25,
    image_url: '/images/products/olympique-de-marseille/Ballon OM.png',
    images: [
      '/images/products/olympique-de-marseille/Ballon OM.png',
      '/images/products/olympique-de-marseille/Ballon OM2.png'
    ],
    emoji: '⚽', display_order: 8 },
  { tenantSlug: 'olympique-de-marseille', category_slug: 'home',
    name: 'Linge De Lit OM PRADO 240 × 220',
    description: 'Linge de lit Olympique de Marseille inspiration du Prado, coloris bleu et blanc. Housse de couette réversible. Produit sous licence officielle. Composition : 100 % coton.',
    pcc_price: 69.90, eur_price: 69.90,
    image_url: '/images/products/olympique-de-marseille/lingeLit.png',
    images: [
      '/images/products/olympique-de-marseille/lingeLit.png',
      '/images/products/olympique-de-marseille/lingeLit2.png',
      '/images/products/olympique-de-marseille/lingeLit3.png'
    ],
    emoji: '🛏️', display_order: 9 }
];
