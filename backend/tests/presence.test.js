// Test présence en ligne (chantier 2). À lancer après la migration chat-presence.
require('dotenv').config();
const assert = require('assert');
const supabase = require('../db/supabase');
const presence = require('../db/presence');
const fanFeed = require('../db/fanFeed');

let passed = 0;
const t = async (name, fn) => { try { await fn(); passed++; console.log('  ✓', name); } catch (e) { console.error('\n❌ ÉCHEC:', name, '\n  ', e.message); process.exit(1); } };

(async () => {
  const { data: club } = await supabase.from('tenants').select('id, slug').eq('status', 'active').not('is_federation_hub', 'is', true).limit(1).single();
  const { data: users } = await supabase.from('profiles').select('id').limit(2);
  if (!club || (users || []).length < 2) { console.error('Fixtures manquantes (club/2 users).'); process.exit(1); }
  const [u1, u2] = users;

  const cleanup = async () => { await supabase.from('chat_presence').delete().eq('tenant_id', club.id).in('user_id', [u1.id, u2.id]); };
  await cleanup();

  console.log('Présence en ligne');
  await t('un battement de cœur rend le fan « en ligne »', async () => {
    await presence.heartbeat(club.id, u1.id);
    const online = await presence.onlineInTenant(club.id);
    assert.ok(online.has(u1.id), 'u1 devrait être en ligne');
  });
  await t('deux fans présents → tous les deux en ligne', async () => {
    await presence.heartbeat(club.id, u2.id);
    const online = await presence.onlineInTenant(club.id);
    assert.ok(online.has(u1.id) && online.has(u2.id));
  });
  await t('un fan périmé (> fenêtre) n\'est plus en ligne', async () => {
    const old = new Date(Date.now() - (presence.ONLINE_WINDOW_S + 30) * 1000).toISOString();
    await supabase.from('chat_presence').update({ last_seen_at: old }).eq('tenant_id', club.id).eq('user_id', u2.id);
    const online = await presence.onlineInTenant(club.id);
    assert.ok(online.has(u1.id), 'u1 toujours en ligne');
    assert.equal(online.has(u2.id), false, 'u2 périmé doit sortir');
  });
  await t('la présence est cloisonnée par salon', async () => {
    const { data: club2 } = await supabase.from('tenants').select('id').neq('id', club.id).eq('status', 'active').limit(1).single();
    if (!club2) return;
    const online2 = await presence.onlineInTenant(club2.id);
    assert.equal(online2.has(u1.id), false, 'u1 présent sur club, pas sur club2');
  });
  await t('getFeed annote la présence + renvoie onlineCount', async () => {
    await presence.heartbeat(club.id, u1.id);   // rafraîchit u1
    const feed = await fanFeed.getFeed(club.id, u1.id);
    assert.ok('onlineCount' in feed, 'onlineCount manquant');
    const meInFans = feed.fans.find((f) => f.id === u1.id);
    assert.ok(meInFans, 'le présent doit figurer dans les participants même sans avoir posté');
    assert.equal(meInFans.online, true, 'u1 doit être annoté en ligne');
    assert.ok(feed.onlineCount >= 1);
  });

  await cleanup();
  console.log(`\n✅ ${passed} tests OK`);
  process.exit(0);
})().catch((err) => { console.error('\n❌ ÉCHEC:', err.message); process.exit(1); });
