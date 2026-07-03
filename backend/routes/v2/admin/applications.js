// ═══════════════════════════════════════════════════════════════
// routes/v2/admin/applications — Vérification des candidatures club par le
// super_admin. Toutes les routes exigent le rôle super_admin (vérifié côté
// serveur via le middleware d'auth).
// ═══════════════════════════════════════════════════════════════
const express = require('express');
const supabase = require('../../../db/supabase');
const { requireAuth, requireRole } = require('../../../middleware/auth');
const { sendEmail } = require('../../../services/mailer');

const router = express.Router();
const ok   = (res, data, s = 200) => res.status(s).json({ success: true,  data,  error: '' });
const fail = (res, msg,  s = 400) => res.status(s).json({ success: false, data: null, error: msg });

const DOC_BUCKET = 'club-documents';

router.use(requireAuth, requireRole('super_admin'));

// Email d'un candidat (auth.users) à partir de son id.
async function emailOf(userId) {
  try { const { data } = await supabase.auth.admin.getUserById(userId); return data?.user?.email || null; }
  catch { return null; }
}

// ─── GET /api/v2/admin/applications?status= ───────────────────────────
router.get('/', async (req, res) => {
  try {
    let q = supabase.from('club_applications').select('*').order('updated_at', { ascending: false });
    if (req.query.status && req.query.status !== 'all') q = q.eq('status', req.query.status);
    const { data, error } = await q;
    if (error) throw error;

    // Enrichit avec le nom du candidat + tenant (pas de FK → requêtes à part).
    const rows = data || [];
    const enriched = await Promise.all(rows.map(async (a) => {
      let applicant_email = null, applicant_name = null, tenant = null;
      const { data: prof } = await supabase.from('profiles').select('display_name').eq('id', a.user_id).maybeSingle();
      applicant_name = prof?.display_name || null;
      applicant_email = await emailOf(a.user_id);
      if (a.tenant_id) {
        const { data: t } = await supabase.from('tenants').select('id, slug, name, status').eq('id', a.tenant_id).maybeSingle();
        tenant = t || null;
      }
      return { ...a, applicant_email, applicant_name, tenant };
    }));
    return ok(res, { applications: enriched, total: enriched.length });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// ─── GET /api/v2/admin/applications/:id — détail + docs signés ────────
router.get('/:id', async (req, res) => {
  try {
    const { data: a, error } = await supabase.from('club_applications').select('*').eq('id', req.params.id).single();
    if (error || !a) return fail(res, 'Candidature introuvable', 404);

    const documents = await Promise.all((a.documents || []).map(async (d) => {
      const { data: signed } = await supabase.storage.from(DOC_BUCKET).createSignedUrl(d.path, 3600);
      return { ...d, url: signed?.signedUrl || null };
    }));
    let tenant = null;
    if (a.tenant_id) {
      const { data: t } = await supabase.from('tenants').select('id, slug, name, status').eq('id', a.tenant_id).maybeSingle();
      tenant = t || null;
    }
    return ok(res, {
      application: { ...a, documents, tenant, applicant_email: await emailOf(a.user_id) },
    });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// ─── POST /api/v2/admin/applications/:id/approve ──────────────────────
router.post('/:id/approve', async (req, res) => {
  try {
    const { data: a } = await supabase.from('club_applications').select('*').eq('id', req.params.id).single();
    if (!a) return fail(res, 'Candidature introuvable', 404);
    if (!a.tenant_id) return fail(res, 'Aucun club rattaché à la candidature');

    // 1. Nouveau club → passe en live (active).
    await supabase.from('tenants').update({ status: 'active' }).eq('id', a.tenant_id).eq('status', 'pending');
    // 2. Le candidat devient club_admin de CE club.
    await supabase.from('profiles')
      .update({ role: 'club_admin', role_request: null, club_id: a.tenant_id })
      .eq('id', a.user_id);
    // 3. Candidature approuvée.
    const { data: updated, error } = await supabase.from('club_applications').update({
      status: 'approved', reviewed_by: req.authUser.id, reviewed_at: new Date().toISOString(),
      review_notes: req.body.notes || null, updated_at: new Date().toISOString(),
    }).eq('id', a.id).select().single();
    if (error) throw error;

    const email = await emailOf(a.user_id);
    if (email) sendEmail({
      to: email, subject: `✅ Ta candidature pour ${a.club_name} est validée`,
      html: `<p>Bonne nouvelle ! Ta candidature pour <strong>${a.club_name}</strong> a été validée. Tu as désormais accès au back-office de ton club dans l'espace « Mon club ».</p>`,
    }).catch(() => {});

    return ok(res, { application: updated });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// ─── POST /api/v2/admin/applications/:id/reject ───────────────────────
router.post('/:id/reject', async (req, res) => {
  try {
    const { data: a } = await supabase.from('club_applications').select('*').eq('id', req.params.id).single();
    if (!a) return fail(res, 'Candidature introuvable', 404);
    const { data: updated, error } = await supabase.from('club_applications').update({
      status: 'rejected', reviewed_by: req.authUser.id, reviewed_at: new Date().toISOString(),
      review_notes: req.body.notes || null, updated_at: new Date().toISOString(),
    }).eq('id', a.id).select().single();
    if (error) throw error;

    const email = await emailOf(a.user_id);
    if (email) sendEmail({
      to: email, subject: `Candidature ${a.club_name} — non retenue`,
      html: `<p>Ta candidature pour <strong>${a.club_name}</strong> n'a pas été retenue.${req.body.notes ? `<br/>Motif : ${req.body.notes}` : ''}</p>`,
    }).catch(() => {});
    return ok(res, { application: updated });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// ─── POST /api/v2/admin/applications/:id/request-info ─────────────────
router.post('/:id/request-info', async (req, res) => {
  try {
    const { data: a } = await supabase.from('club_applications').select('*').eq('id', req.params.id).single();
    if (!a) return fail(res, 'Candidature introuvable', 404);
    const { data: updated, error } = await supabase.from('club_applications').update({
      status: 'more_info', reviewed_by: req.authUser.id, reviewed_at: new Date().toISOString(),
      review_notes: req.body.notes || null, updated_at: new Date().toISOString(),
    }).eq('id', a.id).select().single();
    if (error) throw error;

    const email = await emailOf(a.user_id);
    if (email) sendEmail({
      to: email, subject: `Candidature ${a.club_name} — informations complémentaires`,
      html: `<p>Nous avons besoin d'informations complémentaires pour ta candidature <strong>${a.club_name}</strong>.${req.body.notes ? `<br/>${req.body.notes}` : ''}<br/>Rends-toi dans « Mon club » pour compléter.</p>`,
    }).catch(() => {});
    return ok(res, { application: updated });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

module.exports = router;
