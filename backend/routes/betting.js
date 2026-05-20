// ═══════════════════════════════════════════════════════════════
// routes/betting.js - Fan Betting Routes
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const dbConfigs = require('../db/leagueConfigs');
const dbGames = require('../db/bettingGames');
const dbMarkets = require('../db/bettingMarkets');
const dbBets = require('../db/bets');
const bettingEngine = require('../services/bettingEngine');

const { authMiddleware } = require('../middlewares/auth');

router.get('/leagues', async (req, res) => {
  try {
    const leagues = await dbConfigs.getActiveLeagueConfigs();
    res.json(leagues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/games', async (req, res) => {
  try {
    const { leagueId, status } = req.query;
    let games = [];
    if (leagueId) {
      games = await dbGames.getGamesByLeague(leagueId, status ? [status] : ['scheduled', 'live', 'finished']);
    } else if (status) {
      games = await dbGames.getGamesByStatus([status]);
    } else {
      games = await dbGames.getActiveGames();
    }

    // Filter active
    games = games.filter(g => g.is_active);

    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/games/:gameId', async (req, res) => {
  try {
    const game = await dbGames.getGameById(req.params.gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const markets = await dbMarkets.getMarketsByGame(game.id);

    let userBets = [];
    // if (req.user) {
    //   userBets = await supabase.from('bets').select('*').eq('game_id', game.id).eq('user_id', req.user.id);
    // }

    res.json({ game, markets, userBets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /games/:gameId/markets - returns just the markets array
router.get('/games/:gameId/markets', async (req, res) => {
  try {
    const markets = await dbMarkets.getMarketsByGame(req.params.gameId);
    res.json(markets || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/place', authMiddleware, async (req, res) => {
  try {
    const { marketId, optionId, mode, stakePCC } = req.body;
    const userId = req.user.userId || req.user.id;
    const result = await bettingEngine.placeBet(userId, marketId, optionId, mode, stakePCC || 0);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/bets/:betId', authMiddleware, async (req, res) => {
  try {
    const { optionId, stakePCC } = req.body;
    // Updating existing bet (only if game hasn't started)
    // For demo purposes, we can just throw not implemented or handle it properly.
    res.status(501).json({ error: 'Not Implemented' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/my-bets', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.userId || req.user.id;
    const bets = await dbBets.getBetsByUser(userId, status);
    res.json(bets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
