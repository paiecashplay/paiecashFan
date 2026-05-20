const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const rateConfig = require('../rateConfig');

const router = express.Router();

function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data, error: '' });
}

function error(res, message, status = 400) {
  return res.status(status).json({ success: false, data: null, error: message });
}

// GET /api/admin/stats - Overview stats for admin dashboard
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    return success(res, stats);
  } catch (err) {
    return error(res, 'Failed to get admin stats: ' + err.message, 500);
  }
});

// GET /api/admin/transactions - All platform transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await db.getAllTransactions();
    return success(res, { transactions });
  } catch (err) {
    return error(res, 'Failed to get transactions: ' + err.message, 500);
  }
});

// GET /api/admin/users - All registered users with wallet balances
router.get('/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    const wallets = await db.getAllWallets();

    const enriched = users.map(u => {
      const wallet = wallets.find(w => w.userId === u.id);
      return {
        ...u,
        walletAddress: wallet ? wallet.walletAddress : null,
        balance: wallet ? wallet.balance : 0
      };
    });

    return success(res, { users: enriched });
  } catch (err) {
    return error(res, 'Failed to get users: ' + err.message, 500);
  }
});

// GET /api/admin/merchants - All merchants with their earnings
router.get('/merchants', async (req, res) => {
  try {
    const merchants = await db.getAllMerchants();
    const enriched = await Promise.all(merchants.map(async m => ({
      ...m,
      totalEarned: await db.getMerchantEarnings(m.id)
    })));
    return success(res, { merchants: enriched });
  } catch (err) {
    return error(res, 'Failed to get merchants: ' + err.message, 500);
  }
});

// POST /api/admin/cashout - Club requests cash-out of their PCC
router.post('/cashout', async (req, res) => {
  try {
    const { merchantId, pccAmount } = req.body;
    if (!merchantId || !pccAmount || pccAmount <= 0) {
      return error(res, 'Missing merchantId or pccAmount');
    }

    const merchant = await db.getMerchantById(merchantId);
    if (!merchant) return error(res, 'Merchant not found', 404);

    // Calculate the fiat equivalent at current USD rate
    const totalEarned = await db.getMerchantEarnings(merchantId);
    if (pccAmount > totalEarned) {
      return error(res, `Cannot cash out ${pccAmount} PCC. Merchant has only earned ${totalEarned} PCC.`);
    }

    const pricing = rateConfig.calculatePrice('usd', pccAmount);
    const fiatAmount = pricing.fiatSubtotal; // Use subtotal (no fee for cashout)

    const cashout = await db.createCashout({
      id: uuidv4(),
      merchantId,
      pccAmount,
      fiatAmount: Math.round(fiatAmount * 100) / 100,
      currency: 'usd',
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    return success(res, { cashout, message: `Cashout of ${pccAmount} PCC ($${fiatAmount.toFixed(2)}) created.` }, 201);
  } catch (err) {
    return error(res, 'Cashout failed: ' + err.message, 500);
  }
});

// GET /api/admin/cashouts - All cashout requests
router.get('/cashouts', async (req, res) => {
  try {
    const cashouts = await db.getAllCashouts();
    return success(res, { cashouts });
  } catch (err) {
    return error(res, 'Failed to get cashouts: ' + err.message, 500);
  }
});

// POST /api/admin/cashouts/:id/approve - Admin approves a cashout
router.post('/cashouts/:id/approve', async (req, res) => {
  try {
    await db.updateCashoutStatus(req.params.id, 'approved');
    return success(res, { message: 'Cashout approved. Funds will be transferred.' });
  } catch (err) {
    return error(res, 'Failed to approve cashout: ' + err.message, 500);
  }
});

module.exports = router;
