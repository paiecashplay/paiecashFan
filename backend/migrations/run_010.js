// ═══════════════════════════════════════════════════════════════
// migrations/run_010.js - Run challenge sessions schema migration
// ═══════════════════════════════════════════════════════════════

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_URL = 'postgresql://postgres:Paiecashcoin@db.yqwabzsggyqbmueoxjtp.supabase.co:5432/postgres';

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '010_challenge_sessions.sql'), 'utf8');
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL');

    console.log('📋 Running challenge sessions schema migration...');
    await client.query(sql);
    console.log('✅ Challenge sessions migration completed!\n');

    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('challenge_sessions', 'challenge_score_updates')
      ORDER BY table_name
    `);
    console.log('📊 Tables created:');
    tables.rows.forEach(r => console.log(`   ✓ ${r.table_name}`));

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
