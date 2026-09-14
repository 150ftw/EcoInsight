-- ============================================================
-- SECURITY FIX: Lock down users/chats/user_settings to service-role only
-- ============================================================
-- RUN THIS IN THE SUPABASE SQL EDITOR (Dashboard > SQL Editor > New Query).
--
-- What was wrong: the original schema.sql policies on users/chats/
-- user_settings used auth.uid(), which only resolves to a real value when a
-- request is authenticated through Supabase's own Auth system. This app
-- never uses that — it has its own JWT cookie auth (api/auth.js) — so
-- auth.uid() was always NULL for every request the app ever made. A
-- correctly-enforced RLS setup should have default-denied everything as a
-- result, but a direct test with the public anon key showed the opposite:
-- unrestricted read access to all rows in `chats` and `user_settings`
-- (confirmed live: 162 chat rows, 44 settings rows, readable by anyone with
-- the anon key — which is shipped in the browser bundle by design).
--
-- The fix: all application access to these three tables now goes through
-- server-side API routes (api/chats.js, api/settings.js, api/auth.js) using
-- the service-role key, which bypasses RLS by design and scopes every query
-- to req's authenticated user_id in application code. Nothing in the
-- browser should be able to read or write these tables directly anymore, so
-- this migration removes every anon/authenticated-facing policy and grant.

-- Re-assert RLS is enabled (idempotent, safe to re-run)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Drop the old auth.uid()-based policies — they were not actually
-- restricting anything in practice, and are misleading to leave in place.
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can view own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can insert own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can delete own chats" ON public.chats;

-- No replacement policies are added. With RLS enabled and zero policies for
-- anon/authenticated roles, PostgREST denies all access by default — only
-- the service-role key (used exclusively by the api/ serverless functions)
-- can read or write these tables.

-- Defense in depth: also revoke the default PostgREST table grants, so
-- there's no ambiguity even if a policy is accidentally reintroduced later.
REVOKE ALL ON public.users FROM anon, authenticated;
REVOKE ALL ON public.user_settings FROM anon, authenticated;
REVOKE ALL ON public.chats FROM anon, authenticated;

-- market_cache is intentionally left as-is (public, non-PII financial data,
-- anon SELECT is fine). Note that after this migration, any direct
-- browser-side writes to market_cache will start failing silently (that
-- code already swallows errors) since only the SELECT policy exists for
-- anon — this only affects a secondary client-side price cache; the
-- primary server-side cache in api/ticker.js is unaffected.
