-- Migration 0020 : Supprimer toutes les Foreign Keys de game_transactions
-- Date : 2026-03-08
-- Raison : Les FK empêchent l'insertion dans le jeu LOTO

-- Sauvegarder les données existantes
CREATE TABLE IF NOT EXISTS game_transactions_backup AS SELECT * FROM game_transactions;

-- Supprimer l'ancienne table
DROP TABLE IF EXISTS game_transactions;

-- Recréer la table SANS Foreign Keys
CREATE TABLE IF NOT EXISTS game_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  game_type TEXT NOT NULL,
  game_id TEXT NOT NULL,
  amount_paid REAL NOT NULL,
  club_commission REAL NOT NULL,
  platform_fee REAL NOT NULL DEFAULT 0,
  prize_pool REAL NOT NULL DEFAULT 0,
  sponsor_id TEXT,
  sponsor_amount REAL DEFAULT 0,
  pack_type TEXT DEFAULT 'solo',
  discount_applied REAL DEFAULT 0.0,
  referral_code TEXT,
  referral_bonus REAL DEFAULT 0.0,
  payment_method TEXT NOT NULL,
  payment_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- Colonnes ajoutées par migrations ultérieures
  social_action_fee REAL DEFAULT 0,
  paiecash_revenue REAL DEFAULT 0,
  user_email TEXT,
  receipt_sent INTEGER DEFAULT 0,
  receipt_sent_at DATETIME,
  invoice_number TEXT,
  prize_won TEXT
);

-- Restaurer les données
INSERT INTO game_transactions SELECT * FROM game_transactions_backup;

-- Supprimer la sauvegarde
DROP TABLE IF EXISTS game_transactions_backup;

-- Recréer les index
CREATE INDEX IF NOT EXISTS idx_game_transactions_user_id ON game_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_transactions_organization_id ON game_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_game_transactions_game_type ON game_transactions(game_type);
CREATE INDEX IF NOT EXISTS idx_game_transactions_created_at ON game_transactions(created_at);
