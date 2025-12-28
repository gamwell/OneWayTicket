import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">Votre panier est vide</h2>
          <p className="mt-1 text-gray-500">Découvrez nos événements et commencez vos achats !</p>
          <div className="mt-6">
            <Link
              to="/events"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
            >
              Voir les événements
              <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Votre Panier</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {cart.map((item) => (
              <li key={`${item.eventId}-${item.ticketTypeId}`} className="p-6">
                <div className="flex items-center">
                  {/* Image de l'événement */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    {item.eventImage ? (
                      <img
                        src={item.eventImage}
                        alt={item.eventTitle}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex-1 flex flex-col">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          <Link to={`/events/${item.eventId}`}>{item.eventTitle}</Link>
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{item.ticketTypeName}</p>
                      </div>
                      <p className="text-lg font-medium text-gray-900">
                        {(item.price * item.quantity).toFixed(2)} €
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.ticketTypeId, -1)}
                          className="p-2 hover:bg-gray-100 text-gray-600"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 text-gray-900 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.ticketTypeId, 1)}
                          className="p-2 hover:bg-gray-100 text-gray-600"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.ticketTypeId)}
                        className="flex items-center text-sm font-medium text-red-600 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
              <p>Total</p>
              <p>{total.toFixed(2)} €</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500 mb-6">
              Taxes et frais calculés à l'étape suivante.
            </p>
            <div className="mt-6">
              <Link
                to="/checkout"
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-secondary-600 hover:bg-secondary-700"
              >
                Commander
              </Link>
            </div>
            <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
              <p>
                ou{' '}
                <Link to="/events" className="text-secondary-600 font-medium hover:text-secondary-500">
                  Continuer vos achats<span aria-hidden="true"> &rarr;</span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;