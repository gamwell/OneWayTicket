import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabaseClient";
import { User, Mail, Save, Loader2, Shield } from "lucide-react";

const ProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Charger le profil dans le formulaire
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
  }, [profile]);

  // 🔥 Mise à jour du profil (Supabase v2)
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!user) throw new Error("Utilisateur non connecté");

      const updates = {
        id: user.id,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("user_profiles")
        .upsert(updates);

      if (error) throw error;

      await refreshProfile();
      setMessage("Profil mis à jour avec succès !");
    } catch (err: any) {
      console.error("Erreur update profile:", err);
      setMessage("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a0525] text-white pt-24 pb-10 px-6">
      <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-amber-300 rounded-full flex items-center justify-center text-[#1a0525]">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic">Mon Profil</h1>
            <p className="text-white/50 text-sm">Gérez vos informations personnelles</p>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`p-4 mb-6 rounded-xl text-center font-bold ${
              message.includes("succès")
                ? "bg-teal-500/20 text-teal-300"
                : "bg-rose-500/20 text-rose-300"
            }`}
          >
            {message}
          </div>
        )}

        {/* FORMULAIRE */}
        <form onSubmit={updateProfile} className="space-y-6">

          {/* EMAIL */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">
              Email
            </label>
            <div className="flex items-center gap-3 bg-black/20 p-4 rounded-xl border border-white/5 text-white/50">
              <Mail size={18} />
              <span>{user?.email}</span>
              <Shield size={14} className="ml-auto text-teal-400" />
            </div>
          </div>

          {/* NOM COMPLET */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">
              Nom Complet
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 p-4 pl-12 rounded-xl text-white focus:border-amber-300 outline-none transition-colors"
              />
            </div>
          </div>

          {/* BOUTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-[#1a0525] font-black uppercase rounded-xl hover:bg-amber-300 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Enregistrer les modifications
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;