import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../supabaseClient';

export default function CheckoutPage() {
  const { cart, total } = useCart();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!cart || cart.length === 0) {
      setErrorMsg("Votre panier est vide");
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      console.log("🚀 Création de la session Stripe Checkout...");

      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Vous devez être connecté pour payer");
      }

      // ⚠️ On envoie le panier complet
      const items = cart.map(item => ({
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image_url,
        event_id: item.id, // 🔥 indispensable pour créer le ticket
      }));

      const { data, error } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            items,
            user_id: user.id,
            email: user.email,
            event_id: items[0].event_id, // 🔥 utilisé par le webhook
            successUrl: `${window.location.origin}/success`,
            cancelUrl: `${window.location.origin}/checkout`,
          }
        }
      );

      if (error) {
        console.error('Erreur Edge Function:', error);
        throw new Error(error.message);
      }

      console.log("✅ Session créée ! Redirection vers Stripe...");

      if (data.url) {
        window.location.href = data.url;
      }

    } catch (err) {
      console.error("❌ Erreur:", err);
      setErrorMsg(err.message || "Erreur lors de la création de la session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Paiement</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Résumé du panier */}
        <div className="bg-white p-6 shadow rounded h-fit">
          <h2 className="text-xl font-bold mb-4">Votre commande</h2>
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between border-b py-2">
              <span>{item.title} x{item.quantity}</span>
              <span>{(item.price * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
          <div className="text-right font-bold text-xl mt-4">
            Total: {total.toFixed(2)} €
          </div>
        </div>

        {/* Bouton de paiement */}
        <div className="bg-white p-6 shadow rounded">
          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading || cart.length === 0}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Chargement...' : `Payer ${total.toFixed(2)} €`}
          </button>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Paiement sécurisé par Stripe
          </p>
        </div>
      </div>
    </div>
  );
}