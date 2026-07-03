// ═══════════════════════════════════════════════════════════════
// routes/v2/admin/users.js
// Gestion des comptes par le super_admin :
//   - POST /create  : crée un compte (email + mot de passe) et lui
//                     attribue un rôle (fan / club_admin / super_admin).
//   - DELETE /:id   : supprime le compte auth + son profil.
// Utilise la service_role (admin API) — réservé au super_admin (à
// vérifier côté client ; le backend bypasse la RLS).
// ═══════════════════════════════════════════════════════════════

const express  = require('express');
const supabase = require('../../../db/supabase');
const { requireAuth, requireRole } = require('../../../middleware/auth');
const router   = express.Router();

const ok   = (res, data, s = 200) => res.status(s).json({ success: true,  data,  error: '' });
const fail = (res, msg,  s = 400) => res.status(s).json({ success: false, data: null, error: msg });

const VALID_ROLES = ['fan', 'club_admin', 'super_admin'];

// Toute la gestion des comptes est réservée au super_admin.
router.use(requireAuth, requireRole('super_admin'));

// GET /api/v2/admin/users/:id — détail (dont email auth)
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(req.params.id);
    if (error || !data?.user) return fail(res, 'Utilisateur introuvable', 404);
    const { data: prof } = await supabase.from('profiles').select('display_name, role, role_request, club_id').eq('id', req.params.id).maybeSingle();
    return ok(res, {
      user: {
        id: data.user.id, email: data.user.email,
        display_name: prof?.display_name || null, role: prof?.role || 'fan',
        role_request: prof?.role_request || null, club_id: prof?.club_id || null,
      },
    });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// PATCH /api/v2/admin/users/:id — modifier email / mot de passe / nom
// body: { email?, password?, display_name? }
router.patch('/:id', async (req, res) => {
  try {
    const { email, password, display_name } = req.body;
    const authUpdate = {};
    if (email) authUpdate.email = email;
    if (password) {
      if (password.length < 8) return fail(res, 'Le mot de passe doit faire au moins 8 caractères');
      authUpdate.password = password;
    }
    if (Object.keys(authUpdate).length) {
      // email_confirm: true → le nouvel email est marqué confirmé (pas de mail).
      if (authUpdate.email) authUpdate.email_confirm = true;
      const { error } = await supabase.auth.admin.updateUserById(req.params.id, authUpdate);
      if (error) {
        const msg = /already.*registered|exists/i.test(error.message) ? 'Cet email est déjà utilisé' : error.message;
        return fail(res, msg);
      }
    }
    if (display_name !== undefined) {
      await supabase.from('profiles').update({ display_name }).eq('id', req.params.id);
    }
    return ok(res, { updated: true });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// POST /api/v2/admin/users/create
// body: { email, password, display_name, role, club_id? }
router.post('/create', async (req, res) => {
  try {
    const { email, password, display_name, role = 'club_admin', club_id } = req.body;

    if (!email || !password) return fail(res, 'email et mot de passe sont requis');
    if (password.length < 8)  return fail(res, 'Le mot de passe doit faire au moins 8 caractères');
    if (!VALID_ROLES.includes(role)) return fail(res, 'Rôle invalide');

    // 1. Crée le compte auth (email déjà confirmé → pas de mail de validation)
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: display_name || email.split('@')[0] }
    });
    if (createErr) {
      const msg = /already.*registered|exists/i.test(createErr.message)
        ? 'Un compte existe déjà avec cet email'
        : createErr.message;
      return fail(res, msg, 400);
    }

    const userId = created.user.id;

    // 2. Attribue le rôle dans profiles (le trigger a pu créer la ligne ;
    //    on upsert pour être robuste quel que soit le timing).
    const { error: profErr } = await supabase
      .from('profiles')
      .upsert({
        id:           userId,
        display_name: display_name || email.split('@')[0],
        role,
        club_id:      club_id || null,
        role_request: null
      }, { onConflict: 'id' });

    if (profErr) {
      // Compte auth créé mais profil en échec → on nettoie pour éviter un état bancal
      await supabase.auth.admin.deleteUser(userId).catch(() => {});
      return fail(res, 'Profil non créé : ' + profErr.message, 500);
    }

    return ok(res, {
      user: { id: userId, email, display_name: display_name || email.split('@')[0], role }
    }, 201);
  } catch (err) {
    console.error('[admin/users] POST /create:', err.message);
    return fail(res, err.message, 500);
  }
});

// DELETE /api/v2/admin/users/:id — supprime un compte
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.auth.admin.deleteUser(req.params.id);
    if (error) throw error;
    // Le profil part en cascade si FK ON DELETE CASCADE ; sinon on force.
    await supabase.from('profiles').delete().eq('id', req.params.id).catch(() => {});
    return ok(res, { deleted: true });
  } catch (err) {
    console.error('[admin/users] DELETE:', err.message);
    return fail(res, err.message, 500);
  }
});

module.exports = router;
