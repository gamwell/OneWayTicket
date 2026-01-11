"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { supabase } from "../lib/supabase"
import { Loader2, Music, Trophy, Theater, Plane, Cpu, SearchX, RefreshCcw, Star, LayoutGrid } from "lucide-react"
import { EventCard } from "@/components/events/EventCard"

// ✅ IMPORT DE LA LOGIQUE D'IMAGES (Depuis votre fichier utilitaire)
import { getEventImage } from "../utils/EventImages"

// --- MAPPING DES ICÔNES ---
const ICON_MAP: Record<string, React.ReactNode> = {
  Musique: <Music size={28} />,
  Concert: <Music size={28} />,
  Sport: <Trophy size={28} />,
  Théâtre: <Theater size={28} />,
  Spectacle: <Theater size={28} />,
  Tech: <Cpu size={28} />,
  iTech: <Cpu size={28} />,
  Conférence: <Cpu size={28} />,
  Voyage: <Plane size={28} />,
  Festival: <Star size={28} />,
  Autre: <LayoutGrid size={28} />,
}

const EventsPage = () => {
  // --- A. ÉTATS ---
  const [allEvents, setAllEvents] = useState<any[]>([])
  const [displayedEvents, setDisplayedEvents] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("TOUT")

  // --- B. CHARGEMENT DES DONNÉES ---
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: catsData, error: catsError } = await supabase.from("event_categories").select("*").order("id")

      if (catsError) throw catsError
      setCategories(catsData || [])

      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(
          `
          *,
          event_categories:event_categories!fk_event_category ( id, name, color )
        `,
        )
        .order("date", { ascending: true })

      if (eventsError) throw eventsError

      setAllEvents(eventsData || [])
      setDisplayedEvents(eventsData || [])
    } catch (error) {
      console.error("Erreur chargement EventsPage :", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // --- C. LOGIQUE DE FILTRE ---
  const handleFilter = (categoryId: string) => {
    setActiveFilter(categoryId)

    if (categoryId === "TOUT") {
      setDisplayedEvents(allEvents)
    } else {
      const filtered = allEvents.filter((e) => e.category_id === categoryId)
      setDisplayedEvents(filtered)
    }
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen w-full max-w-full flex flex-col items-center overflow-x-hidden">
      {/* --- HEADER --- */}
<div className="w-full max-w-full bg-gradient-to-b from-slate-900 via-[#070b14] to-[#070b14] pt-16 pb-8 flex flex-col items-center shadow-2xl relative z-10 overflow-visible">
   
	<header className="w-full px-6 md:px-12 mb-8 text-center overflow-visible">
       <h1 className="font-montserrat text-3xl md:text-5xl font-black uppercase tracking-tight">
           EXPLORER <br />
         <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
           L'AVENTURE
         </span>
       </h1>

    </header>

        {/* NAVIGATION */}
        <nav className="flex flex-wrap justify-center gap-4 px-4 max-w-7xl mx-auto w-full max-w-full overflow-hidden">
          {/* Bouton TOUT */}
          <button
            onClick={() => handleFilter("TOUT")}
            className={`px-8 py-4 rounded-full font-black uppercase text-lg flex items-center gap-3 transition-all border active:scale-95 ${
              activeFilter === "TOUT"
                ? "bg-white text-black border-white shadow-xl scale-105 ring-4 ring-white/20"
                : "bg-slate-800/50 text-slate-300 border-white/10 hover:bg-slate-700/50 hover:border-white/30 backdrop-blur-md"
            }`}
          >
            <RefreshCcw size={22} /> TOUS
          </button>

          {/* Boutons dynamiques */}
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.name] || <LayoutGrid size={22} />
            const isActive = activeFilter === cat.id

            const buttonStyle = isActive
              ? {
                  backgroundColor: cat.color,
                  borderColor: cat.color,
                  boxShadow: `0 0 25px ${cat.color}66`,
                }
              : {}

            return (
              <button
                key={cat.id}
                onClick={() => handleFilter(cat.id)}
                className={`px-8 py-4 rounded-full font-black uppercase text-lg flex items-center gap-3 transition-all border active:scale-95 ${
                  isActive
                    ? "text-white border-white scale-105 ring-2 ring-offset-2 ring-offset-[#070b14]"
                    : "bg-slate-800/50 text-slate-300 border-white/10 hover:bg-slate-700/50 hover:border-white/30 backdrop-blur-md"
                }`}
                style={buttonStyle}
              >
                {Icon} {cat.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* --- CONTENU --- */}
      <div className="w-full max-w-full bg-[#070b14] flex flex-col items-center pt-10 pb-20 px-6 min-h-[50vh] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center mt-20 gap-8">
            <Loader2 className="animate-spin text-cyan-500" size={80} />
            <p className="text-3xl font-black uppercase italic animate-pulse text-slate-500">Chargement...</p>
          </div>
        ) : displayedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-[90rem]">
            {displayedEvents.map((event) => {
              
              // ✅ GESTION DES IMAGES
              // 1. On récupère l'image de la BDD
              let finalImage = event.image_url;

              // 2. Si l'image est vide ou le lien cassé, on utilise la fonction importée
              if (!finalImage || !finalImage.startsWith("http")) {
                 finalImage = getEventImage(event.event_categories?.name || "default");
              }

              return <EventCard key={event.id} event={event} image={finalImage} />
            })}
          </div>
        ) : (
          <div className="mt-20 text-center flex flex-col items-center gap-8">
            <SearchX size={100} className="text-slate-800" />
            <p className="text-2xl font-bold text-slate-500 uppercase">Aucun événement trouvé</p>
            <button
              onClick={() => handleFilter("TOUT")}
              className="px-8 py-4 bg-cyan-900/30 text-cyan-400 rounded-xl border border-cyan-900 hover:bg-cyan-500 hover:text-white transition-colors uppercase font-bold"
            >
              Voir tout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsPage