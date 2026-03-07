import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Loader2, Sparkles, AlertTriangle, Search, X } from "lucide-react";
import { EventCard } from "../components/EventCard";

type EventType = {
  id: string;
  title: string;
  price: number;
  image_url: string;
  date: string;
  location: string;
  category_id?: string;
};

type Category = {
  id: string;
  nom: string;
  description?: string;
};

const EventsPage = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Charger événements + catégories en parallèle
        const [eventsRes, catsRes] = await Promise.all([
          supabase.from("events").select("*").order("date", { ascending: true }),
          supabase.from("categories").select("id, nom, description").order("nom"),
        ]);

        if (eventsRes.error) throw eventsRes.error;
        setEvents((eventsRes.data as EventType[]) || []);
        setCategories((catsRes.data as Category[]) || []);
      } catch (err) {
        console.error("Erreur chargement:", err);
        setError("Impossible de charger les événements.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrage combiné : catégorie + recherche texte
  const filteredEvents = events.filter((event) => {
    const matchSearch = search === "" ||
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location?.toLowerCase().includes(search.toLowerCase());

    const matchCategory = !selectedCategory || event.category_id === selectedCategory;

    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-[#1a0525] text-white pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles size={12} /> Billetterie Officielle
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic mb-4">
            Prochains{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-500">
              Événements
            </span>
          </h1>
          <p className="text-white/50 max-w-xl mx-auto">
            Réservez vos places pour les soirées les plus exclusives du moment.
          </p>
        </div>

        {/* BARRE DE RECHERCHE */}
        <div className="relative max-w-xl mx-auto mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un événement, un lieu..."
            className="w-full pl-12 pr-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>

        {/* CHIPS CATÉGORIES */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {/* Chip "Tous" */}
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wider transition-all border ${
                selectedCategory === null
                  ? "bg-amber-400 text-black border-amber-400 shadow-lg shadow-amber-500/20"
                  : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              Tous
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(
                  selectedCategory === cat.id ? null : cat.id
                )}
                className={`px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wider transition-all border ${
                  selectedCategory === cat.id
                    ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20"
                    : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat.nom}
              </button>
            ))}
          </div>
        )}

        {/* Compteur résultats */}
        {!loading && !error && (
          <p className="text-center text-white/30 text-xs uppercase tracking-widest mb-8">
            {filteredEvents.length} événement{filteredEvents.length !== 1 ? "s" : ""}
            {selectedCategory && ` dans cette catégorie`}
            {search && ` pour "${search}"`}
          </p>
        )}

        {/* ÉTATS */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-amber-300 mb-4" size={48} />
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
              Chargement des données...
            </p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
            <AlertTriangle size={20} /> {error}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-white/10">
            <p className="text-white/50 text-xl font-bold mb-3">
              Aucun événement trouvé.
            </p>
            <button
              onClick={() => { setSearch(""); setSelectedCategory(null); }}
              className="text-amber-400 text-sm underline hover:text-amber-300"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default EventsPage;
