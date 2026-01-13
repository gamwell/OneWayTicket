import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const DashboardPivot = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'authentification est terminée et qu'on a le profil
    if (!loading && profile) {
      if (profile.role === 'admin' || profile.role === 'superadmin' || profile.is_admin) {
        // Redirection vers la vue Admin
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Redirection vers la vue Client
        navigate('/dashboard/user', { replace: true });
      }
    } else if (!loading && !user) {
      // Si pas d'utilisateur du tout, retour au login
      navigate('/auth/login', { replace: true });
    }
  }, [profile, loading, user, navigate]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mb-4" />
      <p className="text-slate-400 font-black italic uppercase tracking-widest text-xs animate-pulse">
        Analyse de vos accès en cours...
      </p>
    </div>
  );
};

export default DashboardPivot;