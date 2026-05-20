const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const circle = require('../circleService');

const router = express.Router();

function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data, error: '' });
}

function error(res, message, status = 400) {
  return res.status(status).json({ success: false, data: null, error: message });
}

// POST /api/users
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return error(res, 'Missing name or email');
    
    if (await db.getUserByEmail(email)) return error(res, 'Email already exists');

    const userId = uuidv4();
    
    // Create User
    const user = await db.createUser({
      id: userId,
      name,
      email,
      createdAt: new Date().toISOString()
    });

    // Create Wallet Set if not exists
    const walletSetId = process.env.WALLET_SET_ID || await circle.createFanWalletSet();
    
    // Auto-create Circle Wallet
    const circleWallet = await circle.createFanWallet(walletSetId);
    
    // Store Wallet in DB
    const wallet = await db.createWallet({
      id: uuidv4(),
      userId: user.id,
      circleWalletId: circleWallet.id,
      walletAddress: circleWallet.address,
      walletSetId: walletSetId,
      balance: 0,
      createdAt: new Date().toISOString()
    });

    return success(res, {
      user,
      wallet,
      network: process.env.BLOCKCHAIN,
      explorerUrl: 'https://amoy.polygonscan.com/address/' + wallet.walletAddress
    }, 201);
  } catch (err) {
    console.error('User creation error:', err);
    return error(res, 'Failed to create user: ' + err.message, 500);
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return error(res, 'Missing email');

    const user = await db.getUserByEmail(email);
    if (!user) return error(res, 'User not found with this email');

    if (user.role === 'club_admin') {
      // Auto-heal: if tenant_id is missing, look it up from the tenants table
      if (!user.tenant_id) {
        try {
          const allTenants = await db.getAllTenants();
          const myTenant = allTenants.find(t => t.admin_user_id === user.id);
          if (myTenant) {
            await db.updateUser(user.id, { tenant_id: myTenant.id });
            user.tenant_id = myTenant.id;
            user.name = user.full_name; // preserve backward compat
          }
        } catch (healErr) {
          console.error('Auto-heal tenant_id failed:', healErr);
        }
      }

      return success(res, {
        user,
        wallet: null, // Club admins use the merchant's treasury wallet, not a personal user wallet
        network: process.env.BLOCKCHAIN,
        explorerUrl: null
      });
    }

    const wallet = await db.getWalletByUserId(user.id);
    if (!wallet) return error(res, 'Wallet not found for this user');

    return success(res, {
      user,
      wallet,
      network: process.env.BLOCKCHAIN,
      explorerUrl: 'https://amoy.polygonscan.com/address/' + wallet.walletAddress
    });
  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'Failed to login: ' + err.message, 500);
  }
});

// GET /api/balance/:userId
router.get('/balance/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await db.getUserById(userId);
    if (!user) return error(res, 'User not found', 404);

    const wallet = await db.getWalletByUserId(userId);
    if (!wallet) return error(res, 'Wallet not found', 404);

    // DB is always the source of truth
    let realBalance = wallet.pcc_balance || wallet.balance || 0;

    // Only sync with Circle in production mode (not simulation)
    const isSimulation = (process.env.CIRCLE_API_KEY || '').startsWith('TEST_API_KEY');
    if (!isSimulation) {
      try {
        const chainBalanceStr = await circle.getBalance(wallet.circleWalletId);
        const chainBalance = parseFloat(chainBalanceStr);
        if (!isNaN(chainBalance) && chainBalance > realBalance) {
          realBalance = chainBalance;
          await db.updateBalance(userId, realBalance);
        }
      } catch (err) {
        console.error("Circle balance fetch error:", err.message);
      }
    }

    return success(res, { balance: realBalance });
  } catch (err) {
    return error(res, 'Failed to fetch balance: ' + err.message, 500);
  }
});

module.exports = router;
