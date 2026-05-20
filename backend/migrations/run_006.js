// ═══════════════════════════════════════════════════════════════
// NOTE: Run this SQL manually in Supabase Dashboard > SQL Editor
// File: migrations/006_betting_system.sql
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '006_betting_system.sql'), 'utf8');
  const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { query: stmt });
      if (error) console.error('Statement error (may be harmless):', error.message);
      else console.log('OK:', stmt.slice(0, 60));
    } catch (e) {
      console.warn('RPC not available - run SQL manually in Supabase Dashboard');
      break;
    }
  }
  console.log('Migration 006 complete');
}
run();
