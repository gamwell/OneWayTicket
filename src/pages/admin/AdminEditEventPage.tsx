import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ArrowLeft, Save, Calendar, MapPin, Tag, Copy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getEventImage } from "@/utils/eventImages";

export default function AdminEditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    date: "",
    location: "",
    price: 0,
    description: "",
    image_url: ""
  });

  // Charger l'événement existant
  useEffect(() => {
    let isMounted = true;

    const loadEvent = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (isMounted && data) {
          setFormData({
            title: data.title || "",
            category: data.category || "",
            date: data.date ? data.date.slice(0, 16) : "", // Format pour datetime-local
            location: data.location || "",
            price: data.price || 0,
            description: data.description || "",
            image_url: data.image_url || ""
          });
        }
      } catch (error: any) {
        console.error("Load error:", error.message);
        alert("Erreur lors du chargement de l'événement");
        navigate("/admin/events");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadEvent();
    return () => { isMounted = false; };
  }, [id, navigate]);

  // Sauvegarder les modifications
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);

    try {
      const imageUrl = formData.image_url?.startsWith("http")
        ? formData.image_url
        : getEventImage({ id, category: formData.category });

      const { error } = await supabase
        .from("events")
        .update({
          ...formData,
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      alert("Événement mis à jour !");
      navigate("/admin/events");
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Logic de duplication séparée pour plus de clarté
  const handleDuplicate = async () => {
    if (!confirm("Dupliquer cet événement ?")) return;
    setDuplicating(true);

    try {
      const newId = crypto.randomUUID();
      const duplicatedData = {
        ...formData,
        title: `${formData.title} (copie)`,
        image_url: formData.image_url?.startsWith("http") 
          ? formData.image_url 
          : getEventImage({ id: newId, category: formData.category }),
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("events")
        .insert([duplicatedData])
        .select()
        .single();

      if (error) throw error;

      alert("Événement dupliqué !");
      navigate(`/admin/events/${data.id}/edit`);
    } catch (err: any) {
      alert("Erreur duplication : " + err.message);
    } finally {
      setDuplicating(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-cyan-400" size={60} />
        <p className="mt-4 text-slate-400 animate-pulse uppercase tracking-widest text-xs">Chargement du système...</p>
      </div>
    );

  return (
    <div className="min-h-screen p-8 pt-28 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour
        </button>

        <button
          onClick={handleDuplicate}
          disabled={duplicating}
          className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-50"
        >
          {duplicating ? <Loader2 className="animate-spin" size={18} /> : <Copy size={18} />}
          Dupliquer l'événement
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

        <h1 className="text-4xl font-black uppercase italic mb-10 relative z-10">
          Modifier <span className="text-cyan-400">l'Événement</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Titre</label>
            <input
              required
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-500/50 outline-none transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Tag size={14} /> Catégorie
              </label>
              <select
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-500/50 outline-none transition-all appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="" disabled className="bg-slate-900">Choisir...</option>
                <option value="tech" className="bg-slate-900">Tech</option>
                <option value="musique" className="bg-slate-900">Musique</option>
                <option value="sport" className="bg-slate-900">Sport</option>
                <option value="theatre" className="bg-slate-900">Théâtre</option>
                <option value="voyage" className="bg-slate-900">Voyage</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Prix (€)</label>
              <input
                required
                type="number"
                min="0"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-500/50 outline-none transition-all"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Calendar size={14} /> Date
              </label>
              <input
                required
                type="datetime-local"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-500/50 outline-none transition-all"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <MapPin size={14} /> Lieu
              </label>
              <input
                required
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-500/50 outline-none transition-all"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Description</label>
            <textarea
              required
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-500/50 outline-none transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">URL Image Distante (optionnel)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-500/50 outline-none transition-all"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 uppercase">Aperçu visuel</label>
            <div className="w-full h-64 rounded-3xl overflow-hidden border border-white/10 bg-slate-900/50 relative group">
              <img
                src={
                  formData.image_url?.startsWith("http")
                    ? formData.image_url
                    : getEventImage({ id: id || "preview", category: formData.category })
                }
                alt="Preview"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80"; // Fallback image
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? "Sauvegarde en cours..." : "Mettre à jour l'événement"}
          </button>
        </form>
      </div>
    </div>
  );
}