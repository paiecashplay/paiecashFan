const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log('🌱 Starting Database Seeding...\n');

  try {
    // 1. Seed Demo User
    const demoUserId = uuidv4();
    const demoEmail = 'test@test.com';
    
    console.log(`1️⃣ Creating demo user: ${demoEmail}`);
    const { data: existingUser } = await supabase.from('users').select('*').eq('email', demoEmail).single();
    
    let userId;
    if (!existingUser) {
      await supabase.from('users').insert({
        id: demoUserId,
        email: demoEmail,
        full_name: 'Demo User',
        role: 'fan',
        created_at: new Date().toISOString()
      });
      userId = demoUserId;
      
      await supabase.from('wallets').insert({
        id: uuidv4(),
        user_id: userId,
        circle_wallet_id: uuidv4(),
        wallet_address: '0x' + Math.random().toString(16).slice(2, 42),
        pcc_balance: 5000,
        created_at: new Date().toISOString()
      });
    } else {
      userId = existingUser.id;
      console.log('   User already exists, skipping.');
    }

    // 2. Seed Clubs (Tenants)
    console.log('\n2️⃣ Creating Demo Clubs (Tenants)...');
    const clubs = [
      { id: uuidv4(), name: 'FC Thunder', sport: 'Football', country: 'UK' },
      { id: uuidv4(), name: 'Metro Basketball', sport: 'Basketball', country: 'USA' },
      { id: uuidv4(), name: 'Speed Racing Team', sport: 'Motorsport', country: 'Italy' }
    ];

    for (const c of clubs) {
      await supabase.from('tenants').insert({
        id: c.id,
        club_name: c.name,
        sport: c.sport,
        country: c.country,
        profile: { verified: true, tagline: `Official store of ${c.name}` },
        status: 'active'
      });
    }
    const tenantId = clubs[0].id; // Use first club for products

    // 3. Seed Products
    console.log('\n3️⃣ Creating Products for FC Thunder...');
    const products = [
      { id: uuidv4(), tenant_id: tenantId, name: 'Home Jersey 2026', description: 'Official Match Kit', price_pcc: 1500, stock: 100 },
      { id: uuidv4(), tenant_id: tenantId, name: 'VIP Match Ticket', description: 'Access to VIP Lounge', price_pcc: 5000, stock: 50 },
      { id: uuidv4(), tenant_id: tenantId, name: 'Signed Cap', description: 'Signed by team captain', price_pcc: 800, stock: 200 }
    ];
    await supabase.from('products').insert(products);

    // 4. Seed Contests (Gaming)
    console.log('\n4️⃣ Creating Gaming Contests...');
    await supabase.from('contests').insert([
      { id: uuidv4(), title: 'Weekend Fantasy League', description: 'Build your ultimate team for the weekend matches.', contest_type: 'fantasy', sport: 'Football', status: 'live', entry_fee_pcc: 100, prize_pool_pcc: 25000, max_entries: 500, current_entries: 120, start_time: new Date().toISOString(), end_time: new Date(Date.now() + 86400000).toISOString() },
      { id: uuidv4(), title: 'Derby Day Prediction', description: 'Predict the exact score of the rivalry match.', contest_type: 'prediction', sport: 'Football', status: 'upcoming', entry_fee_pcc: 0, prize_pool_pcc: 5000, max_entries: 1000, current_entries: 450, start_time: new Date(Date.now() + 172800000).toISOString(), end_time: new Date(Date.now() + 259200000).toISOString() }
    ]);

    // 5. Seed Betting Pools
    console.log('\n5️⃣ Creating Betting Pools...');
    await supabase.from('pools').insert([
      { id: uuidv4(), title: 'FC Thunder vs Royals - Winner', event_type: 'Match Outcome', sport: 'Football', status: 'open', total_pool_pcc: 14500, options: ['FC Thunder', 'Draw', 'Royals'] },
      { id: uuidv4(), title: 'First Goalscorer', event_type: 'Player Prop', sport: 'Football', status: 'open', total_pool_pcc: 8200, options: ['Striker A', 'Midfielder B', 'Other'] }
    ]);

    // 6. Seed Treasury Stats
    console.log('\n6️⃣ Creating Treasury State...');
    await supabase.from('system_stats').upsert({
      id: 'treasury',
      data: {
        reserves: {
          total_pcc_minted: 500000,
          total_pcc_burned: 12500,
          total_pcc_circulating: 487500
        }
      }
    });

    console.log('\n✅ Database Seeding Completed Successfully!');
  } catch (err) {
    console.error('\n❌ Seeding Error:', err.message);
  }
}

seed();
