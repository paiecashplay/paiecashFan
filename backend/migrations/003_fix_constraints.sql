-- ═══════════════════════════════════════════════════════════════════════
-- 003_fix_constraints.sql - Fix transaction type constraints & wallet balance
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Add pcc_balance column to wallets (if missing)
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS pcc_balance NUMERIC(20,8) DEFAULT 0;

-- 2. Drop the restrictive CHECK constraint on transactions.type
--    The old constraint only allowed: mint, spend, transfer, topup_initiated, topup_failed
--    We need to also support: send, receive, mint_crypto
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check
  CHECK (type IN ('mint','spend','transfer','topup_initiated','topup_failed','send','receive','mint_crypto'));

-- 3. Also expand internal_status to support 'success' (used by legacy code alongside 'complete')
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_internal_status_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_internal_status_check
  CHECK (internal_status IN ('pending','complete','failed','success'));

-- 4. Ensure idempotency_key column exists (was in schema but may have been missed in some deployments)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_tx_idempotency ON transactions(idempotency_key);
