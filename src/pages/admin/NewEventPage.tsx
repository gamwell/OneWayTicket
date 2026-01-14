import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Calendar, MapPin, DollarSign, Type, CheckCircle2, AlertCircle } from 'lucide-react';

const NewEventPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    price: '',
    image_url: '',
    category: 'Concert'
  });

  useEffect(() => {
    if (!isEditing) return;
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
        if (error) throw error;
        if (data) {
          const formattedDate = new Date(data.date).toISOString().slice(0, 16);
          setFormData({
            title: data.title,
            description: data.description || '',
            date: formattedDate,
            location: data.location,
            price: data.price.toString(),
            image_url: data.image_url || '',
            category: data.category || 'Concert'
          });
        }
      } catch (error) { console.error(error); } finally { setFetching(false); }
    };
    fetchEvent();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        location: formData.location,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        category: formData.category
      };

      let error;
      if (isEditing) {
        const { error: err } = await supabase.from('events').update(eventData).eq('id', id);
        error = err;
      } else {
        const { error: err } = await supabase.from('events').insert([eventData]);
        error = err;
      }

      if (error) throw error;
      setMessage({ type: 'success', text: isEditing ? "Modifié avec succès !" : "Créé avec succès !" });
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="min-h-screen bg-[#1a0525] flex items-center justify-center"><Loader2 className="animate-spin text-amber-300" /></div>;

  return (
    <div className="min-h-screen text-white pt-24 pb-12 px-6 relative overflow-hidden" style={{ backgroundColor: '#1a0525' }}>
      <div className="fixed inset-0 z-[0] pointer-events-none">
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 text-rose-200/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Retour
          </button>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            {isEditing ? 'Édition' : 'Création'} <span className="text-amber-300">Event</span>
          </h1>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          {message && (
            <div className={`p-4 rounded-2xl mb-8 flex items-center gap-3 ${message.type === 'success' ? 'bg-teal-500/20 text-teal-200' : 'bg-rose-500/20 text-rose-200'}`}>
               {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
               <span className="font-bold text-sm">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-amber-100/60 ml-3">Titre</label>
                 <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold" placeholder="Titre de l'event" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-amber-100/60 ml-3">Date</label>
                 <input required type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold [color-scheme:dark]" />
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-amber-100/60 ml-3">Lieu</label>
                 <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold" placeholder="Ville, Salle..." />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-amber-100/60 ml-3">Prix (€)</label>
                 <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold" placeholder="0.00" />
               </div>
            </div>

            <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-amber-100/60 ml-3">Image URL</label>
                 <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold" placeholder="https://..." />
            </div>

            <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-amber-100/60 ml-3">Description</label>
                 <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 mt-2 rounded-2xl bg-gradient-to-r from-amber-300 to-rose-500 text-white font-black uppercase tracking-widest hover:scale-[1.01] transition-all flex justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <Save />} {isEditing ? "Mettre à jour" : "Créer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// IMPORTANT :
export default NewEventPage;