import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";

// --- COMPOSANTS DE STRUCTURE ---
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute"; 
import { PublicRoute } from "./components/PublicRoute";
import { AutoLogout } from "./components/AutoLogout"; 

// --- PAGES (Lazy Loading) ---
const HomePage      = lazy(() => import("./pages/HomePage"));
const EventsPage    = lazy(() => import("./pages/EventsPage"));
const CartPage      = lazy(() => import("./pages/CartPage"));
const SuccessPage   = lazy(() => import("./pages/SuccessPage"));
const LoginPage     = lazy(() => import("./pages/auth/LoginPage")); 
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const Register      = lazy(() => import("./pages/auth/Register")); 

// CORRECTION ICI : Le fichier s'appelle Callback.tsx, on l'importe donc sous ce nom
const AuthCallback  = lazy(() => import("./pages/auth/Callback")); 

const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0f172a] z-[9999]">
    <div className="relative w-16 h-16">
      <svg className="animate-spin w-full h-full" viewBox="0 0 50 50">
        <circle className="opacity-25" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="4" fill="none" />
        <circle className="text-cyan-400" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4 31.4" fill="none" />
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
      
      <Suspense fallback={<PageLoader />}>
        <Navbar />
        
        <main className="flex-grow relative pt-20">
          <Routes>
            {/* --- ROUTES PUBLIQUES --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/cart" element={<CartPage />} />

            {/* --- AUTHENTIFICATION --- */}
            <Route path="/auth/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />

            <Route path="/auth/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* ROUTE CALLBACK : L'URL reste /auth/callback pour Supabase */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* --- ROUTES PROTÉGÉES --- */}
            <Route path="/success" element={
              <ProtectedRoute>
                <SuccessPage />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />

            {/* --- REDIRECTION PAR DÉFAUT --- */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </Suspense>
      <SpeedInsights />
    </div>
  );
}