// ============================================================
// Boutique officielle — produits par catégorie pour la page club.
// Reprend le set du marketplace as-nancy-lorraine en référence.
//
// Chaque produit peut avoir une vraie image dans
// /images/products/{club-slug}/{product-id}.png ; sinon fallback
// automatique sur un placeholder emoji stylisé dans la couleur du club.
// ============================================================

import { slugify } from '@/lib/slugify';

// Catégories affichées en tabs au-dessus de la grille.
// 'all' n'est pas un vrai poste produit — c'est un raccourci pour
// tout afficher d'un coup.
export const PRODUCT_CATEGORIES = [
  { id: 'all',        label: 'Tous',        emoji: '✨' },
  { id: 'maillot',    label: 'Maillot',     emoji: '👕' },
  { id: 'survetement',      label: 'Survêtement', emoji: '🧥' },
  { id: 't-shirt',    label: 'T-Shirt',     emoji: '👕' },
  { id: 'accessoire', label: 'Accessoire',  emoji: '🧣' },
  { id: 'chaussures', label: 'Chaussures',  emoji: '👟' },
  { id: 'maison',     label: 'Maison',      emoji: '🏠' },
  { id: 'autre',      label: 'Autre',       emoji: '📦' }
];

// Génère 8 produits par défaut pour n'importe quel club.
// Override possible via club.merchandise dans clubProfiles.js.
export function defaultMerchandise(club) {
  const slug = slugify(club.name);
  const base = `/images/products/${slug}`;
  return [
    { id: 'home-jersey',  category: 'maillot',    name: 'Maillot Domicile',  price: 89.99, image: `${base}/home-jersey.png`,  emoji: '👕' },
    { id: 'away-jersey',  category: 'maillot',    name: 'Maillot Extérieur', price: 89.99, image: `${base}/away-jersey.png`,  emoji: '👕' },
    { id: 'hoodie',       category: 'survetement',      name: 'Survêtement à capuche',   price: 64.99, image: `${base}/hoodie.png`,       emoji: '🧥' },
    { id: 'tshirt',       category: 't-shirt',    name: 'T-Shirt Club',      price: 34.99, image: `${base}/tshirt.png`,       emoji: '👕' },
    { id: 'scarf',        category: 'accessoire', name: 'Écharpe Officielle',price: 19.99, image: `${base}/scarf.png`,        emoji: '🧣' },
    { id: 'cap',          category: 'accessoire', name: 'Casquette Club',    price: 24.99, image: `${base}/cap.png`,          emoji: '🧢' },
    { id: 'ball',         category: 'autre',      name: 'Ballon Collector',  price: 49.99, image: `${base}/ball.png`,         emoji: '⚽' },
    { id: 'stadium',      category: 'autre',      name: 'Stade Miniature',   price: 74.99, image: `${base}/stadium.png`,      emoji: '🏟' }
  ];
}

// Formatte un prix PCC à 2 décimales avec virgule française.
export function formatPCC(amount) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
