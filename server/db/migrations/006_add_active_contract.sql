-- Migration: add active contract field to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active_contract TEXT;
