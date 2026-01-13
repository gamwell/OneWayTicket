import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const processed = useRef(false); // Évite les doubles exécutions en mode Strict (React 18)

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (processed.current) return;
      processed.current = true;

      try {
        // 1. Échange du code/hash dans l'URL contre une session session réelle
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (data?.session) {
          console.log("✅ Session établie :", data.session.user.email);
          
          // Petit délai de sécurité pour laisser le temps au Trigger SQL (Supabase) 
          // de créer le profil dans la table 'user_profiles' si c'est une première connexion
          await new Promise(resolve => setTimeout(resolve, 1000));

          // 2. Redirection vers le Pivot pour l'aiguillage final (Admin vs User)
          navigate('/dashboard', { replace: true });
        } else {
          // Si pas de session trouvée dans l'URL
          console.warn("⚠️ Aucune session trouvée dans le callback.");
          navigate('/auth/login', { replace: true });
        }
      } catch (err: any) {
        console.error("❌ Erreur critique callback:", err.message);
        navigate('/auth/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
      <div className="relative mb-8">
        <Loader2 className="animate-spin text-cyan-400 relative z-10" size={56} />
        <div className="absolute inset-0 bg-cyan-500/30 blur-3xl rounded-full"></div>
      </div>
      
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">
          Authentification <span className="text-cyan-400">Sécurisée</span>
        </h2>
        <div className="flex flex-col items-center gap-2">
          <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] animate-pulse">
            Vérification des informations...
          </p>
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 animate-progress origin-left"></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;