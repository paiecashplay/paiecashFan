-- Admin controls which leagues are active for betting
CREATE TABLE IF NOT EXISTS league_configs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id         INTEGER UNIQUE NOT NULL,
  league_name       TEXT NOT NULL,
  country           TEXT NOT NULL,
  logo_url          TEXT,
  is_active         BOOLEAN DEFAULT FALSE,
    -- Master toggle: if FALSE no betting allowed for this league
  betting_enabled   BOOLEAN DEFAULT FALSE,
    -- Sub-toggle: enable/disable PCC staking specifically
  prediction_enabled BOOLEAN DEFAULT TRUE,
    -- Free predictions still allowed when betting_enabled = false
  min_stake_pcc     NUMERIC(20,8) DEFAULT 10,
  max_stake_pcc     NUMERIC(20,8) DEFAULT 10000,
  max_payout_pcc    NUMERIC(20,8) DEFAULT 100000,
  house_edge_pct    REAL DEFAULT 5,
    -- Platform keeps 5% of losing stakes
  updated_by        UUID REFERENCES users(id),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the 4 leagues immediately after creating table:
INSERT INTO league_configs
  (league_id, league_name, country, is_active, betting_enabled)
VALUES
  (39,  'Premier League', 'England',   FALSE, FALSE),
  (140, 'La Liga',        'Spain',     FALSE, FALSE),
  (78,  'Bundesliga',     'Germany',   FALSE, FALSE),
  (135, 'Serie A',        'Italy',     FALSE, FALSE)
ON CONFLICT (league_id) DO NOTHING;

-- A "game" is one real football match made available for betting
CREATE TABLE IF NOT EXISTS betting_games (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id         INTEGER NOT NULL,
  league_name       TEXT NOT NULL,

  -- Football API data
  fixture_id        INTEGER UNIQUE NOT NULL,
  home_team         TEXT NOT NULL,
  home_team_logo    TEXT,
  away_team         TEXT NOT NULL,
  away_team_logo    TEXT,
  kickoff_at        TIMESTAMPTZ NOT NULL,
  venue             TEXT,
  round             TEXT,

  -- Admin controls
  is_active         BOOLEAN DEFAULT TRUE,
    -- Admin can deactivate a game after creating it
  betting_open      BOOLEAN DEFAULT TRUE,
    -- FALSE = no new bets accepted (auto-closes at kickoff)
  betting_closes_at TIMESTAMPTZ,
    -- Auto-calculated: kickoff_at - 5 minutes (no late betting)

  -- Game state
  status            TEXT DEFAULT 'scheduled'
    CHECK (status IN (
      'scheduled',   -- not started
      'live',        -- in progress
      'finished',    -- full time
      'cancelled',   -- match cancelled → all bets refunded
      'postponed'    -- postponed → all bets refunded
    )),
  home_score        INTEGER,
  away_score        INTEGER,
  minute            INTEGER,   -- live match minute

  -- Settlement
  settled           BOOLEAN DEFAULT FALSE,
  settled_at        TIMESTAMPTZ,
  settled_by        UUID REFERENCES users(id),
  settlement_notes  TEXT,

  -- Stats
  total_bets        INTEGER DEFAULT 0,
  total_staked_pcc  NUMERIC(20,8) DEFAULT 0,
  total_paid_pcc    NUMERIC(20,8) DEFAULT 0,
  platform_revenue  NUMERIC(20,8) DEFAULT 0,

  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_league     ON betting_games(league_id);
CREATE INDEX IF NOT EXISTS idx_games_kickoff    ON betting_games(kickoff_at);
CREATE INDEX IF NOT EXISTS idx_games_status     ON betting_games(status);
CREATE INDEX IF NOT EXISTS idx_games_fixture    ON betting_games(fixture_id);

-- Markets are the specific questions fans can bet on for each game
CREATE TABLE IF NOT EXISTS betting_markets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id           UUID NOT NULL REFERENCES betting_games(id)
                    ON DELETE CASCADE,

  market_type       TEXT NOT NULL
    CHECK (market_type IN (
      'match_winner',      -- Who wins? (Home / Draw / Away)
      'top_scorer',        -- Which player scores first?
      'both_teams_score',  -- Yes / No
      'clean_sheet',       -- Which team keeps a clean sheet?
      'man_of_the_match',  -- Best player (from options)
      'over_under_goals',  -- Over 2.5 / Under 2.5 goals
      'correct_score',     -- Exact final score
      'custom'             -- Admin creates any custom market
    )),

  question          TEXT NOT NULL,
  description       TEXT,
  options           JSONB NOT NULL DEFAULT '[]',
  status            TEXT DEFAULT 'open'
    CHECK (status IN (
      'open',      -- accepting bets
      'locked',    -- no new bets (game started)
      'settled',   -- result known, payouts done
      'voided'     -- cancelled, all stakes refunded
    )),
  winning_option_id TEXT,
  total_staked_pcc  NUMERIC(20,8) DEFAULT 0,
  total_payout_pcc  NUMERIC(20,8) DEFAULT 0,
  is_featured       BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_markets_game ON betting_markets(game_id);
CREATE INDEX IF NOT EXISTS idx_markets_type ON betting_markets(market_type);

-- Individual bets placed by fans
CREATE TABLE IF NOT EXISTS bets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  game_id           UUID NOT NULL REFERENCES betting_games(id),
  market_id         UUID NOT NULL REFERENCES betting_markets(id),

  option_id         TEXT NOT NULL,
  option_label      TEXT NOT NULL,
  odds_at_placement REAL NOT NULL,

  mode              TEXT NOT NULL
    CHECK (mode IN ('prediction', 'stake')),

  stake_pcc         NUMERIC(20,8) NOT NULL DEFAULT 0,
  potential_payout  NUMERIC(20,8) NOT NULL,
  idempotency_key   TEXT UNIQUE NOT NULL,

  status            TEXT DEFAULT 'pending'
    CHECK (status IN (
      'pending',    -- game not settled yet
      'won',        -- correct prediction/bet
      'lost',       -- wrong
      'void',       -- game cancelled → stake refunded
      'refunded'    -- edge case refund
    )),
  payout_pcc        NUMERIC(20,8) DEFAULT 0,
  payout_tx_id      UUID REFERENCES transactions(id),
  settled_at        TIMESTAMPTZ,
  placed_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bets_user    ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_game    ON bets(game_id);
CREATE INDEX IF NOT EXISTS idx_bets_market  ON bets(market_id);
CREATE INDEX IF NOT EXISTS idx_bets_status  ON bets(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bets_unique_market
  ON bets(user_id, market_id);

-- Tracks PCC movements for all betting activity
CREATE TABLE IF NOT EXISTS betting_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  bet_id          UUID REFERENCES bets(id),
  game_id         UUID REFERENCES betting_games(id),
  type            TEXT NOT NULL
    CHECK (type IN (
      'stake_deducted',    -- PCC taken from fan wallet
      'payout_sent',       -- PCC sent to fan wallet (win)
      'stake_refunded',    -- PCC returned (void/cancel)
      'prediction_reward'  -- Free prediction win reward
    )),
  pcc_amount      NUMERIC(20,8) NOT NULL,
  circle_tx_id    TEXT,
  status          TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','complete','failed')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_betting_tx_user ON betting_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_betting_tx_bet  ON betting_transactions(bet_id);

-- Stores football API responses to avoid hitting rate limits
CREATE TABLE IF NOT EXISTS api_cache (
  cache_key       TEXT PRIMARY KEY,
  data            JSONB NOT NULL,
  fetched_at      TIMESTAMPTZ DEFAULT NOW(),
  ttl_seconds     INTEGER DEFAULT 600
);

-- Auto-triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_betting_games_updated ON betting_games;
CREATE TRIGGER trg_betting_games_updated
  BEFORE UPDATE ON betting_games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_markets_updated ON betting_markets;
CREATE TRIGGER trg_markets_updated
  BEFORE UPDATE ON betting_markets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_bets_updated ON bets;
CREATE TRIGGER trg_bets_updated
  BEFORE UPDATE ON bets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
