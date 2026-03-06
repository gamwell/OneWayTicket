import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Plus, BarChart3, Calendar, Users, Ticket,
  TrendingUp, Euro, ShoppingBag, Activity, ArrowUpRight,
  ChevronRight, Scan
} from "lucide-react";

type Stats = {
  totalEvents: number;
  totalTickets: number;
  totalUsers: number;
  totalRevenue: number;
  ticketsToday: number;
  recentTickets: any[];
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalTickets: 0,
    totalUsers: 0,
    totalRevenue: 0,
    ticketsToday: 0,
    recentTickets: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total événements
        const { count: eventsCount } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true });

        // Total billets
        const { count: ticketsCount } = await supabase
          .from("tickets")
          .select("*", { count: "exact", head: true });

        // Total utilisateurs
        const { count: usersCount } = await supabase
          .from("profils")
          .select("*", { count: "exact", head: true });

        // Billets vendus aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: todayCount } = await supabase
          .from("tickets")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString());

        // Derniers billets vendus
        const { data: recentTickets } = await supabase
          .from("tickets")
          .select(`*, events(title)`)
          .order("created_at", { ascending: false })
          .limit(5);

        // Revenus (sum prix_paye)
        const { data: revenueData } = await supabase
          .from("tickets")
          .select("prix_paye");

        const totalRevenue = revenueData?.reduce(
          (acc, t) => acc + (t.prix_paye || 0), 0
        ) || 0;

        setStats({
          totalEvents: eventsCount || 0,
          totalTickets: ticketsCount || 0,
          totalUsers: usersCount || 0,
          totalRevenue,
          ticketsToday: todayCount || 0,
          recentTickets: recentTickets || [],
        });
      } catch (err) {
        console.error("Erreur stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Événements",
      value: stats.totalEvents,
      icon: Calendar,
      color: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/20",
    },
    {
      label: "Billets vendus",
      value: stats.totalTickets,
      icon: Ticket,
      color: "from-amber-400 to-orange-500",
      shadow: "shadow-amber-500/20",
    },
    {
      label: "Utilisateurs",
      value: stats.totalUsers,
      icon: Users,
      color: "from-emerald-400 to-teal-500",
      shadow: "shadow-emerald-500/20",
    },
    {
      label: "Revenus",
      value: `${stats.totalRevenue.toFixed(2)} €`,
      icon: Euro,
      color: "from-rose-400 to-pink-600",
      shadow: "shadow-rose-500/20",
    },
    {
      label: "Billets aujourd'hui",
      value: stats.ticketsToday,
      icon: TrendingUp,
      color: "from-cyan-400 to-blue-500",
      shadow: "shadow-cyan-500/20",
    },
    {
      label: "Taux validation",
      value: stats.totalTickets > 0
        ? `${Math.round((stats.ticketsToday / stats.totalTickets) * 100)}%`
        : "0%",
      icon: Activity,
      color: "from-fuchsia-400 to-violet-600",
      shadow: "shadow-fuchsia-500/20",
    },
  ];

  const actions = [
    {
      to: "/admin/events/new",
      icon: Plus,
      label: "Créer un événement",
      desc: "Ajouter une nouvelle soirée",
      color: "rose",
    },
    {
      to: "/admin/events",
      icon: Calendar,
      label: "Gérer les événements",
      desc: "Modifier, supprimer, archiver",
      color: "violet",
    },
    {
      to: "/admin/users",
      icon: Users,
      label: "Gérer les utilisateurs",
      desc: "Rôles, accès, profils",
      color: "emerald",
    },
    {
      to: "/admin/scan",
      icon: Scan,
      label: "Scanner les billets",
      desc: "Valider les entrées en live",
      color: "amber",
    },
    {
      to: "/admin/stats",
      icon: BarChart3,
      label: "Statistiques",
      desc: "Ventes, revenus, analytics",
      color: "cyan",
    },
    {
      to: "/admin/tickets",
      icon: Ticket,
      label: "Tous les billets",
      desc: "Consulter, rembourser",
      color: "fuchsia",
    },
  ];

  const colorMap: Record<string, string> = {
    rose: "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40",
    violet: "bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/40",
    emerald: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40",
    amber: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40",
    cyan: "bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40",
    fuchsia: "bg-fuchsia-500/10 border-fuchsia-500/20 hover:bg-fuchsia-500/20 hover:border-fuchsia-500/40",
  };

  const iconColorMap: Record<string, string> = {
    rose: "bg-rose-500 shadow-rose-500/30",
    violet: "bg-violet-500 shadow-violet-500/30",
    emerald: "bg-emerald-500 shadow-emerald-500/30",
    amber: "bg-amber-500 shadow-amber-500/30",
    cyan: "bg-cyan-500 shadow-cyan-500/30",
    fuchsia: "bg-fuchsia-500 shadow-fuchsia-500/30",
  };

  return (
    <div className="min-h-screen bg-[#1a0525] text-white pt-24 px-6 pb-16">
      {/* Fond d'ambiance */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-rose-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-white/40 text-sm uppercase tracking-widest mb-1">Tableau de bord</p>
            <h1 className="text-4xl font-black uppercase italic">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
                Admin Dashboard
              </span>
            </h1>
          </div>
          <Link
            to="/admin/events/new"
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-rose-500/30"
          >
            <Plus size={18} />
            Nouvel événement
          </Link>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/8 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 shadow-lg ${card.shadow}`}>
                <card.icon size={18} className="text-white" />
              </div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1">{card.label}</p>
              {loading ? (
                <div className="h-7 w-16 bg-white/10 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-black text-white">{card.value}</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ACTIONS RAPIDES */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold uppercase tracking-widest text-white/50 mb-4">
              Actions rapides
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {actions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className={`border p-5 rounded-2xl transition-all flex items-center gap-4 group ${colorMap[action.color]}`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${iconColorMap[action.color]}`}>
                    <action.icon size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{action.label}</p>
                    <p className="text-white/40 text-xs truncate">{action.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* DERNIÈRES VENTES */}
          <div>
            <h2 className="text-lg font-bold uppercase tracking-widest text-white/50 mb-4">
              Dernières ventes
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-white/10 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : stats.recentTickets.length === 0 ? (
                <div className="p-8 text-center text-white/30">
                  <ShoppingBag size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune vente pour le moment</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {stats.recentTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                      <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Ticket size={14} className="text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {ticket.events?.title || "Événement inconnu"}
                        </p>
                        <p className="text-white/40 text-xs">
                          {new Date(ticket.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                      <ArrowUpRight size={14} className="text-emerald-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 border-t border-white/5">
                <Link
                  to="/admin/tickets"
                  className="flex items-center justify-center gap-2 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest py-2 transition-colors"
                >
                  Voir tous les billets
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
