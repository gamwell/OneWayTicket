import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Chrome, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fonction pour rediriger selon le rôle après connexion
  const redirectUserByRole = async (userId: string) => {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, is_admin')
      .eq('id', userId)
      .single();

    if (profile?.role === 'admin' || profile?.is_admin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  // 1. Connexion Email/Mot de passe
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Erreur : " + error.message);
      setLoading(false);
    } else if (data.user) {
      await redirectUserByRole(data.user.id);
    }
  };

  // 2. Connexion Google corrigée
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // window.location.origin détecte automatiquement http://localhost:5173
        redirectTo: `${window.location.origin}/dashboard`,
      }
    });
    if (error) alert("Erreur Google: " + error.message);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 relative overflow-hidden bg-[#0f172a]">
      
      {/* AURA D'ARRIÈRE-PLAN */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* CARTE GLASSMORPHISM */}
      <div className="relative z-10 bg-slate-900/60 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] border border-white/10 w-full max-w-md shadow-2xl">
        
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase italic">
            Connexion
          </h2>
          <p className="text-slate-400 font-medium text-sm">Accédez à vos billets OneWay</p>
        </div>

        {/* FORMULAIRE EMAIL */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="password" 
              placeholder="Mot de passe" 
              className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Se connecter'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        {/* SÉPARATEUR */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/5"></span>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
            <span className="bg-[#111827] px-4 text-slate-500 font-black">Ou</span>
          </div>
        </div>

        {/* BOUTON GOOGLE */}
        <button 
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-xs text-white hover:bg-white hover:text-slate-900 transition-all active:scale-95"
        >
          <Chrome size={18} className="text-cyan-400" />
          Continuer avec Google
        </button>

        <p className="mt-10 text-center text-slate-500 text-sm font-medium">
          Nouveau ici ?{' '}
          <Link to="/register" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;