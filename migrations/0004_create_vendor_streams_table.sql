-- Table pour les streams des vendeurs (Live Shopping)
CREATE TABLE IF NOT EXISTS vendor_streams (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  vendor_username TEXT NOT NULL,
  vendor_display_name TEXT NOT NULL,
  club_id TEXT NOT NULL,
  club_name TEXT NOT NULL,
  
  -- Informations du stream
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'shopping', -- shopping, match, creator, general
  
  -- Configuration Cloudflare Stream
  cloudflare_stream_uid TEXT UNIQUE NOT NULL,
  cloudflare_rtmps_url TEXT NOT NULL,
  cloudflare_stream_key TEXT NOT NULL,
  cloudflare_playback_url TEXT NOT NULL,
  
  -- Statut et métriques
  status TEXT CHECK(status IN ('starting', 'live', 'ended', 'error')) DEFAULT 'starting',
  viewers_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME,
  duration_seconds INTEGER DEFAULT 0,
  
  -- Métadonnées
  is_public INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  recording_url TEXT, -- URL de la VOD après la fin du stream
  
  FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_vendor_streams_status ON vendor_streams(status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_streams_vendor ON vendor_streams(vendor_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_streams_club ON vendor_streams(club_id, status);
CREATE INDEX IF NOT EXISTS idx_vendor_streams_category ON vendor_streams(category, status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_streams_featured ON vendor_streams(is_featured, status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_streams_cloudflare_uid ON vendor_streams(cloudflare_stream_uid);
