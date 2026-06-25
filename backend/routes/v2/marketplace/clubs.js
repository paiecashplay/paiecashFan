// ═══════════════════════════════════════════════════════════════
// routes/v2/marketplace/clubs.js
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const supabase = require('../../../db/supabase');
const { getPlayersByTenant, getStarPlayer } = require('../../../db/players');
const { getTrophiesByTenant } = require('../../../db/trophies');
const router = express.Router();

const ok   = (res, data, s = 200) => res.status(s).json({ success: true,  data,  error: '' });
const fail = (res, msg,  s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// ─── GET /api/v2/marketplace/clubs ──────────────────────────
// Liste tous les clubs actifs. Supporte ?country=&sport=&search=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { country, sport, search, page = 1, limit = 50 } = req.query;
    const from = (page - 1) * limit;

    let query = supabase
      .from('tenants')
      .select(`
        id, slug, name, country, city, sport, logo_url, primary_color,
        stadium, founded_year, is_federation_hub, status,
        federation:federations(id, slug, name, logo_url)
      `)
      .eq('status', 'active')
      .not('is_federation_hub', 'is', true)
      .range(from, from + Number(limit) - 1)
      .order('name', { ascending: true });

    if (country) query = query.eq('country', country);
    if (sport)   query = query.eq('sport', sport);
    if (search)  query = query.ilike('name', `%${search}%`);

    const { data: clubs, error } = await query;
    if (error) throw error;

    return ok(res, { clubs: clubs || [], total: clubs?.length ?? 0 });
  } catch (err) {
    console.error('[clubs] GET / error:', err.message);
    return fail(res, 'Failed to fetch clubs', 500);
  }
});

// ─── GET /api/v2/marketplace/clubs/:slugOrId ─────────────────
// Détail complet d'un club : infos + joueurs + star + palmarès + produits
router.get('/:slugOrId', async (req, res) => {
  try {
    const p = req.params.slugOrId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p);

    let query = supabase
      .from('tenants')
      .select(`
        id, slug, name, short_code, country, city, sport, logo_url, primary_color,
        stadium, stadium_image_url, founded_year, is_federation_hub,
        motto, motto_color, coach, president, status, metadata,
        federation:federations(id, slug, name, logo_url, country_code, confederation_code, stadium_image_url)
      `);

    query = isUuid ? query.eq('id', p) : query.eq('slug', p);
    const { data: club, error } = await query.maybeSingle();

    if (error) throw error;
    if (!club) return fail(res, 'Club not found', 404);

    // Masque côté public les clubs non actifs (suspendus / rejetés / en
    // attente). Seuls les clubs 'active' sont visibles sur le site.
    if (club.status && club.status !== 'active') return fail(res, 'Club not found', 404);

    const [players, starPlayer, trophies, productsRes] = await Promise.all([
      getPlayersByTenant(club.id),
      getStarPlayer(club.id),
      getTrophiesByTenant(club.id),
      supabase
        .from('products')
        .select('id, name, description, eur_price, pcc_price, images, sizes, category_slug, display_order, status')
        .eq('tenant_id', club.id)
        .eq('status', 'active')
        .order('display_order', { ascending: true })
    ]);

    if (productsRes.error) throw productsRes.error;

    // Page fédération : si ce tenant est un hub, on récupère les clubs membres
    // (mêmes federation_id, hors hub, actifs) pour afficher la grille Équipes.
    let members = [];
    if (club.is_federation_hub && club.federation?.id) {
      const { data: mem } = await supabase
        .from('tenants')
        .select('id, slug, name, short_code, country, city, logo_url, primary_color, stadium, stadium_image_url, founded_year')
        .eq('federation_id', club.federation.id)
        .not('is_federation_hub', 'is', true)
        .eq('status', 'active')
        .order('name', { ascending: true });
      members = mem || [];
    }

    return ok(res, {
      club,
      starPlayer,
      players,
      trophies,
      products: productsRes.data || [],
      members
    });
  } catch (err) {
    console.error('[clubs] GET /:slugOrId error:', err.message);
    return fail(res, 'Club fetch failed', 500);
  }
});

// ─── POST /api/v2/marketplace/clubs/apply ────────────────────
router.post('/apply', async (req, res) => {
  try {
    const { applicantName, applicantEmail, clubName, country, sport, website, description } = req.body;
    if (!applicantName || !applicantEmail || !clubName || !country) {
      return fail(res, 'Missing required fields: applicantName, applicantEmail, clubName, country');
    }

    const { data, error } = await supabase
      .from('club_applications')
      .insert({
        applicant_name:  applicantName,
        applicant_email: applicantEmail,
        club_name:  clubName,
        country,
        sport:      sport || 'football',
        website:    website || null,
        description: description || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return ok(res, data, 201);
  } catch (err) {
    console.error('[clubs] POST /apply error:', err.message);
    return fail(res, 'Application failed: ' + err.message, 500);
  }
});

// ─── GET /api/v2/marketplace/clubs/:tenantId/dashboard ───────
// Dashboard club admin : produits + revenus
router.get('/:tenantId/dashboard', async (req, res) => {
  try {
    const { tenantId } = req.params;

    const { data: club, error: clubErr } = await supabase
      .from('tenants')
      .select('id, slug, name, logo_url, primary_color, status')
      .eq('id', tenantId)
      .maybeSingle();

    if (clubErr) throw clubErr;
    if (!club) return fail(res, 'Club not found', 404);

    const [productsRes, txRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, eur_price, pcc_price, status, display_order')
        .eq('tenant_id', tenantId)
        .order('display_order', { ascending: true }),
      supabase
        .from('transactions')
        .select('id, type, pcc_amount, status, created_at')
        .eq('tenant_id', tenantId)
        .eq('type', 'spend')
        .in('status', ['complete', 'success'])
        .order('created_at', { ascending: false })
        .limit(100)
    ]);

    if (productsRes.error) throw productsRes.error;
    if (txRes.error) throw txRes.error;

    const txs = txRes.data || [];
    const earnings = txs.reduce((sum, tx) => sum + parseFloat(tx.pcc_amount || 0), 0);

    return ok(res, {
      club,
      products:    productsRes.data || [],
      earnings,
      totalSales:  txs.length,
      recentSales: txs.slice(0, 20)
    });
  } catch (err) {
    console.error('[clubs] GET /:tenantId/dashboard error:', err.message);
    return fail(res, 'Dashboard fetch failed', 500);
  }
});

module.exports = router;
