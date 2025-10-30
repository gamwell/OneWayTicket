import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 mb-8">Découvrez nos événements et ajoutez des billets à votre panier</p>
            <button
              onClick={() => navigate('/events')}
              className="px-6 py-3 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-lg font-semibold hover:from-secondary-600 hover:to-accent-600 transition-all"
            >
              Parcourir les événements
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Panier</h1>
          <p className="text-gray-600">{totalItems} article{totalItems > 1 ? 's' : ''} dans votre panier</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.ticketTypeId} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={item.eventImage}
                    alt={item.eventTitle}
                    className="w-24 h-24 rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.eventTitle}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(item.eventDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-sm font-medium text-secondary-600">{item.ticketTypeName}</p>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      {item.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-4">
                    <button
                      onClick={() => removeFromCart(item.ticketTypeId)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.ticketTypeId, item.quantity - 1)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-l-lg transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-semibold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.ticketTypeId, item.quantity + 1)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-r-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-display font-bold text-gray-900 mb-6">Récapitulatif</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frais de service</span>
                  <span>{(totalPrice * 0.05).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-secondary-600">
                      {(totalPrice * 1.05).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-lg font-semibold hover:from-secondary-600 hover:to-accent-600 transition-all shadow-lg"
              >
                <CreditCard className="w-5 h-5" />
                <span>Procéder au paiement</span>
              </button>

              <button
                onClick={() => navigate('/events')}
                className="w-full mt-4 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Continuer mes achats
              </button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Paiement sécurisé</p>
                    <p className="text-xs text-gray-600 mt-1">Vos données sont protégées par SSL</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
