import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// --- CONTEXTES ---
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

// --- COMPOSANT RACINE & STYLES ---
import App from "./App";
import "./index.css";

// --- OPTIMISATION DIAGNOSTIC (Mode Développement) ---
// Vérification plus précise de la configuration pour éviter les bugs silencieux
if (import.meta.env.DEV) {
  const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;
  
  // Une clé Supabase valide fait généralement plus de 100 caractères
  const isConfigValid = VITE_SUPABASE_URL && VITE_SUPABASE_ANON_KEY && VITE_SUPABASE_ANON_KEY.length > 20;

  console.groupCollapsed(
    isConfigValid ? "🚀 OWT : Système Opérationnel" : "⚠️ OWT : Erreur de Configuration"
  );
  console.log("URL Supabase:", VITE_SUPABASE_URL || "❌ MANQUANTE");
  console.log("Clé Anonyme:", VITE_SUPABASE_ANON_KEY ? "✅ CHARGÉE" : "❌ MANQUANTE");
  console.log("Mode:", import.meta.env.MODE);
  console.groupEnd();
}

// --- RENDU DE L'APPLICATION ---
const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      {/* 1. BrowserRouter : Gère l'historique et les URLs */}
      <BrowserRouter>
        
        {/* 2. AuthProvider : Identité de l'utilisateur (Couche supérieure) */}
        <AuthProvider>
          
          {/* 3. CartProvider : Gestion du panier (Dépend de l'identité si besoin) */}
          <CartProvider>
            
            {/* 4. App : Votre application bénéficie de tous les Contexts */}
            <App />
            
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  // Erreur critique si le DOM n'est pas prêt
  console.error("Impossible de trouver l'élément racine #root. Vérifiez votre index.html.");
}