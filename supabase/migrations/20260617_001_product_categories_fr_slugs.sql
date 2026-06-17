-- ═══════════════════════════════════════════════════════════════
-- Migration 20260617_001 — Slugs de catégories produits en français
-- Aligne product_categories.slug et products.category_slug sur des
-- slugs FR (maillot, sweat, t-shirt…) pour éviter les confusions au
-- moment de la saisie en back-office.
-- ═══════════════════════════════════════════════════════════════

-- Produits existants : remappe category_slug
UPDATE public.products SET category_slug = 'maillot'    WHERE category_slug = 'jersey';
UPDATE public.products SET category_slug = 'sweat'      WHERE category_slug = 'hoodie';
UPDATE public.products SET category_slug = 't-shirt'    WHERE category_slug = 'tshirt';
UPDATE public.products SET category_slug = 'accessoire' WHERE category_slug = 'accessory';
UPDATE public.products SET category_slug = 'chaussures' WHERE category_slug = 'shoes';
UPDATE public.products SET category_slug = 'maison'     WHERE category_slug = 'home';
UPDATE public.products SET category_slug = 'autre'      WHERE category_slug = 'other';

-- Table de référence des catégories
UPDATE public.product_categories SET slug = 'maillot'    WHERE slug = 'jersey';
UPDATE public.product_categories SET slug = 'sweat'      WHERE slug = 'hoodie';
UPDATE public.product_categories SET slug = 't-shirt'    WHERE slug = 'tshirt';
UPDATE public.product_categories SET slug = 'accessoire' WHERE slug = 'accessory';
UPDATE public.product_categories SET slug = 'chaussures' WHERE slug = 'shoes';
UPDATE public.product_categories SET slug = 'maison'     WHERE slug = 'home';
UPDATE public.product_categories SET slug = 'autre'      WHERE slug = 'other';
