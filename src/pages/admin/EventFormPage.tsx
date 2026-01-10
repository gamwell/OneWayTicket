import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const EventFormPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Tech",
    price: 0,
    location: "",
    date: "",
    image_url: "",
    total_tickets: 100,
  });

  const categories = ["Tech", "Musique", "Théâtre", "Opéra", "Sport", "Congrès", "Expositions", "Manifestations", "Foires", "Voyage", "Croisière"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("events").insert([
        {
          ...formData,
          available_tickets: formData.total_tickets,
        },
      ]);

      if (error) throw error;
      
      alert("Événement créé avec succès !");
      navigate("/admin"); // Retour au dashboard après création
    } catch (error: any) {
      alert("Erreur lors de la création : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-2xl border border-slate-700">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
          Nouvel Événement
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Titre de l'événement</label>
            <input
              type="text"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-pink-500 outline-none"
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Catégorie</label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 outline-none"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Prix (€)</label>
              <input
                type="number"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 outline-none"
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Date</label>
              <input
                type="datetime-local"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 outline-none"
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Lieu</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 outline-none"
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">URL de l'image</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 outline-none"
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
            <textarea
              rows={4}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 outline-none"
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-600 to-cyan-600 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Création en cours..." : "Publier l'événement"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventFormPage;