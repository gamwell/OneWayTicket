import { createClient } from '@supabase/supabase-js';

// Récupération via l'objet spécial de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// DIAGNOSTIC DE PRODUCTION (visible dans votre console F12)
console.log("--- Supabase Init Diagnosis ---");
console.log("URL présente :", !!supabaseUrl);
console.log("Key présente :", !!supabaseAnonKey);
if (supabaseUrl) console.log("Début URL :", supabaseUrl.substring(0, 10));

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ VARIABLES MANQUANTES : Vérifiez l'onglet Environment Variables sur Vercel.");
}

// On exporte le client seulement si les clés existent, sinon on exporte null
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;