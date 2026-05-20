// ═══════════════════════════════════════════════════════════════
// database.js - Facade module (backward compatibility)
// Re-exports all DB functions from db/*.js Supabase modules
// so existing routes & services continue working unchanged.
// ═══════════════════════════════════════════════════════════════

const users = require('./db/users');
const wallets = require('./db/wallets');
const transactions = require('./db/transactions');
const tenants = require('./db/tenants');
const products = require('./db/products');
const orders = require('./db/orders');
const cashouts = require('./db/cashouts');
const notifications = require('./db/notifications');
const audit = require('./db/audit');
const otp = require('./db/otp');
const cryptoOrders = require('./db/cryptoOrders');

// ─── Legacy getAdminStats (async version) ──────────────────
async function getAdminStats() {
  const totalUsers = await users.getUserCount(); // all users, not just fans
  const totalWallets = await wallets.getWalletCount();
  const totalClubs = await tenants.getTenantCount();
  const txStats = await transactions.getTransactionStats();
  return {
    totalUsers,
    totalWallets,
    totalTransactions: txStats.totalCount,
    totalTenants: totalClubs,
    totalMinted: txStats.totalPCCMinted,
    totalSpent: txStats.totalPCCSpent
  };
}

// ─── Legacy getMerchantEarnings (maps to tenant) ───────────
async function getMerchantEarnings(tenantId) {
  const txs = await transactions.getTransactionsByTenant(tenantId);
  let total = 0;
  txs.forEach(tx => {
    if (tx.type === 'spend' && (tx.status === 'complete' || tx.status === 'success')) {
      total += parseFloat(tx.pcc_amount || 0);
    }
  });
  return total;
}

// ─── Legacy merchant functions (map to tenants) ────────────
async function createMerchant(data) {
  return tenants.createTenant({
    club_name: data.name,
    slug: data.name.toLowerCase().replace(/\s+/g, '-'),
    country: 'GLOBAL',
    admin_user_id: data.admin_user_id || null,
    treasury_wallet_id: data.circleWalletId,
    treasury_address: data.walletAddress
  });
}

async function getMerchantById(id) {
  const t = await tenants.getTenantById(id);
  if (!t) return null;
  return {
    ...t,
    name: t.club_name,
    walletAddress: t.treasury_address || '',
    circleWalletId: t.treasury_wallet_id || ''
  };
}

async function getAllMerchants() {
  // FIX: Include ALL tenants (active, pending, approved) so clubs show up
  // immediately after registration, not only after admin approval.
  const tenantsList = await tenants.getAllTenants();
  return tenantsList.map(t => ({
    ...t,
    name: t.club_name,
    walletAddress: t.treasury_address || ''
  }));
}

// ─── Legacy cashout functions ──────────────────────────────
async function createCashoutLegacy(data) {
  return cashouts.createCashout({
    tenant_id: data.merchantId,
    requested_by: data.merchantId,
    pcc_amount: data.pccAmount,
    fiat_amount: data.fiatAmount,
    fee_amount: 0,
    net_fiat_amount: data.fiatAmount,
    exchange_rate_used: 100,
    fiat_currency: data.currency || 'EUR'
  });
}

async function getCashoutsByMerchant(merchantId) {
  return cashouts.getCashoutsByTenant(merchantId);
}

async function getAllCashoutsLegacy() {
  return cashouts.getAllCashouts();
}

async function updateCashoutStatusLegacy(id, status) {
  return cashouts.updateCashoutStatus(id, status);
}

// ─── Crypto Session Stubs ──────────────────────────────────
// These are used by routes/transactions.js for the crypto
// deposit session flow. They use an in-memory store since
// sessions are short-lived (5 min max). In production you'd
// use a real table or Redis.
const _sessions = new Map();

async function createCryptoSession(data) {
  _sessions.set(data.id, {
    id: data.id,
    userId: data.userId,
    pccAmount: data.pccAmount,
    cryptoCurrency: data.cryptoCurrency,
    cryptoAmount: data.cryptoAmount,
    depositAddress: data.depositAddress,
    expiresAt: data.expiresAt,
    status: 'OPEN',
    createdAt: new Date().toISOString()
  });
  return _sessions.get(data.id);
}

async function getActiveSession(userId) {
  for (const [, session] of _sessions) {
    if (session.userId === userId && session.status === 'OPEN') {
      const now = Math.floor(Date.now() / 1000);
      if (session.expiresAt > now) return session;
    }
  }
  return null;
}

async function getSessionById(sessionId) {
  return _sessions.get(sessionId) || null;
}

async function updateSessionStatus(sessionId, status) {
  const session = _sessions.get(sessionId);
  if (session) {
    session.status = status;
    _sessions.set(sessionId, session);
  }
}

module.exports = {
  // Users
  createUser: users.createUser,
  getUserById: users.getUserById,
  getUserByEmail: users.getUserByEmail,
  getAllUsers: users.getAllUsers,
  updateUser: users.updateUser,
  // Wallets
  createWallet: wallets.createWallet,
  getWalletByUserId: wallets.getWalletByUserId,
  getWalletByCircleWalletId: wallets.getWalletByCircleWalletId,
  getWalletByAddress: wallets.getWalletByAddress,
  getAllWallets: wallets.getAllWallets,
  updateBalance: wallets.updateBalance,
  // Transactions
  createTransaction: transactions.createTransaction,
  getUserTransactions: transactions.getUserTransactions,
  getTransactionById: transactions.getTransactionById,
  updateTransactionStatus: transactions.updateTransactionStatus,
  getAllTransactions: transactions.getAllTransactions,
  getTransactionsByTenant: transactions.getTransactionsByTenant,
  // Tenants (spread first, then override specific keys)
  ...tenants,
  // Products
  ...products,
  // Orders
  ...orders,
  // Notifications
  ...notifications,
  // Audit
  ...audit,
  // OTP
  ...otp,
  // Crypto Orders
  ...cryptoOrders,
  // Cashouts - spread LAST so legacy wrappers can override below
  ...cashouts,
  // Legacy compat (these MUST come after spreads to override)
  getAdminStats,
  getMerchantEarnings,
  createMerchant,
  getMerchantById,
  getAllMerchants,
  createCashout: createCashoutLegacy,
  getCashoutsByMerchant,
  getAllCashouts: getAllCashoutsLegacy,
  updateCashoutStatus: updateCashoutStatusLegacy,
  // Crypto Sessions (in-memory)
  createCryptoSession,
  getActiveSession,
  getSessionById,
  updateSessionStatus
};
