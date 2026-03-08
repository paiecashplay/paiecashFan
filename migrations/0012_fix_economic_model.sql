-- ============================================
-- MIGRATION 0012: CORRECTION MODÈLE ÉCONOMIQUE V2
-- Date: 2026-03-08
-- Description: Club 11% (10% + 1% social) / PaieCash 89% / Sponsor = visibilité
-- Approche: Ajouter nouvelles colonnes sans supprimer les anciennes
-- ============================================

-- ============================================
-- ÉTAPE 1 : AJOUTER COLONNES À game_transactions
-- ============================================

-- Ajouter colonnes du nouveau modèle économique
ALTER TABLE game_transactions ADD COLUMN social_action_fee REAL DEFAULT 0.0;
ALTER TABLE game_transactions ADD COLUMN paiecash_revenue REAL DEFAULT 0.0;

-- Recalculer les valeurs existantes
UPDATE game_transactions SET 
  social_action_fee = amount_paid * 0.01,
  paiecash_revenue = amount_paid * 0.89,
  club_commission = amount_paid * 0.10;

-- ============================================
-- ÉTAPE 2 : AJOUTER COLONNES À sponsors
-- ============================================

ALTER TABLE sponsors ADD COLUMN promo_code TEXT;
ALTER TABLE sponsors ADD COLUMN affiliate_url TEXT;
ALTER TABLE sponsors ADD COLUMN categories TEXT;
ALTER TABLE sponsors ADD COLUMN subcategories TEXT;
ALTER TABLE sponsors ADD COLUMN commission_rate REAL DEFAULT 0.05;

-- ============================================
-- ÉTAPE 3 : AJOUTER SPONSORS PUMA & NIKE
-- ============================================

-- PUMA - Olympique de Marseille
INSERT OR REPLACE INTO sponsors (
  id, name, type, organization_id, 
  promo_code, affiliate_url, 
  categories, subcategories, 
  commission_rate, is_active
) VALUES (
  'sponsor-puma-om',
  'PUMA',
  'equipementier',
  'om-001',
  'WEL-2MM6-RUPG-Y4BM-W43S',
  'https://eu.puma.com/fr/fr?ref=paiecashfan-om',
  '["HOMME","FEMME","ENFANT","LIFESTYLE","SPORT"]',
  '["Training","Running","Football","Sports Auto","Basketball","Golf"]',
  0.05,
  1
);

-- NIKE - Paris Saint-Germain
INSERT OR REPLACE INTO sponsors (
  id, name, type, organization_id,
  promo_code, affiliate_url,
  categories, subcategories,
  commission_rate, is_active
) VALUES (
  'sponsor-nike-psg',
  'Nike',
  'equipementier',
  'psg-001',
  'PSG-NIKE-2026',
  'https://www.nike.com/fr?ref=paiecashfan-psg',
  '["HOMME","FEMME","ENFANT","LIFESTYLE","SPORT"]',
  '["Training","Running","Football","Basketball"]',
  0.05,
  1
);

-- ADIDAS universel
INSERT OR REPLACE INTO sponsors (
  id, name, type, organization_id,
  promo_code, affiliate_url,
  categories, subcategories,
  commission_rate, is_active
) VALUES (
  'sponsor-adidas-universal',
  'Adidas',
  'equipementier',
  NULL,
  'ADIDAS-PAIECASH-2026',
  'https://www.adidas.fr?ref=paiecashfan',
  '["HOMME","FEMME","ENFANT","LIFESTYLE","SPORT"]',
  '["Training","Running","Football"]',
  0.05,
  1
);

-- ============================================
-- ÉTAPE 4 : RECRÉER VUES
-- ============================================

-- Supprimer anciennes vues
DROP VIEW IF EXISTS club_commissions_summary;
DROP VIEW IF EXISTS sponsor_roi_summary;
DROP VIEW IF EXISTS game_stats_summary;
DROP VIEW IF EXISTS pack_performance;

-- Vue commissions club (nouveau modèle)
CREATE VIEW IF NOT EXISTS club_commissions_summary AS
SELECT 
  organization_id,
  game_type,
  DATE(created_at) as date,
  COUNT(*) as transactions_count,
  SUM(amount_paid) as total_revenue,
  SUM(club_commission) as total_club_commission,
  SUM(social_action_fee) as total_social_action,
  SUM(paiecash_revenue) as total_paiecash_revenue
FROM game_transactions
GROUP BY organization_id, game_type, DATE(created_at);

-- Vue ROI sponsors
CREATE VIEW IF NOT EXISTS sponsor_roi_summary AS
SELECT 
  s.id as sponsor_id,
  s.name as sponsor_name,
  COUNT(DISTINCT si.user_id) as unique_users,
  SUM(CASE WHEN si.interaction_type = 'view' THEN 1 ELSE 0 END) as total_views,
  SUM(CASE WHEN si.interaction_type = 'play' THEN 1 ELSE 0 END) as total_plays,
  SUM(CASE WHEN si.interaction_type = 'win' THEN 1 ELSE 0 END) as total_wins,
  SUM(si.engagement_score) as total_engagement,
  s.total_investment,
  ROUND(CAST(SUM(si.engagement_score) AS REAL) / NULLIF(s.total_investment, 0), 2) as roi_score
FROM sponsors s
LEFT JOIN sponsor_interactions si ON s.id = si.sponsor_id
GROUP BY s.id, s.name, s.total_investment;

-- Vue statistiques jeux
CREATE VIEW IF NOT EXISTS game_stats_summary AS
SELECT 
  game_type,
  COUNT(*) as total_games,
  SUM(amount_paid) as total_revenue,
  AVG(amount_paid) as avg_bet,
  SUM(club_commission) as total_club_commission,
  SUM(paiecash_revenue) as total_paiecash_revenue
FROM game_transactions
GROUP BY game_type;

-- Vue performance packs
CREATE VIEW IF NOT EXISTS pack_performance AS
SELECT 
  pack_type,
  COUNT(*) as times_purchased,
  SUM(amount_paid) as total_revenue,
  AVG(discount_applied) as avg_discount,
  SUM(club_commission) as total_club_commission
FROM game_transactions
WHERE pack_type IS NOT NULL
GROUP BY pack_type;

-- ============================================
-- ÉTAPE 5 : METTRE À JOUR scratch_prizes
-- ============================================

-- Lier les lots SCRATCH aux nouveaux sponsors
UPDATE scratch_prizes 
SET sponsor_id = 'sponsor-puma-om' 
WHERE organization_id = 'om-001';
