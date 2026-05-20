const { Client } = require('pg');
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxd2FienNnZ3lxYm11ZW94anRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQzNzUxMiwiZXhwIjoyMDkzMDEzNTEyfQ.i31372KnJHNSkIIdxRUkfRqDcpE9a2G7zFNEcbmfU3A';
const connStr = `postgresql://postgres.yqwabzsggyqbmueoxjtp:${SERVICE_ROLE_KEY}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });

async function check() {
  await client.connect();
  try {
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'crypto_sessions';");
    console.log("COLUMNS for crypto_sessions:", res.rows.map(r => r.column_name));
    
    // Check if the table even exists
    if (res.rows.length === 0) {
      console.log("TABLE DOES NOT EXIST OR NO COLUMNS!");
    } else {
        // If it's just 'betAmount' instead of 'bet_amount', let's check
    }
  } catch(err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
check();
