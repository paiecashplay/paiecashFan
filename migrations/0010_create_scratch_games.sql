-- ============================================
-- MIGRATION 0010: SCRATCH GAMES
-- Date: 2026-03-08
-- Description: Système de jeu Scratch (tickets à gratter)
-- ============================================

-- Table des tickets scratch
CREATE TABLE IF NOT EXISTS scratch_games (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  amount_paid REAL NOT NULL DEFAULT 1.0,
  is_winner INTEGER DEFAULT 0,
  prize_id TEXT,
  prize_name TEXT,
  prize_value REAL,
  prize_category TEXT, -- 'small', 'medium', 'big'
  scratched_at DATETIME,
  payment_method TEXT DEFAULT 'stripe',
  payment_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, scratched, claimed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Table catalogue des lots scratch
CREATE TABLE IF NOT EXISTS scratch_prizes (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  value REAL NOT NULL,
  category TEXT NOT NULL, -- 'small', 'medium', 'big'
  image_url TEXT,
  stock INTEGER DEFAULT -1, -- -1 = illimité
  probability REAL NOT NULL, -- 0.70 pour 70%
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_scratch_games_user ON scratch_games(user_id);
CREATE INDEX IF NOT EXISTS idx_scratch_games_org ON scratch_games(organization_id);
CREATE INDEX IF NOT EXISTS idx_scratch_games_created ON scratch_games(created_at);
CREATE INDEX IF NOT EXISTS idx_scratch_prizes_org ON scratch_prizes(organization_id);
CREATE INDEX IF NOT EXISTS idx_scratch_prizes_active ON scratch_prizes(is_active);

-- ============================================
-- SEED DATA : LOTS OLYMPIQUE DE MARSEILLE
-- ============================================

-- Petits lots (70% des gains) - Valeur ~25€
INSERT INTO scratch_prizes (id, organization_id, name, description, value, category, probability, stock) VALUES
('prize-om-001', 'om-001', 'Écharpe Officielle OM', 'Écharpe collector aux couleurs de l''OM', 25.0, 'small', 0.35, -1),
('prize-om-002', 'om-001', 'Casquette Officielle OM', 'Casquette brodée logo OM', 20.0, 'small', 0.20, -1),
('prize-om-003', 'om-001', 'Porte-clés Collector', 'Porte-clés édition limitée OM', 15.0, 'small', 0.10, -1),
('prize-om-004', 'om-001', 'Pin''s Édition Limitée', 'Set de 3 pin''s collector OM', 10.0, 'small', 0.05, -1);

-- Lots moyens (20% des gains) - Valeur ~90-120€
INSERT INTO scratch_prizes (id, organization_id, name, description, value, category, probability, stock) VALUES
('prize-om-005', 'om-001', 'Survêtement Officiel OM', 'Survêtement complet équipe première', 120.0, 'medium', 0.08, 50),
('prize-om-006', 'om-001', 'Maillot Domicile OM 2026', 'Maillot officiel domicile floqué', 90.0, 'medium', 0.07, 100),
('prize-om-007', 'om-001', 'Maillot Extérieur OM 2026', 'Maillot officiel extérieur floqué', 90.0, 'medium', 0.05, 100);

-- Gros lots (10% des gains) - Valeur 200-500€
INSERT INTO scratch_prizes (id, organization_id, name, description, value, category, probability, stock) VALUES
('prize-om-008', 'om-001', 'Billet VIP Match OM', 'Place VIP au Vélodrome avec accès salon', 200.0, 'big', 0.05, 20),
('prize-om-009', 'om-001', 'Rencontre avec Joueur', 'Séance photo et autographes avec un joueur', 500.0, 'big', 0.03, 5),
('prize-om-010', 'om-001', 'Visite Stade + Vestiaires', 'Visite guidée exclusive du stade et des vestiaires', 300.0, 'big', 0.02, 10);

-- Lots pour PSG (exemples)
INSERT INTO scratch_prizes (id, organization_id, name, description, value, category, probability, stock) VALUES
('prize-psg-001', 'psg-001', 'Écharpe Officielle PSG', 'Écharpe collector PSG', 25.0, 'small', 0.35, -1),
('prize-psg-002', 'psg-001', 'Maillot Domicile PSG', 'Maillot officiel PSG floqué', 90.0, 'medium', 0.10, 100),
('prize-psg-003', 'psg-001', 'Billet VIP Parc des Princes', 'Place VIP au Parc avec accès salon', 250.0, 'big', 0.05, 15);

-- Note : Total des probabilités = ~1.00 (100%)
-- Configuration actuelle : ~10% de tickets gagnants
