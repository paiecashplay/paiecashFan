
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
const v2MarketFederations = require('./routes/v2/marketplace/federations');
const v2MarketProducts = require('./routes/v2/marketplace/products');
const v2MarketOrders = require('./routes/v2/marketplace/orders');
const v2MarketCheckout = require('./routes/v2/marketplace/checkout');
const v2FanFeed = require('./routes/v2/marketplace/fan-feed');
const v2Tombola = require('./routes/v2/tombola');
const v2Bingo = require('./routes/v2/bingo');
const v2MarketSearch = require('./routes/v2/marketplace/search');
const v2Onboarding = require('./routes/v2/onboarding');
const v2Me = require('./routes/v2/me');
const v2AdminApplications = require('./routes/v2/admin/applications');
const v2GamingContests = require('./routes/v2/gaming/contests');
const v2GamingSessions = require('./routes/v2/gaming/sessions');
const v2BettingPools = require('./routes/v2/betting/pools');
const v2AdminGov      = require('./routes/v2/admin/governance');
const v2AdminCrudClubs = require('./routes/v2/admin/clubs-crud');
const v2AdminUsers    = require('./routes/v2/admin/users');
const v2AdminModeration = require('./routes/v2/admin/moderation');
const v2AdminPrizes   = require('./routes/v2/admin/prizes');
const v2AdminPlatform = require('./routes/v2/admin/platform');
const v2Live          = require('./routes/v2/live');
const v2ShopLive = require('./routes/v2/shop-live');

// Platform 1: Mint Engine + Wallet Super App
app.use('/api/v2/mint/auth', v2MintAuth);
app.use('/api/v2/mint/wallet', v2MintWallet);
app.use('/api/v2/mint/topup', v2MintTopup);
app.use('/api/v2/mint/transfer', v2MintTransfer);
app.use('/api/v2/mint/withdraw', v2MintWithdraw);
app.use('/api/v2/mint/treasury', v2MintTreasury);

// Platform 2: Marketplace + Gaming + Betting
app.use('/api/v2/marketplace/clubs', v2MarketClubs);
app.use('/api/v2/marketplace/federations', v2MarketFederations);
app.use('/api/v2/marketplace/products', v2MarketProducts);
app.use('/api/v2/marketplace/orders', v2MarketOrders);
app.use('/api/v2/checkout', v2MarketCheckout);
app.use('/api/v2/clubs', v2FanFeed);
app.use('/api/v2/tombola', v2Tombola);
app.use('/api/v2/bingo', v2Bingo);
app.use('/api/v2/live', v2Live);
app.use('/api/v2/shop-live', v2ShopLive);
app.use('/api/v2/marketplace/search', v2MarketSearch);
app.use('/api/v2/onboarding', v2Onboarding);
app.use('/api/v2/me', v2Me);
app.use('/api/v2/admin/applications', v2AdminApplications);
app.use('/api/v2/gaming/contests', v2GamingContests);
app.use('/api/v2/gaming/sessions', v2GamingSessions);
app.use('/api/v2/betting/pools', v2BettingPools);

// Platform 3: Super Admin Governance
// ⚠️ ORDRE IMPORTANT : governance est monté sur le chemin LARGE /api/v2/admin
// (avec un guard router-level super_admin). Les sous-routes qui doivent rester
// accessibles au club_admin (scopées à SON club) DOIVENT être montées AVANT,
// sinon le guard super_admin de governance les intercepte → 403 pour le club_admin.
app.use('/api/v2/admin/clubs-crud', v2AdminCrudClubs);   // club_admin (scope) + super_admin
app.use('/api/v2/admin/prizes', v2AdminPrizes);          // club_admin (son club) + super_admin
app.use('/api/v2/admin/platform', v2AdminPlatform);      // super_admin : produits plateforme + reversements
app.use('/api/v2/admin', v2AdminGov);
app.use('/api/v2/admin/users', v2AdminUsers);
app.use('/api/v2/admin/moderation', v2AdminModeration);

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

  // Tombola : tirage automatique des campagnes arrivées à échéance (toutes les 5 min)
  const { runTombolaDraws } = require('./jobs/tombolaDraw');
  cron.schedule('*/5 * * * *', () => { runTombolaDraws(); });

  // Gains : relance automatique des gagnants sans adresse (cadence gérée dans le job, exécuté chaque heure)
  const { runPrizeReminders } = require('./jobs/prizeReminders');
  cron.schedule('0 * * * *', () => { runPrizeReminders(); });

  // Sport Bingo : sync des statuts d'édition selon l'heure serveur (chaque minute)
  const { runBingoSync, runBingoAutoSettle } = require('./jobs/bingoSync');
  runBingoSync();
  cron.schedule('* * * * *', () => { runBingoSync(); });
  // Notation/clôture auto dès que tous les résultats sont saisis (toutes les 2 min)
  cron.schedule('*/2 * * * *', () => { runBingoAutoSettle(); });
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


