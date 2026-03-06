-- ============================================
-- MIGRATION 0007: TOMBOLA USERS (Fans avec niveaux)
-- Date: 2026-03-06
-- Description: Table utilisateurs enrichie pour système tombola
-- Note: On garde la table users existante mais on ajoute des colonnes
-- ============================================

-- Ajout des colonnes tombola à la table users existante
ALTER TABLE users ADD COLUMN first_name TEXT;
ALTER TABLE users ADD COLUMN last_name TEXT;
ALTER TABLE users ADD COLUMN country TEXT DEFAULT 'FR';
ALTER TABLE users ADD COLUMN city TEXT;
ALTER TABLE users ADD COLUMN date_of_birth TEXT; -- Format ISO: YYYY-MM-DD
ALTER TABLE users ADD COLUMN fan_level TEXT DEFAULT 'bronze' CHECK (fan_level IN ('bronze', 'silver', 'gold', 'elite'));
ALTER TABLE users ADD COLUMN fan_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN total_participations INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN total_winnings REAL DEFAULT 0.0;
ALTER TABLE users ADD COLUMN kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected'));
ALTER TABLE users ADD COLUMN kyc_verified_at TEXT;
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0; -- 0=false, 1=true
ALTER TABLE users ADD COLUMN phone_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN device_fingerprint TEXT;
ALTER TABLE users ADD COLUMN banned INTEGER DEFAULT 0; -- 0=false, 1=true
ALTER TABLE users ADD COLUMN updated_at TEXT DEFAULT (datetime('now'));

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_fan_level ON users(fan_level);
CREATE INDEX IF NOT EXISTS idx_users_kyc ON users(kyc_status);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Table: FANPOINTS TRANSACTIONS
CREATE TABLE IF NOT EXISTS fanpoints_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
    points_amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('participation', 'win', 'referral', 'quiz', 'social_share', 'redemption')),
    description TEXT,
    balance_after INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_fanpoints_user ON fanpoints_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_fanpoints_created_at ON fanpoints_transactions(created_at);

-- Table: REFERRALS (Parrainage)
CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    referrer_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired')),
    points_awarded INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(referrer_user_id, referred_user_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_user_id);

-- Table: NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('campaign_start', 'draw_result', 'win_notification', 'payment_reminder', 'referral_bonus', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT, -- JSON stringifié
    read INTEGER DEFAULT 0, -- 0=false, 1=true
    sent_via TEXT DEFAULT 'push', -- JSON array: ["push", "email", "sms"]
    sent_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
