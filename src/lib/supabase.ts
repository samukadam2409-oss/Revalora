import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Returns true if both the Supabase URL and Publishable/Anon key are set.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[REVALORA] Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY) are missing or empty. Please ensure .env.local is configured.'
  );
}

/**
 * Reusable Supabase client for REVALORA.
 * Safe fallback values prevent runtime crashes when environment variables are not yet defined.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-revalora.supabase.co',
  supabasePublishableKey || 'placeholder-publishable-key'
);

