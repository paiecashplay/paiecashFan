-- ═══════════════════════════════════════════════════════════════
-- 009_match_discussions.sql
-- Live Match Discussion Groups
-- ═══════════════════════════════════════════════════════════════

-- ─── Match Rooms ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS match_rooms (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id       text        NOT NULL,
  team_a         text        NOT NULL,
  team_b         text        NOT NULL,
  team_a_slug    text,
  team_b_slug    text,
  status         text        NOT NULL DEFAULT 'live' CHECK (status IN ('upcoming', 'live', 'ended')),
  match_minute   int         NOT NULL DEFAULT 0,
  score_a        int         NOT NULL DEFAULT 0,
  score_b        int         NOT NULL DEFAULT 0,
  kick_off_time  timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ─── Match Messages ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS match_messages (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       uuid        NOT NULL REFERENCES match_rooms(id) ON DELETE CASCADE,
  user_id       text        NOT NULL,
  username      text        NOT NULL,
  avatar_color  text,
  message       text        NOT NULL CHECK (length(message) > 0 AND length(message) <= 500),
  message_type  text        NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'reaction', 'challenge')),
  metadata      jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── Game Challenges ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS game_challenges (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id        uuid        NOT NULL REFERENCES match_rooms(id) ON DELETE CASCADE,
  challenger_id  text        NOT NULL,
  challenged_id  text        NOT NULL,
  game_id        text        NOT NULL,
  game_name      text        NOT NULL,
  status         text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ─── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_match_messages_room_created
  ON match_messages(room_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_match_rooms_status
  ON match_rooms(status);

CREATE INDEX IF NOT EXISTS idx_game_challenges_room
  ON game_challenges(room_id);

CREATE INDEX IF NOT EXISTS idx_game_challenges_challenged
  ON game_challenges(challenged_id, status);

-- ─── Supabase Realtime ──────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE match_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE match_rooms;
