import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabaseDatabase.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const isSupabaseMode = import.meta.env.VITE_DATA_BACKEND === 'supabase';

if (isSupabaseMode && !isSupabaseConfigured) {
  throw new Error('Supabase mode requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY');
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add the project URL and publishable key to .env.local');
  }
  return supabase;
}
