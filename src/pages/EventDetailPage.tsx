"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getEventImage } from "../utils/galleryEvents";
import { 
  Loader2, ArrowLeft, Ticket, Calendar, 
  MapPin, ShieldCheck, ShoppingCart, Check 
} from 'lucide-react';

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  // --- CHARGEMENT DES DONNÉES DE L'ÉVÉNEMENT ---
  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`*, event_categories!fk_event_category(name)`)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setEvent(data);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- ACTION : AJOUTER AU PANIER (CORRIGÉ POUR STRIPE) ---
  const handleAddToCart = async () => {
    if (!event) return;

    try {
      // Pour que le panier fonctionne avec Stripe, on doit envoyer l'ID du TYPE de billet
      const { data: ticketTypes, error: typeError } = await supabase
        .from('ticket_types')
        .select('id')
        .eq('event_id', id);

      if (typeError || !ticketTypes || ticketTypes.length === 0) {
        alert("⚠️ Impossible d'ajouter au panier : aucun tarif n'est configuré pour cet événement.");
        return;
      }

      const selectedTicketType = ticketTypes[0];

      // On ajoute au panier en utilisant l'ID du ticket_type
      addToCart({
        id: selectedTicketType.id, // ID requis par la Edge Function Stripe
        event_id: event.id,
        title: event.title,
        price: event.price,
        image_url: getEventImage(event?.event_categories?.name),
        date: event.date,
        location: event.location
      });

      alert("🎟️ Ajouté au panier !");
    } catch (err) {
      console.error("Erreur ajout panier:", err);
    }
  };

  // --- ACTION : ACHAT DIRECT VIA STRIPE ---
  const handleBooking = async () => {
    if (!user) {
      navigate('/auth/login', { state: { from: `/event/${id}` } });
      return;
    }

    try {
      setBuying(true);

      const { data: ticketTypes, error: typeError } = await supabase
        .from('ticket_types')
        .select('id, name')
        .eq('event_id', id);

      if (typeError || !ticketTypes || ticketTypes.length === 0) {
        alert("⚠️ Aucun tarif n'est configuré pour cet événement.");
        setBuying(false);
        return;
      }

      const selectedTicketType = ticketTypes[0];

      const { data, error: functionError } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          ticketTypeIds: [selectedTicketType.id],
          quantities: [1],
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/event/${id}?payment=cancelled`,
        },
      });

      if (functionError) throw functionError;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Lien de paiement non généré.");
      }
      
    } catch (err: any) {
      console.error("Erreur paiement:", err);
      alert("Erreur : " + (err.message || "Le service de paiement est indisponible."));
    } finally {
      setBuying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1a0525] flex items-center justify-center">
      <Loader2 className="animate-spin text-amber-300" size={50} />
    </div>
  );

  const eventImage = getEventImage(event?.event_categories?.name);

  return (
    <div className="min-h-screen bg-[#1a0525] text-white pb-20">
      {/* HEADER IMAGE */}
      <div className="relative h-[50vh] w-full">
        <img src={eventImage} className="w-full h-full object-cover" alt={event?.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0525] to-transparent" />
        <button 
          onClick={() => navigate('/events')} 
          className="absolute top-24 left-6 p-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-all z-20"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="container mx-auto px-6 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-8">
            <h1 className="text-5xl md:text-7xl font-black uppercase italic leading-none">
              {event?.title}
            </h1>
            
            <div className="flex flex-wrap gap-6 text-white/50 font-bold uppercase text-xs tracking-widest">
              <div className="flex items-center gap-2">
                <Calendar className="text-amber-300" size={18} />
                {event?.date ? new Date(event.date).toLocaleDateString() : 'Date à venir'}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="text-rose-500" size={18} />
                {event?.location || 'Lieu secret'}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/10">
              <p className="text-white/70 leading-relaxed text-xl font-medium">
                {event?.description || "Aucune description disponible pour cet événement exclusif."}
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white text-[#1a0525] p-8 rounded-[3rem] shadow-2xl sticky top-28">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-1">Pass Access</p>
                  <span className="text-5xl font-black italic">{event?.price}€</span>
                </div>
                <Ticket className="text-rose-500 mb-2" size={32} />
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleBooking}
                  disabled={buying}
                  className="w-full py-5 bg-[#1a0525] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-70"
                >
                  {buying ? <Loader2 className="animate-spin" /> : "Acheter ce billet"}
                </button>

                <div className="space-y-2">
                  <button 
                    onClick={handleAddToCart}
                    className="w-full py-4 border-2 border-[#1a0525]/10 text-[#1a0525] rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95"
                  >
                    <ShoppingCart size={16} /> Ajouter au panier
                  </button>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-[9px] font-black uppercase opacity-40">
                <ShieldCheck size={14} /> Garantie OneWay Secure
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;