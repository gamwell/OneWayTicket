import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight, Loader2, Filter } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
        if (error) throw error;
        setEvents(data || []);
      } catch (error) { console.error('Error fetching events:', error); } 
      finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // FOND FORCÉ : Prune Profond (#1a0525)
    <div className="min-h-screen text-white relative overflow-hidden" style={{ background: '#1a0525' }}>
      
      {/* --- AMBIANCE LUMINEUSE --- */}
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>
        {/* Lumière Turquoise (Fraîcheur lointaine) */}
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-teal-500/10 blur-[130px] rounded-full"></div>
        {/* Lumière Rose (Chaleur proche) */}
        <div className="absolute bottom-[5%] right-[-5%] w-[55%] h-[55%] bg-rose-500/15 blur-[160px] rounded-full"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-24">
        
        {/* --- EN-TÊTE --- */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold tracking-[0.3em] uppercase mb-6 text-amber-200 shadow-lg">
            <Calendar size={14} className="text-amber-300" /> 
            Agenda Officiel
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic mb-8">
            Catalogue <br />
            {/* CORRECTION ICI : Ajout de 'pr-4' et 'inline-block' pour sauver la lettre F */}
            <span className="bg-gradient-to-r from-amber-200 via-rose-300 to-teal-200 bg-clip-text text-transparent py-2 pr-4 inline-block">
              EXCLUSIF
            </span>
          </h1>
          
          {/* BARRE DE RECHERCHE LUXE */}
          <div className="max-w-xl mx-auto relative group">
             {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-amber-400 to-teal-400 rounded-full opacity-20 group-hover:opacity-40 blur transition-opacity duration-500"></div>
            <div className="relative bg-[#2a0a2e]/80 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center shadow-2xl">
              <Search className="ml-4 text-white/40" size={20} />
              <input 
                type="text" 
                placeholder="Artiste, Lieu, Expérience..." 
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-white/30 px-4 font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="p-3 bg-white text-[#1a0525] rounded-full hover:bg-amber-300 transition-colors">
                <Filter size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* --- GRILLE ÉVÉNEMENTS --- */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-rose-400" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div key={event.id} className="group bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden hover:border-amber-300/30 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 shadow-2xl">
                
                {/* Image */}
                <div className="h-64 relative overflow-hidden">
                  <img 
                    src={event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80'} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-black italic uppercase leading-none mb-2 text-white line-clamp-2">{event.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-rose-100/60 font-medium">
                        <MapPin size={14} className="text-rose-400" />
                        {event.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                    <span className="text-3xl font-black text-amber-300">
                      {event.price}€
                    </span>
                    <Link 
                      to={`/events/${event.id}`} 
                      className="px-6 py-3 bg-white text-[#1a0525] rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-rose-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                      Réserver <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;