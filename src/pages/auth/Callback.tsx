import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ Import centralisé correct
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase échange le code présent dans l'URL contre une session réelle
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          if (error) console.error("Erreur de session callback:", error.message);
          navigate('/auth/login', { replace: true });
        } else {
          // Connexion réussie, redirection vers le dashboard
          console.log("✅ Session établie avec succès");
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.error("Erreur critique callback:", err);
        navigate('/auth/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
      <div className="relative">
        <Loader2 className="animate-spin text-cyan-400 mb-4" size={48} />
        <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full"></div>
      </div>
      <h2 className="text-xl font-bold tracking-widest uppercase animate-pulse">
        Finalisation de la connexion...
      </h2>
      <p className="text-slate-400 mt-2 text-sm">Veuillez patienter un instant.</p>
    </div>
  );
};

export default AuthCallback;