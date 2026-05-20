const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const circle = require('../circleService');
const stripeService = require('../stripeService');
const rateConfig = require('../rateConfig');

// ─── Stripe Webhook ───────────────────────────
//
// Decision Model: Fiat → EURC → PCC
//
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripeService.verifyWebhookSignature(req.body, sig);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Support both userId and legacy fanId in metadata
    const userId = session.metadata.userId || session.metadata.fanId;
    const { pccAmount, fiatAmount, currency } = session.metadata;

    try {
      const user = await db.getUserById(userId);
      if (!user) throw new Error("User not found for webhook session.");
      const wallet = await db.getWalletByUserId(userId);

      const fiatPaid = parseFloat(fiatAmount) || 0;
      const fiatCcy = (currency || 'eur').toUpperCase();
      if (fiatPaid <= 0) throw new Error("Invalid fiat amount in session metadata.");

      // ── Real-time Fiat → EURC conversion ──────────────────
      // Convert the fiat amount to EUR equivalent using live FX rates
      const eurcAmount = await rateConfig.convertToEURC(currency, fiatPaid);
      const pccToMint = Math.floor(eurcAmount * 100) / 100; // EURC → PCC at 1:1, round to 2 decimals
      if (pccToMint <= 0) throw new Error("Converted PCC amount is zero or negative.");

      console.log(`\n══════════════════════════════════════════════`);
      console.log(`  DECISION MODEL: Fiat → EURC → PCC`);
      console.log(`  User   : ${user.name} (${userId})`);
      console.log(`  Wallet : ${wallet.walletAddress}`);
      console.log(`  Step 1 : Fiat received - ${fiatPaid} ${fiatCcy} confirmed by Stripe`);

      // ── Step 2: Fiat → EURC ──────────────────────────────
      console.log(`  Step 2 : Converting ${fiatPaid} ${fiatCcy} → ${eurcAmount} EURC …`);
      const eurcTxId = await circle.mintEURC(wallet.walletAddress, eurcAmount);
      console.log(`  Step 2 : EURC conversion initiated (txId: ${eurcTxId})`);

      // Manual idempotency check
      const existingTxs = await db.getUserTransactions(userId);
      const tx = existingTxs.find(t =>
        t.idempotency_key === session.id ||
        (t.metadata && t.metadata.session === session.id) ||
        (t.metadata && t.metadata.stripe_session === session.id)
      );

      let txId = tx ? tx.id : uuidv4();
      let effectivePccAmount = pccToMint;

      if (tx) {
        if (tx.pcc_amount || tx.amount) {
          effectivePccAmount = tx.pcc_amount || tx.amount;
          console.log(`[WEBHOOK] Using existing transaction amount: ${effectivePccAmount} PCC (Prevents fee inflation)`);
        }

        if (tx.status === 'complete' || tx.status === 'success' || tx.status === 'processing') {
          console.log(`[WEBHOOK] Session ${session.id} already being processed or completed. Status: ${tx.status}`);
          return res.json({ received: true });
        }
        try {
          await db.updateTransactionStatus(txId, 'processing');
        } catch (e) { }
      } else {
        await db.createTransaction({
          id: txId,
          userId,
          type: 'mint',
          amount: pccToMint,
          status: 'complete',
          idempotency_key: session.id,
          metadata: { fiatAmount, currency, eurcAmount, session: session.id },
          createdAt: new Date().toISOString()
        });
      }

      let circleTxId;
      try {
        // ── Step 3: EURC → PCC ───────────────────────────────
        console.log(`  Step 3 : Swapping ${eurcAmount} EURC → ${effectivePccAmount} PCC …`);
        circleTxId = await circle.swapEURCtoPCC(wallet.walletAddress, effectivePccAmount);
        console.log(`  Step 3 : PCC mint transaction initiated (txId: ${circleTxId})`);

        // Save the Circle Tx ID and perform optimistic balance update
        await db.updateTransactionStatus(txId, 'complete', circleTxId);

        const currentWallet = await db.getWalletByUserId(userId);
        await db.updateBalance(userId, currentWallet.balance + effectivePccAmount);
        console.log(`✅ Optimistic conversion complete for ${user.name}: ${effectivePccAmount} PCC minted.`);
        console.log(`══════════════════════════════════════════════\n`);
      } catch (swapErr) {
        await db.updateTransactionStatus(txId, 'failed');
        throw new Error(`Circle swap failed: ${swapErr.message}`);
      }

    } catch (err) {
      console.error('Error processing checkout.session.completed:', err);
    }
  }

  res.json({ received: true });
});

// ─── Circle Webhook (Automated Crypto Detection) ───────────
router.post('/circle', express.json(), async (req, res) => {
  try {
    const notification = req.body;

    // Circle sends periodic subscription confirmations or other types
    if (notification.Type === 'SubscriptionConfirmation') {
      console.log('[CIRCLE WEBHOOK] Confirming subscription...');
      // In production, you'd visit the notification.SubscribeURL
      return res.json({ success: true });
    }

    console.log(`[CIRCLE WEBHOOK] Received: ${notification.notificationType || notification.Type}`);

    if (notification.notificationType === 'transfers') {
      const { transfer } = notification;

      if (transfer.type === 'INBOUND' && transfer.status === 'COMPLETE') {
        const { walletId, amount, tokenAddress } = transfer;
        const eurcAddress = (process.env.EURC_CONTRACT_ADDRESS || '').toLowerCase();
        const usdcAddress = (process.env.USDC_CONTRACT_ADDRESS || '').toLowerCase();
        const incomingAddress = (tokenAddress || '').toLowerCase();

        if (incomingAddress === eurcAddress || incomingAddress === usdcAddress) {
          const incomingAmount = parseFloat(amount);
          const symbol = incomingAddress === eurcAddress ? 'EURC' : 'USDC';
          console.log(`\n[CIRCLE WEBHOOK] 🚀 Automated Detection: ${incomingAmount} ${symbol} → Wallet ${walletId}`);

          const wallet = await db.getWalletByCircleWalletId(walletId);
          if (wallet) {
            // Trigger the automated sweep, FX conversion (if USDC), and mint logic
            await circle.processIncomingAsset(wallet.userId, walletId, incomingAmount, incomingAddress, transfer.id);
          } else {
            console.warn(`[CIRCLE WEBHOOK] ⚠️ Received ${symbol} for unknown walletId: ${walletId}`);
          }
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[CIRCLE WEBHOOK] Error processing notification:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
