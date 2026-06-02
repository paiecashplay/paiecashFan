// Helper minimal pour transformer un nom de club / pays en slug d'URL.
// 'Afrique du Sud' → 'afrique-du-sud'
// 'Côte d\'Ivoire' → 'cote-d-ivoire'
// 'AS Nancy-Lorraine' → 'as-nancy-lorraine'
export function slugify(name) {
  if (!name) return '';
  return String(name)
    .normalize('NFD')                // décompose les accents (é → e + ́)
    .replace(/[̀-ͯ]/g, '') // supprime les marks diacritiques
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')    // remplace tout non-alphanumérique par -
    .replace(/^-+|-+$/g, '');        // trim les - aux extrémités
}
