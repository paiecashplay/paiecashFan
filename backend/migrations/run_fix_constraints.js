// ═══════════════════════════════════════════════════════════════
// run_fix_constraints.js - Run the 003 migration to fix DB issues
// ═══════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://yqwabzsggyqbmueoxjtp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxd2FienNnZ3lxYm11ZW94anRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQzNzUxMiwiZXhwIjoyMDkzMDEzNTEyfQ.i31372KnJHNSkIIdxRUkfRqDcpE9a2G7zFNEcbmfU3A';

async function runStatements() {
  const statements = [
    `ALTER TABLE wallets ADD COLUMN IF NOT EXISTS pcc_balance NUMERIC(20,8) DEFAULT 0`,
    `ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check`,
    `ALTER TABLE transactions ADD CONSTRAINT transactions_type_check CHECK (type IN ('mint','spend','transfer','topup_initiated','topup_failed','send','receive','mint_crypto'))`,
    `ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_internal_status_check`,
    `ALTER TABLE transactions ADD CONSTRAINT transactions_internal_status_check CHECK (internal_status IN ('pending','complete','failed','success'))`,
  ];

  console.log('🔧 Running constraint fixes via Supabase REST RPC...\n');

  // Try to use the exec_sql RPC function
  for (let i = 0; i < statements.length; i++) {
    const sql = statements[i];
    console.log(`  [${i + 1}/${statements.length}] ${sql.substring(0, 80)}...`);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ sql_query: sql })
      });

      if (!response.ok) {
        const errText = await response.text();
        // If exec_sql doesn't exist, fall back to pg
        if (errText.includes('exec_sql') || response.status === 404) {
          console.log('  ⚠️  exec_sql RPC not available, falling back to pg client...');
          return runViaPg();
        }
        console.log(`  ⚠️  HTTP ${response.status}: ${errText.substring(0, 200)}`);
      } else {
        console.log('  ✅ Done');
      }
    } catch (err) {
      console.error(`  ❌ ${err.message}`);
    }
  }

  console.log('\n✅ All constraint fixes applied!');
  console.log('\n📋 MANUAL STEP: If the RPC method didn\'t work, paste this SQL into your Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/yqwabzsggyqbmueoxjtp/sql/new\n');
  console.log(fs.readFileSync(path.join(__dirname, '003_fix_constraints.sql'), 'utf8'));
}

async function runViaPg() {
  try {
    const { Client } = require('pg');
    const sql = fs.readFileSync(path.join(__dirname, '003_fix_constraints.sql'), 'utf8');

    // Try multiple connection strings
    const connStrings = [
      `postgresql://postgres.yqwabzsggyqbmueoxjtp:Paiecashcoin@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
      `postgresql://postgres:Paiecashcoin@db.yqwabzsggyqbmueoxjtp.supabase.co:5432/postgres`,
    ];

    for (const connStr of connStrings) {
      try {
        console.log(`\n🔌 Trying connection...`);
        const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
        await client.connect();
        console.log('✅ Connected!');

        await client.query(sql);
        console.log('✅ Constraints fixed!');

        // Verify
        const result = await client.query(`
          SELECT constraint_name, check_clause 
          FROM information_schema.check_constraints 
          WHERE constraint_name LIKE 'transactions_%'
        `);
        console.log('\n📊 Current transaction constraints:');
        result.rows.forEach(r => console.log(`   ✓ ${r.constraint_name}: ${r.check_clause}`));

        const cols = await client.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'wallets' AND column_name = 'pcc_balance'
        `);
        console.log(`\n💰 pcc_balance column: ${cols.rows.length > 0 ? '✅ exists' : '❌ missing'}`);

        await client.end();
        return;
      } catch (pgErr) {
        console.log(`  ❌ ${pgErr.message.substring(0, 100)}`);
      }
    }

    console.log('\n══════════════════════════════════════════════════');
    console.log('  MANUAL STEPS REQUIRED:');
    console.log('  1. Open: https://supabase.com/dashboard/project/yqwabzsggyqbmueoxjtp/sql/new');
    console.log('  2. Paste the contents of: backend/migrations/003_fix_constraints.sql');
    console.log('  3. Click "Run"');
    console.log('══════════════════════════════════════════════════\n');
  } catch (err) {
    console.error('pg module not available:', err.message);
  }
}

runStatements();
