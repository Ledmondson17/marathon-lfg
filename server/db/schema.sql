-- Run this file once to set up your database tables.
-- In your terminal: psql -d your_database_name -f server/db/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  username    VARCHAR(20) UNIQUE NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    TEXT NOT NULL,             -- bcrypt hash, never plain text
  avatar_url  TEXT,
  bio         TEXT,
  playstyle   TEXT,
  availability TEXT,
  region      VARCHAR(100),
  timezone    VARCHAR(50),
  platforms   TEXT[],                    -- e.g. ['ps5', 'pc']
  top_classes TEXT[],                    -- e.g. ['Recon', 'Assassin', 'Triage']
  socials     JSONB DEFAULT '{}',        -- { twitch: '...', discord: '...', ... }
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  public_id  TEXT NOT NULL,             -- Cloudinary asset ID for deletion
  created_at TIMESTAMPTZ DEFAULT NOW()
);
