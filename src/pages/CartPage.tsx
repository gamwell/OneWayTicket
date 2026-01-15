"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

import {
  ShoppingBag,
  CreditCard,
  Trash2,
  ArrowLeft,
  Loader2,
  TicketCheck,
  Sparkles
} from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, total, removeFromCart } = useCart();

  const [isLoading, setIsLoading] = useState(false);

  // ---------------------------------------------------------
  // 🔥 VERSION OPTIMISÉE DE handlePayment()
  // ---------------------------------------------------------
  const handlePayment = async () => {
    if (!user) {
      alert("Vous devez être connecté pour finaliser votre achat !");
      navigate('/auth/login', { state: { from: '/cart' } });
      return;
    }

    if (cart.length === 0) return;

    setIsLoading(true);

    try {
      const ticketTypeIds = cart.map(item => item.id);
      const quantities = cart.map(item => item.quantity || 1);

      const { data, error } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            ticketTypeIds,
            quantities,
            user_id: user.id, // 🔥 obligatoire
            successUrl: `${window.location.origin}/dashboard?payment=success`,
            cancelUrl: `${window.location.origin}/cart?payment=cancelled`,
          },
        }
      );

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Le service de paiement n'a pas pu générer de lien.");
      }

    } catch (error: any) {
      console.error("Erreur paiement panier:", error);
      alert(error.message || "Erreur lors de la liaison avec Stripe.");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 🛒 PANIER VIDE
  // ---------------------------------------------------------
  if (cart.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 text-white relative overflow-hidden"
        style={{ background: '#1a0525' }}
      >
        <div className="fixed inset-0 z-[0] pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-rose-500/15 blur-[130px] rounded-full"></div>
          <div className="absolute bottom-[5%] right-[-5%] w-[60%] h-[60%] bg-amber-400/10 blur-[160px] rounded-full"></div>
        </div>

        <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 text-center max-w-md backdrop-blur-xl relative z-10 shadow-2xl">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-white/20" size={40} />
          </div>

          <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4">
            Panier vide
          </h2>

          <p className="text-rose-100/50 mb-8 font-medium">
            L'aventure n'attend que vous.
          </p>

          <button
            onClick={() => navigate('/events')}
            className="px-8 py-4 bg-white text-[#1a0525] font-black rounded-2xl uppercase tracking-widest hover:bg-amber-300 transition-all shadow-lg"
          >
            Explorer les Events
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 🛒 PANIER PLEIN
  // ---------------------------------------------------------
  return (
    <div
      className="min-h-screen text-white pt-24 pb-20 px-4 relative overflow-hidden"
      style={{ background: '#1a0525' }}
    >
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-rose-500/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-400/5 blur-[180px] rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-rose-200/50 hover:text-white transition-colors font-bold uppercase text-[10px] tracking-[0.2em]"
          >
            <ArrowLeft size={16} /> Retour boutique
          </button>

          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-2 text-amber-200">
              <Sparkles size={10} className="text-amber-300" /> Sécurisé
            </div>

            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
              Mon{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
                Panier
              </span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LISTE DES ARTICLES */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-5 flex items-center gap-6 group hover:bg-white/10 transition-all"
              >
                <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden border border-white/5 bg-slate-900">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-black uppercase tracking-tighter italic leading-none mb-2">
                    {item.title}
                  </h3>
                  <p className="text-rose-100/40 text-[10px] font-black uppercase tracking-widest">
                    {item.date
                      ? new Date(item.date).toLocaleDateString()
                      : 'Date flexible'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-amber-300 font-black text-xl mb-1">
                    {item.price} €
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-white/20 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RÉSUMÉ ET PAIEMENT */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sticky top-28 shadow-2xl">
              <h2 className="text-xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-2">
                <TicketCheck className="text-amber-300" /> Résumé
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                  <span>Articles</span>
                  <span>{cart.length}</span>
                </div>

                <div className="flex justify-between items-end">
                  <span className="font-bold text-[10px] uppercase tracking-[0.3em] text-white/40">
                    Total
                  </span>
                  <span className="text-4xl font-black text-amber-300">
                    {total} €
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-amber-300 to-rose-500 font-black text-[#1a0525] uppercase tracking-widest shadow-xl hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center gap-3"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <CreditCard size={20} /> Payer
                  </>
                )}
              </button>

              <p className="mt-8 text-[9px] text-white/30 text-center uppercase tracking-widest font-bold leading-relaxed">
                Paiement crypté SSL <br />
                Confirmation instantanée
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;