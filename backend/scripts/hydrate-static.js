// One-shot : hydrate la BASE à partir des données statiques du front
// (clubProfiles.js) → joueurs, palmarès, infos club. NON DESTRUCTIF :
//   • n'insère les joueurs/palmarès QUE si le tenant en a 0 (pas de doublon),
//   • ne met à jour une info club que si elle est vide.
// Usage : node scripts/hydrate-static.js [--commit]  (sans --commit = dry-run)
require('dotenv').config();
const path = require('path');
const { pathToFileURL } = require('url');
const supabase = require('../db/supabase');

const COMMIT = process.argv.includes('--commit');

(async () => {
  const modPath = pathToFileURL(path.resolve(__dirname, '../../paiecashfan-app/src/data/clubProfiles.js')).href;
  const { clubProfiles } = await import(modPath);

  let clubsTouched = 0, playersAdded = 0, trophiesAdded = 0, infosPatched = 0;

  for (const [slug, prof] of Object.entries(clubProfiles)) {
    const { data: tenant } = await supabase.from('tenants')
      .select('id, name, motto, motto_color, founded_year, stadium, stadium_image_url, coach, president')
      .eq('slug', slug).maybeSingle();
    if (!tenant) continue; // pas de club en base pour ce slug

    const actions = [];

    // ── Joueurs ────────────────────────────────────────────────
    if (Array.isArray(prof.squad) && prof.squad.length) {
      const { count } = await supabase.from('players').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id);
      if (!count) {
        const starName = prof.starPlayer?.name;
        const rows = prof.squad.map((p, i) => ({
          tenant_id: tenant.id,
          full_name: p.name,
          shirt_number: p.number ?? null,
          position: p.position || null,
          nationality_code: p.country || null,
          image_url: p.image || null,
          is_star_player: starName ? p.name === starName : false,
          stats: (prof.starPlayer && p.name === starName) ? prof.starPlayer.stats || null : null,
          display_order: i,
        }));
        actions.push(`+${rows.length} joueurs`);
        if (COMMIT) { const { error } = await supabase.from('players').insert(rows); if (error) actions.push('ERR joueurs:' + error.message); }
        playersAdded += rows.length;
      }
    }

    // ── Palmarès ───────────────────────────────────────────────
    const breakdown = prof.trophies?.breakdown;
    if (Array.isArray(breakdown) && breakdown.length) {
      const { count } = await supabase.from('trophies').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id);
      if (!count) {
        // La contrainte DB n'accepte que domestic/european/world.
        const SCOPE = { national: 'domestic', regional: 'domestic', domestic: 'domestic', european: 'european', world: 'world' };
        const rows = breakdown.map((t) => ({
          tenant_id: tenant.id, label: t.label, count: t.count || 1,
          scope: SCOPE[t.scope] || 'domestic', years_text: t.years || null,
        }));
        actions.push(`+${rows.length} trophées`);
        if (COMMIT) { const { error } = await supabase.from('trophies').insert(rows); if (error) actions.push('ERR trophées:' + error.message); }
        trophiesAdded += rows.length;
      }
    }

    // ── Infos club (uniquement champs vides) ───────────────────
    const patch = {};
    const map = {
      motto: prof.motto, motto_color: prof.mottoColor, founded_year: prof.founded,
      stadium: prof.stadium, stadium_image_url: prof.stadiumImage,
      coach: prof.coach, president: prof.president,
    };
    for (const [col, val] of Object.entries(map)) {
      if (val != null && val !== '' && (tenant[col] == null || tenant[col] === '')) patch[col] = val;
    }
    if (Object.keys(patch).length) {
      actions.push(`infos: ${Object.keys(patch).join(',')}`);
      if (COMMIT) await supabase.from('tenants').update(patch).eq('id', tenant.id);
      infosPatched += Object.keys(patch).length;
    }

    if (actions.length) { clubsTouched++; console.log(`${tenant.name.padEnd(26)} → ${actions.join(' | ')}`); }
  }

  console.log(`\n${COMMIT ? '✅ APPLIQUÉ' : '🔎 DRY-RUN'} — clubs: ${clubsTouched}, joueurs: ${playersAdded}, trophées: ${trophiesAdded}, infos: ${infosPatched}`);
  if (!COMMIT) console.log('→ relance avec --commit pour appliquer.');
})().catch((e) => { console.error('ERREUR:', e.message); process.exit(1); });
