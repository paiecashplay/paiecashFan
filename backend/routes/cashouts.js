const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');

// Basic auth middleware (shared pattern)
function authMiddleware(req, res, next) {
  let userId = req.headers['x-user-id'] || req.query.userId || req.body.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = db.getUserById(userId);
  if (!user) return res.status(401).json({ error: 'User not found' });
  req.user = user;
  next();
}

router.get('/', authMiddleware, (req, res) => {
  try {
    const cashouts = db.getAllCashouts();
    res.json({ success: true, data: cashouts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/request', authMiddleware, (req, res) => {
  const { merchantId, pccAmount, fiatAmount, currency } = req.body;
  
  if (!merchantId || !pccAmount) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const cashout = db.createCashout({
      id: uuidv4(),
      merchantId,
      pccAmount,
      fiatAmount: fiatAmount || pccAmount, // Default 1:1 if not provided
      currency: currency || 'usd',
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    res.json({ success: true, data: cashout });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
