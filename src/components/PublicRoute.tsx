import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, profile, loading } = useAuth();

  // 1. Chargement : On attend que l'AuthContext ait récupéré l'user ET le profil
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  // 2. Si l'utilisateur est connecté, on le redirige intelligemment
  if (user) {
    // On vérifie si c'est un admin ou un client pour choisir la bonne destination
    const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.is_admin === true;
    
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  }

  // 3. Si non connecté, on affiche enfin la page (Login/Register)
  return <>{children}</>;
};