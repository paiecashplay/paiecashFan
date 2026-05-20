const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addColumn() {
  console.log('Adding pcc_balance column via Supabase REST API...');
  
  // Try using Supabase's rpc to run raw SQL
  const { data, error } = await supabase.rpc('exec_sql', {
    query: "ALTER TABLE wallets ADD COLUMN IF NOT EXISTS pcc_balance double precision DEFAULT 0;"
  });
  
  if (error) {
    console.log('RPC approach failed:', error.message);
    console.log('\nTrying alternative: using the Supabase Management API...');
    
    // Alternative: use fetch to hit the Supabase SQL editor endpoint
    const url = `${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`;
    console.log('This requires a custom RPC function. Let me try direct REST approach...');
    
    // Let's try a different approach - just update a row with the new field
    // Supabase will auto-create columns if using upsert... actually no it won't.
    
    console.log('\n═══════════════════════════════════════════');
    console.log('  MANUAL STEP REQUIRED');
    console.log('═══════════════════════════════════════════');
    console.log('\nPlease run this SQL in your Supabase Dashboard → SQL Editor:\n');
    console.log('  ALTER TABLE wallets ADD COLUMN IF NOT EXISTS pcc_balance double precision DEFAULT 0;');
    console.log('  UPDATE wallets SET pcc_balance = 0 WHERE pcc_balance IS NULL;');
    console.log('\nAlternatively, go to Table Editor → wallets → Add Column:');
    console.log('  Name: pcc_balance');
    console.log('  Type: float8');
    console.log('  Default: 0');
    
    // Let's also try using the PostgREST approach via management API
    try {
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      });
      console.log('\nSupabase REST API is reachable:', response.status);
    } catch (e) {
      console.log('Cannot reach Supabase REST API:', e.message);
    }
  } else {
    console.log('✅ Column added successfully!', data);
  }
}

addColumn();
