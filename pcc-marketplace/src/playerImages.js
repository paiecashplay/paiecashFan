/* ═══════════════════════════════════════════════════════════════
   Player Image Service - TheSportsDB API Integration
   Fetches real player headshots & cutout images at runtime
   ═══════════════════════════════════════════════════════════════ */

const API_BASE = 'https://www.thesportsdb.com/api/v1/json/123';
const cache = {};

/* Name normalization for better API matching */
function normalizeForSearch(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/\./g, '')             // remove periods (Jr. → Jr)
    .replace(/-/g, ' ')             // replace hyphens with spaces
    .replace(/\s+/g, ' ')           // collapse multiple spaces
    .trim();
}

/* Common name mappings for tricky API lookups */
const NAME_ALIASES = {
  'Vinicius Jr': 'Vinicius Junior',
  'Rodrygo': 'Rodrygo Goes',
  'Pedri': 'Pedro Gonzalez Lopez',
  'Gavi': 'Pablo Paez Gavira',
  'Vitinha': 'Vitinha Ferreira',
};

/**
 * Fetch player image from TheSportsDB
 * Returns { thumb, cutout } URLs or null
 */
export async function fetchPlayerImage(playerName) {
  // Check cache first
  if (cache[playerName] !== undefined) return cache[playerName];

  const normalized = normalizeForSearch(playerName);

  // Try the normalized name first, then alias if available
  const attempts = [normalized];
  if (NAME_ALIASES[normalized]) {
    attempts.push(NAME_ALIASES[normalized]);
  }

  for (const searchName of attempts) {
    try {
      const res = await fetch(`${API_BASE}/searchplayers.php?p=${encodeURIComponent(searchName)}`);
      const data = await res.json();

      if (data.player && data.player.length > 0) {
        // Find the soccer player match
        const match = data.player.find(p => p.strSport === 'Soccer') || data.player[0];
        const result = {
          thumb: match.strThumb || null,
          cutout: match.strCutout || null,
        };
        cache[playerName] = result;
        return result;
      }
    } catch (err) {
      console.warn(`[PlayerImages] Failed to fetch image for ${searchName}:`, err.message);
    }
  }

  cache[playerName] = null;
  return null;
}

/**
 * Batch fetch images for an entire squad
 * Returns a map of { playerName: { thumb, cutout } }
 */
export async function fetchSquadImages(squad) {
  const results = {};
  // Fetch in parallel with a small stagger to avoid rate limits
  const promises = squad.map((player, i) =>
    new Promise(resolve => {
      setTimeout(async () => {
        const images = await fetchPlayerImage(player.name);
        results[player.name] = images;
        resolve();
      }, i * 100); // 100ms stagger between requests
    })
  );
  await Promise.all(promises);
  return results;
}
