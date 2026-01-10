import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// --- COMPOSANTS CRITIQUES (Garder légers) ---
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute"; 
import { PublicRoute } from "./components/PublicRoute";
import { AutoLogout } from "./components/AutoLogout"; 

// --- PAGES (Toutes en Lazy) ---
const HomePage = lazy(() => import("./pages/HomePage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
// ... (gardez tous vos autres lazy imports identiques)

// --- LOADER ULTRA-LÉGER (Optimisé SVG) ---
const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0f172a] z-[9999]">
    <div className="relative w-16 h-16">
      {/* Cercle de chargement en SVG pour éviter les calculs CSS complexes au démarrage */}
      <svg className="animate-spin w-full h-full" viewBox="0 0 50 50">
        <circle 
          className="opacity-25" 
          cx="25" cy="25" r="20" 
          stroke="currentColor" 
          strokeWidth="4" 
          fill="none" 
        />
        <circle 
          className="text-cyan-400" 
          cx="25" cy="25" r="20" 
          stroke="currentColor" 
          strokeWidth="4" 
          strokeDasharray="31.4 31.4" 
          fill="none" 
        />
      </svg>
    </div>
    <p className="text-cyan-400 font-black uppercase tracking-[0.3em] text-[9px] mt-6 animate-pulse">
      Initialisation Sécurisée...
    </p>
  </div>
);



export default function App() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans">
      <AutoLogout />
      
      {/* On entoure tout le contenu, y compris Navbar/Footer si besoin, 
          pour que le loader s'affiche immédiatement pendant que le JS se télécharge */}
      <Suspense fallback={<PageLoader />}>
        <Navbar />
        <main className="flex-grow relative pt-20">
            <Routes>
              {/* === Vos routes restent identiques === */}
              <Route path="/" element={<HomePage />} />
              {/* ... reste des routes */}
            </Routes>
        </main>
        <Footer />
      </Suspense>
    </div>
  );
}