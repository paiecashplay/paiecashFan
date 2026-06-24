// ═══════════════════════════════════════════════════════════════
// routes/v2/marketplace/federations.js
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const supabase = require('../../../db/supabase');
const { getPlayersByFederation } = require('../../../db/players');
const { getTrophiesByFederation } = require('../../../db/trophies');
const router = express.Router();

const ok   = (res, data, s = 200) => res.status(s).json({ success: true,  data,  error: '' });
const fail = (res, msg,  s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// ─── GET /api/v2/marketplace/federations ─────────────────────
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('federations')
      .select('id, slug, name, country, country_code, confederation_code, logo_url, founded_year')
      .order('name', { ascending: true });

    if (error) throw error;
    return ok(res, { federations: data || [] });
  } catch (err) {
    console.error('[federations] GET / error:', err.message);
    return fail(res, 'Failed to fetch federations', 500);
  }
});

// ─── GET /api/v2/marketplace/federations/:slugOrId ───────────
// Détail d'une fédération + clubs membres + hub tenant + joueurs séléction nationale
router.get('/:slugOrId', async (req, res) => {
  try {
    const p = req.params.slugOrId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p);

    let fedQuery = supabase
      .from('federations')
      .select(`
        id, slug, name, country, country_code, confederation_code, founded_year,
        logo_url, primary_color, accent_color, flag_emoji, stadium, stadium_image_url,
        motto, motto_color, national_team_name, president, metadata
      `);

    fedQuery = isUuid ? fedQuery.eq('id', p) : fedQuery.eq('slug', p);
    const { data: federation, error: fedErr } = await fedQuery.maybeSingle();

    if (fedErr) throw fedErr;
    if (!federation) return fail(res, 'Federation not found', 404);

    // Clubs membres + hub de la fédération en parallèle
    const [membersRes, hubRes, players, trophies] = await Promise.all([
      supabase
        .from('tenants')
        .select(`
          id, slug, name, short_code, city, logo_url, primary_color,
          stadium, stadium_image_url, founded_year, status
        `)
        .eq('federation_id', federation.id)
        .not('is_federation_hub', 'is', true)
        .eq('status', 'active')
        .order('name', { ascending: true }),

      supabase
        .from('tenants')
        .select('id, slug, name, logo_url, primary_color, stadium, metadata')
        .eq('federation_id', federation.id)
        .eq('is_federation_hub', true)
        .maybeSingle(),

      getPlayersByFederation(federation.id),
      getTrophiesByFederation(federation.id)
    ]);

    if (membersRes.error) throw membersRes.error;

    return ok(res, {
      federation,
      hub:     hubRes.data || null,
      members: membersRes.data || [],
      players,
      trophies
    });
  } catch (err) {
    console.error('[federations] GET /:slugOrId error:', err.message);
    return fail(res, 'Federation fetch failed', 500);
  }
});

module.exports = router;
