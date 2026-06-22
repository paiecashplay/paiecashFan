// ═══════════════════════════════════════════════════════════════
// services/apiFootball.js — Wrapper API-Football v3 (api-football.com)
// Abonnement direct → en-tête x-apisports-key, base v3.football.api-sports.io
// Clé : process.env.API_FOOTBALL_KEY (dans backend/.env)
// Doc : https://www.api-football.com/documentation-v3
// ═══════════════════════════════════════════════════════════════

const axios = require('axios');

const BASE = 'https://v3.football.api-sports.io';

function client() {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    const e = new Error('API_FOOTBALL_KEY manquante dans backend/.env');
    e.code = 'NO_KEY';
    throw e;
  }
  return axios.create({
    baseURL: BASE,
    headers: { 'x-apisports-key': key },
    timeout: 15000
  });
}

// Normalise la shape team+venue renvoyée par /teams
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

// GET /teams?search= — recherche un club par nom
async function searchTeams(q) {
  const { data } = await client().get('/teams', { params: { search: q } });
  return (data.response || []).map(mapTeam).filter(Boolean);
}

// GET /teams?id= — détail d'un club
async function getTeam(teamId) {
  const { data } = await client().get('/teams', { params: { id: teamId } });
  return mapTeam((data.response || [])[0]) || null;
}

// GET /players/squads?team= — effectif courant
async function getSquad(teamId) {
  const { data } = await client().get('/players/squads', { params: { team: teamId } });
  const squad = (data.response || [])[0];
  return (squad?.players || []).map((p) => ({
    apiId:        p.id,
    full_name:    p.name,
    shirt_number: p.number ?? null,
    position:     p.position || null,   // Goalkeeper | Defender | Midfielder | Attacker
    photo:        p.photo || null
  }));
}

module.exports = { searchTeams, getTeam, getSquad };
