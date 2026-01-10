import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  X, Loader2, Save, Ticket, Euro, 
  Users, AlignLeft, Calendar 
} from 'lucide-react';

interface TicketType {
  id?: string;
  name: string;
  base_price: number;
  capacity: number;
  quantite_disponible: number;
  description: string;
  event_id: string;
}

interface EventOption {
  id: string;
  title: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ticketTypeToEdit?: TicketType | null;
}

const TicketTypeModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, ticketTypeToEdit }) => {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [formData, setFormData] = useState<TicketType>({
    name: '',
    base_price: 0,
    capacity: 0,
    quantite_disponible: 0,
    description: '',
    event_id: ''
  });

  // Charger la liste des événements pour le menu déroulant
  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('id, title').order('title');
      if (data) setEvents(data);
    };
    if (isOpen) fetchEvents();
  }, [isOpen]);

  // Remplir le formulaire en mode édition
  useEffect(() => {
    if (ticketTypeToEdit) {
      setFormData(ticketTypeToEdit);
    } else {
      setFormData({ name: '', base_price: 0, capacity: 0, quantite_disponible: 0, description: '', event_id: '' });
    }
  }, [ticketTypeToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Pour une création, la quantité disponible est égale à la capacité initiale
      const finalData = {
        ...formData,
        quantite_disponible: ticketTypeToEdit ? formData.quantite_disponible : formData.capacity
      };

      if (ticketTypeToEdit?.id) {
        const { error } = await supabase.from('ticket_types').update(finalData).eq('id', ticketTypeToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('ticket_types').insert([finalData]);
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur tarif :", error);
      alert("Erreur lors de l'enregistrement du tarif.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0f172a]/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#1e293b] border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
              {ticketTypeToEdit ? 'Ajuster' : 'Créer'} un <span className="text-pink-500">Tarif</span>
            </h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Configuration des accès OWT</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-slate-400 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Événement lié */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <Calendar size={14} /> Événement associé
            </label>
            <select 
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-cyan-500/50 outline-none transition-all appearance-none cursor-pointer"
              value={formData.event_id}
              onChange={e => setFormData({...formData, event_id: e.target.value})}
            >
              <option value="" disabled className="bg-[#1e293b]">Sélectionner un événement</option>
              {events.map(event => (
                <option key={event.id} value={event.id} className="bg-[#1e293b]">{event.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Nom du billet */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <Ticket size={14} /> Catégorie
              </label>
              <input 
                required
                placeholder="Ex: VIP, Early Bird..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-cyan-500/50 outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* Prix de base */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <Euro size={14} /> Prix de base
              </label>
              <input 
                type="number"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-cyan-500/50 outline-none transition-all"
                value={formData.base_price}
                onChange={e => setFormData({...formData, base_price: Number(e.target.value)})}
              />
            </div>
          </div>

          {/* Capacité */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <Users size={14} /> Capacité totale (Nombre de places)
            </label>
            <input 
              type="number"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-cyan-500/50 outline-none transition-all"
              value={formData.capacity}
              onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <AlignLeft size={14} /> Détails de l'offre
            </label>
            <textarea 
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-cyan-500/50 outline-none transition-all resize-none"
              placeholder="Inclus accès coupe-file, boisson..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all"
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketTypeModal;