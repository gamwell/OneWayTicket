// src/pages/admin/PricingRulesManagerPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type PricingRule = {
  id: number;
  title: string;
  discount_percentage: number;
  discount_expiry_date?: string;
  required_proof_type?: string;
  published: boolean;
  created_at: string;
};

const PricingRulesManagerPage = () => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    discount_percentage: 0,
    discount_expiry_date: "",
    required_proof_type: "",
  });

  const loadRules = async () => {
    const { data } = await supabase
      .from("pricing_rules")
      .select("*")
      .order("id", { ascending: true });

    setRules((data || []) as PricingRule[]);
    setLoading(false);
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const createRule = async () => {
    if (!form.title.trim()) return;

    const { error } = await supabase.from("pricing_rules").insert([
      {
        title: form.title,
        discount_percentage: Number(form.discount_percentage),
        discount_expiry_date: form.discount_expiry_date || null,
        required_proof_type: form.required_proof_type || null,
        published: true,
      },
    ]);

    if (error) {
      alert("Erreur lors de la création de la règle");
      return;
    }

    setForm({
      title: "",
      discount_percentage: 0,
      discount_expiry_date: "",
      required_proof_type: "",
    });

    loadRules();
  };

  const togglePublished = async (id: number, current: boolean) => {
    await supabase
      .from("pricing_rules")
      .update({ published: !current })
      .eq("id", id);

    setRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, published: !current } : r
      )
    );
  };

  const deleteRule = async (id: number) => {
    if (!confirm("Supprimer cette règle ?")) return;

    await supabase.from("pricing_rules").delete().eq("id", id);
    loadRules();
  };

  if (loading)
    return <div className="text-white text-center mt-10">Chargement…</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-6">
      <h1 className="text-3xl font-bold mb-8">Règles de tarification</h1>

      {/* Formulaire de création */}
      <div className="bg-slate-800 p-6 rounded-xl mb-10">
        <h2 className="text-xl font-semibold mb-4">Créer une règle</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Nom de la règle"
            className="p-3 rounded bg-slate-700"
          />

          <input
            name="discount_percentage"
            type="number"
            value={form.discount_percentage}
            onChange={handleChange}
            placeholder="Réduction (%)"
            className="p-3 rounded bg-slate-700"
          />

          <input
            name="discount_expiry_date"
            type="date"
            value={form.discount_expiry_date}
            onChange={handleChange}
            className="p-3 rounded bg-slate-700"
          />

          <select
            name="required_proof_type"
            value={form.required_proof_type}
            onChange={handleChange}
            className="p-3 rounded bg-slate-700"
          >
            <option value="">Aucune preuve requise</option>
            <option value="student">Étudiant</option>
            <option value="senior">Senior</option>
            <option value="handicap">Handicap</option>
          </select>
        </div>

        <button
          onClick={createRule}
          className="mt-4 w-full py-2 bg-emerald-500 rounded font-semibold hover:bg-emerald-400"
        >
          Ajouter la règle
        </button>
      </div>

      {/* Liste des règles */}
      <div className="space-y-4">
        {rules.map((r) => (
          <div
            key={r.id}
            className="bg-slate-800 p-6 rounded-xl flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-lg">{r.title}</p>

              <p className="text-gray-400 text-sm">
                Réduction : {r.discount_percentage}%
              </p>

              {r.discount_expiry_date && (
                <p className="text-gray-400 text-sm">
                  Expire le{" "}
                  {new Date(r.discount_expiry_date).toLocaleDateString(
                    "fr-FR"
                  )}
                </p>
              )}

              {r.required_proof_type && (
                <p className="text-amber-400 text-xs">
                  Preuve requise : {r.required_proof_type}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => togglePublished(r.id, r.published)}
                className={`px-4 py-2 rounded ${
                  r.published
                    ? "bg-red-500 hover:bg-red-400"
                    : "bg-emerald-500 hover:bg-emerald-400"
                }`}
              >
                {r.published ? "Désactiver" : "Activer"}
              </button>

              <button
                onClick={() => deleteRule(r.id)}
                className="px-4 py-2 bg-red-500 rounded hover:bg-red-400"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          Aucune règle pour le moment.
        </p>
      )}
    </div>
  );
};

export default PricingRulesManagerPage;