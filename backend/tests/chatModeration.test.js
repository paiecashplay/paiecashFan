// Tests modération Fan Club — Lot 1 (charte + signalement + garde-fous).
// Prérequis : migration `chat-moderation.sql` passée.
// Lancer : node tests/chatModeration.test.js
const assert = require('assert');
const supabase = require('../db/supabase');
const mod = require('../db/chatModeration');
const favorites = require('../db/favorites');

let passed = 0;
const t = async (name, fn) => { await fn(); passed++; console.log('  ✓', name); };

(async () => {
  // ── Fixtures : un club + un fan réels ──────────────────────
  const { data: club } = await supabase.from('tenants').select('id, name').eq('type', 'club').limit(1).maybeSingle();
  const { data: fan } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
  const { data: other } = await supabase.from('profiles').select('id').neq('id', fan.id).limit(1).maybeSingle();
  if (!club || !fan) { console.error('Fixtures manquantes (club/fan).'); process.exit(1); }

  const cleanup = async () => {
    await supabase.from('chat_reports').delete().eq('reporter_user_id', fan.id);
    await supabase.from('chat_sanctions').delete().eq('user_id', fan.id);
    await supabase.from('chat_room_memberships').delete().eq('user_id', fan.id).eq('tenant_id', club.id);
    await supabase.from('fan_messages').delete().eq('content', '[test] message de modération');
    await supabase.from('fan_favorite_clubs').delete().eq('user_id', fan.id).eq('tenant_id', club.id);
  };
  await cleanup();

  console.log('Charte');
  await t('charte requise avant toute acceptation', async () => {
    assert.equal(await mod.needsCharter(club.id, fan.id), true);
  });
  await t('acceptée → plus redemandée (même version)', async () => {
    await mod.acceptCharter(club.id, fan.id);
    assert.equal(await mod.needsCharter(club.id, fan.id), false);
  });
  await t('version de charte périmée → redemandée', async () => {
    await supabase.from('chat_room_memberships').update({ charter_version: '1999-01-01' })
      .eq('tenant_id', club.id).eq('user_id', fan.id);
    assert.equal(await mod.needsCharter(club.id, fan.id), true);
    await mod.acceptCharter(club.id, fan.id);   // on remet à jour
  });

  console.log('\nFavoris (charte renforcée si club non suivi)');
  await t('club non suivi → isFavorite = false (modale renforcée)', async () => {
    const favs = await favorites.listFavorites(fan.id);
    assert.equal(favs.some((f) => f.club.id === club.id), false);
  });
  await t('club suivi → isFavorite = true (pas de modale renforcée)', async () => {
    await favorites.toggleFavorite(fan.id, club.id);
    const favs = await favorites.listFavorites(fan.id);
    assert.equal(favs.some((f) => f.club.id === club.id), true);
    await favorites.toggleFavorite(fan.id, club.id);   // nettoyage
  });

  console.log('\nSignalement');
  const { data: msg } = await supabase.from('fan_messages')
    .insert({ tenant_id: club.id, author_id: other?.id || fan.id, content: '[test] message de modération' })
    .select('id, author_id').single();

  await t('un signalement est créé', async () => {
    const r = await mod.createReport({ messageId: msg.id, tenantId: club.id, reporterUserId: fan.id, reportedUserId: msg.author_id, reason: 'insult', comment: 'test' });
    assert.ok(r.id);
  });
  await t('un seul signalement par utilisateur/message', async () => {
    await assert.rejects(
      () => mod.createReport({ messageId: msg.id, tenantId: club.id, reporterUserId: fan.id, reportedUserId: msg.author_id, reason: 'spam' }),
      (e) => e.code === 'ALREADY_REPORTED'
    );
  });
  await t('motif invalide refusé', async () => {
    await assert.rejects(
      () => mod.createReport({ messageId: msg.id, tenantId: club.id, reporterUserId: fan.id, reportedUserId: msg.author_id, reason: 'n_importe_quoi' }),
      (e) => e.code === 'BAD_REASON'
    );
  });

  console.log('\nMessages masqués jamais servis');
  await t('un message hidden/removed est exclu du feed', async () => {
    await supabase.from('fan_messages').update({ moderation_status: 'hidden' }).eq('id', msg.id);
    const feed = await require('../db/fanFeed').getFeed(club.id, fan.id);
    assert.equal(feed.messages.some((m) => m.id === msg.id), false);
    await supabase.from('fan_messages').update({ moderation_status: 'published' }).eq('id', msg.id);
  });

  console.log('\nSanctions');
  await t('aucune sanction → écriture possible', async () => {
    assert.equal(await mod.getActiveSanction(fan.id, club.id), null);
  });
  await t('un warning ne bloque pas l\'écriture', async () => {
    await supabase.from('chat_sanctions').insert({ user_id: fan.id, tenant_id: club.id, sanction_type: 'warning', scope: 'room', issued_by: fan.id });
    assert.equal(await mod.getActiveSanction(fan.id, club.id), null);
    await supabase.from('chat_sanctions').delete().eq('user_id', fan.id);
  });
  await t('un utilisateur suspendu ne peut pas écrire', async () => {
    const ends = new Date(Date.now() + 3600e3).toISOString();
    await supabase.from('chat_sanctions').insert({ user_id: fan.id, tenant_id: club.id, sanction_type: 'room_suspension', scope: 'room', ends_at: ends, issued_by: fan.id });
    const s = await mod.getActiveSanction(fan.id, club.id);
    assert.equal(s?.type, 'room_suspension');
    await supabase.from('chat_sanctions').delete().eq('user_id', fan.id);
  });
  await t('une sanction expirée ne bloque plus', async () => {
    const ended = new Date(Date.now() - 3600e3).toISOString();
    await supabase.from('chat_sanctions').insert({ user_id: fan.id, tenant_id: club.id, sanction_type: 'room_suspension', scope: 'room', ends_at: ended, issued_by: fan.id });
    assert.equal(await mod.getActiveSanction(fan.id, club.id), null);
    await supabase.from('chat_sanctions').delete().eq('user_id', fan.id);
  });
  await t('une sanction d\'un AUTRE salon ne bloque pas ici', async () => {
    const { data: club2 } = await supabase.from('tenants').select('id').eq('type', 'club').neq('id', club.id).limit(1).maybeSingle();
    if (!club2) return;
    await supabase.from('chat_sanctions').insert({ user_id: fan.id, tenant_id: club2.id, sanction_type: 'room_ban', scope: 'room', is_permanent: true, issued_by: fan.id });
    assert.equal(await mod.getActiveSanction(fan.id, club.id), null);
    await supabase.from('chat_sanctions').delete().eq('user_id', fan.id);
  });
  await t('un ban global bloque partout', async () => {
    await supabase.from('chat_sanctions').insert({ user_id: fan.id, tenant_id: null, sanction_type: 'global_chat_ban', scope: 'global', is_permanent: true, issued_by: fan.id });
    const s = await mod.getActiveSanction(fan.id, club.id);
    assert.equal(s?.type, 'global_chat_ban');
    await supabase.from('chat_sanctions').delete().eq('user_id', fan.id);
  });

  console.log('\n🔒 Garde-fou IA');
  await t('l\'IA (issued_by NULL) ne peut PAS créer une exclusion permanente', async () => {
    const { error } = await supabase.from('chat_sanctions').insert({
      user_id: fan.id, tenant_id: club.id, sanction_type: 'room_ban', scope: 'room',
      is_permanent: true, issued_by: null,   // ← pas d'humain
    });
    assert.ok(error, 'La base doit refuser une sanction permanente sans issued_by');
  });

  await cleanup();
  console.log(`\n✅ ${passed} tests OK`);
  process.exit(0);
})().catch((err) => { console.error('\n❌ ÉCHEC:', err.message); process.exit(1); });
