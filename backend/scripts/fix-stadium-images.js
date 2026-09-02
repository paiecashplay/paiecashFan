// ═══════════════════════════════════════════════════════════════
// Corrige les images de stade "placeholder" d'api-sports (venues sans photo).
//
// Détection FIABLE : api-sports sert UNE seule image générique pour les venues
// sans photo → taille 29416 octets + md5 68ac0d5773da5ee81444ade70d89533d.
// On ne touche QUE ces clubs-là ; ceux qui ont une vraie photo restent intacts.
//
// Pour chaque club "sans photo" :
//   1) équipe féminine/jeune (W, U19…) → on prend l'image du CLUB PARENT
//      (ex. PSG W → Paris Saint-Germain) SI le parent a une vraie photo ;
//   2) sinon → on VIDE le champ → le hero utilise /images/stadium-bg.png.
//
// Lancer (dry-run, n'écrit rien) :  node backend/scripts/fix-stadium-images.js
// Appliquer réellement en base   :  node backend/scripts/fix-stadium-images.js --apply
// ═══════════════════════════════════════════════════════════════

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const crypto = require('crypto');
const supabase = require('../db/supabase');

const PLACEHOLDER_MD5 = '68ac0d5773da5ee81444ade70d89533d';
const PLACEHOLDER_SIZE = 29416;
const APPLY = process.argv.includes('--apply');
const CONCURRENCY = 12;

const isApiSports = (u) => /api-sports\.io\/football\/venues/.test(u || '');

// Normalise un nom pour rapprocher une équipe W/jeune de son club parent.
function normalizeBase(name) {
  return String(name || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')          // accents
    .toLowerCase()
    .replace(/\b(women|woman|feminines?|feminin|fem|w)\b/g, ' ') // suffixe féminin
    .replace(/\bu\s?\d{2}\b/g, ' ')                              // U19/U23…
    .replace(/[^a-z0-9]/g, '');                                 // ponctuation/espaces
}
const isYouthOrWomen = (name) =>
  /\b(women|woman|feminines?|feminin|fem|w|u\s?\d{2})\b/i.test(name || '');

async function fingerprint(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return { size: buf.length, md5: crypto.createHash('md5').update(buf).digest('hex') };
  } catch {
    return null;
  }
}

// mapLimit maison (concurrence bornée).
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    })
  );
  return out;
}

(async () => {
  const { data: tenants, error } = await supabase
    .from('tenants').select('id, name, slug, stadium_image_url');
  if (error) throw error;

  const withApi = tenants.filter((t) => isApiSports(t.stadium_image_url));
  console.log(`Clubs avec image api-sports : ${withApi.length} / ${tenants.length}`);
  console.log('Empreinte des images en cours (peut prendre 1-2 min)…');

  // Empreinte de chaque image (concurrence bornée).
  const fps = await mapLimit(withApi, CONCURRENCY, (t) => fingerprint(t.stadium_image_url));
  const isPlaceholder = (fp) =>
    fp && fp.size === PLACEHOLDER_SIZE && fp.md5 === PLACEHOLDER_MD5;

  // Index : nom normalisé → club avec une VRAIE photo (candidat parent).
  const realByBase = new Map();
  withApi.forEach((t, i) => {
    if (fps[i] && !isPlaceholder(fps[i]) && !isYouthOrWomen(t.name)) {
      const base = normalizeBase(t.name);
      if (base && !realByBase.has(base)) realByBase.set(base, t);
    }
  });

  const missing = withApi.filter((_, i) => isPlaceholder(fps[i]));
  console.log(`Placeholders détectés (sans vraie photo) : ${missing.length}`);

  let toParent = 0, toGeneric = 0;
  const updates = [];
  for (const t of missing) {
    const parent = realByBase.get(normalizeBase(t.name));
    if (parent && parent.id !== t.id) {
      updates.push({ id: t.id, name: t.name, newUrl: parent.stadium_image_url, via: `parent: ${parent.name}` });
      toParent++;
    } else {
      updates.push({ id: t.id, name: t.name, newUrl: null, via: 'fond générique' });
      toGeneric++;
    }
  }

  console.log(`\n→ ${toParent} clubs reprendront l'image du club parent`);
  console.log(`→ ${toGeneric} clubs passeront sur le fond générique (stadium-bg.png)`);
  console.log('\nExemples :');
  updates.slice(0, 15).forEach((u) => console.log(`  • ${u.name}  →  ${u.via}`));

  if (!APPLY) {
    console.log('\n(DRY-RUN — rien écrit. Relancer avec --apply pour appliquer.)');
    return;
  }

  console.log('\nApplication en base…');
  let done = 0, failed = 0;
  for (const u of updates) {
    const { error: e } = await supabase
      .from('tenants').update({ stadium_image_url: u.newUrl }).eq('id', u.id);
    if (e) { failed++; console.log('  ⚠️', u.name, e.message); } else done++;
  }
  console.log(`\n✅ Mis à jour : ${done} | échecs : ${failed}`);
})();
