import React, { useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const redirected = useRef(false);

  // 1️⃣ Pendant chargement global
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a0525] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-300 mb-4" />
        <p className="text-amber-300/50 text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">
          Vérification des accès...
        </p>
      </div>
    );
  }

  // 2️⃣ Pas connecté → login
  if (!user) {
    if (!redirected.current) {
      redirected.current = true;
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }
    return null;
  }

  // 3️⃣ Profil pas encore chargé → attendre
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#1a0525] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-300 mb-4" />
        <p className="text-amber-300/50 text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">
          Chargement du profil...
        </p>
      </div>
    );
  }

  // 4️⃣ Vérification admin si nécessaire
  // ✅ Ajout de "administrateur" pour matcher la valeur dans Supabase
  const isAdmin =
    profile.role === "admin" ||
    profile.role === "superadmin" ||
    profile.role === "administrateur" ||
    profile.is_admin === true;

  if (requireAdmin && !isAdmin) {
    if (!redirected.current) {
      redirected.current = true;
      return <Navigate to="/dashboard" replace />;
    }
    return null;
  }

  // 5️⃣ Tout est OK
  return <>{children}</>;
};

export default ProtectedRoute;
