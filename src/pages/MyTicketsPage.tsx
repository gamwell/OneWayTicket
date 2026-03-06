import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import TicketCard from "../components/TicketCard";

type Ticket = {
  id: string;
  event_id: string;
  user_id: string;
  qr_code: string;
  created_at: string;
};

export default function MyTicketsPage() {
  const { user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("tickets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erreur récupération tickets:", error);
        }

        setTickets((data as Ticket[]) || []);
      } catch (err) {
        console.error("Erreur inattendue:", err);
      }

      setLoading(false);
    };

    fetchTickets();
  }, [user]);

  // 🔥 Loader
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Chargement de vos billets…
      </div>
    );
  }

  // 🔥 Si l'utilisateur n'est pas connecté
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <h1 className="text-3xl font-bold mb-4">Vous devez être connecté</h1>
        <Link
          to="/auth/login"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  // 🔥 Aucun billet
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <h1 className="text-3xl font-bold mb-4">Aucun billet pour le moment</h1>
        <p className="text-gray-600 mb-6">
          Lorsque vous achèterez un billet, il apparaîtra ici.
        </p>
        <Link
          to="/events"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Explorer les événements
        </Link>
      </div>
    );
  }

  // 🔥 Affichage des billets
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Mes billets</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            to={`/ticket/${ticket.id}`}
            className="block hover:scale-[1.02] transition-transform"
          >
            <TicketCard ticket={ticket} />
          </Link>
        ))}
      </div>
    </div>
  );
}