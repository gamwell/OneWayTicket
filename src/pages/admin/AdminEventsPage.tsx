import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  PlusCircle, Edit, Trash2, Calendar, Ticket, 
  MapPin, ChevronRight, Loader2, LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEventImage } from "@/utils/eventImages";

const AdminEventsPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (data) setEvents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cet événement et tous ses billets ?")) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) fetchEvents();
  };

  return (
    <div className="w-full pb-12">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl text-cyan-400 shadow-xl">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter">
              Catalogue <span className="text-cyan-400">Événements</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
              Gestion et Programmation
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/admin/events/new')}
          className="flex items-center gap-3 bg-cyan-500 hover:bg-cyan-400 text-[#0f172a] px-8 py-4 rounded-2xl font-black uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 group"
        >
          <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
          <span className="tracking-widest text-xs">Nouvel Événement</span>
        </button>
      </header>

      {/* MINI STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-5">
          <div className="bg-cyan-500/10 p-3 rounded-xl text-cyan-400"><Calendar size={24}/></div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total Événements</p>
            <p className="text-2xl font-black">{events.length}</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-5">
          <div className="bg-purple-500/10 p-3 rounded-xl text-purple-400"><Ticket size={24}/></div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Billetterie Active</p>
            <p className="text-2xl font-black">En ligne</p>
          </div>
        </div>
      </div>

      {/* LISTE DES ÉVÉNEMENTS */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-cyan-400 w-12 h-12" />
        </div>
      ) : (
        <div className="grid gap-6">
          {events.length > 0 ? (
            events.map((event) => (
              <div 
                key={event.id} 
                className="group relative bg-white/[0.03] border border-white/10 rounded-[2rem] overflow-hidden hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center p-6 gap-8">
                  
                  {/* IMAGE AUTOMATIQUE */}
                  <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 shadow-xl border border-white/10">
                    <img 
                      src={getEventImage(event)} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* INFOS */}
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                    <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-cyan-400" />
                        {new Date(event.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-cyan-400" />
                        {event.location}
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => navigate(`/admin/events/edit/${event.id}`)}
                      className="p-3 bg-white/5 hover:bg-cyan-500 hover:text-white rounded-xl transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="p-3 bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="ml-2 p-2 text-slate-600">
                       <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
              <p className="text-slate-500 italic">Aucun événement trouvé dans la base de données.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminEventsPage;