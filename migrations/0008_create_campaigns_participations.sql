-- ============================================
-- MIGRATION 0008: CAMPAIGNS & PARTICIPATIONS (Tombola quotidienne)
-- Date: 2026-03-06
-- Description: Système de tirages quotidiens avec participations
-- ============================================

-- Table: LOT ALLOCATIONS (Attribution quotidienne)
CREATE TABLE IF NOT EXISTS lot_allocations (
    id TEXT PRIMARY KEY,
    lot_id TEXT NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    allocation_date TEXT NOT NULL, -- Format ISO: YYYY-MM-DD
    is_super_bonus INTEGER DEFAULT 0, -- 0=false, 1=true
    custom_cost_to_club REAL, -- Override si différent
    min_participants INTEGER,
    auto_renew INTEGER DEFAULT 1, -- 0=false, 1=true
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'drawn', 'completed', 'cancelled')),
    drawn_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(lot_id, organization_id, allocation_date)
);

CREATE INDEX IF NOT EXISTS idx_lot_allocations_org_date ON lot_allocations(organization_id, allocation_date);
CREATE INDEX IF NOT EXISTS idx_lot_allocations_status ON lot_allocations(status);
CREATE INDEX IF NOT EXISTS idx_lot_allocations_super_bonus ON lot_allocations(is_super_bonus);

-- Table: CAMPAIGNS (Tirages quotidiens)
CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lot_allocation_id TEXT REFERENCES lot_allocations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    prize_type TEXT NOT NULL,
    prize_name TEXT,
    prize_description TEXT,
    prize_value REAL NOT NULL,
    prize_currency TEXT DEFAULT 'EUR',
    entry_fee REAL NOT NULL,
    entry_currency TEXT DEFAULT 'EUR',
    target_participants INTEGER NOT NULL,
    current_participants INTEGER DEFAULT 0,
    min_participants INTEGER,
    start_datetime TEXT NOT NULL, -- Format ISO: YYYY-MM-DD HH:MM:SS
    draw_datetime TEXT NOT NULL,
    end_datetime TEXT,
    legal_basis TEXT, -- 'concours_gratuit' (FR), 'paid_lottery' (MA, SN, etc.)
    free_entry_required INTEGER DEFAULT 0, -- 0=false, 1=true (France)
    free_entry_method TEXT, -- 'postal_request' pour France
    auto_renewal_enabled INTEGER DEFAULT 1, -- 0=false, 1=true
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'draw_pending', 'completed', 'cancelled')),
    winning_ticket_id TEXT,
    drawn_at TEXT,
    blockchain_tx_hash TEXT, -- Hash transaction blockchain pour preuve
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_draw_datetime ON campaigns(draw_datetime);
CREATE INDEX IF NOT EXISTS idx_campaigns_winning_ticket ON campaigns(winning_ticket_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_start_datetime ON campaigns(start_datetime);

-- Table: PARTICIPATIONS
CREATE TABLE IF NOT EXISTS participations (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_fee_paid REAL NOT NULL,
    entry_currency TEXT DEFAULT 'EUR',
    entries_count INTEGER DEFAULT 1,
    ticket_numbers TEXT, -- JSON array: [1, 15, 42, 108]
    auto_renew INTEGER DEFAULT 0, -- 0=false, 1=true
    renewal_cycle_days INTEGER,
    next_renewal_date TEXT, -- Format ISO: YYYY-MM-DD
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_id TEXT,
    is_winner INTEGER DEFAULT 0, -- 0=false, 1=true
    won_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_participations_campaign ON participations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_participations_user ON participations(user_id);
CREATE INDEX IF NOT EXISTS idx_participations_payment_status ON participations(payment_status);
CREATE INDEX IF NOT EXISTS idx_participations_winner ON participations(is_winner);
CREATE INDEX IF NOT EXISTS idx_participations_created_at ON participations(created_at);

-- Table: DRAW RESULTS (Audit trail)
CREATE TABLE IF NOT EXISTS draw_results (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    winning_ticket_id TEXT NOT NULL REFERENCES participations(id) ON DELETE CASCADE,
    winning_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    draw_method TEXT NOT NULL, -- 'random_org', 'blockchain', 'manual_notary'
    rng_seed TEXT, -- Seed RNG pour reproductibilité
    pre_commit_hash TEXT, -- Hash pré-commit pour transparence
    blockchain_tx_hash TEXT, -- Transaction blockchain preuve
    notary_signature TEXT, -- Signature huissier si applicable
    live_stream_url TEXT, -- URL stream live du tirage
    drawn_at TEXT DEFAULT (datetime('now')),
    verified_by TEXT, -- User ID du vérificateur
    verified_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_draw_results_campaign ON draw_results(campaign_id);
CREATE INDEX IF NOT EXISTS idx_draw_results_winning_user ON draw_results(winning_user_id);
CREATE INDEX IF NOT EXISTS idx_draw_results_drawn_at ON draw_results(drawn_at);

-- Table: COUNTRY RULES (Compliance juridique)
CREATE TABLE IF NOT EXISTS country_rules (
    country_code TEXT PRIMARY KEY,
    country_name TEXT NOT NULL,
    entry_fee_min REAL,
    entry_fee_max REAL,
    free_entry_required INTEGER DEFAULT 0, -- 0=false, 1=true (France, Allemagne)
    age_limit INTEGER DEFAULT 18,
    kyc_threshold REAL, -- Montant à partir duquel KYC obligatoire
    taxation_rate REAL, -- Taux de taxation sur les gains
    prohibited_prize_types TEXT, -- JSON array: ["alcohol", "tobacco"]
    legal_basis TEXT,
    regulatory_authority TEXT,
    last_updated TEXT DEFAULT (datetime('now'))
);

-- Données initiales: Règles pays
INSERT OR IGNORE INTO country_rules (country_code, country_name, entry_fee_min, entry_fee_max, free_entry_required, age_limit, kyc_threshold, taxation_rate, legal_basis, regulatory_authority) VALUES
('FR', 'France', 0.01, 1.00, 1, 18, 500.00, 0.00, 'Article L.121-35 Code de la consommation - Concours gratuit obligatoire', 'DGCCRF'),
('MA', 'Maroc', 0.50, 100.00, 0, 18, 5000.00, 10.00, 'Loi 07-00 sur les jeux et paris', 'Ministère des Finances'),
('SN', 'Sénégal', 0.50, 50.00, 0, 18, 3000.00, 5.00, 'Loi n° 2018-32 relative aux jeux de hasard', 'LONASE'),
('CI', 'Côte d''Ivoire', 0.50, 50.00, 0, 18, 3000.00, 5.00, 'Décret n° 2019-102 jeux d''argent', 'LONACI'),
('DZ', 'Algérie', 0.50, 20.00, 0, 18, 2000.00, 0.00, 'Loi 13-05 relative aux loteries', 'Ministère de l''Intérieur'),
('GB', 'Royaume-Uni', 0.01, 10.00, 0, 16, 1000.00, 0.00, 'Gambling Act 2005', 'UK Gambling Commission'),
('ES', 'Espagne', 0.01, 5.00, 0, 18, 1000.00, 20.00, 'Ley 13/2011 de regulación del juego', 'DGOJ'),
('DE', 'Allemagne', 0.01, 2.00, 1, 18, 1000.00, 0.00, 'Glücksspielstaatsvertrag - Concours gratuit obligatoire', 'Glücksspielbehörde'),
('US', 'États-Unis', 0.01, 10.00, 1, 21, 5000.00, 0.00, 'No Purchase Necessary - Alternative gratuite obligatoire', 'State Gaming Commissions');
