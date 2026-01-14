import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, Sparkles } from 'lucide-react';

/**
 * AuthCallback - Page de transition.
 * Gère la redirection après un clic sur un lien magique, 
 * une confirmation d'email ou un reset de mot de passe.
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    // Évite la double exécution (spécifique à React 18 en dev)
    if (processed.current) return;
    processed.current = true;

    const handleAuthCallback = async () => {
      console.log("🔄 Analyse de l'URL de retour...");

      // 1. Analyse DIRECTE de l'URL pour détecter le mode "Recovery"
      // C'est la méthode la plus fiable quand on arrive depuis un email
      const hash = window.location.hash;
      const isRecovery = hash && hash.includes('type=recovery');

      if (isRecovery) {
        console.log("🔑 Mode RÉCUPÉRATION détecté via l'URL.");
      }

      // 2. Vérification de la session active
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Erreur session:", error.message);
        // On redirige vers le login avec une erreur
        setTimeout(() => navigate('/auth/login?error=session_failed', { replace: true }), 2000);
        return;
      }

      if (session) {
        console.log("✅ Session établie pour :", session.user.email);

        // 3. Logique de redirection
        if (isRecovery) {
          // Cas A : L'utilisateur veut changer son mot de passe -> Profil
          console.log("🔀 Redirection vers le profil (changement mot de passe)");
          setTimeout(() => navigate('/profile', { replace: true }), 1500);
        } else {
          // Cas B : Connexion normale -> Dashboard
          console.log("🔀 Redirection vers le dashboard");
          setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
        }
      } else {
        // 4. Fallback : Si getSession est vide (rare), on écoute l'événement
        console.log("⏳ Attente de l'événement Auth...");
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY') {
             navigate('/profile', { replace: true });
          } else if (session) {
             navigate('/dashboard', { replace: true });
          } else if (event === 'SIGNED_OUT') {
             navigate('/auth/login', { replace: true });
          }
        });
        
        // Nettoyage si on quitte le composant avant la fin
        return () => subscription.unsubscribe();
      }
    };

    handleAuthCallback();

  }, [navigate]);

  return (
    // FOND FORCÉ : Prune Profond (#1a0525)
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a0525] text-white overflow-hidden relative">
      
      {/* --- BACKGROUND AMBIANCE --- */}
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>
        {/* Lumière Rose (Haut) */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-rose-500/10 blur-[150px] rounded-full animate-pulse"></div>
        {/* Lumière Or (Bas) */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-400/10 blur-[180px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Effet visuel Glow autour du Loader */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-amber-400/20 blur-3xl rounded-full animate-pulse"></div>
          <Loader2 className="animate-spin text-amber-300 relative z-10" size={64} />
          <Sparkles className="absolute -top-4 -right-4 text-rose-400 animate-bounce" size={24} />
        </div>
        
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter drop-shadow-xl">
            Authentification <br/>
            <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
              En cours...
            </span>
          </h2>
          
          <div className="flex flex-col items-center gap-4">
            <p className="text-rose-100/60 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">
              Validation de l'accès OneWay...
            </p>
            
            {/* Barre de progression stylisée Or/Rose */}
            <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 animate-progress origin-left"></div>
            </div>
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
          animation: progress 2s ease-in-out infinite;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;