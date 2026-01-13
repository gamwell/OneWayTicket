import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

export const AdminRoute = ({ children }: { children: React.JSX.Element }) => {
  const { profile, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Vérification des accès admin...</p>
      </div>
    );
  }

  // Vérifie le rôle ou le flag is_admin dans user_profiles
  const hasAdminAccess = profile?.role === "admin" || profile?.role === "superadmin" || profile?.is_admin === true;

  if (!user || !hasAdminAccess) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
};