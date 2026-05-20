// ═══════════════════════════════════════════════════════════════
// services/wallet-service.js - Wallet state aggregation
// ═══════════════════════════════════════════════════════════════

const db = require('../database');
const circle = require('../circleService');

async function getWalletState(userId) {
  const wallet = await db.getWalletByUserId(userId);
  if (!wallet) return null;

  // DB balance is always the source of truth
  let realBalance = wallet.pcc_balance || wallet.balance || 0;

  // Only sync with on-chain if NOT in simulation mode
  // In simulation mode, Circle always returns 0, which would incorrectly zero out the DB
  const isSimulation = (process.env.CIRCLE_API_KEY || '').startsWith('TEST_API_KEY');
  if (!isSimulation) {
    try {
      if (wallet.circleWalletId || wallet.circle_wallet_id) {
        const chainBalanceStr = await circle.getBalance(wallet.circleWalletId || wallet.circle_wallet_id);
        const chainBalance = parseFloat(chainBalanceStr);
        if (!isNaN(chainBalance) && chainBalance > realBalance) {
          realBalance = chainBalance;
          await db.updateBalance(userId, realBalance);
        }
      }
    } catch (err) {
      // Silently use DB balance if Circle is unreachable
    }
  }

  return {
    userId,
    walletAddress: wallet.walletAddress || wallet.wallet_address,
    circleWalletId: wallet.circleWalletId || wallet.circle_wallet_id,
    balance: realBalance,
    subBalances: {
      available: realBalance,
      locked: 0,
      pending: 0
    },
    network: process.env.BLOCKCHAIN || 'MATIC-AMOY',
    explorerUrl: `https://amoy.polygonscan.com/address/${wallet.walletAddress || wallet.wallet_address}`
  };
}

module.exports = { getWalletState };
