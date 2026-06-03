-- Migration: add preferred maps to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS preferred_maps TEXT[];
