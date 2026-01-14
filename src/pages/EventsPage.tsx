import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight, Loader2, Filter, Lock, UserPlus, LogIn, X } from 'lucide-react';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // État pour gérer l'affichage de la fenêtre d'avertissement
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
        if (error) throw error;
        setEvents(data || []);
      } catch (error) { console.error('Error fetching events:', error); } 
      finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  // --- LOGIQUE D'INTERCEPTION ---
  const handleBookingClick = async (eventId: string) => {
    // Vérifie si l'utilisateur est connecté
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // ✅ Connecté : On va vers la page de l'événement
      navigate(`/events/${eventId}`);
    } else {
      // ❌ Pas connecté : On ouvre la fenêtre d'avertissement
      setShowAuthModal(true);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // FOND FORCÉ : Prune Profond (#1a0525)
    <div className="min-h-screen text-white relative overflow-hidden" style={{ background: '#1a0525' }}>
      
      {/* --- AMBIANCE LUMINEUSE --- */}
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>
        {/* Lumière Turquoise (Fraîcheur lointaine) */}
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-teal-500/10 blur-[130px] rounded-full"></div>
        {/* Lumière Rose (Chaleur proche) */}
        <div className="absolute bottom-[5%] right-[-5%] w-[55%] h-[55%] bg-rose-500/15 blur-[160px] rounded-full"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-24">
        
        {/* --- EN-TÊTE --- */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold tracking-[0.3em] uppercase mb-6 text-amber-200 shadow-lg">
            <Calendar size={14} className="text-amber-300" /> 
            Agenda Officiel
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic mb-8">
            Catalogue <br />
            <span className="bg-gradient-to-r from-amber-200 via-rose-300 to-teal-200 bg-clip-text text-transparent py-2 pr-4 inline-block">
              EXCLUSIF
            </span>
          </h1>
          
          {/* BARRE DE RECHERCHE LUXE */}
          <div className="max-w-xl mx-auto relative group">
             {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-amber-400 to-teal-400 rounded-full opacity-20 group-hover:opacity-40 blur transition-opacity duration-500"></div>
            <div className="relative bg-[#2a0a2e]/80 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center shadow-2xl">
              <Search className="ml-4 text-white/40" size={20} />
              <input 
                type="text" 
                placeholder="Artiste, Lieu, Expérience..." 
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-white/30 px-4 font-bold outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="p-3 bg-white text-[#1a0525] rounded-full hover:bg-amber-300 transition-colors">
                <Filter size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* --- GRILLE ÉVÉNEMENTS --- */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-rose-400" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div key={event.id} className="group bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden hover:border-amber-300/30 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 shadow-2xl flex flex-col">
                
                {/* Image */}
                <div className="h-64 relative overflow-hidden">
                  <img 
                    src={event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80'} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="mb-4">
                      <h3 className="text-2xl font-black italic uppercase leading-none mb-2 text-white line-clamp-2">{event.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-rose-100/60 font-medium">
                        <MapPin size={14} className="text-rose-400" />
                        {event.location}
                      </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-3xl font-black text-amber-300">
                      {event.price}€
                    </span>
                    
                    {/* BOUTON MODIFIÉ : INTERCEPTE LE CLIC */}
                    <button 
                      onClick={() => handleBookingClick(event.id)}
                      className="px-6 py-3 bg-white text-[#1a0525] rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-rose-400 hover:text-white transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Réserver <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL D'AVERTISSEMENT (POP-UP) --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          {/* Fond sombre flouté (clic pour fermer) */}
          <div 
            className="absolute inset-0 bg-[#0f0214]/80 backdrop-blur-md transition-opacity animate-in fade-in" 
            onClick={() => setShowAuthModal(false)}
          ></div>

          {/* Contenu de la modal */}
          <div className="bg-[#2a0a2e] border border-white/20 rounded-[2.5rem] p-8 max-w-sm w-full relative z-10 shadow-[0_0_50px_-10px_rgba(251,191,36,0.2)] animate-in zoom-in duration-300">
            
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/30 shadow-lg shadow-rose-500/10">
                <Lock className="text-rose-300" size={32} />
              </div>
              
              <h3 className="text-2xl font-black italic uppercase text-white mb-2">
                Accès <span className="text-amber-300">Réservé</span>
              </h3>
              
              <p className="text-white/60 text-sm font-medium leading-relaxed mb-8">
                Pour obtenir votre billet <strong className="text-white">OneWayTicket</strong> et accéder à cet événement, vous devez vous identifier.
              </p>

              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={() => navigate('/auth/register')}
                  className="w-full py-4 bg-gradient-to-r from-amber-300 to-rose-500 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} /> Créer un compte
                </button>
                
                <button 
                  onClick={() => navigate('/auth/login')}
                  className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn size={16} /> Me connecter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Events;