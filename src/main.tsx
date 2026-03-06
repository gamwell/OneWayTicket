import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// --- CONTEXTES ---
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

// --- COMPOSANT RACINE & STYLES ---
import App from "./App";
import "./index.css";

// --- DIAGNOSTIC DE CONFIGURATION (DEV UNIQUEMENT) ---
if (import.meta.env.DEV) {
  const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;

  const isConfigValid =
    Boolean(VITE_SUPABASE_URL) &&
    Boolean(VITE_SUPABASE_ANON_KEY) &&
    VITE_SUPABASE_ANON_KEY.length > 20;

  console.groupCollapsed(
    isConfigValid
      ? "🚀 Supabase : Configuration OK"
      : "⚠️ Supabase : Configuration manquante ou invalide"
  );
  console.log("📍 URL :", VITE_SUPABASE_URL || "Non configurée");
  console.log("🛠️ Mode :", import.meta.env.MODE);
  console.groupEnd();
}

// --- ENREGISTREMENT DU SERVICE WORKER (PWA) ---
// ⚠️ DÉSACTIVÉ TEMPORAIREMENT POUR TESTER LE LOGIN
/*
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("📦 Service Worker enregistré"))
      .catch((err) => console.error("❌ Erreur Service Worker :", err));
  });
}
*/

// --- RENDU DE L'APPLICATION ---
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error(
    "❌ ERREUR CRITIQUE : L'élément <div id='root'> est introuvable dans index.html."
  );
} else {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}