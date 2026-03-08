-- ============================================
-- MIGRATION 0013: Remplir anciennes colonnes pour compatibilité
-- Date: 2026-03-08
-- Description: Remplir platform_fee, prize_pool, sponsor_amount avec valeurs par défaut
-- ============================================

-- Mettre à jour les transactions existantes sans ces valeurs
UPDATE game_transactions 
SET 
  platform_fee = COALESCE(platform_fee, 0.0),
  prize_pool = COALESCE(prize_pool, 0.0),
  sponsor_amount = COALESCE(sponsor_amount, 0.0)
WHERE platform_fee IS NULL OR prize_pool IS NULL OR sponsor_amount IS NULL;
