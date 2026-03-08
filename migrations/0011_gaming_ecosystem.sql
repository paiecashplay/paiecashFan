-- ============================================
-- MIGRATION 0011: GAMING ECOSYSTEM COMPLET
-- Date: 2026-03-08
-- Description: Commission club 10%, tracking sponsor, packs, parrainage
-- ============================================

-- Table des transactions de jeu (CENTRALE)
-- Enregistre TOUTES les transactions avec commission club automatique
CREATE TABLE IF NOT EXISTS game_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  game_type TEXT NOT NULL, -- 'scratch', 'loto', 'bonus_buteur', 'bonus_score'
  game_id TEXT NOT NULL, -- ID de la partie jouée
  amount_paid REAL NOT NULL,
  club_commission REAL NOT NULL, -- 10% automatique
  platform_fee REAL NOT NULL, -- 20% frais plateforme
  prize_pool REAL NOT NULL, -- Montant pour les gains
  sponsor_id TEXT,
  sponsor_amount REAL, -- Montant attribué au sponsor (financement lots)
  pack_type TEXT, -- 'solo', 'bronze', 'silver', 'gold', 'combo_fan', 'combo_pro', 'combo_vip'
  discount_applied REAL DEFAULT 0.0,
  referral_code TEXT, -- Code parrain utilisé
  referral_bonus REAL DEFAULT 0.0,
  payment_method TEXT NOT NULL, -- 'card', 'wallet', 'mobile'
  payment_id TEXT, -- ID transaction Stripe/Lyra
  status TEXT DEFAULT 'completed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Table des interactions sponsor (ROI & Analytics)
CREATE TABLE IF NOT EXISTS sponsor_interactions (
  id TEXT PRIMARY KEY,
  sponsor_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  game_type TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- 'view', 'play', 'share', 'win'
  prize_viewed TEXT, -- ID du lot consulté
  prize_won TEXT, -- ID du lot gagné
  impression_count INTEGER DEFAULT 1,
  engagement_score REAL DEFAULT 0.0, -- Calculé: temps passé, clics, partages
  session_duration INTEGER DEFAULT 0, -- Durée en secondes
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Table des partages sociaux (FOMO & Viralité)
CREATE TABLE IF NOT EXISTS social_shares (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  game_type TEXT NOT NULL,
  game_id TEXT, -- ID de la partie partagée
  platform TEXT NOT NULL, -- 'twitter', 'facebook', 'instagram', 'whatsapp'
  share_url TEXT,
  share_text TEXT,
  bonus_earned REAL DEFAULT 0.0,
  referrals_count INTEGER DEFAULT 0, -- Nombre de clics/inscriptions
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table des packs de jeux (Multi-jeu avec remises)
CREATE TABLE IF NOT EXISTS game_packs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  game_types TEXT NOT NULL, -- JSON: ["scratch", "loto"]
  tickets_count INTEGER NOT NULL,
  original_price REAL NOT NULL,
  discounted_price REAL NOT NULL,
  discount_percent INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1,
  organization_id TEXT, -- NULL = disponible pour tous les clubs
  valid_until DATETIME, -- Date d'expiration (offres limitées)
  stock_limit INTEGER DEFAULT -1, -- -1 = illimité
  stock_remaining INTEGER DEFAULT -1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Table des codes de parrainage
CREATE TABLE IF NOT EXISTS referral_codes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  total_uses INTEGER DEFAULT 0,
  total_bonus_earned REAL DEFAULT 0.0,
  bonus_per_referral REAL DEFAULT 5.0, -- 5€ par défaut
  is_active INTEGER DEFAULT 1,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table d'utilisation des codes de parrainage
CREATE TABLE IF NOT EXISTS referral_uses (
  id TEXT PRIMARY KEY,
  referral_code_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL,
  referrer_bonus REAL NOT NULL,
  referred_bonus REAL NOT NULL,
  transaction_id TEXT, -- Lien vers game_transactions
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (referral_code_id) REFERENCES referral_codes(id),
  FOREIGN KEY (referred_user_id) REFERENCES users(id),
  FOREIGN KEY (transaction_id) REFERENCES game_transactions(id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_game_transactions_user ON game_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_transactions_org ON game_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_game_transactions_game_type ON game_transactions(game_type);
CREATE INDEX IF NOT EXISTS idx_game_transactions_created ON game_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_sponsor_interactions_sponsor ON sponsor_interactions(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_interactions_org ON sponsor_interactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_interactions_user ON sponsor_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_interactions_created ON sponsor_interactions(created_at);

CREATE INDEX IF NOT EXISTS idx_social_shares_user ON social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON social_shares(platform);
CREATE INDEX IF NOT EXISTS idx_social_shares_created ON social_shares(created_at);

CREATE INDEX IF NOT EXISTS idx_game_packs_active ON game_packs(is_active);
CREATE INDEX IF NOT EXISTS idx_game_packs_org ON game_packs(organization_id);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);

-- ============================================
-- SEED DATA: PACKS PAR DÉFAUT
-- ============================================

-- Packs SCRATCH (Olympique de Marseille)
INSERT INTO game_packs (id, name, description, game_types, tickets_count, original_price, discounted_price, discount_percent, organization_id) VALUES
('pack-scratch-bronze-om', 'Pack Bronze SCRATCH', '3 tickets à gratter avec 10% de remise', '["scratch"]', 3, 3.00, 2.70, 10, 'om-001'),
('pack-scratch-silver-om', 'Pack Silver SCRATCH', '5 tickets à gratter avec 20% de remise', '["scratch"]', 5, 5.00, 4.00, 20, 'om-001'),
('pack-scratch-gold-om', 'Pack Gold SCRATCH', '10 tickets à gratter avec 30% de remise', '["scratch"]', 10, 10.00, 7.00, 30, 'om-001');

-- Packs SCRATCH (Paris Saint-Germain)
INSERT INTO game_packs (id, name, description, game_types, tickets_count, original_price, discounted_price, discount_percent, organization_id) VALUES
('pack-scratch-bronze-psg', 'Pack Bronze SCRATCH', '3 tickets à gratter avec 10% de remise', '["scratch"]', 3, 3.00, 2.70, 10, 'psg-001'),
('pack-scratch-silver-psg', 'Pack Silver SCRATCH', '5 tickets à gratter avec 20% de remise', '["scratch"]', 5, 5.00, 4.00, 20, 'psg-001'),
('pack-scratch-gold-psg', 'Pack Gold SCRATCH', '10 tickets à gratter avec 30% de remise', '["scratch"]', 10, 10.00, 7.00, 30, 'psg-001');

-- Packs UNIVERSELS (tous les clubs)
INSERT INTO game_packs (id, name, description, game_types, tickets_count, original_price, discounted_price, discount_percent, organization_id) VALUES
('pack-scratch-mega', 'Pack MEGA SCRATCH', '20 tickets avec 40% de remise - Offre limitée', '["scratch"]', 20, 20.00, 12.00, 40, NULL),
('pack-combo-fan', 'Combo Fan', 'SCRATCH + LOTO - 10% de remise', '["scratch", "loto"]', 2, 2.00, 1.80, 10, NULL),
('pack-combo-pro', 'Combo Pro', 'SCRATCH + LOTO + Bonus - 15% de remise', '["scratch", "loto", "bonus"]', 3, 3.00, 2.55, 15, NULL);

-- ============================================
-- DONNÉES DE TEST : SPONSORS
-- ============================================

-- Table sponsors (si elle n'existe pas encore)
CREATE TABLE IF NOT EXISTS sponsors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'equipementier', 'pays', 'marque', 'partenaire'
  logo_url TEXT,
  organization_id TEXT, -- NULL = sponsor multi-clubs
  total_investment REAL DEFAULT 0.0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Sponsors principaux
INSERT OR IGNORE INTO sponsors (id, name, type, organization_id, total_investment, is_active) VALUES
('sponsor-adidas-om', 'Adidas', 'equipementier', 'om-001', 150000.0, 1),
('sponsor-nike-psg', 'Nike', 'equipementier', 'psg-001', 200000.0, 1),
('sponsor-maroc-tourism', 'Maroc Tourisme', 'pays', 'om-001', 50000.0, 1),
('sponsor-emirates', 'Emirates', 'marque', NULL, 300000.0, 1);

-- Ajouter colonne sponsor_id à scratch_prizes (SQLite méthode)
-- Créer nouvelle table avec la colonne
CREATE TABLE IF NOT EXISTS scratch_prizes_new (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  value REAL NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  stock INTEGER DEFAULT -1,
  probability REAL NOT NULL,
  is_active INTEGER DEFAULT 1,
  sponsor_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (sponsor_id) REFERENCES sponsors(id)
);

-- Copier les données existantes
INSERT INTO scratch_prizes_new (id, organization_id, name, description, value, category, image_url, stock, probability, is_active, sponsor_id, created_at)
SELECT id, organization_id, name, description, value, category, image_url, stock, probability, is_active, 
  CASE 
    WHEN organization_id = 'om-001' THEN 'sponsor-adidas-om'
    WHEN organization_id = 'psg-001' THEN 'sponsor-nike-psg'
    ELSE NULL
  END as sponsor_id,
  created_at
FROM scratch_prizes;

-- Supprimer ancienne table
DROP TABLE scratch_prizes;

-- Renommer nouvelle table
ALTER TABLE scratch_prizes_new RENAME TO scratch_prizes;

-- Recréer les index
CREATE INDEX IF NOT EXISTS idx_scratch_prizes_org ON scratch_prizes(organization_id);
CREATE INDEX IF NOT EXISTS idx_scratch_prizes_active ON scratch_prizes(is_active);

-- ============================================
-- VUES UTILES POUR ANALYTICS
-- ============================================

-- Vue des commissions club par période
CREATE VIEW IF NOT EXISTS club_commissions_summary AS
SELECT 
  organization_id,
  game_type,
  DATE(created_at) as date,
  COUNT(*) as transactions_count,
  SUM(amount_paid) as total_revenue,
  SUM(club_commission) as total_commission,
  SUM(platform_fee) as total_platform_fee,
  SUM(prize_pool) as total_prize_pool
FROM game_transactions
GROUP BY organization_id, game_type, DATE(created_at);

-- Vue ROI sponsor
CREATE VIEW IF NOT EXISTS sponsor_roi_summary AS
SELECT 
  si.sponsor_id,
  si.organization_id,
  si.game_type,
  COUNT(DISTINCT si.user_id) as unique_users,
  COUNT(*) as total_interactions,
  SUM(CASE WHEN si.interaction_type = 'view' THEN 1 ELSE 0 END) as impressions,
  SUM(CASE WHEN si.interaction_type = 'play' THEN 1 ELSE 0 END) as plays,
  SUM(CASE WHEN si.interaction_type = 'share' THEN 1 ELSE 0 END) as shares,
  SUM(CASE WHEN si.interaction_type = 'win' THEN 1 ELSE 0 END) as wins,
  SUM(si.engagement_score) as total_engagement
FROM sponsor_interactions si
GROUP BY si.sponsor_id, si.organization_id, si.game_type;

-- Vue des performances des packs
CREATE VIEW IF NOT EXISTS pack_performance AS
SELECT 
  gp.id as pack_id,
  gp.name as pack_name,
  gp.organization_id,
  COUNT(gt.id) as purchases_count,
  SUM(gt.amount_paid) as total_revenue,
  SUM(gt.discount_applied) as total_discounts,
  SUM(gt.club_commission) as club_revenue
FROM game_packs gp
LEFT JOIN game_transactions gt ON gt.pack_type = gp.id
GROUP BY gp.id, gp.name, gp.organization_id;

-- Vue des meilleurs parrains
CREATE VIEW IF NOT EXISTS top_referrers AS
SELECT 
  rc.user_id,
  u.display_name,
  rc.code,
  rc.total_uses,
  rc.total_bonus_earned,
  COUNT(ru.id) as successful_referrals
FROM referral_codes rc
LEFT JOIN users u ON u.id = rc.user_id
LEFT JOIN referral_uses ru ON ru.referral_code_id = rc.id
GROUP BY rc.id, rc.user_id, u.display_name, rc.code, rc.total_uses, rc.total_bonus_earned
ORDER BY rc.total_bonus_earned DESC;
