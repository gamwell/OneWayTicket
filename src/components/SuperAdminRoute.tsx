import React from 'react';
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#1a0525] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500 mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/50">
          Accès SuperAdmin en cours...
        </p>
      </div>
    );
  }

  if (profile?.role !== "superadmin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// ON AJOUTE L'EXPORT PAR DÉFAUT ICI
export default SuperAdminRoute;