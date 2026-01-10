import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, Users, DollarSign, Ticket, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface StatsData {
  totalRevenue: number;
  totalSold: number;
  averageBasket: number;
  chartData: { name: string; sales: number }[];
}

const AdminStats = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Récupération des billets avec les infos des événements
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('final_price, events(title)');

      if (error) throw error;

      // Calcul des indicateurs
      const revenue = tickets.reduce((acc, t) => acc + (t.final_price || 0), 0);
      const sold = tickets.length;
      
      // Préparation des données du graphique (Ventes par Event)
      const eventMap: Record<string, number> = {};
      tickets.forEach(t => {
        const title = t.events?.title || 'Inconnu';
        eventMap[title] = (eventMap[title] || 0) + 1;
      });

      const chartData = Object.entries(eventMap).map(([name, sales]) => ({ name, sales }));

      setStats({
        totalRevenue: revenue,
        totalSold: sold,
        averageBasket: sold > 0 ? revenue / sold : 0,
        chartData
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-cyan-500" size={40} /></div>;
  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* CARTES DE KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Revenus Totaux" value={`${stats.totalRevenue}€`} icon={<DollarSign className="text-emerald-400" />} color="emerald" />
        <StatCard title="Billets Vendus" value={stats.totalSold} icon={<Ticket className="text-cyan-400" />} color="cyan" />
        <StatCard title="Panier Moyen" value={`${stats.averageBasket.toFixed(2)}€`} icon={<TrendingUp className="text-pink-400" />} color="pink" />
        <StatCard title="Taux d'occupation" value="78%" icon={<Users className="text-purple-400" />} color="purple" />
      </div>

      {/* GRAPHIQUE DE RÉPARTITION */}
      <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
        <h3 className="text-xl font-black italic uppercase text-white mb-8 tracking-tighter">Répartition des ventes par Event</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#22d3ee' }}
              />
              <Bar dataKey="sales" fill="#22d3ee" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Sous-composant pour les cartes de stats
const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center gap-5 hover:bg-white/10 transition-all group">
    <div className={`p-4 bg-${color}-500/10 rounded-2xl group-hover:scale-110 transition-transform`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-white mt-1">{value}</p>
    </div>
  </div>
);

export default AdminStats;