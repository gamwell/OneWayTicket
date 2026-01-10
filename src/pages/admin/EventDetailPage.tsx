import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { 
  Calendar, MapPin, Ticket, ChevronRight, 
  Loader2, Info, CheckCircle2, AlertTriangle, ArrowLeft
} from "lucide-react";
import { useCart } from "../contexts/CartContext";

// --- TYPES ---
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  capacity: number;
  sold_count: number;
}

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);
      
      // 1. Récupérer l'événement et ses types de billets
      const [eventRes, ticketsRes] = await Promise.all([
        supabase.from("events").select("*").eq("id", id).single(),
        supabase.from("ticket_types").select("*").eq("event_id", id).order("price", { ascending: true })
      ]);

      if (eventRes.data) setEvent(eventRes.data);
      if (ticketsRes.data) {
        setTicketTypes(ticketsRes.data);
        // Sélectionner par défaut le premier billet disponible
        const firstAvailable = ticketsRes.data.find(t => t.sold_count < t.capacity);
        if (firstAvailable) setSelectedTicket(firstAvailable);
      }
      
      setLoading(false);
    };

    fetchEventData();
  }, [id]);

  const handleAddToCart = () => {
    if (!event || !selectedTicket) return;

    addToCart({
      id: selectedTicket.id, // On utilise l'ID du type de billet
      event_id: event.id,
      title: event.title,
      ticket_name: selectedTicket.name,
      price: selectedTicket.price,
      quantity: 1,
      image_url: event.image_url
    });

    // Optionnel : Rediriger vers le panier ou afficher une notification
    navigate("/cart");
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <Loader2 className="animate-spin text-cyan-400" size={48} />
    </div>
  );

  if (!event) return <div className="text-white text-center py-20">Événement introuvable.</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] pb-20">
      {/* --- HERO SECTION --- */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img 
          src={event.image_url} 
          className="w-full h-full object-cover" 
          alt={event.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent"></div>
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-10 left-6 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* --- COLONNE GAUCHE : INFOS --- */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-6">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-xs tracking-widest">
                  <Calendar className="text-cyan-400" size={18} />
                  {new Date(event.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-xs tracking-widest">
                  <MapPin className="text-pink-500" size={18} />
                  {event.location}
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
              <h2 className="text-xl font-black italic uppercase mb-4 flex items-center gap-3">
                <Info size={20} className="text-cyan-400" /> À propos
              </h2>
              <p className="text-slate-400 leading-relaxed italic">
                {event.description || "Aucune description fournie pour cet événement."}
              </p>
            </div>
          </div>

          {/* --- COLONNE DROITE : BILLETTERIE --- */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 sticky top-32 shadow-2xl">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                <Ticket size={24} className="text-pink-500" /> Billetterie
              </h3>

              <div className="space-y-4 mb-8">
                {ticketTypes.map((type) => {
                  const isSoldOut = type.sold_count >= type.capacity;
                  const isSelected = selectedTicket?.id === type.id;

                  return (
                    <button
                      key={type.id}
                      disabled={isSoldOut}
                      onClick={() => setSelectedTicket(type)}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all relative overflow-hidden group
                        ${isSoldOut ? 'opacity-40 cursor-not-allowed grayscale border-white/5' : 
                          isSelected ? 'bg-white border-white scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-white/30'}
                      `}
                    >
                      <div className="text-left z-10">
                        <p className={`font-black uppercase italic text-sm tracking-tight ${isSelected ? 'text-black' : 'text-white'}`}>
                          {type.name}
                        </p>
                        <p className={`text-[10px] font-bold uppercase opacity-60 ${isSelected ? 'text-black' : 'text-slate-400'}`}>
                          {isSoldOut ? "Épuisé" : `Plus que ${type.capacity - type.sold_count} places`}
                        </p>
                      </div>
                      <div className={`text-right z-10 font-black italic text-lg ${isSelected ? 'text-black' : 'text-cyan-400'}`}>
                        {type.price}€
                      </div>
                      
                      {isSelected && !isSoldOut && (
                        <div className="absolute right-0 top-0 h-full w-1 bg-cyan-500"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedTicket ? (
                <button 
                  onClick={handleAddToCart}
                  className="w-full py-5 bg-cyan-500 text-[#0f172a] rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3"
                >
                  Ajouter au panier <ChevronRight size={18} />
                </button>
              ) : (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold uppercase tracking-widest text-center justify-center">
                  <AlertTriangle size={16} /> Sold Out
                </div>
              )}

              <p className="text-[9px] text-slate-500 font-bold uppercase text-center mt-6 tracking-widest">
                Paiement sécurisé via OneWayTicket Protocol
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;