-- Table des participants aux streams
CREATE TABLE IF NOT EXISTS stream_participants (
  id TEXT PRIMARY KEY,  -- UUID v4
  stream_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'participant',  -- host, moderator, participant
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  left_at DATETIME,
  is_active INTEGER DEFAULT 1,
  mic_enabled INTEGER DEFAULT 1,
  camera_enabled INTEGER DEFAULT 1,
  screen_sharing INTEGER DEFAULT 0,
  
  FOREIGN KEY (stream_id) REFERENCES active_streams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(stream_id, user_id)  -- Un user ne peut rejoindre qu'une fois un stream
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_participants_stream ON stream_participants(stream_id, is_active);
CREATE INDEX IF NOT EXISTS idx_participants_user ON stream_participants(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_participants_role ON stream_participants(stream_id, role);
