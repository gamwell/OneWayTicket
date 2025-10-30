import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';

const CheckoutCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
              <XCircle className="w-12 h-12 text-orange-500" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Paiement annulé
            </h1>
            <p className="text-white/90 text-lg">
              Votre commande n'a pas été finalisée
            </p>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <p className="text-gray-600 text-center">
                Aucun montant n'a été débité de votre compte.
                Vos articles sont toujours dans votre panier.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/cart')}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-lg font-semibold hover:from-secondary-600 hover:to-accent-600 transition-all shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Retour au panier</span>
              </button>

              <button
                onClick={() => navigate('/events')}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Continuer mes achats
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">
                Besoin d'aide ?
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p className="flex items-start space-x-2">
                  <span className="text-secondary-600">•</span>
                  <span>Si vous rencontrez des difficultés de paiement, essayez une autre carte bancaire</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="text-secondary-600">•</span>
                  <span>Vérifiez que votre carte est activée pour les paiements en ligne</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="text-secondary-600">•</span>
                  <span>Contactez votre banque en cas de problème persistant</span>
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Des questions ?{' '}
                <a href="/contact" className="text-secondary-600 hover:underline font-medium">
                  Contactez-nous
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancelPage;
