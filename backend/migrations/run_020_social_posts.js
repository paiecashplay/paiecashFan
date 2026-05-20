const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_URL = 'postgresql://postgres:Paiecashcoin@db.yqwabzsggyqbmueoxjtp.supabase.co:5432/postgres';

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '020_social_posts.sql'), 'utf8');
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL');
    
    console.log('📋 Running social posts schema migration...');
    await client.query(sql);
    console.log('✅ Social posts schema migration completed!\n');

    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log('✅ Triggered schema cache reload!\n');
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
