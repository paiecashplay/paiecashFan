const fs = require('fs');
const SUPABASE_URL = 'https://yqwabzsggyqbmueoxjtp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxd2FienNnZ3lxYm11ZW94anRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQzNzUxMiwiZXhwIjoyMDkzMDEzNTEyfQ.i31372KnJHNSkIIdxRUkfRqDcpE9a2G7zFNEcbmfU3A';

async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ sql_query: sql })
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }
  
  return response.json();
}

async function run() {
  try {
    const sql = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='crypto_sessions' AND column_name='balance_before') THEN
          ALTER TABLE crypto_sessions ADD COLUMN balance_before numeric DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='crypto_sessions' AND column_name='balance_after') THEN
          ALTER TABLE crypto_sessions ADD COLUMN balance_after numeric DEFAULT 0;
        END IF;
      END $$;
      NOTIFY pgrst, reload_schema;
    `;
    console.log('Adding missing columns and reloading schema...');
    await executeSql(sql);
    console.log('✅ Done!');
  } catch (err) {
    console.error(err);
  }
}

run();
