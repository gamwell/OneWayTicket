import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';

// Pages principales
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import CartPage from './pages/CartPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CheckoutPage from './pages/CheckoutPage';

// Pages d'authentification (Dossier auth)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Route d'accueil */}
        <Route path="/" element={<HomePage />} />
        
        {/* Routes Événements et Panier */}
        <Route path="/events" element={<EventsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Routes pour À Propos et Contact (Celles qui étaient vides) */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Routes Authentification : On gère les deux formats pour votre Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/register" element={<Register />} />

        {/* Sécurité : Redirige vers l'accueil si l'URL est inconnue */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;