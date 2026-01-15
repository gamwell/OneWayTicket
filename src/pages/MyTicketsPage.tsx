"use client"

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { getEventImage } from "../utils/galleryEvents";
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Loader2, 
  QrCode, 
  Trash2, 
  SearchX,
  ArrowRight,
  Sparkles
} from "lucide-react";
import TicketDownload from "../components/tickets/TicketDownload";

const MyTicketsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // --- 1. CHARGEMENT DES BILLETS ---
  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("tickets")
          .select(`
            *,
            events ( 
              id,
              title, 
              date, 
              location, 
              image_url,
              event_categories ( name )
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTickets(data || []);
      } catch (error) {
        console.error("Erreur chargement billets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  // --- 2. FONCTION DE SUPPRESSION ---
  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce billet ? Cette action est irréversible.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("tickets")
        .delete()
        .eq("id", ticketId);

      if (error) throw error;

      setTickets((prevTickets) => prevTickets.filter((t) => t.id !== ticketId));
    } catch (error: any) {
      console.error("Erreur suppression:", error);
      alert("Impossible de supprimer le billet : " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a0525]">
        <Loader2 className="animate-spin text-amber-300 mb-4" size={50} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Vérification de vos accès...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a0525] text-white px-6">
        <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 text-center max-w-md shadow-2xl">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
            <Ticket size={40} className="text-white/20" />
          </div>
          <h2 className="text-3xl font-black uppercase italic mb-4">Aucun billet</h2>
          <p className="text-white/40 mb-10 font-medium leading-relaxed">
            Votre collection OneWayTicket est encore vide. Trouvez votre prochaine expérience exclusive.
          </p>
          <button 
            onClick={() => navigate('/events')}
            className="w-full py-5 bg-white text-[#1a0525] font-black uppercase rounded-2xl transition-all hover:bg-amber-300 shadow-xl tracking-widest text-xs"
          >
            Explorer l'aventure
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-[#1a0525] text-white relative">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-teal-500/5 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[5%] right-[-5%] w-[55%] h-[55%] bg-rose-500/10 blur-[160px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-300/10 border border-amber-300/20 rounded-full text-[10px] font-black tracking-widest uppercase mb-6 text-amber-300">
            <Sparkles size={12} /> Espace Membre
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase leading-none tracking-tighter">
            Mes <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-500">Expériences</span>
          </h1>
        </header>

        {/* --- LISTE DES BILLETS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tickets.map((ticket) => {
            const isPast = new Date(ticket.events?.date) < new Date();
            const categoryName = ticket.events?.event_categories?.name || "Autre";
            const finalImage = ticket.events?.image_url || getEventImage(categoryName);

            return (
              <div 
                key={ticket.id} 
                className={`relative group bg-white/5 rounded-[2.5rem] overflow-hidden border transition-all duration-500 hover:-translate-y-2 flex flex-col h-full shadow-2xl ${
                  isPast ? "border-white/5 opacity-60" : "border-white/10 hover:border-amber-300/40"
                }`}
              >
                {/* Header Image */}
                <div className="h-48 bg-slate-900 relative overflow-hidden">
                  <img 
                    src={finalImage} 
                    alt={ticket.events?.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Badge Statut */}
                  <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    isPast 
                      ? "bg-black/40 text-white/40 border-white/10" 
                      : "bg-amber-300 text-black border-amber-300 shadow-lg"
                  }`}>
                    {isPast ? "Passé" : "Actif"}
                  </div>
                </div>

                {/* Corps de la carte */}
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-black uppercase italic mb-4 truncate text-white">
                    {ticket.events?.title || "Événement inconnu"}
                  </h3>
                  
                  <div className="space-y-3 text-white/40 text-[11px] font-bold uppercase tracking-wider mb-8">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-rose-500" />
                      <span>
                        {ticket.events?.date 
                          ? new Date(ticket.events.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
                          : "À confirmer"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-rose-500" />
                      <span>{ticket.events?.location || "Lieu secret"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-3 pt-6 border-t border-white/5">
                    <button 
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex-1 py-4 bg-white/10 hover:bg-white text-white hover:text-[#1a0525] rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <QrCode size={16} /> Mon Billet
                    </button>

                    <button 
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="p-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all active:scale-95 shadow-lg"
                      title="Annuler le billet"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MODAL DE TÉLÉCHARGEMENT --- */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f0214]/95 backdrop-blur-xl animate-in zoom-in duration-300">
          <div className="bg-[#2a0a2e] border border-white/10 rounded-[3rem] p-10 max-w-md w-full relative shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute top-6 right-6 p-2 text-white/30 hover:text-white transition-colors"
            >
              Fermer (ESC)
            </button>
            
            <header className="text-center mb-8">
              <h3 className="text-2xl font-black uppercase italic text-white mb-2">Accès <span className="text-amber-300">Privé</span></h3>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Présentez ce code à l'entrée</p>
            </header>
            
            <div className="bg-white rounded-[2rem] p-4">
               <TicketDownload 
                eventTitle={selectedTicket.events?.title}
                userName={user?.user_metadata?.full_name || user?.email || "Membre OneWay"}
                ticketId={selectedTicket.id}
                date={selectedTicket.events?.date}
                price={selectedTicket.final_price || 0}
              />
            </div>

            <p className="mt-8 text-center text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
              OneWayTicket Exclusive Access • Do not share
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;