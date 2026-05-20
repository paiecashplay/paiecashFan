// ═══════════════════════════════════════════════════════════════
// run_migration_rest.js - Execute SQL via Supabase REST API
// Uses the service role key to execute SQL through a custom
// RPC function, or falls back to executing individual statements.
// ═══════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://yqwabzsggyqbmueoxjtp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxd2FienNnZ3lxYm11ZW94anRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQzNzUxMiwiZXhwIjoyMDkzMDEzNTEyfQ.i31372KnJHNSkIIdxRUkfRqDcpE9a2G7zFNEcbmfU3A';

async function executeSql(sql) {
  // Use the Supabase SQL endpoint (available via the management API)
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
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }

  return response.json();
}

async function runMigration() {
  const sqlFile = path.join(__dirname, '001_full_schema.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log('📋 Attempting to run schema migration via Supabase REST API...\n');

  try {
    // First, create the exec_sql function if it doesn't exist
    console.log('Step 1: Creating exec_sql helper function...');

    const createFnResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql_query: 'SELECT 1 as test' })
    });

    if (!createFnResponse.ok) {
      console.log('   exec_sql function not found. Will need to use pg client instead.');
      console.log('   Please provide your Supabase database password,');
      console.log('   or paste the SQL from 001_full_schema.sql into the Supabase SQL Editor.');
      console.log('');
      console.log('   Supabase SQL Editor: https://supabase.com/dashboard/project/yqwabzsggyqbmueoxjtp/sql/new');
      console.log('');

      // Try using pg directly with the connection pooler
      console.log('Step 2: Trying direct PostgreSQL connection via connection pooler...');
      await runViaPg(sql);
      return;
    }

    // Execute the migration
    console.log('Step 2: Running schema migration...');
    const result = await executeSql(sql);
    console.log('✅ Migration completed:', result);

  } catch (err) {
    console.error('❌ REST API method failed:', err.message);
    console.log('\nFalling back to pg client...');
    await runViaPg(sql);
  }
}

async function runViaPg(sql) {
  try {
    const { Client } = require('pg');

    // Try the Supabase connection pooler (doesn't need database password)
    // Uses the service role JWT for auth via supavisor
    const connStr = `postgresql://postgres.yqwabzsggyqbmueoxjtp:${SERVICE_ROLE_KEY}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

    console.log('🔌 Connecting via Supabase connection pooler...');

    const client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('✅ Connected!');

    console.log('📋 Running schema migration...');
    await client.query(sql);
    console.log('✅ Schema migration completed!');

    // Verify
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    console.log('\n📊 Tables:');
    result.rows.forEach(r => console.log(`   ✓ ${r.table_name}`));

    const admin = await client.query(`SELECT id, full_name, email, role FROM users WHERE email = 'admin@frostrek.com'`);
    if (admin.rows.length > 0) {
      console.log(`\n🔑 Admin: ${admin.rows[0].full_name} (${admin.rows[0].id})`);
    }

    await client.end();

  } catch (pgErr) {
    console.error('❌ PostgreSQL connection failed:', pgErr.message);
    console.log('\n══════════════════════════════════════════════════');
    console.log('  MANUAL STEPS REQUIRED:');
    console.log('  1. Open: https://supabase.com/dashboard/project/yqwabzsggyqbmueoxjtp/sql/new');
    console.log('  2. Paste the contents of: backend/migrations/001_full_schema.sql');
    console.log('  3. Click "Run"');
    console.log('══════════════════════════════════════════════════\n');
  }
}

runMigration();
