// ═══════════════════════════════════════════════════════════════
// services/footballApi.js - TheSportsDB Wrapper + cache layer
// ═══════════════════════════════════════════════════════════════

const axios = require('axios');
const supabase = require('../db/supabase');
require('dotenv').config();

const API_KEY = process.env.THESPORTSDB_KEY || '3';
const BASE_URL = process.env.THESPORTSDB_BASE || 'https://www.thesportsdb.com/api/v1/json';

const client = axios.create({
  baseURL: `${BASE_URL}/${API_KEY}`,
  timeout: 10000
});

/**
 * Helper to get data from cache or fetch from API
 */
async function fetchWithCache(cacheKey, ttlSeconds, apiCallFn) {
  // 1. Check cache
  const { data: cached } = await supabase
    .from('api_cache')
    .select('*')
    .eq('cache_key', cacheKey)
    .single();

  if (cached) {
    const ageSeconds = (Date.now() - new Date(cached.fetched_at).getTime()) / 1000;
    if (ageSeconds < cached.ttl_seconds) {
      return cached.data;
    }
  }

  // 2. Fetch from API
  try {
    const result = await apiCallFn();
    if (!result) throw new Error('Empty response from API');

    // 3. Save to cache
    await supabase
      .from('api_cache')
      .upsert({
        cache_key: cacheKey,
        data: result,
        fetched_at: new Date().toISOString(),
        ttl_seconds: ttlSeconds
      });
    return result;
  } catch (error) {
    console.error(`[TheSportsDB Error] ${cacheKey}:`, error.message);
    if (cached) {
      console.warn(`[TheSportsDB Fallback] Serving stale cache for ${cacheKey}`);
      return cached.data;
    }
    return { error: 'data_unavailable', message: 'Live data temporarily unavailable' };
  }
}

function mapFixture(event) {
  if (!event) return null;
  return {
    fixtureId: event.idEvent,
    homeTeam: event.strHomeTeam,
    homeTeamId: event.idHomeTeam,
    homeTeamLogo: event.strHomeTeamBadge,
    awayTeam: event.strAwayTeam,
    awayTeamId: event.idAwayTeam,
    awayTeamLogo: event.strAwayTeamBadge,
    kickoffAt: event.strTimestamp || event.dateEvent + 'T' + event.strTime,
    venue: event.strVenue,
    round: event.intRound,
    status: event.strStatus === 'Match Finished' ? 'FT' : (event.strStatus === 'Started' ? 'LIVE' : 'NS'),
    homeScore: event.intHomeScore ? parseInt(event.intHomeScore) : 0,
    awayScore: event.intAwayScore ? parseInt(event.intAwayScore) : 0,
    minute: null, // TheSportsDB free doesn't always have live minutes
  };
}

async function getFixtures(leagueId) {
  const cacheKey = `fixtures_${leagueId}`;
  const ttl = 1800; // 30 minutes

  const data = await fetchWithCache(cacheKey, ttl, async () => {
    const res = await client.get(`/eventsnextleague.php`, {
      params: { id: leagueId }
    });
    return res.data.events || [];
  });

  if (data.error) return data;
  return data.map(mapFixture);
}

async function getLiveFixtures(leagueId) {
  const cacheKey = `live_${leagueId}`;
  const ttl = 60;

  const data = await fetchWithCache(cacheKey, ttl, async () => {
    const res = await client.get(`/eventsnextleague.php`, {
      params: { id: leagueId }
    });
    return res.data.events || [];
  });

  if (data.error) return data;
  return data.filter(e => e.strStatus === 'Started').map(mapFixture);
}

async function getFixtureById(fixtureId) {
  const cacheKey = `fixture_${fixtureId}`;
  const ttl = 300;

  const data = await fetchWithCache(cacheKey, ttl, async () => {
    const res = await client.get(`/lookupevent.php`, {
      params: { id: fixtureId }
    });
    return res.data.events || [];
  });

  if (data.error) return data;
  if (!data || data.length === 0) return null;
  return mapFixture(data[0]);
}

async function getFixturesForWeek(leagueId) {
  return getFixtures(leagueId);
}

async function getSquad(teamId) {
  const cacheKey = `squad_${teamId}`;
  const ttl = 86400; // 24 hours

  const data = await fetchWithCache(cacheKey, ttl, async () => {
    const res = await client.get(`/lookup_all_players.php`, {
      params: { id: teamId }
    });
    return res.data.player || [];
  });

  if (data.error) return data;
  return data.map(p => ({
    id: p.idPlayer,
    name: p.strPlayer,
    number: p.strNumber,
    position: p.strPosition,
    photo: p.strThumb
  }));
}

module.exports = {
  getFixtures,
  getLiveFixtures,
  getFixtureById,
  getFixturesForWeek,
  getSquad,
  mapFixture
};
