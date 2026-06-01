-- Migration: add salvage hunting tags to users
-- Run locally:  psql -d marathon_lfg -f server/db/migrations/004_add_salvage.sql
-- Run on Railway: paste into the Postgres Data query box

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS looking_for_salvage TEXT[];
