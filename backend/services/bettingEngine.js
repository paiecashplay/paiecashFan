// ═══════════════════════════════════════════════════════════════
// services/bettingEngine.js - Core betting logic
// ═══════════════════════════════════════════════════════════════

const supabase = require('../db/supabase');
const dbBets = require('../db/bets');
const dbMarkets = require('../db/bettingMarkets');
const dbGames = require('../db/bettingGames');
const dbConfigs = require('../db/leagueConfigs');
const circleService = require('../circleService');
const { calculatePotentialPayout } = require('./oddsEngine');

// Ensure these are configured in .env
const BETTING_WALLET_ID = process.env.BETTING_WALLET_ID || process.env.ADMIN_WALLET_ID;
const BETTING_WALLET_ADDRESS = process.env.BETTING_WALLET_ADDRESS || process.env.ADMIN_WALLET_ADDRESS;
const PREDICTION_REWARD_PCC = parseFloat(process.env.PREDICTION_REWARD_PCC) || 50;

async function placeBet(userId, marketId, optionId, mode, stakePCC = 0) {
  // GUARD 1: User check
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (userErr || !user) throw new Error('ERR_USER_NOT_FOUND');
  if (!user.is_active) throw new Error('ERR_USER_BLOCKED');

  // GUARD 2: Market & Game check
  const market = await dbMarkets.getMarketById(marketId);
  if (!market) throw new Error('ERR_MARKET_NOT_FOUND');
  if (market.status !== 'open') throw new Error('ERR_MARKET_CLOSED');

  const game = await dbGames.getGameById(market.game_id);
  if (!game) throw new Error('ERR_GAME_NOT_FOUND');
  if (game.status === 'live' || game.status === 'finished') throw new Error('ERR_GAME_STARTED');

  const now = new Date();
  if (new Date(game.betting_closes_at) < now || !game.betting_open) {
    throw new Error('ERR_BETTING_CLOSED');
  }

  // GUARD 3: Option is valid
  const option = market.options.find(o => o.id === optionId);
  if (!option) throw new Error('ERR_INVALID_OPTION');

  // GUARD 4: One bet per market
  const existingBet = await dbBets.getBetByUserAndMarket(userId, marketId);
  if (existingBet) {
    throw new Error('ERR_ALREADY_BET');
  }

  // GUARD 5: League is active
  const leagueConfig = await dbConfigs.getLeagueConfig(game.league_id);
  if (!leagueConfig || !leagueConfig.is_active) throw new Error('ERR_LEAGUE_INACTIVE');
  if (mode === 'stake' && !leagueConfig.betting_enabled) throw new Error('ERR_STAKING_DISABLED');
  if (mode === 'prediction' && !leagueConfig.prediction_enabled) throw new Error('ERR_PREDICTION_DISABLED');

  // GUARD 6 & 7: Stake validation & exposure
  let finalStake = 0;
  let potentialPayout = 0;
  let userWallet = null;

  if (mode === 'stake') {
    finalStake = parseFloat(stakePCC);
    if (finalStake < leagueConfig.min_stake_pcc) throw new Error('ERR_BELOW_MIN_STAKE');
    if (finalStake > leagueConfig.max_stake_pcc) throw new Error('ERR_ABOVE_MAX_STAKE');

    // Get user wallet
    const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
    if (!walletData) throw new Error('ERR_WALLET_NOT_FOUND');
    userWallet = walletData;

    // Check balance in DB first (optimistic), but ideally call circleService.getBalance
    if (walletData.balance < finalStake) throw new Error('ERR_INSUFFICIENT_BALANCE');

    potentialPayout = calculatePotentialPayout(finalStake, option.odds);
    if (potentialPayout > leagueConfig.max_payout_pcc) {
      potentialPayout = leagueConfig.max_payout_pcc;
      finalStake = parseFloat((potentialPayout / option.odds).toFixed(8));
      console.log(`[BETTING] Stake reduced to ${finalStake} to respect max payout.`);
    }
  } else {
    potentialPayout = PREDICTION_REWARD_PCC;
  }

  // EXECUTE
  let txId = null;
  if (mode === 'stake') {
    try {
      // Deduct stake from fan wallet via Circle API
      // Since it's from Fan to Platform, we use gasStationTransferPCC
      txId = await circleService.gasStationTransferPCC(userWallet.wallet_address, BETTING_WALLET_ADDRESS, finalStake);

      // Update local wallet balance
      await supabase.from('wallets').update({ balance: userWallet.balance - finalStake }).eq('id', userWallet.id);

      // Record transaction
      await supabase.from('betting_transactions').insert({
        user_id: userId,
        game_id: game.id,
        type: 'stake_deducted',
        pcc_amount: finalStake,
        circle_tx_id: txId,
        status: 'complete'
      });
    } catch (err) {
      console.error('[BETTING] Stake deduction failed:', err);
      throw new Error('ERR_STAKE_DEDUCTION_FAILED');
    }
  }

  // Create Bet
  const idempotencyKey = `bet_${userId}_${marketId}_${Date.now()}`;
  const bet = await dbBets.createBet({
    user_id: userId,
    game_id: game.id,
    market_id: market.id,
    option_id: optionId,
    option_label: option.label,
    odds_at_placement: option.odds,
    mode,
    stake_pcc: finalStake,
    potential_payout: potentialPayout,
    idempotency_key: idempotencyKey,
    status: 'pending'
  });

  // Update market & game totals
  if (mode === 'stake') {
    await dbMarkets.updateMarket(marketId, {
      total_staked_pcc: parseFloat(market.total_staked_pcc) + finalStake
    });
    await dbGames.updateGame(game.id, {
      total_bets: game.total_bets + 1,
      total_staked_pcc: parseFloat(game.total_staked_pcc) + finalStake
    });
  } else {
    await dbGames.updateGame(game.id, {
      total_bets: game.total_bets + 1
    });
  }

  return {
    betId: bet.id,
    mode,
    optionLabel: option.label,
    odds: option.odds,
    stakePCC: finalStake,
    potentialPayout,
    message: "Bet placed! Good luck. 🎯"
  };
}

async function settleBet(marketId, winningOptionId, adminId) {
  const market = await dbMarkets.getMarketById(marketId);
  if (!market) throw new Error('ERR_MARKET_NOT_FOUND');
  if (market.status === 'settled' || market.status === 'voided') throw new Error('ERR_MARKET_ALREADY_SETTLED');

  const game = await dbGames.getGameById(market.game_id);
  if (!game) throw new Error('ERR_GAME_NOT_FOUND');
  if (game.status !== 'finished' && game.status !== 'cancelled') throw new Error('ERR_GAME_NOT_FINISHED');

  const validOption = market.options.find(o => o.id === winningOptionId);
  if (!validOption) throw new Error('ERR_INVALID_WINNING_OPTION');

  // Verify Admin (assuming role check is done in route, but we log the adminId)

  // 1. Update Market
  await dbMarkets.updateMarket(marketId, {
    status: 'settled',
    winning_option_id: winningOptionId
  });

  // 2. Load pending bets
  const pendingBets = await dbBets.getPendingBetsByMarket(marketId);

  let totalPayout = 0;
  let platformRevenue = 0;
  let betsSettled = 0;

  // Process in batches
  for (const bet of pendingBets) {
    if (bet.option_id === winningOptionId) {
      // WON
      await supabase.from('bets').update({
        status: 'won',
        payout_pcc: bet.potential_payout,
        settled_at: new Date().toISOString()
      }).eq('id', bet.id);

      // Payout
      if (bet.potential_payout > 0) {
        try {
          const { data: userWallet } = await supabase.from('wallets').select('*').eq('user_id', bet.user_id).single();
          if (userWallet) {
            // Transfer from Platform to Fan
            const txId = await circleService.gasStationTransferPCC(BETTING_WALLET_ADDRESS, userWallet.wallet_address, bet.potential_payout);

            await supabase.from('wallets').update({ balance: userWallet.balance + bet.potential_payout }).eq('id', userWallet.id);

            await supabase.from('betting_transactions').insert({
              user_id: bet.user_id,
              bet_id: bet.id,
              game_id: game.id,
              type: bet.mode === 'stake' ? 'payout_sent' : 'prediction_reward',
              pcc_amount: bet.potential_payout,
              circle_tx_id: txId,
              status: 'complete'
            });
          }
        } catch (err) {
          console.error(`[BETTING] Payout failed for bet ${bet.id}:`, err);
        }
      }
      totalPayout += bet.potential_payout;
    } else {
      // LOST
      await supabase.from('bets').update({
        status: 'lost',
        payout_pcc: 0,
        settled_at: new Date().toISOString()
      }).eq('id', bet.id);

      if (bet.mode === 'stake') {
        const leagueConfig = await dbConfigs.getLeagueConfig(game.league_id);
        const houseEdge = (leagueConfig.house_edge_pct / 100);
        platformRevenue += (bet.stake_pcc * (1 - houseEdge)); // simplified calculation
      }
    }
    betsSettled++;
  }

  // Update market stats
  await dbMarkets.updateMarket(marketId, {
    total_payout_pcc: totalPayout
  });

  // Game update (could be cumulative if multiple markets)
  await dbGames.updateGame(game.id, {
    total_paid_pcc: parseFloat(game.total_paid_pcc || 0) + totalPayout,
    platform_revenue: parseFloat(game.platform_revenue || 0) + platformRevenue
  });

  return { betsSettled, totalPaidOut: totalPayout, platformRevenue };
}

async function voidGame(gameId, reason, adminId) {
  const game = await dbGames.getGameById(gameId);
  if (!game) throw new Error('ERR_GAME_NOT_FOUND');

  // Update Game
  await dbGames.updateGame(gameId, {
    status: 'cancelled',
    settled: true,
    settled_at: new Date().toISOString(),
    settled_by: adminId,
    settlement_notes: reason
  });

  // Void all markets
  const markets = await dbMarkets.getMarketsByGame(gameId);
  for (const m of markets) {
    await dbMarkets.updateMarket(m.id, { status: 'voided' });
  }

  // Refund all bets
  const { data: bets } = await supabase.from('bets').select('*').eq('game_id', gameId).eq('status', 'pending');

  let betsVoided = 0;
  let totalRefunded = 0;

  for (const bet of bets || []) {
    await supabase.from('bets').update({
      status: 'void',
      payout_pcc: bet.stake_pcc, // Refund exact stake
      settled_at: new Date().toISOString()
    }).eq('id', bet.id);

    if (bet.mode === 'stake' && bet.stake_pcc > 0) {
      try {
        const { data: userWallet } = await supabase.from('wallets').select('*').eq('user_id', bet.user_id).single();
        if (userWallet) {
          const txId = await circleService.gasStationTransferPCC(BETTING_WALLET_ADDRESS, userWallet.wallet_address, bet.stake_pcc);
          await supabase.from('wallets').update({ balance: userWallet.balance + bet.stake_pcc }).eq('id', userWallet.id);

          await supabase.from('betting_transactions').insert({
            user_id: bet.user_id,
            bet_id: bet.id,
            game_id: game.id,
            type: 'stake_refunded',
            pcc_amount: bet.stake_pcc,
            circle_tx_id: txId,
            status: 'complete'
          });
          totalRefunded += bet.stake_pcc;
        }
      } catch (err) {
        console.error(`[BETTING] Refund failed for bet ${bet.id}:`, err);
      }
    }
    betsVoided++;
  }

  return { betsVoided, totalRefunded };
}

module.exports = {
  placeBet,
  settleBet,
  voidGame
};
