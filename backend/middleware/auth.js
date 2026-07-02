// ═══════════════════════════════════════════════════════════════
// Middleware d'authentification / autorisation.
// Vérifie le token Supabase (Authorization: Bearer <jwt>), charge le profil
// (rôle + club_id) et l'attache à req.authUser. Le client service_role permet
// de valider n'importe quel JWT utilisateur via auth.getUser(token).
// ═══════════════════════════════════════════════════════════════
const supabase = require('../db/supabase');

const fail = (res, msg, s = 401) => res.status(s).json({ success: false, data: null, error: msg });

async function requireAuth(req, res, next) {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return fail(res, 'Non authentifié');

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return fail(res, 'Session invalide ou expirée');

    const { data: profile } = await supabase
      .from('profiles').select('role, club_id, display_name').eq('id', user.id).single();

    req.authUser = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'fan',
      club_id: profile?.club_id || null,
      display_name: profile?.display_name || null,
    };
    next();
  } catch (err) {
    console.error('[auth] error:', err.message);
    return fail(res, 'Erreur d\'authentification');
  }
}

// Restreint à certains rôles (ex: requireRole('super_admin')).
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.authUser) return fail(res, 'Non authentifié');
    if (!roles.includes(req.authUser.role)) return fail(res, 'Accès refusé', 403);
    next();
  };
}

module.exports = { requireAuth, requireRole };
