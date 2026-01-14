import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate, Navigate } from "react-router-dom";
import { UserRoundCog, Loader2, CheckCircle2, AlertCircle, Sparkles, Lock, LogOut } from "lucide-react";

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth(); 
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Champs du formulaire
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let mounted = true;
    const getProfileData = async () => {
      if (authLoading) return;
      if (!user) {
        if (mounted) setFetching(false);
        return;
      }
      try {
        if (mounted) setEmail(user.email || "");
        
        // Récupération du profil public
        const { data } = await supabase
          .from("user_profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (mounted) setFullName(data?.full_name || user.user_metadata?.full_name || "");
      } catch (err) {
        console.error("Erreur chargement profil:", err);
      } finally {
        if (mounted) setFetching(false);
      }
    };
    getProfileData();
    return () => { mounted = false; };
  }, [user, authLoading]);

  // Redirection si non connecté
  if (!fetching && !authLoading && !user) return <Navigate to="/auth/login" replace />;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage(null);

    try {
      // 1. Préparation de la mise à jour Auth (Email/Mot de passe/Métadonnées)
      const authUpdates: any = { 
        data: { full_name: fullName } 
      };

      // Si l'utilisateur veut changer son mot de passe
      if (newPassword) {
        if (newPassword.length < 6) throw new Error("Le mot de passe doit faire au moins 6 caractères.");
        if (newPassword !== confirmPassword) throw new Error("Les mots de passe ne correspondent pas.");
        authUpdates.password = newPassword;
      }

      const { error: authError } = await supabase.auth.updateUser(authUpdates);
      if (authError) throw authError;

      // 2. Mise à jour de la table publique user_profiles
      const { error: dbError } = await supabase.from("user_profiles").upsert({ 
          id: user?.id, 
          full_name: fullName, 
          updated_at: new Date().toISOString()
      });
      if (dbError) throw dbError;

      setMessage({ type: "success", text: "Profil mis à jour avec succès." });
      
      // Reset des champs mot de passe après succès
      setNewPassword("");
      setConfirmPassword("");

    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Erreur sauvegarde." });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth/login');
  };

  if (fetching || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#1a0525' }}>
        <Loader2 className="w-12 h-12 text-rose-400 animate-spin" />
      </div>
    );
  }

  return (
    // MEME FOND QUE LOGIN : #1a0525
    <div className="min-h-screen text-white pt-24 px-4 pb-12 relative overflow-hidden"
         style={{ background: '#1a0525' }}>
      
      {/* AURAS IDENTIQUES AU LOGIN */}
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-rose-500/20 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[5%] left-[-5%] w-[60%] h-[60%] bg-amber-400/15 blur-[160px] rounded-full"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3rem] p-8 md:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12 border-b border-white/10 pb-10 relative z-10">
            {/* Avatar Dégradé Or/Rose */}
            <div className="w-28 h-28 bg-gradient-to-br from-amber-300 to-rose-500 p-1 rounded-[2rem] shadow-2xl rotate-3">
              <div className="w-full h-full bg-[#2a0a2e] rounded-[1.8rem] flex items-center justify-center">
                 <UserRoundCog className="w-12 h-12 text-rose-200" strokeWidth={1.5} />
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-3 text-amber-200 shadow-lg shadow-amber-500/10">
                <Sparkles size={12} className="text-amber-300" /> Mon Espace
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase text-white drop-shadow-xl">
                Profil <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">User</span>
              </h1>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                message.type === "success" ? "bg-teal-500/20 text-teal-200 border border-teal-500/30" : "bg-rose-500/20 text-rose-200 border border-rose-500/30"
              }`}>
              {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="font-bold text-sm">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-8 relative z-10">
            
            {/* --- SECTION INFOS --- */}
            <div className="space-y-6">
                <div className="space-y-3">
                <label className="block text-xs font-bold text-rose-100/60 uppercase tracking-[0.2em] ml-2">Email</label>
                <input type="email" value={email} disabled
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-5 text-rose-100/50 cursor-not-allowed font-medium italic outline-none" />
                </div>

                <div className="space-y-3">
                <label className="block text-xs font-bold text-amber-100/60 uppercase tracking-[0.2em] ml-2">Nom complet</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-5 text-white text-lg focus:outline-none focus:border-amber-300 focus:bg-black/30 transition-all font-bold placeholder:text-white/20"
                    required />
                </div>
            </div>

            {/* --- SECTION MOT DE PASSE --- */}
            <div className="pt-6 border-t border-white/10 mt-6">
                <h3 className="text-amber-200 font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                    <Lock size={14} /> Sécurité & Mot de passe
                </h3>
                
                <div className="grid gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                    <div className="space-y-2">
                        <input 
                            type="password" 
                            placeholder="Nouveau mot de passe (si changement)" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-rose-400 transition-all font-bold placeholder:text-white/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <input 
                            type="password" 
                            placeholder="Confirmer le mot de passe" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-rose-400 transition-all font-bold placeholder:text-white/20"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-4 pt-4">
                <button type="button" onClick={handleLogout}
                    className="w-full md:w-auto px-8 py-4 bg-white/5 text-rose-200/60 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-500/10 hover:text-rose-200 transition-all flex items-center justify-center gap-2">
                    <LogOut size={16} /> Déconnexion
                </button>

                <button type="submit" disabled={loading}
                    className="flex-1 py-5 rounded-2xl bg-gradient-to-r from-amber-300 to-rose-500 text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enregistrer les modifications"}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;