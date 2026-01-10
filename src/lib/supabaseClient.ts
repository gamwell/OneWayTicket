// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Tentative de connexion Supabase avec URL :", supabaseUrl);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ ERREUR : Les variables d'environnement ne sont pas chargées !");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);