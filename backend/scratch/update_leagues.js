const { Client } = require('pg');
const DB_URL = 'postgresql://postgres:Paiecashcoin@db.yqwabzsggyqbmueoxjtp.supabase.co:5432/postgres';

async function updateLeagues() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('Connected to DB');

    // Update IDs for TheSportsDB
    const updates = [
      { name: 'Premier League', oldId: 39, newId: 4328 },
      { name: 'La Liga', oldId: 140, newId: 4335 },
      { name: 'Bundesliga', oldId: 78, newId: 4331 },
      { name: 'Serie A', oldId: 135, newId: 4332 }
    ];

    for (const up of updates) {
      await client.query(
        'UPDATE league_configs SET league_id = $1, is_active = TRUE, betting_enabled = TRUE WHERE league_name = $2',
        [up.newId, up.name]
      );
      console.log(`Updated ${up.name} to ID ${up.newId}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

updateLeagues();
