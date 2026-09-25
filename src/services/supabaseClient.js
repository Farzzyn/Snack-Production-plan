import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://empvusvgpvoaxhmdwmqz.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_L8t3q0SoRd5Aqq0BWUkZJw_khNsiBcC';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseUrl.startsWith('http')
  );
};

export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

