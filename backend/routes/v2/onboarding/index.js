// ═══════════════════════════════════════════════════════════════
// routes/v2/onboarding/*  — Candidature d'un représentant de club.
// Flux : revendiquer un club existant OU créer un brouillon (tenant pending),
// déposer des documents (bucket privé), soumettre à validation.
// Toutes les routes exigent une session (requireAuth).
// ═══════════════════════════════════════════════════════════════
const express = require('express');
const multer = require('multer');
const path = require('path');
const supabase = require('../../../db/supabase');
const { requireAuth } = require('../../../middleware/auth');

const router = express.Router();
const ok   = (res, data, s = 200) => res.status(s).json({ success: true,  data,  error: '' });
const fail = (res, msg,  s = 400) => res.status(s).json({ success: false, data: null, error: msg });

const DOC_BUCKET = 'club-documents';
const DOC_TYPES = ['kbis', 'contract', 'id', 'other'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo
  fileFilter: (req, file, cb) => {
    const ok = /^(application\/pdf|image\/(jpeg|png|webp))$/.test(file.mimetype);
    cb(ok ? null : new Error(`Format non supporté (${file.mimetype}) — PDF/JPG/PNG/WEBP`), ok);
  },
});

const cleanSlug = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

// Toutes les routes sont authentifiées.
router.use(requireAuth);

// ─── GET /api/v2/onboarding/application — candidature courante ─────────
router.get('/application', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('club_applications')
      .select('*, tenant:tenants(id, slug, name, status, logo_url)')
      .eq('user_id', req.authUser.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return ok(res, { application: data || null });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// ─── POST /api/v2/onboarding/application — créer / mettre à jour ───────
// body: { claim_type: 'existing'|'new', tenant_id?, club_name?, country? }
router.post('/application', async (req, res) => {
  try {
    const uid = req.authUser.id;
    const claim_type = req.body.claim_type === 'existing' ? 'existing' : 'new';

    // Candidature existante (non finalisée) ?
    const { data: existing } = await supabase
      .from('club_applications').select('*').eq('user_id', uid)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (existing && ['approved'].includes(existing.status)) {
      return fail(res, 'Candidature déjà approuvée', 409);
    }

    let tenant_id = req.body.tenant_id || existing?.tenant_id || null;
    let club_name = req.body.club_name || existing?.club_name || null;
    let country   = req.body.country   || existing?.country   || null;

    if (claim_type === 'existing') {
      if (!tenant_id) return fail(res, 'tenant_id requis pour revendiquer un club existant');
      const { data: t } = await supabase.from('tenants').select('id, name, country').eq('id', tenant_id).maybeSingle();
      if (!t) return fail(res, 'Club introuvable', 404);
      club_name = t.name; country = t.country;
    } else {
      // NOUVEAU club → on crée (ou réutilise) un tenant brouillon 'pending'
      if (!club_name) return fail(res, 'Nom du club requis');
      if (!tenant_id) {
        let slug = cleanSlug(club_name) || `club-${Date.now()}`;
        const { data: clash } = await supabase.from('tenants').select('id').eq('slug', slug).maybeSingle();
        if (clash) slug = `${slug}-${Date.now().toString().slice(-4)}`;
        const { data: created, error: cErr } = await supabase.from('tenants').insert({
          name: club_name, slug, type: 'club', status: 'pending', is_federation_hub: false,
          country: country || null, primary_color: '#10b981',
          admin_user_id: uid, metadata: { created_via: 'onboarding' },
        }).select('id').single();
        if (cErr) throw cErr;
        tenant_id = created.id;
        // Lien immédiat vers le brouillon (édition scopée), le club reste pending.
        await supabase.from('profiles').update({ club_id: tenant_id }).eq('id', uid);
      }
    }

    const row = {
      user_id: uid, tenant_id, claim_type, club_name, country,
      status: existing ? existing.status : 'draft', updated_at: new Date().toISOString(),
    };

    let saved;
    if (existing) {
      const { data, error } = await supabase.from('club_applications')
        .update(row).eq('id', existing.id).select().single();
      if (error) throw error; saved = data;
    } else {
      const { data, error } = await supabase.from('club_applications')
        .insert(row).select().single();
      if (error) throw error; saved = data;
    }
    return ok(res, { application: saved }, existing ? 200 : 201);
  } catch (err) {
    console.error('[onboarding] POST /application:', err.message);
    return fail(res, err.message, 500);
  }
});

// ─── POST /api/v2/onboarding/application/documents ────────────────────
// multipart: field "file", query: ?type=kbis|contract|id|other
router.post('/application/documents', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return fail(res, 'Upload refusé : ' + err.message, 400);
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return fail(res, 'Aucun fichier reçu');
    const type = DOC_TYPES.includes(req.query.type) ? req.query.type : 'other';

    const { data: app } = await supabase.from('club_applications')
      .select('id, documents').eq('user_id', req.authUser.id)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!app) return fail(res, 'Crée d\'abord ta candidature', 400);

    const ext = path.extname(req.file.originalname) || '';
    const filePath = `${app.id}/${type}-${Date.now()}${ext}`;
    const { error: upErr } = await supabase.storage.from(DOC_BUCKET)
      .upload(filePath, req.file.buffer, { contentType: req.file.mimetype, upsert: true });
    if (upErr) throw upErr;

    const doc = {
      type, path: filePath, name: req.file.originalname,
      size: req.file.size, uploaded_at: new Date().toISOString(),
    };
    const documents = [...(app.documents || []), doc];
    await supabase.from('club_applications')
      .update({ documents, updated_at: new Date().toISOString() }).eq('id', app.id);

    return ok(res, { document: doc, documents }, 201);
  } catch (err) {
    console.error('[onboarding] upload doc:', err.message);
    return fail(res, err.message, 500);
  }
});

// ─── DELETE /api/v2/onboarding/application/documents?path=... ──────────
router.delete('/application/documents', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) return fail(res, 'path requis');
    const { data: app } = await supabase.from('club_applications')
      .select('id, documents').eq('user_id', req.authUser.id)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!app) return fail(res, 'Candidature introuvable', 404);
    // Sécurité : le chemin doit appartenir à cette candidature.
    if (!String(filePath).startsWith(`${app.id}/`)) return fail(res, 'Chemin non autorisé', 403);

    await supabase.storage.from(DOC_BUCKET).remove([filePath]);
    const documents = (app.documents || []).filter((d) => d.path !== filePath);
    await supabase.from('club_applications')
      .update({ documents, updated_at: new Date().toISOString() }).eq('id', app.id);
    return ok(res, { documents });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// ─── GET /api/v2/onboarding/application/documents/signed?path=... ──────
// URL signée (60 min) pour que le candidat prévisualise SON document.
router.get('/application/documents/signed', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) return fail(res, 'path requis');
    const { data: app } = await supabase.from('club_applications')
      .select('id').eq('user_id', req.authUser.id)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!app || !String(filePath).startsWith(`${app.id}/`)) return fail(res, 'Non autorisé', 403);

    const { data, error } = await supabase.storage.from(DOC_BUCKET).createSignedUrl(filePath, 3600);
    if (error) throw error;
    return ok(res, { url: data.signedUrl });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// ─── POST /api/v2/onboarding/application/submit ───────────────────────
router.post('/application/submit', async (req, res) => {
  try {
    const { data: app } = await supabase.from('club_applications')
      .select('*').eq('user_id', req.authUser.id)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!app) return fail(res, 'Aucune candidature', 404);
    if (!app.tenant_id) return fail(res, 'Sélectionne d\'abord ton club');
    if ((app.documents || []).length === 0) return fail(res, 'Ajoute au moins un document avant de soumettre');

    // S'assure que le rôle demandé est bien posé (pour le suivi super_admin).
    await supabase.from('profiles').update({ role_request: 'club_admin' }).eq('id', req.authUser.id);

    const { data, error } = await supabase.from('club_applications')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('id', app.id).select().single();
    if (error) throw error;
    return ok(res, { application: data });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

module.exports = router;
