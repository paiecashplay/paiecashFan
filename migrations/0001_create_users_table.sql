-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,  -- UUID v4
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active INTEGER DEFAULT 1
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active, created_at);
