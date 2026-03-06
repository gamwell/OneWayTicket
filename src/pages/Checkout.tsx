import React, { useState } from 'react';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setStatus('🚀 Initialisation...');
    
    try {
      // ON FORCE L'ADRESSE DU SERVEUR ICI
      // Assure-toi que ton backend tourne bien sur le port 4242
      const BACKEND_URL = 'http://localhost:4242/create-checkout-session';

      console.log(`📡 Tentative de contact vers : ${BACKEND_URL}`);

      // Données de test
      const ticketData = {
        title: "OneWayTicket - Pass Standard",
        price: "29€",
        date: "21 Juin 2026",
        location: "Paris, France",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
      };

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event: ticketData }),
      });

      console.log("📩 Réponse reçue, statut :", response.status);

      if (!response.ok) {
        const errorData = await response.json(); // On essaie de lire l'erreur du serveur
        throw new Error(errorData.error || `Erreur serveur : ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Données reçues :", data);

      if (data.url) {
        setStatus('Redirection vers Stripe...');
        window.location.href = data.url;
      } else {
        throw new Error("Pas d'URL renvoyée par Stripe");
      }

    } catch (error: any) {
      console.error("❌ ERREUR FATALE :", error);
      setStatus(`Erreur : ${error.message}`);
      alert(`Échec du paiement : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-2">Récapitulatif</h1>
        <p className="text-gray-500 mb-8">Test de connexion Backend</p>

        <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
          <h3 className="font-bold text-lg">Pass Standard</h3>
          <div className="mt-2 flex justify-between items-center border-t border-gray-300 pt-2">
            <span>Total</span>
            <span className="font-bold text-xl">29,00 €</span>
          </div>
        </div>

        {status && (
          <p className="mb-4 text-sm font-mono text-blue-600 bg-blue-50 p-2 rounded">
            {status}
          </p>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className={`
            w-full py-4 rounded-xl font-bold text-white transition transform 
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800 active:scale-95'}
          `}
        >
          {loading ? 'Chargement...' : 'Payer maintenant 💳'}
        </button>
      </div>
    </div>
  );
}