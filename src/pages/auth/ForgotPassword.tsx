import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, ArrowLeft, Loader2, Send, CheckCircle2, Sparkles } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!supabase) throw new Error("Service indisponible.");

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (resetError) throw resetError;

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // FOND FORCÉ : Prune Profond (#1a0525)
    <div className="min-h-screen text-white flex items-center justify-center px-6 relative overflow-hidden py-20"
         style={{ backgroundColor: '#1a0525' }}>
      
      {/* AMBIANCE LUMINEUSE (Identique au Login) */}
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>
        {/* Lumière Turquoise (Haut) */}
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-teal-500/20 blur-[130px] rounded-full"></div>
        {/* Lumière Rose (Bas) */}
        <div className="absolute bottom-[5%] right-[-5%] w-[60%] h-[60%] bg-rose-500/15 blur-[160px] rounded-full"></div>
      </div>

      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500 relative z-10">
        
        {/* RETOUR */}
        <Link 
          to="/auth/login" 
          className="inline-flex items-center gap-2 text-rose-200/50 hover:text-white mb-8 text-[10px] font-black uppercase tracking-[0.2em] transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Retour connexion
        </Link>

        {/* CONTAINER "VERRE FUMÉ" */}
        <div className="bg-white/10 border border-white/20 p-10 rounded-[3rem] backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          
          {!submitted ? (
            <>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-4 text-teal-200 shadow-lg">
                  <Sparkles size={10} className="text-teal-300" /> Récupération
                </div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-xl leading-tight">
                  Accès <br />
                  <span className="bg-gradient-to-r from-teal-300 via-amber-200 to-rose-400 bg-clip-text text-transparent inline-block pb-2 pr-2">
                    Perdu ?
                  </span>
                </h1>
                <p className="text-rose-100/50 font-bold uppercase tracking-widest text-[9px] mt-4 leading-relaxed">
                  Entrez votre email pour recevoir <br /> un lien magique de secours.
                </p>
              </div>

              {error && (
                <div className="bg-rose-500/20 border border-rose-500/30 p-4 rounded-2xl text-rose-200 text-[10px] font-black uppercase tracking-tight mb-6 animate-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amber-100/60 ml-3">Votre Email</label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-200/50" size={18} />
                    <input 
                      required
                      type="email"
                      placeholder="nom@exemple.com"
                      className="w-full bg-black/20 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-amber-300 focus:bg-black/30 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-white text-[#1a0525] rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  {loading ? "Envoi en cours..." : "Envoyer le lien"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6 animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-teal-500/30 shadow-[0_0_30px_-5px_rgba(45,212,191,0.3)]">
                <CheckCircle2 className="text-teal-300" size={48} />
              </div>
              
              <h2 className="text-3xl font-black uppercase italic text-white mb-4 drop-shadow-lg">Email Envoyé !</h2>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <p className="text-rose-100/70 text-xs font-medium leading-relaxed">
                  Vérifiez la boîte de réception de <br/>
                  <strong className="text-amber-300 block mt-2 text-sm">{email}</strong>
                </p>
              </div>

              <Link 
                to="/auth/login"
                className="inline-block px-8 py-4 bg-white/10 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 hover:border-white/40 transition-all text-white"
              >
                Retourner au Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;