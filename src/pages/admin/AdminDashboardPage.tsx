import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase"; 
import { 
  TrendingUp, Ticket, Users, DollarSign, Loader2, RefreshCcw, LayoutDashboard, PlusCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- TYPES ---
interface Sale { final_price: number; created_at: string; events: { title: string; } | null; }
interface Stats { totalRevenue: number; totalTickets: number; totalUsers: number; recentSales: Sale[]; }

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalTickets: 0, totalUsers: 0, recentSales: [], });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fonction de chargement des statistiques
  const fetchAdminStats = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const { data: ticketsData } = await supabase.from("tickets").select(`final_price, created_at, events ( title )`).order('created_at', { ascending: false });
      const { count: userCount } = await supabase.from("user_profiles").select("*", { count: 'exact', head: true });
      const tickets = (ticketsData as unknown as Sale[]) || [];
      const revenue = tickets.reduce((acc, t) => acc + (Number(t.final_price) || 0), 0);
      setStats({ totalRevenue: revenue, totalTickets: tickets.length, totalUsers: userCount || 0, recentSales: tickets, });
    } catch (error) { console.error(error); } finally { setLoading(false); setRefreshing(false); }
  }, [refreshing]);

  useEffect(() => { fetchAdminStats(); }, [fetchAdminStats]);

  const handleCreateEvent = () => {
    navigate("/admin/events/new"); 
  };

  if (loading && !refreshing) return <div className="flex justify-center pt-40"><Loader2 className="animate-spin text-cyan-400" /></div>;

  return (
    <div className="w-full pb-20 pt-32 relative">
      
      {/* ======================================================= */}
      {/* 🔴 BOUTON DE SECOURS (Si vous le voyez, vous êtes sur la bonne page) */}
      {/* ======================================================= */}
      <div className="fixed top-24 right-10 z-[9999]">
        <button 
          onClick={handleCreateEvent}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded-full font-black uppercase shadow-[0_0_20px_rgba(220,38,38,0.7)] border-2 border-white animate-pulse"
        >
          <PlusCircle size={24} />
          <span>CRÉER (FORCE)</span>
        </button>
      </div>
      {/* ======================================================= */}


      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl text-cyan-400">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black italic uppercase text-white">
              ADMIN <span className="text-cyan-400">PANEL</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
              Espace Administrateur - Monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setRefreshing(true); fetchAdminStats(); }}
            className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl font-black uppercase text-xs hover:bg-white/10 transition-all text-white"
          >
            <RefreshCcw size={20} className={refreshing ? "animate-spin" : ""} />
            Rafraîchir
          </button>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Revenu Total" value={`${stats.totalRevenue} €`} icon={<DollarSign />} color="bg-emerald-500/10" iconColor="text-emerald-400" />
        <StatCard title="Billets Vendus" value={`${stats.totalTickets}`} icon={<Ticket />} color="bg-cyan-500/10" iconColor="text-cyan-400" />
        <StatCard title="Utilisateurs" value={`${stats.totalUsers}`} icon={<Users />} color="bg-pink-500/10" iconColor="text-pink-400" />
        <StatCard title="État Système" value="En Ligne" icon={<TrendingUp />} color="bg-purple-500/10" iconColor="text-purple-400" />
      </div>

      {/* TABLEAU DES VENTES */}
      <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black italic uppercase border-l-4 border-cyan-400 pl-4">Dernières Ventes</h2>
          </div>
          
          <div className="overflow-x-auto min-h-[200px] flex flex-col justify-center">
            {stats.recentSales.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                    <th className="pb-4 px-6">Événement</th>
                    <th className="pb-4 px-6 text-center">Date</th>
                    <th className="pb-4 px-6 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSales.map((sale, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 font-bold">{sale.events?.title || "Billet Standard"}</td>
                      <td className="py-4 px-6 text-center text-xs text-slate-400">{new Date(sale.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-6 text-right font-black text-cyan-400">{sale.final_price}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <RefreshCcw className="w-8 h-8 text-slate-600 mx-auto mb-4 animate-spin-slow" />
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Aucune vente pour le moment</p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, iconColor }: any) => (
  <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem]">
    <div className={`w-10 h-10 ${color} ${iconColor} rounded-xl flex items-center justify-center mb-4`}>{icon}</div>
    <p className="text-slate-500 text-[10px] font-black uppercase mb-1 tracking-widest">{title}</p>
    <p className="text-3xl font-black italic text-white">{value}</p>
  </div>
);

export default AdminDashboardPage;