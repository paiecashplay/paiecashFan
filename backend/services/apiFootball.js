// ═══════════════════════════════════════════════════════════════
// services/apiFootball.js — Wrapper API-Football v3
// Supporte les 2 fournisseurs (variable API_FOOTBALL_PROVIDER) :
//   • apisports (défaut) — abonnement direct dashboard.api-football.com
//       base https://v3.football.api-sports.io · en-tête x-apisports-key
//   • rapidapi            — clé obtenue sur RapidAPI (abonnement requis)
//       base https://api-football-v1.p.rapidapi.com/v3
//       en-têtes x-rapidapi-key + x-rapidapi-host
// Clé : process.env.API_FOOTBALL_KEY (backend/.env)
// Doc : https://www.api-football.com/documentation-v3
// ═══════════════════════════════════════════════════════════════

const axios = require('axios');

// Host RapidAPI par défaut (API-Football d'API-SPORTS). Surchargé via
// API_FOOTBALL_RAPIDAPI_HOST si ton abonnement utilise un autre host.
const DEFAULT_RAPIDAPI_HOST = 'api-football-v1.p.rapidapi.com';

function client() {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    const e = new Error('API_FOOTBALL_KEY manquante dans backend/.env');
    e.code = 'NO_KEY';
    throw e;
  }
  const provider = (process.env.API_FOOTBALL_PROVIDER || 'apisports').toLowerCase();

  if (provider === 'rapidapi') {
    const host = (process.env.API_FOOTBALL_RAPIDAPI_HOST || DEFAULT_RAPIDAPI_HOST).trim();
    return axios.create({
      baseURL: `https://${host}/v3`,
      headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': host },
      timeout: 15000
    });
  }
  return axios.create({
    baseURL: 'https://v3.football.api-sports.io',
    headers: { 'x-apisports-key': key },
    timeout: 15000
  });
}

// API-Football renvoie HTTP 200 même en cas d'erreur : l'info est dans
// `data.errors` (objet/tableau) ou un `message` (RapidAPI non abonné).
// On lève une erreur explicite pour la remonter au front.
function check(data) {
  if (!data) throw new Error('Réponse vide d\'API-Football');
  if (typeof data.message === 'string' && !data.response) {
    throw new Error(`API-Football : ${data.message}`);
  }
  const errs = data.errors;
  if (Array.isArray(errs) && errs.length) {
    throw new Error('API-Football : ' + errs.join(' · '));
  }
  if (errs && typeof errs === 'object' && Object.keys(errs).length) {
    throw new Error('API-Football : ' + Object.values(errs).join(' · '));
  }
  return data;
}

function mapTeam(r) {
  if (!r?.team) return null;
  return {
    id:                r.team.id,
    name:              r.team.name,
    country:           r.team.country || null,
    founded:           r.team.founded || null,
    logo:              r.team.logo || null,
    national:          Boolean(r.team.national),
    stadium:           r.venue?.name || null,
    stadium_image_url: r.venue?.image || null,
    city:              r.venue?.city || null
  };
}

async function searchTeams(q) {
  const { data } = await client().get('/teams', { params: { search: q } });
  check(data);
  return (data.response || []).map(mapTeam).filter(Boolean);
}

async function getTeam(teamId) {
  const { data } = await client().get('/teams', { params: { id: teamId } });
  check(data);
  return mapTeam((data.response || [])[0]) || null;
}

// GET /leagues?code= — championnats d'un pays (code 2 lettres, ex: CM)
async function getLeaguesByCountryCode(code) {
  const { data } = await client().get('/leagues', { params: { code } });
  check(data);
  return (data.response || []).map((l) => ({
    id:          l.league?.id,
    name:        l.league?.name,
    type:        l.league?.type,          // 'League' | 'Cup'
    countryName: l.country?.name || null,
    seasons:     (l.seasons || []).map((s) => ({ year: s.year, current: Boolean(s.current) }))
  })).filter((l) => l.id);
}

// GET /leagues?country= — championnats par NOM de pays (ex: England, Italy).
// Utile quand le code 2 lettres ne matche pas (Angleterre = "England").
async function getLeaguesByCountryName(name) {
  const { data } = await client().get('/leagues', { params: { country: name } });
  check(data);
  return (data.response || []).map((l) => ({
    id:          l.league?.id,
    name:        l.league?.name,
    type:        l.league?.type,
    countryName: l.country?.name || null,
    seasons:     (l.seasons || []).map((s) => ({ year: s.year, current: Boolean(s.current) }))
  })).filter((l) => l.id);
}

// GET /teams?league=&season= — équipes d'un championnat pour une saison
async function getTeamsByLeagueSeason(leagueId, season) {
  const { data } = await client().get('/teams', { params: { league: leagueId, season } });
  check(data);
  return (data.response || []).map(mapTeam).filter(Boolean);
}

// ── Résolution automatique du nom de pays API-Football ───────────────
//
// Exemple :
// Supabase : country = "Tanzanie", country_code = "TZ"
// API-Football : { name: "Tanzania", code: "TZ" }
//
// On utilise donc le code pays pour retrouver automatiquement
// le nom attendu par API-Football.
//
// La liste /teams/countries change peu : cache 24 h pour éviter
// de consommer inutilement le quota API.
//
const TEAMS_COUNTRIES_CACHE_TTL = 24 * 60 * 60 * 1000;

let teamsCountriesCache = {
  data: null,
  expiresAt: 0,
};

async function getApiFootballTeamCountries() {
  const now = Date.now();

  if (
    Array.isArray(teamsCountriesCache.data) &&
    teamsCountriesCache.expiresAt > now
  ) {
    return teamsCountriesCache.data;
  }

  const { data } = await client().get('/teams/countries');

  check(data);

  const countries = data.response || [];

  teamsCountriesCache = {
    data: countries,
    expiresAt: now + TEAMS_COUNTRIES_CACHE_TTL,
  };

  return countries;
}

/**
 * Retrouve le nom de pays utilisé par API-Football.
 *
 * Exemples :
 * TZ + "Tanzanie" → "Tanzania"
 * FR + "France"   → "France"
 * NE + "Niger"    → "Niger"
 *
 * Si aucun pays ne correspond au code, on conserve le nom
 * d'origine afin de ne pas casser les données existantes.
 */
async function resolveApiFootballCountry(country, countryCode = null) {
  const fallbackCountry =
    String(country || '').trim();

  const normalizedCode =
    String(countryCode || '')
      .trim()
      .toUpperCase();

  if (!normalizedCode) {
    return fallbackCountry;
  }

  try {
    const countries =
      await getApiFootballTeamCountries();

    const match = countries.find((item) => {
      const apiCode =
        String(item?.code || '')
          .trim()
          .toUpperCase();

      return apiCode === normalizedCode;
    });

    if (match?.name) {
      return String(match.name).trim();
    }
  } catch (error) {
    console.error(
      `[apiFootball] country resolution error for ${normalizedCode}:`,
      error.message
    );
  }

  return fallbackCountry;
}

// GET /teams?country= — toutes les équipes d'un pays
// GET /teams?country= — toutes les équipes d'un pays
async function getTeamsByCountry(country, countryCode = null) {
  const apiCountry =
    await resolveApiFootballCountry(
      country,
      countryCode
    );

  if (!apiCountry) {
    return [];
  }

  const { data } = await client().get('/teams', {
    params: {
      country: apiCountry,
    },
  });

  check(data);

  return (data.response || [])
    .map(mapTeam)
    .filter(Boolean);
}

/**
 * Identifie une sélection nationale à partir du nom retourné
 * par API-Football.
 *
 * Exemples acceptés :
 * - France
 * - France W
 * - France U23
 * - France U20 W
 *
 * Exemples rejetés :
 * - Lyon W
 * - Paris Saint Germain W
 */
function parseNationalTeam(team, country) {
  if (!team?.name || !country) {
    return null;
  }

  const teamName = String(team.name).trim();
  const countryName = String(country).trim();

  const normalizedTeamName = teamName.toLowerCase();
  const normalizedCountryName = countryName.toLowerCase();

  if (
    normalizedTeamName !== normalizedCountryName &&
    !normalizedTeamName.startsWith(
      `${normalizedCountryName} `
    )
  ) {
    return null;
  }

  const suffix = teamName
    .slice(countryName.length)
    .trim();

  // Équipe senior masculine
  if (!suffix) {
    return {
      ...team,
      gender: 'male',
      category: 'senior',
    };
  }

  // Équipe senior féminine
  if (/^w$/i.test(suffix)) {
    return {
      ...team,
      gender: 'female',
      category: 'senior',
    };
  }

  // Équipes jeunes :
  // U17, U18, U20, U23, U17 W, U20 W...
  const youthMatch = suffix.match(
    /^u(\d{2})(?:\s+w)?$/i
  );

  if (!youthMatch) {
    return null;
  }

  const isWomen = /\s+w$/i.test(suffix);

  return {
    ...team,
    gender: isWomen ? 'female' : 'male',
    category: `U${youthMatch[1]}`,
  };
}

async function hasCurrentSquad(teamId) {
  if (!teamId) {
    return false;
  }

  try {
    const { data } = await client().get('/players/squads', {
      params: {
        team: teamId,
      },
    });

    check(data);

    const squad = data.response?.[0];

    return Array.isArray(squad?.players) &&
      squad.players.length > 0;
  } catch (error) {
    console.error(
      `[apiFootball] squad availability error for team ${teamId}:`,
      error.message
    );

    return false;
  }
}

async function addSquadAvailability(team) {
  if (!team?.id) {
    return team;
  }

  const hasPlayers =
    await hasCurrentSquad(team.id);

  return {
    ...team,
    hasPlayers,
  };
}


/**
 * Retourne les sélections nationales d'un pays,
 * classées pour le frontend.
 *
 * Le countryCode permet de retrouver automatiquement
 * le nom utilisé par API-Football.
 */
async function getNationalTeamsByCountry(country, countryCode = null) {
  /*
   * Exemple :
   * country = "Tanzanie"
   * countryCode = "TZ"
   *
   * devient :
   * apiCountry = "Tanzania"
   */
  const apiCountry = await resolveApiFootballCountry(country, countryCode);

  if (!apiCountry) {
    return {
      men: [],
      women: [],
      youth: [],
    };
  }

  /*
   * On utilise directement le nom résolu afin
   * de ne pas appeler deux fois /teams/countries.
   */
  const { data } = await client().get('/teams', {
    params: {
      country: apiCountry,
    },
  });

  check(data);

  const teams = (data.response || [])
    .map(mapTeam)
    .filter(Boolean);

  /*
   * IMPORTANT :
   * parseNationalTeam reçoit apiCountry,
   * donc "Tanzania" et non "Tanzanie".
   */
  const nationalTeams = teams
    .map((team) =>
      parseNationalTeam(
        team,
        apiCountry
      )
    )
    .filter(Boolean);

    
  const men = nationalTeams.filter(
  (team) =>
    team.gender === 'male' &&
    team.category === 'senior'
);

const women = nationalTeams.filter(
  (team) =>
    team.gender === 'female' &&
    team.category === 'senior'
);

const youth = nationalTeams.filter(
  (team) =>
    team.category !== 'senior'
);

const enrichAvailability = async (teams) =>
  Promise.all(
    teams.map((team) =>
      addSquadAvailability(team)
    )
  );

  const [menWithAvailability, womenWithAvailability, youthWithAvailability] = await Promise.all([
    enrichAvailability(men),
    enrichAvailability(women),
    enrichAvailability(youth),
  ]);

  return {
    men: menWithAvailability,
    women: womenWithAvailability,
    youth: youthWithAvailability,
  };
}

// ── Effectif d'une équipe (page « Effectif ») ─────────────────────
async function getCurrentSquad(teamId) {
  const { data } = await client().get('/players/squads', {
    params: { team: teamId },
  });

  check(data);

  const squad = data.response?.[0];

  if (!squad) {
    return [];
  }

  return squad.players || [];
}

function getFullPlayerName(player = {}) {
  const firstname = String(player.firstname || '').trim();
  const lastname = String(player.lastname || '').trim();

  if (firstname && lastname) {
    return `${firstname} ${lastname}`;
  }

  return player.name || '';
}

// ── Joueurs d'une équipe pour une compétition (ex: Ligue 1 2023-2024) ─────
async function getPlayersByCompetition({teamId, leagueId, season}) {
  let page = 1;
  let totalPages = 1;
  const players = [];

  do {
    const { data } = await client().get('/players', {
      params: {
        team: teamId,
        league: leagueId,
        season,
        page,
      },
    });

    check(data);

    const pagePlayers = (data.response || []).map((entry) => {
    if (!entry?.player) return entry;

    return {
      ...entry,
      player: {
        ...entry.player,
        name: getFullPlayerName(entry.player),
      },
    };
  });

    players.push(...pagePlayers);

    totalPages = data.paging?.total || 1;
    page += 1;
  } while (page <= totalPages);

  return players;
}

// ── Récupère la compétition la plus récente pour une équipe ─────────
async function getRecentCompetitionForTeam(teamId) {
  if (!teamId) {
    return null;
  }

  try {
    const { data } = await client().get('/leagues', {
      params: {
        team: teamId,
        current: true,
      },
    });

    check(data);

    const competitions = [];

    for (const item of data.response || []) {
      const league = item.league;

      for (const season of item.seasons || []) {
        competitions.push({
          leagueId: league.id,
          leagueName: league.name,
          leagueType: league.type,

          season: season.year,
          start: season.start,
          end: season.end,

          current: season.current === true,

          players:
            season.coverage?.players === true,

          statisticsPlayers:
            season.coverage?.fixtures
              ?.statistics_players === true,
        });
      }
    }

    /*
     * On privilégie :
     * 1. les compétitions ayant une couverture joueurs ;
     * 2. les saisons les plus récentes ;
     * 3. les compétitions avec statistiques joueurs.
     *
     * ATTENTION :
     * players=true ne garantit pas que /players retournera
     * réellement des joueurs. Le fallback current_squad
     * reste donc indispensable.
     */
    const usableCompetitions = competitions
      .filter((competition) => competition.players)
      .sort((a, b) => {
        if (
          a.statisticsPlayers !==
          b.statisticsPlayers
        ) {
          return Number(b.statisticsPlayers) -
            Number(a.statisticsPlayers);
        }

        const dateA = new Date(
          a.start || `${a.season}-01-01`
        ).getTime();

        const dateB = new Date(
          b.start || `${b.season}-01-01`
        ).getTime();

        return dateB - dateA;
      });

    return usableCompetitions[0] || null;
  } catch (error) {
    console.error(
      `[apiFootball] recent competition error for team ${teamId}:`,
      error.message
    );

    return null;
  }
}

// ── Récupère les joueurs d'une fédération (tous les clubs membres) ─────
async function getRecentPlayersForTeam(teamId, competition = null) {
  let selectedCompetition = competition;

  /*
   * Si aucune compétition n'est fournie,
   * on cherche automatiquement la plus récente.
   */
  if (!selectedCompetition) {
    selectedCompetition = await getRecentCompetitionForTeam(teamId);
  }

  if (
    selectedCompetition?.leagueId &&
    selectedCompetition?.season
  ) {
    try {
      const competitionPlayers =
        await getPlayersByCompetition({
          teamId,
          leagueId:
            selectedCompetition.leagueId,
          season:
            selectedCompetition.season,
        });

      if (competitionPlayers.length > 0) {
        return {
          source: 'competition',

          leagueId:
            selectedCompetition.leagueId,

          leagueName:
            selectedCompetition.leagueName ||
            null,

          season:
            selectedCompetition.season,

          players: competitionPlayers,
        };
      }
    } catch (error) {
      console.error(
        `[apiFootball] competition players error for team ${teamId}:`,
        error.message
      );
    }
  }

  /*
   * FALLBACK :
   * si la compétition ne contient aucun joueur,
   * on récupère l'effectif actuel.
   */
  try {
    const squad = await getCurrentSquad(teamId);

    if (squad.length > 0) {
      return {
        source: 'current_squad',
        leagueId: null,
        leagueName: null,
        season: null,
        players: squad,
      };
    }

    return {
      source: 'none',
      leagueId: null,
      leagueName: null,
      season: null,
      players: [],
    };
  } catch (error) {
    console.error(`[apiFootball] current squad error for team ${teamId}:`, error.message);

    return {
      source: 'none',
      leagueId: null,
      leagueName: null,
      season: null,
      players: [],
    };
  }
}

// ── Enrichit une sélection nationale avec ses joueurs récents ─────────
async function enrichNationalTeamWithPlayers(team) {
  if (!team?.id) {
    return team;
  }

  const playerData =
    await getRecentPlayersForTeam(team.id);

  return {
    ...team,

    playersSource:
      playerData.source,

    playersCompetition: {
      leagueId:
        playerData.leagueId,

      leagueName:
        playerData.leagueName,

      season:
        playerData.season,
    },

    players:
      playerData.players,
  };
}

// ── Récupère les sélections nationales d'un pays avec leurs joueurs ─────
async function getNationalTeamsWithPlayers(country, countryCode = null) {
  const nationalTeams = await getNationalTeamsByCountry(country, countryCode);

  const enrichTeams = async (teams) =>
    Promise.all(
      (teams || []).map((team) =>
        enrichNationalTeamWithPlayers(team)
      )
    );

  const [men, women, youth] =
    await Promise.all([
      enrichTeams(nationalTeams.men),
      enrichTeams(nationalTeams.women),
      enrichTeams(nationalTeams.youth),
    ]);

  return {
    men,
    women,
    youth,
  };
}

async function getSquad(teamId) {
  const { data } = await client().get('/players/squads', { params: { team: teamId } });
  check(data);
  const squad = (data.response || [])[0];
  return (squad?.players || []).map((p) => ({
    apiId:        p.id,
    full_name:    p.name,
    shirt_number: p.number ?? null,
    position:     p.position || null,
    photo:        p.photo || null
  }));
}

// ── Fixtures / match live (bannière Fan Club) ────────────────
// Cache mémoire simple : l'API-Football a un quota → on partage les réponses
// entre tous les utilisateurs (live 30 s, à-venir/dernier 1 h).
const _cache = new Map();
async function cached(key, ttlMs, fn) {
  const hit = _cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await fn();
  _cache.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

// Statuts « en direct » d'API-Football (elapsed = minute jouée).
const LIVE_STATUSES = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE', 'INT', 'SUSP'];

function mapFixture(r) {
  if (!r?.fixture) return null;
  const short = r.fixture.status?.short || 'NS';
  const isLive = LIVE_STATUSES.includes(short);
  return {
    fixtureId:   r.fixture.id,
    status:      isLive ? 'LIVE' : (short === 'NS' || short === 'TBD' ? 'NS' : 'FT'),
    statusShort: short,
    statusLong:  r.fixture.status?.long || null,
    minute:      r.fixture.status?.elapsed ?? null,
    kickoff:     r.fixture.date || null,
    venue:       r.fixture.venue?.name || null,
    competition: r.league?.name || null,
    round:       r.league?.round || null,
    homeTeamId:  r.teams?.home?.id ?? null,
    awayTeamId:  r.teams?.away?.id ?? null,
    homeTeam:    r.teams?.home?.name || null,
    awayTeam:    r.teams?.away?.name || null,
    homeLogo:    r.teams?.home?.logo || null,
    awayLogo:    r.teams?.away?.logo || null,
    homeScore:   r.goals?.home ?? null,
    awayScore:   r.goals?.away ?? null,
  };
}

async function fetchFixtures(params) {
  const { data } = await client().get('/fixtures', { params });
  check(data);
  return (data.response || []).map(mapFixture).filter(Boolean);
}

// Match à afficher pour une équipe : le direct en priorité, sinon le prochain,
// sinon le dernier joué. Renvoie null si l'équipe n'a aucun match (ou pas de clé).
async function getMatchForTeam(teamId) {
  if (!teamId) return null;

  const live = await cached(`live:${teamId}`, 30_000, () => fetchFixtures({ team: teamId, live: 'all' }));
  if (live.length) return live[0];

  const next = await cached(`next:${teamId}`, 3_600_000, () => fetchFixtures({ team: teamId, next: 1 }));
  if (next.length) return next[0];

  const last = await cached(`last:${teamId}`, 3_600_000, () => fetchFixtures({ team: teamId, last: 1 }));
  return last[0] || null;
}

// Grandes compétitions surfacées dans « Matchs en direct » (id API-Football).
// Ligue 1(61) L2(62) PL(39) LaLiga(140) SerieA(135) Bundesliga(78) Eredivisie(88)
// Primeira(94) UCL(2) UEL(3) Conference(848) CAN(6) Mondial(1) Ligue des nations(5)
const DEFAULT_LIVE_LEAGUES = [61, 62, 39, 140, 135, 78, 88, 94, 2, 3, 848, 6, 1, 5];

// Tous les matchs EN DIRECT des grandes compétitions (clubs inscrits OU non).
// Cache 30 s partagé pour rester sous le quota.
async function getLiveFixtures(leagueIds = DEFAULT_LIVE_LEAGUES) {
  const key = leagueIds.slice().sort((a, b) => a - b).join('-');
  return cached(`livefeed:${key}`, 30_000, () => fetchFixtures({ live: key }));
}

// ── Détail d'un match (page « match center ») ────────────────────
async function getFixtureById(id) {
  const list = await cached(`fixture:${id}`, 30_000, () => fetchFixtures({ id }));
  return list[0] || null;
}

async function getFixtureEvents(id) {
  return cached(`events:${id}`, 30_000, async () => {
    const { data } = await client().get('/fixtures/events', { params: { fixture: id } });
    check(data);
    return (data.response || []).map((e) => ({
      minute: e.time?.elapsed ?? null,
      extra:  e.time?.extra ?? null,
      teamId: e.team?.id ?? null,
      team:   e.team?.name || null,
      player: e.player?.name || null,
      assist: e.assist?.name || null,
      type:   e.type || null,      // Goal | Card | subst | Var
      detail: e.detail || null,    // Normal Goal | Penalty | Yellow Card | Red Card | ...
    }));
  });
}

async function getFixtureStatistics(id) {
  return cached(`stats:${id}`, 30_000, async () => {
    const { data } = await client().get('/fixtures/statistics', { params: { fixture: id } });
    check(data);
    return (data.response || []).map((s) => ({
      teamId:   s.team?.id ?? null,
      teamName: s.team?.name || null,
      stats:    (s.statistics || []).map((x) => ({ type: x.type, value: x.value })),
    }));
  });
}

// Résultats récents + prochains matchs d'un club (page « Matchs du club »).
async function getTeamFixtures(teamId, { last = 5, next = 3 } = {}) {
  if (!teamId) return { recent: [], upcoming: [] };
  const [recent, upcoming] = await Promise.all([
    cached(`teamlast:${teamId}:${last}`, 300_000, () => fetchFixtures({ team: teamId, last })),
    cached(`teamnext:${teamId}:${next}`, 300_000, () => fetchFixtures({ team: teamId, next })),
  ]);
  // API-Football renvoie « last » du plus ancien au plus récent → on remet le plus récent en tête.
  return { recent: recent.slice().reverse(), upcoming };
}

// Détail complet : le match + les événements + les stats (best-effort sur events/stats).
async function getFixtureDetail(id) {
  const match = await getFixtureById(id);
  if (!match) return null;
  const [events, statistics] = await Promise.all([
    getFixtureEvents(id).catch(() => []),
    getFixtureStatistics(id).catch(() => []),
  ]);
  return { match, events, statistics };
}



module.exports = {
  searchTeams, getTeam, getSquad, getLeaguesByCountryCode, getLeaguesByCountryName,
  getTeamsByLeagueSeason, getApiFootballTeamCountries,resolveApiFootballCountry,getTeamsByCountry,
  hasCurrentSquad, addSquadAvailability,
  getNationalTeamsByCountry, getCurrentSquad, getPlayersByCompetition, getRecentPlayersForTeam,
  getRecentCompetitionForTeam, enrichNationalTeamWithPlayers, getNationalTeamsWithPlayers,
  getMatchForTeam, getLiveFixtures, getFixtureDetail, getTeamFixtures, DEFAULT_LIVE_LEAGUES,
};
