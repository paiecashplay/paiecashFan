// ═══════════════════════════════════════════════════════════════
// db/chatModeration.js — Modération des salons Fan Club (Lot 1).
// Charte d'accès, adhésion au salon, sanctions actives, signalements.
// Supabase service-role. Le signalant n'est JAMAIS exposé côté API.
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

// Version de la charte : incrémenter la date force une nouvelle acceptation.
const CHARTER_VERSION = '2026-07-15';

// Motifs de signalement autorisés (alignés sur les catégories de modération).
const REPORT_REASONS = [
  'insult', 'harassment', 'hate', 'racism', 'threat', 'violence',
  'sexual_content', 'personal_data', 'spam', 'provocation', 'other',
];

// Sanctions qui bloquent l'écriture (warning/account_review ne bloquent pas).
const WRITE_BLOCKING = ['mute', 'room_suspension', 'room_ban', 'global_chat_ban'];

// ── Adhésion au salon / charte ───────────────────────────────
async function getMembership(tenantId, userId) {
  const { data } = await supabase.from('chat_room_memberships')
    .select('*').eq('tenant_id', tenantId).eq('user_id', userId).maybeSingle();
  return data || null;
}

// La charte doit-elle être (re)signée ? (jamais acceptée, ou version périmée)
async function needsCharter(tenantId, userId) {
  const m = await getMembership(tenantId, userId);
  return !m || m.charter_version !== CHARTER_VERSION;
}

// Enregistre l'acceptation (upsert) + met à jour la dernière visite.
async function acceptCharter(tenantId, userId) {
  const now = new Date().toISOString();
  const existing = await getMembership(tenantId, userId);
  if (existing) {
    const { error } = await supabase.from('chat_room_memberships')
      .update({ charter_version: CHARTER_VERSION, charter_accepted_at: now, last_joined_at: now, updated_at: now })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('chat_room_memberships').insert({
      tenant_id: tenantId, user_id: userId, charter_version: CHARTER_VERSION,
      charter_accepted_at: now, first_joined_at: now, last_joined_at: now,
    });
    if (error) throw new Error(error.message);
  }
  return { charterVersion: CHARTER_VERSION, acceptedAt: now };
}

// ── Sanctions actives ────────────────────────────────────────
// Retourne la sanction bloquante la plus forte pour ce salon (ou globale).
// Une sanction expirée (ends_at passé) ou révoquée ne bloque plus.
async function getActiveSanction(userId, tenantId = null) {
  if (!userId) return null;
  const nowIso = new Date().toISOString();
  const { data } = await supabase.from('chat_sanctions')
    .select('id, sanction_type, scope, tenant_id, ends_at, is_permanent, reason_code, reason_text, case_id, created_at')
    .eq('user_id', userId).is('revoked_at', null)
    .order('created_at', { ascending: false });

  const active = (data || []).filter((s) => {
    if (!s.is_permanent && s.ends_at && new Date(s.ends_at).getTime() <= Date.parse(nowIso)) return false; // expirée
    if (s.scope === 'global' || !s.tenant_id) return true;          // globale
    return tenantId && s.tenant_id === tenantId;                    // ce salon
  });

  const blocking = active.filter((s) => WRITE_BLOCKING.includes(s.sanction_type));
  const chosen = blocking[0] || null;   // la plus récente
  if (!chosen) return null;
  return {
    id: chosen.id, type: chosen.sanction_type, scope: chosen.scope,
    endsAt: chosen.ends_at, isPermanent: chosen.is_permanent,
    reasonCode: chosen.reason_code, reasonText: chosen.reason_text, caseId: chosen.case_id,
  };
}

// ── Signalements ─────────────────────────────────────────────
// Un seul signalement par (message, signalant). Le signalant reste anonyme.
async function createReport({ messageId, tenantId, reporterUserId, reportedUserId, reason, comment }) {
  if (!REPORT_REASONS.includes(reason)) { const e = new Error('Motif invalide.'); e.code = 'BAD_REASON'; throw e; }
  const { data, error } = await supabase.from('chat_reports').insert({
    message_id: messageId, tenant_id: tenantId, reporter_user_id: reporterUserId,
    reported_user_id: reportedUserId, reason, comment: comment || null,
  }).select('id, created_at').single();

  if (error) {
    if (error.code === '23505') { const e = new Error('Tu as déjà signalé ce message.'); e.code = 'ALREADY_REPORTED'; throw e; }
    throw new Error(error.message);
  }

  // Alimente la file de modération (création ou incrément du dossier).
  const caseId = await upsertCaseForMessage({ tenantId, messageId, targetUserId: reportedUserId, source: 'report' })
    .catch(() => null);   // best-effort : un signalement ne doit jamais échouer à cause du dossier

  return { id: data.id, createdAt: data.created_at, caseId };
}

// Nb de signalements ouverts sur un message (pour la file de modération, lot 2).
async function countReports(messageId) {
  const { count } = await supabase.from('chat_reports')
    .select('id', { count: 'exact', head: true }).eq('message_id', messageId);
  return count || 0;
}

// Récupère un message du salon (pour vérifier l'appartenance au tenant).
async function getMessage(messageId) {
  const { data } = await supabase.from('fan_messages')
    .select('id, tenant_id, author_id, content, moderation_status, created_at').eq('id', messageId).maybeSingle();
  return data || null;
}

// ── Journal d'audit (toute décision en laisse une trace) ─────
async function audit({ caseId, actorType, actorId = null, action, previousValue = null, newValue = null }) {
  await supabase.from('chat_moderation_audit_logs').insert({
    case_id: caseId || null, actor_type: actorType, actor_id: actorId, action,
    previous_value: previousValue, new_value: newValue,
  }).then(() => {}, () => {});   // best-effort : ne bloque jamais la décision
}

// ── File de modération (dossiers) ────────────────────────────
// Crée le dossier d'un message, ou incrémente le compteur s'il existe déjà.
// Un seul dossier ouvert par message (garanti par index unique).
async function upsertCaseForMessage({ tenantId, messageId, targetUserId, source = 'report' }) {
  const reports = await countReports(messageId);
  const priority = reports >= 3 ? 'high' : 'normal';

  const { data: existing } = await supabase.from('chat_moderation_cases')
    .select('id, reports_count, priority').eq('message_id', messageId)
    .in('status', ['open', 'in_review']).maybeSingle();

  if (existing) {
    await supabase.from('chat_moderation_cases')
      .update({ reports_count: reports, priority }).eq('id', existing.id);
    return existing.id;
  }

  const { data, error } = await supabase.from('chat_moderation_cases').insert({
    tenant_id: tenantId, message_id: messageId, target_user_id: targetUserId,
    source, status: 'open', priority, reports_count: reports,
  }).select('id').single();
  if (error) throw new Error(error.message);

  await supabase.from('fan_messages').update({ moderation_case_id: data.id }).eq('id', messageId);
  await audit({ caseId: data.id, actorType: 'system', action: 'case_opened', newValue: { source, reports } });
  return data.id;
}

// Liste la file. `tenantId` non nul = club_admin borné à son salon.
async function listCases({ tenantId = null, status = null, priority = null, limit = 100 } = {}) {
  let q = supabase.from('chat_moderation_cases')
    .select('id, tenant_id, message_id, target_user_id, source, status, priority, reports_count, ai_risk_score, ai_summary, decision, created_at, resolved_at')
    .order('created_at', { ascending: false }).limit(limit);
  if (tenantId) q = q.eq('tenant_id', tenantId);
  if (status) q = q.eq('status', status);
  if (priority) q = q.eq('priority', priority);
  const { data: cases } = await q;
  if (!cases?.length) return [];

  const msgIds = [...new Set(cases.map((c) => c.message_id).filter(Boolean))];
  const userIds = [...new Set(cases.map((c) => c.target_user_id))];
  const tenantIds = [...new Set(cases.map((c) => c.tenant_id))];
  const [{ data: msgs }, { data: profs }, { data: clubs }] = await Promise.all([
    msgIds.length ? supabase.from('fan_messages').select('id, content, moderation_status, created_at').in('id', msgIds) : { data: [] },
    userIds.length ? supabase.from('profiles').select('id, display_name, avatar_url').in('id', userIds) : { data: [] },
    tenantIds.length ? supabase.from('tenants').select('id, name, slug').in('id', tenantIds) : { data: [] },
  ]);
  const mById = Object.fromEntries((msgs || []).map((m) => [m.id, m]));
  const pById = Object.fromEntries((profs || []).map((p) => [p.id, p]));
  const cById = Object.fromEntries((clubs || []).map((c) => [c.id, c]));

  return cases.map((c) => ({
    ...c,
    message: mById[c.message_id] || null,
    target: pById[c.target_user_id] ? { id: c.target_user_id, name: pById[c.target_user_id].display_name, avatar: pById[c.target_user_id].avatar_url } : { id: c.target_user_id, name: 'Supporter', avatar: null },
    club: cById[c.tenant_id] || null,
  }));
}

// Détail d'un dossier : message, contexte, signalements ANONYMISÉS, historique.
async function getCase(caseId) {
  const { data: c } = await supabase.from('chat_moderation_cases').select('*').eq('id', caseId).maybeSingle();
  if (!c) return null;

  const [{ data: msg }, { data: reports }, { data: prof }, { data: club }] = await Promise.all([
    c.message_id ? supabase.from('fan_messages').select('id, content, author_id, moderation_status, created_at').eq('id', c.message_id).maybeSingle() : { data: null },
    // ⚠️ On ne sélectionne JAMAIS reporter_user_id : le signalant reste anonyme.
    supabase.from('chat_reports').select('id, reason, comment, status, created_at').eq('message_id', c.message_id).order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, display_name, avatar_url').eq('id', c.target_user_id).maybeSingle(),
    supabase.from('tenants').select('id, name, slug').eq('id', c.tenant_id).maybeSingle(),
  ]);

  // Contexte : messages autour (avant/après) dans le même salon.
  let context = [];
  if (msg) {
    const { data: around } = await supabase.from('fan_messages')
      .select('id, author_id, content, created_at, moderation_status')
      .eq('tenant_id', c.tenant_id).order('created_at', { ascending: true }).limit(200);
    const all = around || [];
    const idx = all.findIndex((m) => m.id === msg.id);
    context = idx >= 0 ? all.slice(Math.max(0, idx - 3), idx + 4) : [];
    const ids = [...new Set(context.map((m) => m.author_id))];
    const { data: cp } = ids.length ? await supabase.from('profiles').select('id, display_name').in('id', ids) : { data: [] };
    const cpById = Object.fromEntries((cp || []).map((p) => [p.id, p.display_name]));
    context = context.map((m) => ({ ...m, author: cpById[m.author_id] || 'Supporter', isTarget: m.id === msg.id }));
  }

  // Historique de modération de l'utilisateur ciblé.
  const { data: history } = await supabase.from('chat_moderation_cases')
    .select('id, tenant_id, status, decision, priority, created_at').eq('target_user_id', c.target_user_id)
    .neq('id', caseId).order('created_at', { ascending: false }).limit(10);
  const { data: sanctions } = await supabase.from('chat_sanctions')
    .select('id, sanction_type, scope, ends_at, is_permanent, revoked_at, created_at').eq('user_id', c.target_user_id)
    .order('created_at', { ascending: false }).limit(10);
  const { data: logs } = await supabase.from('chat_moderation_audit_logs')
    .select('id, actor_type, actor_id, action, new_value, created_at').eq('case_id', caseId).order('created_at', { ascending: false });

  return {
    ...c,
    message: msg || null,
    club: club || null,
    target: prof ? { id: prof.id, name: prof.display_name, avatar: prof.avatar_url } : { id: c.target_user_id, name: 'Supporter', avatar: null },
    reports: reports || [],           // anonymes
    context,
    history: history || [],
    sanctions: sanctions || [],
    auditLogs: logs || [],
  };
}

// Décisions du lot 2 (les sanctions arrivent au lot 3).
const CASE_DECISIONS = ['dismiss', 'hide_message', 'remove_message'];

// Statue sur un dossier + applique l'action au message + audite.
async function decideCase({ caseId, decision, reason = null, actorId, actorType }) {
  if (!CASE_DECISIONS.includes(decision)) { const e = new Error('Décision invalide.'); e.code = 'BAD_DECISION'; throw e; }
  const { data: c } = await supabase.from('chat_moderation_cases').select('*').eq('id', caseId).maybeSingle();
  if (!c) { const e = new Error('Dossier introuvable.'); e.code = 'NOT_FOUND'; throw e; }
  if (['resolved', 'dismissed'].includes(c.status)) { const e = new Error('Ce dossier est déjà clos.'); e.code = 'ALREADY_CLOSED'; throw e; }

  const now = new Date().toISOString();
  let previousMsgStatus = null;

  // Action sur le message — JAMAIS de suppression physique.
  if (c.message_id && decision !== 'dismiss') {
    const { data: m } = await supabase.from('fan_messages').select('moderation_status').eq('id', c.message_id).maybeSingle();
    previousMsgStatus = m?.moderation_status || null;
    const patch = decision === 'hide_message'
      ? { moderation_status: 'hidden' }
      : { moderation_status: 'removed', deleted_at: now };
    await supabase.from('fan_messages').update(patch).eq('id', c.message_id);
  }

  const newStatus = decision === 'dismiss' ? 'dismissed' : 'resolved';
  await supabase.from('chat_moderation_cases').update({
    status: newStatus, decision, decision_reason: reason, resolved_at: now, resolved_by: actorId,
  }).eq('id', caseId);

  // Les signalements liés passent en « traités ».
  if (c.message_id) {
    await supabase.from('chat_reports').update({ status: decision === 'dismiss' ? 'dismissed' : 'reviewed', reviewed_by: actorId, reviewed_at: now })
      .eq('message_id', c.message_id).eq('status', 'open');
  }

  await audit({
    caseId, actorType, actorId, action: 'decision:' + decision,
    previousValue: { caseStatus: c.status, messageStatus: previousMsgStatus },
    newValue: { caseStatus: newStatus, decision, reason },
  });

  return { id: caseId, status: newStatus, decision };
}

module.exports = {
  CHARTER_VERSION, REPORT_REASONS, WRITE_BLOCKING, CASE_DECISIONS,
  getMembership, needsCharter, acceptCharter,
  getActiveSanction, createReport, countReports, getMessage,
  audit, upsertCaseForMessage, listCases, getCase, decideCase,
};
