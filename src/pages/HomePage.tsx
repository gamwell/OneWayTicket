import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Ticket, 
  Calendar, 
  Users, 
  Loader2 
} from 'lucide-react';

interface Stats {
  events: number;
  tickets: number;
  users: number;
}

const HomePage: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ events: 0, tickets: 0, users: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [eventsRes, ticketsRes, usersRes] = await Promise.all([
          supabase.from('events').select('*', { count: 'exact', head: true }),
          supabase.from('tickets').select('*', { count: 'exact', head: true }),
          supabase.from('user_profiles').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          events: eventsRes.count || 0,
          tickets: ticketsRes.count || 0,
          users: usersRes.count || 0
        });
      } catch (error) {
        console.error("Erreur stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full">
      {/* SECTION STATISTIQUES UNIQUEMENT */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <h2 className="text-center text-amber-200 text-[10px] font-black uppercase tracking-[0.5em] mb-16 opacity-50">
          Statistiques de la plateforme
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-amber-300" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { val: stats.events, lab: "Events Exclusifs", color: "text-amber-300", icon: <Calendar /> },
              { val: stats.tickets, lab: "Billets Émis", color: "text-rose-400", icon: <Ticket /> },
              { val: stats.users, lab: "Membres Privilège", color: "text-teal-300", icon: <Users /> }
            ].map((s, i) => (
              <div 
                key={i} 
                className="bg-white/5 backdrop-blur-xl p-12 rounded-[3rem] border border-white/10 text-center hover:bg-white/10 transition-all duration-500 group shadow-2xl"
              >
                <div className={`${s.color} flex justify-center mb-6 opacity-60 group-hover:opacity-100 transition-opacity`}>
                  {React.cloneElement(s.icon as React.ReactElement, { size: 36 })}
                </div>
                <div className={`text-6xl font-black mb-3 ${s.color} tracking-tighter`}>
                  {s.val}
                </div>
                <div className="text-white/30 font-black uppercase tracking-[0.3em] text-[9px]">
                  {s.lab}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;