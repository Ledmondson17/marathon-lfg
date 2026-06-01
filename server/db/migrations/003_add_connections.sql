-- Migration: connection requests between players
-- Run locally:  psql -d marathon_lfg -f server/db/migrations/003_add_connections.sql
-- Run on Railway: paste into the Postgres Data query box

CREATE TABLE IF NOT EXISTS connections (
  id           SERIAL PRIMARY KEY,
  requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status       VARCHAR(10) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent duplicate requests between the same two users
  UNIQUE (requester_id, recipient_id)
);
