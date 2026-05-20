-- ═══════════════════════════════════════════════════════════════
-- 011_club_channels.sql
-- Persistent Dedicated Club Community Channels
-- ═══════════════════════════════════════════════════════════════

-- ─── Club Messages ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS club_messages (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id       text        NOT NULL,
  user_id       text        NOT NULL,
  username      text        NOT NULL,
  avatar_color  text,
  message       text        NOT NULL CHECK (length(message) > 0 AND length(message) <= 1000),
  message_type  text        NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'reaction', 'challenge')),
  is_pinned     boolean     NOT NULL DEFAULT false,
  metadata      jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_club_messages_club_created
  ON club_messages(club_id, created_at ASC);

-- ─── Supabase Realtime ──────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE club_messages;
