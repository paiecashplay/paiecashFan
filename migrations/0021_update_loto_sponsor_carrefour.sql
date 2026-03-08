-- Migration 0021 : Mettre à jour les sponsors LOTO pour Carrefour uniquement
-- Date : 2026-03-08

-- Mettre à jour tous les lots LOTO pour utiliser Carrefour comme sponsor unique
UPDATE loto_prizes SET sponsor_name = 'Carrefour' WHERE sponsor_name != 'Carrefour';

-- Mettre à jour les noms et descriptions pour cohérence
UPDATE loto_prizes SET 
    name = 'Bon d''achat Carrefour 50€',
    description = 'Utilisable dans tous les rayons'
WHERE match_requirement = '4+1';

UPDATE loto_prizes SET 
    name = 'Bon d''achat Carrefour 10€',
    description = 'Utilisable dans tous les rayons'
WHERE match_requirement = '3+1';

UPDATE loto_prizes SET 
    name = 'Bon d''achat Carrefour 5€',
    description = 'Utilisable dans tous les rayons'
WHERE match_requirement = '3';

UPDATE loto_prizes SET 
    name = 'Bon d''achat Carrefour 3€',
    description = 'Utilisable dans tous les rayons'
WHERE match_requirement = '2+1';

-- Les lots de consolation restent diversifiés (boulangerie, café, etc.)
