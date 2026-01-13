import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Ticket, User, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-28 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Tableau de <span className="text-cyan-400">Bord</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Ravi de vous revoir, {profile?.full_name || 'Voyageur'}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section Profil Rapide */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <User size={32} className="text-[#0f172a]" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Compte</p>
                <p className="font-bold truncate">{user?.email}</p>
              </div>
            </div>
            <Link to="/profile" className="w-full py-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-bold text-sm">
              Gérer mon profil <ArrowRight size={16} />
            </Link>
          </div>

          {/* Section Mes Billets */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
            <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-3">
              <Ticket className="text-cyan-400" /> Mes Billets Récents
            </h2>
            
            {/* Message si aucun billet */}
            <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <Calendar className="mx-auto text-slate-700 mb-4" size={48} />
              <p className="text-slate-500 font-bold italic">Vous n'avez pas encore de billets pour le futur.</p>
              <Link to="/events" className="text-cyan-400 font-bold hover:underline mt-4 inline-block">
                Explorer les événements
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;