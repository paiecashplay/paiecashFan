-- ═══════════════════════════════════════════════════════════════════════
-- PaieCashCoin - Multi-Platform Schema Expansion (Migration 004)
-- Target: Supabase PostgreSQL
-- NOTE: Additive only - does NOT drop or modify existing tables
-- ═══════════════════════════════════════════════════════════════════════

-- ─── WALLET ENHANCEMENTS ──────────────────────────────────────────────

-- Extend wallets with pcc_balance column if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wallets' AND column_name='pcc_balance') THEN
    ALTER TABLE wallets ADD COLUMN pcc_balance NUMERIC(20,8) DEFAULT 0;
  END IF;
END $$;

-- Multi-balance ledger (main, gaming, betting sub-wallets)
CREATE TABLE IF NOT EXISTS wallet_balances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id       UUID NOT NULL REFERENCES wallets(id),
  balance_type    TEXT NOT NULL CHECK (balance_type IN ('main','gaming','betting','rewards')),
  amount          NUMERIC(20,8) NOT NULL DEFAULT 0,
  locked_amount   NUMERIC(20,8) NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wallet_id, balance_type)
);
CREATE INDEX IF NOT EXISTS idx_wb_wallet ON wallet_balances(wallet_id);

-- Dedicated mint audit trail
CREATE TABLE IF NOT EXISTS mint_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  wallet_id       UUID REFERENCES wallets(id),
  payment_rail    TEXT NOT NULL CHECK (payment_rail IN ('stripe','transak','moonpay','crypto','mobile_money','manual')),
  source_currency TEXT NOT NULL DEFAULT 'EUR',
  source_amount   NUMERIC(12,2) NOT NULL,
  eurc_amount     NUMERIC(20,8) NOT NULL,
  pcc_amount      NUMERIC(20,8) NOT NULL,
  fee_amount      NUMERIC(12,2) DEFAULT 0,
  exchange_rate   REAL,
  stripe_session  TEXT,
  circle_tx_id    TEXT,
  tx_hash         TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','success','failed','refunded')),
  failure_reason  TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mint_user ON mint_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_mint_status ON mint_transactions(status);
CREATE INDEX IF NOT EXISTS idx_mint_rail ON mint_transactions(payment_rail);

-- P2P transfer ledger
CREATE TABLE IF NOT EXISTS p2p_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id         UUID NOT NULL REFERENCES users(id),
  recipient_id      UUID NOT NULL REFERENCES users(id),
  sender_wallet     UUID REFERENCES wallets(id),
  recipient_wallet  UUID REFERENCES wallets(id),
  amount            NUMERIC(20,8) NOT NULL,
  fee_amount        NUMERIC(20,8) DEFAULT 0,
  circle_tx_id      TEXT,
  tx_hash           TEXT,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','success','failed','reversed')),
  transfer_type     TEXT DEFAULT 'p2p' CHECK (transfer_type IN ('p2p','remittance','qr_payment','merchant')),
  note              TEXT,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_p2p_sender ON p2p_transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_p2p_recipient ON p2p_transactions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_p2p_status ON p2p_transactions(status);

-- Merchant payment records
CREATE TABLE IF NOT EXISTS merchant_payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  product_id      UUID REFERENCES products(id),
  order_id        UUID REFERENCES orders(id),
  amount          NUMERIC(20,8) NOT NULL,
  circle_tx_id    TEXT,
  tx_hash         TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','success','failed','refunded')),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mp_user ON merchant_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_mp_tenant ON merchant_payments(tenant_id);

-- User withdrawal requests
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  wallet_id         UUID REFERENCES wallets(id),
  pcc_amount        NUMERIC(20,8) NOT NULL,
  fiat_amount       NUMERIC(12,2),
  fiat_currency     TEXT DEFAULT 'EUR',
  exchange_rate     REAL,
  fee_amount        NUMERIC(12,2) DEFAULT 0,
  net_amount        NUMERIC(12,2),
  withdrawal_method TEXT DEFAULT 'bank' CHECK (withdrawal_method IN ('bank','mobile_money','crypto','paypal')),
  bank_details      JSONB DEFAULT '{}',
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','processing','completed','rejected','failed')),
  admin_notes       TEXT,
  reviewed_by       UUID REFERENCES users(id),
  reviewed_at       TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wr_user ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_wr_status ON withdrawal_requests(status);

-- Treasury reserve tracking
CREATE TABLE IF NOT EXISTS treasury_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action          TEXT NOT NULL CHECK (action IN ('mint_reserve','burn_reserve','fee_collect','withdrawal_payout','manual_adjustment')),
  pcc_amount      NUMERIC(20,8) NOT NULL,
  fiat_equivalent NUMERIC(12,2),
  fiat_currency   TEXT DEFAULT 'EUR',
  running_balance NUMERIC(20,8),
  reference_id    UUID,
  reference_type  TEXT,
  performed_by    UUID REFERENCES users(id),
  notes           TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tl_action ON treasury_logs(action);

-- Payment rail audit log
CREATE TABLE IF NOT EXISTS payment_rail_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rail            TEXT NOT NULL CHECK (rail IN ('stripe','transak','moonpay','circle','mobile_money')),
  direction       TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  external_id     TEXT,
  amount          NUMERIC(12,2),
  currency        TEXT,
  status          TEXT,
  raw_payload     JSONB DEFAULT '{}',
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prl_rail ON payment_rail_logs(rail);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) UNIQUE,
  notification_email    BOOLEAN DEFAULT TRUE,
  notification_push     BOOLEAN DEFAULT TRUE,
  preferred_currency    TEXT DEFAULT 'EUR',
  preferred_language    TEXT DEFAULT 'en',
  two_factor_enabled    BOOLEAN DEFAULT FALSE,
  privacy_settings      JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── MARKETPLACE / CLUB TABLES ────────────────────────────────────────

-- Club profiles (extends tenants with rich content)
CREATE TABLE IF NOT EXISTS club_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) UNIQUE,
  banner_url      TEXT,
  tagline         TEXT,
  social_links    JSONB DEFAULT '{}',
  fan_count       INTEGER DEFAULT 0,
  verified        BOOLEAN DEFAULT FALSE,
  featured        BOOLEAN DEFAULT FALSE,
  rating          REAL DEFAULT 0,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Club application workflow
CREATE TABLE IF NOT EXISTS club_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_email TEXT NOT NULL,
  applicant_name  TEXT NOT NULL,
  club_name       TEXT NOT NULL,
  country         TEXT NOT NULL,
  sport           TEXT DEFAULT 'football',
  website         TEXT,
  description     TEXT,
  documents       JSONB DEFAULT '[]',
  status          TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','approved','rejected','more_info_needed')),
  reviewer_id     UUID REFERENCES users(id),
  reviewer_notes  TEXT,
  tenant_id       UUID REFERENCES tenants(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ca_status ON club_applications(status);

-- Product categories
CREATE TABLE IF NOT EXISTS product_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  slug            TEXT NOT NULL UNIQUE,
  icon            TEXT,
  display_order   INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO product_categories (name, slug, icon, display_order) VALUES
  ('Merchandise', 'merchandise', '👕', 1),
  ('Tickets', 'tickets', '🎟️', 2),
  ('Experiences', 'experiences', '⭐', 3),
  ('Digital', 'digital', '💿', 4),
  ('Collectibles', 'collectibles', '🏆', 5)
ON CONFLICT (slug) DO NOTHING;

-- Inventory management
CREATE TABLE IF NOT EXISTS inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id),
  sku             TEXT,
  variant_name    TEXT DEFAULT 'default',
  stock_count     INTEGER DEFAULT -1,
  reserved_count  INTEGER DEFAULT 0,
  low_stock_alert INTEGER DEFAULT 5,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inv_product ON inventory(product_id);

-- Order line items
CREATE TABLE IF NOT EXISTS order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id),
  product_id      UUID NOT NULL REFERENCES products(id),
  quantity        INTEGER NOT NULL DEFAULT 1,
  unit_price_pcc  NUMERIC(20,8) NOT NULL,
  total_pcc       NUMERIC(20,8) NOT NULL,
  variant         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_oi_order ON order_items(order_id);

-- Club sales analytics (aggregated)
CREATE TABLE IF NOT EXISTS club_sales (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  period_date     DATE NOT NULL,
  period_type     TEXT DEFAULT 'daily' CHECK (period_type IN ('daily','weekly','monthly')),
  total_orders    INTEGER DEFAULT 0,
  total_pcc       NUMERIC(20,8) DEFAULT 0,
  total_items     INTEGER DEFAULT 0,
  unique_buyers   INTEGER DEFAULT 0,
  UNIQUE(tenant_id, period_date, period_type)
);

-- Club analytics metrics
CREATE TABLE IF NOT EXISTS club_analytics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  metric_name     TEXT NOT NULL,
  metric_value    NUMERIC(20,4) NOT NULL,
  recorded_at     TIMESTAMPTZ DEFAULT NOW(),
  metadata        JSONB DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_canalytics_tenant ON club_analytics(tenant_id);

-- Promotions
CREATE TABLE IF NOT EXISTS promotions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES tenants(id),
  code            TEXT UNIQUE,
  title           TEXT NOT NULL,
  description     TEXT,
  discount_type   TEXT CHECK (discount_type IN ('percentage','fixed_pcc')),
  discount_value  NUMERIC(10,2) NOT NULL,
  min_order_pcc   NUMERIC(20,8) DEFAULT 0,
  max_uses        INTEGER DEFAULT -1,
  used_count      INTEGER DEFAULT 0,
  starts_at       TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Fan subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  plan_name       TEXT DEFAULT 'basic',
  pcc_per_period  NUMERIC(20,8) NOT NULL,
  period          TEXT DEFAULT 'monthly' CHECK (period IN ('weekly','monthly','yearly')),
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','paused','cancelled','expired')),
  next_billing    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sub_user ON subscriptions(user_id);

-- Rewards / loyalty
CREATE TABLE IF NOT EXISTS rewards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  tenant_id       UUID REFERENCES tenants(id),
  reward_type     TEXT NOT NULL CHECK (reward_type IN ('purchase','referral','contest_win','daily_login','achievement','promotion')),
  pcc_amount      NUMERIC(20,8) NOT NULL,
  description     TEXT,
  claimed         BOOLEAN DEFAULT FALSE,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rewards_user ON rewards(user_id);

-- ─── GAMING / BETTING TABLES (SKELETON) ───────────────────────────────

-- Game contests (fantasy, predictions, challenges)
CREATE TABLE IF NOT EXISTS game_contests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES tenants(id),
  title           TEXT NOT NULL,
  description     TEXT,
  contest_type    TEXT NOT NULL CHECK (contest_type IN ('fantasy','prediction','skill_game','daily_challenge','tournament')),
  sport           TEXT DEFAULT 'football',
  entry_fee_pcc   NUMERIC(20,8) DEFAULT 0,
  prize_pool_pcc  NUMERIC(20,8) DEFAULT 0,
  max_entries     INTEGER DEFAULT -1,
  current_entries INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'upcoming' CHECK (status IN ('draft','upcoming','live','completed','cancelled')),
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  rules           JSONB DEFAULT '{}',
  prizes          JSONB DEFAULT '[]',
  created_by      UUID REFERENCES users(id),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gc_status ON game_contests(status);
CREATE INDEX IF NOT EXISTS idx_gc_tenant ON game_contests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gc_type ON game_contests(contest_type);

-- Contest entries
CREATE TABLE IF NOT EXISTS game_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id      UUID NOT NULL REFERENCES game_contests(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  entry_fee_paid  NUMERIC(20,8) DEFAULT 0,
  selections      JSONB DEFAULT '{}',
  score           NUMERIC(10,2) DEFAULT 0,
  rank            INTEGER,
  prize_won       NUMERIC(20,8) DEFAULT 0,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','submitted','scored','winner','eliminated','refunded')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contest_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_ge_contest ON game_entries(contest_id);
CREATE INDEX IF NOT EXISTS idx_ge_user ON game_entries(user_id);

-- Betting pools
CREATE TABLE IF NOT EXISTS betting_pools (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES tenants(id),
  title           TEXT NOT NULL,
  description     TEXT,
  event_type      TEXT DEFAULT 'match',
  sport           TEXT DEFAULT 'football',
  options         JSONB NOT NULL DEFAULT '[]',
  total_pool_pcc  NUMERIC(20,8) DEFAULT 0,
  status          TEXT DEFAULT 'open' CHECK (status IN ('draft','open','locked','settled','cancelled','void')),
  winning_option  TEXT,
  opens_at        TIMESTAMPTZ,
  locks_at        TIMESTAMPTZ,
  settles_at      TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bp_status ON betting_pools(status);

-- Individual bets
CREATE TABLE IF NOT EXISTS live_bets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id         UUID NOT NULL REFERENCES betting_pools(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  selected_option TEXT NOT NULL,
  stake_pcc       NUMERIC(20,8) NOT NULL,
  potential_payout NUMERIC(20,8),
  odds_at_time    REAL,
  status          TEXT DEFAULT 'placed' CHECK (status IN ('placed','won','lost','void','refunded')),
  payout_pcc      NUMERIC(20,8) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lb_pool ON live_bets(pool_id);
CREATE INDEX IF NOT EXISTS idx_lb_user ON live_bets(user_id);

-- Tournaments
CREATE TABLE IF NOT EXISTS tournaments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES tenants(id),
  title           TEXT NOT NULL,
  description     TEXT,
  tournament_type TEXT DEFAULT 'bracket' CHECK (tournament_type IN ('bracket','round_robin','league','custom')),
  entry_fee_pcc   NUMERIC(20,8) DEFAULT 0,
  prize_pool_pcc  NUMERIC(20,8) DEFAULT 0,
  max_participants INTEGER DEFAULT 64,
  current_participants INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'registration' CHECK (status IN ('draft','registration','in_progress','completed','cancelled')),
  bracket_data    JSONB DEFAULT '{}',
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS leaderboards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  tenant_id       UUID REFERENCES tenants(id),
  board_type      TEXT NOT NULL CHECK (board_type IN ('global','club','contest','weekly','monthly','all_time')),
  score           NUMERIC(20,4) DEFAULT 0,
  wins            INTEGER DEFAULT 0,
  losses          INTEGER DEFAULT 0,
  streak          INTEGER DEFAULT 0,
  rank            INTEGER,
  period          TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lb_board ON leaderboards(board_type);
CREATE INDEX IF NOT EXISTS idx_lb_user2 ON leaderboards(user_id);

-- P2P game transactions
CREATE TABLE IF NOT EXISTS p2p_game_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id      UUID REFERENCES game_contests(id),
  pool_id         UUID REFERENCES betting_pools(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  direction       TEXT NOT NULL CHECK (direction IN ('entry_fee','prize_payout','stake','refund')),
  pcc_amount      NUMERIC(20,8) NOT NULL,
  balance_type    TEXT DEFAULT 'gaming' CHECK (balance_type IN ('main','gaming','betting')),
  status          TEXT DEFAULT 'completed',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Merchant analytics
CREATE TABLE IF NOT EXISTS merchant_analytics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  date            DATE NOT NULL,
  page_views      INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  orders_count    INTEGER DEFAULT 0,
  revenue_pcc     NUMERIC(20,8) DEFAULT 0,
  top_product_id  UUID REFERENCES products(id),
  metadata        JSONB DEFAULT '{}',
  UNIQUE(tenant_id, date)
);

-- ─── ADMIN GOVERNANCE TABLES ──────────────────────────────────────────

-- Admin users (extended profile)
CREATE TABLE IF NOT EXISTS admin_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) UNIQUE,
  admin_level     TEXT DEFAULT 'moderator' CHECK (admin_level IN ('moderator','admin','super_admin')),
  permissions     JSONB DEFAULT '[]',
  last_action_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Admin roles (RBAC)
CREATE TABLE IF NOT EXISTS admin_roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name       TEXT NOT NULL UNIQUE,
  description     TEXT,
  permissions     JSONB NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO admin_roles (role_name, description, permissions) VALUES
  ('super_admin', 'Full platform access', '["*"]'),
  ('admin', 'Platform management', '["users","clubs","transactions","treasury","withdrawals"]'),
  ('moderator', 'Content moderation', '["clubs","products","fraud"]')
ON CONFLICT (role_name) DO NOTHING;

-- Treasury reserves (global state)
CREATE TABLE IF NOT EXISTS treasury_reserves (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_pcc_minted    NUMERIC(20,8) DEFAULT 0,
  total_pcc_burned    NUMERIC(20,8) DEFAULT 0,
  total_pcc_circulating NUMERIC(20,8) DEFAULT 0,
  fiat_reserve_eur    NUMERIC(12,2) DEFAULT 0,
  reserve_ratio       REAL DEFAULT 1.0,
  last_audit_at       TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO treasury_reserves (total_pcc_minted, total_pcc_burned) VALUES (0, 0)
ON CONFLICT DO NOTHING;

-- Fraud flags
CREATE TABLE IF NOT EXISTS fraud_flags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  transaction_id  UUID,
  flag_type       TEXT NOT NULL CHECK (flag_type IN ('velocity','amount','pattern','geo','manual','system')),
  severity        TEXT DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  description     TEXT,
  status          TEXT DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','false_positive')),
  resolved_by     UUID REFERENCES users(id),
  resolved_at     TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ff_user ON fraud_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_ff_status ON fraud_flags(status);

-- Platform settings
CREATE TABLE IF NOT EXISTS platform_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key     TEXT NOT NULL UNIQUE,
  setting_value   JSONB NOT NULL,
  category        TEXT DEFAULT 'general',
  description     TEXT,
  updated_by      UUID REFERENCES users(id),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO platform_settings (setting_key, setting_value, category, description) VALUES
  ('min_withdrawal_pcc', '100', 'withdrawals', 'Minimum PCC for withdrawal'),
  ('max_withdrawal_pcc', '100000', 'withdrawals', 'Maximum PCC per withdrawal'),
  ('betting_enabled', 'true', 'gaming', 'Enable/disable betting globally'),
  ('gaming_enabled', 'true', 'gaming', 'Enable/disable gaming globally'),
  ('maintenance_mode', 'false', 'general', 'Platform maintenance mode')
ON CONFLICT (setting_key) DO NOTHING;

-- Approval logs
CREATE TABLE IF NOT EXISTS approval_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        UUID NOT NULL REFERENCES users(id),
  action          TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       UUID,
  previous_state  JSONB DEFAULT '{}',
  new_state       JSONB DEFAULT '{}',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_al_admin ON approval_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_al_entity ON approval_logs(entity_type, entity_id);

-- Payment rail configuration
CREATE TABLE IF NOT EXISTS payment_configs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rail            TEXT NOT NULL UNIQUE CHECK (rail IN ('stripe','transak','moonpay','circle','mobile_money')),
  is_enabled      BOOLEAN DEFAULT TRUE,
  config          JSONB DEFAULT '{}',
  supported_currencies JSONB DEFAULT '[]',
  fee_structure   JSONB DEFAULT '{}',
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawal controls
CREATE TABLE IF NOT EXISTS withdrawal_controls (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method          TEXT NOT NULL UNIQUE CHECK (method IN ('bank','mobile_money','crypto','paypal')),
  is_enabled      BOOLEAN DEFAULT TRUE,
  min_amount_pcc  NUMERIC(20,8) DEFAULT 100,
  max_amount_pcc  NUMERIC(20,8) DEFAULT 100000,
  daily_limit_pcc NUMERIC(20,8) DEFAULT 500000,
  fee_percentage  REAL DEFAULT 0,
  fee_fixed_pcc   NUMERIC(20,8) DEFAULT 0,
  processing_days INTEGER DEFAULT 3,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TRIGGERS ─────────────────────────────────────────────────────────

CREATE TRIGGER trg_mint_tx_updated BEFORE UPDATE ON mint_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_p2p_tx_updated BEFORE UPDATE ON p2p_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_wr_updated BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_club_profiles_updated BEFORE UPDATE ON club_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_game_contests_updated BEFORE UPDATE ON game_contests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_game_entries_updated BEFORE UPDATE ON game_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_betting_pools_updated BEFORE UPDATE ON betting_pools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
