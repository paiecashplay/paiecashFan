const { v4: uuidv4 } = require('uuid');
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const { initiateSmartContractPlatformClient } = require('@circle-fin/smart-contract-platform');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.CIRCLE_API_KEY;
const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

const dcwClient = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
const scpClient = initiateSmartContractPlatformClient({ apiKey, entitySecret });
const { parseUnits } = require('ethers');

const IS_SIMULATION = apiKey && apiKey.startsWith('TEST_API_KEY');
if (IS_SIMULATION) console.log('🛠️ Circle Service: RUNNING IN SIMULATION MODE (Test API Key detected)');

const BLOCKCHAIN = process.env.BLOCKCHAIN || 'MATIC-AMOY';
const ADMIN_WALLET_ID = process.env.ADMIN_WALLET_ID;
const PCC_CONTRACT_ADDRESS = process.env.PCC_CONTRACT_ADDRESS;
const EURC_CONTRACT_ADDRESS = process.env.EURC_CONTRACT_ADDRESS;
const USDC_CONTRACT_ADDRESS = process.env.USDC_CONTRACT_ADDRESS;
const TREASURY_WALLET_ADDRESS = process.env.TREASURY_WALLET_ADDRESS;

const AMOY_TOKENS = {
  USDC: { address: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582', decimals: 6 },
  EURC: { address: '0x411801c790f9be9d788647d0827fa3311918306c', decimals: 6 },
  USDT: { address: '0xa02f6adc7926efebbd59fd43a84f4e0c0cce3271', decimals: 6 },
  DAI: { address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', decimals: 18 },
  WETH: { address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', decimals: 18 },
  WBTC: { address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', decimals: 8 },
  LINK: { address: '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39', decimals: 18 },
  UNI: { address: '0xb33eaad8d922b1083446dc23f610c2567fb5180f', decimals: 18 }
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// ─── Wallet Management ─────────────────────────────────────

async function createFanWalletSet() {
  if (IS_SIMULATION) return "sim-wallet-set-" + uuidv4();
  const res = await dcwClient.createWalletSet({ name: "PaieCash Fan Wallets" });
  return res.data.walletSet.id;
}

async function createFanWallet(walletSetId) {
  if (IS_SIMULATION) return { id: "sim-wallet-" + uuidv4(), address: "0x" + Math.random().toString(16).slice(2, 42) };
  const res = await dcwClient.createWallets({
    blockchains: [BLOCKCHAIN],
    accountType: "SCA",
    walletSetId: walletSetId,
    count: 1
  });
  return res.data.wallets[0];
}

async function getBalance(walletId) {
  try {
    const res = await dcwClient.getWalletTokenBalance({ id: walletId });
    const balances = res.data.tokenBalances || [];
    const pcc = balances.find(b => (b.token.tokenAddress || b.token.address)?.toLowerCase() === PCC_CONTRACT_ADDRESS.toLowerCase());
    return pcc ? pcc.amount : "0";
  } catch (err) {
    console.error("Error getting balance:", err);
    return "0";
  }
}

async function getAssetBalance(walletId, tokenAddress) {
  try {
    if (!tokenAddress) return "0";
    const res = await dcwClient.getWalletTokenBalance({ id: walletId });
    const balances = res.data.tokenBalances || [];
    const asset = balances.find(b => (b.token.tokenAddress || b.token.address)?.toLowerCase() === tokenAddress.toLowerCase());
    return asset ? asset.amount : "0";
  } catch (err) {
    console.error(`Error getting balance for ${tokenAddress}:`, err);
    return "0";
  }
}

// Wrapper for backward compatibility
async function getEURCBalance(walletId) {
  return getAssetBalance(walletId, EURC_CONTRACT_ADDRESS);
}

// ─── EURC Step: Fiat → EURC ────────────────────────────────
//
// When a user pays fiat via Stripe, the system converts the fiat
// amount to EUR-equivalent using LIVE exchange rates, then
// represents that as EURC on-chain before converting to PCC.
//
// The FX conversion (fiat → EUR) happens in rateConfig.js using
// real-time data from exchangerate-api.com.
// EURC → PCC is always 1:1.
//
// In production: integrate Circle's Cross-Chain Transfer Protocol
// (CCTP) or a liquidity pool to acquire real EURC from fiat.
// For this demo, we simulate the EURC minting step on-chain.

async function mintEURC(toAddress, amountEURC) {
  console.log(`  [EURC] Simulating fiat → EURC conversion: ${amountEURC} EURC → ${toAddress}`);

  if (!EURC_CONTRACT_ADDRESS) {
    // Demo mode: EURC contract not configured, log and proceed
    console.log(`  [EURC] EURC_CONTRACT_ADDRESS not set. Running in simulation mode.`);
    return `sim-eurc-tx-${Date.now()}`;
  }

  const amountWei = BigInt(Math.round(amountEURC * 1e6)); // EURC uses 6 decimals
  const res = await scpClient.createContractExecutionTransaction({
    walletId: ADMIN_WALLET_ID,
    contractAddress: EURC_CONTRACT_ADDRESS,
    abiFunctionSignature: "mint(address,uint256)",
    abiParameters: [toAddress, amountWei.toString()],
    feeLevel: "HIGH"
  });
  return res.data.id;
}

// ─── PCC Step: EURC → PCC ──────────────────────────────────
//
// Once EURC has been received, it is swapped 1:1 for PCC.
// In production: this would be an on-chain swap via a DEX or
// Circle's programmable wallets + smart contract logic.
// For this demo, we directly mint PCC (1 EURC = 1 PCC).

async function swapEURCtoPCC(toAddress, amountEURC) {
  const pccAmount = amountEURC; // 1:1 swap rate
  console.log(`  [SWAP] EURC → PCC conversion: ${amountEURC} EURC → ${pccAmount} PCC → ${toAddress}`);
  return mintPCC(toAddress, pccAmount);
}

// ─── PCC Minting (Direct) ──────────────────────────────────

async function mintPCC(toAddress, amountPCC) {
  if (IS_SIMULATION) {
    console.log(`  [SIM] Minting ${amountPCC} PCC to ${toAddress}`);
    return "sim-tx-" + uuidv4();
  }
  const amountWei = parseUnits(amountPCC.toString(), 18);
  const res = await scpClient.createContractExecutionTransaction({
    walletId: ADMIN_WALLET_ID,
    contractAddress: PCC_CONTRACT_ADDRESS,
    abiFunctionSignature: "mintTo(address,uint256)",
    abiParameters: [toAddress, amountWei.toString()],
    feeLevel: "HIGH"
  });
  return res.data.id;
}

// ─── PCC Transfer ──────────────────────────────────────────

// Direct transfer (requires gas in the FROM wallet - only works for admin/funded wallets)
async function transferPCC(fromWalletId, toAddress, amountPCC) {
  if (IS_SIMULATION) {
    console.log(`  [SIM] Transferring ${amountPCC} PCC to ${toAddress}`);
    return "sim-tx-" + uuidv4();
  }
  const amountWei = parseUnits(amountPCC.toString(), 18);
  const res = await scpClient.createContractExecutionTransaction({
    walletId: fromWalletId,
    contractAddress: PCC_CONTRACT_ADDRESS,
    abiFunctionSignature: "transfer(address,uint256)",
    abiParameters: [toAddress, amountWei.toString()],
    feeLevel: "HIGH"
  });
  return res.data.id;
}

/**
 * Gas Station Pattern - Admin-powered PCC transfer.
 * Instead of calling transfer() from the user's gasless wallet,
 * we burn PCC from the sender and mint PCC to the recipient,
 * both executed from the admin wallet (which has gas).
 *
 * This is the standard approach for gasless user experiences.
 */
async function gasStationTransferPCC(fromAddress, toAddress, amountPCC) {
  if (IS_SIMULATION) {
    console.log(`  [SIM] Gas Station Transfer: ${amountPCC} PCC from ${fromAddress} to ${toAddress}`);
    return "sim-gs-tx-" + uuidv4();
  }
  const amountWei = parseUnits(amountPCC.toString(), 18);

  // Step 1: Burn PCC from sender (admin-powered)
  console.log(`  [GAS-STATION] Burning ${amountPCC} PCC from ${fromAddress}`);
  const burnRes = await scpClient.createContractExecutionTransaction({
    walletId: ADMIN_WALLET_ID,
    contractAddress: PCC_CONTRACT_ADDRESS,
    abiFunctionSignature: "burnFrom(address,uint256)",
    abiParameters: [fromAddress, amountWei.toString()],
    feeLevel: "HIGH"
  });
  const burnTxId = burnRes.data.id;
  console.log(`  [GAS-STATION] Burn TX: ${burnTxId}`);

  // Wait for burn to confirm before minting
  const burnResult = await waitForTx(burnTxId);
  console.log(`  [GAS-STATION] Burn confirmed: ${burnResult.txHash}`);

  // Step 2: Mint PCC to recipient (admin-powered)
  console.log(`  [GAS-STATION] Minting ${amountPCC} PCC to ${toAddress}`);
  const mintTxId = await mintPCC(toAddress, amountPCC);
  console.log(`  [GAS-STATION] Mint TX: ${mintTxId}`);

  return mintTxId;
}

async function sweepAsset(fromWalletId, amount, tokenAddress) {
  if (!tokenAddress || !TREASURY_WALLET_ADDRESS) {
    throw new Error("Token address or Treasury address not configured.");
  }

  // Find decimals for this token
  let decimals = 6;
  const tokenEntry = Object.values(AMOY_TOKENS).find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
  if (tokenEntry) decimals = tokenEntry.decimals;

  const amountWei = BigInt(Math.round(amount * Math.pow(10, decimals)));
  const res = await scpClient.createContractExecutionTransaction({
    walletId: fromWalletId,
    contractAddress: tokenAddress,
    abiFunctionSignature: "transfer(address,uint256)",
    abiParameters: [TREASURY_WALLET_ADDRESS, amountWei.toString()],
    feeLevel: "HIGH"
  });
  return res.data.id;
}

// Wrapper for backward compatibility
async function sweepEURC(fromWalletId, amountEURC) {
  return sweepAsset(fromWalletId, amountEURC, EURC_CONTRACT_ADDRESS);
}

/**
 * High-level service function to handle an incoming Asset deposit (EURC or USDC).
 * Used by both manual verification and Circle webhooks.
 */
async function processIncomingAsset(userId, circleWalletId, amount, tokenAddress, externalId = null) {
  const db = require('./database');
  const rateConfig = require('./rateConfig');

  // 0. Idempotency Check (Prevent double-processing)
  if (externalId) {
    try {
      const existingTxs = await db.getAllTransactions();
      const alreadyProcessed = existingTxs.some(t => t.metadata && t.metadata.externalId === externalId);
      if (alreadyProcessed) {
        console.log(`[PROCESS] ⚠️ Skip: External ID ${externalId} already processed.`);
        return { alreadyProcessed: true };
      }
    } catch (checkErr) {
      console.warn(`[PROCESS] Idempotency check failed (proceeding anyway):`, checkErr.message);
    }
  }

  const tokenEntry = Object.entries(AMOY_TOKENS).find(([symbol, t]) => t.address.toLowerCase() === tokenAddress?.toLowerCase());
  const symbol = tokenEntry ? tokenEntry[0] : (tokenAddress === 'native' ? 'MATIC' : 'UNKNOWN');

  console.log(`[PROCESS] Automated processing for User ${userId}: ${amount} ${symbol} detected.`);

  const wallet = await db.getWalletByUserId(userId);
  if (!wallet) throw new Error("Wallet not found for user " + userId);

  // 1. Calculate how much PCC to mint
  let pccAmount = 0;
  if (symbol === 'EURC') {
    pccAmount = amount; // 1:1
  } else {
    // For all other cryptos (MATIC, USDC, USDT, etc.), convert to EUR-equivalent
    pccAmount = await rateConfig.convertCryptoToEUR(symbol, amount);
    console.log(`[PROCESS] FX Conversion: ${amount} ${symbol} → ${pccAmount.toFixed(2)} PCC (EUR-pegged)`);
  }

  if (pccAmount <= 0) {
    console.warn(`[PROCESS] PCC Amount is 0 or negative, skipping mint.`);
    return { error: 'invalid_amount' };
  }

  // 2. Sweep the original asset to Treasury
  const sweepTxId = await sweepAsset(circleWalletId, amount, tokenAddress);
  console.log(`[PROCESS] Sweep initiated (${symbol}): ${sweepTxId}`);

  // 3. Mint PCC to User
  const pccTxId = await mintPCC(wallet.walletAddress, pccAmount);
  console.log(`[PROCESS] PCC Mint initiated: ${pccTxId}`);

  // 4. Log transaction in DB
  const { v4: uuidv4 } = require('uuid');
  const txId = uuidv4();
  await db.createTransaction({
    id: txId,
    userId: userId,
    type: 'mint_crypto',
    amount: pccAmount,
    status: 'pending',
    txHash: pccTxId,
    metadata: { sweepTxId, asset: symbol, sourceAmount: amount, source: 'automated_detection', externalId },
    createdAt: new Date().toISOString()
  });

  // 5. Update Balance (Optimistic for demo)
  await db.updateBalance(userId, wallet.balance + pccAmount);

  // 6. Wait for confirmation in background
  waitForTx(pccTxId).then(async txData => {
    await db.updateTransactionStatus(txId, 'complete', txData.txHash);
    console.log(`[PROCESS] ✅ PCC Successfully minted for User ${userId}: ${pccAmount.toFixed(2)} PCC`);
  }).catch(async err => {
    await db.updateTransactionStatus(txId, 'failed');
    console.error(`[PROCESS] ❌ PCC Mint failed for User ${userId}:`, err);
  });

  return { sweepTxId, pccTxId, amount: pccAmount };
}

// Wrapper for backward compatibility
async function processIncomingEURC(userId, circleWalletId, amountEURC) {
  return processIncomingAsset(userId, circleWalletId, amountEURC, EURC_CONTRACT_ADDRESS);
}

// ─── TX Polling ─────────────────────────────────────────────

async function waitForTx(txId) {
  // Skip polling for simulation transactions
  if (txId && txId.startsWith('sim-')) {
    console.log(`  [TX] Simulation transaction ${txId} - skipping on-chain poll.`);
    return { txHash: txId, state: 'COMPLETE' };
  }

  let attempts = 0;
  const maxAttempts = 40; // 120 seconds total (40 × 3s) - testnet can be slow

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const res = await dcwClient.getTransaction({ id: txId });
      const tx = res.data.transaction;
      const status = tx.state;

      if (status === 'COMPLETE') {
        console.log(`  [TX] ✅ Confirmed after ${attempts * 3}s: ${tx.txHash}`);
        return tx;
      }
      if (status === 'FAILED') {
        throw new Error(`Transaction failed: ${JSON.stringify(tx.errorReason || tx.error || 'unknown')}`);
      }
      // QUEUED / SENT / INITIATED - keep polling
    } catch (err) {
      // If it's our own thrown error, rethrow
      if (err.message.startsWith('Transaction failed:')) throw err;
      // Network glitch - log and retry
      console.warn(`  [TX] Poll attempt ${attempts} error (will retry):`, err.message);
    }
    await delay(3000);
  }

  // Don't throw - return a special object so the caller can decide what to do
  console.warn(`  [TX] ⚠️ Transaction ${txId} still not confirmed after ${maxAttempts * 3}s.`);
  throw new Error(`Transaction ${txId} timed out after ${maxAttempts * 3}s. It may still confirm later - check Circle dashboard.`);
}

module.exports = {
  createFanWalletSet,
  createFanWallet,
  getBalance,
  getEURCBalance,
  getAssetBalance,
  mintEURC,
  swapEURCtoPCC,
  mintPCC,
  transferPCC,
  gasStationTransferPCC,
  sweepEURC,
  sweepAsset,
  processIncomingEURC,
  processIncomingAsset,
  waitForTx
};
