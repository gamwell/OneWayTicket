import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Event, Category } from '../types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('nom');

    if (data) setCategories(data);
  };

  const fetchEvents = async () => {
    setLoading(true);
    let query = supabase
      .from('events')
      .select('*, category:categories(*)')
      .eq('statut', 'publie')
      .gte('date_debut', new Date().toISOString())
      .order('date_debut', { ascending: true });

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    const { data } = await query;

    if (data) setEvents(data);
    setLoading(false);
  };

  const filteredEvents = events.filter((event) =>
    event.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">Événements</h1>
          <p className="text-lg text-gray-600">Découvrez tous les événements disponibles</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un événement, une ville..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent appearance-none"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                  {event.image_urls && event.image_urls.length > 0 ? (
                    <img
                      src={event.image_urls[0]}
                      alt={event.titre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {event.category && (
                    <div
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: event.category.couleur }}
                    >
                      {event.category.nom}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {event.titre}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {format(new Date(event.date_debut), "d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center space-x-1">
                    <span>{event.lieu}</span>
                    <span>•</span>
                    <span>{event.ville}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                    {event.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Aucun événement trouvé</p>
            <p className="text-sm text-gray-500">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
