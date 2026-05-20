// ═══════════════════════════════════════════════════════════════
// services/liveScoreJob.js - Cron: update live scores
// ═══════════════════════════════════════════════════════════════

const dbGames = require('../db/bettingGames');
const dbMarkets = require('../db/bettingMarkets');
const footballApi = require('./footballApi');

async function updateLiveScores() {
  try {
    const games = await dbGames.getGamesByStatus(['scheduled', 'live']);

    for (const game of games) {
      // If a scheduled game has passed its kickoff, lock its markets
      const now = new Date();
      if (game.status === 'scheduled' && new Date(game.kickoff_at) <= now) {
        await dbGames.updateGame(game.id, { status: 'live', betting_open: false });

        // Lock markets
        const markets = await dbMarkets.getMarketsByGame(game.id);
        for (const m of markets) {
          if (m.status === 'open') {
            await dbMarkets.updateMarket(m.id, { status: 'locked' });
          }
        }
      }

      // If game is live or should be live, fetch score
      if (game.status === 'live' || (game.status === 'scheduled' && new Date(game.kickoff_at) <= now)) {
        const fixture = await footballApi.getFixtureById(game.fixture_id);
        if (fixture) {
          await dbGames.updateGame(game.id, {
            home_score: fixture.homeScore,
            away_score: fixture.awayScore,
            minute: fixture.minute,
            status: fixture.status === 'FT' ? 'finished' : (fixture.status === 'LIVE' ? 'live' : game.status)
          });
        }
      }
    }
  } catch (err) {
    console.error('[CRON] updateLiveScores failed:', err.message);
  }
}

module.exports = { updateLiveScores };
