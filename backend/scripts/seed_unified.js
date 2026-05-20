const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DB_URL = 'postgresql://postgres:Paiecashcoin@db.yqwabzsggyqbmueoxjtp.supabase.co:5432/postgres';

async function seed() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

  try {
    console.log('🔗 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected.');

    console.log('🌱 SEEDING UNIFIED DATABASE...');

    // 1. Seed Categories
    console.log('📁 Seeding Product Categories...');
    const categories = [
      { id: uuidv4(), name: 'Merchandise', slug: 'merchandise', icon: '👕' },
      { id: uuidv4(), name: 'Tickets', slug: 'tickets', icon: '🎟️' },
      { id: uuidv4(), name: 'Experiences', slug: 'experiences', icon: '⭐' },
      { id: uuidv4(), name: 'Digital', slug: 'digital', icon: '💿' }
    ];
    for (const cat of categories) {
      await client.query(
        'INSERT INTO product_categories (id, name, slug, icon) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING',
        [cat.id, cat.name, cat.slug, cat.icon]
      );
    }

    // 2. Seed Clubs (Tenants)
    console.log('🏟️ Seeding Clubs...');
    const clubs = [
      { id: uuidv4(), name: 'Real Madrid FC', slug: 'real-madrid', sport: 'football', country: 'Spain', color: '#FFFFFF' },
      { id: uuidv4(), name: 'Manchester United', slug: 'man-united', sport: 'football', country: 'UK', color: '#DA291C' },
      { id: uuidv4(), name: 'Lakers', slug: 'lakers', sport: 'basketball', country: 'USA', color: '#552583' }
    ];

    for (const club of clubs) {
      const { rows } = await client.query(
        `INSERT INTO tenants (id, club_name, slug, sport, country, brand_color, status, treasury_address, treasury_wallet_id) 
         VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8) RETURNING id`,
        [club.id, club.name, club.slug, club.sport, club.country, club.color, '0x' + Math.random().toString(16).slice(2, 42), uuidv4()]
      );
      
      // Create profile
      await client.query(
        'INSERT INTO club_profiles (tenant_id, tagline, verified) VALUES ($1, $2, $3)',
        [rows[0].id, `Official club store of ${club.name}`, true]
      );

      // Seed Products for each club
      console.log(`   📦 Seeding Products for ${club.name}...`);
      const products = [
        { name: 'Home Jersey 2026', price: 150, category: 'merchandise' },
        { name: 'VIP Match Ticket', price: 500, category: 'tickets' },
        { name: 'Training Kit', price: 80, category: 'merchandise' }
      ];

      for (const p of products) {
        const catId = categories.find(c => c.slug === p.category).id;
        await client.query(
          `INSERT INTO products (tenant_id, category_id, name, pcc_price, status) 
           VALUES ($1, $2, $3, $4, 'active')`,
          [rows[0].id, catId, p.name, p.price]
        );
      }
    }

    // 3. Seed Demo Fan User
    console.log('👤 Seeding Demo Fan User...');
    const demoFanEmail = 'fan@demo.com';
    const { rows: fanRows } = await client.query(
      `INSERT INTO users (full_name, email, role, country) 
       VALUES ('Demo Fan', $1, 'fan', 'UK') RETURNING id`,
      [demoFanEmail]
    );
    const fanId = fanRows[0].id;

    // Create Wallet for Fan
    await client.query(
      `INSERT INTO wallets (user_id, circle_wallet_id, circle_wallet_set_id, wallet_address, pcc_balance) 
       VALUES ($1, $2, $3, $4, $5)`,
      [fanId, uuidv4(), uuidv4(), '0x' + Math.random().toString(16).slice(2, 42), 10000]
    );

    console.log(`\n✅ Seeding Complete!`);
    console.log(`🔑 Demo User: ${demoFanEmail}`);
    console.log(`💰 Initial Balance: 10,000 PCC`);

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await client.end();
  }
}

seed();
