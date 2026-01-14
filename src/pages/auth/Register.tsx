import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, User, ArrowRight, Loader2, Chrome, Sparkles } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; 
    setLoading(true);
    try {
      if (!supabase) throw new Error("Erreur système.");
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: { data: { full_name: formData.fullName.trim() } },
      });
      if (error) throw error;
      if (data?.user) {
        alert("Bienvenue ! Vérifiez vos emails.");
        navigate('/auth/login');
      }
    } catch (error: any) {
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => { 
      if (!supabase) return;
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  };

  return (
    // FOND PRUNE FORCÉ
    <div className="min-h-screen text-white flex items-center justify-center px-6 relative overflow-hidden py-20"
         style={{ backgroundColor: '#1a0525' }}>
      
      {/* --- AMBIANCE LUMINEUSE --- */}
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-rose-500/20 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[5%] left-[-5%] w-[60%] h-[60%] bg-amber-400/15 blur-[160px] rounded-full"></div>
      </div>

      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500 relative z-10">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-4 text-amber-200 shadow-lg shadow-amber-500/10">
            <Sparkles size={10} className="text-amber-300" /> New Account
          </div>
          
          {/* CORRECTION DU TITRE "Y" COUPÉ */}
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-xl overflow-visible leading-tight">
            Rejoindre <br />
            {/* ASTUCE DU &nbsp; : L'espace insécable force l'extension du dégradé.
               pb-2 : Protège le bas des lettres.
               pr-2 : Ajoute un petit espace supplémentaire.
            */}
            <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-orange-400 bg-clip-text text-transparent inline-block pb-2 pr-2">
              OneWay&nbsp;
            </span>
          </h1>
        </div>

        <div className="bg-white/10 border border-white/20 p-8 rounded-[3rem] backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          <button onClick={handleGoogleRegister}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest hover:bg-white/15 hover:border-amber-200/50 transition-all mb-8 group text-white">
            <Chrome size={20} className="text-amber-300 group-hover:scale-110 transition-transform" />
            Continuer avec Google
          </button>

          <div className="relative mb-8 text-center">
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10"></div>
            <span className="px-4 text-[10px] font-black uppercase text-rose-100/40 relative z-10" style={{ backgroundColor: '#2e1236' }}>Ou Email</span>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {[
              { label: "Nom", icon: User, type: "text", val: formData.fullName, set: (v: string) => setFormData({...formData, fullName: v}) },
              { label: "Email", icon: Mail, type: "email", val: formData.email, set: (v: string) => setFormData({...formData, email: v}) },
              { label: "Passe", icon: Lock, type: "password", val: formData.password, set: (v: string) => setFormData({...formData, password: v}) }
            ].map((field, i) => (
              <div key={i} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-amber-100/60 ml-3">{field.label}</label>
                <div className="relative">
                  <field.icon className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-200/50" size={18} />
                  <input required type={field.type} value={field.val} onChange={(e) => field.set(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-amber-300 focus:bg-black/30 transition-all"
                    placeholder="..." />
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full py-5 bg-white text-[#1a0525] rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} />}
              {loading ? "..." : "S'inscrire"}
            </button>
          </form>

          <p className="text-center mt-8 text-white/40 text-xs font-bold uppercase tracking-tight">
            Déjà membre ? <Link to="/auth/login" className="text-teal-300 hover:text-white transition-colors ml-1 border-b border-teal-300/30 hover:border-white pb-0.5">Connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Register;