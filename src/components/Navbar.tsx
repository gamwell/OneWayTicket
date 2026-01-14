import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, 
  X, 
  Ticket, // Ou Sparkles si vous préférez l'autre icône
  User, 
  LogOut, 
  LayoutDashboard, 
  ShoppingCart,
  LogIn,
  Sparkles,
  Calendar,
  Home
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth(); // On garde votre Hook useAuth
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Effet de scroll pour assombrir la navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors d'un changement de page
  useEffect(() => setIsOpen(false), [location]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b ${
      scrolled 
        ? 'bg-[#1a0525]/90 backdrop-blur-xl border-white/10 py-4 shadow-xl' 
        : 'bg-transparent border-transparent py-6'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* --- LOGO --- */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-300 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:rotate-12 transition-transform">
            <Sparkles className="text-[#1a0525]" size={20} />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase text-white">
            OneWay<span className="text-amber-300">Ticket</span>
          </span>
        </Link>

        {/* --- DESKTOP MENU (Ordinateur) --- */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/events" className="text-xs font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors">
            Événements
          </Link>

          {/* Panier Desktop */}
          <Link to="/cart" className="relative group p-2 text-white/70 hover:text-amber-300 transition-colors">
            <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
              0
            </span>
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all text-white"
              >
                <LayoutDashboard size={14} className="text-amber-300" />
                Mon Espace
              </Link>

              <button 
                onClick={handleLogout}
                className="p-2 text-white/50 hover:text-rose-400 transition-colors"
                title="Déconnexion"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/auth/login" className="text-xs font-black uppercase tracking-widest text-white hover:text-amber-300 transition-colors">
                Connexion
              </Link>
              <Link to="/auth/register" className="px-6 py-3 bg-gradient-to-r from-amber-300 to-rose-500 text-[#1a0525] rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-amber-500/20">
                S'inscrire
              </Link>
            </div>
          )}
        </div>

        {/* --- MOBILE CONTROLS (Téléphone) --- */}
        <div className="md:hidden flex items-center gap-4">
          
          {/* ✅ LE PANIER EST MAINTENANT ICI POUR LE MOBILE */}
          <Link to="/cart" className="relative p-2 text-white active:scale-95 transition-transform">
            <ShoppingCart size={24} className="text-amber-300" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
              0
            </span>
          </Link>

          <button className="text-white hover:text-amber-300 transition-colors" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU (Déroulant) --- */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#1a0525] border-b border-white/10 shadow-2xl p-6 flex flex-col gap-6 animate-in slide-in-from-top-4 z-50">
          
          <Link to="/" className="flex items-center gap-3 text-white/80 hover:text-white p-2 font-bold uppercase tracking-widest text-xs">
            <Home size={16} className="text-rose-400" /> Accueil
          </Link>
          
          <Link to="/events" className="flex items-center gap-3 text-white/80 hover:text-white p-2 font-bold uppercase tracking-widest text-xs">
            <Calendar size={16} className="text-amber-400" /> Événements
          </Link>
          
          <div className="h-[1px] bg-white/10 my-2"></div>

          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 border border-white/10 rounded-xl text-white font-black uppercase tracking-widest text-xs">
                <LayoutDashboard size={16} className="text-amber-300" /> Mon Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 text-rose-300 font-black uppercase tracking-widest text-xs">
                <LogOut size={16} /> Déconnexion
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link to="/auth/login" className="flex items-center justify-center py-3 rounded-xl border border-white/10 text-white font-bold uppercase text-xs">
                Connexion
              </Link>
              <Link to="/auth/register" className="flex items-center justify-center py-3 rounded-xl bg-white text-[#1a0525] font-bold uppercase text-xs">
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;