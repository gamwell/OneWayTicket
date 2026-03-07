import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import {
  Plus, BarChart3, Calendar, Ticket,
  TrendingUp, Euro, ShoppingBag, Activity, ArrowUpRight,
  Scan
} from "lucide-react";

type Stats = {
  totalEvents: number;
  totalTickets: number;
  totalRevenue: number;
  ticketsToday: number;
  recentTickets: any[];
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalTickets: 0,
    totalRevenue: 0,
    ticketsToday: 0,
    recentTickets: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { count: eventsCount } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true });

      const { count: ticketsCount } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      const { data: recentTickets } = await supabase
        .from("tickets")
        .select("*, events(title)")
        .order("created_at", { ascending: false })
        .limit(5);

      // ✅ Correction : final_price au lieu de prix_paye
      const { data: revenueData } = await supabase
        .from("tickets")
        .select("final_price");

      const totalRevenue = revenueData?.reduce(
        (acc, t) => acc + (t.final_price || 0), 0
      ) || 0;

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

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Temps réel
  useEffect(() => {
    const channel = supabase
      .channel('admin-dashboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          console.log("🔄 Nouvelle vente détectée !");
          fetchStats();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchStats]);

  const statCards = [
    { label: "Événements", value: stats.totalEvents, icon: Calendar, color: "from-violet-500 to-purple-600" },
    { label: "Billets vendus", value: stats.totalTickets, icon: Ticket, color: "from-amber-400 to-orange-500" },
    { label: "Revenus", value: `${stats.totalRevenue.toFixed(2)} €`, icon: Euro, color: "from-rose-400 to-pink-600" },
    { label: "Ventes Jour", value: stats.ticketsToday, icon: TrendingUp, color: "from-cyan-400 to-blue-500" },
    { label: "Activité", value: stats.totalTickets > 0 ? `${Math.round((stats.ticketsToday / stats.totalTickets) * 100)}%` : "0%", icon: Activity, color: "from-fuchsia-400 to-violet-600" },
  ];

  return (
    <div className="min-h-screen bg-[#1a0525] text-white pt-24 px-6 pb-16">
      {/* Fond ambiance */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-rose-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-4xl font-black uppercase italic mb-12 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
          Admin Dashboard (Live)
        </h1>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/8 transition-all">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 shadow-lg`}>
                <card.icon size={18} className="text-white" />
              </div>
              <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">{card.label}</p>
              {loading ? (
                <div className="h-6 w-12 bg-white/10 rounded animate-pulse" />
              ) : (
                <p className="text-xl font-black text-white">{card.value}</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ACTIONS RAPIDES */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold uppercase tracking-widest text-white/50 mb-4">Actions prioritaires</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link to="/admin/events/new" className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl flex items-center gap-5 group hover:bg-rose-500/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
                  <Plus />
                </div>
                <div>
                  <p className="font-black text-white uppercase italic">Créer un événement</p>
                  <p className="text-white/40 text-xs">Ajouter une soirée</p>
                </div>
              </Link>

              <Link to="/admin/scan" className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex items-center gap-5 group hover:bg-amber-500/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                  <Scan />
                </div>
                <div>
                  <p className="font-black text-white uppercase italic">Scanner les billets</p>
                  <p className="text-white/40 text-xs">Valider les entrées</p>
                </div>
              </Link>

              <Link to="/admin/checkin-dashboard" className="bg-cyan-500/10 border border-cyan-500/20 p-6 rounded-3xl flex items-center gap-5 group hover:bg-cyan-500/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                  <BarChart3 />
                </div>
                <div>
                  <p className="font-black text-white uppercase italic">Statistiques</p>
                  <p className="text-white/40 text-xs">Ventes & analytics</p>
                </div>
              </Link>

              <Link to="/admin/tools" className="bg-fuchsia-500/10 border border-fuchsia-500/20 p-6 rounded-3xl flex items-center gap-5 group hover:bg-fuchsia-500/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/30">
                  <Ticket />
                </div>
                <div>
                  <p className="font-black text-white uppercase italic">Tous les billets</p>
                  <p className="text-white/40 text-xs">Consulter, rembourser</p>
                </div>
              </Link>
            </div>
          </div>

          {/* FLUX DES VENTES */}
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
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 flex-shrink-0">
                        <Ticket size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate text-white max-w-[140px]">
                          {ticket.events?.title || "Événement"}
                        </p>
                        <p className="text-[10px] text-white/40">
                          {new Date(ticket.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                          })}
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
