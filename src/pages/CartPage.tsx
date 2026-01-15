import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, CreditCard, Loader2 } from 'lucide-react';

// ✅ AJOUT INDISPENSABLE POUR LE DIAGNOSTIC
import { FunctionsHttpError } from '@supabase/supabase-js';

import { useCart } from '../contexts/CartContext'; 
import { supabase } from '../lib/supabase';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, total } = useCart();
   
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  // --- FONCTION DE PAIEMENT ---
  const handlePayment = async () => {
    if (!user) {
      alert("Vous devez être connecté pour finaliser votre achat !");
      navigate('/auth/login', { state: { from: '/cart' } });
      return;
    }

    if (!cart || cart.length === 0) return;

    setIsLoading(true);

    try {
      const missingPriceIds = cart.filter((item: any) => !item.stripe_price_id);
      if (missingPriceIds.length > 0) {
        throw new Error("Certains billets n'ont pas de prix Stripe configuré (ID manquant).");
      }

      const ticketTypeIds = cart.map((item: any) => item.stripe_price_id);
      const quantities = cart.map((item: any) => item.quantity || 1);

      console.log("🚀 Envoi à Stripe:", { ticketTypeIds, quantities });

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: {
            ticketTypeIds,
            quantities,
            user_id: user.id,
            successUrl: `${window.location.origin}/dashboard?payment=success`,
            cancelUrl: `${window.location.origin}/cart?payment=cancelled`,
          },
      });

      // --- 🔍 DIAGNOSTIC DE L'ERREUR 500 ---
      if (error) {
        // Si c'est une erreur qui vient de la Edge Function (ex: Clé Stripe invalide)
        if (error instanceof FunctionsHttpError) {
          try {
            // On essaie de lire le message JSON renvoyé par le serveur
            const errorMessage = await error.context.json();
            console.error("🔴 DÉTAILS DE L'ERREUR SERVEUR :", errorMessage);
            throw new Error(`Erreur Stripe : ${JSON.stringify(errorMessage)}`);
          } catch (jsonError) {
            // Si le serveur n'a même pas renvoyé de JSON (crash total)
            throw error;
          }
        } else {
          throw error;
        }
      }

      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Le service de paiement n'a pas pu générer de lien.");
      }

    } catch (err: any) {
      console.error("❌ Erreur paiement panier:", err);
      
      let message = "Erreur inconnue.";
      if (typeof err === 'string') message = err;
      else if (err instanceof Error) message = err.message;
      else if (err && typeof err === 'object' && err.message) message = String(err.message);
      
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- AFFICHAGE SI PANIER VIDE ---
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
        <button 
          onClick={() => navigate('/events')}
          className="px-6 py-2 bg-rose-600 rounded-full hover:bg-rose-700 transition"
        >
          Découvrir les événements
        </button>
      </div>
    );
  }

  // --- AFFICHAGE PANIER ---
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-white">
      <h1 className="text-3xl font-bold mb-8 text-amber-300">Mon Panier</h1>

      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        {cart.map((item: any) => (
          <div key={item.id} className="flex justify-between items-center py-4 border-b border-white/10 last:border-0">
            <div>
              <h3 className="font-bold text-lg">{item.title || "Billet"}</h3>
              <p className="text-sm text-gray-400">Quantité: {item.quantity || 1}</p>
              {/* Petite aide visuelle pour vérifier l'ID Stripe */}
              <p className="text-[10px] text-gray-600 font-mono">{item.stripe_price_id}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-xl">{item.price}€</span>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="text-red-400 hover:text-red-300 p-2"
                title="Supprimer"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        <div className="mt-8 pt-6 border-t border-white/20 flex flex-col items-end">
            <div className="text-2xl font-bold mb-6">
                Total: <span className="text-amber-300">{total}€</span>
            </div>

            <button
                onClick={handlePayment}
                disabled={isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold py-3 px-8 rounded-full transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin" /> Traitement...
                    </>
                ) : (
                    <>
                        <CreditCard size={20} /> Payer maintenant
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;