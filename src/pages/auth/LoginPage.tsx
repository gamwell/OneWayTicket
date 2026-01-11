import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// On utilise le client unique que nous avons nettoyé
import { supabase } from '../../supabaseClient'; 
import { Chrome, Mail, Lock, ArrowRight, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // URL du backend (À mettre en variable d'env plus tard pour la prod)
  const BACKEND_URL = 'http://localhost:4242';

  // 1. Synchronisation avec le serveur de facturation
  const syncWithBackend = async (userEmail: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
    } catch (err) {
      console.error("[Billing] Échec de synchro backend:", err);
    }
  };

  // 2. Logique de redirection selon le profil
  const handleRedirection = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, is_admin')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.role === 'admin' || profile?.is_admin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      navigate('/dashboard');
    }
  };

  // 3. Soumission du formulaire
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await syncWithBackend(data.user.email!);
        await handleRedirection(data.user.id);
      }
    } catch (error: any) {
      setErrorMessage(error.message === "Invalid login credentials" 
        ? "Identifiants invalides. Veuillez réessayer." 
        : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // 4. Connexion Google
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: { prompt: 'select_account' }
      }
    });
    if (error) setErrorMessage(error.message);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 relative overflow-hidden bg-[#0f172a]">
      {/* Background Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 bg-slate-900/60 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] border border-white/10 w-full max-w-md shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="text-cyan-400 w-12 h-12" />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase italic">
            Connexion
          </h2>
          <p className="text-slate-400 font-medium text-sm">Espace sécurisé OneWayTicket</p>
        </div>

        {/* Affichage des erreurs */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm">
            <AlertCircle size={18} />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
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
              className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                Se connecter <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/5"></span>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
            <span className="bg-slate-900 px-4 text-slate-500 font-black">Ou</span>
          </div>
        </div>

        <button 
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-xs text-white hover:bg-white hover:text-slate-900 transition-all"
        >
          <Chrome size={18} className="text-cyan-400" />
          Continuer avec Google
        </button>

        <p className="mt-10 text-center text-slate-500 text-sm font-medium">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-cyan-400 font-bold hover:text-cyan-300">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;