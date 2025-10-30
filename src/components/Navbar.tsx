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
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold bg-gradient-to-r from-secondary-600 via-accent-500 to-primary-700 bg-clip-text text-transparent">
              ONEWAYTICKET
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`${
                isActive('/') ? 'text-secondary-600 font-semibold' : 'text-gray-700 hover:text-secondary-600'
              } transition-colors`}
            >
              Accueil
            </Link>
            <Link
              to="/events"
              className={`${
                isActive('/events') ? 'text-secondary-600 font-semibold' : 'text-gray-700 hover:text-secondary-600'
              } transition-colors`}
            >
              Événements
            </Link>
            {user && (
              <Link
                to="/my-tickets"
                className={`${
                  isActive('/my-tickets') ? 'text-secondary-600 font-semibold' : 'text-gray-700 hover:text-secondary-600'
                } transition-colors flex items-center space-x-1`}
              >
                <Calendar className="w-4 h-4" />
                <span>Mes Billets</span>
              </Link>
            )}
            <Link
              to="/about"
              className={`${
                isActive('/about') ? 'text-secondary-600 font-semibold' : 'text-gray-700 hover:text-secondary-600'
              } transition-colors`}
            >
              À propos
            </Link>
            <Link
              to="/contact"
              className={`${
                isActive('/contact') ? 'text-secondary-600 font-semibold' : 'text-gray-700 hover:text-secondary-600'
              } transition-colors`}
            >
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-secondary-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 px-4 py-2 text-sm text-gray-700 hover:text-secondary-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Tableau de bord</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-secondary-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{user.prenom}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="flex items-center space-x-1 px-4 py-2 text-sm bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-lg hover:from-secondary-600 hover:to-accent-600 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Connexion</span>
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Accueil
            </Link>
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Événements
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span>Panier</span>
              {totalItems > 0 && (
                <span className="ml-2 w-6 h-6 bg-secondary-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
              )}
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Tableau de bord
                </Link>
                <Link
                  to="/my-tickets"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Mes Billets
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Mon Profil
                </Link>
              </>
            )}
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              À propos
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Contact
            </Link>
            <div className="border-t border-gray-200 pt-3">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-gray-600">
                    Connecté en tant que <span className="font-semibold">{user.prenom}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-center bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-lg"
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
