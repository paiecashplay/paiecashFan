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

  // ══════════════ LOT 2 — Back-office de traitement ══════════════
  const { requireClubModerator } = require('../middleware/clubModerator');
  const runMw = (authUser, tenant) => {
    let status = null, nexted = false;
    const req = { authUser, tenant };
    const res = { status(s) { status = s; return this; }, json() { return this; } };
    requireClubModerator(req, res, () => { nexted = true; });
    return { nexted, status, moderatorType: req.moderatorType };
  };
  const { data: club2 } = await supabase.from('tenants').select('id').eq('type', 'club').neq('id', club.id).limit(1).maybeSingle();

  console.log('\nAutorisation de modération');
  await t('super_admin peut modérer tous les salons', async () => {
    const r = runMw({ id: 'x', role: 'super_admin' }, { id: club.id });
    assert.equal(r.nexted, true); assert.equal(r.moderatorType, 'super_admin');
  });
  await t('club_admin peut modérer SON salon', async () => {
    const r = runMw({ id: 'x', role: 'club_admin', club_id: club.id }, { id: club.id });
    assert.equal(r.nexted, true); assert.equal(r.moderatorType, 'club_admin');
  });
  await t('club_admin NE peut PAS modérer un autre salon', async () => {
    if (!club2) return;
    const r = runMw({ id: 'x', role: 'club_admin', club_id: club2.id }, { id: club.id });
    assert.equal(r.nexted, false); assert.equal(r.status, 403);
  });
  await t('un simple fan ne peut pas modérer', async () => {
    const r = runMw({ id: 'x', role: 'fan' }, { id: club.id });
    assert.equal(r.nexted, false); assert.equal(r.status, 403);
  });
  await t('non authentifié → 401', async () => {
    const r = runMw(null, { id: club.id });
    assert.equal(r.nexted, false); assert.equal(r.status, 401);
  });

  console.log('\nFile de modération');
  const { data: msg2 } = await supabase.from('fan_messages')
    .insert({ tenant_id: club.id, author_id: other?.id || fan.id, content: '[test] message de modération' })
    .select('id, author_id').single();

  let caseId;
  await t('un signalement crée un dossier', async () => {
    const r = await mod.createReport({ messageId: msg2.id, tenantId: club.id, reporterUserId: fan.id, reportedUserId: msg2.author_id, reason: 'insult' });
    assert.ok(r.caseId, 'un caseId doit être créé');
    caseId = r.caseId;
  });
  await t('un 2e signalement n\'ouvre PAS un 2e dossier (dédup + compteur)', async () => {
    if (!other) return;
    await mod.createReport({ messageId: msg2.id, tenantId: club.id, reporterUserId: other.id, reportedUserId: msg2.author_id, reason: 'spam' });
    const { data: cases } = await supabase.from('chat_moderation_cases').select('id, reports_count').eq('message_id', msg2.id).in('status', ['open', 'in_review']);
    assert.equal(cases.length, 1, 'un seul dossier ouvert par message');
    assert.equal(cases[0].reports_count, 2);
  });
  await t('le détail du dossier n\'expose JAMAIS le signalant', async () => {
    const c = await mod.getCase(caseId);
    assert.ok(c.reports.length >= 1);
    c.reports.forEach((r) => assert.equal(r.reporter_user_id, undefined, 'reporter_user_id ne doit pas être renvoyé'));
  });
  await t('le dossier fournit le contexte du salon', async () => {
    const c = await mod.getCase(caseId);
    assert.ok(Array.isArray(c.context));
    assert.ok(c.context.some((m) => m.isTarget), 'le message ciblé doit être marqué dans le contexte');
  });

  console.log('\nDécisions');
  await t('décision invalide refusée', async () => {
    await assert.rejects(() => mod.decideCase({ caseId, decision: 'nuke', actorId: fan.id, actorType: 'super_admin' }), (e) => e.code === 'BAD_DECISION');
  });
  await t('« masquer » retire le message du feed (sans le supprimer)', async () => {
    await mod.decideCase({ caseId, decision: 'hide_message', reason: 'test', actorId: fan.id, actorType: 'super_admin' });
    const feed = await require('../db/fanFeed').getFeed(club.id, fan.id);
    assert.equal(feed.messages.some((m) => m.id === msg2.id), false);
    const { data: m } = await supabase.from('fan_messages').select('moderation_status').eq('id', msg2.id).maybeSingle();
    assert.equal(m.moderation_status, 'hidden');   // toujours en base
  });
  await t('toute décision crée un log d\'audit', async () => {
    const { data: logs } = await supabase.from('chat_moderation_audit_logs').select('action, actor_type').eq('case_id', caseId);
    assert.ok(logs.some((l) => l.action === 'decision:hide_message'), 'audit de la décision manquant');
    assert.ok(logs.some((l) => l.action === 'case_opened'), 'audit d\'ouverture manquant');
  });
  await t('un dossier clos ne peut pas être re-statué', async () => {
    await assert.rejects(() => mod.decideCase({ caseId, decision: 'dismiss', actorId: fan.id, actorType: 'super_admin' }), (e) => e.code === 'ALREADY_CLOSED');
  });
  await t('les signalements liés passent en « traités »', async () => {
    const { data: reps } = await supabase.from('chat_reports').select('status').eq('message_id', msg2.id);
    assert.ok(reps.every((r) => r.status === 'reviewed'));
  });
  await t('la file du club ne contient que SES dossiers', async () => {
    const cases = await mod.listCases({ tenantId: club.id });
    assert.ok(cases.every((c) => c.tenant_id === club.id));
  });

  await supabase.from('chat_reports').delete().eq('message_id', msg2.id);
  await supabase.from('chat_moderation_cases').delete().eq('message_id', msg2.id);
  await cleanup();
  console.log(`\n✅ ${passed} tests OK`);
  process.exit(0);
})().catch((err) => { console.error('\n❌ ÉCHEC:', err.message); process.exit(1); });
