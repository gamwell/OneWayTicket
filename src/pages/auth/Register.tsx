import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, User, ArrowRight, Loader2, Chrome } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  // --- INSCRIPTION PAR EMAIL ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; 
    setLoading(true);

    try {
      if (!supabase) throw new Error("Le client Supabase n'est pas initialisé.");

      const cleanEmail = formData.email.trim();
      const cleanName = formData.fullName.trim();

      /**
       * ✅ CONFIGURATION DE L'URL DE REDIRECTION
       */
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const redirectUrl = `${baseUrl}/auth/callback`;

      // 1. Inscription de l'utilisateur dans Supabase
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
        options: {
          data: {
            full_name: cleanName,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      // 2. Appel à la fonction serverless pour envoyer l'email de bienvenue via Resend
      if (data?.user) {
        try {
          const emailResponse = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: cleanEmail,
              firstName: cleanName.split(' ')[0] // On récupère seulement le premier mot (prénom)
            }),
          });

          if (!emailResponse.ok) {
            const errorData = await emailResponse.json();
            console.warn('Email non envoyé (API):', errorData.error);
          } else {
            console.log('✅ Email de bienvenue programmé avec succès');
          }
        } catch (apiError) {
          // On log l'erreur mais on ne bloque pas l'utilisateur car son compte est créé
          console.error('Erreur de connexion à l\'API email:', apiError);
        }

        alert("Inscription réussie ! Un lien de confirmation a été envoyé à : " + cleanEmail);
        navigate('/auth/login');
      }
    } catch (error: any) {
      console.error("Erreur d'inscription:", error.message);
      let errorMessage = error.message;
      if (error.message === "User already registered") {
        errorMessage = "Cet email est déjà utilisé.";
      }
      alert("Erreur : " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- INSCRIPTION / CONNEXION GOOGLE ---
  const handleGoogleRegister = async () => {
    try {
      if (!supabase) return;
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${baseUrl}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Erreur Google:", error.message);
      alert("Erreur de connexion Google : " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full animate-in fade-in duration-700">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Rejoindre <span className="text-cyan-400">OneWay</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
            Compte officiel pour quarksydigital.com
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
          
          <button 
            type="button"
            onClick={handleGoogleRegister}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest hover:bg-white/10 hover:border-cyan-400/50 transition-all mb-8 group"
          >
            <Chrome size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            Continuer avec Google
          </button>

          <div className="relative mb-8 text-center">
            <span className="bg-[#0f172a] px-4 text-[10px] font-black uppercase text-slate-500 relative z-10">Ou par email</span>
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5"></div>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nom Complet</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  required
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-bold text-white placeholder:text-slate-600"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Professionnel</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="nom@exemple.com"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-bold text-white placeholder:text-slate-600"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  required
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-bold text-white placeholder:text-slate-600"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-cyan-500 text-[#0f172a] rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-400 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} />}
              {loading ? "Traitement..." : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 text-xs font-bold uppercase tracking-tighter">
            Déjà inscrit ? <Link to="/auth/login" className="text-cyan-400 hover:underline hover:text-cyan-300 transition-colors font-medium">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;