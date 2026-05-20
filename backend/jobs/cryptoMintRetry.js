// ═══════════════════════════════════════════════════════════════
// jobs/cryptoMintRetry.js - Failed mint retry cron job
// Runs every 10 minutes to retry PCC minting for orders that
// received EURC/USDC but failed to mint PCC
// ═══════════════════════════════════════════════════════════════

const cryptoOrdersDb = require('../db/cryptoOrders');
const notificationsDb = require('../db/notifications');
const auditDb = require('../db/audit');
const gateway = require('../services/gateway');
const { MINT_RETRY_MAX_HOURS } = require('../services/gateway/gatewayConfig');

/**
 * Retry failed mints for crypto orders
 *
 * Finds orders where:
 *   - status = 'completed' (EURC/USDC received in treasury)
 *   - transaction_id IS NULL (mint was never successful)
 *   - initiated_at < 2 hours ago (within retry window)
 *
 * After 2 hours of failures, marks the order as 'failed' and
 * alerts the Frostrek admin for manual intervention.
 */
async function retryFailedMints() {
  console.log('[CryptoMintRetry] Scanning for unminted completed orders...');

  try {
    // Get orders within the retry window
    const orders = await cryptoOrdersDb.getUnmintedCompletedOrders(MINT_RETRY_MAX_HOURS);

    if (orders.length === 0) {
      console.log('[CryptoMintRetry] No unminted orders found - all clear ✓');
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    console.log(`[CryptoMintRetry] Found ${orders.length} unminted order(s) - retrying...`);

    let succeeded = 0;
    let failed = 0;

    for (const order of orders) {
      try {
        console.log(`[CryptoMintRetry] Retrying mint for order ${order.id} (${order.crypto_currency}, user: ${order.user_id})`);
        await gateway.mintFromCrypto(order.id);
        succeeded++;
        console.log(`[CryptoMintRetry] ✅ Retry succeeded for order ${order.id}`);
      } catch (err) {
        failed++;
        console.error(`[CryptoMintRetry] ❌ Retry failed for order ${order.id}: ${err.message}`);
      }
    }

    console.log(`[CryptoMintRetry] Done. Succeeded: ${succeeded}, Failed: ${failed}`);
    return { processed: orders.length, succeeded, failed };
  } catch (err) {
    console.error('[CryptoMintRetry] Job error:', err.message);
    return { processed: 0, succeeded: 0, failed: 0, error: err.message };
  }
}

/**
 * Expire old orders that never completed
 *
 * Marks orders as 'failed' if:
 *   - status = 'completed' (EURC received, but mint keeps failing)
 *   - initiated_at > 2 hours ago (exceeded retry window)
 *   - transaction_id IS NULL (never successfully minted)
 *
 * Also cleans up expired 'initiated' orders (fan never paid)
 */
async function expireOldOrders() {
  console.log('[CryptoMintRetry] Checking for expired orders...');

  try {
    // 1. Expire stuck 'completed' orders past the retry window
    const stuckOrders = await cryptoOrdersDb.getUnmintedCompletedOrders(999); // Get all

    let expiredCount = 0;

    for (const order of stuckOrders) {
      const ageMs = Date.now() - new Date(order.initiated_at).getTime();
      const ageHours = ageMs / (1000 * 60 * 60);

      if (ageHours > MINT_RETRY_MAX_HOURS) {
        // Past retry window - mark as failed and alert admin
        await cryptoOrdersDb.updateCryptoOrder(order.id, {
          status: 'failed',
          failure_reason: `Mint retry window expired after ${MINT_RETRY_MAX_HOURS} hours. Manual intervention required.`,
        });

        // Notify Frostrek admin
        await notificationsDb.createNotification({
          type: 'system',
          title: '⚠️ Crypto Mint Failed - Manual Action Required',
          message: `Order ${order.id}: ${order.received_amount} ${order.received_currency} received but PCC minting failed after ${MINT_RETRY_MAX_HOURS} hours. User: ${order.user_id}. Provider: ${order.provider}.`,
          metadata: {
            crypto_order_id: order.id,
            user_id: order.user_id,
            received_amount: order.received_amount,
            received_currency: order.received_currency,
            provider: order.provider,
            action_required: 'manual_mint',
          },
        });

        // Audit log
        await auditDb.createAuditLog({
          action: 'crypto_mint_expired',
          entity_type: 'crypto_order',
          entity_id: order.id,
          metadata: {
            user_id: order.user_id,
            provider: order.provider,
            age_hours: ageHours.toFixed(1),
          },
        });

        expiredCount++;
        console.log(`[CryptoMintRetry] ⚠️ Order ${order.id} expired - admin notified`);
      }
    }

    // 2. Clean up old 'initiated' orders (fan never completed payment)
    const staleInitiated = await cryptoOrdersDb.getExpiredInitiatedOrders(30);
    for (const order of staleInitiated) {
      await cryptoOrdersDb.updateCryptoOrder(order.id, {
        status: 'failed',
        failure_reason: 'Order expired - payment not completed within 30 minutes',
      });
    }

    if (staleInitiated.length > 0) {
      console.log(`[CryptoMintRetry] Cleaned up ${staleInitiated.length} expired initiated order(s)`);
    }

    return { expired: expiredCount, cleaned: staleInitiated.length };
  } catch (err) {
    console.error('[CryptoMintRetry] Expiry job error:', err.message);
    return { expired: 0, cleaned: 0, error: err.message };
  }
}

/**
 * Run the full cron cycle - retry mints then expire old orders
 */
async function runCycle() {
  const retryResult = await retryFailedMints();
  const expiryResult = await expireOldOrders();

  return { retry: retryResult, expiry: expiryResult };
}

/**
 * Start the cron job with setInterval (no external dependency)
 * Runs every 10 minutes
 */
function startCronJob() {
  const intervalMs = 10 * 60 * 1000; // 10 minutes

  console.log('  ✅ Crypto mint retry job scheduled (every 10 minutes)');

  // Run immediately on startup (delayed 30s to let server initialize)
  setTimeout(() => {
    runCycle().catch(err => console.error('[CryptoMintRetry] Initial run error:', err.message));
  }, 30000);

  // Then every 10 minutes
  const intervalId = setInterval(() => {
    runCycle().catch(err => console.error('[CryptoMintRetry] Cycle error:', err.message));
  }, intervalMs);

  // Return handle for cleanup
  return intervalId;
}

module.exports = {
  retryFailedMints,
  expireOldOrders,
  runCycle,
  startCronJob,
};
