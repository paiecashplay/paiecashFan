require('dotenv').config({ path: __dirname + '/.env' });
const fs = require('fs');
const path = require('path');

const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const url = process.env.SUPABASE_URL;
const ref = 'yqwabzsggyqbmueoxjtp';

async function runMigrationViaSupabase() {
  console.log('🔄 Running LOTO migration via Supabase SQL endpoint...\n');

  const sqlFile = fs.readFileSync(path.join(__dirname, 'migrations', '007_loto_game.sql'), 'utf8');

  // Split SQL to add NOTIFY at the end
  const sql = sqlFile + "\nNOTIFY pgrst, 'reload schema';\n";

  // Try using Supabase's internal SQL endpoint  
  // The dashboard uses this to run SQL queries
  const endpoints = [
    { name: 'SQL API v1', url: `${url}/rest/v1/rpc/exec_sql`, body: { query: sql } },
    { name: 'pg-meta query', url: `${url}/pg-meta/default/query`, body: { query: sql } },
    { name: 'pg query', url: `${url}/pg/query`, body: { query: sql } },
  ];

  for (const ep of endpoints) {
    try {
      const r = await fetch(ep.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': 'Bearer ' + key,
          'X-Connection-Encrypted': '1'
        },
        body: JSON.stringify(ep.body)
      });
      const text = await r.text();
      console.log(`${ep.name} → ${r.status}: ${text.slice(0, 300)}`);
      if (r.ok) {
        console.log('✅ Success!\n');
        break;
      }
    } catch (e) {
      console.log(`${ep.name} → Error: ${e.message}`);
    }
  }

  // Wait for PostgREST to process
  console.log('\n⏳ Waiting 5s for schema reload...');
  await new Promise(r => setTimeout(r, 5000));

  // Verify
  const check = await fetch(url + '/rest/v1/loto_rooms?limit=1', {
    headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
  });
  
  if (check.status === 200) {
    console.log('✅ loto_rooms is now accessible! Schema cache refreshed.');
  } else {
    const body = await check.text();
    console.log('❌ Still not accessible:', body.slice(0, 200));
    console.log('\n════════════════════════════════════════════');
    console.log('⚠️  You MUST run the migration manually:');
    console.log('════════════════════════════════════════════');
    console.log('1. Go to: https://supabase.com/dashboard/project/' + ref + '/sql');
    console.log('2. Paste the contents of: migrations/007_loto_game.sql');
    console.log('3. Click "Run"');
    console.log('4. Then run this SQL: NOTIFY pgrst, \'reload schema\';');
    console.log('5. Restart the backend: npm run dev');
    console.log('════════════════════════════════════════════');
  }
}

runMigrationViaSupabase();
