import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Loader2, 
  QrCode, 
  Trash2, 
  AlertCircle 
} from "lucide-react";
import TicketDownload from "../components/tickets/TicketDownload"; // Assurez-vous que ce chemin est bon

const MyTicketsPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // État pour gérer l'affichage du ticket en mode "Téléchargement" (Modal ou section)
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // --- 1. CHARGEMENT DES BILLETS ---
  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("tickets")
          .select(`
            *,
            events:event_id ( title, date, location, image_url )
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
    // A. Confirmation de sécurité
    if (!window.confirm("Voulez-vous vraiment supprimer ce billet ? Cette action est irréversible.")) {
      return;
    }

    try {
      // B. Suppression dans Supabase
      const { error } = await supabase
        .from("tickets")
        .delete()
        .eq("id", ticketId);

      if (error) throw error;

      // C. Mise à jour visuelle (on retire le billet de la liste locale sans recharger la page)
      setTickets((prevTickets) => prevTickets.filter((t) => t.id !== ticketId));

    } catch (error: any) {
      console.error("Erreur suppression:", error);
      alert("Impossible de supprimer le billet : " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex justify-center bg-[#0f172a]">
        <Loader2 className="animate-spin text-cyan-400" size={40} />
      </div>
    );
  }

  // Si aucun billet
  if (tickets.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-12 flex flex-col items-center justify-center bg-[#0f172a] text-white px-4">
        <div className="bg-slate-800/50 p-10 rounded-3xl border border-white/10 text-center">
          <Ticket size={64} className="mx-auto text-slate-600 mb-6" />
          <h2 className="text-2xl font-black uppercase italic mb-4">Aucun billet trouvé</h2>
          <p className="text-slate-400 mb-8">Vous n'avez pas encore réservé d'aventure.</p>
          <Link 
            to="/events" 
            className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black uppercase rounded-xl transition-all"
          >
            Voir les événements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 bg-[#0f172a] text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black italic uppercase mb-10 flex items-center gap-3">
          <span className="text-cyan-400">Mes</span> Billets
        </h1>

        {/* --- LISTE DES BILLETS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tickets.map((ticket) => {
            // Vérifie si l'événement est passé (Optionnel : pour changer le style)
            const isPast = new Date(ticket.events?.date) < new Date();

            return (
              <div 
                key={ticket.id} 
                className={`relative group bg-slate-800 rounded-3xl overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-2xl ${
                  isPast ? "border-slate-700 opacity-75" : "border-white/10 hover:border-cyan-500/50"
                }`}
              >
                {/* En-tête Image */}
                <div className="h-32 bg-slate-700 relative overflow-hidden">
                  {ticket.events?.image_url && (
                    <img 
                      src={ticket.events.image_url} 
                      alt={ticket.events.title} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                    />
                  )}
                  {/* Badge Statut */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                    isPast ? "bg-slate-600 text-slate-300" : "bg-green-500 text-white shadow-lg shadow-green-500/20"
                  }`}>
                    {isPast ? "Terminé" : "Valide"}
                  </div>
                </div>

                {/* Corps de la carte */}
                <div className="p-6">
                  <h3 className="text-xl font-black uppercase italic mb-2 truncate">
                    {ticket.events?.title || "Événement inconnu"}
                  </h3>
                  
                  <div className="space-y-2 text-slate-400 text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-cyan-400" />
                      <span>
                        {ticket.events?.date 
                          ? new Date(ticket.events.date).toLocaleDateString() 
                          : "Date à définir"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-cyan-400" />
                      <span>{ticket.events?.location || "Lieu secret"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                    {/* Bouton Télécharger / Voir */}
                    <button 
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold uppercase text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <QrCode size={18} /> Billet
                    </button>

                    {/* ✅ BOUTON SUPPRIMER */}
                    <button 
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                      title="Supprimer ce billet"
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

      {/* --- MODAL DE TÉLÉCHARGEMENT (Si un ticket est sélectionné) --- */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full relative shadow-2xl">
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              Fermer
            </button>
            
            <h3 className="text-center text-xl font-black uppercase italic mb-4">Votre Billet</h3>
            
            <TicketDownload 
              eventTitle={selectedTicket.events?.title}
              userName={user?.email || "Participant"}
              ticketId={selectedTicket.id}
              date={selectedTicket.events?.date}
              price={selectedTicket.price_paid || 0} // Ou final_price selon votre table
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;