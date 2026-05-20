const { Client } = require('pg');
require('dotenv').config();

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DB_URL = `postgresql://postgres.yqwabzsggyqbmueoxjtp:${SERVICE_ROLE_KEY}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

async function run() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('Connected to DB');
    
    const res = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'betting_pools'
    `);
    console.log('Columns in betting_pools:');
    console.table(res.rows);

    const res2 = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bets'
    `);
    console.log('Columns in bets:');
    console.table(res2.rows);

    console.log('Reloading schema cache...');
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log('Reloaded.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}
run();
