// ═══════════════════════════════════════════════════════════════
// routes/v2/mint/auth.js - Mint Platform Authentication
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const db = require('../../../database');
const circle = require('../../../circleService');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = '7d';

const ok = (res, data, s = 200) => res.status(s).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// POST /api/v2/mint/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, sport, team } = req.body;
    if (!name || !email) return fail(res, 'Name and email required');

    const existing = await db.getUserByEmail(email);
    if (existing) return fail(res, 'Email already registered');

    const userId = uuidv4();
    const prefs = { sport: sport || '', team: team || '' };
    const countryData = JSON.stringify(prefs);

    const user = await db.createUser({
      id: userId,
      name,
      email,
      country: countryData,
      createdAt: new Date().toISOString()
    });

    // Auto-provision Circle wallet
    const walletSetId = process.env.WALLET_SET_ID || await circle.createFanWalletSet();
    const circleWallet = await circle.createFanWallet(walletSetId);
    const wallet = await db.createWallet({
      id: uuidv4(), userId: user.id,
      circleWalletId: circleWallet.id,
      walletAddress: circleWallet.address,
      walletSetId, balance: 0,
      createdAt: new Date().toISOString()
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return ok(res, {
      user, wallet, token,
      network: process.env.BLOCKCHAIN,
      explorerUrl: `https://amoy.polygonscan.com/address/${wallet.walletAddress}`
    }, 201);
  } catch (err) {
    return fail(res, 'Registration failed: ' + err.message, 500);
  }
});

// POST /api/v2/mint/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return fail(res, 'Email required');

    const user = await db.getUserByEmail(email);
    if (!user) return fail(res, 'No account found with this email');

    const wallet = await db.getWalletByUserId(user.id);
    if (!wallet) return fail(res, 'Wallet not found');

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return ok(res, {
      user, wallet, token,
      network: process.env.BLOCKCHAIN,
      explorerUrl: `https://amoy.polygonscan.com/address/${wallet.walletAddress}`
    });
  } catch (err) {
    return fail(res, 'Login failed: ' + err.message, 500);
  }
});

// GET /api/v2/mint/auth/profile/:userId
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await db.getUserById(req.params.userId);
    if (!user) return fail(res, 'User not found', 404);
    const wallet = await db.getWalletByUserId(user.id);
    return ok(res, { user, wallet });
  } catch (err) {
    return fail(res, 'Profile fetch failed', 500);
  }
});

// PUT /api/v2/mint/auth/profile/:userId
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { sport, team } = req.body;

    const prefs = { sport: sport || '', team: team || '' };
    const countryData = JSON.stringify(prefs);

    const updated = await db.updateUser(userId, { country: countryData });
    ok(res, updated);
  } catch (err) {
    fail(res, err.message);
  }
});

module.exports = router;
