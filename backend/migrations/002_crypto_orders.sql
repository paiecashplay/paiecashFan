-- ═══════════════════════════════════════════════════════════════════════
-- PaieCashCoin - Migration 002: Crypto Orders Table
-- Supports: Transak, MoonPay, Alchemy Pay crypto on-ramp providers
-- ═══════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: crypto_orders
-- Tracks crypto payment lifecycle: initiate → processing → completed → minted
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS crypto_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  tenant_id         UUID REFERENCES tenants(id),

  -- Provider info
  provider          TEXT NOT NULL
                    CHECK (provider IN ('transak','moonpay','alchemy_pay')),
  provider_order_id TEXT UNIQUE NOT NULL,
  provider_status   TEXT,

  -- What fan paid (crypto side)
  crypto_currency   TEXT NOT NULL,
                    -- ETH | BTC | SOL | BNB | USDC | MATIC
  crypto_amount     NUMERIC(30,18),
  fiat_currency     TEXT DEFAULT 'EUR',
  fiat_amount       NUMERIC(12,2),

  -- What we receive in treasury (USDC or EURC)
  received_currency TEXT DEFAULT 'USDC',
                    -- USDC | EURC
  received_amount   NUMERIC(20,8),

  -- PCC to mint
  pcc_amount        NUMERIC(20,8),
  exchange_rate     REAL,              -- PCC per EUR at time of order

  -- Idempotency (prevent double mint)
  idempotency_key   TEXT UNIQUE,
  transaction_id    UUID REFERENCES transactions(id),

  -- Status lifecycle
  status            TEXT DEFAULT 'initiated'
                    CHECK (status IN (
                      'initiated',      -- order created in our DB
                      'pending',        -- fan opened widget
                      'processing',     -- crypto received, provider converting
                      'completed',      -- EURC/USDC landed in treasury
                      'minted',         -- PCC minted to fan wallet
                      'failed',         -- something went wrong
                      'refunded'        -- provider refunded fan
                    )),
  failure_reason    TEXT,
  provider_fee      NUMERIC(12,2),
  metadata          JSONB DEFAULT '{}',

  -- Timestamps
  initiated_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  minted_at         TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_crypto_orders_user
  ON crypto_orders(user_id);

CREATE INDEX IF NOT EXISTS idx_crypto_orders_provider_id
  ON crypto_orders(provider_order_id);

CREATE INDEX IF NOT EXISTS idx_crypto_orders_status
  ON crypto_orders(status);

CREATE INDEX IF NOT EXISTS idx_crypto_orders_idempotency
  ON crypto_orders(idempotency_key);

CREATE INDEX IF NOT EXISTS idx_crypto_orders_initiated
  ON crypto_orders(initiated_at DESC);

-- ═══════════════════════════════════════════════════════════════════════
-- AUTO updated_at TRIGGER
-- (reuses the update_updated_at() function from 001_full_schema.sql)
-- ═══════════════════════════════════════════════════════════════════════

CREATE TRIGGER trg_crypto_orders_updated
  BEFORE UPDATE ON crypto_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
