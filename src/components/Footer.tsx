import { Link } from 'react-router-dom';
import { Ticket, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-white">ONEWAYTICKET</span>
            </div>
            <p className="text-sm text-gray-400">
              Votre plateforme de billetterie événementielle moderne et sécurisée.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Propulsé par <span className="text-secondary-400 font-semibold">DigitBinary</span> - Shaping tomorrow, today
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-secondary-400 transition-colors text-sm">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-secondary-400 transition-colors text-sm">
                  Événements
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-secondary-400 transition-colors text-sm">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-secondary-400 transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="hover:text-secondary-400 transition-colors text-sm">
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-secondary-400 transition-colors text-sm">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/mentions" className="hover:text-secondary-400 transition-colors text-sm">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-secondary-400" />
                <a href="mailto:contact@onewayticket.fr" className="hover:text-secondary-400 transition-colors">
                  contact@onewayticket.fr
                </a>
              </li>
              <li className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-secondary-400" />
                <a href="tel:+33123456789" className="hover:text-secondary-400 transition-colors">
                  +33 1 23 45 67 89
                </a>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-secondary-400 mt-1 flex-shrink-0" />
                <span>123 Avenue des Événements<br />75001 Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} ONEWAYTICKET by DigitBinary. Tous droits réservés.
          </p>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary-400 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary-400 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary-400 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary-400 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
