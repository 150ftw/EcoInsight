import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const keyToUse = supabaseServiceKey || supabaseAnonKey;

if (!supabaseUrl || !keyToUse) {
  console.error('[Supabase DB] Missing environment variables: VITE_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY');
}

if (!supabaseServiceKey) {
  console.warn('[Supabase DB] Running with Anon Key. Some administrative actions may fail.');
}

export const supabase = createClient(supabaseUrl, keyToUse);
