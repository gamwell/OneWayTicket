import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import {
  Plus, BarChart3, Calendar, Ticket,
  TrendingUp, Euro, ShoppingBag, Activity, ArrowUpRight,
  Scan, CheckCircle, XCircle, Clock, UserCheck, ChevronDown, ChevronUp
} from "lucide-react";

type Stats = {
  totalEvents: number;
  totalTickets: number;
  totalRevenue: number;
  ticketsToday: number;
  recentTickets: any[];
};

type DiscountRequest = {
  id: string;
  email: string;
  full_name: string;
  profile_type_id: number;
  profile_type_name: string;
  discount_justification: string;
  discount_requested_at: string;
  discount_status: string;
  documentSignedUrl?: string | null;
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0, totalTickets: 0, totalRevenue: 0,
    ticketsToday: 0, recentTickets: [],
  });
  const [loading, setLoading] = useState(true);
  const [discountRequests, setDiscountRequests] = useState<DiscountRequest[]>([]);
  const [discountLoading, setDiscountLoading] = useState(true);
  const [showDiscounts, setShowDiscounts] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const { count: eventsCount } = await supabase.from("events").select("*", { count: "exact", head: true });
      const { count: ticketsCount } = await supabase.from("tickets").select("*", { count: "exact", head: true });
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase.from("tickets").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString());
      const { data: recentTickets } = await supabase.from("tickets").select("*, events(title)").order("created_at", { ascending: false }).limit(5);
      const { data: revenueData } = await supabase.from("tickets").select("final_price");
      const totalRevenue = revenueData?.reduce((acc, t) => acc + (t.final_price || 0), 0) || 0;
      setStats({
        totalEvents: eventsCount || 0,
        totalTickets: ticketsCount || 0,
        totalRevenue,
        ticketsToday: todayCount || 0,
        recentTickets: recentTickets || [],
      });
    } catch (err) {
      console.error("Erreur Stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Via Edge Function — contourne les RLS
  const fetchDiscountRequests = useCallback(async () => {
    try {
      setDiscountLoading(true);
      const { data, error } = await supabase.functions.invoke("get-discount-requests", {
        method: "GET",
      });
      if (error) throw error;
      setDiscountRequests(
        (data?.requests || []).map((r: any) => ({
          ...r,
          profile_type_name: r.profile_type_id === 2 ? "Étudiant" : r.profile_type_id === 3 ? "Senior (+65 ans)" : "Inconnu",
          documentSignedUrl: r.documentSignedUrl || null,
        }))
      );
    } catch (err) {
      console.error("Erreur demandes réduction:", err);
    } finally {
      setDiscountLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); fetchDiscountRequests(); }, [fetchStats, fetchDiscountRequests]);

  // Temps réel tickets
  useEffect(() => {
    const channel = supabase
      .channel("admin-dashboard-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => fetchStats())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "user_profiles" }, () => fetchDiscountRequests())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchStats, fetchDiscountRequests]);

  // ✅ Valider/Refuser via Edge Function
  const handleDiscountAction = async (userId: string, action: "approved" | "rejected") => {
    setActionLoading(userId);
    try {
      const { error } = await supabase.functions.invoke("get-discount-requests", {
        method: "PATCH",
        body: { userId, action },
      });
      if (!error) {
        setDiscountRequests(prev => prev.filter(r => r.id !== userId));
      }
    } catch (err) {
      console.error("Erreur action:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const statCards = [
    { label: "Événements", value: stats.totalEvents, icon: Calendar, color: "from-violet-500 to-purple-600" },
    { label: "Billets vendus", value: stats.totalTickets, icon: Ticket, color: "from-amber-400 to-orange-500" },
    { label: "Revenus", value: `${stats.totalRevenue.toFixed(2)} €`, icon: Euro, color: "from-rose-400 to-pink-600" },
    { label: "Ventes Jour", value: stats.ticketsToday, icon: TrendingUp, color: "from-cyan-400 to-blue-500" },
    { label: "Activité", value: stats.totalTickets > 0 ? `${Math.round((stats.ticketsToday / stats.totalTickets) * 100)}%` : "0%", icon: Activity, color: "from-fuchsia-400 to-violet-600" },
  ];

  return (
    <div className="min-h-screen bg-[#1a0525] text-white pt-24 px-6 pb-16">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-rose-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-4xl font-black uppercase italic mb-12 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
          Admin Dashboard (Live)
        </h1>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/8 transition-all">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 shadow-lg`}>
                <card.icon size={18} className="text-white" />
              </div>
              <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">{card.label}</p>
              {loading ? <div className="h-6 w-12 bg-white/10 rounded animate-pulse" /> : <p className="text-xl font-black text-white">{card.value}</p>}
            </div>
          ))}
        </div>

        {/* DEMANDES DE RÉDUCTION */}
        <div className="mb-10">
          <button
            onClick={() => setShowDiscounts(v => !v)}
            className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-6 py-4 hover:bg-white/8 transition-all mb-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center">
                <UserCheck size={16} className="text-white" />
              </div>
              <span className="font-black uppercase tracking-widest text-sm">Demandes de réduction</span>
              {discountRequests.length > 0 && (
                <span className="px-2 py-0.5 bg-rose-500 text-white text-xs font-black rounded-full">
                  {discountRequests.length}
                </span>
              )}
            </div>
            {showDiscounts ? <ChevronUp size={18} className="text-white/40" /> : <ChevronDown size={18} className="text-white/40" />}
          </button>

          {showDiscounts && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              {discountLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : discountRequests.length === 0 ? (
                <div className="text-center py-8 text-white/30">
                  <CheckCircle size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucune demande en attente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {discountRequests.map((req) => (
                    <div key={req.id} className="bg-white/5 border border-teal-500/20 rounded-2xl p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <p className="font-black text-white">{req.full_name || req.email}</p>
                            <span className="px-2 py-0.5 bg-teal-500/20 border border-teal-500/30 rounded-full text-teal-300 text-xs font-bold uppercase">
                              {req.profile_type_name}
                            </span>
                            <span className="flex items-center gap-1 text-white/30 text-xs">
                              <Clock size={10} />
                              {new Date(req.discount_requested_at).toLocaleDateString("fr-FR", {
                                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                              })}
                            </span>
                          </div>
                          <p className="text-white/40 text-xs mb-2">{req.email}</p>
                          {req.discount_justification && (
                            <div className="bg-white/5 rounded-xl p-3 mt-2">
                              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Justificatif texte</p>
                              <p className="text-white/70 text-sm">{req.discount_justification}</p>
                            </div>
                          )}
                          {req.documentSignedUrl && (
                            <div className="mt-2">
                              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Document joint</p>
                              {req.documentSignedUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i) ? (
                                <a href={req.documentSignedUrl} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={req.documentSignedUrl}
                                    alt="Justificatif"
                                    className="max-h-40 rounded-xl border border-white/10 hover:opacity-80 transition-opacity cursor-pointer"
                                  />
                                </a>
                              ) : (
                                <a
                                  href={req.documentSignedUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white/70 text-sm hover:bg-white/20 transition-all"
                                >
                                  📄 Voir le document PDF
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3 flex-shrink-0">
                          <button
                            onClick={() => handleDiscountAction(req.id, "approved")}
                            disabled={actionLoading === req.id}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm"
                          >
                            <CheckCircle size={16} /> Valider
                          </button>
                          <button
                            onClick={() => handleDiscountAction(req.id, "rejected")}
                            disabled={actionLoading === req.id}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 font-bold rounded-xl transition-all disabled:opacity-50 text-sm"
                          >
                            <XCircle size={16} /> Refuser
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold uppercase tracking-widest text-white/50 mb-4">Actions prioritaires</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link to="/admin/events/new" className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl flex items-center gap-5 hover:bg-rose-500/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30"><Plus /></div>
                <div><p className="font-black text-white uppercase italic">Créer un événement</p><p className="text-white/40 text-xs">Ajouter une soirée</p></div>
              </Link>
              <Link to="/admin/scan" className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex items-center gap-5 hover:bg-amber-500/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30"><Scan /></div>
                <div><p className="font-black text-white uppercase italic">Scanner les billets</p><p className="text-white/40 text-xs">Valider les entrées</p></div>
              </Link>
              <Link to="/admin/checkin-dashboard" className="bg-cyan-500/10 border border-cyan-500/20 p-6 rounded-3xl flex items-center gap-5 hover:bg-cyan-500/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30"><BarChart3 /></div>
                <div><p className="font-black text-white uppercase italic">Statistiques</p><p className="text-white/40 text-xs">Ventes & analytics</p></div>
              </Link>
              <Link to="/admin/tools" className="bg-fuchsia-500/10 border border-fuchsia-500/20 p-6 rounded-3xl flex items-center gap-5 hover:bg-fuchsia-500/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/30"><Ticket /></div>
                <div><p className="font-black text-white uppercase italic">Tous les billets</p><p className="text-white/40 text-xs">Consulter, rembourser</p></div>
              </Link>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-lg font-bold uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
              <ShoppingBag size={20} /> Flux Live
            </h2>
            {stats.recentTickets.length === 0 ? (
              <div className="text-center py-8 text-white/20">
                <Ticket size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">Aucune vente pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 flex-shrink-0">
                        <Ticket size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate text-white max-w-[140px]">{ticket.events?.title || "Événement"}</p>
                        <p className="text-[10px] text-white/40">
                          {new Date(ticket.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-emerald-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
