import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // ✅ Le chemin ../ est correct ICI
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("PROT-ROUTE: Aucun utilisateur connecté");
          setAuthorized(false);
          return;
        }

        if (requireAdmin) {
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('role, is_admin')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("PROT-ROUTE: Erreur profil", error);
            setAuthorized(false);
          } else {
            console.log("PROT-ROUTE: Profil trouvé :", profile);
            const hasAccess = profile?.role === 'admin' || profile?.is_admin === true;
            console.log("PROT-ROUTE: Accès autorisé ?", hasAccess);
            setAuthorized(hasAccess);
          }
        } else {
          setAuthorized(true);
        }
      } catch (err) {
        console.error("PROT-ROUTE: Erreur système", err);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [requireAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};