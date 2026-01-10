import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase"; // Assurez-vous que le chemin est bon
import { useNavigate, Navigate } from "react-router-dom";
import { UserRoundCog, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const ProfilePage = () => {
  // On récupère 'user' et 'loading' du contexte auth
  const { user, loading: authLoading } = useAuth(); 
  const navigate = useNavigate();

  // État local de la page
  const [loading, setLoading] = useState(false); // Pour l'envoi du formulaire
  const [fetching, setFetching] = useState(true); // Pour le chargement initial des données
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Champs du formulaire
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // --- 1. CHARGEMENT OPTIMISÉ (Non-bloquant) ---
  useEffect(() => {
    let mounted = true;

    const getProfileData = async () => {
      // Si l'auth global charge encore, on attend
      if (authLoading) return;

      // Si pas d'utilisateur après chargement auth, on arrête (le redirect se fera plus bas)
      if (!user) {
        if (mounted) setFetching(false);
        return;
      }

      try {
        if (mounted) setEmail(user.email || "");

        // A. On tente de récupérer les données fraîches de la table 'user_profiles'
        const { data, error } = await supabase
          .from("user_profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (mounted) {
          if (data && data.full_name) {
            // Priorité 1 : Données de la base de données
            setFullName(data.full_name);
          } else {
            // Priorité 2 : Métadonnées Auth (fallback)
            setFullName(user.user_metadata?.full_name || "");
          }
        }
      } catch (err) {
        console.error("Erreur chargement profil:", err);
      } finally {
        if (mounted) setFetching(false);
      }
    };

    getProfileData();

    // Cleanup function
    return () => { mounted = false; };
  }, [user, authLoading]);


  // --- 2. REDIRECTION DE SÉCURITÉ ---
  if (!fetching && !authLoading && !user) {
    return <Navigate to="/auth/login" replace />;
  }


  // --- 3. MISE À JOUR DU PROFIL ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage(null);

    try {
      // A. Mise à jour des MetaData Auth (Supabase Auth)
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
      if (authError) throw authError;

      // B. Mise à jour de la table 'user_profiles' (Base de données)
      const { error: dbError } = await supabase
        .from("user_profiles")
        .upsert({ 
          id: user?.id, // Important pour le upsert
          full_name: fullName,
          updated_at: new Date().toISOString()
        });
      
      if (dbError) throw dbError;

      setMessage({
        type: "success",
        text: "Profil mis à jour avec succès !",
      });

      // Petit délai avant redirection (optionnel)
      setTimeout(() => {
        // Optionnel : recharger la page ou rediriger
        // navigate("/dashboard"); 
      }, 1500);

    } catch (error: any) {
      console.error("Erreur update:", error);
      setMessage({ 
        type: "error", 
        text: error.message || "Une erreur est survenue lors de la mise à jour." 
      });
    } finally {
      setLoading(false);
    }
  };

  // --- 4. ÉCRAN DE CHARGEMENT ---
  if (fetching || authLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">
          Synchronisation du profil...
        </p>
      </div>
    );
  }

  // --- 5. INTERFACE PRINCIPALE ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white pt-24 px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Décoration de fond */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center gap-6 mb-10 border-b border-white/10 pb-8 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-3">
              <UserRoundCog className="w-12 h-12 text-white" strokeWidth={2} />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-black tracking-tighter italic uppercase">Mon Profil</h1>
              <p className="text-slate-400 font-medium">Paramètres du compte & sécurité</p>
            </div>
          </div>

          {message && (
            <div
              className={`p-4 rounded-2xl mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                message.type === "success"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
              }`}
            >
              {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="font-bold text-sm">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-8 relative z-10">
            {/* Email (Lecture seule) */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                Identifiant Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-slate-500 cursor-not-allowed font-medium italic outline-none"
              />
            </div>

            {/* Nom complet */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-300 uppercase tracking-[0.2em] ml-1">
                Nom d'affichage
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Votre nom ou pseudonyme"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all font-bold placeholder:text-slate-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 font-black text-white uppercase tracking-tighter text-lg shadow-xl shadow-pink-500/20 hover:shadow-pink-500/40 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-3"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Enregistrer les modifications"
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;