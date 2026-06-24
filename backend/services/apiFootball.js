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

module.exports = { searchTeams, getTeam, getSquad, getLeaguesByCountryCode, getTeamsByLeagueSeason };
