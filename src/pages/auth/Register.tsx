import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, User, ArrowRight, Loader2, Chrome } from 'lucide-react';

const Register = () => {
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
    if (loading) return; // Empêche le double envoi
    setLoading(true);

    try {
      if (!supabase) throw new Error("Client Supabase non initialisé");

      // Nettoyage des données (trim) pour éviter les erreurs de frappe
      const cleanEmail = formData.email.trim();
      const cleanName = formData.fullName.trim();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
        options: {
          data: {
            full_name: cleanName,
            // On peut ajouter d'autres métadonnées ici si besoin
          },
          // URL de retour dynamique selon l'environnement (Local vs Production)
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data?.user) {
        // Notification plus propre (vous pourriez utiliser un Toast ici)
        alert("Inscription réussie ! Un lien de confirmation a été envoyé à : " + cleanEmail);
        navigate('/auth/login');
      }
    } catch (error: any) {
      console.error("Erreur d'inscription:", error.message);
      alert("Erreur : " + (error.message === "User already registered" ? "Cet email est déjà utilisé." : error.message));
    } finally {
      setLoading(false);
    }
  };

  // --- INSCRIPTION / CONNEXION GOOGLE ---
  const handleGoogleRegister = async () => {
    try {
      if (!supabase) return;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Indispensable pour que l'utilisateur revienne sur votre site après Google
          redirectTo: `${window.location.origin}/auth/callback`,
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
            Créez votre compte en quelques secondes
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
          
          {/* BOUTON GOOGLE */}
          <button 
            type="button" // Important pour ne pas soumettre le formulaire
            onClick={handleGoogleRegister}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest hover:bg-white/10 hover:border-cyan-400/50 transition-all mb-8 group"
          >
            <Chrome size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            Continuer avec Google
          </button>

          <div className="relative mb-8 text-center">
            <span className="bg-[#121a2e] px-4 text-[10px] font-black uppercase text-slate-500 relative z-10">Ou par email</span>
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5"></div>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* NOM COMPLET */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nom Complet</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  required
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-bold text-white placeholder:text-slate-600"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  required
                  type="email"
                  placeholder="nom@exemple.com"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-bold text-white placeholder:text-slate-600"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* MOT DE PASSE */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  required
                  type="password"
                  minLength={6} // Sécurité minimale recommandée
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-bold text-white placeholder:text-slate-600"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {/* BOUTON SUBMIT */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-cyan-500 text-[#0f172a] rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-400 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} />}
              {loading ? "Création en cours..." : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 text-xs font-bold uppercase tracking-tighter">
            Déjà inscrit ? <Link to="/auth/login" className="text-cyan-400 hover:underline hover:text-cyan-300 transition-colors">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;