const { Client } = require('pg');
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxd2FienNnZ3lxYm11ZW94anRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQzNzUxMiwiZXhwIjoyMDkzMDEzNTEyfQ.i31372KnJHNSkIIdxRUkfRqDcpE9a2G7zFNEcbmfU3A';
const DB_URL = `postgresql://postgres.yqwabzsggyqbmueoxjtp:${SERVICE_ROLE_KEY}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

async function run() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('Connected to DB via pooler');
    
    await client.query(`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;
    `);
    console.log('Added idempotency_key column');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tx_idempotency 
      ON transactions(idempotency_key);
    `);
    console.log('Added index');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}
run();
