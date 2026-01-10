import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Info } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

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
  const { addToCart, cart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  // Vérifier si l'événement est déjà dans le panier
  const isInCart = cart.some(item => item.id === event.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    addToCart(event);
    
    // Petit feedback visuel temporaire
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div 
      onClick={() => navigate(`/event/${event.id}`)}
      className="group bg-slate-900/50 backdrop-blur-sm rounded-[2rem] overflow-hidden border border-white/10 cursor-pointer hover:border-cyan-500/50 transition-all duration-300 shadow-xl"
    >
      {/* Image avec Overlay au survol */}
      <div className="h-52 overflow-hidden relative">
        <img 
          src={event.image_url} 
          alt={event.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-cyan-400 font-black text-sm">
          {event.price} €
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        <h3 className="text-xl font-black text-white mb-1 uppercase italic tracking-tighter truncate">
          {event.title}
        </h3>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
          <Info size={12} className="text-cyan-500" /> Cliquez pour détails
        </p>

        <button
          onClick={handleAddToCart}
          disabled={isInCart}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex justify-center items-center gap-2 transition-all ${
            isInCart 
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
              : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          }`}
        >
          {isInCart ? (
            <><Check size={16} /> DÉJÀ AU PANIER</>
          ) : isAdded ? (
            <><Check size={16} /> AJOUTÉ !</>
          ) : (
            <><ShoppingCart size={16} /> RÉSERVER MON BILLET</>
          )}
        </button>
      </div>
    </div>
  );
};