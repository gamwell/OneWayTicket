import { createClient } from '@supabase/supabase-js';

// Récupération via l'objet spécial de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// DIAGNOSTIC EN FONCTION DE L'ENVIRONNEMENT
if (import.meta.env.DEV) {
  // Seulement en développement
  console.log("--- Supabase Init Diagnosis ---");
  console.log("URL présente :", !!supabaseUrl);
  console.log("Key présente :", !!supabaseAnonKey);
  if (supabaseUrl) console.log("URL complète :", supabaseUrl);
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ VARIABLES MANQUANTES :");
    console.error("1. Créez un fichier .env.local à la racine");
    console.error("2. Ajoutez :");
    console.error("   VITE_SUPABASE_URL=votre_url");
    console.error("   VITE_SUPABASE_ANON_KEY=votre_cle");
  }
}

// Vérification en production aussi, mais sans console.error qui pourrait exposer des infos
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Variables Supabase non définies - l'authentification ne fonctionnera pas");
}

// Création du client avec gestion d'erreur améliorée
let supabaseInstance = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    console.log("✅ Client Supabase initialisé avec succès");
  }
} catch (error) {
  console.error("❌ Erreur lors de l'initialisation de Supabase:", error);
}

// Export avec fallback pour développement
export const supabase = supabaseInstance;

// Fonction utilitaire pour vérifier l'état
export const isSupabaseConfigured = () => {
  return !!supabaseInstance;
};