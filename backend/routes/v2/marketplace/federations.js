// ═══════════════════════════════════════════════════════════════
// routes/v2/marketplace/federations.js
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const supabase = require('../../../db/supabase');
const { getPlayersByFederation } = require('../../../db/players');
const { getTrophiesByFederation } = require('../../../db/trophies');
const apiFootball = require('../../../services/apiFootball');
const router = express.Router();

const ok   = (res, data, s = 200) => res.status(s).json({ success: true,  data,  error: '' });
const fail = (res, msg,  s = 400) => res.status(s).json({ success: false, data: null, error: msg });
const POSITION_FR = {
  Goalkeeper: 'Gardien de but',
  Defender: 'Défenseur',
  Midfielder: 'Milieu de terrain',
  Attacker: 'Attaquant',
};
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

// ─── GET /api/v2/marketplace/federations/national-teams/:teamId/players ───
router.get('/national-teams/:teamId/players', async (req, res) => {
    try {
      const teamId = String(req.params.teamId);
      const federationId = req.query.federationId;

      if (!federationId) {
        return fail(
          res,
          'Federation id is required',
          400
        );
      }

      // 1. Récupérer les personnalisations de la fédération
      const { data: federation, error: fedError } = await supabase
        .from('federations')
        .select('id, metadata')
        .eq('id', federationId)
        .single();

      if (fedError || !federation) {
        return fail(
          res,
          'Federation not found',
          404
        );
      }

      const nationalTeams =
        federation.metadata?.nationalTeams || {};

      const manualTeams =
        nationalTeams.manual || [];

      // ═══════════════════════════════════════
      // 2. SÉLECTION MANUELLE
      // ═══════════════════════════════════════
      const manualTeam = manualTeams.find(
        (team) => String(team.id) === teamId
      );

      if (manualTeam) {
        const players =
          (manualTeam.players?.local || [])
            .filter(
              (player) =>
                player.hidden !== true
            )
            .map((player) => ({
              ...player,
              source: 'manual',
            }));

        return ok(res, {
          team: {
            ...manualTeam,
            players,
            source: 'manual',
          },
        });
      }

      // ═══════════════════════════════════════
      // 3. SÉLECTION API-FOOTBALL
      // ═══════════════════════════════════════

      const numericTeamId = Number(teamId);

      if (
        !Number.isInteger(numericTeamId) ||
        numericTeamId <= 0
      ) {
        return fail(
          res,
          'Invalid national team id',
          400
        );
      }

      const apiTeam =
        await apiFootball.getTeam(
          numericTeamId
        );

      if (!apiTeam) {
        return fail(
          res,
          'National team not found',
          404
        );
      }

      const enrichedTeam =
        await apiFootball.enrichNationalTeamWithPlayers(
          apiTeam
        );

      const teamConfig =
        nationalTeams.teams?.[teamId] || {};

      const playersConfig =
        teamConfig.players || {};

      const overrides =
        playersConfig.overrides || {};

      const localPlayers =
        playersConfig.local || [];

      const apiPlayers =
        enrichedTeam?.players || [];

      // 4. Appliquer les modifications admin aux joueurs API
      const mergedApiPlayers = apiPlayers
        .map((entry) => {
          const rawPlayer =
            entry?.player || entry;

          const playerId =
            String(rawPlayer?.id);

          const override =
            overrides[playerId] || {};

          const rawPosition =
            override.position ??
            entry?.position ??
            entry?.statistics?.[0]?.games?.position ??
            null;

          const position =
            typeof POSITION_FR !== 'undefined'
              ? (
                  POSITION_FR[rawPosition] ||
                  rawPosition ||
                  null
                )
              : rawPosition;

          return {
            ...entry,

            player: entry?.player
              ? {
                  ...entry.player,

                  name:
                    override.name ??
                    entry.player.name,

                  photo:
                    override.photo ??
                    entry.player.photo,
                }
              : undefined,

            id:
              rawPlayer?.id,

            name:
              override.name ??
              rawPlayer?.name,

            number:
              override.number ??
              entry?.number ??
              entry?.statistics?.[0]?.games?.number ??
              null,

            position,

            photo:
              override.photo ??
              rawPlayer?.photo ??
              null,

            hidden:
              override.hidden === true,

            source: 'api',
          };
        })
        .filter(
          (player) =>
            !player.hidden
        );

      // 5. Joueurs ajoutés manuellement à une sélection API
      const mergedManualPlayers =
        localPlayers
          .filter(
            (player) =>
              player.hidden !== true
          )
          .map((player) => ({
            ...player,
            source: 'manual',
          }));

      return ok(res, {
        team: {
          ...enrichedTeam,

          name:
            teamConfig.displayName ||
            enrichedTeam.name,

          logo:
            teamConfig.logo ||
            enrichedTeam.logo,

          players: [
            ...mergedApiPlayers,
            ...mergedManualPlayers,
          ],

          source: 'api',
        },
      });

    } catch (err) {
      console.error(
        '[federations] national team players error:',
        err.message
      );

      return fail(
        res,
        'Failed to fetch national team players',
        500
      );
    }
  }
);

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

    // ═══════════════════════════════════════════════════════════════
    // Sélections nationales : API-Football + personnalisations admin
    // ═══════════════════════════════════════════════════════════════

    let nationalTeams = {
      men: [],
      women: [],
      youth: [],
    };

    try {
      if (federation.country) {
        const apiTeams =
          await apiFootball.getNationalTeamsByCountry(
            federation.country,
            federation.country_code
          );

        const config =
          federation.metadata?.nationalTeams?.teams || {};

        const manualTeams =
          federation.metadata?.nationalTeams?.manual || [];

        const applyOverrides = (teams = []) =>
          teams
            .map((team) => {
              const override =
                config[String(team.id)] || {};

              return {
                ...team,

                apiName: team.name,
                apiLogo: team.logo,

                name:
                  override.displayName ||
                  team.name,

                logo:
                  override.logo ||
                  team.logo,

                gender:
                  override.gender ||
                  team.gender,

                group:
                  override.group || ((override.category || team.category) !== 'senior'
                    ? 'youth' : (override.gender || team.gender) === 'female' ? 'women' : 'men'
                  ),

                category:
                  override.category ||
                  team.category,

                enabled:
                  override.enabled !== false,

                displayOrder:
                  Number(
                    override.displayOrder ?? 0
                  ),

                source: 'api',
              };
            })
            .filter((team) => team.enabled);

        const normalizedManualTeams = manualTeams
        .filter((team) => team.enabled !== false)
        .map((team) => ({
          ...team,

          group:
            team.group ||
            (
              team.category !== 'senior'
                ? 'youth'
                : team.gender === 'female'
                  ? 'women'
                  : 'men'
            ),

          source: 'manual',
        }));

        const manualMen = normalizedManualTeams.filter(
          (team) => team.group === 'men'
        );

        const manualWomen = normalizedManualTeams.filter(
          (team) => team.group === 'women'
        );

        const manualYouth = normalizedManualTeams.filter(
          (team) => team.group === 'youth'
        );

      const allApiTeams = [
        ...applyOverrides(apiTeams.men),
        ...applyOverrides(apiTeams.women),
        ...applyOverrides(apiTeams.youth),
      ];

      const apiMen = allApiTeams.filter(
        (team) => team.group === 'men'
      );

      const apiWomen = allApiTeams.filter(
        (team) => team.group === 'women'
      );

      const apiYouth = allApiTeams.filter(
        (team) => team.group === 'youth'
      );
      const sortByDisplayOrder = (teams = []) =>
          [...teams].sort(
            (a, b) =>
              Number(a.displayOrder || 0) -
              Number(b.displayOrder || 0)
          );

        nationalTeams = {
          men: sortByDisplayOrder([
            ...apiMen,
            ...manualMen,
          ]),

          women: sortByDisplayOrder([
            ...apiWomen,
            ...manualWomen,
          ]),

          youth: sortByDisplayOrder([
            ...apiYouth,
            ...manualYouth,
          ]),
        };
      }
    } catch (apiFootballError) {
      console.error(
        '[federations] API-Football national teams error:',
        apiFootballError.message
      );
    }

    // Clubs membres + hub de la fédération en parallèle
    const [membersRes, hubRes, players, trophies] = await Promise.all([
      supabase
        .from('tenants')
        .select(`
          id, slug, name, short_code, city, logo_url, primary_color,
          stadium, stadium_image_url, founded_year, status, league_name
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
    if (hubRes.error) throw hubRes.error;

    const hub = hubRes.data || null;

    let products = [];

    if (hub?.id) {
      const { data: hubProducts, error: productsErr } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          eur_price,
          pcc_price,
          images,
          sizes,
          category_slug,
          display_order,
          status
        `)
        .eq('tenant_id', hub.id)
        .eq('status', 'active')
        .order('display_order', { ascending: true });

      if (productsErr) throw productsErr;

      products = hubProducts || [];
    }

    return ok(res, {
      federation,
      hub,
      members: membersRes.data || [],
      players,
      trophies,
      nationalTeams,
      products
    });
  } catch (err) {
    console.error('[federations] GET /:slugOrId error:', err.message);
    return fail(res, 'Federation fetch failed', 500);
  }
});



module.exports = router;
