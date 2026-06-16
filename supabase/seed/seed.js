// ═════════════════════════════════════════════════════════════
// PaieCashFan — Idempotent Data Seeder
//
// Usage :
//   npm install
//   cp .env.example .env  (puis remplir SUPABASE_SERVICE_ROLE_KEY)
//   npm run seed
//
// Flags :
//   --dry-run   : ne fait aucun upsert, juste log ce qu'il ferait
//   --reset     : supprime tous les players/trophies/products avant
//                 de re-seed (utile si la data en dur a changé)
// ═════════════════════════════════════════════════════════════

import { supabase } from './lib/client.js';
import { upsertBy, indexBySlug, log } from './lib/upsert.js';
import {
  federations as FEDERATIONS,
  tenants     as TENANTS,
  players     as PLAYERS,
  trophies    as TROPHIES,
  products    as PRODUCTS
} from './data.js';

const DRY_RUN = process.argv.includes('--dry-run');
const RESET   = process.argv.includes('--reset');

// ─── Step 1 : Federations ────────────────────────────────────
async function seedFederations() {
  log('🏛️ ', `Seeding ${FEDERATIONS.length} federations…`);
  if (DRY_RUN) return new Map(FEDERATIONS.map((f) => [f.slug, 'dry']));
  await upsertBy('federations', FEDERATIONS, 'slug');
  const idx = await indexBySlug('federations');
  log('   ✅', `${idx.size} federations en base`);
  return idx;
}

// ─── Step 2 : Tenants (clubs + national_team hubs) ───────────
async function seedTenants(federationIdx) {
  log('🛡️ ', `Seeding ${TENANTS.length} tenants…`);
  // Résolution federationSlug → federation_id
  const rows = TENANTS.map((t) => {
    const { federationSlug, ...rest } = t;
    return {
      ...rest,
      federation_id: federationSlug ? federationIdx.get(federationSlug) || null : null
    };
  });
  if (DRY_RUN) return new Map(rows.map((t) => [t.slug, 'dry']));
  await upsertBy('tenants', rows, 'slug');
  const idx = await indexBySlug('tenants');
  log('   ✅', `${idx.size} tenants en base`);
  return idx;
}

// ─── Step 3 : Players ────────────────────────────────────────
async function seedPlayers(tenantIdx, federationIdx) {
  log('⚽', `Seeding ${PLAYERS.length} players…`);
  const rows = PLAYERS.map((p) => {
    const { tenantSlug, federationSlug, ...rest } = p;
    return {
      ...rest,
      tenant_id:     tenantSlug     ? tenantIdx.get(tenantSlug)         || null : null,
      federation_id: federationSlug ? federationIdx.get(federationSlug) || null : null
    };
  }).filter((r) => r.tenant_id || r.federation_id);

  if (DRY_RUN) {
    log('   📋', `(dry-run) skip insert players`);
    return;
  }

  if (RESET) {
    log('   🧹', 'reset: deleting all players…');
    await supabase.from('players').delete().gte('created_at', '1970-01-01');
  }

  // Pas de clé naturelle unique sur players → insert simple.
  // Si --reset n'est pas passé, on filtre par (tenant_id, full_name) déjà existants.
  if (!RESET) {
    const { data: existing } = await supabase
      .from('players')
      .select('full_name, tenant_id, federation_id');
    const seen = new Set((existing || []).map((p) =>
      `${p.full_name}|${p.tenant_id || ''}|${p.federation_id || ''}`));
    const toInsert = rows.filter((r) =>
      !seen.has(`${r.full_name}|${r.tenant_id || ''}|${r.federation_id || ''}`));
    if (toInsert.length === 0) {
      log('   ⏭️ ', 'tous les players sont déjà en base, rien à insérer');
      return;
    }
    const { error } = await supabase.from('players').insert(toInsert);
    if (error) throw error;
    log('   ✅', `${toInsert.length} players ajoutés (${rows.length - toInsert.length} déjà présents)`);
    return;
  }

  const { error } = await supabase.from('players').insert(rows);
  if (error) throw error;
  log('   ✅', `${rows.length} players insérés`);
}

// ─── Step 4 : Trophies ───────────────────────────────────────
async function seedTrophies(tenantIdx, federationIdx) {
  log('🏆', `Seeding ${TROPHIES.length} trophies…`);
  const rows = TROPHIES.map((t) => {
    const { tenantSlug, federationSlug, ...rest } = t;
    return {
      ...rest,
      tenant_id:     tenantSlug     ? tenantIdx.get(tenantSlug)         || null : null,
      federation_id: federationSlug ? federationIdx.get(federationSlug) || null : null
    };
  }).filter((r) => r.tenant_id || r.federation_id);

  if (DRY_RUN) {
    log('   📋', `(dry-run) skip insert trophies`);
    return;
  }

  if (RESET) {
    log('   🧹', 'reset: deleting all trophies…');
    await supabase.from('trophies').delete().gte('created_at', '1970-01-01');
  }

  if (!RESET) {
    const { data: existing } = await supabase
      .from('trophies')
      .select('label, tenant_id, federation_id');
    const seen = new Set((existing || []).map((t) =>
      `${t.label}|${t.tenant_id || ''}|${t.federation_id || ''}`));
    const toInsert = rows.filter((r) =>
      !seen.has(`${r.label}|${r.tenant_id || ''}|${r.federation_id || ''}`));
    if (toInsert.length === 0) {
      log('   ⏭️ ', 'tous les trophies sont déjà en base');
      return;
    }
    const { error } = await supabase.from('trophies').insert(toInsert);
    if (error) throw error;
    log('   ✅', `${toInsert.length} trophies ajoutés (${rows.length - toInsert.length} déjà présents)`);
    return;
  }

  const { error } = await supabase.from('trophies').insert(rows);
  if (error) throw error;
  log('   ✅', `${rows.length} trophies insérés`);
}

// ─── Step 5 : Products ───────────────────────────────────────
async function seedProducts(tenantIdx) {
  log('🛒', `Seeding ${PRODUCTS.length} products…`);
  const rows = PRODUCTS.map((p) => {
    const { tenantSlug, ...rest } = p;
    return { ...rest, tenant_id: tenantIdx.get(tenantSlug) || null };
  }).filter((r) => r.tenant_id);

  if (DRY_RUN) {
    log('   📋', `(dry-run) skip insert products`);
    return;
  }

  if (RESET) {
    log('   🧹', 'reset: deleting all products…');
    await supabase.from('products').delete().gte('created_at', '1970-01-01');
  }

  if (!RESET) {
    const { data: existing } = await supabase
      .from('products')
      .select('name, tenant_id');
    const seen = new Set((existing || []).map((p) => `${p.name}|${p.tenant_id}`));
    const toInsert = rows.filter((r) => !seen.has(`${r.name}|${r.tenant_id}`));
    if (toInsert.length === 0) {
      log('   ⏭️ ', 'tous les products sont déjà en base');
      return;
    }
    const { error } = await supabase.from('products').insert(toInsert);
    if (error) throw error;
    log('   ✅', `${toInsert.length} products ajoutés (${rows.length - toInsert.length} déjà présents)`);
    return;
  }

  const { error } = await supabase.from('products').insert(rows);
  if (error) throw error;
  log('   ✅', `${rows.length} products insérés`);
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  PaieCashFan — Supabase Data Seeder');
  console.log(`  Mode : ${DRY_RUN ? '🧪 DRY-RUN (aucune écriture)' : RESET ? '🔥 RESET (replace all)' : '✏️  INCREMENTAL (skip existing)'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const federationIdx = await seedFederations();
    const tenantIdx     = await seedTenants(federationIdx);
    await seedPlayers(tenantIdx, federationIdx);
    await seedTrophies(tenantIdx, federationIdx);
    await seedProducts(tenantIdx);

    console.log('');
    console.log('🎉  Seed terminé avec succès.');
    console.log('   Va vérifier dans Supabase Table Editor :');
    console.log('   → federations / tenants / players / trophies / products');
  } catch (err) {
    console.error('');
    console.error('💥  Seed failed:', err.message);
    if (err.details) console.error('    details:', err.details);
    if (err.hint)    console.error('    hint:   ', err.hint);
    process.exit(1);
  }
}

main();
