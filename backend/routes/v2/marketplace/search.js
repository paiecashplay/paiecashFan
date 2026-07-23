// ═══════════════════════════════════════════════════════════════
// routes/v2/marketplace/search.js
// Recherche unifiée (clubs + fédérations + produits) sur la VRAIE base.
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
    // Exécution parallèle des recherches afin de réduire le temps de réponse.
    const [
      clubsResult,
      federationsResult,
      productsResult
    ] = await Promise.all([
      // ── Clubs ────────────────────────────────────────────────────
      supabase
        .from('tenants')
        .select(`
          id,
          slug,
          name,
          city,
          country,
          logo_url,
          primary_color,
          federation:federations(
            slug,
            name
          )
        `)
        .eq('status', 'active')
        .not('is_federation_hub', 'is', true)
        .or(
          `name.ilike.${like},slug.ilike.${like},short_code.ilike.${like},city.ilike.${like}`
        )
        .order('name', { ascending: true })
        .limit(25),

      // ── Fédérations ──────────────────────────────────────────────
      supabase
        .from('federations')
        .select(`
          id,
          slug,
          name,
          country,
          country_code,
          confederation_code,
          logo_url,
          flag_emoji,
          metadata
        `),

      // ── Produits ─────────────────────────────────────────────────
      supabase
        .from('products')
        .select(`
          id,
          tenant_id,
          category_id,
          name,
          description,
          pcc_price,
          eur_price,
          image_url,
          stock,
          status,
          tenant:tenants!inner(
            id,
            slug,
            name,
            logo_url,
            primary_color,
            status
          ),
          category:product_categories(
            id,
            name,
            slug
          )
        `)
        .eq('status', 'active')
        .eq('tenant.status', 'active')
        .or(
          `name.ilike.${like},description.ilike.${like}`
        )
        .order('name', { ascending: true })
        .limit(25)
    ]);

    if (clubsResult.error) {
      throw clubsResult.error;
    }

    if (federationsResult.error) {
      throw federationsResult.error;
    }

    if (productsResult.error) {
      throw productsResult.error;
    }

    const clubs = clubsResult.data || [];
    const federations = federationsResult.data || [];
    const products = productsResult.data || [];

    // ── Filtrage JS des fédérations ───────────────────────────────
    // Cela permet de rechercher aussi le sigle stocké dans metadata.acronym.
    const federationMatches = federations.filter((federation) => {
      const acronym =
        federation.metadata?.acronym || '';

      return [
        federation.name,
        federation.country,
        federation.slug,
        federation.country_code,
        federation.confederation_code,
        acronym
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(ql)
        );
    });

    const results = [
      // ── Résultats fédérations ────────────────────────────────────
      ...federationMatches.map((federation) => ({
        type: 'federation',
        id: `fed-${federation.id}`,
        slug: federation.slug,
        label: federation.name,
        sub: [
          federation.country,
          federation.confederation_code
        ]
          .filter(Boolean)
          .join(' · '),
        logo: federation.logo_url || null,
        flag: federation.flag_emoji || null
      })),

      // ── Résultats clubs ──────────────────────────────────────────
      ...clubs.map((club) => ({
        type: 'club',
        id: `club-${club.id}`,
        slug: club.slug,
        label: club.name,
        sub: [
          club.city,
          club.federation?.name
        ]
          .filter(Boolean)
          .join(' · '),
        logo: club.logo_url || null,
        color: club.primary_color || null
      })),

      // ── Résultats produits ───────────────────────────────────────
      ...products.map((product) => ({
        type: 'product',
        id: `product-${product.id}`,

        productId: product.id,

        clubId: product.tenant?.id || null,
        clubSlug: product.tenant?.slug || null,
        clubName: product.tenant?.name || null,

        label: product.name,

        sub: [
          product.tenant?.name,
          product.category?.name,
          product.eur_price !== null &&
          product.eur_price !== undefined
            ? `${Number(product.eur_price).toFixed(2)} €`
            : null
        ]
          .filter(Boolean)
          .join(' · '),

        logo:
          product.image_url ||
          product.tenant?.logo_url ||
          null,

        color:
          product.tenant?.primary_color ||
          null,

        priceEur:
          product.eur_price !== null &&
          product.eur_price !== undefined
            ? Number(product.eur_price)
            : null,

        pricePcc:
          product.pcc_price !== null &&
          product.pcc_price !== undefined
            ? Number(product.pcc_price)
            : null,

        category:
          product.category?.slug ||
          product.category?.name ||
          null
      }))
    ];

    return ok(res, { results });
  } catch (err) {
    console.error('[search] GET / error:', err.message);
    return fail(res, 'Search failed', 500);
  }
});

module.exports = router;
