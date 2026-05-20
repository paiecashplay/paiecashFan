require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { initiateSmartContractPlatformClient } = require('@circle-fin/smart-contract-platform');
const { randomUUID } = require('crypto');

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET,
});

const scp = initiateSmartContractPlatformClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET,
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  try {
    console.log("=== PHASE 1 SETUP STARTED ===\n");

    // ---------------------------------------------------------
    // 1A. Create Admin Wallet
    // ---------------------------------------------------------
    console.log("Creating Admin Wallet Set...");
    const adminSetRes = await client.createWalletSet({
      name: "Admin System Wallets",
      idempotencyKey: randomUUID()
    });
    const adminSetId = adminSetRes.data.walletSet.id;

    console.log("Creating Admin Wallet (SCA) on MATIC-AMOY...");
    const adminWalletRes = await client.createWallets({
      blockchains: ["MATIC-AMOY"],
      accountType: "SCA",
      walletSetId: adminSetId,
      count: 1,
      idempotencyKey: randomUUID()
    });

    const adminWallet = adminWalletRes.data.wallets[0];
    const adminWalletId = adminWallet.id;
    const adminWalletAddress = adminWallet.address;

    console.log("\n=== STEP 1A: Admin Wallet Created ===");
    console.log(`ADMIN_WALLET_ID=${adminWalletId}`);
    console.log(`ADMIN_WALLET_ADDRESS=${adminWalletAddress}`);
    console.log("---------------------------------------------------------");

    // Give the Circle indexer a few seconds to register the new wallet
    console.log("\nWaiting 10 seconds for the wallet to initialize on-chain...");
    await delay(10000);

    // ---------------------------------------------------------
    // 1B. Deploy PCC ERC-20 Token
    // ---------------------------------------------------------
    console.log("\nDeploying PaieCash Coin (PCC) via Smart Contract Platform...");
    const templateId = "a1b74add-23e0-4712-88d1-6b3009e85a86";

    const deployRes = await scp.deployContractTemplate({
      name: "PaieCash Coin Deployment",
      description: "PaieCash Coin ERC20 Token",
      walletId: adminWalletId,
      blockchain: "MATIC-AMOY",
      id: templateId,
      fee: { type: "level", config: { feeLevel: "HIGH" } },
      idempotencyKey: randomUUID(),
      templateParameters: {
        name: "PaieCash Coin",
        symbol: "PCC",
        defaultAdmin: adminWalletAddress,
        primarySaleRecipient: adminWalletAddress,
        minter: adminWalletAddress,
      }
    });

    const deployTxId = deployRes.data.transactionId;
    const contractId = deployRes.data.contractIds[0];
    console.log(`Transaction Initiated. TX ID: ${deployTxId}`);

    let contractAddress = null;
    let isDeployed = false;

    process.stdout.write("Polling for deployment completion... ");
    while (!isDeployed) {
      const contractRes = await scp.getContract({ id: contractId });
      const status = contractRes.data.contract?.status || contractRes.data.status;
      const address = contractRes.data.contract?.contractAddress || contractRes.data.contractAddress;

      if (status === 'COMPLETE' || address) {
        isDeployed = true;
        contractAddress = address;
        process.stdout.write(" Done!\n");
      } else if (status === 'FAILED') {
        process.stdout.write("\n");
        throw new Error(`Deployment FAILED. Response: ${JSON.stringify(contractRes.data)}`);
      } else {
        process.stdout.write(".");
        await delay(5000);
      }
    }

    console.log("\n=== STEP 1B: PCC Token Deployed ===");
    console.log(`CONTRACT_ADDRESS=${contractAddress}`);
    console.log("---------------------------------------------------------");

    // ---------------------------------------------------------
    // 1C. Create Treasury Wallet
    // ---------------------------------------------------------
    console.log("\nCreating Treasury Wallet Set...");
    const treasurySetRes = await client.createWalletSet({
      name: "Treasury System Wallets",
      idempotencyKey: randomUUID()
    });
    const treasurySetId = treasurySetRes.data.walletSet.id;

    console.log("Creating Treasury Wallet (SCA) on MATIC-AMOY...");
    const treasuryWalletRes = await client.createWallets({
      blockchains: ["MATIC-AMOY"],
      accountType: "SCA",
      walletSetId: treasurySetId,
      count: 1,
      idempotencyKey: randomUUID()
    });

    const treasuryWallet = treasuryWalletRes.data.wallets[0];
    const treasuryWalletId = treasuryWallet.id;
    const treasuryWalletAddress = treasuryWallet.address;

    console.log("\n=== STEP 1C: Treasury Wallet Created ===");
    console.log(`TREASURY_WALLET_ID=${treasuryWalletId}`);
    console.log(`TREASURY_WALLET_ADDRESS=${treasuryWalletAddress}`);
    console.log("---------------------------------------------------------");

    // ---------------------------------------------------------
    // FINAL OUTPUT
    // ---------------------------------------------------------
    console.log("\n=== SAVE ALL OF THE ABOVE TO YOUR .env FILE ===");
    console.log(`ADMIN_WALLET_ID=${adminWalletId}`);
    console.log(`ADMIN_WALLET_ADDRESS=${adminWalletAddress}`);
    console.log(`CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`TREASURY_WALLET_ID=${treasuryWalletId}`);
    console.log(`TREASURY_WALLET_ADDRESS=${treasuryWalletAddress}`);
    console.log("===============================================\n");

  } catch (err) {
    console.error("\n\n❌ ERROR DURING SETUP PHASE 1 ❌");
    if (err.response && err.response.data) {
      console.error(JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message || err);
    }
    console.log("\n(Tip: Ensure you have funded the Admin Wallet on the Polygon Faucet if the token deployment failed)");
  }
}

main();
