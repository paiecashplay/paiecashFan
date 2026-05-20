const db = require('./database');
const circle = require('./circleService');

async function reconcile() {
  console.log('Starting reconciliation of pending transactions...');
  
  try {
    const txs = await db.getAllTransactions();
    const pending = txs.filter(tx => tx.status === 'pending' || tx.status === 'internal_status'); // Handle both legacy and new names
    
    console.log(`Found ${pending.length} pending transactions.`);
    
    for (const tx of pending) {
      console.log(`\nProcessing Transaction ${tx.id} for User ${tx.userId}:`);
      console.log(`  Amount: ${tx.amount} PCC`);
      
      const wallet = await db.getWalletByUserId(tx.userId);
      if (!wallet) {
        console.error(`  [ERROR] Wallet not found for user ${tx.userId}`);
        continue;
      }
      
      // Check if this might have already been processed
      // (This is a safety check to avoid double minting)
      const currentCircleBalance = await circle.getBalance(wallet.circleWalletId);
      console.log(`  Current Circle Balance: ${currentCircleBalance} PCC`);
      
      // In this demo, we assume if balance is 0 or less than expected, we need to mint.
      // But we should be careful.
      
      try {
        console.log(`  Initiating mint to ${wallet.walletAddress}...`);
        const circleTxId = await circle.mintPCC(wallet.walletAddress, tx.amount);
        console.log(`  Circle Transaction Initiated: ${circleTxId}`);
        
        // Wait for confirmation
        console.log(`  Waiting for confirmation (max 60s)...`);
        const txData = await circle.waitForTx(circleTxId);
        
        // Update DB
        await db.updateTransactionStatus(tx.id, 'complete', txData.txHash);
        await db.updateBalance(tx.userId, wallet.balance + tx.amount);
        
        console.log(`  [SUCCESS] Transaction ${tx.id} completed. Hash: ${txData.txHash}`);
      } catch (err) {
        console.error(`  [FAILED] Reconciliation failed for ${tx.id}: ${err.message}`);
      }
    }
    
    console.log('\nReconciliation finished.');
  } catch (err) {
    console.error('Fatal error during reconciliation:', err);
  }
}

reconcile();
