import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Ticket, Plus, Trash2, DollarSign, Loader2, 
  LayoutDashboard, ArrowLeft, ChevronRight 
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AdminTicketTypesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlEventId = searchParams.get('eventId');

  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState(urlEventId || '');
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTickets, setFetchingTickets] = useState(false);

  const [newType, setNewType] = useState({
    name: '',
    price: '',
    capacity: ''
  });

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase
      .from('events')
      .select('id, title')
      .order('created_at', { ascending: false });
    if (data) setEvents(data);
  }, []);

  const fetchTicketTypes = useCallback(async (eventId: string) => {
    setFetchingTickets(true);
    const { data } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('event_id', eventId)
      .order('price', { ascending: true });
    if (data) setTicketTypes(data);
    setFetchingTickets(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (selectedEventId) {
      fetchTicketTypes(selectedEventId);
    } else {
      setTicketTypes([]);
    }
  }, [selectedEventId, fetchTicketTypes]);

  const handleAddTicketType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;
    setLoading(true);

    const { error } = await supabase.from('ticket_types').insert([{
      event_id: selectedEventId,
      name: newType.name,
      price: parseFloat(newType.price),
      capacity: parseInt(newType.capacity),
      quantity_sold: 0
    }]);

    if (!error) {
      setNewType({ name: '', price: '', capacity: '' });
      fetchTicketTypes(selectedEventId);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer ce tarif ?")) return;
    const { error } = await supabase.from('ticket_types').delete().eq('id', id);
    if (!error) fetchTicketTypes(selectedEventId);
  };

  return (
    <div className="w-full pb-12">
      {/* Header identique au Dashboard */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl text-cyan-400">
            <Ticket size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black italic uppercase text-white">
              Gestion <span className="text-cyan-400">Tarifs</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
              Configuration des Billets
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl font-black uppercase text-xs hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={18} /> Retour Panel
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panneau de configuration (Gauche) */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem]">
            <label className="text-xs font-black uppercase text-slate-500 block mb-4 tracking-widest">
              Sélectionner l'événement
            </label>
            <select 
              className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white outline-none focus:border-cyan-500 transition-all cursor-pointer"
              onChange={(e) => setSelectedEventId(e.target.value)}
              value={selectedEventId}
            >
              <option value="">Choisir...</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
          </div>

          {selectedEventId && (
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem]">
              <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2">
                <Plus size={20} className="text-cyan-400" /> Ajouter un prix
              </h3>
              <form onSubmit={handleAddTicketType} className="space-y-4">
                <input 
                  placeholder="Nom (ex: VIP, Early Bird...)" 
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-cyan-500"
                  value={newType.name}
                  onChange={e => setNewType({...newType, name: e.target.value})}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number" placeholder="Prix (€)" 
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-cyan-500"
                    value={newType.price}
                    onChange={e => setNewType({...newType, price: e.target.value})}
                    required
                  />
                  <input 
                    type="number" placeholder="Stock" 
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-cyan-500"
                    value={newType.capacity}
                    onChange={e => setNewType({...newType, capacity: e.target.value})}
                    required
                  />
                </div>
                <button 
                  disabled={loading}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#0f172a] font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <PlusCircle size={20} />}
                  Enregistrer
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Liste des Tarifs (Droite) */}
        <div className="lg:col-span-2">
          {!selectedEventId ? (
            <div className="h-full min-h-[300px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600">
              <Ticket size={48} className="mb-4 opacity-10" />
              <p className="font-black uppercase italic tracking-widest text-sm">
                Sélectionnez un événement pour configurer
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fetchingTickets ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-cyan-400" /></div>
              ) : ticketTypes.length > 0 ? (
                ticketTypes.map(type => (
                  <div key={type.id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between group hover:border-cyan-500/30 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="bg-cyan-500/10 p-4 rounded-2xl text-cyan-400">
                        <Ticket />
                      </div>
                      <div>
                        <h4 className="font-black uppercase text-xl italic">{type.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-slate-400 font-bold uppercase tracking-widest">
                            Stock: {type.capacity}
                          </span>
                          <span className="text-[10px] bg-emerald-500/10 px-2 py-1 rounded-md text-emerald-400 font-bold uppercase tracking-widest">
                            Vendus: {type.quantity_sold || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-black text-white">{type.price}€</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(type.id)}
                        className="text-slate-600 hover:text-red-500 transition-colors p-3 hover:bg-red-500/10 rounded-xl"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white/[0.02] rounded-[2.5rem] border border-white/5">
                  <p className="text-slate-500 font-black uppercase italic text-xs tracking-[0.2em]">
                    Aucun tarif configuré pour cet événement
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTicketTypesPage;