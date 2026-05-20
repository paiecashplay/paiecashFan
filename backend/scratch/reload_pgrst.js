require('dotenv').config();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const url = process.env.SUPABASE_URL;

async function reload() {
  console.log('🔄 Reloading Supabase schema cache...');
  
  const sql = "NOTIFY pgrst, 'reload schema';";
  
  // Try pg-meta query endpoint which is often available in Supabase local/hosted
  const endpoints = [
    { name: 'SQL API', url: `${url}/rest/v1/rpc/exec_sql`, body: { query: sql } },
  ];

  for (const ep of endpoints) {
    try {
      const r = await fetch(ep.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': 'Bearer ' + key
        },
        body: JSON.stringify(ep.body)
      });
      const text = await r.text();
      console.log(`${ep.name} → ${r.status}: ${text}`);
    } catch (e) {
      console.log(`${ep.name} → Error: ${e.message}`);
    }
  }
}

reload();
