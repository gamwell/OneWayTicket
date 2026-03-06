import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Loader2 } from "lucide-react";

// --- CONTEXTES ---
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

// --- STRUCTURE ---
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero/Hero";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import PublicRoute from "./components/PublicRoute";
import AutoLogout from "./components/AutoLogout";

// ... (vos imports lazy restent identiques)

// ✅ Import normalement pour Stripe
import ConfirmationPage from "./components/ConfirmationPage";

const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#1a0525] z-[9999]">
    <Loader2 className="animate-spin text-amber-300 w-16 h-16 mb-6" />
    <p className="text-amber-200 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
      Chargement de l'aventure...
    </p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-[#1a0525] text-white flex flex-col font-sans selection:bg-rose-500/30">
          <AutoLogout />
          <Suspense fallback={<PageLoader />}>
            <Navbar />
            <main className="flex-grow relative pt-20">
              <Routes>
                {/* --- ROUTES PUBLIQUES, PROTECTED ET ADMIN --- */}
                {/* (Gardez exactement vos routes telles quelles, elles sont bien configurées) */}
                <Route path="/" element={<><Hero /><HomePage /></>} />
                <Route path="/events" element={<EventsPage />} />
                {/* ... le reste de vos routes ... */}
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </Suspense>
          <SpeedInsights />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}