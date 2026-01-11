import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, LogOut, AlertCircle, ShieldCheck } from 'lucide-react';

// Configuration (30 minutes)
const LOGOUT_TIME = 30 * 60 * 1000;
const WARNING_TIME = 29 * 60 * 1000;
const ACTIVITY_THROTTLE = 5000; // On ne reset pas plus d'une fois toutes les 5s

export const AutoLogout = () => {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // 1. Fonction de déconnexion
  const handleLogout = useCallback(() => {
    console.log("[Auth] Session expirée, nettoyage...");
    
    // Nettoyage global
    localStorage.clear();
    sessionStorage.clear();
    setShowWarning(false);
    
    // Redirection et rafraîchissement pour réinitialiser tout l'état de l'app
    navigate('/auth/login');
    window.location.reload();
  }, [navigate]);

  // 2. Fonction de réinitialisation des timers
  const resetTimers = useCallback(() => {
    const now = Date.now();
    
    // Si la dernière activité est trop récente, on ignore (optimisation CPU)
    if (now - lastActivityRef.current < ACTIVITY_THROTTLE && !showWarning) {
      return;
    }

    lastActivityRef.current = now;
    setShowWarning(false);

    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    warningTimerRef.current = setTimeout(() => setShowWarning(true), WARNING_TIME);
    logoutTimerRef.current = setTimeout(handleLogout, LOGOUT_TIME);
  }, [handleLogout, showWarning]);

  // 3. Gestion des événements
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Initialisation
    resetTimers();

    const handleUserActivity = () => resetTimers();

    events.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [resetTimers]);

  return (
    <AnimatePresence>
      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#1A1A3A] border-2 border-[#FF6B9D] p-8 rounded-2xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(255,107,157,0.3)]"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FF6B9D] blur-xl opacity-20 animate-pulse" />
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
              <span className="text-[#FF6B9D] text-[10px] font-bold uppercase tracking-wider">Session expirante</span>
            </div>
            
            <p className="text-cyan-100/70 text-sm mb-8 leading-relaxed">
              Votre session va expirer pour des raisons de sécurité. 
              Souhaitez-vous <span className="text-white font-bold">prolonger</span> votre accès ?
            </p>

            <div className="space-y-3">
              <button
                onClick={resetTimers}
                className="w-full py-4 bg-cyan-500 text-slate-900 font-black uppercase italic rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] active:scale-95"
              >
                Prolonger l'accès
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-transparent border border-white/10 text-white/40 font-semibold rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion immédiate
              </button>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[9px] text-white/30 uppercase tracking-[0.3em]">
              <AlertCircle className="w-3 h-3 text-cyan-400" />
              Protection OneWayTicket
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};