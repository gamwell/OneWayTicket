import React, { useEffect, useState } from 'react';
// CORRECTION IMPORT : On remonte d'un seul niveau car on est dans src/pages/
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, Users, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

const HomePage = () => {
  const [stats, setStats] = useState({ events: 0, tickets: 0, users: 0 });
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) { setLoading(false); return; }
      try {
        setLoading(true);
        const [eventsRes, ticketsRes, usersRes, featuredRes] = await Promise.all([
          supabase.from('events').select('*', { count: 'exact', head: true }),
          supabase.from('tickets').select('*', { count: 'exact', head: true }),
          supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
          supabase.from('events').select('*').limit(3).order('created_at', { ascending: false })
        ]);
        setStats({ events: eventsRes.count || 0, tickets: ticketsRes.count || 0, users: usersRes.count || 0 });
        setFeaturedEvents(featuredRes.data || []);
      } catch (error) { console.error("Erreur Home:", error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    // FOND FORCÉ PRUNE (#1a0525)
    <div className="min-h-screen text-white relative overflow-hidden" 
         style={{ backgroundColor: '#1a0525' }}>
      
      {/* AMBIANCE TROPICALE */}
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-rose-500/15 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-400/10 blur-[180px] rounded-full"></div>
      </div>

      <div className="relative z-10">
        <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 md:px-6 py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold tracking-[0.3em] uppercase mb-8 text-amber-200 shadow-lg shadow-amber-500/10">
            <Sparkles size={14} className="text-amber-300" /> 
            L'Exclusivité Redéfinie
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 select-none leading-tight uppercase italic w-full break-words py-4 drop-shadow-2xl overflow-visible">
            <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-orange-400 bg-clip-text text-transparent inline-block pr-4 pb-2">
              ONEWAYTICKET
            </span>
          </h1>
          
          <p className="text-base md:text-3xl text-rose-100/60 font-medium italic max-w-3xl leading-relaxed px-4">
            "Le passeport pour vos souvenirs les plus précieux. <br className="hidden md:block" /> Commencez l'extraordinaire."
          </p>
          
          <div className="mt-16 flex flex-col sm:flex-row gap-6 w-full sm:w-auto px-6">
            <Link to="/events" className="w-full sm:w-auto px-16 py-6 bg-white text-[#1a0525] rounded-full font-black text-lg hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3">
              DÉCOUVRIR <ArrowRight size={20} />
            </Link>
          </div>
        </section>

        {/* STATS */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { val: stats.events, lab: "Events Exclusifs", color: "text-amber-300", icon: <Calendar /> },
              { val: stats.tickets, lab: "Billets Émis", color: "text-rose-400", icon: <Ticket /> },
              { val: stats.users, lab: "Membres Privilège", color: "text-teal-300", icon: <Users /> }
            ].map((s, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/10 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] group hover:-translate-y-3 transition-all duration-500 hover:bg-white/10 hover:border-white/20">
                <div className={`${s.color} flex justify-center mb-6 opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-lg`}>
                  {React.cloneElement(s.icon as React.ReactElement, { size: 40 })}
                </div>
                <div className={`text-6xl md:text-7xl font-black mb-4 ${s.color} tracking-tighter`}>{s.val}</div>
                <div className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">{s.lab}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;