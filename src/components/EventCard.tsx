import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, Calendar, MapPin } from "lucide-react";
import { useCart } from "../contexts/CartContext";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    price: number;
    image_url: string;
    date: string;
    location: string;
  };
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const isInCart = cart.some((item) => item.id === event.id);
  const [imgSrc, setImgSrc] = useState(event.image_url || FALLBACK_IMAGE);

  return (
    <div
      onClick={() => navigate(`/events/${event.id}`)}
      className="group bg-slate-900/50 backdrop-blur-sm rounded-[2rem] overflow-hidden border border-white/10 cursor-pointer hover:border-cyan-500/50 transition-all duration-300 shadow-xl"
    >
      <div className="h-52 overflow-hidden relative">
        <img
          src={imgSrc}
          alt={event.title}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-cyan-400 font-black text-sm">
          {event.price} €
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-black text-white mb-2 uppercase italic tracking-tighter truncate">
          {event.title}
        </h3>
        <div className="flex flex-col gap-1 mb-5">
          {event.location && (
            <p className="text-slate-400 text-xs font-bold flex items-center gap-2">
              <MapPin size={11} className="text-cyan-500 flex-shrink-0" /> {event.location}
            </p>
          )}
          {event.date && (
            <p className="text-slate-400 text-xs font-bold flex items-center gap-2">
              <Calendar size={11} className="text-cyan-500 flex-shrink-0" />
              {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex justify-center items-center gap-2 transition-all ${
            isInCart
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          }`}
        >
          {isInCart ? (
            <><Check size={16} /> DÉJÀ AU PANIER</>
          ) : (
            <><ArrowRight size={16} /> RÉSERVER MON BILLET</>
          )}
        </button>
      </div>
    </div>
  );
};
