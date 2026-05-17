import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Detect if real Supabase credentials are configured
export const IS_REAL_SUPABASE = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseAnonKey.includes('placeholder') &&
  supabaseUrl.startsWith('http');

// Initialize the Supabase client safely to prevent fatal runtime bundle crashes when envs are empty.
const finalUrl = IS_REAL_SUPABASE ? supabaseUrl : 'https://placeholder-project.supabase.co';
const finalKey = IS_REAL_SUPABASE ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase = createClient(finalUrl, finalKey);
