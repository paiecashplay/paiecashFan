// ═══════════════════════════════════════════════════════════════
// db/chatAppeals.js — Lot 7 : appels (contestation d'une décision).
//
// Un fan conteste soit un CONTENU modéré (dossier hide/remove), soit une
// SANCTION. Un modérateur accepte (réparation automatique : republication /
// levée) ou rejette (motivé). Le fan est notifié dans les deux cas.
//
// Cloisonnement : un club_admin ne traite QUE les appels de son salon.
// Les appels contre une sanction globale (tenant_id null) → super_admin.
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');
const mod = require('./chatModeration');
const { createNotification } = require('./notifications');

const APPEAL_TARGETS = ['case', 'sanction'];
const APPEAL_DECISIONS = ['accept', 'reject'];

// Un dossier est contestable s'il concerne le fan ET qu'il a effectivement
// masqué/retiré du contenu (un dossier « classé sans suite » n'a rien fait).
function caseIsAppealable(c, userId) {
  return c && c.target_user_id === userId
    && ['resolved'].includes(c.status)
    && ['hide_message', 'remove_message'].includes(c.decision);
}
// Une sanction est contestable si elle vise le fan et n'est pas déjà levée.
function sanctionIsAppealable(s, userId) {
  return s && s.user_id === userId && !s.revoked_at;
}

// ── Vue « ma modération » (fan) ──────────────────────────────
// Ses contenus modérés + ses sanctions, chacun annoté du statut d'appel.
async function listMyModeration(userId) {
  const [{ data: cases }, sanctions, { data: appeals }] = await Promise.all([
    supabase.from('chat_moderation_cases')
      .select('id, tenant_id, content_type, content_id, decision, decision_reason, status, resolved_at')
      .eq('target_user_id', userId).eq('status', 'resolved')
      .in('decision', ['hide_message', 'remove_message'])
      .order('resolved_at', { ascending: false }).limit(50),
    mod.listMySanctions(userId),
    supabase.from('chat_appeals').select('id, target_type, target_id, status, resolution_note, created_at, resolved_at')
      .eq('user_id', userId),
  ]);

  const appealByTarget = {};
  for (const a of appeals || []) appealByTarget[`${a.target_type}:${a.target_id}`] = a;

  // Noms de clubs
  const tIds = [...new Set([...(cases || []).map((c) => c.tenant_id), ...(sanctions || []).map((s) => s.tenant_id)].filter(Boolean))];
  const { data: clubs } = tIds.length ? await supabase.from('tenants').select('id, name, slug').in('id', tIds) : { data: [] };
  const cById = Object.fromEntries((clubs || []).map((c) => [c.id, c]));

  // Contenu (extrait) des dossiers
  const byType = {};
  for (const c of cases || []) if (c.content_id) (byType[c.content_type] ||= new Set()).add(c.content_id);
  const contentRows = await Promise.all(Object.entries(byType).map(async ([type, ids]) => {
    const { data } = await supabase.from(mod.CONTENT_TABLE[type]).select('id, content').in('id', [...ids]);
    return (data || []).map((r) => [`${type}:${r.id}`, r.content]);
  }));
  const contentByKey = Object.fromEntries(contentRows.flat());

  const moderatedContent = (cases || []).map((c) => {
    const appeal = appealByTarget[`case:${c.id}`] || null;
    return {
      caseId: c.id, contentType: c.content_type,
      contentLabel: mod.CONTENT_LABEL[c.content_type] || c.content_type,
      excerpt: contentByKey[`${c.content_type}:${c.content_id}`] || '(contenu indisponible)',
      decision: c.decision, resolvedAt: c.resolved_at,
      club: cById[c.tenant_id] || null,
      appeal, canAppeal: !appeal,   // un seul appel par dossier
    };
  });

  const mySanctions = (sanctions || []).map((s) => {
    const appeal = appealByTarget[`sanction:${s.id}`] || null;
    return {
      ...s, club: s.tenant_id ? cById[s.tenant_id] || null : null,
      appeal, canAppeal: !appeal && !s.revoked_at && s.isActive,
    };
  });

  return { moderatedContent, sanctions: mySanctions };
}

// ── Déposer un appel (fan) ───────────────────────────────────
async function createAppeal({ userId, targetType, targetId, reason }) {
  if (!APPEAL_TARGETS.includes(targetType)) { const e = new Error('Cible invalide.'); e.code = 'BAD_TARGET'; throw e; }

  // On vérifie que la cible concerne bien CE fan et qu'elle est contestable.
  let tenantId = null;
  if (targetType === 'case') {
    const { data: c } = await supabase.from('chat_moderation_cases').select('*').eq('id', targetId).maybeSingle();
    if (!caseIsAppealable(c, userId)) { const e = new Error('Ce dossier n\'est pas contestable.'); e.code = 'NOT_APPEALABLE'; throw e; }
    tenantId = c.tenant_id;
  } else {
    const { data: s } = await supabase.from('chat_sanctions').select('*').eq('id', targetId).maybeSingle();
    if (!sanctionIsAppealable(s, userId)) { const e = new Error('Cette sanction n\'est pas contestable.'); e.code = 'NOT_APPEALABLE'; throw e; }
    tenantId = s.tenant_id;   // null si sanction globale → super_admin
  }

  const { data, error } = await supabase.from('chat_appeals').insert({
    tenant_id: tenantId, user_id: userId, target_type: targetType, target_id: targetId,
    reason: (reason || '').slice(0, 1000) || null,
  }).select('id, created_at').single();
  if (error) {
    if (error.code === '23505') { const e = new Error('Tu as déjà contesté cette décision.'); e.code = 'ALREADY_APPEALED'; throw e; }
    throw new Error(error.message);
  }

  await mod.audit({ actorType: 'user', actorId: userId, action: 'appeal_opened',
    newValue: { appealId: data.id, targetType, targetId } });
  return { id: data.id, createdAt: data.created_at };
}

// ── File des appels (modérateur) ─────────────────────────────
async function listAppeals({ tenantId = null, status = 'open', limit = 100 } = {}) {
  let q = supabase.from('chat_appeals')
    .select('id, tenant_id, user_id, target_type, target_id, reason, status, created_at, resolved_at')
    .order('created_at', { ascending: false }).limit(limit);
  if (tenantId) q = q.eq('tenant_id', tenantId);   // club_admin : borné à son salon
  if (status) q = q.eq('status', status);
  const { data: appeals } = await q;
  if (!appeals?.length) return [];

  const userIds = [...new Set(appeals.map((a) => a.user_id))];
  const tIds = [...new Set(appeals.map((a) => a.tenant_id).filter(Boolean))];
  const [{ data: profs }, { data: clubs }] = await Promise.all([
    userIds.length ? supabase.from('profiles').select('id, display_name, avatar_url').in('id', userIds) : { data: [] },
    tIds.length ? supabase.from('tenants').select('id, name, slug').in('id', tIds) : { data: [] },
  ]);
  const pById = Object.fromEntries((profs || []).map((p) => [p.id, p]));
  const cById = Object.fromEntries((clubs || []).map((c) => [c.id, c]));

  return appeals.map((a) => ({
    ...a,
    appellant: pById[a.user_id] ? { id: a.user_id, name: pById[a.user_id].display_name, avatar: pById[a.user_id].avatar_url } : { id: a.user_id, name: 'Supporter' },
    club: a.tenant_id ? cById[a.tenant_id] || null : null,
    targetLabel: a.target_type === 'case' ? 'Contenu modéré' : 'Sanction',
  }));
}

// Détail d'un appel : l'appel + la cible (dossier ou sanction) résolue.
async function getAppeal(appealId) {
  const { data: a } = await supabase.from('chat_appeals').select('*').eq('id', appealId).maybeSingle();
  if (!a) return null;
  let target = null;
  if (a.target_type === 'case') {
    target = await mod.getCase(a.target_id).catch(() => null);
  } else {
    const { data: s } = await supabase.from('chat_sanctions').select('*').eq('id', a.target_id).maybeSingle();
    target = s ? { ...s, label: mod.SANCTION_LABEL[s.sanction_type] || s.sanction_type } : null;
  }
  const { data: prof } = await supabase.from('profiles').select('id, display_name, avatar_url').eq('id', a.user_id).maybeSingle();
  return {
    ...a,
    appellant: prof ? { id: prof.id, name: prof.display_name, avatar: prof.avatar_url } : { id: a.user_id, name: 'Supporter' },
    target,
  };
}

// ── Statuer sur un appel (modérateur) ────────────────────────
// accept → réparation AUTO (republication du contenu / levée de la sanction).
async function decideAppeal({ appealId, decision, note = null, actorId, actorType }) {
  if (!APPEAL_DECISIONS.includes(decision)) { const e = new Error('Décision invalide.'); e.code = 'BAD_DECISION'; throw e; }
  const { data: a } = await supabase.from('chat_appeals').select('*').eq('id', appealId).maybeSingle();
  if (!a) { const e = new Error('Appel introuvable.'); e.code = 'NOT_FOUND'; throw e; }
  if (a.status !== 'open') { const e = new Error('Cet appel est déjà traité.'); e.code = 'ALREADY_CLOSED'; throw e; }

  const now = new Date().toISOString();
  let repaired = null;

  if (decision === 'accept') {
    if (a.target_type === 'case') {
      const { data: c } = await supabase.from('chat_moderation_cases').select('*').eq('id', a.target_id).maybeSingle();
      if (c?.content_id && mod.CONTENT_TABLE[c.content_type]) {
        // Republication : le contenu redevient visible (jamais de suppression physique).
        await supabase.from(mod.CONTENT_TABLE[c.content_type])
          .update({ moderation_status: 'published', deleted_at: null }).eq('id', c.content_id);
        repaired = 'content_republished';
      }
      // Lève les sanctions rattachées à ce dossier.
      const { data: linked } = await supabase.from('chat_sanctions').select('id').eq('case_id', a.target_id).is('revoked_at', null);
      for (const s of linked || []) await mod.revokeSanction({ sanctionId: s.id, actorId, actorType }).catch(() => {});
    } else {
      await mod.revokeSanction({ sanctionId: a.target_id, actorId, actorType }).catch(() => {});
      repaired = 'sanction_revoked';
    }
  }

  const status = decision === 'accept' ? 'accepted' : 'rejected';
  await supabase.from('chat_appeals')
    .update({ status, resolution_note: note, resolved_by: actorId, resolved_at: now }).eq('id', appealId);

  await mod.audit({
    caseId: a.target_type === 'case' ? a.target_id : null,
    actorType, actorId, action: 'appeal_' + status,
    newValue: { appealId, targetType: a.target_type, targetId: a.target_id, repaired },
  });

  // Notification au fan.
  await createNotification({
    user_id: a.user_id, type: 'chat_appeal_result',
    title: decision === 'accept' ? '✅ Contestation acceptée' : 'Contestation examinée',
    message: decision === 'accept'
      ? (a.target_type === 'case' ? 'Ta contestation a été acceptée : ton contenu a été republié.' : 'Ta contestation a été acceptée : ta sanction a été levée.')
      : `Ta contestation a été examinée et n'a pas été retenue.${note ? ' Motif : ' + note : ''}`,
    metadata: { appealId, decision: status },
  }).catch(() => {});

  return { id: appealId, status, repaired };
}

module.exports = {
  APPEAL_TARGETS, APPEAL_DECISIONS,
  listMyModeration, createAppeal, listAppeals, getAppeal, decideAppeal,
};
