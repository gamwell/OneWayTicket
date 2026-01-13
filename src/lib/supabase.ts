import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ce log nous aidera à debugger sur Vercel
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Attention : Les variables Supabase ne sont pas détectées.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);