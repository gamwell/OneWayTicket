import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Type, Image as ImageIcon, Save, ArrowLeft, Loader2, Tag } from "lucide-react";
import { createEvent } from "@/services/events"; // <-- IMPORTANT

export default function AdminCreateEventPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    price: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createEvent(formData); // <-- UTILISE LA LOGIQUE CENTRALE
      alert("Événement créé avec succès !");
      navigate("/admin/events");
    } catch (error: any) {
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 pt-28 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={20} /> Retour
      </button>

      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl">
        <h1 className="text-4xl font-black uppercase italic mb-10">
          Créer un <span className="text-cyan-400">Événement</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* TITRE */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Type size={14} /> Titre
            </label>
            <input
              required
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4"
              placeholder="Ex: OneWay Festival 2026"
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* CATÉGORIE + PRIX */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CATÉGORIE */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Tag size={14} /> Catégorie
              </label>
              <select
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Choisir...</option>
                <option value="tech">Tech</option>
                <option value="musique">Musique</option>
                <option value="sport">Sport</option>
                <option value="theatre">Théâtre</option>
                <option value="voyage">Voyage</option>
              </select>
            </div>

            {/* PRIX */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Prix (€)
              </label>
              <input
                required
                type="number"
                min="0"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4"
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* DATE + LIEU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* DATE */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Calendar size={14} /> Date
              </label>
              <input
                required
                type="datetime-local"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4"
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            {/* LIEU */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <MapPin size={14} /> Lieu
              </label>
              <input
                required
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4"
                placeholder="Ex: Paris, France"
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">
              Description
            </label>
            <textarea
              required
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4"
              placeholder="Décrivez votre événement..."
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          {/* BOUTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase py-5 rounded-2xl flex items-center justify-center gap-3 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {loading ? "Création..." : "Enregistrer l'événement"}
          </button>
        </form>
      </div>
    </div>
  );
}
