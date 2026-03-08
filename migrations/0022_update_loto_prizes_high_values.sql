-- Migration: Augmentation significative des gains LOTO
-- Date: 2026-03-08
-- Description: Nouvelle grille de gains attractive (100€ à 10 000€)

-- Mise à jour des lots principaux avec gains beaucoup plus élevés

-- 🎰 JACKPOT : 5 numéros + Chance
UPDATE loto_prizes 
SET name = 'JACKPOT Carrefour 10 000€',
    description = 'Bon d''achat exceptionnel utilisable dans tous les rayons Carrefour',
    value = 10000.0,
    category = 'jackpot'
WHERE match_requirement = '5+1';

-- 💎 5 numéros
UPDATE loto_prizes 
SET name = 'Bon d''achat Carrefour 5 000€',
    description = 'Bon d''achat premium utilisable dans tous les rayons Carrefour',
    value = 5000.0,
    category = 'jackpot'
WHERE match_requirement = '5';

-- 💰 4 numéros + Chance
UPDATE loto_prizes 
SET name = 'Bon d''achat Carrefour 2 500€',
    description = 'Bon d''achat utilisable dans tous les rayons Carrefour',
    value = 2500.0,
    category = 'major'
WHERE match_requirement = '4+1';

-- 💵 4 numéros
UPDATE loto_prizes 
SET name = 'Bon d''achat Carrefour 1 250€',
    description = 'Bon d''achat utilisable dans tous les rayons Carrefour',
    value = 1250.0,
    category = 'major'
WHERE match_requirement = '4';

-- 💳 3 numéros + Chance
UPDATE loto_prizes 
SET name = 'Bon d''achat Carrefour 600€',
    description = 'Bon d''achat utilisable dans tous les rayons Carrefour',
    value = 600.0,
    category = 'medium'
WHERE match_requirement = '3+1';

-- 💶 3 numéros
UPDATE loto_prizes 
SET name = 'Bon d''achat Carrefour 200€',
    description = 'Bon d''achat utilisable dans tous les rayons Carrefour',
    value = 200.0,
    category = 'medium'
WHERE match_requirement = '3';

-- 💸 2 numéros + Chance
UPDATE loto_prizes 
SET name = 'Bon d''achat Carrefour 100€',
    description = 'Bon d''achat utilisable dans tous les rayons Carrefour',
    value = 100.0,
    category = 'minor'
WHERE match_requirement = '2+1';

-- 🎁 Lots de consolation (2 numéros ou moins) - augmentés également
UPDATE loto_prizes 
SET value = 20.0,
    name = 'Bon d''achat Carrefour 20€',
    description = 'Produits frais et alimentaires au choix'
WHERE category = 'consolation' AND value <= 3.0;

-- Ajouter un nouveau lot de consolation intermédiaire
INSERT OR IGNORE INTO loto_prizes (
  id, organization_id, name, description, value, category,
  sponsor_name, sponsor_id, match_requirement, stock, is_active, created_at
) VALUES (
  'loto-prize-consolation-medium',
  'om-001',
  'Bon d''achat Carrefour 15€',
  'Produits frais et alimentaires au choix',
  15.0,
  'consolation',
  'Carrefour',
  'sponsor-carrefour-001',
  'consolation',
  10000,
  1,
  datetime('now')
);
