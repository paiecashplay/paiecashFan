// ═══════════════════════════════════════════════════════════════
// services/treasury-service.js - Treasury state & activity logs
// ═══════════════════════════════════════════════════════════════

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getTreasurySummary() {
  // Try to fetch from system_stats table first
  const { data: stats } = await supabase
    .from('system_stats')
    .select('*')
    .eq('id', 'treasury')
    .single();

  if (stats && stats.data) {
    return {
      reserves: stats.data.reserves || {
        total_pcc_minted: 0,
        total_pcc_burned: 0,
        total_pcc_circulating: 0
      },
      recentActivity: [],
      treasuryAddress: process.env.TREASURY_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000'
    };
  }

  // Fallback: compute from transactions
  const { data: txs } = await supabase
    .from('transactions')
    .select('type, pcc_amount, internal_status');

  let totalMinted = 0, totalBurned = 0;
  (txs || []).forEach(tx => {
    const amt = parseFloat(tx.pcc_amount || tx.amount || 0);
    if ((tx.type === 'mint' || tx.type === 'mint_crypto') && (tx.internal_status === 'success' || tx.internal_status === 'complete')) {
      totalMinted += amt;
    }
    if (tx.type === 'burn' && (tx.internal_status === 'success' || tx.internal_status === 'complete')) {
      totalBurned += amt;
    }
  });

  return {
    reserves: {
      total_pcc_minted: totalMinted,
      total_pcc_burned: totalBurned,
      total_pcc_circulating: totalMinted - totalBurned
    },
    recentActivity: [],
    treasuryAddress: process.env.TREASURY_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000'
  };
}

async function getTreasuryLogs(limit = 20) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .in('type', ['mint', 'mint_crypto', 'burn', 'withdraw'])
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

module.exports = { getTreasurySummary, getTreasuryLogs };
