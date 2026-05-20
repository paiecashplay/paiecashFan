
// ═══════════════════════════════════════════════════════════
// server.js - Express API server for PaieCash.coin
// Port 3001
// ═══════════════════════════════════════════════════════════

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

// Internal Route Managers
const userRoutes = require('./routes/users');
const merchantRoutes = require('./routes/merchants');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');
const transakRoutes = require('./routes/transak');
const moonpayRoutes = require('./routes/moonpay');
const cashoutRoutes = require('./routes/cashouts');
const cryptoRoutes = require('./routes/crypto');

const webhooksRoutes = require('./routes/webhooks');
const miscRoutes = require('./routes/misc');

// LOTO Game Routes
const lotoRoutes = require('./routes/loto');

// Betting System Routes
const bettingRoutes = require('./routes/betting');
const adminBettingRoutes = require('./routes/admin-betting');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Raw Body Capture Middleware ────────────────────────────
// Captures raw body for webhook signature verification while
// still allowing express.json() to parse the body normally.
// Must be registered BEFORE express.json()
app.use('/api/crypto/webhooks', (req, res, next) => {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => {
    req.rawBody = data;
    try {
      req.body = JSON.parse(data);
    } catch (e) {
      req.body = {};
    }
    next();
  });
});

// ─── Webhooks ──────────────────────────────────────────────
app.use('/webhook', webhooksRoutes);

// ─── Middleware ────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://paiecashcoin.frostrek.com',
  'https://pcc-marketplace.frostrek.com',
  'https://marketplace.paiecashcoin.frostrek.com',
  'https://mint.paiecashcoin.frostrek.com',
];

const corsOptions = {
  origin: (origin, cb) => {
    // Allow all origins temporarily to prevent CORS blocking, or use a more permissive check
    cb(null, true);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // explicitly handle preflight
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────
app.use('/api/users', userRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transak', transakRoutes);
app.use('/api/moonpay', moonpayRoutes);
app.use('/api/cashouts', cashoutRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/betting', bettingRoutes);
app.use('/api/admin/betting', adminBettingRoutes);
app.use('/api/loto', lotoRoutes);
app.use('/api', miscRoutes);

const { authMiddleware } = require('./middlewares/auth');
const chatRoutes = require('./routes/chat');
app.use('/api/chat', authMiddleware, chatRoutes);

// Match Discussion Routes
const matchDiscussionRoutes = require('./routes/matchDiscussion');
app.use('/api/match-rooms', authMiddleware, matchDiscussionRoutes);

// Club Channels Routes
const clubChannelRoutes = require('./routes/clubChannels');
app.use('/api/club-channels', authMiddleware, clubChannelRoutes);

// Social Posts
const postsRoutes = require('./routes/posts');
app.use('/api/posts', authMiddleware, postsRoutes);

// ─── V2 Platform Routes ──────────────────────────────────────
const v2MintAuth = require('./routes/v2/mint/auth');
const v2MintWallet = require('./routes/v2/mint/wallet');
const v2MintTopup = require('./routes/v2/mint/topup');
const v2MintTransfer = require('./routes/v2/mint/transfer');
const v2MintWithdraw = require('./routes/v2/mint/withdraw');
const v2MintTreasury = require('./routes/v2/mint/treasury');
const v2MarketClubs = require('./routes/v2/marketplace/clubs');
const v2MarketProducts = require('./routes/v2/marketplace/products');
const v2MarketOrders = require('./routes/v2/marketplace/orders');
const v2GamingContests = require('./routes/v2/gaming/contests');
const v2GamingSessions = require('./routes/v2/gaming/sessions');
const v2BettingPools = require('./routes/v2/betting/pools');
const v2AdminGov = require('./routes/v2/admin/governance');

// Platform 1: Mint Engine + Wallet Super App
app.use('/api/v2/mint/auth', v2MintAuth);
app.use('/api/v2/mint/wallet', v2MintWallet);
app.use('/api/v2/mint/topup', v2MintTopup);
app.use('/api/v2/mint/transfer', v2MintTransfer);
app.use('/api/v2/mint/withdraw', v2MintWithdraw);
app.use('/api/v2/mint/treasury', v2MintTreasury);

// Platform 2: Marketplace + Gaming + Betting
app.use('/api/v2/marketplace/clubs', v2MarketClubs);
app.use('/api/v2/marketplace/products', v2MarketProducts);
app.use('/api/v2/marketplace/orders', v2MarketOrders);
app.use('/api/v2/gaming/contests', v2GamingContests);
app.use('/api/v2/gaming/sessions', v2GamingSessions);
app.use('/api/v2/betting/pools', v2BettingPools);

// Platform 3: Super Admin Governance
app.use('/api/v2/admin', v2AdminGov);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'running', network: process.env.BLOCKCHAIN }, error: '' });
});

// ─── Start Server ─────────────────────────────────────────

// ─── Socket.IO Setup for LOTO ─────────────────────────────
const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, cb) => cb(null, true),
    credentials: true
  }
});

// Initialize LOTO socket namespace
const { setupLotoSocket } = require('./services/loto.socket');
setupLotoSocket(io);

const server = httpServer.listen(PORT, () => {
  console.log(`\n  ⚡ PaieCash.coin Modular Backend API`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → Network: ${process.env.BLOCKCHAIN}`);
  console.log(`  → Webhook configured on /webhook/stripe`);
  console.log(`  → Crypto gateway routes on /api/crypto`);
  console.log(`  → LOTO game Socket.IO on /loto\n`);

  // Start the crypto mint retry cron job
  const cryptoMintRetry = require('./jobs/cryptoMintRetry');
  cryptoMintRetry.startCronJob();

  // Betting System Cron Jobs
  const cron = require('node-cron');
  const { autoSettleFinishedGames } = require('./services/settlementJob');
  const { updateLiveScores } = require('./services/liveScoreJob');

  // Every 30 seconds
  cron.schedule('*/30 * * * * *', () => {
    updateLiveScores();
  });

  // Every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    autoSettleFinishedGames();
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ⚠ Port ${PORT} is already in use. Attempting to free it...`);
    const { execSync } = require('child_process');
    try {
      // Find and kill the process using this port (Windows)
      const result = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
      const lines = result.trim().split('\n');
      const pids = [...new Set(lines.map(l => l.trim().split(/\s+/).pop()).filter(p => p && p !== '0'))];
      pids.forEach(pid => {
        try { execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' }); } catch { }
      });
      console.log(`  ✅ Freed port ${PORT}. Restarting in 1s...`);
      setTimeout(() => {
        httpServer.listen(PORT, () => {
          console.log(`\n  ⚡ PaieCash.coin Backend API (restarted on :${PORT})\n`);
          const cryptoMintRetry = require('./jobs/cryptoMintRetry');
          cryptoMintRetry.startCronJob();

          const cron = require('node-cron');
          const { autoSettleFinishedGames } = require('./services/settlementJob');
          const { updateLiveScores } = require('./services/liveScoreJob');
          cron.schedule('*/30 * * * * *', () => { updateLiveScores(); });
          cron.schedule('*/5 * * * *', () => { autoSettleFinishedGames(); });
        });
      }, 1000);
    } catch (e) {
      console.error(`  ❌ Could not free port ${PORT}. Kill it manually: taskkill /PID <pid> /F`);
      process.exit(1);
    }
  } else {
    throw err;
  }
});





module.exports = app;


