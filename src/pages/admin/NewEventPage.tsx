import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase"; // ✅ Correction du chemin
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";

import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Euro,
  Loader2,
  Calendar,
  MapPin,
} from "lucide-react";

const NewEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  // State du formulaire
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    date: "",
    category: "Concert",
    image: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      if (!supabase) throw new Error("Client Supabase non initialisé");
      if (!user) throw new Error("Utilisateur non authentifié");

      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue)) throw new Error("Le prix doit être un nombre.");

      // INSERTION
      const { error } = await supabase.from("events").insert([
        {
          title: formData.title,
          description: formData.description,
          price: priceValue,
          date: formData.date,
          category: formData.category,
          image: formData.image,
          location: formData.location,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      toast.success("Événement créé avec succès !");
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error("Erreur création:", error);
      toast.error("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Bouton Retour */}
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 uppercase text-[10px] font-black tracking-widest"
        >
          <ArrowLeft size={16} /> Retour au Dashboard
        </button>

        <header className="mb-12">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Nouvel <span className="text-cyan-400">Événement</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
            Configuration de la billetterie
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl"
        >
          {/* Titre */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
              Nom de l'événement
            </label>
            <input
              required
              type="text"
              placeholder="Ex: Techno Night Experience"
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-500 outline-none transition-all font-bold"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Prix */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Prix (€)
              </label>
              <div className="relative">
                <Euro className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  required
                  type="number"
                  placeholder="45"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-cyan-500 outline-none transition-all font-bold"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Catégorie
              </label>
              <select
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-500 outline-none transition-all font-bold appearance-none text-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Concert" className="text-black">Concert</option>
                <option value="Festival" className="text-black">Festival</option>
                <option value="Clubbing" className="text-black">Clubbing</option>
                <option value="Théâtre" className="text-black">Théâtre</option>
                <option value="Sport" className="text-black">Sport</option>
                <option value="Tech" className="text-black">Tech</option>
              </select>
            </div>
          </div>

          {/* Date & Lieu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  required
                  type="date"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-cyan-500 outline-none transition-all font-bold text-white uppercase"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            {/* Lieu */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Lieu
              </label>
              <div className="relative">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  required
                  type="text"
                  placeholder="Ex: Zenith, Paris"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-cyan-500 outline-none transition-all font-bold"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
              URL de l'image
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                required
                type="url"
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:border-cyan-500 outline-none transition-all font-bold"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
              Description
            </label>
            <textarea
              required
              rows={4}
              placeholder="Détails de l'événement..."
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-500 outline-none transition-all font-bold"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Bouton Validation */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-white text-slate-900 rounded-3xl font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {loading ? "Création en cours..." : "Publier l'événement"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewEventPage;