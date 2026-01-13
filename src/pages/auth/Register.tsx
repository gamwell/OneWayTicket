import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// ✅ Import centralisé vers le bon fichier
import { supabase } from '../../lib/supabase';
import { UserPlus, Mail, Lock, User, Chrome, Loader2 } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    
    try {
      // Sécurité : Vérifier si le client Supabase est bien initialisé
      if (!supabase) throw new Error("Le service d'authentification n'est pas configuré.");

      // Inscription avec Supabase
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName 
          },
          // Redirection après confirmation mail (s'adapte à Vercel ou Localhost)
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      alert("Inscription réussie ! Vérifiez vos emails pour confirmer votre compte.");
      navigate("/auth/login");

    } catch (error: any) {
      alert("Erreur lors de l'inscription : " + (error.message || "Une erreur est survenue"));
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      if (!supabase) return;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: `${window.location.origin}/auth/callback` 
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Erreur Google OAuth:", error.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 relative overflow-hidden">
      
      {/* AURA VIOLETTE EN ARRIÈRE-PLAN */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none"></div>

      {/* CARTE GLASSMORPHISM */}
      <div className="relative z-10 bg-[#1e293b]/60 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md shadow-2xl">
        
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
            CRÉER UN COMPTE
          </h2>
          <p className="text-slate-400 font-medium text-sm">Rejoignez l'aventure OneWayTicket</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Champ Nom */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Nom complet" 
              className="w-full bg-[#0f172a]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Champ Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full bg-[#0f172a]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {/* Champ Mot de passe */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="password" 
              placeholder="Mot de passe" 
              className="w-full bg-[#0f172a]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                S'inscrire <UserPlus size={20} />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
            <span className="bg-[#1e293b] px-4 text-slate-500 font-bold rounded-full">Ou</span>
          </div>
        </div>

        <button 
          onClick={loginWithGoogle}
          type="button"
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white hover:bg-white hover:text-black transition-all active:scale-[0.98]"
        >
          <Chrome size={20} className="text-emerald-400" />
          Continuer avec Google
        </button>

        <p className="mt-6 text-center text-slate-400 text-sm">
          Déjà membre ?{' '}
          <Link to="/auth/login" className="text-purple-400 font-bold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;