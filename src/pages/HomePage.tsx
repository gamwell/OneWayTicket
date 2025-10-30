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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-24 px-4">
        <div className="absolute inset-0 bg-gradient-neon opacity-20 animate-gradient"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,107,157,0.3),transparent_50%),radial-gradient(circle_at_70%_50%,rgba(0,229,255,0.3),transparent_50%)]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center animate-fadeInScale">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-gradient-neon animate-float">
              Trouvez votre prochain événement
            </h1>
            <p className="text-xl md:text-2xl mb-12 opacity-95 max-w-3xl mx-auto">
              Concerts, conférences, spectacles et bien plus encore dans un univers digital unique
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/events"
                className="inline-flex items-center justify-center space-x-2 px-10 py-5 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-2xl font-bold hover:from-secondary-600 hover:to-accent-600 transition-all duration-300 shadow-2xl hover:shadow-neon-pink/50 hover:scale-105 text-lg"
              >
                <Search className="w-6 h-6" />
                <span>Explorer les événements</span>
              </Link>
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center space-x-2 px-10 py-5 glass-effect rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 border-2 border-white/30 hover:border-white/50 text-lg hover:scale-105"
              >
                <Ticket className="w-6 h-6" />
                <span>Créer un compte</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-neutral-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,107,157,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(0,229,255,0.1),transparent_50%)]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 card hover:shadow-neon-pink/20 animate-fadeIn group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-10 h-10" />
              </div>
              <h3 className="text-4xl font-bold gradient-text mb-3">{stats.totalEvents}+</h3>
              <p className="text-gray-600 font-semibold">Événements disponibles</p>
            </div>

            <div className="text-center p-8 card hover:shadow-neon-cyan/20 animate-fadeIn group" style={{animationDelay: '0.1s'}}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-500 to-accent-600 text-white rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Ticket className="w-10 h-10" />
              </div>
              <h3 className="text-4xl font-bold gradient-text mb-3">{stats.totalTickets}+</h3>
              <p className="text-gray-600 font-semibold">Billets vendus</p>
            </div>

            <div className="text-center p-8 card hover:shadow-neon-purple/20 animate-fadeIn group" style={{animationDelay: '0.2s'}}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-neon-purple to-primary-700 text-white rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="text-4xl font-bold gradient-text mb-3">{stats.totalUsers}+</h3>
              <p className="text-gray-600 font-semibold">Utilisateurs inscrits</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-white to-neutral-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/5 via-transparent to-accent-500/5"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div className="animate-fadeIn">
              <h2 className="text-4xl font-display font-bold mb-3">
                <span className="gradient-text">Événements à venir</span>
              </h2>
              <p className="text-gray-600 text-lg">Découvrez les prochains événements près de chez vous</p>
            </div>
            <Link
              to="/events"
              className="hidden md:inline-flex items-center space-x-2 px-6 py-3 glass-effect text-secondary-600 hover:text-secondary-500 font-semibold rounded-xl transition-all hover:scale-105"
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
                  className="card group overflow-hidden hover:shadow-2xl animate-fadeIn"
                >
                  <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                    {event.image_urls && event.image_urls.length > 0 ? (
                      <img
                        src={event.image_urls[0]}
                        alt={event.titre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-cyber">
                        <Calendar className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {event.category && (
                      <div className="absolute top-4 left-4 glass-effect px-4 py-2 rounded-xl text-sm font-bold text-white backdrop-blur-md">
                        {event.category.nom}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-gradient transition-all">
                      {event.titre}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 font-semibold">
                      {format(new Date(event.date_debut), "d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center space-x-1">
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

      <section className="py-20 px-4 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-neon opacity-20 animate-gradient"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,157,0.2),transparent_70%)]"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10 animate-fadeInScale">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-neon-cyan to-neon-purple text-white rounded-2xl mx-auto mb-8 shadow-2xl animate-float">
            <TrendingUp className="w-10 h-10" />
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-white">
            Organisateur d'événements ?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
            Créez et gérez vos événements facilement avec notre plateforme intuitive.
            Profitez d'outils professionnels pour maximiser vos ventes.
          </p>
          <Link
            to="/auth/register"
            className="inline-flex items-center space-x-2 px-10 py-5 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-2xl font-bold hover:from-secondary-600 hover:to-accent-600 transition-all duration-300 shadow-2xl hover:shadow-neon-pink/50 hover:scale-105 text-lg"
          >
            <span>Devenir organisateur</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
