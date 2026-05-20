// ═══════════════════════════════════════════════════════════════
// routes/v2/marketplace/orders.js - Order checkout & management
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../../../database');
const circle = require('../../../circleService');
const router = express.Router();

const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// POST /api/v2/marketplace/orders - Create a new order (checkout)
router.post('/', async (req, res) => {
  try {
    const { userId, items, shipping, totalPcc } = req.body;

    // ── Validation ──
    if (!userId) return fail(res, 'Please login to checkout');
    if (!items || !items.length) return fail(res, 'Cart is empty');
    if (!shipping || !shipping.fullName || !shipping.address || !shipping.city || !shipping.phone) {
      return fail(res, 'Please fill in all shipping details');
    }

    const parsedTotal = parseFloat(totalPcc);
    if (isNaN(parsedTotal) || parsedTotal <= 0) return fail(res, 'Invalid order total');

    // ── Verify user & balance ──
    const user = await db.getUserById(userId);
    if (!user) return fail(res, 'User not found', 404);

    const wallet = await db.getWalletByUserId(userId);
    if (!wallet) return fail(res, 'Wallet not found', 404);
    if (wallet.balance < parsedTotal) {
      return fail(res, `Insufficient balance. You have ${wallet.balance.toLocaleString()} PCC but need ${parsedTotal.toLocaleString()} PCC.`);
    }

    // ── Group items by tenant (club) ──
    const tenantGroups = {};
    for (const item of items) {
      const tid = item.tenantId || item.tenant_id || 'unknown';
      if (!tenantGroups[tid]) tenantGroups[tid] = [];
      tenantGroups[tid].push(item);
    }

    // ── Create transaction (PCC spend) ──
    const txId = uuidv4();
    await db.createTransaction({
      id: txId,
      userId,
      type: 'spend',
      amount: parsedTotal,
      payment_rail: 'internal',
      status: 'pending',
      metadata: {
        type: 'marketplace_order',
        itemCount: items.length,
        shipping: {
          name: shipping.fullName,
          city: shipping.city,
          country: shipping.country || ''
        }
      },
      createdAt: new Date().toISOString()
    });

    // ── Deduct balance immediately (optimistic) ──
    await db.updateBalance(userId, wallet.balance - parsedTotal);

    // ── Create order records per tenant ──
    const orderIds = [];
    for (const [tenantId, tenantItems] of Object.entries(tenantGroups)) {
      const tenantTotal = tenantItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

      try {
        const order = await db.createOrder({
          user_id: userId,
          tenant_id: tenantId !== 'unknown' ? tenantId : null,
          transaction_id: txId,
          items: tenantItems.map(i => ({
            productId: i.id,
            name: i.name,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
            image: i.image || null
          })),
          total_pcc: tenantTotal,
          total_eur: 0,
          notes: JSON.stringify({
            shipping,
            orderDate: new Date().toISOString()
          })
        });
        orderIds.push(order.id);
      } catch (orderErr) {
        console.error(`[ORDER] Failed to create order for tenant ${tenantId}:`, orderErr.message);
        // Continue with other tenants
      }
    }

    // ── Blockchain mint to club treasury (background) ──
    for (const [tenantId, tenantItems] of Object.entries(tenantGroups)) {
      if (tenantId === 'unknown') continue;
      try {
        const merchant = await db.getMerchantById(tenantId);
        if (merchant && merchant.walletAddress) {
          const tenantTotal = tenantItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
          const circleTxId = await circle.mintPCC(merchant.walletAddress, tenantTotal);
          console.log(`[ORDER] Admin mint to ${merchant.name}: ${tenantTotal} PCC | TX: ${circleTxId}`);

          // Background confirmation
          circle.waitForTx(circleTxId).then(async txData => {
            console.log(`✅ Order payment confirmed to ${merchant.name}: ${tenantTotal} PCC | TX: ${txData.txHash}`);
          }).catch(err => {
            console.error(`❌ Order payment failed to ${merchant.name}:`, err.message);
          });
        }
      } catch (mintErr) {
        console.error(`[ORDER] Mint to tenant ${tenantId} failed:`, mintErr.message);
      }
    }

    // ── Update transaction status ──
    await db.updateTransactionStatus(txId, 'complete');

    console.log(`\n══════════════════════════════════════════════`);
    console.log(`  [ORDER] New marketplace order`);
    console.log(`  User    : ${user.name} (${userId})`);
    console.log(`  Items   : ${items.length}`);
    console.log(`  Total   : ${parsedTotal} PCC`);
    console.log(`  Orders  : ${orderIds.join(', ')}`);
    console.log(`  Ship To : ${shipping.fullName}, ${shipping.city}`);
    console.log(`══════════════════════════════════════════════\n`);

    return ok(res, {
      orderIds,
      transactionId: txId,
      totalPcc: parsedTotal,
      status: 'confirmed',
      message: 'Order placed successfully!'
    });
  } catch (err) {
    console.error('[ORDER] Checkout error:', err);
    return fail(res, 'Checkout failed: ' + err.message, 500);
  }
});

// GET /api/v2/marketplace/orders/user/:userId - Get user's orders
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await db.getOrdersByUser(req.params.userId);
    return ok(res, { orders });
  } catch (err) {
    return fail(res, 'Failed to fetch orders', 500);
  }
});

// GET /api/v2/marketplace/orders/:orderId - Get single order
router.get('/:orderId', async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.orderId);
    if (!order) return fail(res, 'Order not found', 404);
    return ok(res, { order });
  } catch (err) {
    return fail(res, 'Failed to fetch order', 500);
  }
});

module.exports = router;
