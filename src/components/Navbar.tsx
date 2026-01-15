import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  ShoppingCart,
  Sparkles,
  Calendar,
  Home
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
      scrolled 
        ? 'bg-[#1a0525]/90 backdrop-blur-lg border-b border-white/10 py-3 shadow-2xl' 
        : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* --- LOGO (AGRANDI POUR ACCESSIBILITÉ) --- */}
        <Link to="/" className="flex items-center gap-3 group relative z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-300 to-rose-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
            <Sparkles className="text-[#1a0525]" size={26} />
          </div>
          <span className="text-2xl font-black italic tracking-tighter uppercase text-white">
            OneWay<span className="text-amber-300">Ticket</span>
          </span>
        </Link>

        {/* --- DESKTOP MENU --- */}
        <div className="hidden md:flex items-center gap-10">
          {/* LIEN ÉVÉNEMENTS (AGRANDI) */}
          <Link 
            to="/events" 
            className={`text-sm font-black uppercase tracking-[0.15em] transition-all hover:text-amber-300 ${
              location.pathname === '/events' ? 'text-amber-300' : 'text-white/90'
            }`}
          >
            Événements
          </Link>

          {/* PANIER (AGRANDI) */}
          <Link to="/cart" className="relative group p-2">
            <ShoppingCart 
              size={26} 
              className={`transition-transform group-hover:scale-110 ${
                itemCount > 0 ? 'text-amber-300' : 'text-white/80'
              }`} 
            />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-[11px] font-black text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-6 ml-4">
              {/* BOUTON MON ESPACE (AGRANDI) */}
              <Link 
                to="/dashboard" 
                className="flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-300 hover:text-[#1a0525] transition-all text-white group"
              >
                <LayoutDashboard size={18} className="group-hover:text-[#1a0525] text-amber-300" />
                Mon Espace
              </Link>

              <button 
                onClick={handleLogout}
                className="p-2 text-white/50 hover:text-rose-500 transition-colors"
                title="Déconnexion"
              >
                <LogOut size={24} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-8 ml-4">
              <Link to="/auth/login" className="text-sm font-black uppercase tracking-widest text-white hover:text-amber-300 transition-colors">
                Connexion
              </Link>
              <Link to="/auth/register" className="px-8 py-4 bg-gradient-to-r from-amber-300 to-rose-500 text-[#1a0525] rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                S'inscrire
              </Link>
            </div>
          )}
        </div>

        {/* --- MOBILE CONTROLS --- */}
        <div className="md:hidden flex items-center gap-6">
          <Link to="/cart" className="relative p-2">
            <ShoppingCart size={28} className="text-amber-300" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-[11px] font-black text-white rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <button 
            className="text-white p-1" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={34} /> : <Menu size={34} />}
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU OVERLAY (AGRANDI) --- */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-[#1a0525] border-b border-white/10 shadow-2xl transition-all duration-300 overflow-hidden ${
        isOpen ? 'max-h-[600px] opacity-100 py-10' : 'max-h-0 opacity-0 py-0'
      }`}>
        <div className="container mx-auto px-8 flex flex-col gap-8">
          <Link to="/" className="flex items-center gap-5 text-white hover:text-amber-300 font-black uppercase tracking-widest text-sm transition-colors">
            <Home size={22} className="text-rose-500" /> Accueil
          </Link>
          
          <Link to="/events" className="flex items-center gap-5 text-white hover:text-amber-300 font-black uppercase tracking-widest text-sm transition-colors">
            <Calendar size={22} className="text-amber-400" /> Événements
          </Link>
          
          <div className="h-[1px] bg-white/10 my-2"></div>

          {user ? (
            <div className="flex flex-col gap-5">
              <Link to="/dashboard" className="flex items-center justify-center gap-4 w-full py-5 bg-amber-300 text-[#1a0525] rounded-xl font-black uppercase tracking-widest text-sm">
                <LayoutDashboard size={22} /> Mon Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center justify-center gap-4 w-full py-4 text-rose-500 font-black uppercase tracking-widest text-sm bg-rose-500/5 rounded-xl">
                <LogOut size={22} /> Déconnexion
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              <Link to="/auth/login" className="flex items-center justify-center py-5 rounded-xl border border-white/20 text-white font-black uppercase text-sm">
                Connexion
              </Link>
              <Link to="/auth/register" className="flex items-center justify-center py-5 rounded-xl bg-gradient-to-r from-amber-300 to-rose-500 text-[#1a0525] font-black uppercase text-sm">
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;