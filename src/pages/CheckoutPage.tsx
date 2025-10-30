import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Veuillez vous connecter pour continuer');
      navigate('/auth/login');
    }

    if (items.length === 0) {
      navigate('/cart');
    }
  }, [user, items, navigate]);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter');
      navigate('/auth/login');
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Session expirée, veuillez vous reconnecter');
        navigate('/auth/login');
        return;
      }

      const ticketTypeIds = items.map(item => item.ticketTypeId);
      const quantities = items.map(item => item.quantity);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketTypeIds,
          quantities,
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe non disponible');
      }

      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (result.error) {
        throw result.error;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  const subtotal = totalPrice;
  const serviceFee = subtotal * 0.05;
  const total = subtotal + serviceFee;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center space-x-2 text-gray-600 hover:text-secondary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour au panier</span>
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-secondary-500 to-accent-500 px-8 py-6">
            <h1 className="text-3xl font-display font-bold text-white mb-2">Paiement sécurisé</h1>
            <p className="text-white/90">Finalisez votre commande</p>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-display font-bold text-gray-900 mb-4">Récapitulatif de la commande</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.ticketTypeId} className="flex items-start justify-between pb-4 border-b border-gray-200">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.eventImage}
                        alt={item.eventTitle}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.eventTitle}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.ticketTypeName}</p>
                        <p className="text-sm text-gray-500 mt-1">Quantité: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {(item.price * item.quantity).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8 pb-8 border-b border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frais de service (5%)</span>
                  <span>{serviceFee.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-secondary-600">
                    {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Paiement 100% sécurisé</h3>
                    <p className="text-sm text-blue-700">
                      Vos données de paiement sont protégées par Stripe, leader mondial des paiements en ligne.
                      Nous ne stockons aucune information bancaire.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-lg font-semibold text-lg hover:from-secondary-600 hover:to-accent-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Redirection vers Stripe...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-6 h-6" />
                  <span>Procéder au paiement</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              En cliquant sur "Procéder au paiement", vous acceptez nos{' '}
              <a href="/terms" className="text-secondary-600 hover:underline">
                conditions générales de vente
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-display font-bold text-gray-900 mb-4">Questions fréquentes</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Comment vais-je recevoir mes billets ?</h3>
              <p className="text-sm text-gray-600">
                Vos billets vous seront envoyés par email immédiatement après le paiement.
                Vous pourrez également les retrouver dans votre espace "Mes Billets".
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Puis-je annuler ma commande ?</h3>
              <p className="text-sm text-gray-600">
                Les annulations sont possibles selon les conditions de l'organisateur.
                Contactez-nous pour plus d'informations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Mes données sont-elles sécurisées ?</h3>
              <p className="text-sm text-gray-600">
                Absolument. Nous utilisons Stripe pour tous les paiements, garantissant une sécurité maximale.
                Vos informations bancaires ne transitent jamais par nos serveurs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
