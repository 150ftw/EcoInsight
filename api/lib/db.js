import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const keyToUse = supabaseServiceKey || supabaseAnonKey;

if (!supabaseUrl) {
  console.error('[Supabase DB] CRITICAL ERROR: SUPABASE_URL is undefined.');
}

if (!keyToUse) {
  console.error('[Supabase DB] CRITICAL ERROR: No Supabase API keys found.');
}

if (!supabaseServiceKey) {
  console.warn('[Supabase DB] Running with Anon Key. Some administrative actions may fail.');
}

export const supabase = (supabaseUrl && keyToUse) 
  ? createClient(supabaseUrl, keyToUse) 
  : null;
