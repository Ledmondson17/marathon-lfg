-- Migration: add Bungie account linking fields to users table
-- Run locally:  psql -d marathon_lfg -f server/db/migrations/001_add_bungie_fields.sql
-- Run on Railway: paste into the Postgres Data query box

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS bungie_membership_id   TEXT,
  ADD COLUMN IF NOT EXISTS bungie_membership_type INTEGER,
  ADD COLUMN IF NOT EXISTS bungie_display_name    TEXT,
  ADD COLUMN IF NOT EXISTS bungie_access_token    TEXT,
  ADD COLUMN IF NOT EXISTS bungie_refresh_token   TEXT,
  ADD COLUMN IF NOT EXISTS bungie_token_expires_at TIMESTAMPTZ;
