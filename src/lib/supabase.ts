import { createClient } from '@supabase/supabase-js';

// Diagnostic temporaire
console.log("Diagnostic des variables Vercel :");
console.log("URL présente ?", !!import.meta.env.VITE_SUPABASE_URL);
console.log("Clé présente ?", !!import.meta.env.VITE_SUPABASE_ANON_KEY);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// On vérifie si les variables sont undefined ou vides
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERREUR : Les variables VITE_ ne sont pas lues par l'application.");
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);