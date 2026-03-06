import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Ticket, User, LogOut, ArrowRight, Sparkles } from 'lucide-react';

const DashboardPage = () => {
  const { profile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#1a0525] text-white pt-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase italic mb-2">
              Bonjour, <span className="text-amber-300">{profile?.full_name || 'Membre'}</span>
            </h1>
            <p className="text-white/50">Bienvenue dans votre espace personnel OneWayTicket.</p>
          </div>
          <button 
            onClick={logout}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-300 transition-all flex items-center gap-2 font-bold uppercase text-xs tracking-widest"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* CARTE MES BILLETS */}
          <Link to="/my-tickets" className="group bg-gradient-to-br from-amber-500/10 to-rose-500/10 border border-white/10 p-8 rounded-[2rem] hover:border-amber-300/50 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Ticket size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-amber-300 rounded-full flex items-center justify-center text-[#1a0525] mb-6">
                <Ticket size={24} />
              </div>
              <h2 className="text-2xl font-black uppercase italic mb-2">Mes Billets</h2>
              <p className="text-white/60 mb-8 max-w-xs">Retrouvez tous vos QR Codes et l'historique de vos achats.</p>
              <div className="flex items-center gap-2 text-amber-300 font-bold uppercase text-xs tracking-widest group-hover:gap-4 transition-all">
                Voir mes billets <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* CARTE MON PROFIL */}
          <Link to="/profile" className="group bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <User size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#1a0525] mb-6">
                <User size={24} />
              </div>
              <h2 className="text-2xl font-black uppercase italic mb-2">Mon Profil</h2>
              <p className="text-white/60 mb-8 max-w-xs">Mettez à jour vos informations personnelles et préférences.</p>
              <div className="flex items-center gap-2 text-white font-bold uppercase text-xs tracking-widest group-hover:gap-4 transition-all">
                Gérer mon compte <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

// ✅ EXPORT OBLIGATOIRE
export default DashboardPage;