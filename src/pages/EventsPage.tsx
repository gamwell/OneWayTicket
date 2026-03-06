import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { EventCard } from "../components/EventCard";

type EventType = {
  id: string;
  title: string;
  price: number;
  image_url: string;
  date: string;
  location: string;
};

const EventsPage = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true });

        if (error) throw error;

        setEvents((data as EventType[]) || []);
      } catch (err) {
        console.error("Erreur chargement events:", err);
        setError("Impossible de charger les événements.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#1a0525] text-white pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
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
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-white/10">
            <p className="text-white/50 text-xl font-bold">
              Aucun événement prévu pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;