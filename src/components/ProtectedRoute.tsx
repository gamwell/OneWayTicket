import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // <-- VÉRIFIEZ CE FICHIER APRÈS
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
        <p className="text-cyan-400/50 text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">
          Vérification des accès...
        </p>
      </div>
    );
  }

  // 2. Vérification du rôle administrateur (plus robuste)
  const isAdmin = 
    profile?.role === 'admin' || 
    profile?.role === 'superadmin' || 
    profile?.is_admin === true;

  // 3. Logique de redirection
  // Si l'utilisateur n'est pas connecté
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Si l'utilisateur est connecté mais n'est pas admin alors que c'est requis
  if (requireAdmin && !isAdmin) {
    console.warn(`[Security] Tentative d'accès admin refusée pour ${location.pathname}`);
    return <Navigate to="/" replace />; // On le renvoie à l'accueil plutôt qu'au login
  }

  // 4. Accès autorisé
  return <>{children}</>;
};