import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import TicketDownload from "../components/tickets/TicketDownload";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";

const TestPurchasePage = () => {
  const { user } = useAuth();
  
  // États
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(true);
  const [targetEvent, setTargetEvent] = useState<any>(null);
  const [purchasedTicket, setPurchasedTicket] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. AU CHARGEMENT : On va chercher un VRAI événement dans votre base
  useEffect(() => {
    const fetchOneEvent = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .limit(1) // On en prend juste un pour le test
          .single();

        if (error) throw error;
        setTargetEvent(data);
      } catch (err) {
        console.error("Erreur récupération événement:", err);
        setErrorMsg("Impossible de trouver un événement dans la base de données.");
      } finally {
        setFetchingEvent(false);
      }
    };

    fetchOneEvent();
  }, []);

  // 2. LOGIQUE D'ACHAT (Simulation)
  const handleSimulatedPayment = async () => {
    if (!user) return;
    if (!targetEvent) return;

    setLoading(true);
    setErrorMsg("");

    try {
      // Simulation délai bancaire
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Création de l'objet Billet
      const newTicket = {
        user_id: user.id,
        event_id: targetEvent.id, // ✅ On utilise l'ID réel récupéré
        status: "valid",
        purchase_date: new Date().toISOString(),
        qr_code: crypto.randomUUID(),
        price_paid: 45, // Prix arbitraire pour le test
      };

      // Insertion Supabase
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
      // Gestion spécifique des erreurs RLS ou Foreign Key
      if (err.code === "42501") {
        setErrorMsg("Erreur de droits (RLS). Vérifiez vos politiques Supabase.");
      } else if (err.code === "23503") {
        setErrorMsg("Erreur d'événement : L'ID de l'événement n'existe pas.");
      } else {
        setErrorMsg(err.message || "Erreur lors de la création du billet.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- RENDU ---
  
  // Cas 1 : Utilisateur non connecté
  if (!user) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center bg-[#0f172a] text-white">
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={40} />
          <h2 className="text-xl font-bold text-red-400">Connexion Requise</h2>
          <p className="text-slate-400 mt-2">Vous devez être connecté pour acheter un billet.</p>
          <a href="/auth/login" className="inline-block mt-4 px-6 py-2 bg-red-500 rounded-lg font-bold">Se connecter</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12 flex flex-col items-center justify-center bg-[#0f172a] text-white px-4">
      
      {!purchasedTicket ? (
        // --- ÉCRAN AVANT ACHAT ---
        <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center">
            <h1 className="text-4xl font-black italic uppercase">Test <span className="text-cyan-400">Achat & QR</span></h1>
            <p className="text-slate-400 mt-2">Flux complet avec base de données réelle</p>
          </div>

          <div className="p-8 bg-slate-800/50 rounded-3xl border border-white/10 shadow-2xl">
            {fetchingEvent ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-cyan-400" size={30} />
              </div>
            ) : targetEvent ? (
              <>
                <div className="mb-6 p-4 bg-cyan-900/20 rounded-xl border border-cyan-500/30">
                  <p className="text-xs text-cyan-400 uppercase font-bold mb-1">Événement Cible détecté</p>
                  <p className="text-lg font-bold text-white truncate">{targetEvent.title}</p>
                  <p className="text-sm text-slate-400">{new Date(targetEvent.date).toLocaleDateString()}</p>
                </div>

                <p className="mb-6 text-slate-300 text-sm">
                  En cliquant ci-dessous, un billet sera réellement créé dans la table <code>tickets</code> lié à votre compte.
                </p>

                {errorMsg && (
                  <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-300 text-sm">
                    <AlertTriangle size={18} />
                    {errorMsg}
                  </div>
                )}

                <button
                  onClick={handleSimulatedPayment}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-green-500/20"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Confirmer l'achat (Test)"}
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-red-400 mb-4">Aucun événement trouvé dans la table 'events'.</p>
                <p className="text-slate-500 text-sm">Veuillez ajouter au moins un événement dans Supabase pour tester l'achat.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // --- ÉCRAN SUCCÈS (TICKET GÉNÉRÉ) ---
        <div className="w-full max-w-2xl animate-in zoom-in duration-500">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4 ring-2 ring-green-500">
                <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-3xl font-black uppercase text-white mb-2">Félicitations !</h2>
            <p className="text-slate-400">Transaction enregistrée en base de données.</p>
          </div>

          {/* COMPOSANT DE TÉLÉCHARGEMENT */}
          <TicketDownload 
            eventTitle={purchasedTicket.events?.title || targetEvent.title}
            userName={user?.email || "Client"} 
            ticketId={purchasedTicket.id}
            date={purchasedTicket.events?.date || targetEvent.date}
            price={purchasedTicket.price_paid}
          />
          
          <div className="text-center mt-8">
             <button 
                onClick={() => { setPurchasedTicket(null); setTargetEvent(null); setFetchingEvent(true); window.location.reload(); }}
                className="text-slate-500 hover:text-white underline text-sm uppercase font-bold transition-colors"
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