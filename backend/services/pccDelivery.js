const circle = require('../circleService');

/**
 * deliverPCC
 * High-level service to deliver PCC tokens to a user's wallet.
 * Uses Circle Developer-Controlled Wallets API to execute the minting
 * from the platform's Admin Wallet.
 * 
 * @param {string} toWalletAddress - The destination Polygon address
 * @param {number} eurcAmount - The amount of PCC to mint (1:1 with EURC)
 */
async function deliverPCC(toWalletAddress, eurcAmount) {
  try {
    if (!toWalletAddress) {
      throw new Error("Recipient wallet address is required for PCC delivery.");
    }

    if (!eurcAmount || eurcAmount <= 0) {
      throw new Error(`Invalid PCC amount for delivery: ${eurcAmount}`);
    }

    console.log(`[PCC Delivery] 🚀 Initiating delivery via Circle API...`);
    console.log(`[PCC Delivery] Target: ${toWalletAddress} | Amount: ${eurcAmount} PCC`);

    // Step 1: Use Circle service to trigger a 'mintTo' transaction on the PCC contract
    // This uses the ADMIN_WALLET_ID and CIRCLE_API_KEY from your .env
    const circleTxId = await circle.mintPCC(toWalletAddress, eurcAmount);
    
    console.log(`[PCC Delivery] Circle transaction created: ${circleTxId}`);
    console.log(`[PCC Delivery] Polling for on-chain confirmation...`);

    // Step 2: Wait for Circle to confirm the transaction state is 'COMPLETE'
    const txData = await circle.waitForTx(circleTxId);

    console.log(`[PCC Delivery] ✅ Success! Transaction confirmed on-chain.`);
    console.log(`[PCC Delivery] TxHash: ${txData.txHash}`);

    return {
      txHash: txData.txHash,
      pccMinted: eurcAmount,
      walletAddress: toWalletAddress,
      circleTransactionId: circleTxId
    };

  } catch (error) {
    console.error(`[PCC Delivery] ❌ Delivery failed:`, error.message);
    throw error;
  }
}

module.exports = { deliverPCC };
