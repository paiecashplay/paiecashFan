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
const apiFootball = require('../../../services/apiFootball');
const footmercato = require('../../../services/footmercato');
const router   = express.Router();

// Mapping postes API-Football → contrainte players_position_check (FR)
const POSITION_FR = {
  Goalkeeper: 'Gardien de but',
  Defender:   'Défenseur',
  Midfielder: 'Milieu de terrain',
  Attacker:   'Attaquant'
};

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
// IMPORT API-FOOTBALL
// ═══════════════════════════════════════════════════════════════

// GET /api/v2/admin/clubs-crud/football-search?q=lyon
// Recherche un club par nom sur API-Football (proxy serveur, clé cachée).
router.get('/football-search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (q.length < 2) return fail(res, 'Saisis au moins 2 caractères');
    const teams = await apiFootball.searchTeams(q);
    return ok(res, { teams });
  } catch (err) {
    if (err.code === 'NO_KEY') return fail(res, err.message, 500);
    console.error('[football-search]', err.message);
    return fail(res, err.response?.data?.message || err.message, 502);
  }
});

// POST /api/v2/admin/clubs-crud/import-from-football
// body: { teamId, tenantId? }
//  - teamId   : identifiant API-Football du club
//  - tenantId : (optionnel) club Supabase cible ; sinon upsert par slug
// NON DESTRUCTIF : ne remplit que les champs vides, n'ajoute que les
// joueurs absents (match par nom). Le fallback statique reste intact.
router.post('/import-from-football', async (req, res) => {
  try {
    const { teamId, tenantId } = req.body;
    if (!teamId) return fail(res, 'teamId requis');

    const team = await apiFootball.getTeam(teamId);
    if (!team) return fail(res, 'Club introuvable sur API-Football', 404);

    const warnings = [];

    // 1. Résoudre le tenant cible
    let tenant;
    if (tenantId) {
      const { data, error } = await supabase.from('tenants').select('*').eq('id', tenantId).single();
      if (error || !data) return fail(res, 'Club cible introuvable', 404);
      tenant = data;
    } else {
      const slug = cleanSlug(team.name);
      const { data: existing } = await supabase.from('tenants').select('*').eq('slug', slug).maybeSingle();
      if (existing) {
        tenant = existing;
      } else {
        const { data, error } = await supabase.from('tenants').insert({
          name: team.name, slug, status: 'active',
          type: team.national ? 'national_team' : 'club',
          country:           team.country || null,
          city:              team.city || null,
          logo_url:          team.logo || null,
          founded_year:      toIntOrNull(team.founded),
          stadium:           team.stadium || null,
          stadium_image_url: team.stadium_image_url || null,
          metadata:          { api_football_id: team.id }
        }).select().single();
        if (error) throw error;
        tenant = data;
      }
    }

    // 2. Compléter UNIQUEMENT les champs vides (non destructif)
    const fill = {};
    if (!tenant.logo_url          && team.logo)              fill.logo_url          = team.logo;
    if (!tenant.founded_year      && team.founded)           fill.founded_year      = toIntOrNull(team.founded);
    if (!tenant.stadium           && team.stadium)           fill.stadium           = team.stadium;
    if (!tenant.stadium_image_url && team.stadium_image_url) fill.stadium_image_url = team.stadium_image_url;
    if (!tenant.country           && team.country)           fill.country           = team.country;
    if (!tenant.city              && team.city)              fill.city              = team.city;
    fill.metadata = { ...(tenant.metadata || {}), api_football_id: team.id };

    const filledFields = Object.keys(fill).filter((k) => k !== 'metadata');
    {
      const { data } = await supabase.from('tenants').update(fill).eq('id', tenant.id).select().single();
      tenant = data || tenant;
    }
    // API-Football ne fournit pas les couleurs du club
    if (!tenant.primary_color || tenant.primary_color === '#1B7E7E') {
      warnings.push("Couleur du club non fournie par API-Football (à définir manuellement).");
    }

    // 3. Effectif — n'ajoute que les joueurs absents (par nom)
    let playersAdded = 0, playersSkipped = 0;
    try {
      const squad = await apiFootball.getSquad(team.id);
      const { data: existingPlayers } = await supabase
        .from('players').select('full_name').eq('tenant_id', tenant.id);
      const existingNames = new Set((existingPlayers || []).map((p) => (p.full_name || '').toLowerCase().trim()));
      let order = (existingPlayers || []).length;

      const toInsert = [];
      for (const p of squad) {
        if (!p.full_name) continue;
        if (existingNames.has(p.full_name.toLowerCase().trim())) { playersSkipped++; continue; }
        toInsert.push({
          tenant_id:     tenant.id,
          full_name:     p.full_name,
          shirt_number:  toIntOrNull(p.shirt_number),
          position:      POSITION_FR[p.position] || 'Autre',
          image_url:     p.photo || null,
          display_order: order++,
          metadata:      { api_football_id: p.apiId }
        });
      }
      if (toInsert.length) {
        const { error } = await supabase.from('players').insert(toInsert);
        if (error) throw error;
        playersAdded = toInsert.length;
      }
    } catch (sqErr) {
      warnings.push('Effectif non importé : ' + (sqErr.response?.data?.message || sqErr.message));
    }

    // 4. Palmarès & joueur star — non exposés par les endpoints "team" d'API-Football
    warnings.push('Palmarès non disponible via API-Football → à saisir dans l\'onglet Palmarès.');
    warnings.push('Joueur star à cocher manuellement dans l\'onglet Joueurs.');

    return ok(res, {
      tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
      created: !tenantId && filledFields.length >= 0,
      filledFields,
      playersAdded,
      playersSkipped,
      warnings
    }, 201);
  } catch (err) {
    if (err.code === 'NO_KEY') return fail(res, err.message, 500);
    console.error('[import-from-football]', err.message);
    return fail(res, err.response?.data?.message || err.message, 502);
  }
});

// POST /api/v2/admin/clubs-crud/import-trophies-footmercato
// body: { tenantId, slug }  — slug = identifiant Foot Mercato (ex: ol, psg, om)
// NON DESTRUCTIF : n'ajoute que les trophées dont le label n'existe pas déjà.
router.post('/import-trophies-footmercato', async (req, res) => {
  try {
    const { tenantId, slug } = req.body;
    if (!tenantId) return fail(res, 'tenantId requis');
    if (!slug)     return fail(res, 'slug Foot Mercato requis (ex: ol, psg, om)');

    // Vérifie le club
    const { data: tenant, error: tErr } = await supabase
      .from('tenants').select('id').eq('id', tenantId).single();
    if (tErr || !tenant) return fail(res, 'Club cible introuvable', 404);

    const scraped = await footmercato.getTrophies(slug);
    if (!scraped.length) return fail(res, 'Aucun trophée trouvé (slug incorrect ?)', 404);

    // Trophées déjà en base (dédup par label, insensible à la casse)
    const { data: existing } = await supabase
      .from('trophies').select('label').eq('tenant_id', tenantId);
    const seen = new Set((existing || []).map((t) => (t.label || '').toLowerCase().trim()));
    let order = (existing || []).length;

    const toInsert = [];
    let skipped = 0;
    for (const t of scraped) {
      if (seen.has(t.label.toLowerCase().trim())) { skipped++; continue; }
      toInsert.push({
        tenant_id:     tenantId,
        label:         t.label,
        count:         t.count,
        years_text:    t.years_text,
        scope:         t.scope,
        display_order: order++
      });
    }
    if (toInsert.length) {
      const { error } = await supabase.from('trophies').insert(toInsert);
      if (error) throw error;
    }

    return ok(res, {
      found: scraped.length,
      added: toInsert.length,
      skipped,
      trophies: scraped
    }, 201);
  } catch (err) {
    console.error('[import-trophies-footmercato]', err.message);
    return fail(res, err.message, 502);
  }
});

// ═══════════════════════════════════════════════════════════════
// FÉDÉRATIONS
// ═══════════════════════════════════════════════════════════════

const CONFEDERATIONS = ['CAF', 'UEFA', 'CONMEBOL', 'CONCACAF', 'AFC', 'OFC'];
// Champs éditables d'une fédération (tout ce qui alimente le hero)
const FED_FIELDS = [
  'name', 'country', 'founded_year', 'president', 'national_team_name',
  'logo_url', 'stadium', 'stadium_image_url', 'card_image_url',
  'primary_color', 'accent_color', 'flag_emoji', 'motto', 'motto_color', 'metadata'
];
const FED_SELECT = `
  id, slug, name, country, country_code, confederation_code, founded_year,
  president, national_team_name, logo_url, stadium, stadium_image_url, card_image_url,
  primary_color, accent_color, flag_emoji, motto, motto_color, metadata
`;

// GET /api/v2/admin/clubs-crud/federations — liste
router.get('/federations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('federations')
      .select(FED_SELECT)
      .order('name', { ascending: true });
    if (error) throw error;
    return ok(res, { federations: data || [] });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// GET /api/v2/admin/clubs-crud/federations/:id — une fédération
router.get('/federations/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('federations').select(FED_SELECT).eq('id', req.params.id).single();
    if (error || !data) return fail(res, 'Fédération introuvable', 404);
    return ok(res, { federation: data });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// GET /api/v2/admin/clubs-crud/federations/:id/members — clubs rattachés (+ hub)
router.get('/federations/:id/members', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('id, slug, name, logo_url, city, is_federation_hub, status')
      .eq('federation_id', req.params.id)
      .order('is_federation_hub', { ascending: false })
      .order('name', { ascending: true });
    if (error) throw error;
    return ok(res, { members: data || [] });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// POST /api/v2/admin/clubs-crud/federations — créer une fédération (hero complet)
router.post('/federations', async (req, res) => {
  try {
    const { name, country, country_code, confederation_code, slug } = req.body;
    if (!name) return fail(res, 'name requis');
    if (!country_code) return fail(res, 'country_code requis (ex: CM pour Cameroun)');
    const conf = (confederation_code || '').toUpperCase();
    if (!CONFEDERATIONS.includes(conf)) return fail(res, 'confederation_code invalide (CAF, UEFA, CONMEBOL, CONCACAF, AFC, OFC)');

    const cleanedSlug = cleanSlug(slug || name);
    if (!cleanedSlug) return fail(res, 'slug invalide');

    const row = { slug: cleanedSlug, country_code: country_code.toUpperCase(), confederation_code: conf };
    FED_FIELDS.forEach((k) => { if (req.body[k] !== undefined) row[k] = req.body[k]; });
    if ('founded_year' in row) row.founded_year = toIntOrNull(row.founded_year);
    if (!row.country) row.country = name;

    const { data, error } = await supabase.from('federations').insert(row).select(FED_SELECT).single();
    if (error) throw error;
    return ok(res, { federation: data }, 201);
  } catch (err) {
    return fail(res, err.message.includes('duplicate') ? 'Une fédération avec ce slug existe déjà' : err.message, 500);
  }
});

// PUT /api/v2/admin/clubs-crud/federations/:id — mettre à jour (hero)
router.put('/federations/:id', async (req, res) => {
  try {
    const updates = {};
    FED_FIELDS.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    if ('founded_year' in updates) updates.founded_year = toIntOrNull(updates.founded_year);
    if (req.body.country_code) updates.country_code = req.body.country_code.toUpperCase();
    if (req.body.confederation_code) {
      const conf = req.body.confederation_code.toUpperCase();
      if (!CONFEDERATIONS.includes(conf)) return fail(res, 'confederation_code invalide');
      updates.confederation_code = conf;
    }
    if (req.body.slug) updates.slug = cleanSlug(req.body.slug);
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('federations').update(updates).eq('id', req.params.id).select(FED_SELECT).single();
    if (error) throw error;

    // Synchronise le hero vers le tenant HUB de la fédération, pour que
    // /clubs/<hub> reflète le logo / la photo / la couleur saisis ici.
    const heroSync = {};
    ['logo_url', 'stadium_image_url', 'primary_color', 'name'].forEach((k) => {
      if (data[k]) heroSync[k] = data[k];
    });
    if (Object.keys(heroSync).length) {
      await supabase.from('tenants').update(heroSync)
        .eq('federation_id', req.params.id).eq('is_federation_hub', true);
    }

    return ok(res, { federation: data });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// DELETE /api/v2/admin/clubs-crud/federations/:id — supprime une fédération
// NON DESTRUCTIF pour les clubs : on détache les clubs membres (federation_id
// → null, ils restent en base) et on supprime le hub de la fédération.
router.delete('/federations/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // 1. Détache les clubs membres (on garde les clubs)
    await supabase.from('tenants').update({ federation_id: null })
      .eq('federation_id', id).not('is_federation_hub', 'is', true);
    // 2. Supprime le(s) hub(s) de la fédération
    await supabase.from('tenants').delete()
      .eq('federation_id', id).eq('is_federation_hub', true);
    // 3. Supprime la fédération
    const { error } = await supabase.from('federations').delete().eq('id', id);
    if (error) throw error;
    return ok(res, { deleted: true });
  } catch (err) {
    return fail(res, err.message, 500);
  }
});

// POST /api/v2/admin/clubs-crud/federations/:id/import-clubs
// Importe en masse les clubs du pays de la fédération depuis API-Football
// (championnats type "League"). NON DESTRUCTIF : n'ajoute que les clubs
// absents (dédup par nom dans la fédération), federation_id pré-rempli.
router.post('/federations/:id/import-clubs', async (req, res) => {
  try {
    const { data: fed, error: fErr } = await supabase
      .from('federations').select('id, name, country_code, primary_color')
      .eq('id', req.params.id).single();
    if (fErr || !fed) return fail(res, 'Fédération introuvable', 404);
    if (!fed.country_code) return fail(res, 'Code pays manquant sur la fédération');

    const warnings = [];

    // 1. Championnats du pays
    const leagues = (await apiFootball.getLeaguesByCountryCode(fed.country_code))
      .filter((l) => l.type === 'League');
    if (!leagues.length) return fail(res, `Aucun championnat trouvé pour ${fed.country_code} sur API-Football`, 404);

    // 2. Équipes par championnat, dédupliquées.
    //    On essaie les saisons de la plus récente à la plus ancienne et on
    //    garde la première qui répond : les plans gratuits API-Football ne
    //    couvrent que 2022–2024, donc la saison "courante" (ex: 2026) est
    //    refusée → on retombe automatiquement sur une saison accessible.
    const teamsById = new Map();
    for (const lg of leagues) {
      const seasons = [...(lg.seasons || [])]
        .map((s) => s.year)
        .filter(Boolean)
        .sort((a, b) => b - a);
      if (!seasons.length) { warnings.push(`Pas de saison pour ${lg.name}`); continue; }

      let usedSeason = null;
      let lastErr = null;
      for (const season of seasons) {
        try {
          const teams = await apiFootball.getTeamsByLeagueSeason(lg.id, season);
          if (teams.length) {
            teams.forEach((t) => { if (!teamsById.has(t.id)) teamsById.set(t.id, t); });
            usedSeason = season;
            break; // saison accessible avec des équipes → on s'arrête
          }
        } catch (e) {
          lastErr = e.message; // saison inaccessible (plan) → on tente la précédente
        }
      }
      if (usedSeason) warnings.push(`${lg.name} : saison ${usedSeason}`);
      else warnings.push(`${lg.name} : aucune saison accessible${lastErr ? ` (${lastErr})` : ''}`);
    }
    const teams = [...teamsById.values()].filter((t) => !t.national); // exclut la sélection nationale
    if (!teams.length) return fail(res, 'Aucun club récupéré (couverture API limitée pour ce pays ?)', 404);

    // 3. État existant (dédup nom dans la fédé + unicité slug globale)
    const { data: allTenants } = await supabase.from('tenants').select('name, slug, federation_id');
    const slugSet = new Set((allTenants || []).map((t) => t.slug));
    const fedNames = new Set((allTenants || []).filter((t) => t.federation_id === fed.id).map((t) => (t.name || '').toLowerCase().trim()));

    const toInsert = [];
    let skipped = 0;
    for (const t of teams) {
      const nameKey = (t.name || '').toLowerCase().trim();
      if (!t.name || fedNames.has(nameKey)) { skipped++; continue; }

      let slug = cleanSlug(t.name);
      if (slugSet.has(slug)) slug = `${slug}-${fed.country_code.toLowerCase()}`;
      if (slugSet.has(slug)) { skipped++; warnings.push(`Slug en conflit : ${t.name}`); continue; }

      slugSet.add(slug); fedNames.add(nameKey);
      toInsert.push({
        name: t.name, slug, type: 'club', status: 'active',
        federation_id: fed.id, is_federation_hub: false,
        country: t.country || null, city: t.city || null,
        logo_url: t.logo || null, founded_year: toIntOrNull(t.founded),
        stadium: t.stadium || null, stadium_image_url: t.stadium_image_url || null,
        primary_color: fed.primary_color || '#10b981',
        metadata: { api_football_id: t.id }
      });
    }

    if (toInsert.length) {
      const { error } = await supabase.from('tenants').insert(toInsert);
      if (error) throw error;
    }

    return ok(res, {
      leaguesScanned: leagues.length,
      found: teams.length,
      added: toInsert.length,
      skipped,
      warnings
    }, 201);
  } catch (err) {
    if (err.code === 'NO_KEY') return fail(res, err.message, 500);
    console.error('[import-clubs]', err.message);
    return fail(res, err.response?.data?.message || err.message, 502);
  }
});

// POST /api/v2/admin/clubs-crud/federations/:id/create-hub
// Crée (ou retourne) le tenant hub d'une fédération.
router.post('/federations/:id/create-hub', async (req, res) => {
  try {
    const { data: fed, error: fErr } = await supabase
      .from('federations').select('id, slug, name, country, country_code, primary_color, logo_url, stadium_image_url')
      .eq('id', req.params.id).single();
    if (fErr || !fed) return fail(res, 'Fédération introuvable', 404);

    // Hub déjà existant ?
    const { data: existing } = await supabase
      .from('tenants').select('id, slug, name')
      .eq('federation_id', fed.id).eq('is_federation_hub', true).maybeSingle();
    if (existing) return ok(res, { hub: existing, created: false });

    // Slug du hub = slug de la fédération si libre, sinon suffixe
    let hubSlug = fed.slug;
    const { data: clash } = await supabase.from('tenants').select('id').eq('slug', hubSlug).maybeSingle();
    if (clash) hubSlug = `${fed.slug}-federation`;

    const { data, error } = await supabase.from('tenants').insert({
      name: fed.name, slug: hubSlug, type: 'national_team',
      is_federation_hub: true, federation_id: fed.id,
      country: fed.country, country_code: fed.country_code,
      primary_color: fed.primary_color || '#10b981',
      logo_url: fed.logo_url || null,
      stadium_image_url: fed.stadium_image_url || null,
      status: 'active'
    }).select('id, slug, name').single();
    if (error) throw error;
    return ok(res, { hub: data, created: true }, 201);
  } catch (err) {
    return fail(res, err.message, 500);
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
    // FK fédération : "" → null (sinon violation de clé étrangère)
    if ('federation_id' in updates && !updates.federation_id) updates.federation_id = null;
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
