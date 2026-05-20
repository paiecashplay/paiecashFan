const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('Testing betting_games...');
  const { data: g, error: ge } = await supabase.from('betting_games').select('*').limit(1);
  if (ge) console.log('betting_games error:', ge.message);
  else console.log('betting_games success, row count:', g.length);

  console.log('Testing betting_pools...');
  const { data: p, error: pe } = await supabase.from('betting_pools').select('*').limit(1);
  if (pe) console.log('betting_pools error:', pe.message);
  else console.log('betting_pools success, row count:', p.length);
}

check();
