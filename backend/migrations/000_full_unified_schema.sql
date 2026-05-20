-- ═══════════════════════════════════════════════════════════════════════
-- PaieCashCoin - Full Unified Schema (Migration 000)
-- Target: Supabase PostgreSQL
-- Purpose: Merge Mint, Marketplace, and Admin into a single structure
-- ═══════════════════════════════════════════════════════════════════════

-- ─── CLEANUP ──────────────────────────────────────────────────────────
-- Drop in reverse order of dependencies
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS approval_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS fraud_flags CASCADE;
DROP TABLE IF EXISTS platform_settings CASCADE;
DROP TABLE IF EXISTS treasury_reserves CASCADE;
DROP TABLE IF EXISTS treasury_logs CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS admin_roles CASCADE;

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS merchant_payments CASCADE;
DROP TABLE IF EXISTS p2p_transactions CASCADE;
DROP TABLE IF EXISTS mint_transactions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS withdrawal_requests CASCADE;
DROP TABLE IF EXISTS cashout_requests CASCADE; -- Legacy name

DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;

DROP TABLE IF EXISTS club_profiles CASCADE;
DROP TABLE IF EXISTS club_applications CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS wallet_balances CASCADE;
DROP TABLE IF EXISTS otp_codes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ─── EXTENSIONS ───────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── CORE: USERS & AUTH ────────────────────────────────────────────────
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  country         TEXT DEFAULT 'GLOBAL',
  role            TEXT NOT NULL DEFAULT 'fan'
                  CHECK (role IN ('fan','club_admin','frostrek_admin')),
  tenant_id       UUID, -- Set if user is a club_admin
  is_active       BOOLEAN DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

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

-- ─── CLUBS & MULTI-TENANCY ─────────────────────────────────────────────
CREATE TABLE tenants (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_name           TEXT UNIQUE NOT NULL,
  slug                TEXT UNIQUE NOT NULL,
  description         TEXT,
  brand_color         TEXT DEFAULT '#1B7E7E',
  logo_url            TEXT,
  country             TEXT NOT NULL,
  sport               TEXT DEFAULT 'football',
  website             TEXT,
  admin_user_id       UUID REFERENCES users(id),
  treasury_wallet_id  TEXT,
  treasury_address    TEXT,
  exchange_rate       REAL DEFAULT 100,
  status              TEXT DEFAULT 'pending'
                      CHECK (status IN ('pending','approved','active','suspended','rejected')),
  approved_at         TIMESTAMPTZ,
  approved_by         UUID REFERENCES users(id),
  total_fans          INTEGER DEFAULT 0,
  total_pcc_minted    NUMERIC(20,8) DEFAULT 0,
  total_pcc_spent     NUMERIC(20,8) DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_slug ON tenants(slug);

-- Circular FK for users -> tenants
ALTER TABLE users ADD CONSTRAINT fk_users_tenant
  FOREIGN KEY (tenant_id) REFERENCES tenants(id);

CREATE TABLE club_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) UNIQUE,
  banner_url      TEXT,
  tagline         TEXT,
  social_links    JSONB DEFAULT '{}',
  fan_count       INTEGER DEFAULT 0,
  verified        BOOLEAN DEFAULT FALSE,
  featured        BOOLEAN DEFAULT FALSE,
  metadata        JSONB DEFAULT '{}',
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WALLETS ─────────────────────────────────────────────────────────
CREATE TABLE wallets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) UNIQUE,
  circle_wallet_id    TEXT UNIQUE NOT NULL,
  circle_wallet_set_id TEXT NOT NULL,
  wallet_address      TEXT UNIQUE NOT NULL,
  blockchain_network  TEXT DEFAULT 'MATIC-AMOY',
  pcc_balance         NUMERIC(20,8) DEFAULT 0,
  wallet_type         TEXT DEFAULT 'fan'
                      CHECK (wallet_type IN ('fan','club_treasury','admin')),
  status              TEXT DEFAULT 'active'
                      CHECK (status IN ('active','suspended','closed')),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_wallets_address ON wallets(wallet_address);

-- ─── PRODUCTS & MARKETPLACE ──────────────────────────────────────────
CREATE TABLE product_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  slug            TEXT NOT NULL UNIQUE,
  icon            TEXT,
  display_order   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  category_id     UUID REFERENCES product_categories(id),
  name            TEXT NOT NULL,
  description     TEXT,
  pcc_price       NUMERIC(20,8) NOT NULL CHECK (pcc_price > 0),
  eur_price       NUMERIC(12,2),
  image_url       TEXT,
  stock           INTEGER DEFAULT -1,
  total_sold      INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'active'
                  CHECK (status IN ('active','inactive','sold_out')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_products_tenant ON products(tenant_id);

-- ─── TRANSACTIONS & LEDGER ───────────────────────────────────────────
CREATE TABLE transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id),
  tenant_id           UUID REFERENCES tenants(id),
  type                TEXT NOT NULL
                      CHECK (type IN ('mint','spend','transfer','reward','fee','withdrawal','send','receive')),
  pcc_amount          NUMERIC(20,8) NOT NULL,
  tx_hash             TEXT,
  internal_status     TEXT DEFAULT 'pending'
                      CHECK (internal_status IN ('pending','processing','complete','failed','cancelled')),
  blockchain_status   TEXT DEFAULT 'pending'
                      CHECK (blockchain_status IN ('pending','confirmed','failed')),
  idempotency_key     TEXT UNIQUE,
  metadata            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tx_user ON transactions(user_id);
CREATE INDEX idx_tx_tenant ON transactions(tenant_id);
CREATE INDEX idx_tx_type ON transactions(type);
CREATE INDEX idx_tx_status ON transactions(internal_status);

-- Detailed logs for specific transaction types
CREATE TABLE mint_transactions (
  id              UUID PRIMARY KEY REFERENCES transactions(id),
  payment_rail    TEXT NOT NULL,
  source_currency TEXT NOT NULL DEFAULT 'EUR',
  source_amount   NUMERIC(12,2) NOT NULL,
  stripe_session  TEXT,
  circle_tx_id    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE p2p_transactions (
  id                UUID PRIMARY KEY REFERENCES transactions(id),
  recipient_id      UUID NOT NULL REFERENCES users(id),
  sender_wallet     UUID REFERENCES wallets(id),
  recipient_wallet  UUID REFERENCES wallets(id),
  note              TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE merchant_payments (
  id              UUID PRIMARY KEY REFERENCES transactions(id),
  product_id      UUID REFERENCES products(id),
  order_id        UUID,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ORDERS & WITHDRAWALS ────────────────────────────────────────────
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  transaction_id  UUID REFERENCES transactions(id),
  total_pcc       NUMERIC(20,8) NOT NULL,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','processing','completed','cancelled','refunded')),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id),
  product_id      UUID NOT NULL REFERENCES products(id),
  quantity        INTEGER NOT NULL DEFAULT 1,
  unit_price_pcc  NUMERIC(20,8) NOT NULL,
  total_pcc       NUMERIC(20,8) NOT NULL
);

CREATE TABLE withdrawal_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  pcc_amount        NUMERIC(20,8) NOT NULL,
  fiat_amount       NUMERIC(12,2),
  fiat_currency     TEXT DEFAULT 'EUR',
  bank_details      JSONB NOT NULL DEFAULT '{}',
  status            TEXT DEFAULT 'pending'
                      CHECK (status IN ('pending','under_review','approved','processing','completed','rejected','failed')),
  admin_notes       TEXT,
  transaction_id    UUID REFERENCES transactions(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ADMIN & SYSTEM ──────────────────────────────────────────────────
CREATE TABLE platform_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key             TEXT UNIQUE NOT NULL,
  value           JSONB NOT NULL,
  description     TEXT,
  updated_by      UUID REFERENCES users(id),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  action          TEXT NOT NULL,
  entity_type     TEXT,
  entity_id       UUID,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TRIGGERS ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tenants_updated BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_transactions_updated BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_withdrawals_updated BEFORE UPDATE ON withdrawal_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_club_profiles_updated BEFORE UPDATE ON club_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
