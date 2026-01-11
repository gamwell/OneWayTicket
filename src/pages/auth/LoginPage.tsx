import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';

// 1. IMPORT DIRECT DE SUPABASE
import { supabase } from '../../lib/supabaseClient'; 
import { useAuth } from '../../contexts/AuthContext'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const auth = useAuth(); 
  const navigate = useNavigate();

  // --- GESTION LOGIN EMAIL ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (!auth.signIn) throw new Error("Erreur interne: Fonction signIn introuvable");
      
      const { error } = await auth.signIn(email, password);
      if (error) throw error;
      navigate('/'); 
    } catch (error: any) {
      console.error("Erreur de login:", error);
      setErrorMsg(error.message || "Erreur lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  // --- GESTION GOOGLE ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      
    } catch (error: any) {
      console.error(error);
      setErrorMsg("Erreur Google : " + error.message);
      setLoading(false);
    }
  };

  return (
    // 🎨 FOND CHANGE ICI : Couleur sombre (#0f172a) pour matcher la Navbar
    <div className="min-h-[90vh] flex items-center justify-center bg-[#0f172a] p-5">
      
      {/* 🎨 CARTE : Fond sombre transparent + Bordure subtile */}
      <div className="bg-slate-800/40 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700/50">
        
        {/* Titre en Blanc */}
        <h2 className="text-3xl font-bold text-center mb-4 text-white">Connexion</h2>
        <p className="text-center text-slate-400 mb-8">Connectez-vous pour continuer</p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-200 border border-red-500/50 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-cyan-400" />
            <input
              type="email"
              placeholder="Votre email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // 🎨 INPUTS : Fond foncé, texte blanc, bordure grise sombre
              className="w-full py-3 px-10 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-cyan-400" />
            <input
              type="password"
              placeholder="Mot de passe"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 px-10 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            // Bouton Cyan/Bleu plus vif pour ressortir sur le noir
            className="w-full py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 transition-colors disabled:opacity-50 shadow-lg shadow-cyan-900/20"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          // Bouton Google blanc pour le contraste
          className="w-full mt-4 py-3 bg-white text-slate-900 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? 'Connexion...' : 'Se connecter avec Google'}
        </button>

        <p className="text-center mt-6 text-slate-400 text-sm">
          Pas de compte ?{' '}
          <Link to="/auth/register" className="text-cyan-400 font-semibold hover:text-cyan-300">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}