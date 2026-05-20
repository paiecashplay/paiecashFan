// ═══════════════════════════════════════════════════════════════
// db/wallets.js - Wallet CRUD operations via Supabase
// ═══════════════════════════════════════════════════════════════

const { v4: uuidv4 } = require('uuid');
const supabase = require('./supabase');

async function createWallet(data) {
  const { data: wallet, error } = await supabase
    .from('wallets')
    .insert({
      id: data.id || uuidv4(),
      user_id: data.userId || data.user_id,
      circle_wallet_id: data.circleWalletId || data.circle_wallet_id,
      circle_wallet_set_id: data.walletSetId || data.circle_wallet_set_id,
      wallet_address: data.walletAddress || data.wallet_address,
      blockchain_network: data.blockchain_network || 'MATIC-AMOY',
      wallet_type: data.wallet_type || 'fan',
      pcc_balance: 0,
      status: 'active'
    })
    .select()
    .single();

  if (error) throw new Error(`createWallet: ${error.message}`);
  return normalizeWallet(wallet);
}

// Normalize wallet row to backward-compatible shape
function normalizeWallet(w) {
  if (!w) return null;
  w.userId = w.user_id;
  w.circleWalletId = w.circle_wallet_id;
  w.walletAddress = w.wallet_address;
  w.walletSetId = w.circle_wallet_set_id;
  w.balance = parseFloat(w.pcc_balance) || 0;
  return w;
}

async function getWalletByUserId(userId) {
  const { data: wallet, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return normalizeWallet(wallet);
}

async function getWalletByCircleWalletId(circleWalletId) {
  const { data: wallet, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('circle_wallet_id', circleWalletId)
    .single();

  if (error) return null;
  return normalizeWallet(wallet);
}

async function getAllWallets() {
  const { data: wallets, error } = await supabase
    .from('wallets')
    .select('*');

  if (error) throw new Error(`getAllWallets: ${error.message}`);
  return wallets.map(normalizeWallet);
}

async function updateBalance(userId, newBalance) {
  const { error } = await supabase
    .from('wallets')
    .update({ pcc_balance: newBalance })
    .eq('user_id', userId);

  if (error) {
    console.error(`updateBalance failed for user ${userId}:`, error.message);
    throw new Error(`updateBalance: ${error.message}`);
  }
  return getWalletByUserId(userId);
}

async function getWalletByAddress(walletAddress) {
  const { data: wallet, error } = await supabase
    .from('wallets')
    .select('*')
    .ilike('wallet_address', walletAddress)
    .single();

  if (error) return null;
  return normalizeWallet(wallet);
}

async function getWalletCount() {
  const { count, error } = await supabase
    .from('wallets')
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(`getWalletCount: ${error.message}`);
  return count || 0;
}

module.exports = {
  createWallet,
  getWalletByUserId,
  getWalletByCircleWalletId,
  getWalletByAddress,
  getAllWallets,
  updateBalance,
  getWalletCount
};
