import React, { useEffect, useState } from 'react';
// ✅ CORRECTION ICI : On pointe vers le bon fichier client
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, Users, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

const HomePage = () => {
  const [stats, setStats] = useState({ events: 0, tickets: 0, users: 0 });
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Exécution des requêtes en parallèle pour gagner en vitesse
        const [eventsRes, ticketsRes, usersRes, featuredRes] = await Promise.all([
          supabase.from('events').select('*', { count: 'exact', head: true }),
          supabase.from('tickets').select('*', { count: 'exact', head: true }),
          supabase.from('user_profiles').select('*', { count: 'exact', head: true }), // Table synchronisée
          supabase.from('events').select('*').limit(3).order('created_at', { ascending: false })
        ]);

        setStats({
          events: eventsRes.count || 0,
          tickets: ticketsRes.count || 0,
          users: usersRes.count || 0
        });

        setFeaturedEvents(featuredRes.data || []);
      } catch (error) {
        console.error("Erreur de chargement Home:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden">
      
      {/* --- TEST TAILWIND (Plus discret) --- */}
      <div className="absolute top-4 left-4 z-[9999] px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-widest">
        Tailwind Engine Active
      </div>

      {/* --- COUCHE DE TEXTURE GRAIN --- */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03] contrast-150" 
           style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>

      {/* --- AURAS COLORÉES --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[60%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[10%] left-[-5%] w-[45%] h-[45%] bg-purple-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[140px] rounded-full"></div>
      </div>

      <div className="relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="h-[90vh] flex flex-col items-center justify-center text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold tracking-[0.3em] uppercase mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles size={14} className="text-yellow-400" /> 
            Bienvenue dans l'Exclusivité
          </div>
          <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter mb-8 select-none leading-none">
            <span className="bg-gradient-to-r from-emerald-400 via-blue-500 via-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              ONEWAYTICKET
            </span>
          </h1>
          <p className="text-xl md:text-3xl text-slate-400 font-medium italic max-w-3xl leading-relaxed">
            "Chaque billet est un nouveau départ. <br /> Le futur de vos souvenirs commence ici."
          </p>
          <div className="mt-16 flex flex-col sm:flex-row gap-6">
            <Link to="/events" className="px-16 py-6 bg-white text-slate-900 rounded-full font-black text-lg hover:scale-105 transition-all shadow-2xl flex items-center gap-3">
              EXPLORER LES EVENTS <ArrowRight size={20} />
            </Link>
          </div>
        </section>

        {/* --- STATS SECTION (Neumorphism) --- */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { val: stats.events, lab: "Événements", color: "text-emerald-400", icon: <Calendar /> },
              { val: stats.tickets, lab: "Billets Vendus", color: "text-blue-400", icon: <Ticket /> },
              { val: stats.users, lab: "Membres Actifs", color: "text-orange-400", icon: <Users /> }
            ].map((s, i) => (
              <div key={i} className="bg-[#1e293b]/50 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/5 text-center shadow-[20px_20px_60px_#080c14] group hover:-translate-y-3 transition-all duration-500">
                <div className={`${s.color} flex justify-center mb-6 opacity-50 group-hover:opacity-100 transition-opacity`}>
                  {React.cloneElement(s.icon as React.ReactElement, { size: 40 })}
                </div>
                <div className={`text-7xl font-black mb-4 ${s.color} tracking-tighter`}>{s.val}</div>
                <div className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">{s.lab}</div>
              </div>
            ))}
          </div>
        </section>

        {/* --- FEATURED SECTION --- */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-20">
              <div>
                <h2 className="text-5xl font-black tracking-tighter italic uppercase">Dernières <br /> <span className="text-cyan-400">Pépites</span></h2>
              </div>
              <Link to="/events" className="hidden md:flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                Voir tout le catalogue <ArrowRight size={16} />
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-white" size={40} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {featuredEvents.map((e) => (
                  <div key={e.id} className="group bg-white/5 backdrop-blur-md rounded-[3.5rem] p-6 border border-white/10 transition-all hover:bg-white/10">
                    <div className="h-80 rounded-[2.5rem] overflow-hidden mb-8 relative shadow-2xl">
                      <img src={e.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={e.title} />
                      <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/50 backdrop-blur-lg rounded-2xl border border-white/10 text-xs font-black uppercase tracking-tighter">
                        {e.category}
                      </div>
                    </div>
                    <div className="px-2">
                      <h3 className="text-2xl font-black tracking-tighter italic uppercase mb-2">{e.title}</h3>
                      <div className="flex items-center justify-between mt-6">
                        <span className="text-3xl font-black text-cyan-400">{e.price}€</span>
                        <Link to={`/events`} className="p-4 bg-white text-black rounded-2xl group-hover:bg-cyan-400 transition-colors">
                          <ArrowRight size={20} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default HomePage;