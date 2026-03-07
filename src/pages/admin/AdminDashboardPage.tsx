import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient"; 
import {
  Plus, BarChart3, Calendar, Ticket,
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

  // ✅ 1. On isole la fonction de récupération pour pouvoir la rappeler
  const fetchStats = useCallback(async () => {
    try {
      // Total événements
      const { count: eventsCount } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true });

      // Total billets
      const { count: ticketsCount } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true });

      // Billets aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      // Flux de ventes (Derniers billets)
      const { data: recentTickets } = await supabase
        .from("tickets")
        .select("*, events(title)")
        .order("created_at", { ascending: false })
        .limit(5);

      // Revenus
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
      console.error("Erreur Stats Realtime:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 2. Chargement initial
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ✅ 3. ABONNEMENT TEMPS RÉEL (Realtime)
  useEffect(() => {
    // On écoute tous les changements (* = INSERT, UPDATE, DELETE) sur la table 'tickets'
    const channel = supabase
      .channel('admin-dashboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          console.log("🔄 Nouvelle vente détectée ! Mise à jour...");
          fetchStats(); // On recharge les données dès qu'un billet est vendu
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  // --- RENDU (Identique au précédent) ---
  const statCards = [
    { label: "Événements", value: stats.totalEvents, icon: Calendar, color: "from-violet-500 to-purple-600" },
    { label: "Billets vendus", value: stats.totalTickets, icon: Ticket, color: "from-amber-400 to-orange-500" },
    { label: "Revenus", value: `${stats.totalRevenue.toFixed(2)} €`, icon: Euro, color: "from-rose-400 to-pink-600" },
    { label: "Ventes Jour", value: stats.ticketsToday, icon: TrendingUp, color: "from-cyan-400 to-blue-500" },
    { label: "Activité", value: stats.totalTickets > 0 ? `${Math.round((stats.ticketsToday / stats.totalTickets) * 100)}%` : "0%", icon: Activity, color: "from-fuchsia-400 to-violet-600" },
  ];

  return (
    <div className="min-h-screen bg-[#1a0525] text-white pt-24 px-6 pb-16">
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
              <p className="text-xl font-black text-white">{loading ? "..." : card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ACTIONS RAPIDES */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold uppercase tracking-widest text-white/50 mb-4">Actions prioritaires</h2>
            <div className="grid sm:grid-cols-2 gap-4">
               {/* (Vos boutons Plus, Scan, Stats, Billets ici) */}
               <Link to="/admin/events/new" className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl flex items-center gap-5 group hover:bg-rose-500/20">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white"><Plus /></div>
                  <div><p className="font-black text-white text-md uppercase italic">Créer un événement</p></div>
               </Link>
               <Link to="/admin/scan" className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex items-center gap-5 group hover:bg-amber-500/20">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white"><Scan /></div>
                  <div><p className="font-black text-white text-md uppercase italic">Scanner les billets</p></div>
               </Link>
               <Link to="/admin/checkin-dashboard" className="bg-cyan-500/10 border border-cyan-500/20 p-6 rounded-3xl flex items-center gap-5 group hover:bg-cyan-500/20">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center text-white"><BarChart3 /></div>
                  <div><p className="font-black text-white text-md uppercase italic">Statistiques</p></div>
               </Link>
               <Link to="/admin/tools" className="bg-fuchsia-500/10 border border-fuchsia-500/20 p-6 rounded-3xl flex items-center gap-5 group hover:bg-fuchsia-500/20">
                  <div className="w-12 h-12 rounded-2xl bg-fuchsia-500 flex items-center justify-center text-white"><Ticket /></div>
                  <div><p className="font-black text-white text-md uppercase italic">Tous les billets</p></div>
               </Link>
            </div>
          </div>

          {/* FLUX DES VENTES (DYNAMIQUE) */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-lg font-bold uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
              <ShoppingBag size={20} /> Flux Live
            </h2>
            <div className="space-y-4">
              {stats.recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 animate-in fade-in slide-in-from-right duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400">
                      <Ticket size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate text-white max-w-[150px]">{ticket.events?.title}</p>
                      <p className="text-[10px] text-emerald-400 font-bold uppercase italic">Vient d'être vendu</p>
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