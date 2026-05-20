const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const circle = require('../circleService');
const stripeService = require('../stripeService');
const rateConfig = require('../rateConfig');

const router = express.Router();

function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data, error: '' });
}

function error(res, message, status = 400) {
  return res.status(status).json({ success: false, data: null, error: message });
}

// POST /api/spend
// Gas Station Pattern: Admin wallet mints PCC to merchant.
// User's DB balance is deducted. No gas needed in user wallet.
router.post('/spend', async (req, res) => {
  try {
    const { userId, merchantId, item, amount } = req.body;
    if (!userId || !merchantId || !amount) return error(res, 'Missing fields');

    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) return error(res, 'Invalid amount');

    const user = await db.getUserById(userId);
    const wallet = await db.getWalletByUserId(userId);
    const merchant = await db.getMerchantById(merchantId);

    if (!user || !wallet) return error(res, 'User/Wallet not found');
    if (!merchant) return error(res, 'Merchant not found');
    if (!merchant.walletAddress) return error(res, 'Merchant wallet not configured. Please contact support.');
    if (wallet.balance < sendAmount) return error(res, 'Insufficient balance');

    const txId = uuidv4();
    await db.createTransaction({
      id: txId,
      userId,
      tenant_id: merchantId,
      type: 'spend',
      amount: sendAmount,
      payment_rail: 'internal',
      status: 'pending',
      metadata: { item: item || 'Merchandise', merchantId, merchantName: merchant.name },
      createdAt: new Date().toISOString()
    });

    // Deduct balance immediately (optimistic)
    await db.updateBalance(userId, wallet.balance - sendAmount);

    // Admin wallet mints PCC to the merchant's address (gasless for user)
    const circleTxId = await circle.mintPCC(merchant.walletAddress, sendAmount);
    console.log(`[SPEND] Admin mint to merchant ${merchant.name}: ${sendAmount} PCC | TX: ${circleTxId}`);

    // Background confirmation polling
    circle.waitForTx(circleTxId).then(async txData => {
      await db.updateTransactionStatus(txId, 'complete', txData.txHash);
      console.log(`✅ Spend confirmed: ${user.name} → ${merchant.name} | ${sendAmount} PCC | TX: ${txData.txHash}`);
    }).catch(async err => {
      console.error(`❌ Spend TX failed: ${err.message}`);
      // Rollback balance on confirmed failure
      const currentWallet = await db.getWalletByUserId(userId);
      if (currentWallet) await db.updateBalance(userId, currentWallet.balance + sendAmount);
      await db.updateTransactionStatus(txId, 'failed');
    });

    return success(res, {
      txId,
      amount: sendAmount,
      status: 'pending',
      circleTxId
    });
  } catch (err) {
    return error(res, 'Spend failed: ' + err.message, 500);
  }
});

// ─── P2P SEND ──────────────────────────────────────────────

// GET /api/transactions/lookup?q=email_or_address
// IMPORTANT: This must be defined BEFORE /:userId to avoid wildcard matching
router.get('/lookup', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 3) return error(res, 'Query too short');

    let user = null;
    let wallet = null;

    if (q.startsWith('0x') && q.length === 42) {
      wallet = await db.getWalletByAddress(q);
      if (wallet) user = await db.getUserById(wallet.userId);
    } else {
      user = await db.getUserByEmail(q);
      if (user) wallet = await db.getWalletByUserId(user.id);
    }

    if (!user || !wallet) {
      return error(res, 'Recipient not found', 404);
    }

    const nameParts = (user.name || '').split(' ');
    const maskedName = nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
      : nameParts[0];

    return success(res, {
      recipientId: user.id,
      name: maskedName,
      walletAddress: wallet.walletAddress,
      walletAddressShort: `${wallet.walletAddress.substring(0, 6)}...${wallet.walletAddress.slice(-4)}`
    });
  } catch (err) {
    return error(res, 'Lookup failed: ' + err.message, 500);
  }
});

// GET /api/transactions/tenant/:tenantId
router.get('/tenant/:tenantId', async (req, res) => {
  try {
    const txs = await db.getTransactionsByTenant(req.params.tenantId);
    return success(res, { transactions: txs });
  } catch (err) {
    return error(res, 'Failed to fetch tenant transactions', 500);
  }
});

// GET /api/transactions/:userId
router.get('/:userId', async (req, res) => {
  try {
    const txs = await db.getUserTransactions(req.params.userId);
    return success(res, { transactions: txs });
  } catch (err) {
    return error(res, 'Failed to fetch transactions', 500);
  }
});

// POST /api/checkout (For Stripe Minting)
// User sends pccAmount (how many coins they want to buy)
// Backend calculates the fiat price via tiered rates
router.post('/checkout', async (req, res) => {
  try {
    const { userId, pccAmount, currency } = req.body;
    if (!userId || !pccAmount) return error(res, 'Missing fields');

    const coins = parseFloat(pccAmount);
    if (coins <= 0 || isNaN(coins)) return error(res, 'Invalid PCC amount');

    const user = await db.getUserById(userId);
    if (!user) return error(res, 'User not found', 404);

    // Calculate fiat price from PCC amount using tiered rates
    const pricing = await rateConfig.calculatePrice(currency || 'eur', coins);

    if (pricing.fiatTotal < 0.50) return error(res, `Amount too small (${pricing.fiatTotal} ${currency}). Stripe requires a minimum of 0.50 units for most currencies. Please buy more PCC.`);

    console.log(`Checkout: ${coins} PCC → ${pricing.fiatTotal} ${(currency || 'eur').toUpperCase()} (rate: ${pricing.pricePerPCC.toFixed(4)}/PCC, source: ${pricing.rateSource})`);

    const session = await stripeService.createCheckoutSession(
      userId,
      coins,
      pricing.fiatTotal,
      currency || 'eur'
    );

    return success(res, {
      url: session.url,
      pricing // Send pricing breakdown to frontend for confirmation
    });
  } catch (err) {
    console.error('Checkout error:', err);
    return error(res, 'Failed to create checkout session: ' + err.message, 500);
  }
});

// POST /api/transactions/checkout/verify (Explicit Verification Fallback)
router.post('/checkout/verify', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return error(res, 'Missing sessionId');

    // Fetch session from Stripe
    const session = await stripeService.stripe.checkout.sessions.retrieve(sessionId);
    if (!session) return error(res, 'Session not found', 404);
    if (session.payment_status !== 'paid') return error(res, 'Payment not completed');

    const userId = session.metadata.userId || session.metadata.fanId;
    const { pccAmount, fiatAmount, currency } = session.metadata;

    const fiatPaid = parseFloat(fiatAmount) || 0;
    const fiatCcy = (currency || 'eur').toUpperCase();

    const eurcAmount = await rateConfig.convertToEURC(currency, fiatPaid);
    const pccToMint = Math.floor(eurcAmount * 100) / 100;

    const user = await db.getUserById(userId);
    const wallet = await db.getWalletByUserId(userId);

    if (!user || !wallet) return error(res, 'User or wallet not found', 404);

    // Check if we already processed it successfully
    const existingTxs = await db.getUserTransactions(userId);
    // Find the tx created by frontend (might be pending or success)
    // The frontend creates it via sharedDb, which logs it in mint_transactions, or it puts it in metadata.session
    // So we check both. Also we need to fetch mint_transactions to be sure.

    // Instead of querying mint_transactions directly, let's just find the tx by idempotency_key or metadata
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
        console.log(`[VERIFY] Using existing transaction amount: ${effectivePccAmount} PCC (Prevents fee inflation)`);
      }

      if (tx.status === 'complete' || tx.status === 'success' || tx.status === 'processing') {
        console.log(`[VERIFY] Session ${session.id} already being processed or completed. Status: ${tx.status}`);
        return success(res, { message: 'Already processed.', status: tx.status });
      }
      // If it's pending, we will process it!
      // Update its idempotency_key just in case
      try {
        await db.updateTransactionStatus(txId, 'processing');
      } catch (e) { }
    } else {
      try {
        await db.createTransaction({
          id: txId,
          userId,
          type: 'mint',
          amount: pccToMint,
          status: 'pending',
          idempotency_key: session.id,
          metadata: { fiatAmount, currency, eurcAmount, session: session.id },
          createdAt: new Date().toISOString()
        });
      } catch (dbErr) {
        if (dbErr.message.includes('duplicate key value') || dbErr.message.includes('unique constraint')) {
          console.log(`[VERIFY] Session ${session.id} already processed (DB idempotency hit).`);
          return success(res, { message: 'Already processed.' });
        }
        throw dbErr;
      }
    }

    console.log(`\n══════════════════════════════════════════════`);
    console.log(`  [VERIFY] DECISION MODEL: Fiat → EURC → PCC`);
    console.log(`  User   : ${user.name} (${userId})`);
    console.log(`  Step 1 : Fiat received - ${fiatPaid} ${fiatCcy} confirmed by Stripe (Verification Fallback)`);

    console.log(`  Step 2 : Converting ${fiatPaid} ${fiatCcy} → ${eurcAmount} EURC …`);
    const eurcTxId = await circle.mintEURC(wallet.walletAddress, eurcAmount);
    console.log(`  Step 2 : EURC conversion initiated (txId: ${eurcTxId})`);

    let circleTxId;
    try {
      console.log(`  Step 3 : Swapping ${eurcAmount} EURC → ${effectivePccAmount} PCC …`);
      circleTxId = await circle.swapEURCtoPCC(wallet.walletAddress, effectivePccAmount);
      console.log(`  Step 3 : PCC mint transaction initiated (txId: ${circleTxId})`);
      await db.updateTransactionStatus(txId, 'pending', circleTxId);
      console.log(`══════════════════════════════════════════════\n`);
    } catch (swapErr) {
      await db.updateTransactionStatus(txId, 'failed');
      throw new Error(`Circle swap failed: ${swapErr.message}`);
    }

    // Background polling
    circle.waitForTx(circleTxId).then(async txData => {
      const latestTx = await db.getTransactionById(txId);
      if (latestTx && (latestTx.internal_status === 'success' || latestTx.status === 'success' || latestTx.internal_status === 'complete')) {
        console.log(`[VERIFY] Transaction ${txId} already marked success. Skipping balance update.`);
        return;
      }

      await db.updateTransactionStatus(txId, 'complete', txData.txHash);
      const currentWallet = await db.getWalletByUserId(userId);
      await db.updateBalance(userId, currentWallet.balance + effectivePccAmount);
      console.log(`✅ Conversion complete for ${user.name}: ${fiatPaid} ${fiatCcy} → ${eurcAmount} EURC → ${pccToMint} PCC. TX: ${txData.txHash}`);
    }).catch(async err => {
      const latestTx = await db.getTransactionById(txId);
      if (latestTx && latestTx.internal_status !== 'success') {
        await db.updateTransactionStatus(txId, 'failed');
      }
      console.error("❌ PCC mint polling failed:", err);
    });

    return success(res, { message: 'Verification successful. Minting in progress.' });

  } catch (err) {
    console.error('Verify checkout error:', err);
    return error(res, 'Failed to verify checkout: ' + err.message, 500);
  }
});

// POST /api/transactions/checkout/crypto (Initial request to get deposit details)
router.post('/checkout/crypto', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return error(res, 'Missing userId');

    const wallet = await db.getWalletByUserId(userId);
    if (!wallet) return error(res, 'User wallet not found', 404);

    return success(res, {
      depositAddress: wallet.walletAddress,
      assets: {
        EURC: process.env.EURC_CONTRACT_ADDRESS,
        USDC: process.env.USDC_CONTRACT_ADDRESS
      },
      network: process.env.BLOCKCHAIN || 'MATIC-AMOY',
      rate: '1 EURC = 1 PCC | USDC = Live FX Rate',
      instructions: `Please send EURC or USDC to your deposit address. Once the transaction is confirmed, the system will automatically mint your PCC.`
    });
  } catch (err) {
    return error(res, 'Failed to fetch deposit details: ' + err.message, 500);
  }
});

// ─── INDUSTRY GRADE SESSION FLOW ──────────────────────────

// 1. START A NEW SESSION
router.post('/session/start', async (req, res) => {
  try {
    const { userId, pccAmount, cryptoCurrency, cryptoAmount } = req.body;
    if (!userId || !pccAmount) return error(res, 'Missing fields');

    const wallet = await db.getWalletByUserId(userId);
    if (!wallet) return error(res, 'User wallet not found', 404);

    // Cancel any existing active sessions first
    const existing = await db.getActiveSession(userId);
    if (existing) {
      await db.updateSessionStatus(existing.id, 'CANCELLED');
    }

    const sessionId = uuidv4();
    const expiresAt = Math.floor(Date.now() / 1000) + 300; // 5 minutes

    await db.createCryptoSession({
      id: sessionId,
      userId,
      pccAmount,
      cryptoCurrency,
      cryptoAmount,
      depositAddress: wallet.walletAddress,
      expiresAt
    });

    console.log(`[SESSION] New session created: ${sessionId} for User ${userId}`);
    return success(res, { sessionId, expiresAt, depositAddress: wallet.walletAddress });
  } catch (err) {
    return error(res, 'Failed to start session: ' + err.message, 500);
  }
});

// 2. CHECK FOR ACTIVE SESSION (For Page Refreshes)
router.get('/session/active/:userId', async (req, res) => {
  try {
    const session = await db.getActiveSession(req.params.userId);
    if (session) {
      return success(res, session);
    }
    return error(res, 'No active session found', 404);
  } catch (err) {
    return error(res, 'Failed to check active session', 500);
  }
});

// 3. CANCEL SESSION
router.post('/session/cancel', async (req, res) => {
  try {
    const { sessionId } = req.body;
    await db.updateSessionStatus(sessionId, 'CANCELLED');
    console.log(`[SESSION] Session cancelled: ${sessionId}`);
    return success(res, { message: 'Session cancelled' });
  } catch (err) {
    return error(res, 'Cancel failed', 500);
  }
});

// 4. IMPROVED VERIFY (SESSION-BASED)
router.post('/checkout/crypto/verify', async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    if (!userId) return error(res, 'Missing userId');

    // Industry grade check: Verify session still valid
    const session = await db.getSessionById(sessionId);
    if (!session || session.status !== 'OPEN') {
      return error(res, 'Session is no longer active.');
    }

    const now = Math.floor(Date.now() / 1000);
    if (session.expiresAt < now) {
      await db.updateSessionStatus(sessionId, 'EXPIRED');
      return error(res, 'Session expired.');
    }

    const user = await db.getUserById(userId);
    const wallet = await db.getWalletByUserId(userId);
    if (!user || !wallet) return error(res, 'User or wallet not found', 404);

    console.log(`[VERIFY] Checking balances for Session ${sessionId}...`);

    const eurcAddress = process.env.EURC_CONTRACT_ADDRESS;
    const usdcAddress = process.env.USDC_CONTRACT_ADDRESS;

    const eurcBalance = await circle.getAssetBalance(wallet.circleWalletId, eurcAddress);
    const usdcBalance = await circle.getAssetBalance(wallet.circleWalletId, usdcAddress);

    let amount = 0;
    let tokenAddress = '';
    let symbol = '';

    if (parseFloat(eurcBalance) >= 1) {
      amount = parseFloat(eurcBalance);
      tokenAddress = eurcAddress;
      symbol = 'EURC';
    } else if (parseFloat(usdcBalance) >= 1) {
      amount = parseFloat(usdcBalance);
      tokenAddress = usdcAddress;
      symbol = 'USDC';
    }

    if (amount <= 0) {
      return error(res, 'No deposit detected.');
    }

    console.log(`[VERIFY] Detected ${amount} ${symbol}. Completing Session ${sessionId}...`);

    // Use session ID as externalId for idempotency
    const result = await circle.processIncomingAsset(userId, wallet.circleWalletId, amount, tokenAddress, sessionId);

    // Close the session as SUCCESS
    db.updateSessionStatus(sessionId, 'SUCCESS');

    return success(res, {
      message: 'Deposit detected!',
      amount: result.amount,
      pccTxId: result.pccTxId
    });

  } catch (err) {
    console.error('Verification error:', err);
    return error(res, 'Verification failed: ' + err.message, 500);
  }
});

// (lookup route moved above /:userId to prevent wildcard matching)

// POST /api/transactions/send
router.post('/send', async (req, res) => {
  try {
    const { senderUserId, recipientEmailOrAddress, amount } = req.body;
    if (!senderUserId || !recipientEmailOrAddress || !amount) {
      return error(res, 'Missing required fields: senderUserId, recipientEmailOrAddress, amount');
    }

    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) return error(res, 'Invalid amount');

    // ── Resolve sender ──
    const sender = await db.getUserById(senderUserId);
    if (!sender) return error(res, 'Sender not found', 404);
    const senderWallet = await db.getWalletByUserId(senderUserId);
    if (!senderWallet) return error(res, 'Sender wallet not found', 404);

    // ── Resolve recipient ──
    let recipient = null;
    let recipientWallet = null;
    const q = recipientEmailOrAddress.trim();

    if (q.startsWith('0x') && q.length === 42) {
      recipientWallet = await db.getWalletByAddress(q);
      if (recipientWallet) recipient = await db.getUserById(recipientWallet.userId);
    } else {
      recipient = await db.getUserByEmail(q);
      if (recipient) recipientWallet = await db.getWalletByUserId(recipient.id);
    }

    if (!recipient || !recipientWallet) {
      return error(res, 'Recipient not found. Please check the email or wallet address.', 404);
    }

    // ── Validations ──
    if (senderUserId === recipient.id) {
      return error(res, 'Cannot send PCC to yourself');
    }
    if (senderWallet.balance < sendAmount) {
      return error(res, `Insufficient balance. You have ${senderWallet.balance} PCC but tried to send ${sendAmount} PCC.`);
    }

    // ── Create paired transactions ──
    const sendTxId = uuidv4();
    const receiveTxId = uuidv4();

    // Sender's transaction (outgoing)
    await db.createTransaction({
      id: sendTxId,
      userId: senderUserId,
      type: 'send',
      amount: sendAmount,
      status: 'pending',
      metadata: {
        recipientId: recipient.id,
        recipientName: recipient.name,
        recipientAddress: recipientWallet.walletAddress,
        pairedTxId: receiveTxId
      },
      createdAt: new Date().toISOString()
    });

    // Recipient's transaction (incoming)
    await db.createTransaction({
      id: receiveTxId,
      userId: recipient.id,
      type: 'receive',
      amount: sendAmount,
      status: 'pending',
      metadata: {
        senderId: senderUserId,
        senderName: sender.name,
        senderAddress: senderWallet.walletAddress,
        pairedTxId: sendTxId
      },
      createdAt: new Date().toISOString()
    });

    // ── Execute via Admin Mint (Gas Station Pattern) ──
    console.log(`\n══════════════════════════════════════════════`);
    console.log(`  P2P TRANSFER: ${sender.name} → ${recipient.name}`);
    console.log(`  Amount: ${sendAmount} PCC`);
    console.log(`  From: ${senderWallet.walletAddress}`);
    console.log(`  To:   ${recipientWallet.walletAddress}`);
    console.log(`  Method: Admin Mint (gasless for users)`);

    // Admin wallet mints PCC to recipient (no gas needed from sender)
    const circleTxId = await circle.mintPCC(
      recipientWallet.walletAddress,
      sendAmount
    );
    console.log(`  Circle TX: ${circleTxId}`);
    console.log(`══════════════════════════════════════════════\n`);

    // Save circleTxId immediately for recovery
    await db.updateTransactionStatus(sendTxId, 'pending', circleTxId);

    // ── Optimistic balance updates ──
    await db.updateBalance(senderUserId, senderWallet.balance - sendAmount);
    await db.updateBalance(recipient.id, recipientWallet.balance + sendAmount);

    // ── Background confirmation polling ──
    circle.waitForTx(circleTxId).then(async txData => {
      await db.updateTransactionStatus(sendTxId, 'complete', txData.txHash);
      await db.updateTransactionStatus(receiveTxId, 'complete', txData.txHash);
      console.log(`✅ P2P Transfer confirmed: ${sender.name} → ${recipient.name} | ${sendAmount} PCC | TX: ${txData.txHash}`);
    }).catch(async err => {
      await db.updateTransactionStatus(sendTxId, 'failed');
      await db.updateTransactionStatus(receiveTxId, 'failed');
      // Rollback balances on failure
      const currentSender = await db.getWalletByUserId(senderUserId);
      const currentRecipient = await db.getWalletByUserId(recipient.id);
      if (currentSender) await db.updateBalance(senderUserId, currentSender.balance + sendAmount);
      if (currentRecipient) await db.updateBalance(recipient.id, currentRecipient.balance - sendAmount);
      console.error(`❌ P2P Transfer failed: ${sender.name} → ${recipient.name}:`, err.message);
    });

    return success(res, {
      txId: sendTxId,
      amount: sendAmount,
      fee: 0,
      recipientName: recipient.name,
      recipientAddress: recipientWallet.walletAddress,
      status: 'pending',
      circleTxId
    });
  } catch (err) {
    console.error('Send PCC error:', err);
    return error(res, 'Transfer failed: ' + err.message, 500);
  }
});

module.exports = router;
