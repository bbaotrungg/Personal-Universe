-- Migration 0003: Cloudinary media support
-- Adds columns to track Cloudinary asset public_id, direct URL, and resource_type

ALTER TABLE media_records ADD COLUMN cloudinary_public_id TEXT;
ALTER TABLE media_records ADD COLUMN cloudinary_url TEXT;
ALTER TABLE media_records ADD COLUMN resource_type TEXT DEFAULT 'image';

CREATE INDEX IF NOT EXISTS idx_media_cloudinary_public_id ON media_records (cloudinary_public_id);
