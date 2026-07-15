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

  // Nettoyage complet : on supprime les DOSSIERS avant les contenus, sinon
  // content_id pointe dans le vide (plus de FK depuis le passage au polymorphe)
  // et les dossiers restent orphelins dans la file du back-office.
  const cleanup = async () => {
    const { data: testMsgs } = await supabase.from('fan_messages').select('id').like('content', '[test]%');
    const ids = (testMsgs || []).map((m) => m.id);
    if (ids.length) {
      const { data: cs } = await supabase.from('chat_moderation_cases').select('id').eq('content_type', 'message').in('content_id', ids);
      const cids = (cs || []).map((c) => c.id);
      if (cids.length) {
        await supabase.from('chat_moderation_audit_logs').delete().in('case_id', cids);
        await supabase.from('chat_sanctions').delete().in('case_id', cids);
        await supabase.from('chat_moderation_cases').delete().in('id', cids);
      }
      await supabase.from('chat_reports').delete().eq('content_type', 'message').in('content_id', ids);
    }
    await supabase.from('chat_reports').delete().eq('reporter_user_id', fan.id);
    await supabase.from('chat_sanctions').delete().eq('user_id', fan.id);
    await supabase.from('chat_room_memberships').delete().eq('user_id', fan.id).eq('tenant_id', club.id);
    await supabase.from('fan_messages').delete().like('content', '[test]%');
    await supabase.from('fan_favorite_clubs').delete().eq('user_id', fan.id).eq('tenant_id', club.id);
    await supabase.from('notifications').delete().eq('user_id', fan.id).in('type', ['chat_sanction', 'chat_sanction_revoked']);
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
    const r = await mod.createReport({ contentType: 'message', contentId: msg.id, tenantId: club.id, reporterUserId: fan.id, reportedUserId: msg.author_id, reason: 'insult', comment: 'test' });
    assert.ok(r.id);
  });
  await t('un seul signalement par utilisateur/message', async () => {
    await assert.rejects(
      () => mod.createReport({ contentType: 'message', contentId: msg.id, tenantId: club.id, reporterUserId: fan.id, reportedUserId: msg.author_id, reason: 'spam' }),
      (e) => e.code === 'ALREADY_REPORTED'
    );
  });
  await t('motif invalide refusé', async () => {
    await assert.rejects(
      () => mod.createReport({ contentType: 'message', contentId: msg.id, tenantId: club.id, reporterUserId: fan.id, reportedUserId: msg.author_id, reason: 'n_importe_quoi' }),
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
    const r = await mod.createReport({ contentType: 'message', contentId: msg2.id, tenantId: club.id, reporterUserId: fan.id, reportedUserId: msg2.author_id, reason: 'insult' });
    assert.ok(r.caseId, 'un caseId doit être créé');
    caseId = r.caseId;
  });
  await t('un 2e signalement n\'ouvre PAS un 2e dossier (dédup + compteur)', async () => {
    if (!other) return;
    await mod.createReport({ contentType: 'message', contentId: msg2.id, tenantId: club.id, reporterUserId: other.id, reportedUserId: msg2.author_id, reason: 'spam' });
    const { data: cases } = await supabase.from('chat_moderation_cases').select('id, reports_count').eq('content_type', 'message').eq('content_id', msg2.id).in('status', ['open', 'in_review']);
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
    const { data: reps } = await supabase.from('chat_reports').select('status').eq('content_type', 'message').eq('content_id', msg2.id);
    assert.ok(reps.every((r) => r.status === 'reviewed'));
  });
  await t('la file du club ne contient que SES dossiers', async () => {
    const cases = await mod.listCases({ tenantId: club.id });
    assert.ok(cases.every((c) => c.tenant_id === club.id));
  });

  // ══════════════ LOT 3 — Avertissements & suspensions ══════════════
  console.log('\nAutorisation des sanctions');
  await t('un club_admin ne peut PAS bannir globalement', async () => {
    const allowed = mod.allowedSanctionsFor('club_admin');
    assert.equal(allowed.includes('global_chat_ban'), false);
    assert.equal(allowed.includes('account_review'), false);
    assert.ok(allowed.includes('room_ban'), 'il peut exclure de SON salon');
  });
  await t('le super_admin peut tout prononcer', async () => {
    assert.equal(mod.allowedSanctionsFor('super_admin').length, mod.SANCTION_TYPES.length);
  });
  await t('club_admin tentant un ban global → refusé', async () => {
    await assert.rejects(
      () => mod.issueSanction({ userId: fan.id, tenantId: club.id, type: 'global_chat_ban', isPermanent: true, issuedBy: fan.id, actorType: 'club_admin' }),
      (e) => e.code === 'FORBIDDEN_TYPE'
    );
  });

  console.log('\n🔒 Garde-fous des sanctions');
  await t('l\'IA ne peut pas prononcer une exclusion définitive', async () => {
    await assert.rejects(
      () => mod.issueSanction({ userId: fan.id, tenantId: club.id, type: 'room_ban', isPermanent: true, issuedBy: null, actorType: 'ai' }),
      (e) => e.code === 'NEEDS_HUMAN'
    );
  });
  await t('une suspension sans durée est refusée (pas de permanent déguisé)', async () => {
    await assert.rejects(
      () => mod.issueSanction({ userId: fan.id, tenantId: club.id, type: 'room_suspension', issuedBy: fan.id, actorType: 'super_admin' }),
      (e) => e.code === 'DURATION_REQUIRED'
    );
  });
  await t('un avertissement ne peut pas être « définitif »', async () => {
    await assert.rejects(
      () => mod.issueSanction({ userId: fan.id, tenantId: club.id, type: 'warning', isPermanent: true, issuedBy: fan.id, actorType: 'super_admin' }),
      (e) => e.code === 'BAD_PERMANENT'
    );
  });

  console.log('\nÉmission & révocation');
  const { data: msg3 } = await supabase.from('fan_messages')
    .insert({ tenant_id: club.id, author_id: fan.id, content: '[test] message de modération' }).select('id').single();
  const case3 = await mod.upsertCaseForContent({ tenantId: club.id, contentType: 'message', contentId: msg3.id, targetUserId: fan.id, source: 'manual' });

  await t('décision + suspension : le supporter ne peut plus écrire', async () => {
    const r = await mod.decideCase({
      caseId: case3, decision: 'remove_message', reason: 'Propos insultants',
      actorId: fan.id, actorType: 'super_admin',
      sanction: { type: 'room_suspension', durationHours: 24 },
    });
    assert.ok(r.sanction?.id);
    const s = await mod.getActiveSanction(fan.id, club.id);
    assert.equal(s?.type, 'room_suspension');
  });
  await t('la sanction est notifiée au supporter', async () => {
    const { data: n } = await supabase.from('notifications').select('type, title')
      .eq('user_id', fan.id).eq('type', 'chat_sanction').order('created_at', { ascending: false }).limit(1);
    assert.ok(n?.length, 'notification de sanction manquante');
  });
  await t('l\'audit trace la sanction', async () => {
    const { data: logs } = await supabase.from('chat_moderation_audit_logs').select('action').eq('case_id', case3);
    assert.ok(logs.some((l) => l.action === 'sanction:room_suspension'));
  });
  await t('révoquer la sanction débloque le supporter', async () => {
    const { data: s } = await supabase.from('chat_sanctions').select('id').eq('user_id', fan.id).is('revoked_at', null).limit(1).maybeSingle();
    await mod.revokeSanction({ sanctionId: s.id, actorId: fan.id, actorType: 'super_admin' });
    assert.equal(await mod.getActiveSanction(fan.id, club.id), null);
  });
  await t('une sanction déjà levée ne peut pas être re-levée', async () => {
    const { data: s } = await supabase.from('chat_sanctions').select('id').eq('user_id', fan.id).not('revoked_at', 'is', null).limit(1).maybeSingle();
    await assert.rejects(() => mod.revokeSanction({ sanctionId: s.id, actorId: fan.id, actorType: 'super_admin' }), (e) => e.code === 'ALREADY_REVOKED');
  });
  await t('« mes sanctions » liste l\'historique avec l\'état actif', async () => {
    const list = await mod.listMySanctions(fan.id);
    assert.ok(list.length >= 1);
    assert.equal(list.every((s) => typeof s.isActive === 'boolean'), true);
  });

  // ══════════════ LOT 4 — Historique & audit ══════════════
  console.log('\nHistorique du supporter');
  await t('le profil de modération agrège dossiers, sanctions et messages', async () => {
    const h = await mod.getUserModerationHistory(fan.id);
    assert.ok(h.user?.id === fan.id);
    assert.ok(typeof h.stats.messages === 'number');
    assert.ok(typeof h.stats.cases === 'number');
    assert.ok(Array.isArray(h.cases) && Array.isArray(h.sanctions));
  });
  await t('la vue club_admin est bornée à SON salon', async () => {
    if (!club2) return;
    // un dossier dans un AUTRE club ne doit pas apparaître
    const { data: m4 } = await supabase.from('fan_messages')
      .insert({ tenant_id: club2.id, author_id: fan.id, content: '[test] autre salon' }).select('id').single();
    const otherCase = await mod.upsertCaseForContent({ tenantId: club2.id, contentType: 'message', contentId: m4.id, targetUserId: fan.id, source: 'manual' });
    const scoped = await mod.getUserModerationHistory(fan.id, { tenantId: club.id });
    assert.equal(scoped.cases.some((c) => c.id === otherCase), false, 'un club_admin ne doit pas voir les dossiers d\'un autre club');
    const global = await mod.getUserModerationHistory(fan.id);
    assert.equal(global.cases.some((c) => c.id === otherCase), true, 'le super_admin voit tout');
    await supabase.from('chat_moderation_audit_logs').delete().eq('case_id', otherCase);
    await supabase.from('chat_moderation_cases').delete().eq('id', otherCase);
    await supabase.from('fan_messages').delete().eq('id', m4.id);
  });

  console.log('\nJournal d\'audit');
  await t('le journal liste les actions avec le nom de l\'acteur', async () => {
    const logs = await mod.listAuditLogs({ caseId: case3 });
    assert.ok(logs.length >= 1);
    assert.ok(logs.every((l) => typeof l.actorName === 'string'), 'actorName manquant');
    assert.ok(logs.some((l) => l.action.startsWith('decision:')));
  });
  await t('le journal est filtrable par salon', async () => {
    const logs = await mod.listAuditLogs({ tenantId: club.id });
    assert.ok(Array.isArray(logs));
  });
  await t('une action automatique est attribuée au « Système »', async () => {
    const logs = await mod.listAuditLogs({ caseId: case3 });
    const opened = logs.find((l) => l.action === 'case_opened');
    assert.equal(opened?.actorName, 'Système');
  });

  // ══════════════ LOT 5 — IA de pré-classement ══════════════
  const ai = require('../services/moderation');
  // On force le fournisseur heuristique : les tests doivent être déterministes,
  // gratuits et hors-ligne. La qualité de Claude se mesure par le benchmark
  // (docs/moderation-benchmark.md), pas par la suite de tests.
  const realKey = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;

  // ⚠️ feature_flags est une table PARTAGÉE AVEC LA PROD. Les tests doivent
  // rendre le flag exactement dans l'état où ils l'ont trouvé : sinon la suite
  // désactive silencieusement la modération IA en production.
  const { data: flagBefore } = await supabase.from('feature_flags')
    .select('enabled').eq('key', ai.FLAG_KEY).maybeSingle();
  const initialFlag = flagBefore?.enabled ?? false;

  const setFlag = async (on) => {
    await supabase.from('feature_flags').upsert({ key: ai.FLAG_KEY, enabled: on }, { onConflict: 'key' });
    ai._resetFlagCache();
  };
  const restoreFlag = async () => { await setFlag(initialFlag); };

  console.log('\n🤖 Classement IA (heuristique)');
  await t('la passion foot n\'est PAS modérée', async () => {
    for (const txt of ['On est nuls ce soir, quel match pourri', 'L\'arbitre est un voleur !', 'Allez Rennes, on va les exploser']) {
      const r = await ai.analyzeText(txt);
      assert.equal(r.shouldOpenCase, false, `faux positif sur : ${txt}`);
    }
  });
  await t('insulte, racisme, menace et données perso sont classés', async () => {
    const cases = [['ferme ta gueule connard', 'insult'], ['sale negre', 'racism'], ['je vais te tuer', 'threat'], ['appelle moi au 06 12 34 56 78', 'personal_data']];
    for (const [txt, cat] of cases) {
      const r = await ai.analyzeText(txt);
      assert.equal(r.shouldOpenCase, true, `raté : ${txt}`);
      assert.ok(r.categories.includes(cat), `catégorie ${cat} attendue pour : ${txt}`);
    }
  });
  await t('l\'obfuscation (n.e.g.r.e) ne passe pas', async () => {
    const r = await ai.analyzeText('sale n.e.g.r.e');
    assert.equal(r.riskLevel, 'critical');
  });
  await t('un « publish » sur un risque critique est ignoré', async () => {
    const r = ai.normalize({ riskLevel: 'critical', recommendedAction: 'publish' }, { provider: 'test' });
    assert.equal(r.recommendedAction, 'flag_for_review');
    assert.equal(r.requiresHumanReview, true);
  });
  await t('une action inconnue de l\'IA est rejetée', async () => {
    const r = ai.normalize({ riskLevel: 'low', recommendedAction: 'ban_user' }, { provider: 'test' });
    assert.equal(r.recommendedAction, 'publish', 'l\'IA ne peut pas inventer une action');
  });

  console.log('\n🤖 Pré-classement d\'un message');
  await t('flag désactivé → aucune analyse', async () => {
    await setFlag(false);
    const { data: m } = await supabase.from('fan_messages')
      .insert({ tenant_id: club.id, author_id: fan.id, content: '[test] sale negre' }).select('id').single();
    const r = await ai.screenContent({ contentType: 'message', contentId: m.id, tenantId: club.id, authorId: fan.id, content: '[test] sale negre' });
    assert.equal(r, null);
    const { count } = await supabase.from('chat_moderation_cases').select('id', { count: 'exact', head: true }).eq('content_type', 'message').eq('content_id', m.id);
    assert.equal(count || 0, 0, 'aucun dossier ne doit être ouvert flag off');
    await supabase.from('fan_messages').delete().eq('id', m.id);
  });

  await setFlag(true);
  const { data: msg5 } = await supabase.from('fan_messages')
    .insert({ tenant_id: club.id, author_id: fan.id, content: '[test] ferme ta gueule connard' }).select('id').single();

  await t('flag activé → dossier ouvert, priorisé, source « ai »', async () => {
    const r = await ai.screenContent({ contentType: 'message', contentId: msg5.id, tenantId: club.id, authorId: fan.id, content: '[test] ferme ta gueule connard' });
    assert.ok(r?.caseId, 'dossier non créé');
    const { data: c } = await supabase.from('chat_moderation_cases')
      .select('source, priority, ai_risk_score, ai_categories, ai_summary').eq('id', r.caseId).single();
    assert.equal(c.source, 'ai');
    assert.ok(c.ai_categories.includes('insult'));
    assert.ok(c.ai_summary.includes('mock'), 'le fournisseur doit être tracé');
  });
  await t('le message reste PUBLIÉ (le lot 5 ne masque jamais)', async () => {
    const { data: m } = await supabase.from('fan_messages').select('moderation_status, deleted_at').eq('id', msg5.id).single();
    assert.equal(m.moderation_status, 'published');
    assert.equal(m.deleted_at, null);
  });
  await t('l\'audit attribue l\'ouverture à l\'IA', async () => {
    const { data: c } = await supabase.from('chat_moderation_cases').select('id').eq('content_type', 'message').eq('content_id', msg5.id).single();
    const logs = await mod.listAuditLogs({ caseId: c.id });
    const opened = logs.find((l) => l.action === 'case_opened');
    assert.equal(opened.actor_type, 'ai');
    assert.equal(opened.actorName, 'IA');
  });
  await t('l\'IA ne peut PAS sanctionner ce qu\'elle a détecté', async () => {
    await assert.rejects(
      () => mod.issueSanction({ userId: fan.id, tenantId: club.id, type: 'room_ban', isPermanent: true, issuedBy: null, actorType: 'ai' }),
      (e) => e.code === 'NEEDS_HUMAN'
    );
  });
  await t('la priorité n\'est jamais rétrogradée', async () => {
    const { data: before } = await supabase.from('chat_moderation_cases').select('id').eq('content_type', 'message').eq('content_id', msg5.id).single();
    await supabase.from('chat_moderation_cases').update({ priority: 'critical' }).eq('id', before.id);
    const again = await mod.upsertCaseForContent({ tenantId: club.id, contentType: 'message', contentId: msg5.id, targetUserId: fan.id, source: 'report' });
    const { data: after } = await supabase.from('chat_moderation_cases').select('priority').eq('id', again).single();
    assert.equal(after.priority, 'critical', 'un recalcul ne doit jamais rétrograder la priorité');
  });
  await t('avec une clé configurée, Claude prend le relais', async () => {
    process.env.ANTHROPIC_API_KEY = realKey || 'sk-ant-test';
    assert.equal(ai.providerName(), 'claude');
    assert.equal(ai.getProvider().name, 'claude');
    if (realKey) process.env.ANTHROPIC_API_KEY = realKey; else delete process.env.ANTHROPIC_API_KEY;
  });

  // ══════════════ EXTENSION — posts & commentaires ══════════════
  console.log('\n📰 Modération du fil (posts & commentaires)');
  const fanFeed = require('../db/fanFeed');

  const { data: post1 } = await supabase.from('fan_posts')
    .insert({ tenant_id: club.id, author_id: fan.id, content: '[test] post a moderer' }).select('id').single();
  const { data: com1 } = await supabase.from('fan_comments')
    .insert({ post_id: post1.id, author_id: fan.id, content: '[test] commentaire a moderer' }).select('id').single();

  await t('un post est signalable comme un message', async () => {
    const r = await mod.createReport({
      contentType: 'post', contentId: post1.id, tenantId: club.id,
      reporterUserId: other.id, reportedUserId: fan.id, reason: 'insult',
    });
    assert.ok(r.id && r.caseId, 'dossier non ouvert pour le post');
    const { data: c } = await supabase.from('chat_moderation_cases').select('content_type').eq('id', r.caseId).single();
    assert.equal(c.content_type, 'post');
  });
  await t('un commentaire est signalable', async () => {
    const r = await mod.createReport({
      contentType: 'comment', contentId: com1.id, tenantId: club.id,
      reporterUserId: other.id, reportedUserId: fan.id, reason: 'spam',
    });
    assert.ok(r.caseId);
  });
  await t('le tenant d\'un commentaire est résolu via le post parent', async () => {
    // fan_comments n'a pas de tenant_id : sans cette résolution, le
    // cloisonnement club_admin ne tiendrait pas.
    const c = await mod.getContent('comment', com1.id);
    assert.equal(c.tenant_id, club.id);
  });
  await t('un type de contenu inconnu est rejeté', async () => {
    await assert.rejects(() => mod.getContent('facture', post1.id), (e) => e.code === 'BAD_CONTENT_TYPE');
  });

  await t('masquer un POST le retire du fil (sans le supprimer)', async () => {
    const { data: cs } = await supabase.from('chat_moderation_cases').select('id')
      .eq('content_type', 'post').eq('content_id', post1.id).in('status', ['open', 'in_review']).single();
    await mod.decideCase({ caseId: cs.id, decision: 'hide_message', reason: 'test', actorId: fan.id, actorType: 'super_admin' });

    const feed = await fanFeed.getFeed(club.id, fan.id);
    assert.equal((feed.posts || []).some((p) => p.id === post1.id), false, 'le post masqué ne doit plus être servi');
    const { data: still } = await supabase.from('fan_posts').select('id, moderation_status').eq('id', post1.id).single();
    assert.equal(still.moderation_status, 'hidden', 'jamais de suppression physique');
  });
  await t('retirer un COMMENTAIRE le retire du fil (sans le supprimer)', async () => {
    const { data: cs } = await supabase.from('chat_moderation_cases').select('id')
      .eq('content_type', 'comment').eq('content_id', com1.id).in('status', ['open', 'in_review']).single();
    await mod.decideCase({ caseId: cs.id, decision: 'remove_message', reason: 'test', actorId: fan.id, actorType: 'super_admin' });

    const { data: p2 } = await supabase.from('fan_posts')
      .insert({ tenant_id: club.id, author_id: fan.id, content: '[test] post visible' }).select('id').single();
    const feed = await fanFeed.getFeed(club.id, fan.id);
    assert.equal(JSON.stringify(feed).includes('[test] commentaire a moderer'), false, 'le commentaire retiré ne doit plus apparaître');
    const { data: still } = await supabase.from('fan_comments').select('moderation_status, deleted_at').eq('id', com1.id).single();
    assert.equal(still.moderation_status, 'removed');
    assert.ok(still.deleted_at, 'deleted_at doit être horodaté');
    await supabase.from('fan_posts').delete().eq('id', p2.id);
  });
  await t('l\'IA pré-classe aussi les posts', async () => {
    await setFlag(true);
    const { data: p3 } = await supabase.from('fan_posts')
      .insert({ tenant_id: club.id, author_id: fan.id, content: '[test] sale negre' }).select('id').single();
    const r = await ai.screenContent({ contentType: 'post', contentId: p3.id, tenantId: club.id, authorId: fan.id, content: 'sale negre' });
    assert.ok(r?.caseId, 'aucun dossier IA sur le post');
    const { data: c } = await supabase.from('chat_moderation_cases').select('content_type, source, priority').eq('id', r.caseId).single();
    assert.equal(c.content_type, 'post');
    assert.equal(c.source, 'ai');
    assert.equal(c.priority, 'critical');
    await supabase.from('chat_moderation_audit_logs').delete().eq('case_id', r.caseId);
    await supabase.from('chat_moderation_cases').delete().eq('id', r.caseId);
    await supabase.from('fan_posts').delete().eq('id', p3.id);
  });
  await t('la file affiche le type de contenu', async () => {
    const cases = await mod.listCases({ tenantId: club.id, status: null });
    const post = cases.find((c) => c.content_type === 'post');
    assert.ok(post, 'aucun dossier de post dans la file');
    assert.equal(post.contentLabel, 'Post du fil');
    assert.ok(post.content?.content?.includes('[test]'), 'le contenu du post doit être joint');
  });

  // nettoyage du fil
  const { data: feedCases } = await supabase.from('chat_moderation_cases').select('id')
    .in('content_type', ['post', 'comment']).in('content_id', [post1.id, com1.id]);
  const fcIds = (feedCases || []).map((c) => c.id);
  if (fcIds.length) {
    await supabase.from('chat_moderation_audit_logs').delete().in('case_id', fcIds);
    await supabase.from('chat_moderation_cases').delete().in('id', fcIds);
  }
  await supabase.from('chat_reports').delete().in('content_id', [post1.id, com1.id]);
  await supabase.from('fan_comments').delete().eq('id', com1.id);
  await supabase.from('fan_posts').delete().eq('id', post1.id);

  await restoreFlag();   // on rend le flag dans l'état trouvé (prod incluse)
  if (realKey) process.env.ANTHROPIC_API_KEY = realKey;
  await cleanup();
  console.log(`\n✅ ${passed} tests OK`);
  process.exit(0);
})().catch((err) => { console.error('\n❌ ÉCHEC:', err.message); process.exit(1); });
