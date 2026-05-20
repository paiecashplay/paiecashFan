const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.from('betting_games').select('count', { count: 'exact', head: true });
  if (error) {
    console.log('betting_games missing:', error.message);
  } else {
    console.log('betting_games exists');
  }

  const { data: data2, error: error2 } = await supabase.from('betting_pools').select('count', { count: 'exact', head: true });
  if (error2) {
    console.log('betting_pools missing:', error2.message);
  } else {
    console.log('betting_pools exists');
  }
}

check();
