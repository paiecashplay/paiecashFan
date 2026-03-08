-- Migration 0018 : Retirer les Foreign Keys de loto_prizes
-- Date : 2026-03-08

-- Recréer loto_prizes sans Foreign Keys
DROP TABLE IF EXISTS loto_prizes_temp;

CREATE TABLE loto_prizes_temp (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  value REAL NOT NULL,
  category TEXT NOT NULL,
  sponsor_id TEXT,
  sponsor_name TEXT DEFAULT 'Grande Distribution',
  match_requirement TEXT NOT NULL,
  stock INTEGER DEFAULT 999,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copier les données existantes
INSERT INTO loto_prizes_temp SELECT 
  id, organization_id, name, description, value, category,
  sponsor_id, sponsor_name, match_requirement, stock, is_active, created_at
FROM loto_prizes;

-- Remplacer l'ancienne table
DROP TABLE loto_prizes;
ALTER TABLE loto_prizes_temp RENAME TO loto_prizes;

-- Recréer les index
CREATE INDEX IF NOT EXISTS idx_loto_prizes_organization_id ON loto_prizes(organization_id);
CREATE INDEX IF NOT EXISTS idx_loto_prizes_category ON loto_prizes(category);
CREATE INDEX IF NOT EXISTS idx_loto_prizes_match_requirement ON loto_prizes(match_requirement);
