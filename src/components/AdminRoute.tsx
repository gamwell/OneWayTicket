import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";

export const AdminRoute = ({ children }: { children: React.JSX.Element }) => {
  const { profile, loading, user } = useAuth();
  const location = useLocation();

  // 1. État de chargement stylisé (évite le flash blanc)
  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
          Vérification des droits d'accès...
        </p>
      </div>
    );
  }

  // 2. Logique de vérification étendue
  // On vérifie le rôle OR le flag is_admin pour plus de flexibilité
  const hasAdminAccess = 
    profile?.role === "admin" || 
    profile?.role === "superadmin" || 
    profile?.is_admin === true;

  // 3. Si l'utilisateur n'est pas connecté ou n'est pas admin
  if (!user || !hasAdminAccess) {
    console.error("🚫 Accès refusé : Tentative d'intrusion sur une route protégée.");
    
    // On redirige vers l'accueil ou le login
    // 'replace' empêche de revenir en arrière sur cette page interdite
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 4. Si tout est OK, on affiche la page admin
  return children;
};