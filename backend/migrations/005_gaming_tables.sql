-- ═══════════════════════════════════════════════════════════════
-- Migration 005 - Gaming Tables
-- Target: Supabase PostgreSQL
-- Run manually: Supabase Dashboard > SQL Editor > Paste & Run
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS contests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT DEFAULT '',
  game_id         TEXT NOT NULL,
  contest_type    TEXT DEFAULT 'arcade',
  sport           TEXT,
  status          TEXT DEFAULT 'upcoming'
                  CHECK (status IN ('upcoming','live','completed','cancelled')),
  entry_fee_pcc   NUMERIC(12,2) DEFAULT 0,
  prize_pool_pcc  NUMERIC(12,2) DEFAULT 0,
  max_entries     INTEGER DEFAULT 0,
  current_entries INTEGER DEFAULT 0,
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contest_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id      UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),
  entry_fee_paid  NUMERIC(12,2) DEFAULT 0,
  selections      JSONB DEFAULT '{}',
  score           NUMERIC(10,2) DEFAULT 0,
  rank            INTEGER,
  prize_won       NUMERIC(12,2) DEFAULT 0,
  status          TEXT DEFAULT 'entered'
                  CHECK (status IN ('entered','active','won','lost','refunded')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contest_id, user_id)
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  game_id         TEXT NOT NULL,
  bet_amount      NUMERIC(12,2) NOT NULL,
  result          TEXT NOT NULL CHECK (result IN ('win','loss','refund')),
  payout          NUMERIC(12,2) DEFAULT 0,
  net_pnl         NUMERIC(12,2) DEFAULT 0,
  game_data       JSONB DEFAULT '{}',
  balance_before  NUMERIC(12,2),
  balance_after   NUMERIC(12,2),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contest_entries_user ON contest_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_entries_contest ON contest_entries(contest_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game ON game_sessions(game_id, created_at DESC);

-- Seed real South Africa themed contests
INSERT INTO contests (title, description, game_id, contest_type, status, entry_fee_pcc, prize_pool_pcc, max_entries, current_entries)
VALUES
  (
    'Aviator - Daily Climb',
    'Watch the multiplier fly. Cash out before it crashes. Top 3 multipliers win the prize pool.',
    'aviator', 'arcade', 'live', 5, 500, 200, 128
  ),
  (
    'Lucky Slots - Jackpot Round',
    'Spin the reels, hit the jackpot. Three matching symbols wins big PCC.',
    'slots', 'arcade', 'live', 2, 200, 100, 54
  ),
  (
    'Roulette Royale - Weekend Special',
    'Place your bets on numbers, colors or dozens. European roulette, PCC stakes.',
    'roulette', 'arcade', 'live', 3, 300, 50, 32
  ),
  (
    'SA20 Cricket Fantasy - Round 1',
    'Pick your dream XI from SA20 squads. Score points from real match stats.',
    'cricket', 'fantasy', 'upcoming', 10, 1000, 500, 0
  ),
  (
    'Springboks Predictor - Rugby Championship',
    'Predict Springboks match outcomes and lineups. South Africa vs All Blacks.',
    'rugby', 'prediction', 'upcoming', 5, 750, 300, 0
  ),
  (
    'Bafana Bafana - AFCON Qualifier Predictor',
    'Predict Bafana Bafana results in the upcoming AFCON qualification matches.',
    'football', 'prediction', 'upcoming', 5, 600, 200, 0
  ),
  (
    'Battle Royale - Weekend Tournament',
    'Last squad standing wins the entire prize pool. 100 player elimination.',
    'battle-royale', 'tournament', 'upcoming', 15, 2000, 100, 0
  ),
  (
    'Speed Puzzle Challenge - Daily',
    'Solve puzzles faster than all other players. Timed rounds, instant PCC.',
    'mobile-puzzle', 'arcade', 'live', 1, 100, 1000, 320
  )
ON CONFLICT DO NOTHING;
