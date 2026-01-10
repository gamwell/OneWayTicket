// src/pages/admin/DocumentManagerPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type DocumentRow = {
  id: string;
  user_id?: string;
  document_url: string;
  created_at: string;
  type?: string;
  users?: {
    email: string;
  };
};

const DocumentManagerPage = () => {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    const { data } = await supabase
      .from("facturations")
      .select(`
        id,
        document_url,
        created_at,
        inscriptions (
          user_id,
          users ( email )
        )
      `)
      .order("created_at", { ascending: false });

    const formatted = (data || []).map((d: any) => ({
      id: d.id,
      document_url: d.document_url,
      created_at: d.created_at,
      user_id: d.inscriptions?.user_id,
      users: d.inscriptions?.users,
      type: "facture",
    }));

    setDocuments(formatted);
    setLoading(false);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const deleteDocument = async (doc: DocumentRow) => {
    if (!confirm("Supprimer ce document ?")) return;

    const path = doc.document_url.split("/").slice(-1)[0];

    await supabase.storage.from("documents").remove([path]);

    await supabase
      .from("facturations")
      .update({ document_url: null })
      .eq("id", doc.id);

    loadDocuments();
  };

  if (loading)
    return <div className="text-white text-center mt-10">Chargement…</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-6">
      <h1 className="text-3xl font-bold mb-8">Gestion des documents</h1>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-800 p-6 rounded-xl flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-lg">
                Document #{doc.id.slice(0, 8)}
              </p>

              <p className="text-gray-400 text-sm">
                Type : {doc.type || "document"}
              </p>

              <p className="text-gray-400 text-sm">
                Utilisateur : {doc.users?.email || "Inconnu"}
              </p>

              <p className="text-gray-500 text-xs mt-1">
                Ajouté le{" "}
                {new Date(doc.created_at).toLocaleString("fr-FR")}
              </p>
            </div>

            <div className="flex gap-3">
              <a
                href={doc.document_url}
                target="_blank"
                className="px-4 py-2 bg-emerald-500 rounded hover:bg-emerald-400"
              >
                Voir
              </a>

              <button
                onClick={() => deleteDocument(doc)}
                className="px-4 py-2 bg-red-500 rounded hover:bg-red-400"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          Aucun document trouvé.
        </p>
      )}
    </div>
  );
};

export default DocumentManagerPage;