import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 1. On récupère les variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Vérification de sécurité CRUCIALE
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('ERREUR CRITIQUE : Les variables d\'environnement Supabase (URL ou KEY) sont manquantes.');
}

// 3. Singleton pour éviter les instances multiples (GoTrueClient warning)
// On déclare une variable à l'extérieur pour la réutiliser
let supabaseInstance: SupabaseClient | null = null;

if (!supabaseInstance) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'onewayticket-auth-token', // Clé personnalisée pour éviter les conflits
    },
  });
}

export const supabase = supabaseInstance;