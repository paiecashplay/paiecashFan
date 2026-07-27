// ═══════════════════════════════════════════════════════════════
// db/notifications.js - Notification CRUD via Supabase
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function createNotification(data) {
  // La table notifications n'a pas de colonne tenant_id → on ne l'insère pas
  // (sinon l'insert échoue : "Could not find the 'tenant_id' column").
  const row = {
    user_id: data.user_id || null,
    type: data.type,
    title: data.title,
    message: data.message,
    metadata: data.metadata || {},
  };
  const { data: notif, error } = await supabase.from('notifications').insert(row).select().single();
  if (error) throw new Error(`createNotification: ${error.message}`);
  return notif;
}

async function getNotificationsByUser(userId, unreadOnly = false) {
  let query = supabase.from('notifications').select('*').eq('user_id', userId);
  if (unreadOnly) query = query.eq('is_read', false);
  query = query.order('created_at', { ascending: false }).limit(50);
  const { data, error } = await query;
  if (error) throw new Error(`getNotificationsByUser: ${error.message}`);
  return data;
}

async function markAsRead(id) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) throw new Error(`markAsRead: ${error.message}`);
}

async function markAllAsRead(userId) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  if (error) throw new Error(`markAllAsRead: ${error.message}`);
}

// Ids des utilisateurs d'un rôle (optionnellement scopés à un club).
async function listUserIdsByRole(role, clubId = null) {
  let q = supabase.from('profiles').select('id').eq('role', role);
  if (clubId) q = q.eq('club_id', clubId);
  const { data } = await q;
  return (data || []).map((p) => p.id);
}

// Notifie tous les super_admins (événement plateforme).
async function notifyAdmins(payload) {
  const ids = await listUserIdsByRole('super_admin');
  await Promise.all(ids.map((id) => createNotification({ ...payload, user_id: id }).catch(() => {})));
  return ids.length;
}

// Notifie tous les fans qui SUIVENT ce club (⭐ fan_favorite_clubs).
// Fan-out best-effort : une erreur sur un fan n'empêche pas les autres.
async function notifyFollowers(tenantId, payload) {
  const { data } = await supabase.from('fan_favorite_clubs').select('user_id').eq('tenant_id', tenantId);
  const ids = [...new Set((data || []).map((r) => r.user_id).filter(Boolean))];
  await Promise.all(ids.map((id) => createNotification({ ...payload, user_id: id }).catch(() => {})));
  return ids.length;
}

// Notifie l'équipe concernée par un club : ses club_admins + tous les super_admins.
// tenantId null → uniquement les super_admins.
async function notifyClubStaff(tenantId, payload) {
  const [clubIds, adminIds] = await Promise.all([
    tenantId ? listUserIdsByRole('club_admin', tenantId) : Promise.resolve([]),
    listUserIdsByRole('super_admin'),
  ]);
  const ids = [...new Set([...clubIds, ...adminIds])];
  await Promise.all(ids.map((id) => createNotification({ ...payload, user_id: id }).catch(() => {})));
  return ids.length;
}

module.exports = { createNotification, getNotificationsByUser, markAsRead, markAllAsRead, notifyAdmins, notifyClubStaff, notifyFollowers };
