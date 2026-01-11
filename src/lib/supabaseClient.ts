import { createClient } from '@supabase/supabase-js'

// 1. On récupère les variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL_V2
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY_V2

// 2. DEBUG : On affiche ce qu'on reçoit dans la console (F12)
console.log("--- DEBUG SUPABASE ---")
console.log("URL reçue :", supabaseUrl ? "OK (Présente)" : "ERREUR (Vide !)")
console.log("KEY reçue :", supabaseAnonKey ? "OK (Présente)" : "ERREUR (Vide !)")

// 3. Gestion d'erreur plus douce (pour ne pas casser le build si vide)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ ATTENTION : Les variables Supabase sont manquantes.")
  // On met des valeurs vides temporaires pour éviter le crash blanc, 
  // mais la connexion ne marchera pas tant que ce n'est pas réglé sur Vercel.
}

// 4. Création du client (avec une sécurité en cas de vide)
export const supabase = createClient(
  supabaseUrl || "https://placeholder.url", 
  supabaseAnonKey || "placeholder-key"
)