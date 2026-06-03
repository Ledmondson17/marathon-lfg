-- Migration: add mic status to users (NULL = not specified, true = has mic, false = no mic)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS has_mic BOOLEAN;
