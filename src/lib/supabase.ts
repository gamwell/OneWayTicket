import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 1. Récupération des variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Vérification de sécurité (avec log informatif)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Variables d'environnement manquantes ! Vérifiez votre fichier .env");
  throw new Error('ERREUR CRITIQUE : Configuration Supabase incomplète.');
}

// 3. Création de l'instance
// Note : Dans un module ESM (Vite), le code du fichier n'est exécuté qu'UNE SEULE FOIS.
// On peut donc créer le client directement, il sera partagé par toute l'application.
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'onewayticket-auth-token', // Parfait pour votre application
    storage: window.localStorage, // On force explicitement l'utilisation du localStorage
  },
});

// 4. Log de confirmation (utile pour votre erreur import.meta)
console.log("✅ Supabase Initialisé sur :", supabaseUrl);