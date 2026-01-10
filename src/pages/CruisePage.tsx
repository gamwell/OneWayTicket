import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

const CruisePage = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("events").select("*").eq("category", "Croisière").then(({ data }) => {
      setEvents(data || []);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] p-6">

      <h1 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent">
        Croisière 🚢
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition p-4">
            <img src={event.image_url} className="w-full h-48 object-cover rounded-xl mb-4" />

            <h2 className="text-xl font-bold">{event.title}</h2>
            <p className="text-gray-500">{event.city}, {event.country}</p>

            <p className="mt-2 text-sm text-gray-600">{event.description?.substring(0, 80)}...</p>

            <p className="mt-3 font-semibold text-lg text-[#1E88E5]">{event.price} €</p>

            <Link
              to={`/event/${event.id}`}
              className="mt-4 block text-center px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#0D47A1] text-white font-semibold hover:opacity-90 transition"
            >
              Voir détails
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CruisePage;
