// ═══════════════════════════════════════════════════════════════
// db/notifications.js - Notification CRUD via Supabase
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function createNotification(data) {
  const { data: notif, error } = await supabase
    .from('notifications')
    .insert({
      user_id: data.user_id || null,
      tenant_id: data.tenant_id || null,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata || {}
    })
    .select().single();
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

module.exports = { createNotification, getNotificationsByUser, markAsRead, markAllAsRead };
