require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('transactions').select('id, internal_status');
  console.log('Pending count:', data ? data.filter(d => d.internal_status === 'pending').length : 0);
  console.log('Complete count:', data ? data.filter(d => d.internal_status === 'complete').length : 0);
  if (error) console.error(error);
}
check();
