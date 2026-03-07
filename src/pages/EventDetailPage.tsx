import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import DiscountRequestModal from "../components/DiscountRequestModal";
import {
  Calendar, MapPin, Clock, ArrowLeft, ShoppingBag,
  Share2, ShieldCheck, Loader2, Tag, Clock as ClockIcon,
} from "lucide-react";

const DISCOUNTS: Record<string, { label: string; rate: number; color: string }> = {
  "Étudiant":           { label: "Tarif Étudiant",  rate: 0.20, color: "text-blue-300 bg-blue-500/10 border-blue-500/30" },
  "Senior (+65 ans)":   { label: "Tarif Senior",    rate: 0.25, color: "text-teal-300 bg-teal-500/10 border-teal-500/30" },
};

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  // Profil utilisateur
  const [profileTypeName, setProfileTypeName] = useState<string | null>(null);
  const [discountStatus, setDiscountStatus] = useState<string>("none"); // none | pending | approved | rejected

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [eventRes, profileRes] = await Promise.all([
          supabase.from("events").select("*, ticket_types(*)").eq("id", id).single(),
          user
            ? supabase
                .from("user_profiles")
                .select("discount_status, profile_types(name)")
                .eq("id", user.id)
                .maybeSingle()
            : Promise.resolve({ data: null }),
        ]);

        if (eventRes.data) setEvent(eventRes.data);

        // Si pas de profil ou discount_status NULL → "none" pour afficher le bouton
        setDiscountStatus(profileRes.data?.discount_status ?? "none");
        setProfileTypeName(profileRes.data?.profile_types?.name || null);
      } catch (err) {
        console.error("Erreur:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, user]);

  const basePrice = event?.ticket_types?.[0]?.price || event?.price || 50;

  // Réduction active uniquement si approved
  const discount = discountStatus === "approved" && profileTypeName
    ? DISCOUNTS[profileTypeName] ?? null
    : null;

  const finalPrice = discount
    ? Math.round(basePrice * (1 - discount.rate) * 100) / 100
    : basePrice;

  // Appelé par le modal quand admin a déjà approuvé
  const handleDiscountApplied = (typeName: string, rate: number) => {
    setProfileTypeName(typeName);
    setDiscountStatus("approved");
  };

  const handleAddToCart = () => {
    if (!event) return;
    setAdding(true);
    const ticketInfo = event.ticket_types?.[0] || {};
    addToCart({
      id: event.id,
      title: event.title,
      price: finalPrice,
      image_url: event.image_url,
      date: event.date,
      location: event.location,
      stripe_price_id: ticketInfo.stripe_price_id || "price_default",
      discountLabel: discount?.label,
    });
    setTimeout(() => { setAdding(false); navigate("/cart"); }, 500);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#1a0525] flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-300" size={40} />
      </div>
    );

  if (!event)
    return <div className="text-white text-center pt-20">Événement introuvable</div>;

  return (
    <div className="min-h-screen bg-[#1a0525] text-white pb-20">

      {/* Modal justificatif */}
      {showDiscountModal && user && (
        <DiscountRequestModal
          userId={user.id}
          onClose={() => setShowDiscountModal(false)}
          onDiscountApplied={handleDiscountApplied}
        />
      )}

      {/* HEADER IMAGE */}
      <div className="relative h-[50vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0525] via-[#1a0525]/50 to-transparent z-10" />
        <img
          src={event.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"}
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
              <h1 className="text-4xl md:text-5xl font-black uppercase italic leading-tight mb-2">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-white/60 text-sm mt-4">
                <span className="flex items-center gap-2"><Calendar size={16} /> {new Date(event.date).toLocaleDateString()}</span>
                <span className="flex items-center gap-2"><Clock size={16} /> 23:00</span>
                <span className="flex items-center gap-2"><MapPin size={16} /> {event.location}</span>
              </div>
            </div>

            {/* PRIX */}
            <div className="flex flex-col gap-3 min-w-[200px] items-end">
              {discount ? (
                <>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black uppercase ${discount.color}`}>
                    <Tag size={12} /> {discount.label} -{Math.round(discount.rate * 100)}%
                  </div>
                  <p className="text-white/30 text-lg line-through">{basePrice} €</p>
                  <p className="text-4xl font-black text-amber-300">{finalPrice} €</p>
                </>
              ) : (
                <>
                  <p className="text-white/40 text-xs font-bold uppercase">À partir de</p>
                  <p className="text-4xl font-black text-amber-300">{basePrice} €</p>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 my-8" />

          <div className="grid md:grid-cols-3 gap-12">
            {/* DESCRIPTION */}
            <div className="md:col-span-2 space-y-6 text-white/70 leading-relaxed">
              <h3 className="text-xl font-bold text-white uppercase">Description</h3>
              <p>{event.description || "Aucune description disponible."}</p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <ShieldCheck className="text-teal-400" />
                  <span className="text-xs font-bold uppercase">Billet Vérifié</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <Share2 className="text-rose-400" />
                  <span className="text-xs font-bold uppercase">Partager</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="md:col-span-1">
              <div className="bg-[#13031C] p-6 rounded-3xl border border-white/10 sticky top-24 space-y-4">

                {/* Badge réduction approuvée */}
                {discount && (
                  <div className={`p-3 rounded-2xl border text-center ${discount.color}`}>
                    <p className="text-xs font-black uppercase">{discount.label} appliqué ✓</p>
                    <p className="text-lg font-black mt-1">Économie : {(basePrice - finalPrice).toFixed(2)} €</p>
                  </div>
                )}

                {/* Badge en attente */}
                {discountStatus === "pending" && (
                  <div className="p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-center">
                    <p className="text-amber-300 text-xs font-black uppercase flex items-center justify-center gap-1">
                      <ClockIcon size={12} /> Réduction en attente de validation
                    </p>
                    <p className="text-amber-300/50 text-[10px] mt-1">Prix normal appliqué jusqu'à validation</p>
                  </div>
                )}

                <p className="text-center text-white/50 text-sm">
                  Réservez votre place avant rupture du stock.
                </p>

                {/* Bouton acheter */}
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="w-full py-4 bg-white text-[#1a0525] font-black uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                >
                  {adding ? <Loader2 className="animate-spin" /> : <ShoppingBag size={20} />}
                  {adding ? "Ajout..." : `Acheter — ${finalPrice} €`}
                </button>

                {/* Bouton demander réduction — visible si connecté et pas encore approuvé/pending */}
                {user && discountStatus !== "approved" && discountStatus !== "pending" && (
                  <button
                    onClick={() => setShowDiscountModal(true)}
                    className="w-full py-3 border border-teal-500/30 bg-teal-500/10 text-teal-300 font-bold uppercase rounded-xl hover:bg-teal-500/20 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Tag size={14} /> Tarif réduit Étudiant / Senior
                  </button>
                )}

                {/* Info non connecté */}
                {!user && (
                  <p className="text-white/30 text-xs text-center">
                    Connectez-vous pour bénéficier de tarifs réduits
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SparklesIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
  </svg>
);

export default EventDetailPage;
