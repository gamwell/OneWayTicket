import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  DollarSign,
  Ticket
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Event {
  id: string;
  titre: string;
  lieu: string;
  ville: string;
  date_debut: string;
  statut: string;
  capacite_totale: number;
  image_urls: string[];
}

interface TicketType {
  id: string;
  nom: string;
  prix: number;
  quantite_disponible: number;
  quantite_vendue: number;
}

interface Stats {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  activeEvents: number;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    activeEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('organisateur_id', user?.id)
        .order('date_debut', { ascending: false });

      if (eventsError) throw eventsError;

      setEvents(eventsData || []);

      if (eventsData && eventsData.length > 0) {
        const eventIds = eventsData.map(e => e.id);

        const { data: ticketTypesData, error: ticketError } = await supabase
          .from('ticket_types')
          .select('quantite_vendue, prix')
          .in('event_id', eventIds);

        if (ticketError) throw ticketError;

        const totalSold = ticketTypesData?.reduce((sum, t) => sum + (t.quantite_vendue || 0), 0) || 0;
        const totalRev = ticketTypesData?.reduce((sum, t) => sum + ((t.quantite_vendue || 0) * parseFloat(t.prix)), 0) || 0;
        const activeCount = eventsData.filter(e => e.statut === 'publie').length;

        setStats({
          totalEvents: eventsData.length,
          totalTicketsSold: totalSold,
          totalRevenue: totalRev,
          activeEvents: activeCount,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${eventTitle}" ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast.success('Événement supprimé avec succès');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Tableau de Bord Organisateur</h1>
            <p className="text-gray-600 mt-2">Gérez vos événements et suivez vos performances</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/events/new')}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-lg font-semibold hover:from-secondary-600 hover:to-accent-600 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Créer un événement</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Événements</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              {stats.activeEvents} actifs
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Billets Vendus</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTicketsSold}</p>
              </div>
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Performance solide
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenus Totaux</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Ce mois-ci
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Taux de Remplissage</p>
                <p className="text-3xl font-bold text-gray-900">
                  {events.length > 0 ? Math.round((stats.totalTicketsSold / events.reduce((sum, e) => sum + e.capacite_totale, 0)) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Moyenne globale
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-display font-bold text-gray-900">Mes Événements</h2>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun événement</h3>
              <p className="text-gray-600 mb-6">Commencez par créer votre premier événement</p>
              <button
                onClick={() => navigate('/dashboard/events/new')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-lg font-semibold hover:from-secondary-600 hover:to-accent-600 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Créer un événement</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Événement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lieu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacité
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={event.image_urls[0]}
                            alt={event.titre}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                          <div className="text-sm font-medium text-gray-900">
                            {event.titre}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{event.lieu}</div>
                        <div className="text-sm text-gray-500">{event.ville}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(event.date_debut).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            event.statut === 'publie'
                              ? 'bg-green-100 text-green-800'
                              : event.statut === 'brouillon'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {event.statut === 'publie' ? 'Publié' : event.statut === 'brouillon' ? 'Brouillon' : 'Annulé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.capacite_totale} places
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/events/${event.id}`)}
                            className="p-2 text-gray-600 hover:text-secondary-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/dashboard/events/${event.id}/edit`)}
                            className="p-2 text-gray-600 hover:text-secondary-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id, event.titre)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
