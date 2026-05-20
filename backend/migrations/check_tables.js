// ═══════════════════════════════════════════════════════════════
// migrate_via_supabase.js - Execute SQL migration via supabase-js
// Uses the service role key to call a helper RPC function
// ═══════════════════════════════════════════════════════════════

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yqwabzsggyqbmueoxjtp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxd2FienNnZ3lxYm11ZW94anRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQzNzUxMiwiZXhwIjoyMDkzMDEzNTEyfQ.i31372KnJHNSkIIdxRUkfRqDcpE9a2G7zFNEcbmfU3A';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkExistingTables() {
  console.log('🔍 Checking existing tables via Supabase REST API...\n');

  // Try querying each expected table to see if it exists
  const tables = [
    'users', 'otp_codes', 'tenants', 'wallets', 'products',
    'transactions', 'orders', 'cashout_requests', 'notifications', 'audit_logs'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: exists`);
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`);
    }
  }

  // Check for admin user
  console.log('\n🔑 Checking for admin user...');
  const { data: admin, error: adminErr } = await supabase
    .from('users')
    .select('id, full_name, email, role')
    .eq('email', 'admin@frostrek.com')
    .single();

  if (adminErr) {
    console.log(`   ❌ Admin user not found: ${adminErr.message}`);
  } else {
    console.log(`   ✅ Admin: ${admin.full_name} (${admin.email}) - role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
  }
}

checkExistingTables();
