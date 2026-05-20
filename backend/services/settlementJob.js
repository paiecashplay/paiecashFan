// ═══════════════════════════════════════════════════════════════
// services/settlementJob.js - Cron: auto-settle finished games
// ═══════════════════════════════════════════════════════════════

const dbGames = require('../db/bettingGames');
const dbMarkets = require('../db/bettingMarkets');
const footballApi = require('./footballApi');
const bettingEngine = require('./bettingEngine');

async function autoSettleFinishedGames() {
  console.log('[CRON] Running auto-settlement check...');
  try {
    const games = await dbGames.getGamesByStatus(['scheduled', 'live']);

    for (const game of games) {
      // Check API for actual status
      const fixture = await footballApi.getFixtureById(game.fixture_id);
      if (!fixture) continue;

      if (fixture.status === 'FT') {
        // Game finished
        console.log(`[CRON] Game ${game.id} finished. Updating status and auto-settling markets...`);

        await dbGames.updateGame(game.id, {
          status: 'finished',
          home_score: fixture.homeScore,
          away_score: fixture.awayScore
        });

        // Auto-settle objective markets
        const markets = await dbMarkets.getMarketsByGame(game.id);
        for (const market of markets) {
          if (market.status !== 'locked' && market.status !== 'open') continue;

          let winningOptionId = null;

          if (market.market_type === 'match_winner') {
            if (fixture.homeScore > fixture.awayScore) winningOptionId = 'home';
            else if (fixture.awayScore > fixture.homeScore) winningOptionId = 'away';
            else winningOptionId = 'draw';
          }
          else if (market.market_type === 'both_teams_score') {
            winningOptionId = (fixture.homeScore > 0 && fixture.awayScore > 0) ? 'yes' : 'no';
          }
          else if (market.market_type === 'over_under_goals') {
            const totalGoals = fixture.homeScore + fixture.awayScore;
            // Assuming default over/under 2.5
            winningOptionId = totalGoals > 2.5 ? 'over' : 'under';
          }

          if (winningOptionId) {
            console.log(`[CRON] Auto-settling market ${market.id} (${market.market_type}) with ${winningOptionId}`);
            try {
              await bettingEngine.settleBet(market.id, winningOptionId, null); // null adminId for auto
            } catch (err) {
              console.error(`[CRON] Failed to auto-settle market ${market.id}:`, err.message);
            }
          } else {
            // Change status to locked so admin knows they need to settle it
            await dbMarkets.updateMarket(market.id, { status: 'locked' });
          }
        }
      }
      else if (fixture.status === 'CANC' || fixture.status === 'PST') {
        console.log(`[CRON] Game ${game.id} cancelled/postponed. Voiding...`);
        await bettingEngine.voidGame(game.id, `Match status: ${fixture.status}`, null);
      }
    }
  } catch (err) {
    console.error('[CRON] autoSettleFinishedGames failed:', err.message);
  }
}

module.exports = { autoSettleFinishedGames };
