const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_URL = 'postgresql://postgres:Paiecashcoin@db.yqwabzsggyqbmueoxjtp.supabase.co:5432/postgres';

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '001_full_schema.sql'), 'utf8');
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL');
    
    console.log('📋 Running full schema migration...');
    await client.query(sql);
    console.log('✅ Schema migration completed!\n');

    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name
    `);
    console.log('📊 Tables created:');
    tables.rows.forEach(r => console.log(`   ✓ ${r.table_name}`));

    const admin = await client.query(`SELECT id, full_name, email, role FROM users WHERE email = 'admin@frostrek.com'`);
    if (admin.rows.length > 0) {
      console.log(`\n🔑 Admin seeded: ${admin.rows[0].full_name} (${admin.rows[0].id})`);
    }

    // Verify indexes
    const indexes = await client.query(`
      SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname
    `);
    console.log(`\n📇 Indexes created: ${indexes.rows.length}`);

    // Verify triggers
    const triggers = await client.query(`
      SELECT trigger_name, event_object_table FROM information_schema.triggers 
      WHERE trigger_schema = 'public' ORDER BY trigger_name
    `);
    console.log(`⚡ Triggers created: ${triggers.rows.length}`);
    triggers.rows.forEach(t => console.log(`   ✓ ${t.trigger_name} → ${t.event_object_table}`));

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
