import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import Ticket from "../components/Ticket";
import { Loader2, AlertCircle, ArrowLeft, Trash2 } from "lucide-react";

export default function TicketPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!user || !id) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("tickets")
          .select("*, events(*)")
          .eq("id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("Billet introuvable");
        setTicket(data);
      } catch (err: any) {
        console.error("Erreur:", err);
        setErrorMsg("Impossible de charger ce billet.");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id, user]);

  // ------------------------------------------------------------
  // 🔥 SUPPRESSION DU BILLET
  // ------------------------------------------------------------
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce billet ? Cette action est irréversible."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("tickets")
        .delete()
        .eq("id", ticket.id)
        .eq("user_id", user.id); // Double sécurité

      if (error) throw error;

      navigate("/my-tickets");
    } catch (err: any) {
      console.error("Erreur suppression:", err);
      alert("Impossible de supprimer ce billet. Veuillez réessayer.");
    } finally {
      setDeleting(false);
    }
  };

  // --- RENDU : Chargement ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a0525] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-amber-400 mb-4" />
        <p className="text-white/50 animate-pulse">Recherche du billet...</p>
      </div>
    );
  }

  // --- RENDU : Non connecté ou Erreur ---
  if (!user || errorMsg || !ticket) {
    return (
      <div className="min-h-screen bg-[#1a0525] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl max-w-md w-full backdrop-blur-xl">
          <div className="flex justify-center mb-6">
            <AlertCircle className="w-16 h-16 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Oups !</h1>
          <p className="text-gray-400 mb-8">
            {errorMsg || "Vous devez être connecté pour voir ce billet."}
          </p>
          <div className="flex flex-col gap-3">
            {!user ? (
              <Link
                to="/auth/login"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition"
              >
                Se connecter
              </Link>
            ) : (
              <Link
                to="/my-tickets"
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition"
              >
                Retour à mes billets
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDU : Billet trouvé ---
  return (
    <div className="min-h-screen bg-[#1a0525] pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Fond d'ambiance */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <Link
          to="/my-tickets"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Retour à la liste
        </Link>

        <div className="flex justify-center">
          <Ticket user={user} ticket={ticket} />
        </div>

        {/* 🔥 Bouton de suppression */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/50 text-rose-400 hover:text-rose-300 font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {deleting ? "Suppression..." : "Supprimer ce billet"}
          </button>
        </div>
      </div>
    </div>
  );
}
