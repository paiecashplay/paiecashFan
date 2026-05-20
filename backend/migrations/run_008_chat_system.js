const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_URL = 'postgresql://postgres:Paiecashcoin@db.yqwabzsggyqbmueoxjtp.supabase.co:5432/postgres';

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '008_chat_system.sql'), 'utf8');
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL');
    
    console.log('📋 Running chat schema migration...');
    await client.query(sql);
    console.log('✅ Schema migration completed!\n');

    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log('✅ Triggered schema cache reload!\n');
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
