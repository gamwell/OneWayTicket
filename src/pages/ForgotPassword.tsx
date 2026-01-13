import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, ArrowLeft, Loader2, Send, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full animate-in fade-in duration-500">
        
        {/* RETOUR */}
        <Link 
          to="/auth/login" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-8 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
        >
          <ArrowLeft size={14} /> Retour à la connexion
        </Link>

        <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden">
          
          {!submitted ? (
            <>
              <header className="mb-10 text-center">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                  Reset <span className="text-cyan-400">Access</span>
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mt-3 leading-relaxed">
                  Entrez votre email pour recevoir <br /> un lien de récupération
                </p>
              </header>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl text-red-200 text-[10px] font-black uppercase tracking-tight mb-6 animate-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Votre Email</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      required
                      type="email"
                      placeholder="nom@exemple.com"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-cyan-500 outline-none transition-all font-bold text-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-cyan-500 text-[#0f172a] rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  {loading ? "Envoi en cours..." : "Envoyer le lien"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-emerald-400" size={40} />
              </div>
              <h2 className="text-2xl font-black uppercase italic text-white mb-4">Email Envoyé !</h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                Vérifiez votre boîte de réception <strong>{email}</strong> et suivez les instructions.
              </p>
              <Link 
                to="/auth/login"
                className="inline-block px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
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