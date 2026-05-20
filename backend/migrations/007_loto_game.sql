-- ═══════════════════════════════════════════════════════════════
-- 007_loto_game.sql - LOTO Bingo Game Schema
-- Creates tables for rooms, players, draws, and leaderboard
-- ═══════════════════════════════════════════════════════════════

-- Custom ENUM types for game states
DO $$ BEGIN
  CREATE TYPE loto_room_status AS ENUM ('waiting', 'in_progress', 'finished');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE loto_game_mode AS ENUM ('solo', 'multiplayer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE loto_win_pattern AS ENUM ('line', 'column', 'diagonal', 'blackout');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── LOTO ROOMS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loto_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(8) UNIQUE NOT NULL,
  host_user_id UUID NOT NULL,
  status loto_room_status DEFAULT 'waiting',
  game_mode loto_game_mode DEFAULT 'multiplayer',
  win_pattern loto_win_pattern DEFAULT 'line',
  max_players INT DEFAULT 8 CHECK (max_players >= 1 AND max_players <= 8),
  draw_interval_seconds INT DEFAULT 5 CHECK (draw_interval_seconds >= 1 AND draw_interval_seconds <= 60),
  current_drawn_numbers INT[] DEFAULT '{}',
  draw_pool INT[] DEFAULT '{}',
  winner_user_id UUID,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loto_rooms_code ON loto_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_loto_rooms_status ON loto_rooms(status);
CREATE INDEX IF NOT EXISTS idx_loto_rooms_host ON loto_rooms(host_user_id);

-- ─── LOTO PLAYERS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loto_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES loto_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username VARCHAR(100) DEFAULT 'Player',
  card_numbers INT[][] NOT NULL,
  marked_numbers INT[] DEFAULT '{}',
  is_winner BOOLEAN DEFAULT FALSE,
  called_loto BOOLEAN DEFAULT FALSE,
  score INT DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_loto_players_room ON loto_players(room_id);
CREATE INDEX IF NOT EXISTS idx_loto_players_user ON loto_players(user_id);

-- ─── LOTO DRAWS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loto_draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES loto_rooms(id) ON DELETE CASCADE,
  number_drawn INT NOT NULL CHECK (number_drawn >= 1 AND number_drawn <= 75),
  drawn_at TIMESTAMPTZ DEFAULT NOW(),
  draw_order INT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_loto_draws_room ON loto_draws(room_id);

-- ─── LOTO LEADERBOARD ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loto_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  username VARCHAR(100) DEFAULT 'Player',
  total_games INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  total_score INT DEFAULT 0,
  best_win_speed_draws INT,
  win_rate NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_games > 0 
      THEN (total_wins::numeric / total_games) * 100 
      ELSE 0 
    END
  ) STORED,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loto_leaderboard_user ON loto_leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_loto_leaderboard_wins ON loto_leaderboard(total_wins DESC);
CREATE INDEX IF NOT EXISTS idx_loto_leaderboard_score ON loto_leaderboard(total_score DESC);

-- ─── LOTO GAME HISTORY ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS loto_game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  room_id UUID NOT NULL,
  room_code VARCHAR(8),
  game_mode loto_game_mode,
  win_pattern loto_win_pattern,
  is_winner BOOLEAN DEFAULT FALSE,
  total_draws INT DEFAULT 0,
  score INT DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loto_history_user ON loto_game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_loto_history_date ON loto_game_history(played_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- Auto-clean stale rooms older than 24 hours
-- ═══════════════════════════════════════════════════════════════
-- (Run via cron or manual cleanup)
