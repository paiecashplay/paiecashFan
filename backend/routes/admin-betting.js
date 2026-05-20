// ═══════════════════════════════════════════════════════════════
// routes/admin-betting.js - Admin Betting  Routes
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const dbConfigs = require('../db/leagueConfigs');
const dbGames = require('../db/bettingGames');
const dbMarkets = require('../db/bettingMarkets');
const footballApi = require('../services/footballApi');
const bettingEngine = require('../services/bettingEngine');
const oddsEngine = require('../services/oddsEngine');

// Middleware to check admin role (placeholder - adapt to your auth)
const isAdmin = (req, res, next) => {
  // Assuming req.user is set by auth middleware
  // if (req.user && req.user.role === 'frostrek_admin') return next();
  // return res.status(403).json({ error: 'Forbidden' });
  next(); // For demo, bypass
};

// ─── LEAGUES ──────────────────────────────────────────────────

router.get('/leagues', isAdmin, async (req, res) => {
  try {
    const leagues = await dbConfigs.getAllLeagueConfigs();
    res.json(leagues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/leagues/:leagueId', isAdmin, async (req, res) => {
  try {
    const { is_active, betting_enabled, prediction_enabled, min_stake_pcc, max_stake_pcc, house_edge_pct } = req.body;
    const league = await dbConfigs.updateLeagueConfig(req.params.leagueId, {
      is_active, betting_enabled, prediction_enabled, min_stake_pcc, max_stake_pcc, house_edge_pct
    });
    res.json(league);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── FIXTURES ─────────────────────────────────────────────────

router.get('/fixtures', isAdmin, async (req, res) => {
  try {
    const { leagueId, date } = req.query;
    if (!leagueId) return res.status(400).json({ error: 'leagueId required' });

    let fixtures = [];
    if (date) {
      fixtures = await footballApi.getFixtures(leagueId, date);
    } else {
      fixtures = await footballApi.getFixturesForWeek(leagueId);
    }

    if (fixtures.error) return res.status(503).json(fixtures);

    // Filter out already added games
    const existingGames = await dbGames.getGamesByLeague(leagueId);
    const existingFixtureIds = new Set(existingGames.map(g => g.fixture_id));

    const available = fixtures.filter(f => !existingFixtureIds.has(f.fixtureId));
    res.json(available);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GAMES ────────────────────────────────────────────────────

router.post('/games', isAdmin, async (req, res) => {
  try {
    const { fixtureId, leagueId } = req.body;
    const fixture = await footballApi.getFixtureById(fixtureId);
    if (!fixture) return res.status(404).json({ error: 'Fixture not found' });

    const league = await dbConfigs.getLeagueConfig(leagueId);

    const kickoff = new Date(fixture.kickoffAt);
    const closesAt = new Date(kickoff.getTime() - 5 * 60000); // 5 mins before

    const game = await dbGames.createBettingGame({
      league_id: leagueId,
      league_name: league.league_name,
      fixture_id: fixtureId,
      home_team: fixture.homeTeam,
      home_team_logo: fixture.homeTeamLogo,
      away_team: fixture.awayTeam,
      away_team_logo: fixture.awayTeamLogo,
      kickoff_at: fixture.kickoffAt,
      venue: fixture.venue,
      round: fixture.round,
      status: fixture.status === 'LIVE' ? 'live' : (fixture.status === 'FT' ? 'finished' : 'scheduled'),
      home_score: fixture.homeScore,
      away_score: fixture.awayScore,
      minute: fixture.minute,
      betting_closes_at: closesAt.toISOString(),
      created_by: req.user ? req.user.id : null
    });
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/games/:gameId', isAdmin, async (req, res) => {
  try {
    const { is_active, betting_open } = req.body;
    const game = await dbGames.updateGame(req.params.gameId, { is_active, betting_open });
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/games/:gameId', isAdmin, async (req, res) => {
  try {
    const game = await dbGames.getGameById(req.params.gameId);
    if (game.total_bets > 0) return res.status(400).json({ error: 'ERR_BETS_EXIST' });

    await dbGames.updateGame(req.params.gameId, { is_active: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── MARKETS ──────────────────────────────────────────────────

router.post('/games/:gameId/markets', isAdmin, async (req, res) => {
  try {
    const { market_type, question, description, is_featured, options } = req.body;

    const validation = oddsEngine.validateMarketOptions(options);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    const market = await dbMarkets.createMarket({
      game_id: req.params.gameId,
      market_type,
      question,
      description,
      is_featured,
      options
    });
    res.json(market);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/markets/:marketId', isAdmin, async (req, res) => {
  try {
    const { question, options, is_featured, status } = req.body;
    const market = await dbMarkets.getMarketById(req.params.marketId);

    if (options && market.total_staked_pcc > 0) {
      return res.status(400).json({ error: 'Cannot change options after bets placed' });
    }

    if (options) {
      const validation = oddsEngine.validateMarketOptions(options);
      if (!validation.valid) return res.status(400).json({ error: validation.error });
    }

    const updated = await dbMarkets.updateMarket(req.params.marketId, {
      question, options, is_featured, status
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/markets/:marketId/settle', isAdmin, async (req, res) => {
  try {
    const { winningOptionId } = req.body;
    const adminId = req.user ? req.user.id : null;
    const result = await bettingEngine.settleBet(req.params.marketId, winningOptionId, adminId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── GAME ACTIONS ─────────────────────────────────────────────

router.post('/games/:gameId/void', isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const adminId = req.user ? req.user.id : null;
    const result = await bettingEngine.voidGame(req.params.gameId, reason, adminId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── AUTO-GENERATION ───────────────────────────────────────────

router.post('/games/:gameId/auto-markets', isAdmin, async (req, res) => {
  try {
    const game = await dbGames.getGameById(req.params.gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const fixture = await footballApi.getFixtureById(game.fixture_id);
    const results = [];

    // 1. Over/Under 2.5 Goals
    const ouMarket = await dbMarkets.createMarket({
      game_id: game.id,
      market_type: 'over_under_goals',
      question: 'Total Goals Over/Under 2.5?',
      description: 'Will the total goals be over or under 2.5?',
      is_featured: false,
      options: [
        { id: 'over', label: 'Over 2.5', odds: 1.85 },
        { id: 'under', label: 'Under 2.5', odds: 1.95 }
      ]
    });
    results.push(ouMarket);

    // 2. Both Teams to Score
    const bttsMarket = await dbMarkets.createMarket({
      game_id: game.id,
      market_type: 'both_teams_score',
      question: 'Both Teams to Score?',
      description: 'Will both teams score at least one goal?',
      is_featured: false,
      options: [
        { id: 'yes', label: 'Yes', odds: 1.70 },
        { id: 'no', label: 'No', odds: 2.10 }
      ]
    });
    results.push(bttsMarket);

    // 3. Top Scorer (Dynamic from Squads)
    try {
      const homeSquad = await footballApi.getSquad(game.home_team_id || fixture.homeTeamId);
      const awaySquad = await footballApi.getSquad(game.away_team_id || fixture.awayTeamId);

      const scorers = [
        ...homeSquad.slice(0, 3).map(p => ({ id: `p_${p.id}`, label: p.name, odds: 5.0 + Math.random() * 10 })),
        ...awaySquad.slice(0, 3).map(p => ({ id: `p_${p.id}`, label: p.name, odds: 5.0 + Math.random() * 10 })),
        { id: 'no_scorer', label: 'No Scorer', odds: 25.0 }
      ];

      const scorerMarket = await dbMarkets.createMarket({
        game_id: game.id,
        market_type: 'top_scorer',
        question: 'Who will be the first scorer?',
        description: 'Predict the first player to score in the match.',
        is_featured: true,
        options: scorers
      });
      results.push(scorerMarket);
    } catch (e) {
      console.warn('Failed to generate squad-based markets', e.message);
    }

    res.json({ success: true, markets: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
