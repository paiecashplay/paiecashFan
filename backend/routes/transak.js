const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { deliverPCC } = require('../services/pccDelivery');
const verifyTransakWebhook = require('../middlewares/transakWebhook');
const db = require('../database');

// Fake auth middleware since the project doesn't have a standardized JWT one yet.
function authMiddleware(req, res, next) {
  let userId;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    userId = req.headers.authorization.split(' ')[1];
  } else {
    userId = req.headers['x-user-id'] || req.query.userId || req.body.userId;
  }
  
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = db.getUserById(userId);
  if (!user) return res.status(401).json({ error: 'User not found' });
  
  req.user = user;
  next();
}

router.get('/config', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const wallet = db.getWalletByUserId(user.id);
    
    if (!wallet || !wallet.walletAddress) {
      return res.status(400).json({ 
        error: 'Wallet address not found for this user' 
      });
    }

    const partnerOrderId = uuidv4();

    db.createTransakOrder({
      id: uuidv4(),
      userId: user.id,
      userWalletAddress: wallet.walletAddress,
      partnerOrderId: partnerOrderId,
      transakOrderId: null,
      status: 'INITIATED',
      cryptoCurrency: null,
      cryptoAmount: 0,
      eurcEquivalent: 0,
      pccAmountMinted: 0,
      txHash: null,
      transakFeeAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.json({
      apiKey: process.env.TRANSAK_API_KEY,
      environment: process.env.TRANSAK_ENVIRONMENT,
      partnerOrderId: partnerOrderId,
      partnerCustomerId: user.id.toString(),
      walletAddress: wallet.walletAddress,
      themeColor: '0066FF',
      cryptoCurrencyList: 'ETH,BTC,USDC,EURC',
      defaultCryptoCurrency: 'EURC',
      network: 'polygon',
      defaultPaymentMethod: 'crypto_wallet'
    });

  } catch (error) {
    console.error('[Transak Config] Error:', error);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

router.post(
  '/webhook',
  express.json(),
  verifyTransakWebhook,
  async (req, res) => {
    res.status(200).json({ received: true });

    const { eventID, webhookData } = req.body;
    console.log(`[Transak Webhook] Event: ${eventID}`, webhookData);

    try {
      const {
        partnerOrderId,
        id: transakOrderId,
        status,
        cryptoCurrency,
        cryptoAmount,
        walletAddress,
        fiatAmount,
        fiatCurrency,
        totalFeeInFiat
      } = webhookData;

      const order = db.getTransakOrderByPartnerId(partnerOrderId);

      if (!order) {
        console.error(`[Webhook] Order not found: ${partnerOrderId}`);
        return;
      }

      let updates = { updatedAt: new Date().toISOString() };

      if (!order.transakOrderId) {
        updates.transakOrderId = transakOrderId;
        updates.cryptoCurrency = cryptoCurrency;
        updates.cryptoAmount = cryptoAmount;
        updates.transakFeeAmount = totalFeeInFiat;
      }

      if (status === 'COMPLETED') {
        if (order.status === 'COMPLETED') {
          console.warn(`[Webhook] Order already completed: ${partnerOrderId}`);
          return;
        }

        let pccToMint;
        if (cryptoCurrency === 'EURC') {
          pccToMint = parseFloat(cryptoAmount);
        } else {
          pccToMint = parseFloat(fiatAmount);
        }

        updates.eurcEquivalent = pccToMint;
        updates.status = 'PENDING';
        db.updateTransakOrder(partnerOrderId, updates);

        try {
          const delivery = await deliverPCC(order.userWalletAddress, pccToMint);

          db.updateTransakOrder(partnerOrderId, {
            status: 'COMPLETED',
            pccAmountMinted: delivery.pccMinted,
            txHash: delivery.txHash,
            updatedAt: new Date().toISOString()
          });

          // Update user's balance locally
          const wallet = db.getWalletByUserId(order.userId);
          if (wallet) {
            db.updateBalance(order.userId, wallet.balance + pccToMint);
          }

          console.log(`[PCC] Minted ${pccToMint} PCC to ${order.userWalletAddress}`);
        } catch (err) {
          console.error('[PCC Delivery] Error:', err);
          db.updateTransakOrder(partnerOrderId, {
            status: 'DELIVERY_FAILED',
            updatedAt: new Date().toISOString()
          });
        }

      } else if (status === 'FAILED' || status === 'REFUNDED') {
        updates.status = status;
        db.updateTransakOrder(partnerOrderId, updates);
        console.log(`[Webhook] Order ${status}: ${partnerOrderId}`);

      } else {
        updates.status = 'PENDING';
        db.updateTransakOrder(partnerOrderId, updates);
      }

    } catch (error) {
      console.error('[Webhook] Processing error:', error);
    }
  }
);

router.get('/order/:partnerOrderId', authMiddleware, async (req, res) => {
  try {
    const order = db.getTransakOrderByPartnerId(req.params.partnerOrderId);

    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      partnerOrderId: order.partnerOrderId,
      status: order.status,
      cryptoCurrency: order.cryptoCurrency,
      cryptoAmount: order.cryptoAmount,
      pccMinted: order.pccAmountMinted,
      txHash: order.txHash,
      createdAt: order.createdAt
    });

  } catch (error) {
    console.error('[Order Status] Error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;
