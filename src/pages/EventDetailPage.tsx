import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Calendar, MapPin, ArrowLeft, Loader, Ticket, ShoppingCart, CheckCircle } from 'lucide-react';
import { Event, TicketPriceView } from '../types'; // Assure-toi d'avoir mis à jour types.ts

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [event, setEvent] = useState<Event | null>(null);
  const [ticketOptions, setTicketOptions] = useState<TicketPriceView[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketPriceView | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    if (id) {
      loadEventData();
    }
  }, [id, user]);

  const loadEventData = async () => {
    try {
      setLoading(true);

      // 1. Récupérer les infos de l'événement
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // 2. Déterminer le type de profil de l'utilisateur
      let profileTypeId = 1; // Par défaut "Standard" (ID 1)
      
      if (user) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('profile_type_id')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          profileTypeId = profileData.profile_type_id;
        }
      }

      // 3. Récupérer les tarifs via la VUE CALCULATRICE
      // On demande les prix pour cet événement ET pour ce type de profil
      const { data: pricesData, error: pricesError } = await supabase
        .from('view_ticket_prices')
        .select('*')
        .eq('event_id', id)
        .eq('profile_type_id', profileTypeId);

      if (pricesError) throw pricesError;
      
      setTicketOptions(pricesData || []);

      // Sélectionner le premier billet par défaut s'il y en a
      if (pricesData && pricesData.length > 0) {
        setSelectedTicket(pricesData[0]);
      }

    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ AJOUT AU PANIER (Modifié pour inclure le type de billet)
  const handleAddToCart = () => {
    if (!event || !selectedTicket) return;

    addToCart({
      id: selectedTicket.ticket_type_id, // On utilise l'ID du type de billet comme ID unique panier
      title: `${event.title} - ${selectedTicket.ticket_name}`,
      price: selectedTicket.final_price,
      image_url: event.image_url || '', // Gestion cas null
      date: event.date,
      location: event.location,
    });
    
    // Feedback visuel ou notification ici si tu veux
    alert("Billet ajouté au panier !");
  };

  // ✅ RÉSERVATION DIRECTE (Mise à jour pour la nouvelle structure DB)
  const handleBooking = async () => {
    if (!user) {
      if (window.confirm("Connectez-vous pour réserver.")) navigate('/auth/login');
      return;
    }
    if (!event || !selectedTicket) return;

    try {
      setBuying(true);

      // ÉTAPE 1 : Créer une commande (Order)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          total_amount: selectedTicket.final_price,
          status: 'paid' // Pour l'exemple direct
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // ÉTAPE 2 : Créer le billet lié à la commande
      const { error: ticketError } = await supabase
        .from('tickets')
        .insert([{
          order_id: orderData.id,
          event_id: event.id,
          ticket_type_id: selectedTicket.ticket_type_id,
          final_price: selectedTicket.final_price,
          holder_name: user.user_metadata?.full_name || 'Moi',
          status: 'valid'
        }]);

      if (ticketError) throw ticketError;

      navigate('/my-tickets'); // Redirection vers mes billets
    } catch (error) {
      console.error("Erreur achat:", error);
      alert("Erreur lors de la réservation.");
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader className="animate-spin text-cyan-500" size={40} />
      </div>
    );
  }

  if (!event) return <div className="text-white text-center pt-32">Événement introuvable</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* COLONNE GAUCHE : IMAGE & INFO */}
        <div>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 group">
             {/* Fallback image si pas d'image_url */}
            <img 
              src={event.image_url || "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80"} 
              alt={event.title} 
              className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-6">
              <span className="px-3 py-1 bg-pink-500 text-xs font-bold uppercase tracking-wider rounded-full mb-3 inline-block">
                Concert
              </span>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">{event.title}</h1>
          
          <div className="flex flex-col gap-3 text-gray-300 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="text-cyan-400" size={20} />
              <span>{new Date(event.date).toLocaleDateString('fr-FR', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' 
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-pink-500" size={20} />
              <span>{event.location}</span>
            </div>
          </div>
          
          <p className="text-gray-400 leading-relaxed text-lg">
            {event.description}
          </p>
        </div>

        {/* COLONNE DROITE : SÉLECTION BILLETS */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 h-fit sticky top-28">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Ticket className="text-pink-500" /> Choisir vos places
          </h3>

          {/* LISTE DES BILLETS */}
          <div className="space-y-4 mb-8">
            {ticketOptions.length === 0 ? (
              <p className="text-gray-400">Aucun billet disponible pour le moment.</p>
            ) : (
              ticketOptions.map((ticket) => (
                <div 
                  key={ticket.ticket_type_id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`
                    relative p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center group
                    ${selectedTicket?.ticket_type_id === ticket.ticket_type_id 
                      ? 'border-cyan-500 bg-cyan-500/10' 
                      : 'border-white/10 hover:border-white/30 bg-white/5'}
                  `}
                >
                  <div>
                    <h4 className="font-bold text-lg">{ticket.ticket_name}</h4>
                    {/* Affichage intelligent du prix barré si réduction */}
                    {ticket.final_price < ticket.base_price ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400 line-through text-sm">{ticket.base_price}€</span>
                        <span className="text-green-400 font-bold">{ticket.final_price}€</span>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full ml-2">
                          Offre {ticket.profile_name}
                        </span>
                      </div>
                    ) : (
                      <div className="text-gray-300 font-bold mt-1">{ticket.base_price}€</div>
                    )}
                  </div>

                  {selectedTicket?.ticket_type_id === ticket.ticket_type_id && (
                    <CheckCircle className="text-cyan-500" size={24} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* RÉSUMÉ ET BOUTONS */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400">Total à payer</span>
              <span className="text-3xl font-bold text-white">
                {selectedTicket ? selectedTicket.final_price : 0}€
              </span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedTicket}
                className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-all"
              >
                <ShoppingCart size={20} /> Panier
              </button>

              <button
                onClick={handleBooking}
                disabled={buying || !selectedTicket}
                className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-all"
              >
                {buying ? <Loader className="animate-spin" /> : <><Ticket size={20} /> Réserver</>}
              </button>
            </div>
            {!user && (
              <p className="text-xs text-center text-gray-500 mt-4">
                Connectez-vous pour voir vos tarifs réduits (Étudiant, VIP...)
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventDetailPage;