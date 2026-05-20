const express = require('express');
const router = express.Router();
const rateConfig = require('../rateConfig');

// ─── Rates API ────────────────────────────────────────────

router.get('/rates', async (req, res) => {
  try {
    const { currency, pccAmount } = req.query;
    
    // If specific currency & pccAmount provided, return the calculated price
    if (currency && pccAmount) {
      const result = await rateConfig.calculatePrice(currency, parseFloat(pccAmount));
      return res.json({ success: true, data: result, error: '' });
    }
    
    // Otherwise return all supported currencies with live rates
    const tiers = await rateConfig.getAllTiers();
    return res.json({
      success: true,
      data: {
        tiers,
        feeRate: rateConfig.FEE_RATE,
        conversionModel: 'Fiat → EURC (live FX) → PCC (1:1)'
      },
      error: ''
    });
  } catch (err) {
    console.error('Error fetching rates:', err);
    return res.status(500).json({ success: false, data: null, error: 'Failed to fetch exchange rates' });
  }
});

// ─── Treasury API (For Crypto Checkout) ───────────────────

router.get('/treasury', (req, res) => {
  return res.json({
    success: true,
    data: {
      address: process.env.TREASURY_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000'
    },
    error: ''
  });
});

// ─── Chat Proxy API (For CORS) ────────────────────────────

router.post('/chat', async (req, res) => {
  try {
    const response = await fetch("https://campaigns-river-restore-flights.trycloudflare.com/chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": req.headers['x-api-key'] || "frosty_ba04134b_MWREFeLPF74DYdfTX8m5jmUEA1GEiNZO"
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      return res.status(response.status).send(await response.text());
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Node 18+ native fetch ReadableStream
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          break;
        }
        res.write(value);
      }
    } else {
      res.end();
    }
  } catch (err) {
    console.error('Chat proxy error:', err);
    res.status(500).json({ error: 'Failed to connect to chat service' });
  }
});

module.exports = router;
