import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

/**
 * AuthCallback - Gère la réception des clients après confirmation email ou OAuth.
 * Optimisé pour React 18+ (Vite) et déploiement Vercel.
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (processed.current) return;
      processed.current = true;

      try {
        // 1. Échange du hash fragment (contient access_token) contre une session
        // Supabase envoie les tokens dans le hash (#) de l'URL après confirmation
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );
        
        if (error) {
          console.error("❌ Erreur exchangeCodeForSession:", error.message);
          
          // Fallback : essayer getSession au cas où
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !sessionData.session) {
            throw new Error("Impossible de récupérer la session");
          }
          
          console.log("✅ Session récupérée via fallback pour:", sessionData.session.user.email);
          
          await new Promise(resolve => setTimeout(resolve, 1500));
          navigate('/dashboard', { replace: true });
          return;
        }

        if (data?.session) {
          console.log("✅ Session établie pour:", data.session.user.email);
          console.log("📧 Email confirmé:", data.session.user.email_confirmed_at);
          
          // Délai pour permettre aux triggers database de s'exécuter
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // 2. Redirection finale vers le Dashboard
          navigate('/dashboard', { replace: true });
        } else {
          console.warn("⚠️ Aucune session détectée dans l'URL.");
          navigate('/auth/login?error=no_session', { replace: true });
        }
      } catch (err: any) {
        console.error("❌ Erreur critique lors du callback:", err.message);
        navigate('/auth/login?error=callback_failed', { replace: true });
      }
    };

    handleAuthCallback();

    return () => {
      processed.current = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
      {/* Effet visuel Glow autour du Loader */}
      <div className="relative mb-8">
        <Loader2 className="animate-spin text-cyan-400 relative z-10" size={56} />
        <div className="absolute inset-0 bg-cyan-500/30 blur-3xl rounded-full"></div>
      </div>
      
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">
          Authentification <span className="text-cyan-400">Sécurisée</span>
        </h2>
        
        <div className="flex flex-col items-center gap-4">
          <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] animate-pulse">
            Vérification de l'accès OneWay...
          </p>
          
          {/* Barre de progression stylisée */}
          <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 animate-progress origin-left"></div>
          </div>
        </div>
      </div>

      {/* Styles injectés pour l'animation de la barre de progression */}
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%) scaleX(0.2); }
          50% { transform: translateX(0%) scaleX(0.5); }
          100% { transform: translateX(100%) scaleX(0.2); }
        }
        .animate-progress {
          animation: progress 2.5s ease-in-out infinite;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;