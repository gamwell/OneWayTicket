import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, LogOut, AlertCircle, ShieldCheck } from 'lucide-react';

// Configuration calée sur la durée du jeton JWT (30 minutes)
const LOGOUT_TIME = 30 * 60 * 1000;  // 30 minutes total
const WARNING_TIME = 29 * 60 * 1000; // Alerte à la 29ème minute

export const AutoLogout = () => {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  
  // Refs pour les timers
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction de déconnexion finale
  const logout = () => {
    console.log("Session expirée (Jeton 30min révoqué)");
    
    // Nettoyage complet
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    localStorage.clear();
    sessionStorage.clear();
    
    setShowWarning(false);
    
    // Redirection vers login
    navigate('/auth/login');
    window.location.reload();
  };

  // Fonction pour réinitialiser les compteurs
  const resetTimers = () => {
    setShowWarning(false);

    // Nettoyage des anciens timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    // Relance du cycle synchronisé sur 30 minutes
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, WARNING_TIME);

    logoutTimerRef.current = setTimeout(logout, LOGOUT_TIME);
  };

  useEffect(() => {
    // Événements surveillés pour détecter l'activité de l'utilisateur
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    // Initialisation au montage du composant
    resetTimers();

    // Ajout des écouteurs
    events.forEach(event => {
      window.addEventListener(event, resetTimers);
    });

    // Nettoyage au démontage
    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      events.forEach(event => {
        window.removeEventListener(event, resetTimers);
      });
    };
  }, []);

  return (
    <AnimatePresence>
      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#1A1A3A] border-2 border-[#FF6B9D] p-8 rounded-2xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(255,107,157,0.4)]"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FF6B9D] blur-xl opacity-20 animate-pulse"></div>
                <Clock className="w-14 h-14 text-[#FF6B9D] relative z-10" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-3 border-t-2 border-cyan-400 rounded-full opacity-40"
                />
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase italic">
              Alerte Sécurité
            </h2>
            
            <div className="flex items-center justify-center gap-2 mb-4 py-1 px-3 bg-[#FF6B9D]/10 rounded-full w-fit mx-auto">
              <ShieldCheck className="w-4 h-4 text-[#FF6B9D]" />
              <span className="text-[#FF6B9D] text-[10px] font-bold uppercase tracking-wider">Session 30min expirante</span>
            </div>
            
            <p className="text-cyan-100/70 text-sm mb-8 leading-relaxed">
              Votre jeton d'accès sécurisé arrive à expiration. Pour protéger vos données, vous allez être déconnecté dans <span className="text-white font-bold text-lg">60s</span>.
            </p>

            <div className="space-y-3">
              <button
                onClick={resetTimers}
                className="w-full py-4 bg-[#00E5FF] text-[#0F0F23] font-black uppercase italic rounded-xl hover:bg-[#00c2d9] transition-all shadow-[0_0_20px_rgba(0,229,255,0.5)] active:scale-95"
              >
                Prolonger l'accès
              </button>
              
              <button
                onClick={logout}
                className="w-full py-3 bg-transparent border border-white/10 text-white/40 font-semibold rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion immédiate
              </button>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[9px] text-white/30 uppercase tracking-[0.3em]">
              <AlertCircle className="w-3 h-3 text-cyan-400" />
              Chiffrement AES-256 OneWay
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};