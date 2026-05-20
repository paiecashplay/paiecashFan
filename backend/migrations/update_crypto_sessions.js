const { Client } = require('pg');
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxd2FienNnZ3lxYm11ZW94anRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQzNzUxMiwiZXhwIjoyMDkzMDEzNTEyfQ.i31372KnJHNSkIIdxRUkfRqDcpE9a2G7zFNEcbmfU3A';
const connStr = `postgresql://postgres.yqwabzsggyqbmueoxjtp:${SERVICE_ROLE_KEY}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;
const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    await client.connect();
    console.log('Connected!');
    
    // Check columns
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'crypto_sessions';");
    const cols = res.rows.map(r => r.column_name);
    console.log('Existing columns:', cols);
    
    // Add columns if missing
    if (!cols.includes('balance_before')) {
      await client.query('ALTER TABLE crypto_sessions ADD COLUMN balance_before numeric DEFAULT 0;');
      console.log('Added balance_before');
    }
    if (!cols.includes('balance_after')) {
      await client.query('ALTER TABLE crypto_sessions ADD COLUMN balance_after numeric DEFAULT 0;');
      console.log('Added balance_after');
    }
    
    await client.query('NOTIFY pgrst, reload_schema;');
    console.log('Reloaded PostgREST schema cache!');
  } catch(err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
