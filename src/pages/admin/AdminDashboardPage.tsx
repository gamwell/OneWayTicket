import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase"; 
import { 
  TrendingUp, Ticket, Users, DollarSign, Loader2, 
  RefreshCcw, LayoutDashboard, PlusCircle, ArrowUpRight 
} from "lucide-react";

interface Stats {
  totalRevenue: number;
  totalTickets: number;
  totalUsers: number;
  recentSales: any[];
}

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalTickets: 0, totalUsers: 0, recentSales: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminStats = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      if (!supabase) return;

      const { data: ticketsData } = await supabase.from("tickets").select(`final_price, created_at, events(title)` );
      const { count: userCount } = await supabase.from("user_profiles").select("*", { count: 'exact', head: true });

      const tickets = ticketsData || [];
      const revenue = tickets.reduce((acc, t) => acc + (Number(t.final_price) || 0), 0);
      
      setStats({
        totalRevenue: revenue,
        totalTickets: tickets.length,
        totalUsers: userCount || 0,
        recentSales: tickets.slice(0, 5),
      });
    } catch (error) {
      console.error("Erreur stats admin:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => { fetchAdminStats(); }, [fetchAdminStats]);

  if (loading && !refreshing) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <Loader2 className="animate-spin text-cyan-400" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-28 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Control <span className="text-cyan-400">Panel</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Administration OneWayTicket</p>
          </div>
          <button 
            onClick={() => navigate("/admin/events/new")}
            className="flex items-center gap-3 bg-cyan-500 text-[#0f172a] px-8 py-4 rounded-2xl font-black uppercase hover:scale-105 transition-all shadow-lg shadow-cyan-500/20"
          >
            <PlusCircle size={20} /> Créer un Event
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Revenu" value={`${stats.totalRevenue}€`} icon={<DollarSign />} color="text-emerald-400" />
          <StatCard title="Ventes" value={stats.totalTickets} icon={<Ticket />} color="text-cyan-400" />
          <StatCard title="Membres" value={stats.totalUsers} icon={<Users />} color="text-pink-400" />
          <StatCard title="Trend" value="+12%" icon={<TrendingUp />} color="text-purple-400" />
        </div>

        {/* Sales Table */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
          <h2 className="text-xl font-black italic uppercase mb-8">Flux de Ventes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-white/5">
                  <th className="pb-4">Événement</th>
                  <th className="pb-4 text-right">Prix</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSales.map((sale, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-4 font-bold italic">{sale.events?.title || 'Billet'}</td>
                    <td className="py-4 text-right font-black text-cyan-400">{sale.final_price}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-all">
    <div className={`${color} mb-4`}>{icon}</div>
    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{title}</p>
    <p className="text-3xl font-black italic mt-1">{value}</p>
  </div>
);

export default AdminDashboardPage;