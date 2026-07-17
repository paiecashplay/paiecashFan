// ═══════════════════════════════════════════════════════════════
// db/presence.js — Présence en ligne par salon (chantier 2).
//
// Modèle « heartbeat + fenêtre » : le front pingue régulièrement, on stocke
// last_seen_at, et « en ligne » = vu il y a moins de ONLINE_WINDOW_S secondes.
// Simple, robuste, sans websocket. Le nettoyage est implicite (une ligne
// périmée n'est juste plus comptée) — pas besoin de purge pour que ça marche.
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

// Fenêtre de présence. Le front pingue toutes les 30 s → 75 s tolère 1 ping
// manqué + la latence, sans garder « en ligne » trop longtemps après le départ.
const ONLINE_WINDOW_S = 75;

// Battement de cœur : le supporter est présent dans ce salon, maintenant.
async function heartbeat(tenantId, userId) {
  if (!tenantId || !userId) return;
  await supabase.from('chat_presence')
    .upsert({ tenant_id: tenantId, user_id: userId, last_seen_at: new Date().toISOString() },
      { onConflict: 'tenant_id,user_id' });
}

// Ids des supporters en ligne dans un salon (Set), + le compte.
async function onlineInTenant(tenantId) {
  const since = new Date(Date.now() - ONLINE_WINDOW_S * 1000).toISOString();
  const { data } = await supabase.from('chat_presence')
    .select('user_id').eq('tenant_id', tenantId).gte('last_seen_at', since);
  return new Set((data || []).map((r) => r.user_id));
}

module.exports = { heartbeat, onlineInTenant, ONLINE_WINDOW_S };
