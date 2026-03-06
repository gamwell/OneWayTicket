import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import TicketDownload from "../components/tickets/TicketDownload";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";

const TestPurchasePage = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(true);
  const [targetEvent, setTargetEvent] = useState<any>(null);
  const [purchasedTicket, setPurchasedTicket] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchOneEvent = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .limit(1)
          .single();

        if (error) throw error;
        setTargetEvent(data);
      } catch (err) {
        console.error("Erreur récupération événement:", err);
        setErrorMsg("Impossible de trouver un événement dans la base.");
      } finally {
        setFetchingEvent(false);
      }
    };

    fetchOneEvent();
  }, []);

  const handleSimulatedPayment = async () => {
    if (!user || !targetEvent) return;

    setLoading(true);
    setErrorMsg("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newTicket = {
        user_id: user.id,
        event_id: targetEvent.id,
        qr_code: crypto.randomUUID(),
        price_paid: 45,
      };

      const { data, error } = await supabase
        .from("tickets")
        .insert([newTicket])
        .select(`
          *,
          events:event_id ( title, date )
        `)
        .single();

      if (error) throw error;

      setPurchasedTicket(data);
    } catch (err: any) {
      console.error("Erreur achat:", err);
      setErrorMsg(err.message || "Erreur lors de la création du billet.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center bg-[#0f172a] text-white">
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={40} />
          <h2 className="text-xl font-bold text-red-400">Connexion Requise</h2>
          <p className="text-slate-400 mt-2">Vous devez être connecté.</p>
          <a href="/auth/login" className="inline-block mt-4 px-6 py-2 bg-red-500 rounded-lg font-bold">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12 flex flex-col items-center justify-center bg-[#0f172a] text-white px-4">
      {!purchasedTicket ? (
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-black italic uppercase">
              Test <span className="text-cyan-400">Achat & QR</span>
            </h1>
            <p className="text-slate-400 mt-2">Flux complet avec base réelle</p>
          </div>

          <div className="p-8 bg-slate-800/50 rounded-3xl border border-white/10 shadow-2xl">
            {fetchingEvent ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-cyan-400" size={30} />
              </div>
            ) : targetEvent ? (
              <>
                <div className="mb-6 p-4 bg-cyan-900/20 rounded-xl border border-cyan-500/30">
                  <p className="text-xs text-cyan-400 uppercase font-bold mb-1">Événement détecté</p>
                  <p className="text-lg font-bold text-white truncate">{targetEvent.title}</p>
                  <p className="text-sm text-slate-400">
                    {new Date(targetEvent.date).toLocaleDateString()}
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-300 text-sm">
                    <AlertTriangle size={18} />
                    {errorMsg}
                  </div>
                )}

                <button
                  onClick={handleSimulatedPayment}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-black uppercase tracking-widest flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Confirmer l'achat (Test)"}
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-red-400 mb-4">Aucun événement trouvé.</p>
                <p className="text-slate-500 text-sm">Ajoutez un événement dans Supabase.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4 ring-2 ring-green-500">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-3xl font-black uppercase text-white mb-2">Félicitations !</h2>
            <p className="text-slate-400">Billet enregistré en base.</p>
          </div>

          <TicketDownload
            eventTitle={purchasedTicket.events?.title || targetEvent.title}
            userName={user.email || "Client"}
            ticketId={purchasedTicket.id}
            date={purchasedTicket.events?.date || targetEvent.date}
            price={purchasedTicket.price_paid}
          />

          <div className="text-center mt-8">
            <button
              onClick={() => window.location.reload()}
              className="text-slate-500 hover:text-white underline text-sm uppercase font-bold"
            >
              Réinitialiser le test
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPurchasePage;