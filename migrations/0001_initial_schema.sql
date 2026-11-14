-- Cloudflare D1 Initial Migration: Personal Universe
-- Preserves Draft vs Published isolation and secure sessions

CREATE TABLE IF NOT EXISTS content (
  key TEXT PRIMARY KEY CHECK (key IN ('draft', 'published')),
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS media_records (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  uploaded_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_media_filename ON media_records (filename);
