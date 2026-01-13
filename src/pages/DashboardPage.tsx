import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom"; // AJOUTÉ
import { supabase } from "../lib/supabase"; 
import { 
  TrendingUp, 
  Ticket, 
  Users, 
  DollarSign, 
  Loader2, 
  ArrowUpRight,
  RefreshCcw,
  LayoutDashboard,
  PartyPopper, // AJOUTÉ
  X // AJOUTÉ
} from "lucide-react";

// --- TYPES SÉCURISÉS ---
interface Sale {
  final_price: number;
  created_at: string;
  events: {
    title: string;
  } | null;
}

interface Stats {
  totalRevenue: number;
  totalTickets: number;
  totalUsers: number;
  recentSales: Sale[];
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalTickets: 0,
    totalUsers: 0,
    recentSales: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- GESTION DU MESSAGE D'ACCUEIL ---
  const [searchParams, setSearchParams] = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Vérifie si l'URL contient ?confirmed=true
    if (searchParams.get('confirmed') === 'true') {
      setShowWelcome(true);
      // Nettoyage de l'URL après 5 secondes pour une expérience propre
      const timer = setTimeout(() => {
        setShowWelcome(false);
        setSearchParams({});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  const fetchAdminStats = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      const { data: ticketsData, error: ticketError } = await supabase
        .from("tickets")
        .select(`
          final_price, 
          created_at, 
          events (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (ticketError) throw ticketError;

      const { count: userCount, error: userError } = await supabase
        .from("user_profiles")
        .select("*", { count: 'exact', head: true });

      if (userError) throw userError;

      const tickets = (ticketsData as unknown as Sale[]) || [];
      const revenue = tickets.reduce((acc, t) => acc + (Number(t.final_price) || 0), 0);
      
      setStats({
        totalRevenue: revenue,
        totalTickets: tickets.length,
        totalUsers: userCount || 0,
        recentSales: tickets,
      });
    } catch (error) {
      console.error("Erreur système stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-cyan-400" />
          <div className="absolute inset-0 blur-2xl bg-cyan-500/20 animate-pulse"></div>
        </div>
        <p className="text-slate-400 font-black italic uppercase tracking-[0.3em] mt-8 animate-pulse">
          Initialisation OneWay System...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0f172a] bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b] flex flex-col items-center text-white selection:bg-cyan-500 selection:text-black">
      
      <div className="w-full max-w-7xl mx-auto p-6 lg:p-10">
        
        {/* --- BANNIÈRE DE BIENVENUE (MESSAGE D'ACCUEIL) --- */}
        {showWelcome && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="relative overflow-hidden bg-cyan-500/10 border border-cyan-500/20 p-6 rounded-[2rem] backdrop-blur-xl flex items-center justify-between group shadow-[0_20px_50px_rgba(6,182,212,0.15)]">
              <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500"></div>
              <div className="flex items-center gap-5 relative z-10">
                <div className="bg-cyan-500 p-3 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  <PartyPopper className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black italic tracking-tighter uppercase leading-tight">
                    Accès Admin <span className="text-cyan-400">Activé</span>
                  </h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                    Vérification terminée — Session sécurisée établie
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowWelcome(false)}
                className="relative z-10 p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Header Ultra-Moderne */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative p-4 bg-slate-900 border border-white/10 rounded-2xl text-cyan-400 shadow-2xl">
                <LayoutDashboard size={32} />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                Control <span className="text-cyan-400">Panel</span>
              </h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 opacity-70">
                Monitoring Temps Réel — OneWayTicket v2.6
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => { setRefreshing(true); fetchAdminStats(); }}
            disabled={refreshing}
            className="group flex items-center gap-3 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/50 px-8 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-tighter disabled:opacity-50"
          >
            <RefreshCcw size={20} className={`${refreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} text-cyan-400`} />
            <span className="tracking-widest text-xs">{refreshing ? "Sync..." : "Rafraîchir"}</span>
          </button>
        </header>

        {/* --- KPI GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            title="Revenu Brut" 
            value={`${stats.totalRevenue.toLocaleString('fr-FR')} €`} 
            icon={<DollarSign size={24} />}
            color="bg-emerald-500/10"
            iconColor="text-emerald-400"
          />
          <StatCard 
            title="Billets Vendus" 
            value={stats.totalTickets.toLocaleString('fr-FR')} 
            icon={<Ticket size={24} />}
            color="bg-cyan-500/10"
            iconColor="text-cyan-400"
          />
          <StatCard 
            title="Database Users" 
            value={stats.totalUsers.toLocaleString('fr-FR')} 
            icon={<Users size={24} />}
            color="bg-pink-500/10"
            iconColor="text-pink-400"
          />
          <StatCard 
            title="Performance" 
            value="+12.5%" 
            icon={<TrendingUp size={24} />}
            color="bg-purple-500/10"
            iconColor="text-purple-400"
          />
        </div>

        {/* --- TABLEAU DE VENTES GLASSMORPHISM --- */}
        <div className="group relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden transition-all duration-500 hover:border-white/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-10 relative z-10">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
              <div className="w-2 h-8 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
              Flux de Ventes
            </h2>
            <button className="text-[10px] font-black text-cyan-400 hover:text-white uppercase tracking-[0.3em] flex items-center gap-2 transition-all group bg-cyan-500/5 px-5 py-2.5 rounded-full border border-cyan-500/20 hover:bg-cyan-500">
              Explorer <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>

          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                  <th className="pb-4 px-6">Événement</th>
                  <th className="pb-4 px-6 text-center">Horodatage</th>
                  <th className="pb-4 px-6 text-right">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSales.slice(0, 6).map((sale, idx) => (
                  <tr key={idx} className="group/row bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300">
                    <td className="py-5 px-6 rounded-l-2xl border-l border-y border-white/5 group-hover/row:border-cyan-500/30 transition-colors">
                      <span className="font-bold text-slate-100 uppercase tracking-tighter italic block truncate max-w-[250px]">
                        {sale.events?.title || "Pass Standard"}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center border-y border-white/5 text-slate-400 font-mono text-[10px] uppercase">
                      {new Date(sale.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-5 px-6 text-right rounded-r-2xl border-r border-y border-white/5 group-hover/row:border-cyan-500/30 transition-colors">
                      <span className="font-black text-cyan-400 text-xl tracking-tighter">
                        +{sale.final_price}€
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {stats.recentSales.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center gap-4 border-2 border-dashed border-white/5 rounded-3xl">
                <RefreshCcw className="text-slate-800 w-12 h-12" />
                <p className="text-slate-500 font-black italic uppercase tracking-widest text-xs">
                  Aucune donnée détectée dans le flux
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPOSANT INTERNE KPI ---
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  iconColor: string;
}

const StatCard = ({ title, value, icon, color, iconColor }: StatCardProps) => (
  <div className="relative group">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-transparent to-transparent group-hover:from-cyan-500/20 group-hover:to-purple-500/20 rounded-[2rem] transition duration-500"></div>
    <div className="relative bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/[0.07] transition-all duration-500 shadow-xl overflow-hidden">
      <div className={`w-14 h-14 ${color} ${iconColor} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
        {icon}
      </div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{title}</p>
      <p className="text-3xl font-black italic tracking-tighter group-hover:text-cyan-400 transition-colors">{value}</p>
      <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 w-0 group-hover:w-full transition-all duration-700"></div>
    </div>
  </div>
);

export default AdminDashboardPage;