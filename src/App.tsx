import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';

// Pages principales - Vérifiez bien l'orthographe exacte des fichiers
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import CartPage from './pages/CartPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

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
        
        {/* Événements et Panier */}
        <Route path="/events" element={<EventsPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* À Propos et Contact */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Authentification - Double routes pour assurer la compatibilité Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/register" element={<Register />} />

        {/* Redirection automatique vers l'accueil si l'URL n'existe pas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;