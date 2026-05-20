const { createClient } = require('@supabase/supabase-js');
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const dcwClient = initiateDeveloperControlledWalletsClient({ 
    apiKey: process.env.CIRCLE_API_KEY, 
    entitySecret: process.env.CIRCLE_ENTITY_SECRET 
});

async function check() {
    const userId = '957f5363-c01b-40af-aae1-080bae0b107e';
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
    
    if (!wallet) {
        console.log("No wallet found in DB");
        return;
    }

    console.log(`Checking Circle for Wallet ID: ${wallet.circle_wallet_id} (${wallet.wallet_address})`);
    
    try {
        const res = await dcwClient.getWalletTokenBalance({ id: wallet.circle_wallet_id });
        console.log("Circle Token Balances:");
        console.log(JSON.stringify(res.data.tokenBalances, null, 2));
        
        const pccAddr = process.env.PCC_CONTRACT_ADDRESS.toLowerCase();
        const pcc = res.data.tokenBalances.find(b => b.token.address?.toLowerCase() === pccAddr);
        console.log(`\nTarget PCC Address: ${pccAddr}`);
        console.log(`Found PCC in Circle list: ${!!pcc}`);
        if (pcc) console.log(`PCC Balance: ${pcc.amount}`);
    } catch (err) {
        console.error("Circle API Error:", err.message);
    }
}

check();
