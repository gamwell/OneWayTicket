// src/pages/admin/TicketTypeManagerPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams } from "react-router-dom";

type TicketType = {
  id: string;
  event_id: string;
  title: string;
  prix: number;
  quantite: number;
  quantite_disponible: number;
  quantite_vendue: number;
  published: boolean;
  required_proof_type?: string;
  discount_percentage?: number;
  discount_expiry_date?: string;
};

const TicketTypeManagerPage = () => {
  const { eventId } = useParams();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    prix: 0,
    quantite: 0,
    required_proof_type: "",
    discount_percentage: 0,
    discount_expiry_date: "",
  });

  useEffect(() => {
    if (!eventId) return;

    supabase
      .from("ticket_types")
      .select("*")
      .eq("event_id", eventId)
      .then(({ data }) => {
        setTicketTypes((data || []) as TicketType[]);
        setLoading(false);
      });
  }, [eventId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const createTicketType = async () => {
    const { error } = await supabase.from("ticket_types").insert([
      {
        event_id: eventId,
        title: form.title,
        prix: Number(form.prix),
        quantite: Number(form.quantite),
        quantite_disponible: Number(form.quantite),
        quantite_vendue: 0,
        required_proof_type: form.required_proof_type || null,
        discount_percentage: form.discount_percentage || null,
        discount_expiry_date: form.discount_expiry_date || null,
        published: true,
      },
    ]);

    if (!error) {
      const { data } = await supabase
        .from("ticket_types")
        .select("*")
        .eq("event_id", eventId);

      setTicketTypes((data || []) as TicketType[]);
      setForm({
        title: "",
        prix: 0,
        quantite: 0,
        required_proof_type: "",
        discount_percentage: 0,
        discount_expiry_date: "",
      });
    } else {
      alert("Erreur lors de la création du type de billet");
    }
  };

  const togglePublished = async (id: string, current: boolean) => {
    await supabase
      .from("ticket_types")
      .update({ published: !current })
      .eq("id", id);

    setTicketTypes((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, published: !current } : t
      )
    );
  };

  if (loading)
    return <div className="text-white text-center mt-10">Chargement…</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-6">
      <h1 className="text-3xl font-bold mb-6">
        Gestion des types de billets
      </h1>

      {/* Formulaire de création */}
      <div className="bg-slate-800 p-6 rounded-xl mb-10">
        <h2 className="text-xl font-semibold mb-4">Créer un type de billet</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Nom du billet"
            className="p-2 rounded bg-slate-700"
          />

          <input
            name="prix"
            type="number"
            value={form.prix}
            onChange={handleChange}
            placeholder="Prix (€)"
            className="p-2 rounded bg-slate-700"
          />

          <input
            name="quantite"
            type="number"
            value={form.quantite}
            onChange={handleChange}
            placeholder="Quantité totale"
            className="p-2 rounded bg-slate-700"
          />

          <select
            name="required_proof_type"
            value={form.required_proof_type}
            onChange={handleChange}
            className="p-2 rounded bg-slate-700"
          >
            <option value="">Aucune preuve requise</option>
            <option value="student">Étudiant</option>
            <option value="senior">Senior</option>
            <option value="handicap">Handicap</option>
          </select>

          <input
            name="discount_percentage"
            type="number"
            value={form.discount_percentage}
            onChange={handleChange}
            placeholder="Réduction (%)"
            className="p-2 rounded bg-slate-700"
          />

          <input
            name="discount_expiry_date"
            type="date"
            value={form.discount_expiry_date}
            onChange={handleChange}
            className="p-2 rounded bg-slate-700"
          />
        </div>

        <button
          onClick={createTicketType}
          className="mt-4 w-full py-2 bg-emerald-500 rounded font-semibold hover:bg-emerald-400"
        >
          Ajouter le type de billet
        </button>
      </div>

      {/* Liste des types de billets */}
      <div className="space-y-4">
        {ticketTypes.map((t) => (
          <div
            key={t.id}
            className="bg-slate-800 p-4 rounded-xl flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-lg">{t.title}</p>
              <p className="text-gray-400">
                {t.prix} € — {t.quantite_disponible} disponibles
              </p>
              {t.required_proof_type && (
                <p className="text-xs text-amber-400">
                  Preuve requise : {t.required_proof_type}
                </p>
              )}
            </div>

            <button
              onClick={() => togglePublished(t.id, t.published)}
              className={`px-4 py-2 rounded ${
                t.published
                  ? "bg-red-500 hover:bg-red-400"
                  : "bg-emerald-500 hover:bg-emerald-400"
              }`}
            >
              {t.published ? "Désactiver" : "Activer"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketTypeManagerPage;