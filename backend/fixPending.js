require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
  const { data, error } = await supabase
    .from('transactions')
    .update({ internal_status: 'complete' })
    .in('internal_status', ['pending', 'processing']);
  console.log('Fixed:', data, error);
}
fix();
