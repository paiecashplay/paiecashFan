const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:Paiecashcoin@db.yqwabzsggyqbmueoxjtp.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅ Connected to DB');
    
    const { rows: users } = await client.query('SELECT id, full_name, email FROM users');
    
    let count = 0;
    for (const user of users) {
      // Sanitize username
      let username = user.full_name || user.email.split('@')[0] || `user_${user.id.substring(0, 6)}`;
      username = username.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 20);
      if (username.length < 3) {
        username = username + '_user';
      }
      
      await client.query(
        `INSERT INTO chat_profiles (user_id, username) 
         VALUES ($1, $2) 
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id, username]
      );
      count++;
    }
    
    console.log(`✅ Backfilled ${count} users into chat_profiles`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
