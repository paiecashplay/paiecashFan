const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function check() {
  console.log('🔍 Checking LOTO migration status via Supabase REST...\n');

  const lotoTables = ['loto_rooms', 'loto_players', 'loto_draws', 'loto_leaderboard', 'loto_game_history'];
  let found = 0;
  let missing = 0;

  for (const table of lotoTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table} - ${error.message}`);
        missing++;
      } else {
        console.log(`✅ ${table} - exists (${count ?? 0} rows)`);
        found++;
      }
    } catch (err) {
      console.log(`❌ ${table} - ${err.message}`);
      missing++;
    }
  }

  console.log(`\n────────────────────────────────`);
  if (missing === 0) {
    console.log(`✅ Migration COMPLETE - all ${found} tables exist`);
  } else if (found === 0) {
    console.log(`❌ Migration NOT RUN - 0/${lotoTables.length} tables found`);
    console.log(`\n📋 To run it: node migrations/run_007_loto.js`);
    console.log(`   Or paste migrations/007_loto_game.sql into Supabase SQL Editor`);
  } else {
    console.log(`⚠️  Migration PARTIAL - ${found}/${lotoTables.length} tables found`);
    console.log(`   Missing tables need re-migration`);
  }
}

check();
