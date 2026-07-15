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
  return { id: data.id, createdAt: data.created_at };
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

module.exports = {
  CHARTER_VERSION, REPORT_REASONS, WRITE_BLOCKING,
  getMembership, needsCharter, acceptCharter,
  getActiveSanction, createReport, countReports, getMessage,
};
