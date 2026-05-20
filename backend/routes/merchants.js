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

// POST /api/merchants
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return error(res, 'Missing merchant name or email');

    // Check if user exists
    let user = await db.getUserByEmail(email);
    if (!user) {
      user = await db.createUser({
        name: `${name} Admin`,
        email,
        role: 'club_admin'
      });
    } else {
      if (user.role !== 'club_admin') {
        // Optionally update role to club_admin if needed, but for simplicity:
        await db.updateUser(user.id, { role: 'club_admin' });
      }
    }
    
    // Check if a club with this name already exists
    const existingTenants = await db.getAllTenants();
    const duplicate = existingTenants.find(t => t.club_name.trim().toLowerCase() === name.trim().toLowerCase());
    if (duplicate) {
      return error(res, `A club named "${name}" is already registered. If this is your club, use the Club Flow to sign in.`);
    }

    // We auto-create a Circle wallet for the merchant so they can receive funds
    const walletSetId = process.env.WALLET_SET_ID || await circle.createFanWalletSet();
    const circleWallet = await circle.createFanWallet(walletSetId);

    const merchantId = uuidv4();
    
    const merchant = await db.createMerchant({
      id: merchantId,
      name,
      admin_user_id: user.id,
      circleWalletId: circleWallet.id,
      walletAddress: circleWallet.address,
      createdAt: new Date().toISOString()
    });

    // Update the user to point to this tenant_id
    await db.updateUser(user.id, { tenant_id: merchant.id });

    return success(res, { merchant }, 201);
  } catch (err) {
    console.error('Merchant create error:', err);
    return error(res, 'Failed to create merchant: ' + err.message, 500);
  }
});

// GET /api/merchants
router.get('/', async (req, res) => {
  try {
    const merchants = await db.getAllMerchants();
    return success(res, { merchants });
  } catch (err) {
    return error(res, 'Failed to fetch merchants', 500);
  }
});

module.exports = router;
