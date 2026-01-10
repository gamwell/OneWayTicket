import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-white pt-24 relative">
      
      {/* --- BOUTON DE SECOURS (Force brute) --- */}
      {/* Il est fixé en haut à droite de l'écran, par-dessus tout. */}
      {/* Si vous ne voyez pas ce bouton rouge, redémarrez votre terminal (CTRL+C puis npm run dev) */}
      <div className="fixed top-24 right-4 z-[9999]">
        <button 
          onClick={() => navigate("/admin/events/new")}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded-full font-black uppercase shadow-[0_0_20px_rgba(220,38,38,0.7)] border-2 border-white animate-pulse cursor-pointer"
        >
          <PlusCircle size={24} />
          <span>CRÉER ÉVÉNEMENT</span>
        </button>
      </div>
      {/* --------------------------------------- */}

      <div className="w-full h-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* C'est ici que s'affichent vos pages (Dashboard, Events, etc.) */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;