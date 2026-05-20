// ═══════════════════════════════════════════════════════════════
// routes/v2/mint/transfer.js - P2P, wallet-to-wallet, merchant
// Preserves existing send/spend logic from routes/transactions.js
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../../../database');
const circle = require('../../../circleService');
const sharedDb = require('../../../services/shared-db');
const router = express.Router();

const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// GET /api/v2/mint/transfer/lookup?q=email_or_address
router.get('/lookup', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 3) return fail(res, 'Query too short');

    let user = null, wallet = null;
    if (q.startsWith('0x') && q.length === 42) {
      wallet = await db.getWalletByAddress(q);
      if (wallet) user = await db.getUserById(wallet.userId);
    } else {
      user = await db.getUserByEmail(q);
      if (user) wallet = await db.getWalletByUserId(user.id);
    }

    if (!user || !wallet) return fail(res, 'Recipient not found', 404);

    const nameParts = (user.name || '').split(' ');
    const maskedName = nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
      : nameParts[0];

    return ok(res, {
      recipientId: user.id,
      name: maskedName,
      email: user.email,
      walletAddress: wallet.walletAddress,
      walletAddressShort: `${wallet.walletAddress.substring(0, 6)}...${wallet.walletAddress.slice(-4)}`
    });
  } catch (err) {
    return fail(res, 'Lookup failed: ' + err.message, 500);
  }
});

// POST /api/v2/mint/transfer/send - P2P Transfer
router.post('/send', async (req, res) => {
  try {
    const { senderUserId, recipientEmailOrAddress, amount, note } = req.body;
    if (!senderUserId || !recipientEmailOrAddress || !amount) return fail(res, 'Missing required fields');

    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) return fail(res, 'Invalid amount');

    console.log(`[P2P] Starting transfer: ${senderUserId} -> ${recipientEmailOrAddress} (${sendAmount} PCC)`);

    const sender = await db.getUserById(senderUserId);
    if (!sender) return fail(res, 'Sender not found', 404);
    const senderWallet = await db.getWalletByUserId(senderUserId);
    if (!senderWallet) return fail(res, 'Sender wallet not found', 404);

    // Resolve recipient
    let recipient = null, recipientWallet = null;
    const q = recipientEmailOrAddress.trim();
    if (q.startsWith('0x') && q.length === 42) {
      recipientWallet = await db.getWalletByAddress(q);
      if (recipientWallet) recipient = await db.getUserById(recipientWallet.userId);
    } else {
      recipient = await db.getUserByEmail(q);
      if (recipient) recipientWallet = await db.getWalletByUserId(recipient.id);
    }

    if (!recipient || !recipientWallet) return fail(res, 'Recipient not found', 404);
    if (senderUserId === recipient.id) return fail(res, 'Cannot send to yourself');
    if (senderWallet.balance < sendAmount) {
      console.warn(`[P2P] Insufficient balance: ${senderWallet.balance} < ${sendAmount}`);
      return fail(res, `Insufficient balance (${senderWallet.balance} PCC)`);
    }

    console.log(`[P2P] Recipient resolved: ${recipient.id} (${recipientWallet.walletAddress})`);

    // Create unified P2P transaction
    const tx = await sharedDb.createP2PTransaction({
      sender_id: senderUserId,
      recipient_id: recipient.id,
      sender_wallet: senderWallet.id,
      recipient_wallet: recipientWallet.id,
      amount: sendAmount,
      note: note || null,
      status: 'complete'
    });

    const { id: txId, receiveTxId } = tx;

    // Execute on-chain via admin mint (Gas Station Pattern)
    const circleTxId = await circle.mintPCC(recipientWallet.walletAddress, sendAmount);
    await db.updateTransactionStatus(txId, 'complete', circleTxId);
    await db.updateTransactionStatus(receiveTxId, 'complete', circleTxId);

    // Optimistic balance updates
    await db.updateBalance(senderUserId, senderWallet.balance - sendAmount);
    await db.updateBalance(recipient.id, recipientWallet.balance + sendAmount);

    // Background confirmation
    circle.waitForTx(circleTxId).then(async txData => {
      await db.updateTransactionStatus(txId, 'complete', txData.txHash);
      await db.updateTransactionStatus(receiveTxId, 'complete', txData.txHash);
    }).catch(async err => {
      await db.updateTransactionStatus(txId, 'failed');
      await db.updateTransactionStatus(receiveTxId, 'failed');
      const cSender = await db.getWalletByUserId(senderUserId);
      const cRecip = await db.getWalletByUserId(recipient.id);
      if (cSender) await db.updateBalance(senderUserId, cSender.balance + sendAmount);
      if (cRecip) await db.updateBalance(recipient.id, cRecip.balance - sendAmount);
    });

    return ok(res, {
      txId, amount: sendAmount, fee: 0,
      recipientName: recipient.name, recipientAddress: recipientWallet.walletAddress, status: 'complete', circleTxId
    });
  } catch (err) {
    return fail(res, 'Transfer failed: ' + err.message, 500);
  }
});

// POST /api/v2/mint/transfer/merchant - Merchant payment
router.post('/merchant', async (req, res) => {
  try {
    const { userId, merchantId, item, amount } = req.body;
    if (!userId || !merchantId || !amount) return fail(res, 'Missing fields');

    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) return fail(res, 'Invalid amount');

    const user = await db.getUserById(userId);
    const wallet = await db.getWalletByUserId(userId);
    const merchant = await db.getMerchantById(merchantId);

    if (!user || !wallet) return fail(res, 'User/Wallet not found');
    if (!merchant) return fail(res, 'Merchant not found');
    if (!merchant.walletAddress) return fail(res, 'Merchant wallet not configured');
    if (wallet.balance < sendAmount) return fail(res, 'Insufficient balance');

    const txId = uuidv4();
    await db.createTransaction({
      id: txId, userId, tenant_id: merchantId, type: 'spend', amount: sendAmount,
      payment_rail: 'internal', status: 'complete',
      metadata: { item: item || 'Merchandise', merchantId, merchantName: merchant.name }, createdAt: new Date().toISOString()
    });

    await db.updateBalance(userId, wallet.balance - sendAmount);
    const circleTxId = await circle.mintPCC(merchant.walletAddress, sendAmount);

    circle.waitForTx(circleTxId).then(async txData => {
      await db.updateTransactionStatus(txId, 'complete', txData.txHash);
    }).catch(async err => {
      const cw = await db.getWalletByUserId(userId);
      if (cw) await db.updateBalance(userId, cw.balance + sendAmount);
      await db.updateTransactionStatus(txId, 'failed');
    });

    return ok(res, { txId, amount: sendAmount, status: 'complete', circleTxId });
  } catch (err) {
    return fail(res, 'Payment failed: ' + err.message, 500);
  }
});

module.exports = router;
