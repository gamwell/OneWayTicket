import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function CheckoutForm({ total }: { total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Redirection vers la page de succès après paiement
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      setMessage(error.message || "Une erreur est survenue");
      setIsLoading(false);
    }
    // Si tout va bien, Stripe redirige automatiquement, pas besoin de code ici.
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <PaymentElement />
      
      {message && (
        <div className="mt-4 text-red-500 text-sm font-bold bg-red-50 p-2 rounded">
          {message}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full mt-6 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-bold disabled:opacity-50"
      >
        {isLoading ? "Traitement en cours..." : `Payer ${total.toFixed(2)} €`}
      </button>
    </form>
  );
}