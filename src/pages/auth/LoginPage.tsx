import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ✅ Correction : signInWithGoogle au lieu de loginWithGoogle
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      console.error("Erreur de login:", error);
      if (error.message.includes("Invalid login credentials")) {
        setErrorMsg("Email ou mot de passe incorrect.");
      } else {
        setErrorMsg(error.message || "Erreur lors de la connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // ✅ Correction : signInWithGoogle au lieu de loginWithGoogle
      await signInWithGoogle();
    } catch (error: any) {
      setErrorMsg("Erreur Google : " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a0525] p-5 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[120px] rounded-full"></div>

      <div className="relative z-10 bg-white/5 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-amber-300/10 rounded-2xl mb-4">
            <LogIn className="w-8 h-8 text-amber-300" />
          </div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Connexion</h2>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Accès OneWayTicket</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold text-center uppercase tracking-wider">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input
              type="email"
              placeholder="VOTRE EMAIL"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-4 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-amber-300/50 text-white text-sm transition-all placeholder:text-white/20"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input
              type="password"
              placeholder="MOT DE PASSE"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-4 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-amber-300/50 text-white text-sm transition-all placeholder:text-white/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black font-black uppercase italic rounded-2xl hover:bg-amber-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Se connecter'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold">
            <span className="bg-[#1a0525] px-4 text-white/20">Ou continuer avec</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/5 transition-all text-white text-xs font-bold uppercase tracking-widest disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
          Google
        </button>

        <p className="text-center mt-8 text-white/30 text-[10px] font-bold uppercase tracking-widest">
          Nouveau ici ?{' '}
          <Link to="/auth/register" className="text-amber-300 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
