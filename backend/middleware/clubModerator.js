// ═══════════════════════════════════════════════════════════════
// middleware/clubModerator.js — Autorisation de modération d'un salon.
//
// requireRole() ne suffit PAS ici : il ne vérifie que le rôle global.
// Un club_admin ne doit modérer QUE son propre salon → on compare son
// profiles.club_id au tenant du salon (req.tenant, posé par withTenant).
// ═══════════════════════════════════════════════════════════════

const fail = (res, msg, s = 403) => res.status(s).json({ success: false, data: null, error: msg });

// super_admin → tous les salons. club_admin → uniquement le sien.
function requireClubModerator(req, res, next) {
  const u = req.authUser;
  if (!u) return fail(res, 'Non authentifié.', 401);
  if (u.role === 'super_admin') { req.moderatorType = 'super_admin'; return next(); }

  if (u.role === 'club_admin') {
    if (!req.tenant?.id) return fail(res, 'Salon introuvable.', 404);
    if (!u.club_id || u.club_id !== req.tenant.id) {
      return fail(res, 'Tu ne peux modérer que le salon de ton club.', 403);
    }
    req.moderatorType = 'club_admin';
    return next();
  }
  return fail(res, 'Accès refusé.', 403);
}

module.exports = { requireClubModerator };
