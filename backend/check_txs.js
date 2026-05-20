const { Client } = require('pg');
const DB_URL = 'postgresql://postgres:Paiecashcoin@db.yqwabzsggyqbmueoxjtp.supabase.co:5432/postgres';
async function check() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query('SELECT * FROM betting_transactions ORDER BY created_at DESC LIMIT 10');
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
check();
