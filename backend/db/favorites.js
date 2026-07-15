// ═══════════════════════════════════════════════════════════════
// db/favorites.js — Clubs favoris du fan (⭐). Supabase service-role.
//
// Important : rien à voir avec profiles.club_id (qui sert au rôle club_admin).
// Un favori ne donne AUCUN droit — c'est juste un « suivi » pour les notifs.
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

const CLUB_FIELDS = 'id, slug, name, short_code, sport, country, city, league_name';

// Mes clubs favoris, enrichis des infos club. Le principal en premier.
async function listFavorites(userId) {
  const { data: favs } = await supabase.from('fan_favorite_clubs')
    .select('id, tenant_id, is_primary, created_at').eq('user_id', userId)
    .order('is_primary', { ascending: false }).order('created_at', { ascending: true });
  if (!favs?.length) return [];
  const ids = favs.map((f) => f.tenant_id);
  const { data: clubs } = await supabase.from('tenants').select(CLUB_FIELDS).in('id', ids);
  const byId = Object.fromEntries((clubs || []).map((c) => [c.id, c]));
  return favs.map((f) => ({ id: f.id, isPrimary: f.is_primary, since: f.created_at, club: byId[f.tenant_id] || null }))
    .filter((f) => f.club);
}

// Ids des clubs suivis (léger — pour l'état ⭐ côté front).
async function listFavoriteTenantIds(userId) {
  const { data } = await supabase.from('fan_favorite_clubs').select('tenant_id').eq('user_id', userId);
  return (data || []).map((r) => r.tenant_id);
}

async function isFavorite(userId, tenantId) {
  const { data } = await supabase.from('fan_favorite_clubs').select('id').eq('user_id', userId).eq('tenant_id', tenantId).maybeSingle();
  return !!data;
}

// Ajoute/retire (toggle). Le tout premier favori devient le club principal.
async function toggleFavorite(userId, tenantId) {
  const { data: existing } = await supabase.from('fan_favorite_clubs')
    .select('id, is_primary').eq('user_id', userId).eq('tenant_id', tenantId).maybeSingle();

  if (existing) {
    await supabase.from('fan_favorite_clubs').delete().eq('id', existing.id);
    // Si on retire le principal, on promeut le plus ancien favori restant.
    if (existing.is_primary) {
      const { data: next } = await supabase.from('fan_favorite_clubs')
        .select('id').eq('user_id', userId).order('created_at', { ascending: true }).limit(1).maybeSingle();
      if (next) await supabase.from('fan_favorite_clubs').update({ is_primary: true }).eq('id', next.id);
    }
    return { favorite: false };
  }

  const { count } = await supabase.from('fan_favorite_clubs').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  const { error } = await supabase.from('fan_favorite_clubs')
    .insert({ user_id: userId, tenant_id: tenantId, is_primary: (count || 0) === 0 });
  if (error) throw new Error(error.message);
  return { favorite: true };
}

// Définit LE club principal (un seul par fan).
async function setPrimary(userId, tenantId) {
  const exists = await isFavorite(userId, tenantId);
  if (!exists) { const e = new Error('Ce club n\'est pas dans tes favoris.'); e.code = 'NOT_FAVORITE'; throw e; }
  await supabase.from('fan_favorite_clubs').update({ is_primary: false }).eq('user_id', userId).eq('is_primary', true);
  const { error } = await supabase.from('fan_favorite_clubs').update({ is_primary: true }).eq('user_id', userId).eq('tenant_id', tenantId);
  if (error) throw new Error(error.message);
  return { primary: tenantId };
}

// Fan-out : tous les fans qui suivent ce club (pour les notifications).
async function followersOfClub(tenantId) {
  const { data } = await supabase.from('fan_favorite_clubs').select('user_id').eq('tenant_id', tenantId);
  return [...new Set((data || []).map((r) => r.user_id))];
}

module.exports = { listFavorites, listFavoriteTenantIds, isFavorite, toggleFavorite, setPrimary, followersOfClub };
