import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute : Empêche un utilisateur déjà connecté d'accéder aux pages 
 * de login/inscription et le redirige vers son tableau de bord.
 */
export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, profile, loading } = useAuth();

  // 1. État de chargement : On affiche un loader élégant
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
        <p className="text-cyan-400/50 text-[10px] uppercase tracking-[0.2em] font-bold">
          Vérification d'accès...
        </p>
      </div>
    );
  }

  // 2. Redirection intelligente si déjà connecté
  if (user) {
    // On définit qui est admin (même logique que dans la Navbar et le Dashboard)
    const isAdmin = 
      profile?.role === 'admin' || 
      profile?.role === 'superadmin' || 
      profile?.is_admin === true;
    
    // Un admin va sur /admin, un client sur /dashboard
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  }

  // 3. Accès autorisé pour les visiteurs non connectés
  return <>{children}</>;
};