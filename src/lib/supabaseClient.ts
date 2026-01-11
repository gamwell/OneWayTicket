import { createClient } from '@supabase/supabase-js'

// 1. On récupère les variables (Version V2 pour forcer le cache Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL_V2
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY_V2

// 2. DEBUG : On affiche ce qu'on reçoit dans la console (F12)
console.log("--- DEBUG SUPABASE V2 ---")
console.log("URL reçue :", supabaseUrl ? "OK (Présente)" : "ERREUR (Vide !)")
console.log("KEY reçue :", supabaseAnonKey ? "OK (Présente)" : "ERREUR (Vide !)")

// 3. Gestion d'erreur plus douce
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ ATTENTION : Les variables Supabase V2 sont manquantes dans Vercel Settings.")
}

// 4. Création du client (avec sécurité en cas de vide)
export const supabase = createClient(
  supabaseUrl || "https://placeholder.url", 
  supabaseAnonKey || "placeholder-key"
)