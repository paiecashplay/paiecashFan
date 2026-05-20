const crypto = require('crypto');

module.exports = function verifyMoonpayWebhook(req, res, next) {
  try {
    const signature = req.headers['moonpay-signature-v2'];

    if (!signature) {
      console.error('[MoonPay Webhook] Missing signature header');
      return res.status(401).json({ error: 'Missing webhook signature' });
    }

    // MoonPay signature format: "t=timestamp,s=hash"
    const parts = signature.split(',');
    if (parts.length < 2) {
      console.error('[MoonPay Webhook] Invalid signature format');
      return res.status(401).json({ error: 'Invalid signature format' });
    }

    const timestampPart = parts.find(p => p.startsWith('t='));
    const signaturePart = parts.find(p => p.startsWith('s='));

    if (!timestampPart || !signaturePart) {
      console.error('[MoonPay Webhook] Missing timestamp or signature in header');
      return res.status(401).json({ error: 'Invalid signature header' });
    }

    const timestamp = timestampPart.split('=')[1];
    const receivedHash = signaturePart.split('=')[1];

    // Replay attack protection - reject if older than 5 minutes
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
      console.error('[MoonPay Webhook] Timestamp too old - possible replay attack');
      return res.status(401).json({ error: 'Webhook timestamp expired' });
    }

    // Compute expected signature
    // Payload for V2 is: timestamp + "." + JSON.stringify(body)
    const payload = timestamp + '.' + JSON.stringify(req.body);
    const expectedHash = crypto
      .createHmac('sha256', process.env.MOONPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    if (expectedHash !== receivedHash) {
      console.error('[MoonPay Webhook] Invalid signature');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    next();

  } catch (error) {
    console.error('[MoonPay Webhook] Signature verification error:', error);
    return res.status(500).json({ error: 'Webhook verification failed' });
  }
};
