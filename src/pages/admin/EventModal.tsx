import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Loader2, Save, Image as ImageIcon, Type, MapPin, Calendar, Euro, AlignLeft } from 'lucide-react';

interface Event {
  id?: string;
  title: string;
  date: string;
  location: string;
  price: number;
  image_url: string;
  description: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventToEdit?: Event | null;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSuccess, eventToEdit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Event>({
    title: '',
    date: '',
    location: '',
    price: 0,
    image_url: '',
    description: ''
  });

  // Remplir le formulaire si on est en mode édition
  useEffect(() => {
    if (eventToEdit) {
      setFormData(eventToEdit);
    } else {
      setFormData({ title: '', date: '', location: '', price: 0, image_url: '', description: '' });
    }
  }, [eventToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (eventToEdit?.id) {
        // MODE ÉDITION
        const { error } = await supabase
          .from('events')
          .update(formData)
          .eq('id', eventToEdit.id);
        if (error) throw error;
      } else {
        // MODE CRÉATION
        const { error } = await supabase
          .from('events')
          .insert([formData]);
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur formulaire :", error);
      alert("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1e293b] border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl shadow-cyan-500/10">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
              {eventToEdit ? 'Modifier' : 'Nouveau'} <span className="text-cyan-400">Signal</span>
            </h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Configuration de l'expérience OWT</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-slate-400 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Titre */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <Type size={14} /> Nom de l'événement
              </label>
              <input 
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-cyan-500/50 focus:outline-none transition-all"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            {/* Prix */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <Euro size={14} /> Tarif (€)
              </label>
              <input 
                type="number"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-cyan-500/50 focus:outline-none transition-all"
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Date & Heure
              </label>
              <input 
                type="datetime-local"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-cyan-500/50 focus:outline-none transition-all"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>

            {/* Lieu */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <MapPin size={14} /> Localisation
              </label>
              <input 
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-cyan-500/50 focus:outline-none transition-all"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <ImageIcon size={14} /> URL de l'image de couverture
            </label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-cyan-500/50 focus:outline-none transition-all"
              placeholder="https://images.unsplash.com/..."
              value={formData.image_url}
              onChange={e => setFormData({...formData, image_url: e.target.value})}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <AlignLeft size={14} /> Description de l'expérience
            </label>
            <textarea 
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-cyan-500/50 focus:outline-none transition-all resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-6 flex gap-4">
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
              className="flex-1 py-4 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {eventToEdit ? 'Mettre à jour' : 'Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;