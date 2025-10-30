import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Ticket, Calendar, User, LogOut, LogIn, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="glass-effect border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 animate-glow">
              <Ticket className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-display font-bold gradient-text">
              ONEWAYTICKET
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`${
                isActive('/') ? 'bg-gradient-to-r from-secondary-500/10 to-accent-500/10 text-secondary-600 font-bold' : 'text-gray-700 hover:bg-white/10'
              } px-4 py-2 rounded-xl transition-all duration-300 font-semibold`}
            >
              Accueil
            </Link>
            <Link
              to="/events"
              className={`${
                isActive('/events') ? 'bg-gradient-to-r from-secondary-500/10 to-accent-500/10 text-secondary-600 font-bold' : 'text-gray-700 hover:bg-white/10'
              } px-4 py-2 rounded-xl transition-all duration-300 font-semibold`}
            >
              Événements
            </Link>
            {user && (
              <Link
                to="/my-tickets"
                className={`${
                  isActive('/my-tickets') ? 'bg-gradient-to-r from-secondary-500/10 to-accent-500/10 text-secondary-600 font-bold' : 'text-gray-700 hover:bg-white/10'
                } px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 font-semibold`}
              >
                <Calendar className="w-4 h-4" />
                <span>Mes Billets</span>
              </Link>
            )}
            <Link
              to="/about"
              className={`${
                isActive('/about') ? 'bg-gradient-to-r from-secondary-500/10 to-accent-500/10 text-secondary-600 font-bold' : 'text-gray-700 hover:bg-white/10'
              } px-4 py-2 rounded-xl transition-all duration-300 font-semibold`}
            >
              À propos
            </Link>
            <Link
              to="/contact"
              className={`${
                isActive('/contact') ? 'bg-gradient-to-r from-secondary-500/10 to-accent-500/10 text-secondary-600 font-bold' : 'text-gray-700 hover:bg-white/10'
              } px-4 py-2 rounded-xl transition-all duration-300 font-semibold`}
            >
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/cart"
              className="relative p-3 text-gray-700 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-secondary-500 to-accent-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-glow">
                  {totalItems}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-white/10 rounded-xl transition-all duration-300 font-semibold"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-sm px-4 py-2 glass-effect text-gray-700 hover:bg-white/20 rounded-xl transition-all duration-300 font-semibold"
                >
                  <User className="w-5 h-5" />
                  <span className="font-semibold">{user.prenom}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Quitter</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="flex items-center space-x-2 px-6 py-3 text-sm bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-xl hover:from-secondary-600 hover:to-accent-600 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105"
              >
                <LogIn className="w-4 h-4" />
                <span>Connexion</span>
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 rounded-xl text-gray-700 hover:bg-white/10 transition-all duration-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden glass-effect border-t border-white/10 animate-fadeIn">
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-gray-700 hover:bg-white/10 rounded-xl transition-all font-semibold"
            >
              Accueil
            </Link>
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-gray-700 hover:bg-white/10 rounded-xl transition-all font-semibold"
            >
              Événements
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-white/10 rounded-xl transition-all font-semibold"
            >
              <span>Panier</span>
              {totalItems > 0 && (
                <span className="ml-2 w-7 h-7 bg-gradient-to-r from-secondary-500 to-accent-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                  {totalItems}
                </span>
              )}
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-white/10 rounded-xl transition-all font-semibold"
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-tickets"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-white/10 rounded-xl transition-all font-semibold"
                >
                  Mes Billets
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-white/10 rounded-xl transition-all font-semibold"
                >
                  Mon Profil
                </Link>
              </>
            )}
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-gray-700 hover:bg-white/10 rounded-xl transition-all font-semibold"
            >
              À propos
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-gray-700 hover:bg-white/10 rounded-xl transition-all font-semibold"
            >
              Contact
            </Link>
            <div className="border-t border-white/10 pt-3 mt-2">
              {user ? (
                <div className="space-y-2">
                  <div className="px-4 py-3 text-sm text-gray-600 font-semibold">
                    Connecté: <span className="gradient-text">{user.prenom}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-center bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
