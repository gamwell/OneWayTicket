import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, profile, loading } = useAuth();

  // 1️⃣ Chargement technique
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a0525] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-300 mb-4" />
        <p className="text-amber-300/50 text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">
          Connexion en cours...
        </p>
      </div>
    );
  }

  // 2️⃣ Si connecté → redirection automatique
  if (user) {
    const isAdmin =
      profile?.role === "admin" ||
      profile?.role === "superadmin" ||
      profile?.is_admin === true;

    return <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  // 3️⃣ Sinon → accès autorisé
  return <>{children}</>;
};

export default PublicRoute;