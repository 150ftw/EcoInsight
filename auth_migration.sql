-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- We'll use UUID strings or custom IDs
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- Null for Google OAuth users
    first_name TEXT,
    last_name TEXT,
    profile_image TEXT,
    provider TEXT NOT NULL DEFAULT 'local', -- 'local' or 'google'
    provider_id TEXT UNIQUE, -- Stores Google Subject ID
    terms_accepted BOOLEAN NOT NULL DEFAULT false,
    onboarded BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ENABLE RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

-- 4. TRIGGER FOR UPDATED_AT
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
