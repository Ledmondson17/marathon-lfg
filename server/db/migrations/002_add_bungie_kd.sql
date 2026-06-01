-- Migration: add K/D ratio column for Bungie-linked players
-- Run locally:  psql -d marathon_lfg -f server/db/migrations/002_add_bungie_kd.sql
-- Run on Railway: paste into the Postgres Data query box

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS bungie_kd DECIMAL(5, 2);
