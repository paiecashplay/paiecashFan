-- ═══════════════════════════════════════════════════════════════════════
-- PaieCashCoin - Full Schema Migration
-- Target: Supabase PostgreSQL
-- ═══════════════════════════════════════════════════════════════════════

-- ─── DROP ALL OLD TABLES ───────────────────────────────────────────────
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS cashout_requests CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS otp_codes CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Also drop legacy tables from the old SQLite-era schema
DROP TABLE IF EXISTS merchants CASCADE;
DROP TABLE IF EXISTS cashouts CASCADE;

-- ─── ENABLE EXTENSIONS ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: users
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  country         TEXT DEFAULT 'GLOBAL',
  role            TEXT NOT NULL DEFAULT 'fan'
                  CHECK (role IN ('fan','club_admin','frostrek_admin')),
  tenant_id       UUID,
  is_active       BOOLEAN DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_tenant ON users(tenant_id);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: otp_codes
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE otp_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,
  code_hash       TEXT NOT NULL,
  purpose         TEXT NOT NULL
                  CHECK (purpose IN ('login','register','club_register')),
  expires_at      TIMESTAMPTZ NOT NULL,
  used_at         TIMESTAMPTZ,
  attempts        INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_otp_email_purpose ON otp_codes(email, purpose);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: tenants
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE tenants (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_name           TEXT UNIQUE NOT NULL,
  slug                TEXT UNIQUE NOT NULL,
  description         TEXT,
  brand_color         TEXT DEFAULT '#1B7E7E',
  logo_url            TEXT,
  country             TEXT NOT NULL,
  sport               TEXT DEFAULT 'football'
                      CHECK (sport IN ('football','basketball',
                             'cricket','tennis','rugby','other')),
  website             TEXT,
  admin_user_id       UUID REFERENCES users(id),
  treasury_wallet_id  TEXT,
  treasury_address    TEXT,
  exchange_rate       REAL DEFAULT 100,
  status              TEXT DEFAULT 'pending'
                      CHECK (status IN ('pending','approved',
                             'active','suspended','rejected')),
  approved_at         TIMESTAMPTZ,
  approved_by         UUID REFERENCES users(id),
  rejection_reason    TEXT,
  total_fans          INTEGER DEFAULT 0,
  total_pcc_minted    NUMERIC(20,8) DEFAULT 0,
  total_pcc_spent     NUMERIC(20,8) DEFAULT 0,
  total_volume_eur    NUMERIC(12,2) DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_country ON tenants(country);

-- Now add FK from users to tenants
ALTER TABLE users ADD CONSTRAINT fk_users_tenant
  FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: wallets
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE wallets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id),
  circle_wallet_id    TEXT UNIQUE NOT NULL,
  circle_wallet_set_id TEXT NOT NULL,
  wallet_address      TEXT UNIQUE NOT NULL,
  blockchain_network  TEXT DEFAULT 'MATIC-AMOY',
  wallet_type         TEXT DEFAULT 'fan'
                      CHECK (wallet_type IN
                             ('fan','club_treasury','admin')),
  status              TEXT DEFAULT 'active'
                      CHECK (status IN ('active','suspended','closed')),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_wallets_address ON wallets(wallet_address);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: products
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  name            TEXT NOT NULL,
  description     TEXT,
  pcc_price       NUMERIC(20,8) NOT NULL CHECK (pcc_price > 0),
  eur_price       NUMERIC(12,2),
  image_url       TEXT,
  category        TEXT DEFAULT 'merchandise'
                  CHECK (category IN ('merchandise','ticket',
                         'experience','digital','other')),
  stock           INTEGER DEFAULT -1,
  total_sold      INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'active'
                  CHECK (status IN ('active','inactive','sold_out')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_status ON products(status);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: transactions
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id),
  tenant_id           UUID REFERENCES tenants(id),
  product_id          UUID REFERENCES products(id),
  type                TEXT NOT NULL
                      CHECK (type IN ('mint','spend','transfer',
                             'topup_initiated','topup_failed')),
  payment_rail        TEXT
                      CHECK (payment_rail IN
                             ('stripe','internal','crypto','mobile_money')),
  source_currency     TEXT DEFAULT 'EUR',
  source_amount       NUMERIC(12,2),
  pcc_amount          NUMERIC(20,8) NOT NULL,
  tx_hash             TEXT,
  blockchain_status   TEXT DEFAULT 'pending'
                      CHECK (blockchain_status IN
                             ('pending','confirmed','failed')),
  internal_status     TEXT DEFAULT 'pending'
                      CHECK (internal_status IN
                             ('pending','complete','failed')),
  idempotency_key     TEXT UNIQUE,
  failure_reason      TEXT,
  metadata            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tx_user ON transactions(user_id);
CREATE INDEX idx_tx_tenant ON transactions(tenant_id);
CREATE INDEX idx_tx_type ON transactions(type);
CREATE INDEX idx_tx_status ON transactions(internal_status);
CREATE INDEX idx_tx_created ON transactions(created_at DESC);
CREATE INDEX idx_tx_idempotency ON transactions(idempotency_key);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: orders
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  transaction_id  UUID REFERENCES transactions(id),
  items           JSONB NOT NULL DEFAULT '[]',
  total_pcc       NUMERIC(20,8) NOT NULL,
  total_eur       NUMERIC(12,2) NOT NULL,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed',
                         'processing','completed','cancelled','refunded')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_tenant ON orders(tenant_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: cashout_requests
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE cashout_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id),
  requested_by        UUID NOT NULL REFERENCES users(id),
  pcc_amount          NUMERIC(20,8) NOT NULL,
  fiat_amount         NUMERIC(12,2) NOT NULL,
  fee_amount          NUMERIC(12,2) NOT NULL,
  net_fiat_amount     NUMERIC(12,2) NOT NULL,
  exchange_rate_used  REAL NOT NULL,
  fiat_currency       TEXT DEFAULT 'EUR',
  bank_details        JSONB NOT NULL DEFAULT '{}',
  status              TEXT DEFAULT 'pending'
                      CHECK (status IN ('pending','under_review',
                             'approved','bank_sent','completed',
                             'rejected','failed')),
  admin_notes         TEXT,
  rejection_reason    TEXT,
  requested_at        TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at         TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cashout_tenant ON cashout_requests(tenant_id);
CREATE INDEX idx_cashout_status ON cashout_requests(status);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: notifications
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  tenant_id   UUID REFERENCES tenants(id),
  type        TEXT NOT NULL
              CHECK (type IN ('club_approved','club_rejected',
                     'cashout_update','new_order','new_fan','system')),
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_tenant ON notifications(tenant_id);
CREATE INDEX idx_notif_read ON notifications(is_read);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: audit_logs
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  action          TEXT NOT NULL,
  entity_type     TEXT,
  entity_id       UUID,
  ip_address      TEXT,
  user_agent      TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════
-- AUTOMATIC UPDATED_AT TRIGGER
-- ═══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tenants_updated
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_products_updated
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_transactions_updated
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_cashouts_updated
  BEFORE UPDATE ON cashout_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════
-- SEED: Frostrek Admin User
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO users (full_name, email, role, is_active)
VALUES ('Frostrek Admin', 'admin@frostrek.com', 'frostrek_admin', TRUE)
ON CONFLICT (email) DO NOTHING;
