const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { initiateSmartContractPlatformClient } = require('@circle-fin/smart-contract-platform');
require('dotenv').config();

const apiKey = process.env.CIRCLE_API_KEY;
const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

if (!apiKey || !entitySecret) {
  console.error("ERROR: CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET must be set in .env");
  process.exit(1);
}

const dcwClient = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
const scpClient = initiateSmartContractPlatformClient({ apiKey, entitySecret });
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function setup() {
  try {
    console.log("=== PaieCash.COIN INFRASTRUCTURE SETUP ===");

    // Step 1 - Get or Create admin wallet set + admin wallet
    let adminWalletId = process.env.ADMIN_WALLET_ID;
    let adminWalletAddress = process.env.ADMIN_ADDRESS;

    if (!adminWalletId || !adminWalletAddress) {
      console.log("\n[Step 1] Creating Admin Wallet Set and Wallet...");
      const walletSetRes = await dcwClient.createWalletSet({ name: "PaieCash System Wallets" });
      const adminWalletSetId = walletSetRes.data.walletSet.id;
      console.log(`  ✓ Admin Wallet Set created: ${adminWalletSetId}`);

      const adminWalletRes = await dcwClient.createWallets({
        blockchains: ["MATIC-AMOY"],
        accountType: "SCA",
        walletSetId: adminWalletSetId,
        count: 1
      });

      const adminWallet = adminWalletRes.data.wallets[0];
      adminWalletId = adminWallet.id;
      adminWalletAddress = adminWallet.address;
      console.log(`  ✓ Admin Wallet created: ID = ${adminWalletId}, Address = ${adminWalletAddress}`);

      console.log("\n  ⚠️ STOP AND READ ⚠️");
      console.log(`  Before the contract can be deployed, you MUST fund this admin wallet with testnet MATIC.`);
      console.log(`  Go to: https://faucet.polygon.technology`);
      console.log(`  Paste this address: ${adminWalletAddress}`);
      console.log(`  Wait for the transaction to complete before proceeding.\n`);
      return;
    } else {
      console.log(`\n[Step 1] Using existing Admin Wallet: ${adminWalletAddress}`);
    }

    // In a real automated setup script we'd pause here. 
    // Since this is just a generator script, we'll try to deploy but it will fail if unfunded.
    // Assuming the user runs this AFTER getting funds, or we just provide instructions.

    console.log("[Step 2] Deploying PaieCash Coin (PCC) ERC-20 Token...");
    const templateId = "a1b74add-23e0-4712-88d1-6b3009e85a86";

    try {
      const crypto = require('crypto');
      const deployRes = await scpClient.deployContractTemplate({
        name: "PaieCash Coin Deployment",
        description: "PaieCash Coin ERC20 Token",
        walletId: adminWalletId,
        blockchain: "MATIC-AMOY",
        id: templateId,
        fee: { type: "level", config: { feeLevel: "HIGH" } },
        idempotencyKey: crypto.randomUUID(),
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
      console.log(`  ✓ Deployment initiated. Transaction ID: ${deployTxId}, Contract ID: ${contractId}`);

      let contractAddress = null;
      let isDeployed = false;

      process.stdout.write("  Polling for deployment completion... ");
      while (!isDeployed) {
        const contractRes = await scpClient.getContract({ id: contractId });
        const status = contractRes.data.contract?.status || contractRes.data.status;
        const address = contractRes.data.contract?.contractAddress || contractRes.data.contractAddress;

        if (status === 'COMPLETE' || address) {
          isDeployed = true;
          contractAddress = address;
          process.stdout.write(`\n  ✓ Contract deployed successfully at: ${contractAddress}\n`);
        } else if (status === 'FAILED') {
          process.stdout.write(`\n  ❌ Deployment failed. Full response: ${JSON.stringify(contractRes.data)}\n`);
          console.log(`\n  Did you remember to fund ${adminWalletAddress} at the Polygon Faucet?`);
          return;
        } else {
          process.stdout.write(".");
          await delay(5000);
        }
      }

      console.log("\n[Step 3] Creating Fan Wallet Set...");
      const fanWalletSetRes = await dcwClient.createWalletSet({ name: "PaieCash Fan Wallets" });
      const fanWalletSetId = fanWalletSetRes.data.walletSet.id;
      console.log(`  ✓ Fan Wallet Set created: ${fanWalletSetId}`);

      console.log("\n=== SETUP COMPLETE ===");
      console.log("Add the following lines to your backend/.env file:\n");
      console.log(`ADMIN_WALLET_ID=${adminWalletId}`);
      console.log(`ADMIN_ADDRESS=${adminWalletAddress}`);
      console.log(`PCC_CONTRACT_ADDRESS=${contractAddress}`);
      console.log(`WALLET_SET_ID=${fanWalletSetId}`);

    } catch (e) {
      console.error("\n  ❌ Deployment Error:");
      if (e.response && e.response.data) {
        console.error(JSON.stringify(e.response.data, null, 2));
      } else if (e.response) {
        console.error(e.response);
      } else {
        console.error(e);
      }
      console.log(`\n  Make sure to fund ${adminWalletAddress} at the Polygon Faucet before running this script.`);
    }

  } catch (error) {
    console.error("\n[ERROR] Setup failed:", error.response?.data || error.message);
  }
}

setup();
