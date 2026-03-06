import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // 🔥 Mise à jour Supabase v2
import { useCart } from "../contexts/CartContext";

import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  ShoppingBag,
  Share2,
  ShieldCheck,
  Loader2,
} from "lucide-react";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // ------------------------------------------------------------
  // 🔥 Chargement de l'événement (Supabase v2)
  // ------------------------------------------------------------
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("events")
          .select("*, ticket_types(*)")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Erreur event:", error);
        } else {
          setEvent(data);
        }
      } catch (err) {
        console.error("Erreur inattendue:", err);
      }

      setLoading(false);
    };

    fetchEvent();
  }, [id]);

  // ------------------------------------------------------------
  // 🔥 Ajout au panier
  // ------------------------------------------------------------
  const handleAddToCart = () => {
    if (!event) return;

    setAdding(true);

    const ticketInfo = event.ticket_types?.[0] || {};
    const price = ticketInfo.price || event.price || 50;
    const stripeId = ticketInfo.stripe_price_id || "price_default";

    addToCart({
      id: event.id,
      title: event.title,
      price: Number(price),
      image_url: event.image_url,
      date: event.date,
      location: event.location,
      stripe_price_id: stripeId,
    });

    setTimeout(() => {
      setAdding(false);
      navigate("/cart");
    }, 500);
  };

  // ------------------------------------------------------------
  // 🔥 Loading
  // ------------------------------------------------------------
  if (loading)
    return (
      <div className="min-h-screen bg-[#1a0525] flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-300" size={40} />
      </div>
    );

  // ------------------------------------------------------------
  // 🔥 Aucun événement trouvé
  // ------------------------------------------------------------
  if (!event)
    return (
      <div className="text-white text-center pt-20">
        Événement introuvable
      </div>
    );

  // ------------------------------------------------------------
  // 🔥 Affichage principal
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#1a0525] text-white pb-20">
      {/* HEADER IMAGE */}
      <div className="relative h-[50vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0525] via-[#1a0525]/50 to-transparent z-10"></div>

        <img
          src={
            event.image_url ||
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
          }
          alt={event.title}
          className="w-full h-full object-cover"
        />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-24 left-6 z-20 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all"
        >
          <ArrowLeft className="text-white" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-20">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-[10px] font-black uppercase tracking-widest mb-4">
                <SparklesIcon /> Événement Exclusif
              </div>

              <h1 className="text-4xl md:text-5xl font-black uppercase italic leading-tight mb-2">
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-white/60 text-sm mt-4">
                <span className="flex items-center gap-2">
                  <Calendar size={16} />{" "}
                  {new Date(event.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={16} /> 23:00
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={16} /> {event.location}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 min-w-[200px]">
              <div className="text-right">
                <p className="text-white/40 text-xs font-bold uppercase">
                  À partir de
                </p>
                <p className="text-4xl font-black text-amber-300">
                  {event.price || 50} €
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 my-8"></div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* DESCRIPTION */}
            <div className="md:col-span-2 space-y-6 text-white/70 leading-relaxed">
              <h3 className="text-xl font-bold text-white uppercase">
                Description
              </h3>
              <p>
                {event.description ||
                  "Aucune description disponible pour cet événement incroyable."}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <ShieldCheck className="text-teal-400" />
                  <span className="text-xs font-bold uppercase">
                    Billet Vérifié
                  </span>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <Share2 className="text-rose-400" />
                  <span className="text-xs font-bold uppercase">Partager</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="md:col-span-1">
              <div className="bg-[#13031C] p-6 rounded-3xl border border-white/10 sticky top-24">
                <p className="text-center text-white/50 text-sm mb-6">
                  Réservez votre place maintenant avant rupture du stock.
                </p>

                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="w-full py-4 bg-white text-[#1a0525] font-black uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                >
                  {adding ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ShoppingBag size={20} />
                  )}
                  {adding ? "Ajout..." : "Acheter le billet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icône Sparkles
const SparklesIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
  </svg>
);

export default EventDetailPage;