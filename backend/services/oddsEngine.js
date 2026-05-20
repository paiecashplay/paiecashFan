// ═══════════════════════════════════════════════════════════════
// services/oddsEngine.js - Calculate odds, payouts, exposure
// ═══════════════════════════════════════════════════════════════

/**
 * Validates that all options have odds > 1.0 and there are at least 2 options.
 */
function validateMarketOptions(options) {
  if (!Array.isArray(options) || options.length < 2) {
    return { valid: false, error: 'Market must have at least 2 options' };
  }

  for (const opt of options) {
    if (!opt.id || !opt.label) {
      return { valid: false, error: 'All options must have an id and a label' };
    }
    if (typeof opt.odds !== 'number' || opt.odds <= 1.0) {
      return { valid: false, error: `Invalid odds for option ${opt.label}. Odds must be > 1.0` };
    }
  }

  return { valid: true };
}

/**
 * Calculates the potential payout for a stake.
 */
function calculatePotentialPayout(stakePCC, odds) {
  return parseFloat((stakePCC * odds).toFixed(8));
}

/**
 * Calculates exposure for a specific game and market based on pending bets.
 */
function calculateExposure(bets, bettingWalletBalance) {
  let totalLiability = 0;
  let totalStaked = 0;

  for (const bet of bets) {
    if (bet.status === 'pending' && bet.mode === 'stake') {
      totalLiability += bet.potential_payout;
      totalStaked += bet.stake_pcc;
    } else if (bet.status === 'pending' && bet.mode === 'prediction') {
      totalLiability += bet.potential_payout;
    }
  }

  const exposureRatio = bettingWalletBalance > 0 ? (totalLiability / bettingWalletBalance) : 100;

  let status = 'safe';
  if (exposureRatio > 0.95) status = 'critical';
  else if (exposureRatio > 0.80) status = 'warning';

  return {
    totalLiability,
    totalStaked,
    bettingWalletBalance,
    exposureRatio,
    status
  };
}

module.exports = {
  validateMarketOptions,
  calculatePotentialPayout,
  calculateExposure
};
