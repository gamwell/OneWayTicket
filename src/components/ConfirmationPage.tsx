import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient"; 
import { useAuth } from "../contexts/AuthContext";
import { Loader2, CheckCircle, Ticket as TicketIcon } from "lucide-react";

export default function ConfirmationPage() {
  const { user } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    if (!user?.id) return;

    const fetchTicket = async () => {
      try {
        // ✅ Requête jointe sur events et ticket_types (vu dans votre base)
        const { data, error: dbError } = await supabase
          .from("tickets")
          .select(`
            *,
            events (title, location, date),
            ticket_types (name)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (dbError) throw dbError;

        if (!data) {
          if (retryCount < 12) { // On tente pendant 24 secondes max
            setTimeout(() => setRetryCount(prev => prev + 1), 2000);
          } else {
            setError("Billet introuvable. Vérifiez votre historique dans quelques minutes.");
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setTicket(data);
          setLoading(false);
        }
      } catch (err: any) {
        setError("Erreur lors de la récupération du billet.");
        setLoading(false);
      }
    };

    fetchTicket();
    return () => { mounted = false; };
  }, [user, retryCount]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-white bg-[#1a0525]">
      <Loader2 className="w-12 h-12 animate-spin text-amber-500 mb-4" />
      <p className="text-lg font-bold">Validation de votre commande...</p>
      <p className="text-xs text-white/40 mt-2">Tentative de synchronisation {retryCount}/12</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-[#1a0525]">
      <TicketIcon className="w-16 h-16 text-rose-500 mb-4 opacity-50" />
      <h2 className="text-2xl font-bold text-white mb-2">Mince !</h2>
      <p className="text-rose-200/70 mb-6">{error}</p>
      <Link to="/dashboard" className="px-8 py-3 bg-white/10 rounded-xl font-bold">Retour au dashboard</Link>
    </div>
  );

  return (
    <div className="p-6 min-h-screen flex flex-col items-center pt-20 text-white bg-[#1a0525]">
      <div className="bg-emerald-500/20 border border-emerald-500/50 p-4 rounded-full mb-6">
        <CheckCircle className="w-12 h-12 text-emerald-400" />
      </div>

      <h1 className="text-3xl font-black uppercase italic mb-8">Paiement Réussi !</h1>

      {/* BILLET PHYSIQUE VIRTUEL */}
      <div className="bg-white text-[#1a0525] p-6 rounded-3xl shadow-2xl max-w-sm w-full relative">
        <div className="flex justify-center mb-6 p-4 bg-gray-50 rounded-2xl">
          <QRCode value={ticket.qr_code || ticket.id} size={180} />
        </div>

        <div className="space-y-4 border-t-2 border-dashed border-gray-200 pt-6">
          <div>
            <p className="text-[10px] font-bold uppercase text-gray-400">Événement</p>
            <p className="font-black text-xl uppercase leading-tight">{ticket.events?.title}</p>
          </div>
          
          <div className="flex justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400">Type</p>
              <p className="font-bold">{ticket.ticket_types?.name || "Standard"}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-gray-400">Date</p>
              <p className="font-bold">{ticket.events?.date ? new Date(ticket.events.date).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <Link to="/my-tickets" className="mt-10 px-8 py-4 bg-amber-500 text-[#1a0525] rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform">
        Accéder à mes billets
      </Link>
    </div>
  );
}