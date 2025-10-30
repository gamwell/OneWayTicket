import { useEffect, useState } from 'react';
import { Ticket, Calendar, MapPin, Download, QrCode as QrCodeIcon, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { generateQRCode } from '../lib/qrcode';
import { generateTicketPDF, downloadPDF } from '../lib/pdf';

interface TicketWithDetails {
  id: string;
  user_id: string;
  type_billet_id: string;
  code_qr: string;
  code_billet: string;
  statut: string;
  date_achat: string;
  date_utilisation: string | null;
  nom_participant: string;
  email_participant: string;
  prix_paye: number;
  ticket_types: {
    nom: string;
    prix: number;
    event_id: string;
    events: {
      titre: string;
      date_debut: string;
      date_fin: string;
      lieu: string;
      ville: string;
      image_urls: string[];
    };
  };
}

const MyTicketsPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_types:type_billet_id (
            nom,
            prix,
            event_id,
            events:event_id (
              titre,
              date_debut,
              date_fin,
              lieu,
              ville,
              image_urls
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('date_achat', { ascending: false });

      if (error) throw error;
      if (data) setTickets(data as TicketWithDetails[]);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Erreur lors du chargement des billets');
    } finally {
      setLoading(false);
    }
  };

  const handleShowQRCode = async (ticket: TicketWithDetails) => {
    try {
      const qrData = JSON.stringify({
        ticketId: ticket.id,
        code: ticket.code_qr,
        event: ticket.ticket_types.events.titre,
      });
      const qrUrl = await generateQRCode(qrData);
      setQrCodeUrl(qrUrl);
      setSelectedTicket(ticket);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Erreur lors de la génération du QR code');
    }
  };

  const handleDownloadPDF = async (ticket: TicketWithDetails) => {
    try {
      toast.loading('Génération du PDF...');

      const qrData = JSON.stringify({
        ticketId: ticket.id,
        code: ticket.code_qr,
        event: ticket.ticket_types.events.titre,
      });
      const qrCodeDataURL = await generateQRCode(qrData);

      const pdfBlob = await generateTicketPDF({
        ticket: {
          id: ticket.id,
          code_billet: ticket.code_billet,
          nom_participant: ticket.nom_participant,
          email_participant: ticket.email_participant,
          prix_paye: ticket.prix_paye,
        } as any,
        event: {
          titre: ticket.ticket_types.events.titre,
          date_debut: ticket.ticket_types.events.date_debut,
          lieu: ticket.ticket_types.events.lieu,
          ville: ticket.ticket_types.events.ville,
        } as any,
        qrCodeDataURL,
      });

      const filename = `billet-${ticket.code_billet}.pdf`;
      downloadPDF(pdfBlob, filename);

      toast.dismiss();
      toast.success('PDF téléchargé avec succès');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss();
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'valid':
        return 'Valide';
      case 'used':
        return 'Utilisé';
      case 'cancelled':
        return 'Annulé';
      case 'refunded':
        return 'Remboursé';
      default:
        return status;
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">Mes Billets</h1>
          <p className="text-lg text-gray-600">
            Retrouvez tous vos billets achetés
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun billet pour le moment
            </h2>
            <p className="text-gray-600 mb-6">
              Découvrez nos événements et réservez vos billets
            </p>
            <a
              href="/events"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-lg font-semibold hover:from-secondary-600 hover:to-accent-600 transition-all"
            >
              <span>Explorer les événements</span>
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="md:flex">
                  <div className="md:w-1/3 relative h-48 md:h-auto bg-gradient-to-br from-gray-200 to-gray-300">
                    {ticket.ticket_types.events.image_urls && ticket.ticket_types.events.image_urls.length > 0 ? (
                      <img
                        src={ticket.ticket_types.events.image_urls[0]}
                        alt={ticket.ticket_types.events.titre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          ticket.statut
                        )}`}
                      >
                        {getStatusLabel(ticket.statut)}
                      </span>
                    </div>
                  </div>

                  <div className="md:w-2/3 p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {ticket.ticket_types.events.titre}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <Calendar className="w-5 h-5 text-secondary-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-gray-500">Date</div>
                          <div className="font-semibold text-gray-900">
                            {format(
                              new Date(ticket.ticket_types.events.date_debut),
                              "d MMMM yyyy 'à' HH'h'mm",
                              { locale: fr }
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-secondary-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-gray-500">Lieu</div>
                          <div className="font-semibold text-gray-900">
                            {ticket.ticket_types.events.lieu}, {ticket.ticket_types.events.ville}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Ticket className="w-5 h-5 text-secondary-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-gray-500">Type de billet</div>
                          <div className="font-semibold text-gray-900">
                            {ticket.ticket_types.nom}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <span className="w-5 h-5 text-secondary-500 mt-0.5 flex-shrink-0 font-bold">
                          €
                        </span>
                        <div>
                          <div className="text-sm text-gray-500">Prix payé</div>
                          <div className="font-semibold text-gray-900">
                            {parseFloat(ticket.prix_paye.toString()).toFixed(2)} €
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="text-sm text-gray-600 mb-4">
                        <strong>Code:</strong> <span className="font-mono">{ticket.code_qr}</span>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleShowQRCode(ticket)}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-lg hover:from-secondary-600 hover:to-accent-600 transition-all"
                        >
                          <QrCodeIcon className="w-4 h-4" />
                          <span>Voir QR Code</span>
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(ticket)}
                          className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Télécharger PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setSelectedTicket(null);
                setQrCodeUrl('');
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
              QR Code du billet
            </h2>

            <div className="text-center mb-6">
              <p className="text-gray-600 mb-2">{selectedTicket.ticket_types.events.titre}</p>
              <p className="text-sm text-gray-500">Code: {selectedTicket.code_qr}</p>
            </div>

            {qrCodeUrl && (
              <div className="flex justify-center mb-6">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-64 h-64 border-2 border-gray-200 rounded-lg"
                />
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              Présentez ce QR code à l'entrée de l'événement pour validation
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;
