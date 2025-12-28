import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

// On définit les types localement pour être sûr qu'ils collent à la DB
type EventDB = {
  id: string;
  titre: string;
  description: string;
  date_debut: string;
  lieu: string;
  image: string; // C'est une string simple maintenant, pas un tableau
  category: { nom: string; slug: string } | null;
  organizer_id: string;
};

type TicketTypeDB = {
  id: string;
  name: string; // Resté en anglais dans la DB
  price: number; // Resté en anglais dans la DB
  quantity_available: number; // Resté en anglais dans la DB
  description?: string;
};

const EventDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [event, setEvent] = useState<EventDB | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeDB[]>([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour gérer l'ajout au panier
  const handleAddToCart = (ticketType: TicketTypeDB) => {
    if (!event) return;

    addToCart({
      eventId: event.id,
      eventTitle: event.titre,
      eventDate: event.date_debut,
      eventImage: event.image || '',
      ticketTypeId: ticketType.id,
      ticketTypeName: ticketType.name, // Mapping 'name' vers 'ticketTypeName'
      price: ticketType.price,         // Mapping 'price' vers 'price'
    });

    toast.success('Billet ajouté au panier');
  };

  useEffect(() => {
    if (id) fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);

      // 1. Récupération de l'événement
      // On retire 'organisateur:users(*)' qui causait l'erreur car la relation est complexe
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*, category:categories(*)') 
        .eq('id', id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // 2. Récupération des billets
      const { data: ticketData, error: ticketError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', id)
        .order('price'); // 'price' en anglais dans la DB

      if (ticketError) throw ticketError;
      setTicketTypes(ticketData || []);

    } catch (error) {
      console.error('Erreur fetch:', error);
      // On ne met pas de toast erreur ici pour éviter le spam si c'est juste un petit souci
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Événement introuvable</h2>
          <p className="text-gray-500 mb-6">Il semble que cet événement n'existe plus.</p>
          <Link to="/events" className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition">
            Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec Image */}
      <div className="relative h-96 bg-gray-900">
        {event.image ? (
          <img
            src={event.image}
            alt={event.titre}
            className="w-full h-full object-cover opacity-70"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <Calendar className="w-24 h-24 text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10 pb-12">
        <Link
          to="/events"
          className="inline-flex items-center space-x-2 text-white/90 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour aux événements</span>
        </Link>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-8">
            {/* Titre et Catégorie */}
            <div className="mb-6">
              {event.category && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-secondary-100 text-secondary-800 mb-4 uppercase tracking-wide">
                  {event.category.nom}
                </span>
              )}
              <h1 className="text-4xl font-extrabold text-gray-900">{event.titre}</h1>
            </div>

            {/* Infos Pratiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-y border-gray-100 py-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Date</div>
                  <div className="font-semibold text-gray-900">
                    {event.date_debut && format(new Date(event.date_debut), "d MMMM yyyy", { locale: fr })}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Heure</div>
                  <div className="font-semibold text-gray-900">
                    {event.date_debut && format(new Date(event.date_debut), "HH'h'mm", { locale: fr })}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-50 rounded-full text-green-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Lieu</div>
                  <div className="font-semibold text-gray-900">{event.lieu}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="prose max-w-none mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">À propos de l'événement</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                {event.description}
              </p>
            </div>

            {/* Billetterie */}
            <div id="billetterie" className="bg-gray-50 rounded-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-2 text-secondary-600" />
                Réserver vos places
              </h2>
              
              {ticketTypes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ticketTypes.map((ticketType) => {
                    // Simulation simple : si pas de 'sold' column, on suppose qu'il en reste tant que > 0
                    const isAvailable = ticketType.quantity_available > 0;

                    return (
                      <div
                        key={ticketType.id}
                        className="bg-white border-2 border-transparent hover:border-secondary-500 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                      >
                        <div className="flex-grow">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{ticketType.name}</h3>
                          <div className="text-3xl font-bold text-secondary-600 mb-4">
                            {Number(ticketType.price).toFixed(2)} €
                          </div>
                          <p className="text-sm text-gray-500 mb-4 flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {isAvailable ? `${ticketType.quantity_available} places disponibles` : 'Complet'}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleAddToCart(ticketType)}
                          disabled={!isAvailable}
                          className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-bold transition-all ${
                            isAvailable
                              ? 'bg-secondary-600 text-white hover:bg-secondary-700 shadow-lg shadow-secondary-200'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isAvailable ? (
                            <>
                              <ShoppingCart className="w-5 h-5" />
                              <span>Ajouter au panier</span>
                            </>
                          ) : (
                            <span>Épuisé</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                  Aucune billetterie disponible pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;