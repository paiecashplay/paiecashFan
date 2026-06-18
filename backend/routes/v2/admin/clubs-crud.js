// ═══════════════════════════════════════════════════════════════
// routes/v2/admin/clubs-crud.js
// CRUD complet clubs/joueurs/trophées/produits + upload images
// Toutes les routes nécessitent super_admin (à vérifier côté client
// via Supabase Auth — le backend utilise service_role donc bypass RLS).
// ═══════════════════════════════════════════════════════════════

const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const supabase = require('../../../db/supabase');
const router   = express.Router();

const ok   = (res, data, s = 200) => res.status(s).json({ success: true,  data,  error: '' });
const fail = (res, msg,  s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// Convertit "" / undefined → null, sinon entier (colonnes integer en DB)
const toIntOrNull = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
};

// Nettoie un slug : retire URL/protocole/chemin, garde le dernier segment kebab-case
const cleanSlug = (raw) => {
  if (!raw) return '';
  let s = String(raw).trim();
  // Si c'est une URL ou un chemin, ne garder que le dernier segment non vide
  if (s.includes('/')) {
    const parts = s.split('/').filter(Boolean);
    s = parts[parts.length - 1] || '';
  }
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Upload en mémoire (on stream vers Supabase Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    // Accepte toute image ; Supabase Storage filtre ensuite les types autorisés
    const ok = /^image\//.test(file.mimetype);
    cb(ok ? null : new Error(`Format non supporté (${file.mimetype})`), ok);
  }
});

// ─── Upload image ─────────────────────────────────────────────
// POST /api/v2/admin/clubs-crud/upload
// body: multipart — field "file", query: ?folder=logos|stades|joueurs|produits
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('[upload] multer error:', err.message);
      return fail(res, 'Upload refusé : ' + err.message, 400);
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return fail(res, 'Aucun fichier reçu');
    const folder  = req.query.folder || 'misc';
    const ext     = path.extname(req.file.originalname) || '.jpg';
    const name    = `${folder}/${Date.now()}${ext}`;

    const { error } = await supabase.storage
      .from('club-assets')
      .upload(name, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('club-assets')
      .getPublicUrl(name);

    return ok(res, { url: publicUrl, path: name });
  } catch (err) {
    console.error('[upload] error:', err.message);
    return fail(res, 'Upload failed: ' + err.message, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// CLUBS (tenants)
// ═══════════════════════════════════════════════════════════════

// POST /api/v2/admin/clubs-crud/clubs — créer un club
router.post('/clubs', async (req, res) => {
  try {
    const {
      name, slug, country, city, sport = 'football',
      logo_url, primary_color, stadium, stadium_image_url, founded_year,
      motto, motto_color, coach, president, is_federation_hub = false,
      federation_id, metadata
    } = req.body;

    if (!name || !slug) return fail(res, 'name et slug sont requis');
    const cleanedSlug = cleanSlug(slug);
    if (!cleanedSlug) return fail(res, 'slug invalide');

    const { data, error } = await supabase
      .from('tenants')
      .insert({
        name, slug: cleanedSlug, country, city, sport,
        logo_url:          logo_url          || null,
        primary_color:     primary_color     || '#10b981',
        stadium:           stadium           || null,
        stadium_image_url: stadium_image_url || null,
        motto_color:       motto_color       || null,
        founded_year:      toIntOrNull(founded_year),
        motto:           motto           || null,
        coach:           coach           || null,
        president:       president       || null,
        is_federation_hub,
        federation_id:   federation_id   || null,
        metadata:        metadata        || null,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return ok(res, { club: data }, 201);
  } catch (err) {
    console.error('[clubs-crud] POST /clubs:', err.message);
    return fail(res, err.message.includes('duplicate') ? 'Ce slug existe déjà' : err.message, 500);
  }
});

// PUT /api/v2/admin/clubs-crud/clubs/:id — mettre à jour un club
router.put('/clubs/:id', async (req, res) => {
  try {
    const allowed = [
      'name','slug','country','city','sport','logo_url','primary_color',
      'stadium','stadium_image_url','founded_year','motto','motto_color',
      'coach','president','is_federation_hub','federation_id','status','metadata'
    ];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    // Colonne integer : "" → null
    if ('founded_year' in updates) updates.founded_year = toIntOrNull(updates.founded_year);
    // Nettoie le slug si fourni
    if ('slug' in updates) {
      updates.slug = cleanSlug(updates.slug);
      if (!updates.slug) return fail(res, 'slug invalide');
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    return ok(res, { club: data });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// DELETE /api/v2/admin/clubs-crud/clubs/:id
router.delete('/clubs/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('tenants').delete().eq('id', req.params.id);
    if (error) throw error;
    return ok(res, { deleted: true });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// PLAYERS
// ═══════════════════════════════════════════════════════════════

// GET /api/v2/admin/clubs-crud/clubs/:tenantId/players
router.get('/clubs/:tenantId/players', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('tenant_id', req.params.tenantId)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return ok(res, { players: data || [] });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// POST /api/v2/admin/clubs-crud/clubs/:tenantId/players
// Schéma réel : shirt_number, nationality_code, full_name, position, image_url, is_star_player, stats, display_order
router.post('/clubs/:tenantId/players', async (req, res) => {
  try {
    const {
      full_name, jersey_number, position, country,
      image_url, is_star_player = false, stats, display_order
    } = req.body;
    if (!full_name) return fail(res, 'full_name est requis');

    // Un seul star player par club
    if (is_star_player) {
      await supabase.from('players')
        .update({ is_star_player: false })
        .eq('tenant_id', req.params.tenantId)
        .eq('is_star_player', true);
    }

    // Calcul display_order si non fourni
    let order = display_order;
    if (order == null) {
      const { count } = await supabase.from('players').select('id', { count: 'exact', head: true }).eq('tenant_id', req.params.tenantId);
      order = (count || 0);
    }

    const { data, error } = await supabase
      .from('players')
      .insert({
        tenant_id:        req.params.tenantId,
        full_name,
        shirt_number:     jersey_number || null,
        position:         position      || null,
        nationality_code: country       || null,
        image_url:        image_url     || null,
        is_star_player,
        stats:            stats         || null,
        display_order:    order
      })
      .select()
      .single();

    if (error) throw error;
    return ok(res, { player: data }, 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// PUT /api/v2/admin/clubs-crud/players/:id
router.put('/players/:id', async (req, res) => {
  try {
    // Mapping frontend → colonnes réelles
    const fieldMap = {
      full_name:      'full_name',
      jersey_number:  'shirt_number',
      position:       'position',
      country:        'nationality_code',
      image_url:      'image_url',
      is_star_player: 'is_star_player',
      stats:          'stats',
      display_order:  'display_order',
    };
    const updates = {};
    Object.entries(fieldMap).forEach(([k, col]) => {
      if (req.body[k] !== undefined) updates[col] = req.body[k];
    });

    // Si on passe ce joueur en star, on retire l'ancien
    if (updates.is_star_player) {
      const { data: existing } = await supabase
        .from('players').select('tenant_id').eq('id', req.params.id).single();
      if (existing) {
        await supabase.from('players')
          .update({ is_star_player: false })
          .eq('tenant_id', existing.tenant_id)
          .eq('is_star_player', true);
      }
    }

    const { data, error } = await supabase
      .from('players').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    return ok(res, { player: data });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// DELETE /api/v2/admin/clubs-crud/players/:id
router.delete('/players/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('players').delete().eq('id', req.params.id);
    if (error) throw error;
    return ok(res, { deleted: true });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// TROPHIES
// ═══════════════════════════════════════════════════════════════

// GET /api/v2/admin/clubs-crud/clubs/:tenantId/trophies
router.get('/clubs/:tenantId/trophies', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trophies')
      .select('*')
      .eq('tenant_id', req.params.tenantId)
      .order('count', { ascending: false });
    if (error) throw error;
    return ok(res, { trophies: data || [] });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// POST /api/v2/admin/clubs-crud/clubs/:tenantId/trophies
router.post('/clubs/:tenantId/trophies', async (req, res) => {
  try {
    const { label, count = 1, scope = 'domestic', years_text } = req.body;
    if (!label) return fail(res, 'label est requis');

    const { data, error } = await supabase
      .from('trophies')
      .insert({ tenant_id: req.params.tenantId, label, count, scope, years_text: years_text || null })
      .select().single();
    if (error) throw error;
    return ok(res, { trophy: data }, 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// PUT /api/v2/admin/clubs-crud/trophies/:id
router.put('/trophies/:id', async (req, res) => {
  try {
    const allowed = ['label','count','scope','years_text'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const { data, error } = await supabase
      .from('trophies').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    return ok(res, { trophy: data });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// DELETE /api/v2/admin/clubs-crud/trophies/:id
router.delete('/trophies/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('trophies').delete().eq('id', req.params.id);
    if (error) throw error;
    return ok(res, { deleted: true });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════════════

// GET /api/v2/admin/clubs-crud/clubs/:tenantId/products
router.get('/clubs/:tenantId/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('tenant_id', req.params.tenantId)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return ok(res, { products: data || [] });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// POST /api/v2/admin/clubs-crud/clubs/:tenantId/products
// Schéma réel : image_url (single), images (array), category_slug, eur_price, pcc_price, sizes, status, display_order
router.post('/clubs/:tenantId/products', async (req, res) => {
  try {
    const {
      name, description, eur_price, pcc_price,
      images, sizes, category_slug, display_order, status = 'active'
    } = req.body;
    if (!name) return fail(res, 'name est requis');
    // pcc_price est NOT NULL CHECK (> 0) en base
    const pcc = Number(pcc_price);
    if (!pcc || pcc <= 0) return fail(res, 'Le prix PCC est requis et doit être supérieur à 0');

    const imagesArr = Array.isArray(images) ? images.filter(Boolean) : [];
    const imageUrl  = imagesArr[0] || null;

    const { data, error } = await supabase
      .from('products')
      .insert({
        tenant_id:     req.params.tenantId,
        name,
        description:   description  || null,
        eur_price:     eur_price != null ? Number(eur_price) : null,
        pcc_price:     pcc_price != null ? Number(pcc_price) : null,
        image_url:     imageUrl,
        images:        imagesArr.length ? imagesArr : null,
        sizes:         sizes        || null,
        category_slug: category_slug || 'merchandise',
        display_order: display_order != null ? Number(display_order) : 0,
        status
      })
      .select().single();
    if (error) throw error;
    return ok(res, { product: data }, 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// PUT /api/v2/admin/clubs-crud/products/:id
router.put('/products/:id', async (req, res) => {
  try {
    const allowed = ['name','description','eur_price','pcc_price','images','sizes','category_slug','display_order','status'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    // Synchronise image_url avec le premier élément de images
    if (updates.images) {
      const arr = Array.isArray(updates.images) ? updates.images.filter(Boolean) : [];
      updates.images   = arr.length ? arr : null;
      updates.image_url = arr[0] || null;
    }
    const { data, error } = await supabase
      .from('products').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    return ok(res, { product: data });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// DELETE /api/v2/admin/clubs-crud/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    return ok(res, { deleted: true });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

module.exports = router;
