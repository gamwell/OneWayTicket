import { useEffect, useState, useRef } from "react";
import QRCode from "react-qr-code";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Loader2, CheckCircle, Ticket as TicketIcon } from "lucide-react";

export default function ConfirmationPage() {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const MAX_ATTEMPTS = 15; // 15 x 2s = 30 secondes max
  const cartCleared = useRef(false);

  // Vider le panier une seule fois
  useEffect(() => {
    if (cartCleared.current) return;
    cartCleared.current = true;
    clearCart();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const fetchTicket = async () => {
      try {
        // Si on a un session_id Stripe, on cherche par stripe_session_id
        // Sinon on prend le dernier billet de l'utilisateur
        let query = supabase
          .from("tickets")
          .select(`*, events (title, location, date), ticket_types (name)`)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data, error: dbError } = await query;

        if (dbError) throw dbError;

        if (!data) {
          // Pas encore de billet → on réessaie
          if (attempt < MAX_ATTEMPTS) {
            timeoutId = setTimeout(() => {
              setAttempt(prev => prev + 1);
            }, 2000);
          } else {
            setError("Billet introuvable. Vérifiez votre historique dans quelques minutes.");
            setLoading(false);
          }
          return;
        }

        // Billet trouvé ✅
        setTicket(data);
        setLoading(false);

      } catch (err: any) {
        console.error("Erreur récupération billet:", err);
        if (attempt < MAX_ATTEMPTS) {
          timeoutId = setTimeout(() => {
            setAttempt(prev => prev + 1);
          }, 2000);
        } else {
          setError("Erreur lors de la récupération du billet.");
          setLoading(false);
        }
      }
    };

    fetchTicket();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, attempt]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-white bg-[#1a0525]">
      <Loader2 className="w-12 h-12 animate-spin text-amber-500 mb-4" />
      <p className="text-lg font-bold">Validation de votre commande...</p>
      <p className="text-xs text-white/40 mt-2">
        Synchronisation en cours ({attempt}/{MAX_ATTEMPTS})
      </p>
      {attempt > 5 && (
        <p className="text-xs text-amber-300/60 mt-2 max-w-xs text-center">
          Cela prend un peu plus de temps que prévu, merci de patienter...
        </p>
      )}
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-[#1a0525]">
      <TicketIcon className="w-16 h-16 text-rose-500 mb-4 opacity-50" />
      <h2 className="text-2xl font-bold text-white mb-2">Mince !</h2>
      <p className="text-rose-200/70 mb-2">{error}</p>
      <p className="text-white/30 text-xs mb-6">
        Votre paiement a bien été enregistré. Le billet apparaîtra dans vos billets sous peu.
      </p>
      <div className="flex gap-4">
        <Link
          to="/my-tickets"
          className="px-8 py-3 bg-amber-500 text-black rounded-xl font-bold hover:bg-amber-400 transition"
        >
          Mes billets
        </Link>
        <Link
          to="/dashboard"
          className="px-8 py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div className="p-6 min-h-screen flex flex-col items-center pt-20 text-white bg-[#1a0525]">
      {/* Fond ambiance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-amber-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        <div className="bg-emerald-500/20 border border-emerald-500/50 p-4 rounded-full mb-6">
          <CheckCircle className="w-12 h-12 text-emerald-400" />
        </div>

        <h1 className="text-3xl font-black uppercase italic mb-2 text-center">
          Paiement Réussi !
        </h1>
        <p className="text-white/40 text-sm mb-8 text-center">
          Votre billet a été généré avec succès
        </p>

        {/* BILLET */}
        <div className="bg-white text-[#1a0525] p-6 rounded-3xl shadow-2xl w-full relative">
          {/* Encoche gauche */}
          <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 bg-[#1a0525] rounded-full" />
          {/* Encoche droite */}
          <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 bg-[#1a0525] rounded-full" />

          <div className="flex justify-center mb-6 p-4 bg-gray-50 rounded-2xl">
            <QRCode value={ticket.qr_code || ticket.id} size={180} />
          </div>

          <div className="space-y-4 border-t-2 border-dashed border-gray-200 pt-6">
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400">Événement</p>
              <p className="font-black text-xl uppercase leading-tight">
                {ticket.events?.title || "Événement"}
              </p>
            </div>

            <div className="flex justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Type</p>
                <p className="font-bold">{ticket.ticket_types?.name || "Standard"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-gray-400">Date</p>
                <p className="font-bold">
                  {ticket.events?.date
                    ? new Date(ticket.events.date).toLocaleDateString("fr-FR")
                    : "N/A"}
                </p>
              </div>
            </div>

            {ticket.events?.location && (
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Lieu</p>
                <p className="font-bold">{ticket.events.location}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">N° Billet</p>
              <p className="font-mono text-xs text-gray-600 break-all">{ticket.id}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8 w-full">
          <Link
            to="/my-tickets"
            className="w-full py-4 bg-amber-500 text-[#1a0525] rounded-2xl font-black uppercase tracking-widest hover:bg-amber-400 transition text-center"
          >
            Accéder à mes billets
          </Link>
          <Link
            to="/"
            className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-white/10 transition text-center"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
