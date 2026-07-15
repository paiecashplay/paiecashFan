// ═══════════════════════════════════════════════════════════════
// db/chatModeration.js — Modération des salons Fan Club (Lot 1).
// Charte d'accès, adhésion au salon, sanctions actives, signalements.
// Supabase service-role. Le signalant n'est JAMAIS exposé côté API.
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');
const { createNotification } = require('./notifications');

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

// ── Contenus modérables ──────────────────────────────────────
// Le chat (fan_messages) ET le fil (fan_posts, fan_comments) se modèrent à
// l'identique. Sans ça, publier dans le fil contournait toute la modération.
const CONTENT_TYPES = ['message', 'post', 'comment'];
const CONTENT_TABLE = { message: 'fan_messages', post: 'fan_posts', comment: 'fan_comments' };
const CONTENT_LABEL = { message: 'Message du chat', post: 'Post du fil', comment: 'Commentaire' };

function assertContentType(contentType) {
  if (!CONTENT_TYPES.includes(contentType)) {
    const e = new Error('Type de contenu inconnu.'); e.code = 'BAD_CONTENT_TYPE'; throw e;
  }
}

// Récupère un contenu et résout SON salon.
// ⚠️ fan_comments n'a pas de tenant_id : il est résolu via le post parent.
// Sans ça, le cloisonnement club_admin ne tiendrait pas sur les commentaires.
async function getContent(contentType, contentId) {
  assertContentType(contentType);

  if (contentType === 'comment') {
    const { data } = await supabase.from('fan_comments')
      .select('id, post_id, author_id, content, moderation_status, created_at')
      .eq('id', contentId).maybeSingle();
    if (!data) return null;
    const { data: post } = await supabase.from('fan_posts')
      .select('tenant_id').eq('id', data.post_id).maybeSingle();
    return { ...data, tenant_id: post?.tenant_id || null, contentType };
  }

  const { data } = await supabase.from(CONTENT_TABLE[contentType])
    .select('id, tenant_id, author_id, content, moderation_status, created_at')
    .eq('id', contentId).maybeSingle();
  return data ? { ...data, contentType } : null;
}

// ── Signalements ─────────────────────────────────────────────
// Un seul signalement par (contenu, signalant). Le signalant reste anonyme.
async function createReport({ contentType = 'message', contentId, tenantId, reporterUserId, reportedUserId, reason, comment }) {
  assertContentType(contentType);
  if (!REPORT_REASONS.includes(reason)) { const e = new Error('Motif invalide.'); e.code = 'BAD_REASON'; throw e; }
  const { data, error } = await supabase.from('chat_reports').insert({
    content_type: contentType, content_id: contentId, tenant_id: tenantId,
    reporter_user_id: reporterUserId, reported_user_id: reportedUserId,
    reason, comment: comment || null,
  }).select('id, created_at').single();

  if (error) {
    if (error.code === '23505') { const e = new Error('Tu as déjà signalé ce contenu.'); e.code = 'ALREADY_REPORTED'; throw e; }
    throw new Error(error.message);
  }

  // Alimente la file de modération (création ou incrément du dossier).
  const caseId = await upsertCaseForContent({ tenantId, contentType, contentId, targetUserId: reportedUserId, source: 'report' })
    .catch(() => null);   // best-effort : un signalement ne doit jamais échouer à cause du dossier

  return { id: data.id, createdAt: data.created_at, caseId };
}

// Nb de signalements ouverts sur un contenu (pour la file de modération).
async function countReports(contentType, contentId) {
  const { count } = await supabase.from('chat_reports')
    .select('id', { count: 'exact', head: true })
    .eq('content_type', contentType).eq('content_id', contentId);
  return count || 0;
}

// ── Journal d'audit (toute décision en laisse une trace) ─────
async function audit({ caseId, actorType, actorId = null, action, previousValue = null, newValue = null }) {
  await supabase.from('chat_moderation_audit_logs').insert({
    case_id: caseId || null, actor_type: actorType, actor_id: actorId, action,
    previous_value: previousValue, new_value: newValue,
  }).then(() => {}, () => {});   // best-effort : ne bloque jamais la décision
}

// ── File de modération (dossiers) ────────────────────────────
// Crée le dossier d'un contenu, ou incrémente le compteur s'il existe déjà.
// Un seul dossier ouvert par contenu (garanti par index unique).
const PRIORITY_RANK = { low: 0, normal: 1, high: 2, critical: 3 };
const worst = (a, b) => (PRIORITY_RANK[b] > PRIORITY_RANK[a] ? b : a);

// `ai` = verdict du pré-classement (lot 5). Un dossier ne peut que MONTER
// en priorité : un signalement humain ne doit pas être enterré par l'IA,
// et inversement.
async function upsertCaseForContent({ tenantId, contentType = 'message', contentId, targetUserId, source = 'report', ai = null }) {
  assertContentType(contentType);
  const reports = await countReports(contentType, contentId);
  let priority = reports >= 3 ? 'high' : 'normal';
  if (ai?.priority) priority = worst(priority, ai.priority);

  const aiCols = ai ? {
    ai_risk_score: ai.score, ai_categories: ai.categories,
    ai_summary: `[${ai.provider}] ${ai.riskLevel} — ${ai.explanation}`.slice(0, 500),
  } : {};

  const { data: existing } = await supabase.from('chat_moderation_cases')
    .select('id, reports_count, priority, source')
    .eq('content_type', contentType).eq('content_id', contentId)
    .in('status', ['open', 'in_review']).maybeSingle();

  if (existing) {
    await supabase.from('chat_moderation_cases')
      .update({ reports_count: reports, priority: worst(existing.priority, priority), ...aiCols })
      .eq('id', existing.id);
    if (ai) await audit({ caseId: existing.id, actorType: 'ai', action: 'ai_screened', newValue: { riskLevel: ai.riskLevel, categories: ai.categories, provider: ai.provider } });
    return existing.id;
  }

  const { data, error } = await supabase.from('chat_moderation_cases').insert({
    tenant_id: tenantId, content_type: contentType, content_id: contentId,
    target_user_id: targetUserId, source, status: 'open', priority, reports_count: reports, ...aiCols,
  }).select('id').single();
  if (error) throw new Error(error.message);

  await supabase.from(CONTENT_TABLE[contentType])
    .update({ moderation_case_id: data.id }).eq('id', contentId);
  await audit({
    caseId: data.id, actorType: ai ? 'ai' : 'system', action: 'case_opened',
    newValue: ai
      ? { source, contentType, reports, riskLevel: ai.riskLevel, categories: ai.categories, provider: ai.provider }
      : { source, contentType, reports },
  });
  return data.id;
}

// Liste la file. `tenantId` non nul = club_admin borné à son salon.
async function listCases({ tenantId = null, status = null, priority = null, contentType = null, limit = 100 } = {}) {
  let q = supabase.from('chat_moderation_cases')
    .select('id, tenant_id, content_type, content_id, target_user_id, source, status, priority, reports_count, ai_risk_score, ai_summary, decision, created_at, resolved_at')
    .order('created_at', { ascending: false }).limit(limit);
  if (tenantId) q = q.eq('tenant_id', tenantId);
  if (status) q = q.eq('status', status);
  if (priority) q = q.eq('priority', priority);
  if (contentType) q = q.eq('content_type', contentType);
  const { data: cases } = await q;
  if (!cases?.length) return [];

  // Les contenus vivent dans 3 tables : une requête par type présent.
  const byType = {};
  for (const c of cases) {
    if (!c.content_id) continue;
    (byType[c.content_type] ||= new Set()).add(c.content_id);
  }
  const contentRows = await Promise.all(Object.entries(byType).map(async ([type, ids]) => {
    const { data } = await supabase.from(CONTENT_TABLE[type])
      .select('id, content, moderation_status, created_at').in('id', [...ids]);
    return (data || []).map((r) => [`${type}:${r.id}`, r]);
  }));
  const contentByKey = Object.fromEntries(contentRows.flat());

  const userIds = [...new Set(cases.map((c) => c.target_user_id))];
  const tenantIds = [...new Set(cases.map((c) => c.tenant_id))];
  const [{ data: profs }, { data: clubs }] = await Promise.all([
    userIds.length ? supabase.from('profiles').select('id, display_name, avatar_url').in('id', userIds) : { data: [] },
    tenantIds.length ? supabase.from('tenants').select('id, name, slug').in('id', tenantIds) : { data: [] },
  ]);
  const pById = Object.fromEntries((profs || []).map((p) => [p.id, p]));
  const cById = Object.fromEntries((clubs || []).map((c) => [c.id, c]));

  return cases.map((c) => {
    const content = contentByKey[`${c.content_type}:${c.content_id}`] || null;
    return {
      ...c,
      content,
      contentLabel: CONTENT_LABEL[c.content_type] || c.content_type,
      message: content,   // rétro-compat front
      target: pById[c.target_user_id] ? { id: c.target_user_id, name: pById[c.target_user_id].display_name, avatar: pById[c.target_user_id].avatar_url } : { id: c.target_user_id, name: 'Supporter', avatar: null },
      club: cById[c.tenant_id] || null,
    };
  });
}

// Détail d'un dossier : contenu, contexte, signalements ANONYMISÉS, historique.
async function getCase(caseId) {
  const { data: c } = await supabase.from('chat_moderation_cases').select('*').eq('id', caseId).maybeSingle();
  if (!c) return null;

  const [msg, { data: reports }, { data: prof }, { data: club }] = await Promise.all([
    c.content_id ? getContent(c.content_type, c.content_id).catch(() => null) : null,
    // ⚠️ On ne sélectionne JAMAIS reporter_user_id : le signalant reste anonyme.
    supabase.from('chat_reports').select('id, reason, comment, status, created_at')
      .eq('content_type', c.content_type).eq('content_id', c.content_id)
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, display_name, avatar_url').eq('id', c.target_user_id).maybeSingle(),
    supabase.from('tenants').select('id, name, slug').eq('id', c.tenant_id).maybeSingle(),
  ]);

  // Contexte : ce qui entoure le contenu. Le sens diffère selon le type —
  //  · message    → les messages voisins du salon (±3)
  //  · commentaire→ les autres commentaires du même post
  //  · post       → aucun (il est autoportant)
  let context = [];
  if (msg && c.content_type === 'message') {
    const { data: around } = await supabase.from('fan_messages')
      .select('id, author_id, content, created_at, moderation_status')
      .eq('tenant_id', c.tenant_id).order('created_at', { ascending: true }).limit(200);
    const all = around || [];
    const idx = all.findIndex((m) => m.id === msg.id);
    context = idx >= 0 ? all.slice(Math.max(0, idx - 3), idx + 4) : [];
  } else if (msg && c.content_type === 'comment') {
    const { data: siblings } = await supabase.from('fan_comments')
      .select('id, author_id, content, created_at, moderation_status')
      .eq('post_id', msg.post_id).order('created_at', { ascending: true }).limit(20);
    context = siblings || [];
  }
  if (context.length) {
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
    content: msg || null,
    contentLabel: CONTENT_LABEL[c.content_type] || c.content_type,
    message: msg || null,             // rétro-compat front
    club: club || null,
    target: prof ? { id: prof.id, name: prof.display_name, avatar: prof.avatar_url } : { id: c.target_user_id, name: 'Supporter', avatar: null },
    reports: reports || [],           // anonymes
    context,
    history: history || [],
    sanctions: sanctions || [],
    auditLogs: logs || [],
  };
}

// ── Sanctions (lot 3) ────────────────────────────────────────
const SANCTION_TYPES = ['warning', 'mute', 'room_suspension', 'room_ban', 'global_chat_ban', 'account_review'];
// Portée plateforme → super_admin uniquement (un club_admin ne bannit pas de TOUS
// les salons, ni ne déclenche l'examen d'un compte).
const GLOBAL_TYPES = ['global_chat_ban', 'account_review'];
// Seules ces sanctions peuvent être définitives (et toujours par un humain).
const PERMANENT_ALLOWED = ['room_ban', 'global_chat_ban'];

function allowedSanctionsFor(moderatorType) {
  return moderatorType === 'super_admin' ? SANCTION_TYPES : SANCTION_TYPES.filter((t) => !GLOBAL_TYPES.includes(t));
}

const SANCTION_LABEL = {
  warning: 'Avertissement', mute: 'Lecture seule', room_suspension: 'Suspension du salon',
  room_ban: 'Exclusion du salon', global_chat_ban: 'Exclusion de tous les salons', account_review: 'Compte en cours d\'examen',
};

// Émet une sanction. `issuedBy` = l'humain qui décide (NULL = système/IA).
async function issueSanction({ userId, tenantId = null, caseId = null, type, durationHours = null, isPermanent = false, reasonCode = null, reasonText = null, issuedBy = null, actorType = 'system' }) {
  if (!SANCTION_TYPES.includes(type)) { const e = new Error('Type de sanction invalide.'); e.code = 'BAD_TYPE'; throw e; }
  if (!allowedSanctionsFor(actorType).includes(type)) {
    const e = new Error('Seul un super administrateur peut prononcer cette sanction.'); e.code = 'FORBIDDEN_TYPE'; throw e;
  }
  if (isPermanent && !PERMANENT_ALLOWED.includes(type)) { const e = new Error('Cette sanction ne peut pas être définitive.'); e.code = 'BAD_PERMANENT'; throw e; }
  // 🔒 Une exclusion définitive exige TOUJOURS un humain (double garde : ici + CHECK en base).
  if (isPermanent && !issuedBy) { const e = new Error('Une exclusion définitive doit être confirmée par un humain.'); e.code = 'NEEDS_HUMAN'; throw e; }
  // 🔒 Une sanction bloquante non définitive DOIT avoir une durée, sinon elle
  // n'expirerait jamais → ce serait une exclusion permanente déguisée.
  if (WRITE_BLOCKING.includes(type) && !isPermanent && !durationHours) {
    const e = new Error('Une durée est requise (ou marque la sanction comme définitive).'); e.code = 'DURATION_REQUIRED'; throw e;
  }

  const scope = GLOBAL_TYPES.includes(type) ? 'global' : 'room';
  const endsAt = isPermanent ? null : (durationHours ? new Date(Date.now() + durationHours * 3600 * 1000).toISOString() : null);

  const { data, error } = await supabase.from('chat_sanctions').insert({
    user_id: userId, tenant_id: scope === 'global' ? null : tenantId, case_id: caseId,
    sanction_type: type, scope, ends_at: endsAt, is_permanent: isPermanent,
    reason_code: reasonCode, reason_text: reasonText, issued_by: issuedBy,
  }).select('*').single();
  if (error) throw new Error(error.message);

  await audit({ caseId, actorType, actorId: issuedBy, action: 'sanction:' + type,
    newValue: { sanctionId: data.id, type, scope, endsAt, isPermanent, reasonCode } });
  await notifySanction(data, tenantId).catch(() => {});
  return data;
}

// Lève une sanction (révocation) + notifie.
async function revokeSanction({ sanctionId, actorId, actorType }) {
  const { data: s } = await supabase.from('chat_sanctions').select('*').eq('id', sanctionId).maybeSingle();
  if (!s) { const e = new Error('Sanction introuvable.'); e.code = 'NOT_FOUND'; throw e; }
  if (s.revoked_at) { const e = new Error('Sanction déjà levée.'); e.code = 'ALREADY_REVOKED'; throw e; }

  const now = new Date().toISOString();
  await supabase.from('chat_sanctions').update({ revoked_at: now, revoked_by: actorId }).eq('id', sanctionId);
  await audit({ caseId: s.case_id, actorType, actorId, action: 'sanction_revoked',
    previousValue: { type: s.sanction_type }, newValue: { sanctionId } });
  await createNotification({
    user_id: s.user_id, type: 'chat_sanction_revoked',
    title: '✅ Sanction levée',
    message: `Ta sanction « ${SANCTION_LABEL[s.sanction_type] || s.sanction_type} » a été levée. Tu peux de nouveau participer.`,
    metadata: { sanctionId, caseId: s.case_id },
  }).catch(() => {});
  return { id: sanctionId, revoked: true };
}

// Notifie le supporter sanctionné.
async function notifySanction(s, tenantId) {
  let clubName = null;
  if (s.tenant_id || tenantId) {
    const { data: c } = await supabase.from('tenants').select('name').eq('id', s.tenant_id || tenantId).maybeSingle();
    clubName = c?.name || null;
  }
  const where = s.scope === 'global' ? 'tous les salons' : `le salon${clubName ? ` de ${clubName}` : ''}`;
  const until = s.ends_at ? ` jusqu'au ${new Date(s.ends_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}` : (s.is_permanent ? ' de façon définitive' : '');
  const map = {
    warning: { title: '⚠️ Avertissement', message: `Un de tes messages a enfreint la charte${clubName ? ` du salon de ${clubName}` : ''}. Merci de respecter les règles.` },
    mute: { title: '🔇 Lecture seule', message: `Tu ne peux plus publier dans ${where}${until}.` },
    room_suspension: { title: '⏸️ Suspension', message: `Tu es suspendu de ${where}${until}.` },
    room_ban: { title: '🚫 Exclusion', message: `Tu es exclu de ${where}${until}.` },
    global_chat_ban: { title: '🚫 Exclusion des salons', message: `Tu es exclu de ${where}${until}.` },
    account_review: { title: '🔎 Compte en cours d\'examen', message: 'Ton compte fait l\'objet d\'un examen par notre équipe.' },
  };
  const m = map[s.sanction_type];
  if (!m) return;
  await createNotification({
    user_id: s.user_id, type: 'chat_sanction', title: m.title,
    message: m.message + (s.reason_text ? ` Motif : ${s.reason_text}` : ''),
    metadata: { sanctionId: s.id, caseId: s.case_id, type: s.sanction_type, endsAt: s.ends_at, isPermanent: s.is_permanent, canAppeal: true },
  });
}

// Mes sanctions (actives + passées) — pour /me/chat-sanctions.
async function listMySanctions(userId) {
  const { data } = await supabase.from('chat_sanctions')
    .select('id, tenant_id, case_id, sanction_type, scope, starts_at, ends_at, is_permanent, reason_text, revoked_at, created_at')
    .eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
  const ids = [...new Set((data || []).map((s) => s.tenant_id).filter(Boolean))];
  const { data: clubs } = ids.length ? await supabase.from('tenants').select('id, name, slug').in('id', ids) : { data: [] };
  const byId = Object.fromEntries((clubs || []).map((c) => [c.id, c]));
  const now = Date.now();
  return (data || []).map((s) => ({
    ...s,
    label: SANCTION_LABEL[s.sanction_type] || s.sanction_type,
    club: s.tenant_id ? byId[s.tenant_id] || null : null,
    isActive: !s.revoked_at && (s.is_permanent || !s.ends_at || new Date(s.ends_at).getTime() > now),
  }));
}

// ── Historique & audit (lot 4) ───────────────────────────────
// Profil de modération d'un supporter. `tenantId` non nul = vue club_admin :
// on ne lui montre QUE son salon (+ les sanctions globales, qui l'impactent).
async function getUserModerationHistory(userId, { tenantId = null } = {}) {
  const { data: prof } = await supabase.from('profiles')
    .select('id, display_name, avatar_url, created_at').eq('id', userId).maybeSingle();

  let cq = supabase.from('chat_moderation_cases')
    .select('id, tenant_id, content_type, source, status, priority, decision, decision_reason, reports_count, created_at, resolved_at')
    .eq('target_user_id', userId).order('created_at', { ascending: false }).limit(50);
  if (tenantId) cq = cq.eq('tenant_id', tenantId);

  let sq = supabase.from('chat_sanctions')
    .select('id, tenant_id, case_id, sanction_type, scope, starts_at, ends_at, is_permanent, reason_text, issued_by, revoked_at, created_at')
    .eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
  if (tenantId) sq = sq.or(`tenant_id.eq.${tenantId},scope.eq.global`);

  // L'activité couvre les 3 surfaces : chat, posts, commentaires.
  // (fan_comments n'a pas de tenant_id → non borné par salon ; c'est assumé,
  //  le compteur reste indicatif.)
  const countIn = async (table, scoped) => {
    let q = supabase.from(table).select('id', { count: 'exact', head: true }).eq('author_id', userId);
    if (tenantId && table !== 'fan_comments') q = q.eq('tenant_id', tenantId);
    if (scoped) q = q.in('moderation_status', ['hidden', 'removed', 'blocked']);
    const { count } = await q;
    return count || 0;
  };

  const [{ data: cases }, { data: sanctions }, msgN, postN, comN, msgMod, postMod, comMod] = await Promise.all([
    cq, sq,
    countIn('fan_messages', false), countIn('fan_posts', false), countIn('fan_comments', false),
    countIn('fan_messages', true), countIn('fan_posts', true), countIn('fan_comments', true),
  ]);
  const messages = msgN + postN + comN;
  const moderated = msgMod + postMod + comMod;

  // Noms des clubs concernés
  const tIds = [...new Set([...(cases || []).map((c) => c.tenant_id), ...(sanctions || []).map((s) => s.tenant_id)].filter(Boolean))];
  const { data: clubs } = tIds.length ? await supabase.from('tenants').select('id, name, slug').in('id', tIds) : { data: [] };
  const cById = Object.fromEntries((clubs || []).map((c) => [c.id, c]));
  const now = Date.now();

  return {
    user: prof ? { id: prof.id, name: prof.display_name, avatar: prof.avatar_url, memberSince: prof.created_at }
      : { id: userId, name: 'Supporter', avatar: null, memberSince: null },
    stats: {
      messages: messages || 0,
      moderated: moderated || 0,
      cases: (cases || []).length,
      sanctions: (sanctions || []).length,
      activeSanctions: (sanctions || []).filter((s) => !s.revoked_at && (s.is_permanent || !s.ends_at || new Date(s.ends_at).getTime() > now)).length,
    },
    cases: (cases || []).map((c) => ({ ...c, club: cById[c.tenant_id] || null })),
    sanctions: (sanctions || []).map((s) => ({
      ...s, label: SANCTION_LABEL[s.sanction_type] || s.sanction_type, club: s.tenant_id ? cById[s.tenant_id] || null : null,
      isActive: !s.revoked_at && (s.is_permanent || !s.ends_at || new Date(s.ends_at).getTime() > now),
    })),
  };
}

// Journal d'audit consultable (filtrable). Enrichi du nom de l'acteur.
async function listAuditLogs({ caseId = null, tenantId = null, actorId = null, limit = 100 } = {}) {
  let caseIds = null;
  if (tenantId) {
    const { data: tc } = await supabase.from('chat_moderation_cases').select('id').eq('tenant_id', tenantId).limit(500);
    caseIds = (tc || []).map((c) => c.id);
    if (!caseIds.length) return [];
  }

  let q = supabase.from('chat_moderation_audit_logs')
    .select('id, case_id, actor_type, actor_id, action, previous_value, new_value, created_at')
    .order('created_at', { ascending: false }).limit(limit);
  if (caseId) q = q.eq('case_id', caseId);
  if (caseIds) q = q.in('case_id', caseIds);
  if (actorId) q = q.eq('actor_id', actorId);
  const { data: logs } = await q;
  if (!logs?.length) return [];

  const ids = [...new Set(logs.map((l) => l.actor_id).filter(Boolean))];
  const { data: profs } = ids.length ? await supabase.from('profiles').select('id, display_name').in('id', ids) : { data: [] };
  const byId = Object.fromEntries((profs || []).map((p) => [p.id, p.display_name]));
  // actor_id NULL + actor_type ai/system = action automatique
  return logs.map((l) => ({ ...l, actorName: l.actor_id ? (byId[l.actor_id] || 'Modérateur') : (l.actor_type === 'ai' ? 'IA' : 'Système') }));
}

// Décisions sur un dossier (une sanction peut y être jointe).
const CASE_DECISIONS = ['dismiss', 'hide_message', 'remove_message'];

// Statue sur un dossier + applique l'action au message (+ sanction) + audite.
async function decideCase({ caseId, decision, reason = null, actorId, actorType, sanction = null }) {
  if (!CASE_DECISIONS.includes(decision)) { const e = new Error('Décision invalide.'); e.code = 'BAD_DECISION'; throw e; }
  const { data: c } = await supabase.from('chat_moderation_cases').select('*').eq('id', caseId).maybeSingle();
  if (!c) { const e = new Error('Dossier introuvable.'); e.code = 'NOT_FOUND'; throw e; }
  if (['resolved', 'dismissed'].includes(c.status)) { const e = new Error('Ce dossier est déjà clos.'); e.code = 'ALREADY_CLOSED'; throw e; }

  const now = new Date().toISOString();
  let previousMsgStatus = null;
  const table = CONTENT_TABLE[c.content_type];

  // Action sur le contenu (message, post OU commentaire) — JAMAIS de
  // suppression physique.
  if (c.content_id && table && decision !== 'dismiss') {
    const { data: m } = await supabase.from(table).select('moderation_status').eq('id', c.content_id).maybeSingle();
    previousMsgStatus = m?.moderation_status || null;
    const patch = decision === 'hide_message'
      ? { moderation_status: 'hidden' }
      : { moderation_status: 'removed', deleted_at: now };
    await supabase.from(table).update(patch).eq('id', c.content_id);
  }

  // Sanction éventuelle (émise AVANT la clôture pour que l'audit la rattache).
  let issued = null;
  if (sanction?.type) {
    issued = await issueSanction({
      userId: c.target_user_id, tenantId: c.tenant_id, caseId,
      type: sanction.type,
      durationHours: sanction.durationHours ? Number(sanction.durationHours) : null,
      isPermanent: !!sanction.isPermanent,
      reasonCode: sanction.reasonCode || null,
      reasonText: reason || sanction.reasonText || null,
      issuedBy: actorId, actorType,
    });
  }

  const newStatus = decision === 'dismiss' ? 'dismissed' : 'resolved';
  await supabase.from('chat_moderation_cases').update({
    status: newStatus, decision, decision_reason: reason, resolved_at: now, resolved_by: actorId,
  }).eq('id', caseId);

  // Les signalements liés passent en « traités ».
  if (c.content_id) {
    await supabase.from('chat_reports').update({ status: decision === 'dismiss' ? 'dismissed' : 'reviewed', reviewed_by: actorId, reviewed_at: now })
      .eq('content_type', c.content_type).eq('content_id', c.content_id).eq('status', 'open');
  }

  await audit({
    caseId, actorType, actorId, action: 'decision:' + decision,
    previousValue: { caseStatus: c.status, messageStatus: previousMsgStatus },
    newValue: { caseStatus: newStatus, decision, reason, sanctionId: issued?.id || null },
  });

  return { id: caseId, status: newStatus, decision, sanction: issued ? { id: issued.id, type: issued.sanction_type } : null };
}

module.exports = {
  CHARTER_VERSION, REPORT_REASONS, WRITE_BLOCKING, CASE_DECISIONS,
  SANCTION_TYPES, GLOBAL_TYPES, PERMANENT_ALLOWED, SANCTION_LABEL, allowedSanctionsFor,
  getMembership, needsCharter, acceptCharter,
  getActiveSanction, createReport, countReports,
  audit, upsertCaseForContent, listCases, getCase, decideCase,
  issueSanction, revokeSanction, listMySanctions,
  getUserModerationHistory, listAuditLogs,
  CONTENT_TYPES, CONTENT_TABLE, CONTENT_LABEL, getContent,
};
