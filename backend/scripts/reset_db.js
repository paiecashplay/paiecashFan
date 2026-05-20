const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Construct DB URL from Supabase info or use a direct one if available
// Based on run_migration.js: postgresql://postgres:Paiecashcoin@db.yqwabzsggyqbmueoxjtp.supabase.co:5432/postgres
const DB_URL = 'postgresql://postgres:Paiecashcoin@db.yqwabzsggyqbmueoxjtp.supabase.co:5432/postgres';

async function reset() {
  const sqlPath = path.join(__dirname, '..', 'migrations', '000_full_unified_schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('❌ Migration file not found:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

  try {
    console.log('🔗 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected.');

    console.log('⚠️ DROPPING ALL TABLES AND APPLYING UNIFIED SCHEMA...');
    await client.query(sql);
    console.log('✅ Schema reset and applied successfully!');

    // Verify tables
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name
    `);
    console.log('\n📊 Current Tables:');
    tables.rows.forEach(r => console.log(`   ✓ ${r.table_name}`));

    // Seed Super Admin
    console.log('\n👤 Seeding Super Admin...');
    await client.query(`
      INSERT INTO users (full_name, email, role, is_active)
      VALUES ('PaieCash Admin', 'admin@paiecashcoin.com', 'frostrek_admin', TRUE)
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('✅ Super Admin seeded.');

  } catch (err) {
    console.error('❌ Reset failed:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
  } finally {
    await client.end();
    console.log('\n👋 Done.');
  }
}

reset();
