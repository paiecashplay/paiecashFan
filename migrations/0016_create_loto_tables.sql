-- Migration 0016 : Tables LOTO avec garantie gagnant
-- Date : 2026-03-08

-- Table des lots LOTO (Grande Distribution)
CREATE TABLE IF NOT EXISTS loto_prizes (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  value REAL NOT NULL,
  category TEXT NOT NULL, -- 'jackpot', 'major', 'medium', 'minor', 'consolation'
  sponsor_id TEXT,
  sponsor_name TEXT DEFAULT 'Grande Distribution',
  match_requirement TEXT NOT NULL, -- Ex: '5+1', '5', '4+1', '4', '3+1', '3', '2+1', 'consolation'
  stock INTEGER DEFAULT 999,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (sponsor_id) REFERENCES sponsors(id)
);

-- Table des grilles LOTO jouées
CREATE TABLE IF NOT EXISTS loto_games (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  amount_paid REAL NOT NULL DEFAULT 2.0,
  numbers TEXT NOT NULL, -- JSON array [1,2,3,4,5]
  chance_number INTEGER NOT NULL,
  drawn_numbers TEXT, -- JSON array [10,20,30,40,50]
  drawn_chance INTEGER,
  matched_numbers INTEGER DEFAULT 0,
  matched_chance INTEGER DEFAULT 0,
  match_level TEXT, -- '5+1', '5', '4+1', etc.
  is_winner INTEGER DEFAULT 1, -- Toujours 1 (garantie gagnant)
  prize_id TEXT,
  prize_name TEXT,
  prize_value REAL,
  played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  payment_method TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (prize_id) REFERENCES loto_prizes(id)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_loto_games_user_id ON loto_games(user_id);
CREATE INDEX IF NOT EXISTS idx_loto_games_organization_id ON loto_games(organization_id);
CREATE INDEX IF NOT EXISTS idx_loto_games_played_at ON loto_games(played_at);

-- Insertion des lots LOTO Grande Distribution
INSERT OR REPLACE INTO loto_prizes (id, organization_id, name, description, value, category, sponsor_name, match_requirement, stock) VALUES
-- Jackpot
('loto-prize-jackpot-001', 'om-001', 'Bon d''achat Carrefour 500€', 'Utilisable dans tous les rayons', 500.0, 'jackpot', 'Carrefour', '5+1', 5),

-- Lots majeurs
('loto-prize-major-001', 'om-001', 'Bon d''achat Carrefour 100€', 'Utilisable dans tous les rayons', 100.0, 'major', 'Carrefour', '5', 20),
('loto-prize-major-002', 'om-001', 'Bon d''achat Auchan 50€', 'Valable 3 mois', 50.0, 'major', 'Auchan', '4+1', 50),

-- Lots moyens
('loto-prize-medium-001', 'om-001', 'Bon d''achat Leclerc 20€', 'Valable 3 mois', 20.0, 'medium', 'Leclerc', '4', 100),
('loto-prize-medium-002', 'om-001', 'Bon d''achat Carrefour 10€', 'Valable 2 mois', 10.0, 'medium', 'Carrefour', '3+1', 200),

-- Lots mineurs
('loto-prize-minor-001', 'om-001', 'Bon d''achat Intermarché 5€', 'Valable 1 mois', 5.0, 'minor', 'Intermarché', '3', 500),
('loto-prize-minor-002', 'om-001', 'Bon d''achat Franprix 3€', 'Valable 1 mois', 3.0, 'minor', 'Franprix', '2+1', 1000),

-- Lots de consolation (TOUJOURS GAGNANT)
('loto-prize-consolation-001', 'om-001', 'Baguette + Croissant', 'À retirer en boulangerie partenaire', 2.5, 'consolation', 'Boulangerie partenaire', 'consolation', 9999),
('loto-prize-consolation-002', 'om-001', 'Café + Viennoiserie', 'À retirer en café partenaire', 3.0, 'consolation', 'Café partenaire', 'consolation', 9999),
('loto-prize-consolation-003', 'om-001', 'Paquet de bonbons', 'Haribo ou équivalent', 2.0, 'consolation', 'Carrefour', 'consolation', 9999),
('loto-prize-consolation-004', 'om-001', 'Yaourt + Fruit', 'Produits frais du jour', 2.5, 'consolation', 'Leclerc', 'consolation', 9999),
('loto-prize-consolation-005', 'om-001', 'Biscuits apéritif', 'Pack découverte', 2.0, 'consolation', 'Auchan', 'consolation', 9999);
