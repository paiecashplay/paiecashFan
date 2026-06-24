// ═══════════════════════════════════════════════════════════════
// routes/v2/marketplace/search.js
// Recherche unifiée (clubs + fédérations) sur la VRAIE base.
// GET /api/v2/marketplace/search?q=...
//   • clubs : tenants actifs non-hub, multi-colonnes (nom, slug, ville, code)
//   • fédérations : table federations filtrée en JS (petite) → inclut le
//     sigle stocké dans metadata.acronym (ex: FECAFOOT, FFF).
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const supabase = require('../../../db/supabase');
const router = express.Router();

const ok   = (res, data, s = 200) => res.status(s).json({ success: true,  data,  error: '' });
const fail = (res, msg,  s = 400) => res.status(s).json({ success: false, data: null, error: msg });

router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return ok(res, { results: [] });

  // Sanitize pour le filtre PostgREST .or() (les virgules / parenthèses cassent
  // la syntaxe). On garde la version brute pour le filtre JS des fédérations.
  const safe = q.replace(/[,()]/g, ' ').trim();
  const like = `%${safe}%`;
  const ql = q.toLowerCase();

  try {
    // ── Clubs (tenants non-hub) ───────────────────────────────────
    const { data: clubs, error: cErr } = await supabase
      .from('tenants')
      .select('id, slug, name, city, country, logo_url, primary_color, federation:federations(slug, name)')
      .eq('status', 'active')
      .not('is_federation_hub', 'is', true)
      .or(`name.ilike.${like},slug.ilike.${like},short_code.ilike.${like},city.ilike.${like}`)
      .order('name', { ascending: true })
      .limit(25);
    if (cErr) throw cErr;

    // ── Fédérations (table petite → filtre JS, inclut le sigle) ────
    const { data: feds, error: fErr } = await supabase
      .from('federations')
      .select('id, slug, name, country, country_code, confederation_code, logo_url, flag_emoji, metadata');
    if (fErr) throw fErr;

    const fedMatches = (feds || []).filter((f) => {
      const acronym = f.metadata?.acronym || '';
      return [f.name, f.country, f.slug, f.country_code, f.confederation_code, acronym]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(ql));
    });

    const results = [
      // Fédérations d'abord (plus pertinent quand on cherche une instance)
      ...fedMatches.map((f) => ({
        type:  'federation',
        id:    `fed-${f.id}`,
        slug:  f.slug,
        label: f.name,
        sub:   [f.country, f.confederation_code].filter(Boolean).join(' · '),
        logo:  f.logo_url || null,
        flag:  f.flag_emoji || null,
      })),
      ...(clubs || []).map((c) => ({
        type:  'club',
        id:    `club-${c.id}`,
        slug:  c.slug,
        label: c.name,
        sub:   [c.city, c.federation?.name].filter(Boolean).join(' · '),
        logo:  c.logo_url || null,
        color: c.primary_color || null,
      })),
    ];

    return ok(res, { results });
  } catch (err) {
    console.error('[search] GET / error:', err.message);
    return fail(res, 'Search failed', 500);
  }
});

module.exports = router;
