// ═══════════════════════════════════════════════════════════════
// scripts/sync-league.js — Synchronise UNE ligue depuis API-Football
// ---------------------------------------------------------------
// Généralise le endpoint /sync-ligue1 en outil en ligne de commande, avec :
//   • APERÇU À BLANC par défaut (dry-run) — rien n'est écrit sans --apply
//   • choix de la SAISON (--season=2025) ou auto (la plus récente accessible)
//   • NON DESTRUCTIF : aucune suppression ; pour un club existant on ne met à
//     jour que league_name / sport / status. Nom, logo, couleurs, billetterie,
//     produits saisis à la main sont PRÉSERVÉS. Matching par api_football_id.
//
// Exemples :
//   node scripts/sync-league.js --country=FR --league="Ligue 1"                 (dry-run, saison auto)
//   node scripts/sync-league.js --country=FR --league="Ligue 1" --season=2025   (dry-run 2025-2026)
//   node scripts/sync-league.js --country=FR --league="Ligue 1" --season=2025 --relegate="Ligue 2" --apply
//
// ⚠️ Écrit sur la base PROD (via backend/.env). Toujours lancer SANS --apply
//    d'abord pour lire l'aperçu, puis relancer avec --apply.
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const supabase = require('../db/supabase');
const api = require('../services/apiFootball');

const arg = (name, def) => {
  const m = process.argv.find((a) => a.startsWith(`--${name}=`));
  return m ? m.split('=').slice(1).join('=') : def;
};
const has = (name) => process.argv.includes(`--${name}`);

const COUNTRY   = arg('country', 'FR');
const LEAGUE    = arg('league', 'Ligue 1');
const LEAGUE_RE = new RegExp(LEAGUE.trim().replace(/\s+/g, '\\s*'), 'i');
const LABEL     = arg('label', LEAGUE);          // league_name à écrire
const SEASON    = arg('season', null);           // null → plus récente
const RELEGATE  = arg('relegate', null);         // ex: "Ligue 2" (sinon pas de rétrogradation)
const FED_SLUG  = arg('federationSlug', null);   // rattache les clubs AJOUTÉS à ce hub de fédération
const APPLY     = has('apply');

const slugify = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const toIntOrNull = (v) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; };

(async () => {
  console.log(`\n=== Sync ligue — pays=${COUNTRY} ligue~="${LEAGUE}" label="${LABEL}" saison=${SEASON || 'auto'} relegate=${RELEGATE || 'non'} apply=${APPLY} ===\n`);

  // 1. Localiser la ligue sur API-Football (code 2 lettres OU nom de pays)
  const leagues = COUNTRY.length === 2
    ? await api.getLeaguesByCountryCode(COUNTRY)
    : await api.getLeaguesByCountryName(COUNTRY);
  const lg = leagues.find((l) => l.type === 'League' && LEAGUE_RE.test(l.name));
  if (!lg) { console.log(`❌ Ligue "${LEAGUE}" introuvable pour ${COUNTRY}.`); process.exit(1); }

  // 2. Équipes de la saison demandée (ou la plus récente accessible)
  let season = SEASON ? Number(SEASON) : null;
  let teams = [];
  if (season) {
    teams = (await api.getTeamsByLeagueSeason(lg.id, season)).filter((t) => !t.national);
  } else {
    const years = (lg.seasons || []).map((s) => s.year).filter(Boolean).sort((a, b) => b - a);
    for (const y of years) {
      const t = await api.getTeamsByLeagueSeason(lg.id, y);
      if (t.length) { teams = t.filter((x) => !x.national); season = y; break; }
    }
  }
  if (!teams.length) { console.log('❌ Aucune équipe récupérée.'); process.exit(1); }
  console.log(`Ligue: ${lg.name} (id ${lg.id}) · Saison ${season} · ${teams.length} équipes\n`);

  const freshIds = new Set(teams.map((t) => String(t.id)));
  const plan = { tag: [], add: [], relegate: [], dup: [] };

  // 3. Rétrogradation (optionnelle) : clubs actuellement "LABEL" mais absents
  if (RELEGATE) {
    const { data: current } = await supabase.from('tenants').select('id, name, metadata').eq('league_name', LABEL);
    for (const c of current || []) {
      const apiId = c.metadata?.api_football_id;
      if (!apiId || !freshIds.has(String(apiId))) plan.relegate.push(c);
    }
  }

  // 4. Taguer / ajouter
  const { data: allTenants } = await supabase.from('tenants').select('slug');
  const slugSet = new Set((allTenants || []).map((t) => t.slug));
  for (const t of teams) {
    const { data: matches } = await supabase.from('tenants').select('id, name').eq('metadata->>api_football_id', String(t.id));
    if (matches && matches.length) {
      matches.sort((a, b) => (b.name || '').length - (a.name || '').length);
      plan.tag.push(matches[0]);
      plan.dup.push(...matches.slice(1));
    } else {
      let slug = slugify(t.name);
      if (slugSet.has(slug)) slug = `${slug}-${COUNTRY.toLowerCase()}`;
      if (slugSet.has(slug)) { plan.add.push({ ...t, slug: null, skip: true }); continue; }
      slugSet.add(slug);
      plan.add.push({ ...t, slug });
    }
  }

  // 5. Rapport
  console.log(`À TAGUER "${LABEL}"          : ${plan.tag.length}`);
  console.log(`À AJOUTER (promus/absents)  : ${plan.add.filter((a) => !a.skip).length}`);
  plan.add.filter((a) => !a.skip).forEach((a) => console.log(`   + ${a.name}`));
  if (plan.add.some((a) => a.skip)) console.log(`   (⚠ ${plan.add.filter((a) => a.skip).length} ignoré(s) : conflit de slug)`);
  if (RELEGATE) {
    console.log(`À RÉTROGRADER "${RELEGATE}" : ${plan.relegate.length}`);
    plan.relegate.forEach((r) => console.log(`   - ${r.name}`));
  }
  if (plan.dup.length) console.log(`Doublons neutralisés (league_name=null) : ${plan.dup.length}`);

  // Rattachement fédération (pour les clubs AJOUTÉS)
  let federationId = null;
  if (FED_SLUG) {
    const { data: hub } = await supabase.from('tenants').select('id, name').eq('slug', FED_SLUG).eq('is_federation_hub', true).maybeSingle();
    if (!hub) { console.log(`❌ Hub de fédération introuvable : ${FED_SLUG}`); process.exit(1); }
    federationId = hub.id;
    console.log(`Rattachement → ${hub.name} (${federationId})`);
  }

  if (!APPLY) { console.log('\n(DRY-RUN — relance avec --apply pour écrire)\n'); process.exit(0); }

  // 6. Application (non destructive)
  for (const r of plan.relegate) await supabase.from('tenants').update({ league_name: RELEGATE }).eq('id', r.id);
  for (const t of plan.tag) await supabase.from('tenants').update({ league_name: LABEL, sport: 'football', status: 'active' }).eq('id', t.id);
  for (const d of plan.dup) await supabase.from('tenants').update({ league_name: null }).eq('id', d.id);
  for (const a of plan.add.filter((x) => !x.skip)) {
    await supabase.from('tenants').insert({
      name: a.name, slug: a.slug, type: 'club', status: 'active',
      country: a.country || null, city: a.city || null,
      league_name: LABEL, logo_url: a.logo || null, founded_year: toIntOrNull(a.founded),
      stadium: a.stadium || null, primary_color: '#10b981', is_federation_hub: false,
      federation_id: federationId,
      metadata: { api_football_id: a.id },
    });
  }
  console.log(`\n✅ Appliqué — saison ${season} : ${plan.tag.length} tagué(s), ${plan.add.filter((a) => !a.skip).length} ajouté(s), ${plan.relegate.length} rétrogradé(s).\n`);
  process.exit(0);
})().catch((e) => { console.error('ERREUR:', e.message); process.exit(1); });
