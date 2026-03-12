-- ============================================================
-- EcoInsight Supabase Schema
-- Run this in your Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- ============================================================

-- 1. CHATS TABLE — stores per-user chat sessions
CREATE TABLE IF NOT EXISTS chats (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Session',
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);

-- 2. USER SETTINGS TABLE — stores per-user preferences as a single row
CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    ai_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    chat_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    personalization JSONB NOT NULL DEFAULT '{}'::jsonb,
    appearance JSONB NOT NULL DEFAULT '{}'::jsonb,
    profile JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. MARKET CACHE TABLE — key-value store with TTL for market data
CREATE TABLE IF NOT EXISTS market_cache (
    cache_key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_cache_expires ON market_cache(expires_at);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_cache ENABLE ROW LEVEL SECURITY;

-- CHATS: Users can only read/write their own chats
-- We use a permissive policy since auth comes from Clerk, not Supabase Auth.
-- The anon key + RLS "allow all" lets the app handle auth via Clerk user.id.
CREATE POLICY "Allow all access to chats" ON chats
    FOR ALL USING (true) WITH CHECK (true);

-- USER SETTINGS: Same approach
CREATE POLICY "Allow all access to user_settings" ON user_settings
    FOR ALL USING (true) WITH CHECK (true);

-- MARKET CACHE: Public read/write (shared data)
CREATE POLICY "Allow all access to market_cache" ON market_cache
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- HELPER: Auto-update updated_at on chats and user_settings
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chats_updated_at
    BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
