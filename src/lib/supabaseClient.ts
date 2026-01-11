import { createClient } from '@supabase/supabase-js'

// Récupération des variables d'environnement standards pour Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification de sécurité stricte
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('ERREUR CRITIQUE : Les variables d\'environnement Supabase sont manquantes.');
}

// Initialisation du client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);