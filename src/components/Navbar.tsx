import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, ShoppingBag, User, LogOut, 
  LayoutDashboard, ShieldCheck, LogIn, Settings 
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false); 
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  const { user, profile, logout } = useAuth(); 

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Ferme le menu ET bloque le scroll quand ouvert
  useEffect(() => { setIsOpen(false); }, [location]);
  
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const cartItemCount = cart 
    ? cart.reduce((total, item) => total + (item.quantity || 1), 0)
    : 0;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled || isOpen
          ? 'bg-[#1a0525]/90 backdrop-blur-xl border-b border-white/10 py-3' 
          : 'bg-transparent border-b border-transparent py-5'
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2 group z-50" onClick={() => setIsOpen(false)}>
              <div className="bg-gradient-to-tr from-amber-400 to-rose-600 p-2 rounded-lg group-hover:rotate-12 transition-transform duration-500">
                <ShieldCheck className="text-white" size={22} />
              </div>
              <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-white">
                ONEWAY<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-600">TICKET</span>
              </span>
            </Link>

            {/* MENU DESKTOP */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/events" className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors relative group">
                Événements
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 transition-all group-hover:w-full" />
              </Link>
              
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

              {user ? (
                <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                  {profile?.is_admin && (
                    <Link to="/admin/dashboard" className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-black uppercase tracking-tighter">
                      <Settings size={14} /> Admin
                    </Link>
                  )}
                  <Link to="/dashboard/user" className="flex items-center gap-2 text-sm font-bold text-white hover:text-amber-300 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-300 to-rose-500 rounded-full p-[2px]">
                      <div className="w-full h-full bg-[#1a0525] rounded-full flex items-center justify-center">
                        <User size={14} />
                      </div>
                    </div>
                    <span className="hidden lg:inline">Mon Compte</span>
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-white/50 hover:text-rose-400 transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link to="/auth/login" className="px-6 py-2.5 bg-white text-[#1a0525] rounded-xl font-black uppercase text-xs tracking-widest hover:bg-amber-300 transition-all flex items-center gap-2">
                  <LogIn size={16} /> Connexion
                </Link>
              )}
            </div>

            {/* BURGER */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-2 z-[60] relative">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ✅ MENU MOBILE — séparé de la nav, z-index très haut */}
      <div className={`fixed inset-0 bg-[#1a0525] z-[55] transition-all duration-300 flex flex-col justify-center px-8 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      }`}>
        {/* Bouton fermer en haut à droite */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-4 text-white p-2"
        >
          <X size={28} />
        </button>

        <div className="flex flex-col gap-6 items-center text-center">
          <Link to="/" className="text-3xl font-black uppercase italic text-white">Accueil</Link>
          <Link to="/events" className="text-3xl font-black uppercase italic text-white">Événements</Link>
          
          {profile?.is_admin && (
            <Link to="/admin/dashboard" className="text-2xl font-black uppercase text-amber-400 flex items-center gap-2">
              <Settings size={24} /> Administration
            </Link>
          )}

          <div className="w-16 h-1 bg-white/10 rounded-full my-2" />

          {user ? (
            <>
              <Link to="/dashboard/user" className="flex items-center gap-3 text-xl font-bold text-white uppercase tracking-widest">
                <LayoutDashboard size={24} /> Mon Compte
              </Link>
              <Link to="/cart" className="flex items-center gap-3 text-xl font-bold text-white uppercase tracking-widest">
                <ShoppingBag size={24} /> Panier
                {cartItemCount > 0 && (
                  <span className="bg-rose-500 text-white text-xs font-black px-2 py-0.5 rounded-full">{cartItemCount}</span>
                )}
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 text-xl font-bold text-rose-400 uppercase tracking-widest mt-2">
                <LogOut size={24} /> Déconnexion
              </button>
            </>
          ) : (
            <Link to="/auth/login" className="w-full max-w-xs py-4 bg-white text-[#1a0525] rounded-2xl font-black uppercase tracking-widest text-center">
              Connexion
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
