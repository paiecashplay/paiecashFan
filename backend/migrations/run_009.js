// ═══════════════════════════════════════════════════════════════
// migrations/run_009.js - Run match discussions schema migration
// ═══════════════════════════════════════════════════════════════

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_URL = 'postgresql://postgres:Paiecashcoin@db.yqwabzsggyqbmueoxjtp.supabase.co:5432/postgres';

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '009_match_discussions.sql'), 'utf8');
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL');

    console.log('📋 Running match discussions schema migration...');
    await client.query(sql);
    console.log('✅ Match discussions migration completed!\n');

    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('match_rooms', 'match_messages', 'game_challenges')
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
