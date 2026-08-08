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
  getTeamsByLeagueSeason, getMatchForTeam, getLiveFixtures, getFixtureDetail, getTeamFixtures, DEFAULT_LIVE_LEAGUES,
};
