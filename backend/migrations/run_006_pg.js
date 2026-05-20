const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_URL = 'postgresql://postgres:Paiecashcoin@db.yqwabzsggyqbmueoxjtp.supabase.co:5432/postgres';

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '006_betting_system.sql'), 'utf8');
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL');
    
    console.log('📋 Running betting schema migration...');
    await client.query(sql);
    console.log('✅ Schema migration completed!\n');

    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE '%betting%' OR table_name = 'league_configs' ORDER BY table_name
    `);
    console.log('📊 Tables checked/created:');
    tables.rows.forEach(r => console.log(`   ✓ ${r.table_name}`));
    
    const leagues = await client.query(`SELECT * FROM league_configs`);
    console.log(`Leagues inserted: ${leagues.rows.length}`);

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
