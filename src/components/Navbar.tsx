import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, 
  X, 
  Ticket, 
  User, 
  LogOut, 
  LayoutDashboard, 
  ShoppingCart 
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
            <Ticket className="text-[#0f172a] -rotate-12" size={24} />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">
            OneWay<span className="text-cyan-400">Ticket</span>
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/events" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
            Événements
          </Link>

          {user ? (
            <div className="flex items-center gap-6">
              {/* ✅ LIEN UNIQUE VERS LE PIVOT */}
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                <LayoutDashboard size={14} className="text-cyan-400" />
                Mon Espace
              </Link>

              <button 
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                title="Déconnexion"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/auth/login" className="text-xs font-black uppercase tracking-widest text-white hover:text-cyan-400 transition-colors">
                Connexion
              </Link>
              <Link to="/auth/register" className="px-6 py-3 bg-white text-slate-900 rounded-full text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all">
                S'inscrire
              </Link>
            </div>
          )}
          
          <Link to="/cart" className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <ShoppingCart size={22} />
            <span className="absolute top-0 right-0 w-4 h-4 bg-cyan-500 text-[10px] font-bold text-[#0f172a] rounded-full flex items-center justify-center">
              0
            </span>
          </Link>
        </div>

        {/* MOBILE TOGGLE */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-[#0f172a] border-t border-white/5 p-6 flex flex-col gap-6 animate-in slide-in-from-top-4">
          <Link to="/events" onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-widest">Événements</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-widest text-cyan-400">Mon Dashboard</Link>
              <button onClick={handleLogout} className="text-left text-sm font-black uppercase tracking-widest text-red-400">Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/auth/login" onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-widest">Connexion</Link>
              <Link to="/auth/register" onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-widest text-cyan-400">Créer un compte</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;