"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
// Utilisation de votre galerie locale pour les images
import { getEventImage } from "../utils/galleryEvents" 

import { 
  Loader2, Music, Trophy, Theater, Plane, Cpu, SearchX, 
  RefreshCcw, Star, LayoutGrid, Search, MapPin, ArrowRight, 
  Lock, X, Sparkles 
} from "lucide-react"

const ICON_MAP = {
  Musique: <Music size={20} />, 
  Concert: <Music size={20} />,
  Sport: <Trophy size={20} />, 
  Théâtre: <Theater size={20} />,
  Spectacle: <Theater size={20} />, 
  Tech: <Cpu size={20} />,
  Voyage: <Plane size={20} />, 
  Festival: <Star size={20} />,
  Autre: <LayoutGrid size={20} />,
}

const EventsPage = () => {
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState([])
  const [displayedEvents, setDisplayedEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("TOUT")
  const [searchTerm, setSearchTerm] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true)
    try {
      const { data: catsData } = await supabase.from("event_categories").select("*").order("id")
      setCategories(catsData || [])

      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(`
          *,
          event_categories!fk_event_category (
            id,
            name,
            color
          )
        `)
        .order("date", { ascending: true })

      if (eventsError) throw eventsError;

      const cleanedEvents = (eventsData || []).map(event => ({
        ...event,
        category_data: Array.isArray(event.event_categories) 
          ? event.event_categories[0] 
          : event.event_categories
      }));

      setAllEvents(cleanedEvents)
      setDisplayedEvents(cleanedEvents)
    } catch (error) { 
      console.error("Erreur de récupération Supabase:", error) 
      const { data: fallbackData } = await supabase.from("events").select("*")
      setAllEvents(fallbackData || [])
      setDisplayedEvents(fallbackData || [])
    } finally { 
      setLoading(false) 
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // --- LOGIQUE DE FILTRE ET RECHERCHE ---
  useEffect(() => {
    let filtered = allEvents;
    if (activeFilter !== "TOUT") {
      filtered = filtered.filter(e => e.category_id === activeFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setDisplayedEvents(filtered);
  }, [activeFilter, searchTerm, allEvents]);

  const handleBookingClick = (eventId) => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate(`/events/${eventId}`);
      else setShowAuthModal(true);
    });
  };

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden" style={{ background: '#1a0525' }}>
      
      {/* EFFETS DE FOND LUMINEUX */}
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-teal-500/10 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[5%] right-[-5%] w-[55%] h-[55%] bg-rose-500/15 blur-[160px] rounded-full"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-24">
        
        {/* EN-TÊTE ET FILTRES */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-[0.3em] uppercase mb-6 text-amber-200">
            <Sparkles size={12} /> Agenda Officiel
          </div>

          {/* TITRE CORRIGÉ ICI */}
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic mb-10 leading-[1.1]">
            <span className="block">Explorer</span> 
            <span className="relative inline-block pr-8 -mr-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-500 overflow-visible">
              L'aventure
            </span>
          </h1>

          {/* BARRE DE RECHERCHE */}
          <div className="max-w-xl mx-auto relative mb-12 group">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-amber-400 to-teal-400 rounded-full opacity-20 blur transition-opacity"></div>
            <div className="relative bg-[#2a0a2e]/80 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center">
              <Search className="ml-4 text-white/40" size={20} />
              <input 
                type="text" 
                placeholder="Rechercher un événement..." 
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-white/30 px-4 font-bold outline-none" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>

          {/* NAVIGATION CATÉGORIES */}
          <nav className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => setActiveFilter("TOUT")} 
              className={`px-6 py-3 rounded-full font-black uppercase text-[10px] border transition-all ${activeFilter === "TOUT" ? "bg-white text-black border-white shadow-xl scale-105" : "bg-white/5 text-white/50 border-white/10"}`}
            >
              <RefreshCcw size={14} className="mr-2 inline" /> Tous
            </button>
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setActiveFilter(cat.id)} 
                className={`px-6 py-3 rounded-full font-black uppercase text-[10px] border transition-all ${activeFilter === cat.id ? "text-white border-white shadow-lg scale-105" : "bg-white/5 text-white/50 border-white/10"}`} 
                style={activeFilter === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
              >
                {ICON_MAP[cat.name] || <LayoutGrid size={14} className="mr-2 inline" />} {cat.name}
              </button>
            ))}
          </nav>
        </div>

        {/* GRILLE D'ÉVÉNEMENTS */}
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="animate-spin text-amber-300" size={40} />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Mise à jour...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedEvents.length > 0 ? (
              displayedEvents.map((event) => {
                const categoryName = event.category_data?.name || "Autre";
                const finalImage = getEventImage(categoryName);
                
                return (
                  <div key={event.id} className="group bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden hover:border-amber-300/30 transition-all duration-300 hover:-translate-y-2 flex flex-col h-full shadow-2xl">
                    <div className="h-64 relative overflow-hidden bg-slate-900">
                      <img src={finalImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-black text-amber-300 uppercase">
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div 
                        className="absolute bottom-4 left-4 px-3 py-1 rounded-lg text-[9px] font-black uppercase text-white shadow-lg"
                        style={{ backgroundColor: event.category_data?.color || '#334155' }}
                      >
                        {categoryName}
                      </div>
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-2xl font-black italic uppercase text-white mb-2 line-clamp-1">{event.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-rose-200/50 font-bold mb-6">
                        <MapPin size={14} className="text-rose-400" /> {event.location || "Lieu à confirmer"}
                      </div>
                      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                        <span className="text-3xl font-black text-amber-300">{event.price}€</span>
                        <button 
                          onClick={() => handleBookingClick(event.id)} 
                          className="px-6 py-4 bg-white text-[#1a0525] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-300 transition-all flex items-center gap-2 shadow-xl"
                        >
                          Réserver <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center gap-6 opacity-30">
                <SearchX size={80} />
                <p className="text-xl font-black uppercase tracking-widest italic text-center">Aucun événement</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL AUTHENTICATION */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#0f0214]/90 backdrop-blur-md" onClick={() => setShowAuthModal(false)}></div>
          <div className="bg-[#2a0a2e] border border-white/20 rounded-[2.5rem] p-10 max-w-sm w-full relative z-10 animate-in zoom-in">
              <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"><X size={20} /></button>
              <div className="flex flex-col items-center text-center">
                <Lock className="text-rose-400 mb-6" size={40} />
                <h3 className="text-2xl font-black uppercase text-white mb-2">Accès Privé</h3>
                <p className="text-white/50 text-xs mb-8 uppercase tracking-widest leading-relaxed">Connectez-vous pour réserver.</p>
                <button onClick={() => navigate('/auth/login')} className="w-full py-4 bg-white text-[#1a0525] rounded-xl font-black text-[10px] uppercase tracking-widest">Se connecter</button>
              </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventsPage;