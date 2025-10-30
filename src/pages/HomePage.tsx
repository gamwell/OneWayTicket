import { Link } from 'react-router-dom';
import { Calendar, Ticket, Users, TrendingUp, ArrowRight, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Event } from '../types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const HomePage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTickets: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: events } = await supabase
          .from('events')
          .select('*, category:categories(*)')
          .eq('statut', 'publie')
          .gte('date_debut', new Date().toISOString())
          .order('date_debut', { ascending: true })
          .limit(3);

        if (events) setUpcomingEvents(events);

        const [eventsCount, ticketsCount, usersCount] = await Promise.all([
          supabase.from('events').select('*', { count: 'exact', head: true }),
          supabase.from('tickets').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          totalEvents: eventsCount.count || 0,
          totalTickets: ticketsCount.count || 0,
          totalUsers: usersCount.count || 0,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 via-secondary-600 to-secondary-500 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Trouvez votre prochain événement
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-95">
              Concerts, conférences, spectacles et bien plus encore
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/events"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white text-secondary-600 rounded-lg font-semibold hover:bg-neutral-100 transition-all shadow-lg"
              >
                <Search className="w-5 h-5" />
                <span>Explorer les événements</span>
              </Link>
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-secondary-600 transition-all"
              >
                <Ticket className="w-5 h-5" />
                <span>Créer un compte</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-600 text-white rounded-full mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalEvents}+</h3>
              <p className="text-gray-600">Événements disponibles</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-600 text-white rounded-full mb-4">
                <Ticket className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalTickets}+</h3>
              <p className="text-gray-600">Billets vendus</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalUsers}+</h3>
              <p className="text-gray-600">Utilisateurs inscrits</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Événements à venir</h2>
              <p className="text-gray-600">Découvrez les prochains événements près de chez vous</p>
            </div>
            <Link
              to="/events"
              className="hidden md:inline-flex items-center space-x-2 text-secondary-600 hover:text-secondary-700 font-semibold"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
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
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
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
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun événement à venir pour le moment</p>
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link
              to="/events"
              className="inline-flex items-center space-x-2 text-secondary-600 hover:text-secondary-700 font-semibold"
            >
              <span>Voir tous les événements</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <TrendingUp className="w-16 h-16 text-accent-500 mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Organisateur d'événements ?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Créez et gérez vos événements facilement avec notre plateforme intuitive.
            Profitez d'outils professionnels pour maximiser vos ventes.
          </p>
          <Link
            to="/auth/register"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-accent-500 to-secondary-500 text-white rounded-lg font-semibold hover:from-accent-600 hover:to-secondary-600 transition-all shadow-lg"
          >
            <span>Devenir organisateur</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
