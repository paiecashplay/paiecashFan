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

// ── Hub Fan Club : la liste des salons + compteurs RÉELS ─────
// - supportersCount : fans ayant ce club en favori (⭐)
// - membersCount    : fans ayant rejoint le salon (charte acceptée)
// - isOfficial      : un modérateur (club_admin) gère ce salon
//
// Il y a ~1900 clubs actifs → on ne les charge PAS tous. Par défaut on renvoie
// les clubs d'une vraie ligue (~176), + les favoris du fan. La RECHERCHE, elle,
// interroge tout le catalogue par nom (côté serveur).
const HUB_FIELDS = 'id, slug, name, logo_url, primary_color, country, city, league_name';

async function getFanHubData({ userId = null, search = null } = {}) {
  const countBy = (rows, key) => (rows || []).reduce((m, r) => { if (r[key]) m[r[key]] = (m[r[key]] || 0) + 1; return m; }, {});

  // Ensemble de clubs à renvoyer : recherche (tout le catalogue) ou défaut (ligues).
  let clubsQuery;
  if (search && search.trim()) {
    clubsQuery = supabase.from('tenants').select(HUB_FIELDS)
      .eq('status', 'active').not('is_federation_hub', 'is', true)
      .ilike('name', `%${search.trim()}%`).order('name', { ascending: true }).limit(40);
  } else {
    clubsQuery = supabase.from('tenants').select(HUB_FIELDS)
      .eq('status', 'active').not('is_federation_hub', 'is', true)
      .not('league_name', 'is', null).order('name', { ascending: true }).limit(400);
  }

  const [{ data: clubs }, { data: favs }, { data: mems }, { data: admins }] = await Promise.all([
    clubsQuery,
    supabase.from('fan_favorite_clubs').select('tenant_id'),
    supabase.from('chat_room_memberships').select('tenant_id'),
    supabase.from('profiles').select('club_id').eq('role', 'club_admin').not('club_id', 'is', null),
  ]);

  const supporters = countBy(favs, 'tenant_id');
  const members = countBy(mems, 'tenant_id');
  const officialSet = new Set((admins || []).map((a) => a.club_id));

  let favoriteIds = new Set(), primaryId = null, myFavClubs = [];
  if (userId) {
    const mine = await listFavorites(userId);
    myFavClubs = mine.map((f) => f.club).filter(Boolean);
    favoriteIds = new Set(myFavClubs.map((c) => c.id));
    primaryId = mine.find((f) => f.isPrimary)?.club?.id || null;
  }

  // On garantit que les FAVORIS du fan figurent dans la liste, même hors ligue
  // (ex. une sélection nationale suivie). On les fusionne s'ils manquent.
  const byId = new Map((clubs || []).map((c) => [c.id, c]));
  if (!search) for (const f of myFavClubs) if (!byId.has(f.id)) byId.set(f.id, { ...f, logo_url: f.logo_url || null, primary_color: f.primary_color || null });

  const enriched = [...byId.values()].map((c) => ({
    id: c.id, slug: c.slug, name: c.name, logo: c.logo_url || null, primaryColor: c.primary_color || null,
    country: c.country || null, city: c.city || null, league: c.league_name || null,
    supportersCount: supporters[c.id] || 0,
    membersCount: members[c.id] || 0,
    isOfficial: officialSet.has(c.id),
    isFavorite: favoriteIds.has(c.id),
    isPrimary: c.id === primaryId,
    isLive: false,   // réservé : branché plus tard sur les vrais matchs (API-Football)
  }));

  return { clubs: enriched, primary: enriched.find((c) => c.isPrimary) || null };
}

module.exports = { listFavorites, listFavoriteTenantIds, isFavorite, toggleFavorite, setPrimary, followersOfClub, getFanHubData };
