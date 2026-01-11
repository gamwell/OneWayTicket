import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * ProtectedRoute : Sécurise les routes de l'application.
 * Vérifie si l'utilisateur est connecté et s'il a les droits admin si nécessaire.
 */
export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // 1. État de chargement global de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mb-4" />
        <p className="text-cyan-400/50 text-[10px] uppercase tracking-[0.3em] font-bold">
          Authentification sécurisée...
        </p>
      </div>
    );
  }

  // 2. Vérification du rôle administrateur
  const isAdmin = 
    profile?.role === 'admin' || 
    profile?.role === 'superadmin' || 
    profile?.is_admin === true;

  // 3. Logique de redirection
  // Si non connecté OU (si admin requis mais utilisateur non admin)
  if (!user || (requireAdmin && !isAdmin)) {
    console.log(`[Security] Accès refusé pour ${location.pathname}. Redirection...`);
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 4. Accès autorisé
  return <>{children}</>;
};