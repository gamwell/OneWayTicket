import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, ArrowRight, Loader2, Chrome, Sparkles, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      if (!supabase) throw new Error("Supabase non initialisé");
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) throw authError;

      try {
        const res = await fetch('http://localhost:4242/api/auth/login', {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email: email.trim() })
        });
        if (res.ok) {
            const data = await res.json();
            if (data.token) localStorage.setItem('token', data.token);
        }
      } catch (e) { console.warn("API locale off"); }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message === "Invalid login credentials" ? "Identifiants incorrects." : err.message);
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => { 
      if (!supabase) return;
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  };

  return (
    // FOND PRUNE FORCÉ (#1a0525)
    <div className="min-h-screen text-white flex items-center justify-center px-6 relative overflow-hidden py-20"
         style={{ backgroundColor: '#1a0525' }}>
      
      {/* AURAS TROPICALES CHAUDES */}
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>
        {/* Rose Intense (Haut Droite) */}
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-rose-500/20 blur-[130px] rounded-full"></div>
        {/* Ambre/Or (Bas Gauche) */}
        <div className="absolute bottom-[5%] left-[-5%] w-[60%] h-[60%] bg-amber-400/15 blur-[160px] rounded-full"></div>
      </div>

      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500 relative z-10">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-4 text-amber-200 shadow-lg shadow-amber-500/10">
            <Sparkles size={10} className="text-amber-300" /> Welcome Back
          </div>
          
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-xl overflow-visible leading-tight">
            Login <br />
            {/* CORRECTION Y COUPÉ :
                1. &nbsp; à la fin du texte force l'extension du conteneur.
                2. pb-2 protège le bas des lettres.
                3. pr-2 ajoute une petite marge de sécurité.
            */}
            <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-orange-400 bg-clip-text text-transparent inline-block pb-2 pr-2">
              OneWay&nbsp;
            </span>
          </h1>
        </div>

        <div className="bg-white/10 border border-white/20 p-8 rounded-[3rem] backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          {error && (
            <div className="bg-rose-500/20 border border-rose-500/30 p-4 rounded-2xl flex items-start gap-3 text-rose-200 text-xs mb-6 font-bold">
              <AlertCircle className="w-5 h-5 shrink-0" /> <p>{error}</p>
            </div>
          )}

          <button onClick={handleGoogleLogin}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest hover:bg-white/15 hover:border-amber-200/50 transition-all mb-8 group text-white">
            <Chrome size={20} className="text-amber-300 group-hover:scale-110 transition-transform" />
            Google
          </button>

          <div className="relative mb-8 text-center">
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10"></div>
             <span className="px-4 relative z-10 text-[10px] font-black uppercase text-white/30" style={{ backgroundColor: '#2e1236' }}>Email</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-amber-100/60 ml-3">Email</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-200/50" size={18} />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-amber-300 focus:bg-black/30 transition-all"
                  placeholder="hello@oneway.com" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-3 mr-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-amber-100/60">Mot de passe</label>
                <Link to="/auth/forgot" className="text-[9px] font-bold text-teal-300 hover:text-white transition-colors">Oublié ?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-200/50" size={18} />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-amber-300 focus:bg-black/30 transition-all"
                  placeholder="••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-amber-300 to-rose-40