// ═══════════════════════════════════════════════════════════════
// migrations/seed_match_rooms.js - Insert 3 demo match rooms
// ═══════════════════════════════════════════════════════════════

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const supabase = require('../db/supabase');

const now = new Date();
const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

const DEMO_ROOMS = [
  { match_id: 'm1', team_a: 'CSK', team_b: 'MI', team_a_slug: 'csk', team_b_slug: 'mi', status: 'live', match_minute: 90, score_a: 142, score_b: 178, kick_off_time: new Date(now.getTime() - 90 * 60 * 1000).toISOString() },
  { match_id: 'm2', team_a: 'Scorchers', team_b: 'Sixers', team_a_slug: 'scorchers', team_b_slug: 'sixers', status: 'live', match_minute: 50, score_a: 74, score_b: 165, kick_off_time: new Date(now.getTime() - 50 * 60 * 1000).toISOString() },
  { match_id: 'm3', team_a: 'Australia', team_b: 'England', team_a_slug: 'australia', team_b_slug: 'england', status: 'live', match_minute: 120, score_a: 210, score_b: 315, kick_off_time: new Date(now.getTime() - 120 * 60 * 1000).toISOString() },
  { match_id: 'm4', team_a: 'Real Madrid', team_b: 'Man City', team_a_slug: 'realmadrid', team_b_slug: 'mancity', status: 'live', match_minute: 65, score_a: 2, score_b: 1, kick_off_time: new Date(now.getTime() - 65 * 60 * 1000).toISOString() },
  { match_id: 'm5', team_a: 'Arsenal', team_b: 'Chelsea', team_a_slug: 'arsenal', team_b_slug: 'chelsea', status: 'live', match_minute: 12, score_a: 1, score_b: 0, kick_off_time: new Date(now.getTime() - 12 * 60 * 1000).toISOString() },
  { match_id: 'm5b', team_a: 'Juventus', team_b: 'AC Milan', team_a_slug: 'juventus', team_b_slug: 'acmilan', status: 'live', match_minute: 45, score_a: 0, score_b: 0, kick_off_time: new Date(now.getTime() - 45 * 60 * 1000).toISOString() },
  { match_id: 'm6', team_a: 'Barcelona', team_b: 'Sevilla', team_a_slug: 'barcelona', team_b_slug: 'sevilla', status: 'live', match_minute: 88, score_a: 3, score_b: 1, kick_off_time: new Date(now.getTime() - 88 * 60 * 1000).toISOString() },
  { match_id: 'm7', team_a: 'Lakers', team_b: 'Celtics', team_a_slug: 'lakers', team_b_slug: 'celtics', status: 'live', match_minute: 46, score_a: 105, score_b: 102, kick_off_time: new Date(now.getTime() - 120 * 60 * 1000).toISOString() },
  { match_id: 'm8', team_a: 'Warriors', team_b: 'Bulls', team_a_slug: 'warriors', team_b_slug: 'bulls', status: 'live', match_minute: 36, score_a: 84, score_b: 78, kick_off_time: new Date(now.getTime() - 90 * 60 * 1000).toISOString() },
  { match_id: 'm8b', team_a: 'Real Madrid Baloncesto', team_b: 'Olympiacos', team_a_slug: 'realmadridb', team_b_slug: 'olympiacos', status: 'live', match_minute: 12, score_a: 14, score_b: 10, kick_off_time: new Date(now.getTime() - 15 * 60 * 1000).toISOString() },
  { match_id: 'm9', team_a: 'Alcaraz', team_b: 'Djokovic', team_a_slug: 'alcaraz', team_b_slug: 'djokovic', status: 'live', match_minute: 45, score_a: 1, score_b: 0, kick_off_time: new Date(now.getTime() - 45 * 60 * 1000).toISOString() },
  { match_id: 'm10', team_a: 'Sinner', team_b: 'Medvedev', team_a_slug: 'sinner', team_b_slug: 'medvedev', status: 'live', match_minute: 10, score_a: 0, score_b: 0, kick_off_time: new Date(now.getTime() - 10 * 60 * 1000).toISOString() },
];

async function seed() {
  console.log('🌱 Seeding demo match rooms...\n');

  for (const room of DEMO_ROOMS) {
    // Check if already exists by match_id
    const { data: existing } = await supabase
      .from('match_rooms')
      .select('id')
      .eq('match_id', room.match_id)
      .maybeSingle();

    if (existing) {
      console.log(`⏭ Already exists: ${room.team_a} vs ${room.team_b} (id: ${existing.id})`);
      continue;
    }

    const { data, error } = await supabase
      .from('match_rooms')
      .insert(room)
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to seed "${room.team_a} vs ${room.team_b}":`, error.message);
    } else {
      console.log(`✅ ${room.team_a} vs ${room.team_b} - [${room.status.toUpperCase()}] (id: ${data.id})`);
    }
  }

  console.log('\n✅ Seed complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
