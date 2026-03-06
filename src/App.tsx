import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Plus, BarChart3, Ticket,
  TrendingUp, Euro, ShoppingBag, Activity, ArrowUpRight,
  ChevronRight, Scan
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

  useEffect(() => {
    const fetchStats = async () => {
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

        const { data: revenueData } = await supabase
          .from("tickets")
          .select("prix_paye");

        const totalRevenue = revenueData?.reduce(
          (acc, t) => acc + (t.prix_paye || 0), 0
        ) || 0;

        setStats({
          totalEvents: eventsCount || 0,
          totalTickets: ticketsCount || 0,
          totalRevenue,
          ticketsToday: todayCount || 0,
          recentTickets: recentTickets || [],
        });
      } catch (err) {
        console.error("Erreur stats dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: "Événements", value: stats.totalEvents, icon: Plus, color: "from-violet-500 to-purple-600" },
    { label: "Billets vendus", value: stats.totalTickets, icon: Ticket, color: "from-amber-400 to-orange-500" },
    { label: "Revenus", value: `${stats.totalRevenue.toFixed(2)} €`, icon: Euro, color: "from-rose-400 to-pink-600" },
    { label: "Ventes jour", value: stats.ticketsToday, icon: TrendingUp, color: "from-cyan-400 to-blue-500" },
    { label: "Activité", value: stats.totalTickets > 0 ? `${Math.round((stats.ticketsToday / stats.totalTickets) * 100)}%` : "0%", icon: Activity, color: "from-fuchsia-400 to-violet-600" },
  ];

  // ✅ Liste mise à jour : "Gérer les événements" et "Gérer les utilisateurs" sont supprimés
  const actions = [
    {
      to: "/admin/events/new",
      icon: Plus,
      label: "Créer un événement",
      desc: "Ajouter une nouvelle soirée",
      color: "rose",
    },
    {
      to: "/admin/scan",
      icon: Scan,
      label: "Scanner les billets",
      desc: "Valider les entrées en live",
      color: "amber",
    },
    {
      to: "/admin/checkin-dashboard",
      icon: BarChart3,
      label: "Statistiques",
      desc: "Ventes, revenus, analytics",
      color: "cyan",
    },
    {
      to: "/admin/tools",
      icon: Ticket,
      label: "Tous les billets",
      desc: "Consulter, rembourser",
      color: "fuchsia",
    },
  ];

  const colorMap: Record<string, string> = {
    rose: "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40",
    amber: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40",
    cyan: "bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40",
    fuchsia: "bg-fuchsia-500/10 border-fuchsia-500/20 hover:bg-fuchsia-500/20 hover:border-fuchsia-500/40",
  };

  const iconColorMap: Record<string, string> = {
    rose: "bg-rose-500 shadow-rose-500/30",
    amber: "bg-amber-500 shadow-amber-500/30",
    cyan: "bg-cyan-500 shadow-cyan-500/30",
    fuchsia: "bg-fuchsia-500 shadow-fuchsia-500/30",
  };

  return (
    <div className="min-h-screen bg-[#1a0525] text-white pt-24 px-6 pb-16">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-white/40 text-sm uppercase tracking-widest mb-1">Administration</p>
            <h1 className="text-4xl font-black uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
              Admin Dashboard
            </h1>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 shadow-lg`}>
                <card.icon size={18} className="text-white" />
              </div>
              <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-xl font-black text-white">{loading ? "..." : card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ACTIONS RAPIDES (Grille de 2x2 pour les 4 boutons restants) */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold uppercase tracking-widest text-white/50 mb-4">Actions prioritaires</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {actions.map((action) => (
                <Link key={action.label} to={action.to} className={`border p-6 rounded-3xl transition-all flex items-center gap-5 group ${colorMap[action.color]}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${iconColorMap[action.color]}`}>
                    <action.icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-md uppercase italic">{action.label}</p>
                    <p className="text-white/40 text-xs">{action.desc}</p>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* DERNIÈRES VENTES */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-fit">
            <h2 className="text-lg font-bold uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
              <ShoppingBag size={20} /> Flux Ventes
            </h2>
            <div className="space-y-4">
              {stats.recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400">
                      <Ticket size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate text-white">{ticket.events?.title || "Événement"}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-tighter">Réussi</p>
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="text-emerald-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;