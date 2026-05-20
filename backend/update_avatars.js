const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const r1 = await supabase.from('chat_profiles').update({ avatar_url: 'https://i.pravatar.cc/250?img=11' }).ilike('username', '%Etot%');
  console.log(r1.error || 'Etot updated');
  const r2 = await supabase.from('chat_profiles').update({ avatar_url: 'https://i.pravatar.cc/250?img=33' }).ilike('username', '%Ankit%');
  console.log(r2.error || 'Ankit updated');
  const r3 = await supabase.from('chat_profiles').update({ avatar_url: 'https://i.pravatar.cc/250?img=11' }).ilike('username', '%constantin%');
  console.log(r3.error || 'Constantin updated');
}

run();
