import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase"; 
import { TrendingUp, Ticket, Users, DollarSign, Loader2, PlusCircle } from "lucide-react";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalRevenue: 0, totalTickets: 0, totalUsers: 0, recentSales: [] });
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = useCallback(async () => {
    try {
      setLoading(true);
      if (!supabase) return;

      // Récupération des revenus depuis la table 'tickets'
      const { data: ticketsData } = await supabase.from("tickets").select(`final_price, created_at, events(title)`);
      // Récupération du nombre de membres depuis 'user_profiles'
      const { count: userCount } = await supabase.from("user_profiles").select("*", { count: 'exact', head: true });

      const tickets = ticketsData || [];
      const revenue = tickets.reduce((acc, t: any) => acc + (Number(t.final_price) || 0), 0);
      
      setStats({
        totalRevenue: revenue,
        totalTickets: tickets.length,
        totalUsers: userCount || 0,
        recentSales: tickets.slice(0, 5) as any,
      });
    } catch (error) {
      console.error("Erreur de stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdminStats(); }, [fetchAdminStats]);

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-28 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Admin <span className="text-cyan-400">Dashboard</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Monitoring OneWayTicket</p>
          </div>
          <button onClick={() => navigate("/admin/events/new")} className="flex items-center gap-2 bg-cyan-500 text-black px-8 py-4 rounded-2xl font-black uppercase hover:scale-105 transition-all">
            <PlusCircle size={20} /> Créer un Event
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
            <DollarSign className="text-emerald-400 mb-4" />
            <p className="text-4xl font-black italic">{stats.totalRevenue}€</p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Revenu Total</p>
          </div>
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
            <Ticket className="text-cyan-400 mb-4" />
            <p className="text-4xl font-black italic">{stats.totalTickets}</p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Billets Vendus</p>
          </div>
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
            <Users className="text-pink-400 mb-4" />
            <p className="text-4xl font-black italic">{stats.totalUsers}</p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Membres Actifs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;