import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  Ticket,
  Calendar,
  Users,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface Stats {
  events: number;
  tickets: number;
  users: number;
}

const HomePage: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    events: 0,
    tickets: 0,
    users: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [eventsRes, ticketsRes, usersRes] = await Promise.all([
          supabase.from("events").select("*", { count: "exact", head: true }),
          supabase.from("tickets").select("*", { count: "exact", head: true }),
          supabase
            .from("user_profiles")
            .select("*", { count: "exact", head: true }),
        ]);

        setStats({
          events: eventsRes.count || 0,
          tickets: ticketsRes.count || 0,
          users: usersRes.count || 0,
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
    <div className="w-full bg-[#1a0525] text-white overflow-hidden relative">
      {/* Fond d'ambiance */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-rose-500/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* --- SECTION STATISTIQUES --- */}
        <section className="py-24 border-b border-white/5">
          <div className="flex items-center justify-center gap-3 mb-16 opacity-50">
            <div className="h-[1px] w-12 bg-amber-200"></div>
            <h2 className="text-amber-200 text-[10px] font-black uppercase tracking-[0.5em]">
              L'impact OneWayTicket
            </h2>
            <div className="h-[1px] w-12 bg-amber-200"></div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-amber-300" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  val: stats.events,
                  lab: "Events Exclusifs",
                  color: "text-amber-300",
                  bg: "hover:bg-amber-500/10",
                  border: "hover:border-amber-500/30",
                  icon: <Calendar />,
                },
                {
                  val: stats.tickets,
                  lab: "Billets Émis",
                  color: "text-rose-400",
                  bg: "hover:bg-rose-500/10",
                  border: "hover:border-rose-500/30",
                  icon: <Ticket />,
                },
                {
                  val: stats.users,
                  lab: "Membres Privilège",
                  color: "text-teal-300",
                  bg: "hover:bg-teal-500/10",
                  border: "hover:border-teal-500/30",
                  icon: <Users />,
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 text-center transition-all duration-500 group shadow-2xl ${s.bg} ${s.border}`}
                >
                  <div
                    className={`${s.color} flex justify-center mb-6 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500`}
                  >
                    {React.cloneElement(s.icon as React.ReactElement, {
                      size: 40,
                    })}
                  </div>
                  <div
                    className={`text-6xl font-black mb-3 ${s.color} tracking-tighter`}
                  >
                    {s.val}
                  </div>
                  <div className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">
                    {s.lab}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- SECTION POURQUOI NOUS ? --- */}
        <section className="py-24 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold tracking-widest uppercase mb-6 text-amber-300">
              <Sparkles size={10} /> Expérience Premium
            </div>

            <h2 className="text-4xl md:text-5xl font-black italic uppercase leading-tight mb-6">
              La billetterie <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-500">
                Nouvelle Génération
              </span>
            </h2>

            <p className="text-white/50 text-lg leading-relaxed mb-8">
              Fini les files d'attente virtuelles interminables. OneWayTicket
              vous offre un accès direct, sécurisé et instantané aux événements
              les plus prisés du moment.
            </p>

            <Link
              to="/events"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-300 transition-all hover:scale-105"
            >
              Voir les événements <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-start gap-4 hover:bg-white/10 transition-colors">
              <div className="p-3 bg-teal-500/20 rounded-xl text-teal-400">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-wider mb-1">
                  100% Sécurisé
                </h3>
                <p className="text-white/40 text-sm">
                  Chaque billet est unique, infalsifiable et lié à votre profil.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-start gap-4 hover:bg-white/10 transition-colors">
              <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-wider mb-1">
                  Instantané
                </h3>
                <p className="text-white/40 text-sm">
                  Recevez votre QR Code immédiatement après le paiement.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;