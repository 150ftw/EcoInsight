-- EcoInsight Database Schema
-- Last Updated: 2026-04-15
-- This script initializes the tables, indexes, and RLS policies for the EcoInsight Economic Intelligence Engine.

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. TABLES
-- ============================================================

-- A. USERS TABLE
-- Handles both local (password) and social (Google/Apple) authentication.
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    password_hash TEXT, -- Null for social-auth only users
    profile_image TEXT,
    provider TEXT DEFAULT 'password', -- 'password', 'google', 'apple'
    provider_id TEXT, -- ID from the external provider
    onboarded BOOLEAN DEFAULT false,
    credits INTEGER DEFAULT 100,
    reset_token TEXT,
    reset_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. USER SETTINGS TABLE
-- Storing hierarchical configuration in JSONB for maximum flexibility.
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    ai_settings JSONB DEFAULT '{
        "model": "meta/llama-3.1-8b-instruct",
        "style": "Balanced",
        "tone": "Professional",
        "creativity": 0.5,
        "maxLength": "Medium",
        "language": "English"
    }',
    chat_settings JSONB DEFAULT '{
        "history": true,
        "autoSave": true,
        "autoTitles": true,
        "showTimestamps": false
    }',
    personalization JSONB DEFAULT '{
        "callMe": "",
        "respondHow": "",
        "memory": true,
        "watchlist": []
    }',
    appearance JSONB DEFAULT '{
        "theme": "dark",
        "accentColor": "#8b5cf6",
        "fontSize": "Medium",
        "compactMode": false
    }',
    profile JSONB DEFAULT '{
        "welcome_email_sent": false
    }'
);

-- C. CHATS TABLE
-- Stores AI conversations with rich JSONB message arrays.
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Session',
    messages JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. MARKET DATA CACHE TABLE
-- Shared global cache for the Search-Sync v7 architecture.
CREATE TABLE IF NOT EXISTS public.market_cache (
    cache_key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_market_cache_expires_at ON public.market_cache(expires_at);

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_cache ENABLE ROW LEVEL SECURITY;

-- USERS: Users can only see and update their own record
CREATE POLICY "Users can view own record" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = id);

-- USER_SETTINGS: Users can only see and update their own settings
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CHATS: Users can manage their own conversations
CREATE POLICY "Users can view own chats" ON public.chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chats" ON public.chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON public.chats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chats" ON public.chats FOR DELETE USING (auth.uid() = user_id);

-- MARKET_CACHE: Publicly readable for speed, but only writable by authenticated service roles
CREATE POLICY "Anyone can view market cache" ON public.market_cache FOR SELECT USING (true);
-- Note: Inserts/Updates to market_cache are handled via the Service Role key in the API handlers (bypasses RLS)

-- ============================================================
-- 5. UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
