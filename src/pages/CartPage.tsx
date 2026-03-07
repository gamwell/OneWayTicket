import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Loader2, Tag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

// Mêmes constantes de réduction
const DISCOUNTS: Record<string, { label: string; rate: number }> = {
  "Étudiant":           { label: "Tarif Étudiant -20%",  rate: 0.20 },
  "Senior (+65 ans)":   { label: "Tarif Senior -25%",    rate: 0.25 },
};

export default function CartPage() {
  const { cart, removeFromCart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Les prix dans le cart sont déjà réduits (appliqués dans EventDetailPage)
  // On affiche juste le détail de la réduction si elle existe
  const hasDiscount = cart.some(item => item.discountLabel);

  const handlePayment = async () => {
    if (!user) { navigate('/auth/login'); return; }
    setLoading(true);
    try {
      const priceInCents = Math.round(total * 100);
      const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
      const mainEventId = cart[0]?.id;
      const mainEventTitle = cart[0]?.title;

      if (!mainEventId) throw new Error("Panier invalide.");

      const { data, error } = await supabase.functions.invoke('create-checkout-reservation', {
        body: {
          priceInCents,
          quantity: totalQuantity,
          email: user.email,
          reservationId: `CMD-${Date.now()}`,
          baseUrl: window.location.origin,
          userId: user.id,
          eventId: mainEventId,
          eventName: mainEventTitle,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Pas d'URL renvoyée.");
      }
    } catch (error: any) {
      console.error("Erreur Paiement:", error);
      alert(`Erreur : ${error.message || "Impossible de contacter le serveur."}`);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center text-center text-white">
        <div className="bg-white/5 p-8 rounded-full mb-6">
          <ShoppingBag className="w-16 h-16 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
        <p className="text-gray-400 mb-8 max-w-md">Découvrez nos prochaines soirées !</p>
        <button
          onClick={() => navigate('/events')}
          className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-xl font-bold transition hover:scale-105"
        >
          Parcourir les événements
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto text-white">
      <h1 className="text-4xl font-bold mb-12">Votre Panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Articles */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-6 items-center hover:bg-white/10 transition">
              <img src={item.image_url} alt={item.title} className="w-24 h-24 object-cover rounded-xl" />
              <div className="flex-grow">
                <h3 className="font-bold text-xl mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{item.location} • {item.date}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-white/10 px-3 py-1 rounded-lg text-sm">Qté: {item.quantity}</span>
                  <span className="font-mono text-amber-400 text-lg">{(item.price * item.quantity).toFixed(2)} €</span>
                  {/* ✅ Badge réduction si applicable */}
                  {item.discountLabel && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full text-teal-300 text-xs font-bold">
                      <Tag size={10} /> {item.discountLabel}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <button onClick={clearCart} className="text-red-400 text-sm hover:text-red-300 transition flex items-center gap-2 mt-4">
            <Trash2 size={14} /> Vider le panier
          </button>
        </div>

        {/* Résumé */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sticky top-28">
            <h2 className="text-2xl font-bold mb-6">Résumé</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-400">
                <span>Sous-total</span>
                <span>{total.toFixed(2)} €</span>
              </div>

              {/* ✅ Ligne réduction si applicable */}
              {cart.some(i => i.discountLabel) && (
                <div className="flex justify-between text-teal-400 text-sm">
                  <span className="flex items-center gap-1"><Tag size={12} /> Réduction appliquée</span>
                  <span>incluse ✓</span>
                </div>
              )}

              <div className="flex justify-between text-gray-400">
                <span>Frais</span>
                <span>0.00 €</span>
              </div>
              <div className="h-px bg-white/10 my-4"></div>
              <div className="flex justify-between text-2xl font-bold text-amber-400">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition transform ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:scale-105 active:scale-95 text-white shadow-lg shadow-orange-500/20'
              }`}
            >
              {loading ? <><Loader2 className="animate-spin" /> Préparation...</> : <>Payer maintenant <ArrowRight size={20} /></>}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4">Paiement 100% sécurisé via Stripe SSL</p>
          </div>
        </div>
      </div>
    </div>
  );
}
