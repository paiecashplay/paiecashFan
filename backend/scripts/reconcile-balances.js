// Script to add pcc_balance column to wallets table if it doesn't exist,
// and reconcile all pending transactions + sync balances.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function ensurePccBalanceColumn() {
  console.log('Step 1: Checking if pcc_balance column exists...');

  // Try to read a wallet row to see if pcc_balance column exists
  const { data, error } = await supabase.from('wallets').select('pcc_balance').limit(1);

  if (error && error.message.includes('pcc_balance')) {
    console.log('  Column pcc_balance does NOT exist. Adding it...');
    // We can't run raw SQL via Supabase JS client directly, so we'll add the column via RPC or the dashboard.
    // For now, let's try to update a row and see what happens.
    console.log('  ⚠️  You need to add this column manually in Supabase Dashboard:');
    console.log('     Go to Table Editor → wallets → Add Column:');
    console.log('       Name: pcc_balance');
    console.log('       Type: float8 (double precision)');
    console.log('       Default: 0');
    console.log('       Nullable: true');
    return false;
  } else {
    console.log('  ✅ Column pcc_balance already exists.');
    return true;
  }
}

async function initializeBalances() {
  console.log('\nStep 2: Initializing pcc_balance for all wallets that have NULL...');

  const { data: wallets, error } = await supabase
    .from('wallets')
    .select('id, user_id, pcc_balance')
    .is('pcc_balance', null);

  if (error) {
    console.log('  Error fetching wallets:', error.message);
    return;
  }

  if (!wallets || wallets.length === 0) {
    console.log('  All wallets already have pcc_balance set.');
    return;
  }

  for (const w of wallets) {
    const { error: updateErr } = await supabase
      .from('wallets')
      .update({ pcc_balance: 0 })
      .eq('id', w.id);

    if (updateErr) {
      console.log(`  ❌ Failed to update wallet ${w.id}: ${updateErr.message}`);
    } else {
      console.log(`  ✅ Initialized wallet ${w.id} (user ${w.user_id}) to 0`);
    }
  }
}

async function reconcileCompletedTransactions() {
  console.log('\nStep 3: Reconciling completed mint transactions with wallet balances...');

  // Get all completed mint transactions
  const { data: txs, error } = await supabase
    .from('transactions')
    .select('user_id, pcc_amount, internal_status, type')
    .eq('type', 'mint')
    .in('internal_status', ['complete', 'success']);

  if (error) {
    console.log('  Error fetching transactions:', error.message);
    return;
  }

  // Sum up completed mints per user
  const userMints = {};
  (txs || []).forEach(tx => {
    const uid = tx.user_id;
    userMints[uid] = (userMints[uid] || 0) + (parseFloat(tx.pcc_amount) || 0);
  });

  // Also subtract completed spends
  const { data: spendTxs } = await supabase
    .from('transactions')
    .select('user_id, pcc_amount, internal_status, type')
    .eq('type', 'spend')
    .in('internal_status', ['complete', 'success']);

  (spendTxs || []).forEach(tx => {
    const uid = tx.user_id;
    userMints[uid] = (userMints[uid] || 0) - (parseFloat(tx.pcc_amount) || 0);
  });

  console.log(`  Found mints/spends for ${Object.keys(userMints).length} users.`);

  for (const [userId, totalBalance] of Object.entries(userMints)) {
    const balance = Math.max(0, totalBalance);
    const { error: updateErr } = await supabase
      .from('wallets')
      .update({ pcc_balance: balance })
      .eq('user_id', userId);

    if (updateErr) {
      console.log(`  ❌ Failed to update user ${userId}: ${updateErr.message}`);
    } else {
      console.log(`  ✅ User ${userId}: pcc_balance = ${balance}`);
    }
  }
}

async function showPendingTransactions() {
  console.log('\nStep 4: Checking remaining pending transactions...');

  const { data: pending, error } = await supabase
    .from('transactions')
    .select('id, user_id, pcc_amount, internal_status, tx_hash, type')
    .eq('internal_status', 'pending');

  if (error) {
    console.log('  Error:', error.message);
    return;
  }

  if (!pending || pending.length === 0) {
    console.log('  ✅ No pending transactions. All clear!');
    return;
  }

  console.log(`  ⚠️  Found ${pending.length} pending transactions:`);
  pending.forEach(tx => {
    console.log(`    - ${tx.id} | User: ${tx.user_id} | Type: ${tx.type} | Amount: ${tx.pcc_amount} | Hash: ${tx.tx_hash || 'none'}`);
  });
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  PaieCash Balance Reconciliation Tool');
  console.log('═══════════════════════════════════════════\n');

  const columnExists = await ensurePccBalanceColumn();

  if (!columnExists) {
    console.log('\n❌ Cannot proceed without pcc_balance column. Please add it in Supabase Dashboard first.');
    process.exit(1);
  }

  await initializeBalances();
  await reconcileCompletedTransactions();
  await showPendingTransactions();

  console.log('\n═══════════════════════════════════════════');
  console.log('  Reconciliation Complete!');
  console.log('═══════════════════════════════════════════');
}

main().catch(console.error);
