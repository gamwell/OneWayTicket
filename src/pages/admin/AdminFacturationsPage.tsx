import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const AdminFacturationsPage = () => {
  const [factures, setFactures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFactures = async () => {
      const { data, error } = await supabase.from("facturations").select("*");

      if (error) {
        console.error("Erreur chargement facturations :", error);
      } else {
        setFactures(data || []);
      }

      setLoading(false);
    };

    loadFactures();
  }, []);

  if (loading) return <div className="text-white text-center mt-10">Chargement…</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Facturations</h1>

      <table className="w-full bg-slate-800 rounded-xl overflow-hidden">
        <thead className="bg-slate-700">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Montant</th>
            <th className="p-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {factures.map((f) => (
            <tr key={f.id} className="border-b border-slate-700">
              <td className="p-3">{f.id}</td>
              <td className="p-3">{f.montant} €</td>
              <td className="p-3">{f.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminFacturationsPage;