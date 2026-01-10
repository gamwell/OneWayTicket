// src/pages/admin/FacturationManagerPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Facturation = {
  id: string;
  inscription_id: string;
  montant: number;
  created_at: string;
  document_url?: string;
  inscriptions?: {
    id: string;
    event_id: string;
    user_id: string;
    contacts?: {
      full_name: string;
      email: string;
    };
    events?: {
      title: string;
      date: string;
    };
  };
};

const FacturationManagerPage = () => {
  const [facturations, setFacturations] = useState<Facturation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("facturations")
      .select(`
        id,
        inscription_id,
        montant,
        created_at,
        document_url,
        inscriptions (
          id,
          user_id,
          event_id,
          contacts (
            full_name,
            email
          ),
          events (
            title,
            date
          )
        )
      `)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setFacturations((data || []) as Facturation[]);
        setLoading(false);
      });
  }, []);

  const uploadDocument = async (facturationId: string, file: File) => {
    const filePath = `factures/${facturationId}-${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      alert("Erreur lors de l'upload du document");
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

    await supabase
      .from("facturations")
      .update({ document_url: publicUrl.publicUrl })
      .eq("id", facturationId);

    setFacturations((prev) =>
      prev.map((f) =>
        f.id === facturationId
          ? { ...f, document_url: publicUrl.publicUrl }
          : f
      )
    );
  };

  if (loading)
    return <div className="text-white text-center mt-10">Chargement…</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-6">
      <h1 className="text-3xl font-bold mb-6">Gestion des facturations</h1>

      <div className="space-y-6">
        {facturations.map((f) => (
          <div
            key={f.id}
            className="bg-slate-800 p-6 rounded-xl flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-lg">
                Facture #{f.id.slice(0, 8)}
              </p>

              <p className="text-gray-300">
                {f.inscriptions?.contacts?.full_name} —{" "}
                {f.inscriptions?.contacts?.email}
              </p>

              <p className="text-gray-400 text-sm mt-1">
                Événement : {f.inscriptions?.events?.title} (
                {new Date(
                  f.inscriptions?.events?.date || ""
                ).toLocaleDateString("fr-FR")}
                )
              </p>

              <p className="text-emerald-400 font-bold mt-2">
                Montant : {f.montant} €
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Créée le{" "}
                {new Date(f.created_at).toLocaleString("fr-FR")}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              {f.document_url ? (
                <a
                  href={f.document_url}
                  target="_blank"
                  className="px-4 py-2 bg-emerald-500 rounded hover:bg-emerald-400"
                >
                  Télécharger
                </a>
              ) : (
                <label className="px-4 py-2 bg-blue-500 rounded cursor-pointer hover:bg-blue-400">
                  Ajouter PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files &&
                      uploadDocument(f.id, e.target.files[0])
                    }
                  />
                </label>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacturationManagerPage;