import { stripePromise } from '@/lib/stripe'

const handleCheckout = async () => {
  try {
    // Appel au backend pour créer la session
    const res = await fetch(
      'https://jijmdfixffypwzphpxgy.supabase.co/functions/v1/create-checkout',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'VITE_STRIPE_PUBLIC_KEY=pk_test_51RqN0MPPzNg7dBLRdo2mqcni5PApKtPzojaDHWl5FwgM1uNA4p62SpSmsWxGYhYFoa4Oeu805IaEfCsDRfH5jkgT000dz3VxOR', // ← Remplace par ton vrai Price ID Stripe
        }),
      }
    )

    const { sessionId } = await res.json()
    
    // Redirection vers Stripe
    const stripe = await stripePromise
    await stripe?.redirectToCheckout({ sessionId })
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur lors du paiement')
  }
}

export default function Checkout() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Acheter ton billet</h1>
        <p className="text-gray-600 mb-6">OneWayTicket - 29€</p>
        <button
          onClick={handleCheckout}
          className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition"
        >
          Payer maintenant
        </button>
      </div>
    </div>
  )
}