import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'

// Pages principales
import HomePage from './pages/HomePage'
import EventsPage from './pages/EventsPage'
import CartPage from './pages/CartPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'

// Auth
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Stripe / Supabase
import Checkout from './pages/Checkout'
import Success from './pages/Success'
import Cancel from './pages/Cancel'

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Accueil */}
        <Route path="/" element={<HomePage />} />

        {/* Pages principales */}
        <Route path="/events" element={<EventsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/register" element={<Register />} />

        {/* Checkout Stripe */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
