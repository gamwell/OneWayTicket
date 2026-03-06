import React from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function CheckoutButton({ event }) {
  const { cart } = useCart();
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user) {
      alert("Vous devez être connecté pour acheter un billet.");
      return;
    }

    const { data, error } = await supabase.functions.invoke(
      "create-checkout-session",
      {
        body: {
          items: cart,
          user_id: user.id,
          email: user.email,
          event_id: event.id,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/cart`,
        },
      }
    );

    if (error) {
      console.error("Erreur Stripe :", error);
      alert("Impossible de créer la session de paiement.");
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-cyan-400 transition"
    >
      Payer maintenant
    </button>
  );
}