// ═══════════════════════════════════════════════════════════════
// db/audit.js - Audit log operations via Supabase
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function createAuditLog(data) {
  const { error } = await supabase.from('audit_logs').insert({
    user_id: data.user_id || null,
    action: data.action,
    entity_type: data.entity_type || null,
    entity_id: data.entity_id || null,
    ip_address: data.ip_address || null,
    user_agent: data.user_agent || null,
    metadata: data.metadata || {}
  });
  if (error) console.error('Audit log error:', error.message);
}

async function getAuditLogs(filters = {}) {
  let query = supabase.from('audit_logs').select('*');
  if (filters.user_id) query = query.eq('user_id', filters.user_id);
  if (filters.action) query = query.eq('action', filters.action);
  if (filters.entity_type) query = query.eq('entity_type', filters.entity_type);
  if (filters.since) query = query.gte('created_at', filters.since);
  query = query.order('created_at', { ascending: false }).limit(filters.limit || 100);
  const { data, error } = await query;
  if (error) throw new Error(`getAuditLogs: ${error.message}`);
  return data;
}

module.exports = { createAuditLog, getAuditLogs };
