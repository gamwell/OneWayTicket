import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '../contexts/CartContext';
import CheckoutForm from '../components/CheckoutForm'; // On importe le formulaire créé à l'étape 2

// Initialisation de Stripe (en dehors du composant pour ne pas le recharger à chaque fois)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function CheckoutPage() {
  const { cart, total } = useCart();
  const [clientSecret, setClientSecret] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!cart || cart.length === 0) return;

    // 1. On demande le ClientSecret au Backend
    const fetchClientSecret = async () => {
      try {
        console.log("🚀 Demande du secret de paiement pour", total, "€");
        
        // On garde l'URL directe qui fonctionnait
        const response = await fetch('https://vnijdjjzgruujvagrihu.supabase.co/functions/v1/payment', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ANON_KEY}`
          },
          body: JSON.stringify({ amount: total, items: cart }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Erreur serveur");
        
        // 2. On stocke le secret
        setClientSecret(data.clientSecret);
        console.log("✅ Secret reçu ! Stripe est prêt.");
        
      } catch (err: any) {
        console.error("Erreur:", err);
        setErrorMsg("Impossible d'initialiser le paiement : " + err.message);
      }
    };

    fetchClientSecret();
  }, [cart, total]);

  // Options pour Elements (Thème + le fameux secret)
  const options = {
    clientSecret,
    appearance: { theme: 'stripe' as const },
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
              <span>{item.eventTitle} x{item.quantity}</span>
              <span>{(item.price * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
          <div className="text-right font-bold text-xl mt-4">Total: {total} €</div>
        </div>

        {/* Zone de Paiement */}
        <div className="bg-white p-6 shadow rounded">
          {errorMsg && <div className="text-red-500 mb-4">{errorMsg}</div>}

          {/* LA LOGIQUE CRUCIALE : On n'affiche Elements QUE si on a le clientSecret */}
          {clientSecret && stripePromise ? (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm total={total} />
            </Elements>
          ) : (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Chargement du module de paiement...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}