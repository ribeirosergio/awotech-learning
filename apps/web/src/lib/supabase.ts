import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { readSupabaseConfig } from './supabase-config';

const config = readSupabaseConfig(import.meta.env);
export const supabase = config
  ? createClient<Database>(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'implicit',
      },
    })
  : null;
export const authRedirect = (path: string) =>
  new URL(path, window.location.origin).href;
