// src/pages/admin/EventSummaryPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams } from "react-router-dom";

type Summary = {
  id: string;
  event_id: string;
  billets_vendus: number;
  prix_total: number;
  created_at: string;
  events?: {
    title: string;
    date: string;
    city: string;
    country: string;
  };
};

type TicketType = {
  id: string;
  title: string;
  prix: number;
  quantite: number;
  quantite_vendue: number;
};

type Inscription = {
  id: string;
  user_id: string;
  contacts?: {
    full_name: string;
    email: string;
  };
};

const EventSummaryPage = () => {
  const { eventId } = useParams();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    const { data: summaryData } = await supabase
      .from("event_summaries")
      .select(`
        id,
        event_id,
        billets_vendus,
        prix_total,
        created_at,
        events (
          title,
          date,
          city,
          country
        )
      `)
      .eq("event_id", eventId)
      .maybeSingle();

    const { data: ticketData } = await supabase
      .from("ticket_types")
      .select("*")
      .eq("event_id", eventId);

    const { data: inscriptionData } = await supabase
      .from("inscriptions")
      .select(`
        id,
        user_id,
        contacts (
          full_name,
          email
        )
      `)
      .eq("event_id", eventId);

    setSummary(summaryData || null);
    setTicketTypes(ticketData || []);
    setInscriptions(inscriptionData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadSummary();
  }, [eventId]);

  if (loading)
    return <div className="text-white text-center mt-10">Chargement…</div>;

  if (!summary)
    return (
      <div className="text-white text-center mt-10">
        Aucun résumé disponible pour cet événement.
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-6">
      <h1 className="text-3xl font-bold mb-6">
        Résumé de l’événement : {summary.events?.title}
      </h1>

      <p className="text-gray-300 mb-2">
        {summary.events?.city}, {summary.events?.country}
      </p>

      <p className="text-gray-400 mb-6">
        Le{" "}
        {summary.events?.date
          ? new Date(summary.events.date).toLocaleDateString("fr-FR")
          : ""}
      </p>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-800 p-6 rounded-xl text-center">
          <p className="text-3xl font-bold text-emerald-400">
            {summary.billets_vendus}
          </p>
          <p className="text-gray-300">Billets vendus</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl text-center">
          <p className="text-3xl font-bold text-blue-400">
            {ticketTypes.length}
          </p>
          <p className="text-gray-300">Types de billets</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl text-center">
          <p className="text-3xl font-bold text-yellow-400">
            {summary.prix_total.toFixed(2)} €
          </p>
          <p className="text-gray-300">Revenus totaux</p>
        </div>
      </div>

      {/* Types de billets */}
      <h2 className="text-2xl font-semibold mb-4">Types de billets</h2>
      <div className="space-y-4 mb-10">
        {ticketTypes.map((t) => (
          <div
            key={t.id}
            className="bg-slate-800 p-4 rounded-xl flex justify-between"
          >
            <div>
              <p className="font-semibold text-lg">{t.title}</p>
              <p className="text-gray-400 text-sm">{t.prix} €</p>
            </div>

            <div className="text-right">
              <p className="text-emerald-400 font-bold">
                {t.quantite_vendue} vendus
              </p>
              <p className="text-gray-400 text-sm">
                {t.quantite} disponibles
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Inscriptions */}
      <h2 className="text-2xl font-semibold mb-4">Inscriptions</h2>
      <div className="space-y-4">
        {inscriptions.map((i) => (
          <div
            key={i.id}
            className="bg-slate-800 p-4 rounded-xl flex justify-between"
          >
            <div>
              <p className="font-semibold text-lg">
                {i.contacts?.full_name || "Utilisateur inconnu"}
              </p>
              <p className="text-gray-400 text-sm">
                {i.contacts?.email || "Email inconnu"}
              </p>
            </div>

            <p className="text-gray-500 text-xs">ID : {i.id}</p>
          </div>
        ))}
      </div>

      {inscriptions.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          Aucune inscription pour cet événement.
        </p>
      )}
    </div>
  );
};

export default EventSummaryPage;