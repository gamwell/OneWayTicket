import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const DashboardPivot = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. On attend que le chargement du profil soit terminé
    if (loading) return;

    // 2. Si l'utilisateur n'est pas connecté, retour au login
    if (!user) {
      navigate('/auth/login', { replace: true });
      return;
    }

    // 3. Logique de redirection selon le rôle
    // On vérifie les deux possibilités (role ou is_admin) pour plus de sécurité
    if (profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.is_admin === true) {
      console.log("🚀 Accès Admin détecté, redirection...");
      navigate('/admin/dashboard', { replace: true });
    } else {
      console.log("👤 Accès Client détecté, redirection...");
      navigate('/dashboard/user', { replace: true });
    }
  }, [profile, loading, user, navigate]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mb-4" />
        <div className="absolute inset-0 blur-xl bg-cyan-500/20 animate-pulse"></div>
      </div>
      <p className="text-slate-400 font-black italic uppercase tracking-[0.3em] text-[10px] animate-pulse">
        Analyse du profil en cours...
      </p>
    </div>
  );
};

export default DashboardPivot;