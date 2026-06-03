-- Migration: add optional intro message to connection requests
ALTER TABLE connections
  ADD COLUMN IF NOT EXISTS message TEXT;
