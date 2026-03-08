-- ============================================
-- MIGRATION 0014: Ajouter colonnes manquantes social_shares
-- Date: 2026-03-08
-- ============================================

ALTER TABLE social_shares ADD COLUMN organization_id TEXT;
ALTER TABLE social_shares ADD COLUMN content_type TEXT;
ALTER TABLE social_shares ADD COLUMN content_id TEXT;
ALTER TABLE social_shares ADD COLUMN reward_amount REAL DEFAULT 0.0;
