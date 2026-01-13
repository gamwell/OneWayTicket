import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Supabase gère automatiquement l'échange du code/jeton dans l'URL
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Erreur de session:", error.message);
        navigate('/auth/login');
      } else {
        // Une fois la session validée, on envoie au dashboard
        navigate('/dashboard');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
      <Loader2 className="animate-spin text-cyan-400 mb-4" size={48} />
      <h2 className="text-xl font-bold tracking-widest uppercase">
        Finalisation de la connexion...
      </h2>
      <p className="text-slate-400 mt-2">Veuillez patienter un instant.</p>
    </div>
  );
};

export default AuthCallback;