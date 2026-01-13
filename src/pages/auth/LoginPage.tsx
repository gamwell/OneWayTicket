import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase'; 
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, Loader2, Chrome } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle } = useAuth();

  // Redirection vers le pivot (aiguillage Admin/User)
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      if (!supabase) throw new Error("Le service d'authentification est indisponible.");

      // .trim() est crucial pour éviter les erreurs d'espaces masqués sur mobile
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        if (authError.message === "Invalid login credentials") {
          throw new Error("Email ou mot de passe incorrect.");
        }
        throw authError;
      }
      
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-cyan-500/10 border border-cyan-500/20 mb-6 shadow-2xl shadow-cyan-500/10">
            <LogIn className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Connexion</h2>
          <p className="mt-2 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Accédez à vos billets et événements</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
          
          {/* GESTION DES ERREURS */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-start gap-3 text-red-200 text-xs mb-6 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <p className="font-bold uppercase tracking-tight leading-relaxed">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* CHAMP EMAIL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white font-bold placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* CHAMP MOT DE PASSE AVEC LIEN RESET */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Mot de passe
                </label>
                <Link 
                  to="/auth/forgot-password" 
                  className="text-[9px] font-black uppercase tracking-tighter text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white font-bold placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* BOUTON DE CONNEXION */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#0f172a] font-black uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 group shadow-xl shadow-cyan-500/20"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* DIVISEUR SOCIAL AUTH */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase">
              <span className="bg-[#111a2f] px-4 text-slate-500 tracking-widest">Ou continuer avec</span>
            </div>
          </div>

          {/* BOUTON GOOGLE */}
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-3 transition-all group border-b-2 border-b-white/5 active:border-b-0 active:translate-y-[2px]"
          >
            <Chrome size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            Google
          </button>

          {/* FOOTER LIEN INSCRIPTION */}
          <p className="mt-8 text-center text-slate-500 text-xs font-bold uppercase tracking-tight">
            Pas encore de compte ?{' '}
            <Link to="/auth/register" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors ml-1">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}