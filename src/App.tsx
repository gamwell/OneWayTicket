import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";

// --- CONFIGURATION ---
import { supabase } from "./lib/supabase"; 

// --- COMPOSANTS DE STRUCTURE ---
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute"; 
import { AdminRoute } from "./components/AdminRoute"; 
import { PublicRoute } from "./components/PublicRoute";
import { AutoLogout } from "./components/AutoLogout"; 

// --- PAGES (Lazy Loading) ---
const HomePage           = lazy(() => import("./pages/HomePage"));
const EventsPage         = lazy(() => import("./pages/EventsPage"));
const CartPage           = lazy(() => import("./pages/CartPage"));
const SuccessPage        = lazy(() => import("./pages/SuccessPage"));
// Ajout de la page Profil (créée précédemment)
const ProfilePage        = lazy(() => import("./pages/ProfilePage"));

// Auth
const LoginPage          = lazy(() => import("./pages/auth/LoginPage")); 
const Register           = lazy(() => import("./pages/auth/Register")); 
const AuthCallback       = lazy(() => import("./pages/auth/Callback")); 
const ForgotPassword     = lazy(() => import("./pages/auth/ForgotPassword")); 

// Dashboards & Pivot
const DashboardPivot     = lazy(() => import("./pages/DashboardPivot"));
const DashboardPage      = lazy(() => import("./pages/DashboardPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));

// Admin spécifique
const NewEventPage       = lazy(() => import("./pages/admin/NewEventPage"));

// Loader de page stylisé (Mis à jour aux couleurs du thème)
const PageLoader = () => (
  // FOND PRUNE FORCÉ
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#1a0525] z-[9999]">
    <div className="relative w-16 h-16">
      <svg className="animate-spin w-full h-full" viewBox="0 0 50 50">
        <circle className="opacity-25" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="4" fill="none" className="text-rose-500" />
        <circle className="text-amber-300" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4 31.4" fill="none" />
      </svg>
    </div>
    <p className="text-amber-200 font-black uppercase tracking-[0.3em] text-[9px] mt-6 animate-pulse">
      Initialisation...
    </p>
  </div>
);

export default function App() {
  useEffect(() => {
    console.log("🚀 App démarrée, vérification Supabase...");
    if (!supabase) {
      console.error("❌ Le client Supabase n'est pas initialisé. Vérifiez src/lib/supabase.ts");
    }
  }, []);

  return (
    // FOND GLOBAL : Prune Profond (#1a0525)
    <div className="min-h-screen bg-[#1a0525] text-white flex flex-col font-sans selection:bg-rose-500/30">
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

            {/* ROUTE CORRIGÉE : /auth/forgot (pour matcher le lien du Login) */}
            <Route path="/auth/forgot" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />

            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* --- ROUTES PROTÉGÉES (COMMUNES) --- */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

            <Route path="/success" element={
              <ProtectedRoute>
                <SuccessPage />
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPivot />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/user" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />

            {/* --- ESPACE ADMINISTRATEUR --- */}
            <Route path="/admin/dashboard" element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            } />

            <Route path="/admin/events/new" element={
              <AdminRoute>
                <NewEventPage />
              </AdminRoute>
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