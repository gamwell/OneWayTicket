import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../supabaseClient";
import { Ticket, Search, X, RefreshCw, Loader2, CheckCircle, XCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

type TicketRow = {
  id: string;
  created_at: string;
  final_price: number;
  status: string;
  user_id: string;
  qr_code_hash: string;
  holder_name?: string;
  events?: { title: string; date: string; location?: string };
  user_profiles?: { email: string; full_name: string };
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refundLoading, setRefundLoading] = useState<string | null>(null);
  const [confirmRefund, setConfirmRefund] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          events (title, date, location),
          user_profiles!tickets_user_id_fkey (email, full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets((data as TicketRow[]) || []);
    } catch (err: any) {
      console.error("Erreur tickets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleRefund = async (ticketId: string) => {
    setRefundLoading(ticketId);
    setMessage(null);
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ status: "refunded" })
        .eq("id", ticketId);

      if (error) throw error;
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: "refunded" } : t));
      setMessage({ type: "ok", text: "Billet remboursé avec succès." });
    } catch (err: any) {
      setMessage({ type: "err", text: "Erreur lors du remboursement : " + err.message });
    } finally {
      setRefundLoading(null);
      setConfirmRefund(null);
    }
  };

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    return (
      t.events?.title?.toLowerCase().includes(q) ||
      t.user_profiles?.email?.toLowerCase().includes(q) ||
      t.user_profiles?.full_name?.toLowerCase().includes(q) ||
      t.holder_name?.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  });

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active:   "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      used:     "bg-blue-500/20 text-blue-300 border-blue-500/30",
      refunded: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      pending:  "bg-amber-500/20 text-amber-300 border-amber-500/30",
    };
    return map[status] || "bg-white/10 text-white/40 border-white/10";
  };

  return (
    <div className="min-h-screen bg-[#1a0525] text-white pt-24 pb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/dashboard" className="p-2 text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-12 h-12 bg-fuchsia-500 rounded-2xl flex items-center justify-center">
            <Ticket size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic">Tous les Billets</h1>
            <p className="text-white/40 text-sm">{tickets.length} billet{tickets.length !== 1 ? "s" : ""} au total</p>
          </div>
          <button onClick={fetchTickets} className="ml-auto p-2 text-white/40 hover:text-white transition-colors">
            <RefreshCw size={18} />
          </button>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 border ${
            message.type === "ok"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-300"
          }`}>
            {message.type === "ok" ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span className="font-bold text-sm">{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        {/* RECHERCHE */}
        <div className="relative max-w-xl mb-8">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par événement, email, nom..."
            className="w-full pl-11 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-fuchsia-400/50 text-sm transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-fuchsia-400 w-10 h-10" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <Ticket size={40} className="mx-auto text-white/20 mb-3" />
            <p className="text-white/40 font-bold">Aucun billet trouvé</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            {/* HEADER TABLE */}
            <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3 bg-white/5 border-b border-white/10 text-white/30 text-[10px] font-black uppercase tracking-widest">
              <span>Événement</span>
              <span>Client</span>
              <span>Prix</span>
              <span>Date achat</span>
              <span>Statut</span>
              <span>Action</span>
            </div>

            {/* ROWS */}
            <div className="divide-y divide-white/5">
              {filtered.map(ticket => (
                <div key={ticket.id} className="grid md:grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-white/5 transition-all">
                  
                  {/* ÉVÉNEMENT */}
                  <div>
                    <p className="font-bold text-white text-sm truncate">
                      {ticket.events?.title || "—"}
                    </p>
                    <p className="text-white/30 text-xs">
                      {ticket.events?.date
                        ? new Date(ticket.events.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </p>
                  </div>

                  {/* CLIENT */}
                  <div>
                    <p className="font-bold text-white text-sm truncate">
                      {ticket.user_profiles?.full_name || ticket.holder_name || "—"}
                    </p>
                    <p className="text-white/30 text-xs truncate">
                      {ticket.user_profiles?.email || "—"}
                    </p>
                  </div>

                  {/* PRIX */}
                  <p className="font-black text-amber-300 text-sm">
                    {ticket.final_price != null ? `${ticket.final_price} €` : "—"}
                  </p>

                  {/* DATE ACHAT */}
                  <p className="text-white/40 text-xs">
                    {new Date(ticket.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>

                  {/* STATUT */}
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase border w-fit ${statusBadge(ticket.status)}`}>
                    {ticket.status || "actif"}
                  </span>

                  {/* ACTION */}
                  <div>
                    {ticket.status === "refunded" ? (
                      <span className="text-white/20 text-xs">Remboursé</span>
                    ) : confirmRefund === ticket.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRefund(ticket.id)}
                          disabled={refundLoading === ticket.id}
                          className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
                        >
                          {refundLoading === ticket.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                          Confirmer
                        </button>
                        <button onClick={() => setConfirmRefund(null)} className="text-white/30 hover:text-white">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRefund(ticket.id)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-black text-xs rounded-lg transition-all flex items-center gap-1"
                      >
                        <AlertTriangle size={12} /> Rembourser
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
