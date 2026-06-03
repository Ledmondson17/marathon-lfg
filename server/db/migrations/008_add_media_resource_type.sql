-- Migration: track whether media is an image or video
ALTER TABLE media
  ADD COLUMN IF NOT EXISTS resource_type TEXT DEFAULT 'image';
