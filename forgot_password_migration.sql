-- Migration: Add Forgot Password functionality
-- Run this in your Supabase SQL Editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_expires_at TIMESTAMPTZ;

-- Add index for token lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
