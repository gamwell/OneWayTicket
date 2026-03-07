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

// --- PAGES (Lazy Loading) ---
const HomePage           = lazy(() => import("./pages/HomePage"));
const EventsPage         = lazy(() => import("./pages/EventsPage"));
const EventDetailPage    = lazy(() => import("./pages/EventDetailPage"));
const CartPage           = lazy(() => import("./pages/CartPage"));
const SuccessPage        = lazy(() => import("./pages/SuccessPage"));
const ProfilePage        = lazy(() => import("./pages/ProfilePage"));
const MyTicketsPage      = lazy(() => import("./pages/MyTicketsPage"));
const TicketPage         = lazy(() => import("./pages/TicketPage"));

// AUTH PUBLIC
const LoginPage          = lazy(() => import("./pages/auth/LoginPage"));
const Register           = lazy(() => import("./pages/auth/Register"));
const AuthCallback       = lazy(() => import("./pages/auth/Callback"));
const ForgotPassword     = lazy(() => import("./pages/auth/ForgotPassword"));

// DASHBOARDS
const DashboardPivot     = lazy(() => import("./pages/DashboardPivot"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const NewEventPage       = lazy(() => import("./pages/admin/NewEventPage"));

// ADMIN
const AdminLoginPage     = lazy(() => import("./pages/admin/AdminLoginPage"));
const ScanPage           = lazy(() => import("./pages/admin/ScanPage"));
const CheckinDashboard   = lazy(() => import("./pages/admin/CheckinDashboard"));
const MobileScanPage     = lazy(() => import("./pages/admin/MobileScanPage"));
const OfflineScanPage    = lazy(() => import("./pages/admin/OfflineScanPage"));
const AdminToolsPage     = lazy(() => import("./pages/admin/AdminToolsPage"));
const StaffHomePage      = lazy(() => import("./pages/admin/StaffHomePage"));

// ✅ Import normal
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
                {/* --- PUBLIC --- */}
                <Route path="/" element={<><Hero /><HomePage /></>} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/cart" element={<CartPage />} />

                {/* --- AUTH --- */}
                <Route path="/auth/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/auth/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/auth/forgot" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* --- PROTECTED (CLIENT) --- */}
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/my-tickets" element={<ProtectedRoute><MyTicketsPage /></ProtectedRoute>} />
                <Route path="/ticket/:id" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPivot /></ProtectedRoute>} />
                <Route path="/confirmation" element={<ProtectedRoute><ConfirmationPage /></ProtectedRoute>} />
                <Route path="/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />

                {/* --- ADMIN --- */}
                <Route path="/admin/login" element={<PublicRoute><AdminLoginPage /></PublicRoute>} />
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                <Route path="/admin/events/new" element={<AdminRoute><NewEventPage /></AdminRoute>} />
                <Route path="/admin/tools" element={<AdminRoute><AdminToolsPage /></AdminRoute>} />
                <Route path="/admin/staff" element={<AdminRoute><StaffHomePage /></AdminRoute>} />
                <Route path="/admin/scan" element={<AdminRoute><ScanPage /></AdminRoute>} />
                <Route path="/admin/checkin-dashboard" element={<AdminRoute><CheckinDashboard /></AdminRoute>} />
                <Route path="/admin/scan/mobile" element={<AdminRoute><MobileScanPage /></AdminRoute>} />
                <Route path="/admin/scan/offline" element={<AdminRoute><OfflineScanPage /></AdminRoute>} />

                {/* --- 404 --- */}
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