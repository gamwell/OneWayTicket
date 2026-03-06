import { createClient } from "@supabase/supabase-js";

// ------------------------------------------------------
// 🔥 CONFIGURATION SUPABASE
// ------------------------------------------------------

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🕵️‍♂️ DEBUG : Vérifier où on se connecte (Affiche l'info dans la console du navigateur F12)
console.log("🔌 Connexion Supabase vers :", supabaseUrl ? supabaseUrl : "⚠️ URL MANQUANTE");

// 🛡️ LE GARDE DU CORPS : Vérification de sécurité
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "⛔️ ERREUR CRITIQUE : Les clés Supabase sont introuvables. Vérifie ton fichier .env"
  );
}

// ------------------------------------------------------
// 🔥 CLIENT SUPABASE UNIQUE
// ------------------------------------------------------

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // Garde la session active
    autoRefreshToken: true,    // Rafraîchit le token silencieusement
    detectSessionInUrl: true,  // Important pour OAuth (Google) et liens magiques
  },
  // Optionnel : Utile si vous avez beaucoup d'utilisateurs en simultané sur le realtime
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ------------------------------------------------------
// 🔥 UTILITAIRES PRATIQUES
// ------------------------------------------------------

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}