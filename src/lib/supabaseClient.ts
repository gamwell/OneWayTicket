import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log de diagnostic (uniquement en développement)
if (import.meta.env.DEV) {
  console.log("Tentative de connexion Supabase avec URL :", supabaseUrl);
}

// Vérification stricte des variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ ERREUR CRITIQUE : Les variables d'environnement VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY sont manquantes !");
  
  // On peut jeter une erreur plus descriptive ou exporter un client vide pour éviter le crash
  if (import.meta.env.PROD) {
    console.warn("L'application tourne en production sans configuration de base de données.");
  }
}

// Initialisation sécurisée
// Si les variables sont absentes, on exporte null pour éviter l'erreur "is required"
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as any;

// Note : Si 'supabase' est null, vos appels de fonctions (ex: supabase.from('...')) 
// devront être protégés par une condition.