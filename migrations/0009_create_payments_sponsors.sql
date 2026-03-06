-- ============================================
-- MIGRATION 0009: PAYMENTS & SPONSORS (Tombola)
-- Date: 2026-03-06
-- Description: Gestion paiements utilisateurs et sponsors
-- ============================================

-- Table: PAYMENTS (Paiements utilisateurs)
CREATE TABLE IF NOT EXISTS tombola_payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
    participation_id TEXT REFERENCES participations(id) ON DELETE SET NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'EUR',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'paypal', 'mobile_money', 'bank_transfer', 'crypto')),
    payment_provider TEXT, -- 'stripe', 'wave', 'orange_money', etc.
    provider_transaction_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'disputed')),
    failure_reason TEXT,
    refunded_at TEXT,
    refunded_by TEXT, -- User ID de l'admin qui a fait le remboursement
    ip_address TEXT,
    device_info TEXT, -- JSON stringifié
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tombola_payments_user ON tombola_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_tombola_payments_status ON tombola_payments(status);
CREATE INDEX IF NOT EXISTS idx_tombola_payments_created_at ON tombola_payments(created_at);
CREATE INDEX IF NOT EXISTS idx_tombola_payments_provider_tx ON tombola_payments(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_tombola_payments_campaign ON tombola_payments(campaign_id);

-- Table: EVENT SPONSORS (Sponsors par événement)
CREATE TABLE IF NOT EXISTS event_sponsors (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    sponsor_name TEXT NOT NULL,
    sponsor_type TEXT CHECK (sponsor_type IN ('automotive', 'telecom', 'bank', 'beverage', 'travel', 'media', 'retail', 'insurance', 'energy', 'technology')),
    contribution_type TEXT NOT NULL CHECK (contribution_type IN ('cash', 'product', 'media_value', 'service')),
    contribution_value REAL NOT NULL,
    lots_provided TEXT, -- JSON stringifié: [{"lot_id": "lot-auto-001", "quantity": 1}]
    visibility_package TEXT, -- JSON stringifié: {"logo_stadium": true, "social_media": true}
    contract_start TEXT NOT NULL, -- Format ISO: YYYY-MM-DD
    contract_end TEXT NOT NULL,
    logo_url TEXT,
    contact_person TEXT,
    contact_email TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_event_sponsors_org ON event_sponsors(organization_id);
CREATE INDEX IF NOT EXISTS idx_event_sponsors_status ON event_sponsors(status);
CREATE INDEX IF NOT EXISTS idx_event_sponsors_dates ON event_sponsors(contract_start, contract_end);

-- Table: CLUB PAYMENTS (Paiements J+60 aux clubs)
CREATE TABLE IF NOT EXISTS club_payments (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    campaign_ids TEXT NOT NULL, -- JSON array: ["campaign-1", "campaign-2"]
    total_amount REAL NOT NULL,
    currency TEXT DEFAULT 'EUR',
    payment_due_date TEXT NOT NULL, -- Format ISO: YYYY-MM-DD
    payment_paid_date TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'disputed')),
    invoice_number TEXT,
    invoice_pdf_url TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_club_payments_org ON club_payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_club_payments_status ON club_payments(status);
CREATE INDEX IF NOT EXISTS idx_club_payments_due_date ON club_payments(payment_due_date);
