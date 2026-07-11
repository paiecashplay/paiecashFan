// Crée les fédérations Italie & Portugal (table federations) et rattache leurs
// clubs de 1re division (federation_id). Idempotent. Dry-run par défaut (--apply).
require('dotenv').config();
const supabase = require('../db/supabase');
const APPLY = process.argv.includes('--apply');

const FEDS = [
  { slug: 'federation-italienne-de-football', name: 'Fédération Italienne de Football', country: 'Italie',  country_code: 'IT', flag_emoji: 'IT', league: 'Serie A' },
  { slug: 'federation-portugaise-de-football', name: 'Fédération Portugaise de Football', country: 'Portugal', country_code: 'PT', flag_emoji: 'PT', league: 'Primeira Liga' },
];

(async () => {
  for (const f of FEDS) {
    // 1. Créer la fédération si absente
    let { data: fed } = await supabase.from('federations').select('id').eq('slug', f.slug).maybeSingle();
    const clubs = await supabase.from('tenants').select('id', { count: 'exact', head: true }).eq('league_name', f.league);
    console.log(`\n${f.name}`);
    console.log(`  federations[${f.slug}]: ${fed ? 'existe (' + fed.id + ')' : 'À CRÉER'}`);
    console.log(`  clubs "${f.league}": ${clubs.count ?? '?'}`);

    if (!APPLY) continue;

    if (!fed) {
      const { data: created, error } = await supabase.from('federations').insert({
        slug: f.slug, name: f.name, country: f.country, country_code: f.country_code,
        flag_emoji: f.flag_emoji, confederation_code: 'UEFA', primary_color: '#000000',
      }).select('id').single();
      if (error) { console.error('  ❌ création fédération:', error.message); continue; }
      fed = created;
      console.log('  ✅ fédération créée →', fed.id);
    }

    // 2. Rattacher les clubs de la ligue à cette fédération
    const { data: updated, error: uErr } = await supabase.from('tenants')
      .update({ federation_id: fed.id })
      .eq('league_name', f.league)
      .select('id');
    if (uErr) console.error('  ❌ rattachement clubs:', uErr.message);
    else console.log(`  ✅ ${updated.length} club(s) rattaché(s) à ${f.name}`);
  }
  process.exit(0);
})();
