const crypto = require('crypto');

module.exports = function verifyTransakWebhook(req, res, next) {
  const signature = req.headers['x-webhook-signature'];

  if (!signature) {
    return res.status(401).json({ error: 'Missing webhook signature' });
  }

  const computed = crypto
    .createHmac('sha256', process.env.TRANSAK_API_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (computed !== signature) {
    console.error('[Transak Webhook] Invalid signature - possible spoofed request');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
};
