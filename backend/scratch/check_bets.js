const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('Testing bets...');
  const { data: b, error: be } = await supabase.from('bets').select('*').limit(1);
  if (be) console.log('bets error:', be.message);
  else {
    console.log('bets success, row count:', b.length);
    if (b.length > 0) console.log('Columns:', Object.keys(b[0]));
  }
}

check();
