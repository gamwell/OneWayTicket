// src/pages/admin/UserPurchaseManagerPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Purchase = {
  id: string;
  user_id: string;
  ticket_type_id: string;
  montant: number;
  created_at: string;
  users?: {
    email: string;
  };
  ticket_types?: {
    title: string;
    events?: {
      title: string;
      date: string;
    };
  };
};

const UserPurchaseManagerPage = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPurchases = async () => {
    const { data } = await supabase
      .from("user_purchases")
      .select(`
        id,
        user_id,
        ticket_type_id,
        montant,
        created_at,
        users ( email ),
        ticket_types (
          title,
          events (
            title,
            date
          )
        )
      `)
      .order("created_at", { ascending: false });

    setPurchases((data || []) as Purchase[]);
    setLoading(false);
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  if (loading)
    return <div className="text-white text-center mt-10">Chargement…</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-6">
      <h1 className="text-3xl font-bold mb-8">Achats utilisateurs</h1>

      <div className="space-y-4">
        {purchases.map((p) => (
          <div
            key={p.id}
            className="bg-slate-800 p-6 rounded-xl flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-lg">
                Achat #{p.id.slice(0, 8)}
              </p>

              <p className="text-gray-400 text-sm">
                Utilisateur : {p.users?.email || "Inconnu"}
              </p>

              <p className="text-gray-400 text-sm">
                Billet : {p.ticket_types?.title}
              </p>

              <p className="text-gray-400 text-sm">
                Événement : {p.ticket_types?.events?.title} —{" "}
                {p.ticket_types?.events?.date
                  ? new Date(
                      p.ticket_types.events.date
                    ).toLocaleDateString("fr-FR")
                  : ""}
              </p>

              <p className="text-emerald-400 font-bold mt-2">
                Montant : {p.montant} €
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Achat le{" "}
                {new Date(p.created_at).toLocaleString("fr-FR")}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                className="px-4 py-2 bg-red-500 rounded hover:bg-red-400"
                onClick={() => alert("Fonction remboursement à implémenter")}
              >
                Rembourser
              </button>
            </div>
          </div>
        ))}
      </div>

      {purchases.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          Aucun achat enregistré.
        </p>
      )}
    </div>
  );
};

export default UserPurchaseManagerPage;