import React from "react";
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

  // 1️⃣ Pendant le chargement (Auth ou Profil)
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

  // 2️⃣ Pas connecté du tout
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 3️⃣ Connecté mais profil pas encore arrivé
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

  // 4️⃣ Vérification des droits Admin
  // On utilise la normalisation qu'on a faite dans AuthContext
  const isAdmin = 
    profile.is_admin === true || 
    ["admin", "superadmin", "administrateur"].includes(profile.role?.toLowerCase() || "");

  if (requireAdmin && !isAdmin) {
    console.warn("Accès Admin refusé pour :", profile.email);
    // ⚠️ Si l'accès est refusé, on renvoie vers le dashboard classique de l'utilisateur
    return <Navigate to="/dashboard/user" replace />;
  }

  // 5️⃣ Tout est OK -> On affiche la page demandée
  return <>{children}</>;
};

export default ProtectedRoute;