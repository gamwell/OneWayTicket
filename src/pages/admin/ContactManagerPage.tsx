// src/pages/admin/ContactManagerPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type ContactMessage = {
  id: string;
  full_name: string;
  email: string;
  telephone?: string;
  message: string;
  created_at: string;
  statut?: string; // ex: "nouveau", "traité"
};

const ContactManagerPage = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    setMessages((data || []) as ContactMessage[]);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase
      .from("contacts")
      .update({ statut: newStatus })
      .eq("id", id);

    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, statut: newStatus } : m
      )
    );
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;

    await supabase.from("contacts").delete().eq("id", id);
    loadMessages();
  };

  if (loading)
    return <div className="text-white text-center mt-10">Chargement…</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-6">
      <h1 className="text-3xl font-bold mb-8">Messages de contact</h1>

      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="bg-slate-800 p-6 rounded-xl flex justify-between items-start"
          >
            <div className="max-w-xl">
              <p className="font-semibold text-lg">{msg.full_name}</p>
              <p className="text-gray-400 text-sm">{msg.email}</p>

              {msg.telephone && (
                <p className="text-gray-400 text-sm">Tel : {msg.telephone}</p>
              )}

              <p className="mt-3 text-gray-200">{msg.message}</p>

              <p className="text-xs text-gray-500 mt-2">
                Reçu le{" "}
                {new Date(msg.created_at).toLocaleString("fr-FR")}
              </p>

              <p className="text-xs mt-1">
                Statut :{" "}
                <span
                  className={
                    msg.statut === "traité"
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }
                >
                  {msg.statut || "nouveau"}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-2 items-end">
              <button
                onClick={() =>
                  updateStatus(
                    msg.id,
                    msg.statut === "traité" ? "nouveau" : "traité"
                  )
                }
                className={`px-4 py-2 rounded ${
                  msg.statut === "traité"
                    ? "bg-amber-500 hover:bg-amber-400"
                    : "bg-emerald-500 hover:bg-emerald-400"
                }`}
              >
                {msg.statut === "traité"
                  ? "Marquer comme nouveau"
                  : "Marquer comme traité"}
              </button>

              <button
                onClick={() => deleteMessage(msg.id)}
                className="px-4 py-2 bg-red-500 rounded hover:bg-red-400"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {messages.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          Aucun message pour le moment.
        </p>
      )}
    </div>
  );
};

export default ContactManagerPage;