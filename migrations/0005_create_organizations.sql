-- ============================================
-- MIGRATION 0005: ORGANIZATIONS (Clubs, Fédérations, Ligues)
-- Date: 2026-03-06
-- Description: Table pour gérer les clubs sportifs, fédérations et ligues
-- ============================================

CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('professional_club', 'amateur_club', 'federation', 'league')),
    name TEXT NOT NULL,
    short_name TEXT,
    country TEXT NOT NULL,
    city TEXT,
    tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 3),
    league TEXT,
    founded_year INTEGER,
    website TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    white_label_enabled INTEGER DEFAULT 0, -- SQLite: 0=false, 1=true
    white_label_config TEXT, -- JSON stringifié
    financial_health_score INTEGER CHECK (financial_health_score BETWEEN 0 AND 100),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_organizations_country ON organizations(country);
CREATE INDEX IF NOT EXISTS idx_organizations_tier ON organizations(tier);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);

-- Données initiales: Clubs français
INSERT OR IGNORE INTO organizations (id, type, name, short_name, country, city, tier, league, founded_year, white_label_enabled, financial_health_score, status) VALUES
('om-001', 'professional_club', 'Olympique de Marseille', 'OM', 'FR', 'Marseille', 1, 'Ligue 1', 1899, 1, 85, 'active'),
('psg-001', 'professional_club', 'Paris Saint-Germain', 'PSG', 'FR', 'Paris', 1, 'Ligue 1', 1970, 1, 95, 'active'),
('ol-001', 'professional_club', 'Olympique Lyonnais', 'OL', 'FR', 'Lyon', 1, 'Ligue 1', 1950, 1, 82, 'active'),
('losc-001', 'professional_club', 'Lille OSC', 'LOSC', 'FR', 'Lille', 1, 'Ligue 1', 1944, 1, 78, 'active'),
('asse-001', 'professional_club', 'AS Saint-Étienne', 'ASSE', 'FR', 'Saint-Étienne', 1, 'Ligue 1', 1919, 1, 65, 'active'),
('sb29-001', 'professional_club', 'Stade Brestois 29', 'Brest', 'FR', 'Brest', 1, 'Ligue 1', 1950, 1, 72, 'active'),
('fcn-001', 'professional_club', 'FC Nantes', 'Nantes', 'FR', 'Nantes', 1, 'Ligue 1', 1943, 1, 70, 'active'),
('ogcn-001', 'professional_club', 'OGC Nice', 'Nice', 'FR', 'Nice', 1, 'Ligue 1', 1904, 1, 75, 'active'),
('rc-lens-001', 'professional_club', 'RC Lens', 'Lens', 'FR', 'Lens', 1, 'Ligue 1', 1906, 1, 73, 'active'),
('asm-001', 'professional_club', 'AS Monaco', 'Monaco', 'FR', 'Monaco', 1, 'Ligue 1', 1924, 1, 88, 'active');

-- Clubs africains
INSERT OR IGNORE INTO organizations (id, type, name, short_name, country, city, tier, league, founded_year, white_label_enabled, financial_health_score, status) VALUES
('wac-001', 'professional_club', 'Wydad Athletic Club', 'WAC', 'MA', 'Casablanca', 1, 'Botola Pro', 1937, 1, 78, 'active'),
('raja-001', 'professional_club', 'Raja Club Athletic', 'RCA', 'MA', 'Casablanca', 1, 'Botola Pro', 1949, 1, 76, 'active'),
('ahly-001', 'professional_club', 'Al Ahly SC', 'Ahly', 'EG', 'Le Caire', 1, 'Egyptian Premier League', 1907, 1, 92, 'active'),
('tp-001', 'professional_club', 'TP Mazembe', 'TPM', 'CD', 'Lubumbashi', 1, 'Linafoot', 1939, 1, 70, 'active');

-- Fédérations
INSERT OR IGNORE INTO organizations (id, type, name, short_name, country, city, tier, league, founded_year, white_label_enabled, financial_health_score, status) VALUES
('caf-001', 'federation', 'Confédération Africaine de Football', 'CAF', 'EG', 'Le Caire', 1, NULL, 1957, 0, 90, 'active'),
('uefa-001', 'federation', 'Union of European Football Associations', 'UEFA', 'CH', 'Nyon', 1, NULL, 1954, 0, 95, 'active');
