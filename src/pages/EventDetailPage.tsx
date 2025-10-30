import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import type { Event, TicketType } from '../types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const EventDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  const handleAddToCart = (ticketType: TicketType) => {
    if (!event) return;

    addToCart({
      eventId: event.id,
      eventTitle: event.titre,
      eventDate: event.date_debut,
      eventImage: event.image_urls?.[0] || '',
      ticketTypeId: ticketType.id,
      ticketTypeName: ticketType.nom,
      price: parseFloat(ticketType.prix.toString()),
    });

    toast.success('Billet ajouté au panier');
  };

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const { data: eventData } = await supabase
        .from('events')
        .select('*, category:categories(*), organisateur:users(*)')
        .eq('id', id)
        .single();

      if (eventData) setEvent(eventData);

      const { data: ticketTypesData } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', id)
        .order('prix');

      if (ticketTypesData) setTicketTypes(ticketTypesData);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Erreur lors du chargement de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Événement non trouvé</p>
          <Link to="/events" className="text-secondary-600 hover:text-secondary-700 mt-2 inline-block">
            Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-96 bg-gradient-to-br from-gray-300 to-gray-400">
        {event.image_urls && event.image_urls.length > 0 ? (
          <img
            src={event.image_urls[0]}
            alt={event.titre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-24 h-24 text-gray-500" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10 pb-12">
        <Link
          to="/events"
          className="inline-flex items-center space-x-2 text-white hover:text-secondary-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour aux événements</span>
        </Link>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                {event.category && (
                  <div
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-4"
                    style={{ backgroundColor: event.category.couleur }}
                  >
                    {event.category.nom}
                  </div>
                )}
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.titre}</h1>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center space-x-3 text-gray-600">
                <Calendar className="w-6 h-6 text-secondary-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Date</div>
                  <div className="text-sm">
                    {format(new Date(event.date_debut), "d MMMM yyyy", { locale: fr })}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-gray-600">
                <Clock className="w-6 h-6 text-secondary-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Horaire</div>
                  <div className="text-sm">
                    {format(new Date(event.date_debut), "HH'h'mm", { locale: fr })}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-gray-600">
                <MapPin className="w-6 h-6 text-secondary-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Lieu</div>
                  <div className="text-sm">{event.lieu}, {event.ville}</div>
                </div>
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {ticketTypes.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Billets disponibles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ticketTypes.map((ticketType) => {
                    const disponible = ticketType.quantite_disponible - ticketType.quantite_vendue;
                    const isAvailable = disponible > 0;

                    return (
                      <div
                        key={ticketType.id}
                        className="border-2 border-gray-200 rounded-lg p-6 hover:border-secondary-500 transition-colors"
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{ticketType.nom}</h3>
                        {ticketType.description && (
                          <p className="text-sm text-gray-600 mb-4">{ticketType.description}</p>
                        )}
                        <div className="text-3xl font-bold text-secondary-600 mb-4">
                          {parseFloat(ticketType.prix.toString()).toFixed(2)} €
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                          <Users className="w-4 h-4" />
                          <span>{disponible} places restantes</span>
                        </div>
                        <button
                          onClick={() => handleAddToCart(ticketType)}
                          disabled={!isAvailable}
                          className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-semibold transition-all ${
                            isAvailable
                              ? 'bg-gradient-to-r from-secondary-500 to-accent-500 text-white hover:from-secondary-600 hover:to-accent-600'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isAvailable && <ShoppingCart className="w-5 h-5" />}
                          <span>{isAvailable ? 'Ajouter au panier' : 'Complet'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
