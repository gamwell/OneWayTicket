import { createClient } from '@supabase/supabase-js'

// 1. On récupère les variables VERSION 2
// C'est le changement de nom ICI qui force Vercel à vider son cache
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL_V2
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY_V2

// 2. DEBUG : Pour voir en direct dans la console (F12)
console.log("--- DEBUG SUPABASE V2 ---")
console.log("URL V2 reçue :", supabaseUrl ? "OK" : "VIDE ❌")
console.log("KEY V2 reçue :", supabaseAnonKey ? "OK" : "VIDE ❌")

// 3. Sécurité
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ ATTENTION : Les variables VITE_SUPABASE_URL_V2 ou KEY_V2 sont absentes de Vercel Settings.")
}

// 4. Création du client
export const supabase = createClient(
  supabaseUrl || "https://placeholder.url", 
  supabaseAnonKey || "placeholder-key"
)