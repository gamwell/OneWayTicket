import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Loader2 } from "lucide-react"; 

// --- CONTEXTES ---
import { CartProvider } from "./contexts/CartContext"; 

// --- CONFIGURATION ---
import { supabase } from "./lib/supabase"; 

// --- COMPOSANTS DE STRUCTURE ---
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero/Hero"; // Vérifiez que le dossier est 'Hero' et le fichier 'Hero.tsx'
import { ProtectedRoute } from "./components/ProtectedRoute"; 
import { AdminRoute } from "./components/AdminRoute"; 
import { PublicRoute } from "./components/PublicRoute";
import { AutoLogout } from "./components/AutoLogout"; 

// --- PAGES (Lazy Loading) ---
const HomePage           = lazy(() => import("./pages/HomePage"));
const EventsPage         = lazy(() => import("./pages/EventsPage"));
const EventDetailPage    = lazy(() => import("./pages/EventDetailPage")); 
const CartPage           = lazy(() => import("./pages/CartPage"));
const SuccessPage        = lazy(() => import("./pages/SuccessPage"));
const ProfilePage        = lazy(() => import("./pages/ProfilePage"));

// Auth
const LoginPage          = lazy(() => import("./pages/auth/LoginPage")); 
const Register           = lazy(() => import("./pages/auth/Register")); 
const AuthCallback       = lazy(() => import("./pages/auth/Callback")); 
const ForgotPassword     = lazy(() => import("./pages/auth/ForgotPassword")); 

// Dashboards
const DashboardPivot     = lazy(() => import("./pages/DashboardPivot"));
const DashboardPage      = lazy(() => import("./pages/DashboardPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const NewEventPage       = lazy(() => import("./pages/admin/NewEventPage"));

// ✅ DÉFINITION DU PAGELOADER (Résout votre erreur ReferenceError)
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
    <CartProvider>
      <div className="min-h-screen bg-[#1a0525] text-white flex flex-col font-sans selection:bg-rose-500/30">
        <AutoLogout />
        
        <Suspense fallback={<PageLoader />}>
          <Navbar />
          <main className="flex-grow relative pt-20">
            <Routes>
              {/* --- ROUTE ACCUEIL --- */}
              <Route path="/" element={
                <>
                  <Hero /> 
                  <HomePage />
                </>
              } />
              
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} /> 
              <Route path="/cart" element={<CartPage />} />

              {/* AUTH & PROTECTED ROUTES */}
              <Route path="/auth/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/auth/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/auth/forgot" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPivot /></ProtectedRoute>} />
              <Route path="/dashboard/user" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
              <Route path="/admin/events/new" element={<AdminRoute><NewEventPage /></AdminRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </Suspense>
        <SpeedInsights />
      </div>
    </CartProvider>
  );
}