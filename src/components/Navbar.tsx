import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, ShoppingBag, User, LogOut, 
  LayoutDashboard, ShieldCheck, LogIn 
} from 'lucide-react';

// ✅ IMPORT DES CONTEXTES
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false); // Pour l'effet de scroll
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Récupération sécurisée
  const { cart } = useCart();
  const { user, logout } = useAuth();

  // ✅ Gestion du scroll pour l'effet visuel
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Fermer le menu mobile quand on change de page
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // ✅ CALCUL DU NOMBRE D'ARTICLES
  const cartItemCount = cart 
    ? cart.reduce((total, item) => total + (item.quantity || 1), 0)
    : 0;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled || isOpen
        ? 'bg-[#1a0525]/90 backdrop-blur-xl border-b border-white/10 py-3' 
        : 'bg-transparent border-b border-transparent py-5'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          
          {/* --- LOGO --- */}
          <Link to="/" className="flex items-center gap-2 group z-50">
            <div className="bg-gradient-to-tr from-amber-400 to-rose-600 p-2 rounded-lg group-hover:rotate-12 transition-transform duration-500">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black italic tracking-tighter text-white">
              ONEWAY<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-600">TICKET</span>
            </span>
          </Link>

          {/* --- MENU BUREAU (Desktop) --- */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/events" className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors relative group">
              Événements
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 transition-all group-hover:w-full"></span>
            </Link>
            
            {/* BOUTON PANIER */}
            <Link to="/cart" className="relative group">
              <div className={`p-3 rounded-full transition-colors ${cartItemCount > 0 ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-white/70'}`}>
                <ShoppingBag size={20} />
              </div>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-rose-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full animate-bounce shadow-lg">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* BOUTONS AUTH */}
            {user ? (
              <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                <Link 
                  to="/dashboard/user" 
                  className="flex items-center gap-2 text-sm font-bold text-white hover:text-amber-300 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-300 to-rose-500 rounded-full p-[2px]">
                    <div className="w-full h-full bg-[#1a0525] rounded-full flex items-center justify-center">
                      <User size={14} />
                    </div>
                  </div>
                  <span className="hidden lg:inline">Mon Compte</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-white/50 hover:text-rose-400 transition-colors"
                  title="Se déconnecter"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link 
                to="/auth/login"
                className="px-6 py-2.5 bg-white text-[#1a0525] rounded-xl font-black uppercase text-xs tracking-widest hover:bg-amber-300 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(251,191,36,0.4)] hover:scale-105 flex items-center gap-2"
              >
                <LogIn size={16} /> Connexion
              </Link>
            )}
          </div>

          {/* --- BOUTON MOBILE --- */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden text-white p-2 z-50 hover:text-amber-300 transition-colors"
          >
            {isOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* --- MENU MOBILE (Full Screen Overlay) --- */}
      <div className={`fixed inset-0 bg-[#1a0525] z-40 transition-all duration-500 flex flex-col justify-center px-8 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      }`}>
        <div className="flex flex-col gap-8 items-center text-center">
          <Link to="/" className="text-3xl font-black uppercase italic text-white hover:text-amber-300 transition-colors">
            Accueil
          </Link>
          <Link to="/events" className="text-3xl font-black uppercase italic text-white hover:text-amber-300 transition-colors">
            Événements
          </Link>
          
          <Link to="/cart" className="relative inline-block text-3xl font-black uppercase italic text-white hover:text-amber-300 transition-colors">
            Panier
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-6 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {cartItemCount}
              </span>
            )}
          </Link>

          <div className="w-16 h-1 bg-white/10 rounded-full my-4" />

          {user ? (
            <>
              <Link to="/dashboard/user" className="flex items-center gap-3 text-xl font-bold text-amber-300 uppercase tracking-widest">
                <LayoutDashboard size={24} /> Tableau de bord
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 text-xl font-bold text-rose-400 uppercase tracking-widest mt-4">
                <LogOut size={24} /> Déconnexion
              </button>
            </>
          ) : (
            <Link 
              to="/auth/login" 
              className="w-full max-w-xs py-4 bg-white text-[#1a0525] rounded-2xl font-black uppercase tracking-widest text-center"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;