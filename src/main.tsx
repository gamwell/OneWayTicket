console.log("Mon URL :", import.meta.env.VITE_SUPABASE_URL)
console.log("Ma Clé est chargée :", !!import.meta.env.VITE_SUPABASE_ANON_KEY)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; 
import { CartProvider } from './contexts/CartContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* L'ordre est vital : AuthProvider doit être AU-DESSUS de App */}
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);