-- Table des streams actifs
CREATE TABLE IF NOT EXISTS active_streams (
  id TEXT PRIMARY KEY,  -- UUID v4
  host_user_id TEXT NOT NULL,
  cloudflare_room_id TEXT UNIQUE NOT NULL,  -- ID de la room Cloudflare Calls
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',  -- matches, shopping, creator, general
  is_public INTEGER DEFAULT 1,
  max_participants INTEGER DEFAULT 10,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',  -- active, ended, error
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME,
  recording_enabled INTEGER DEFAULT 1,
  cloudflare_stream_uid TEXT,  -- UID du recording sur Cloudflare Stream
  
  FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_streams_host ON active_streams(host_user_id);
CREATE INDEX IF NOT EXISTS idx_streams_status ON active_streams(status, started_at);
CREATE INDEX IF NOT EXISTS idx_streams_category ON active_streams(category, is_public);
CREATE INDEX IF NOT EXISTS idx_streams_cloudflare_room ON active_streams(cloudflare_room_id);
