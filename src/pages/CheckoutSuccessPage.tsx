import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, Mail } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CheckoutSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Paiement réussi !
            </h1>
            <p className="text-white/90 text-lg">
              Votre commande a été confirmée
            </p>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="font-semibold text-blue-900 mb-2">
                      Vérifiez votre boîte email
                    </h2>
                    <p className="text-sm text-blue-700">
                      Vos billets électroniques vous ont été envoyés par email.
                      Si vous ne les voyez pas, pensez à vérifier vos spams.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <button
                onClick={() => navigate('/my-tickets')}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-lg font-semibold hover:from-secondary-600 hover:to-accent-600 transition-all shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span>Voir mes billets</span>
              </button>

              <button
                onClick={() => navigate('/events')}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Découvrir d'autres événements
              </button>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Prochaines étapes</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-green-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Téléchargez vos billets</p>
                    <p className="text-sm text-gray-600">Depuis votre email ou votre espace personnel</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-green-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Présentez votre QR code</p>
                    <p className="text-sm text-gray-600">À l'entrée de l'événement</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-green-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Profitez de l'événement</p>
                    <p className="text-sm text-gray-600">Et partagez votre expérience !</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Des questions ? Consultez notre{' '}
                <a href="/contact" className="text-secondary-600 hover:underline font-medium">
                  page de contact
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
