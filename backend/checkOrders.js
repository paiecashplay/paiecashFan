const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: wallets, error: wError } = await supabase.from('wallets')
    .select('*')
    .eq('user_id', '957f5363-c01b-40af-aae1-080bae0b107e');

  console.log('Wallet Error:', wError);
  if (wallets) {
    wallets.forEach(w => {
      console.log(`Wallet: ${w.wallet_address} | Balance: ${w.pcc_balance}`);
    });
  }
}
check();
