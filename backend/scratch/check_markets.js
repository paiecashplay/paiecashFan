const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('Testing betting_markets...');
  const { data: m, error: me } = await supabase.from('betting_markets').select('*').limit(1);
  if (me) console.log('betting_markets error:', me.message);
  else {
    console.log('betting_markets success, row count:', m.length);
    if (m.length > 0) console.log('Sample market:', JSON.stringify(m[0], null, 2));
  }
}

check();
