-- Migration 0017 : Corriger les colonnes de loto_games
-- Date : 2026-03-08

-- Supprimer l'ancienne table et la recréer avec les bonnes colonnes
DROP TABLE IF EXISTS loto_games;

CREATE TABLE IF NOT EXISTS loto_games (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  selected_numbers TEXT NOT NULL, -- JSON array [7,14,21,28,35]
  selected_chance INTEGER NOT NULL,
  winning_numbers TEXT, -- JSON array [10,20,30,40,50]
  winning_chance INTEGER,
  matched_numbers INTEGER DEFAULT 0,
  matched_chance INTEGER DEFAULT 0,
  prize_id TEXT,
  prize_value REAL DEFAULT 0,
  amount_paid REAL NOT NULL DEFAULT 2.0,
  payment_method TEXT NOT NULL,
  payment_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_loto_games_user_id ON loto_games(user_id);
CREATE INDEX IF NOT EXISTS idx_loto_games_organization_id ON loto_games(organization_id);
CREATE INDEX IF NOT EXISTS idx_loto_games_created_at ON loto_games(created_at);
