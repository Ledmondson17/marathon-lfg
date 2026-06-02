-- Migration: add preferred session activity to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS preferred_activity TEXT;
