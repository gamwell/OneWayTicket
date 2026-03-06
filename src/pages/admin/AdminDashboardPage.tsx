import React from "react";
import { Link } from "react-router-dom";
import { Plus, BarChart3, Calendar } from "lucide-react";

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-[#1a0525] text-white pt-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <h1 className="text-4xl font-black uppercase italic mb-12 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
            Admin Dashboard
          </span>
        </h1>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-8">

          {/* CREATE EVENT */}
          <Link
            to="/admin/events/new"
            className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-rose-500/10 hover:border-rose-500/30 transition-all shadow-xl hover:shadow-rose-500/20"
          >
            <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-rose-500/30">
              <Plus size={24} className="text-white" />
            </div>

            <h3 className="text-xl font-bold uppercase mb-2">Créer un événement</h3>
            <p className="text-white/50 text-sm">
              Ajouter une nouvelle soirée à la billetterie.
            </p>
          </Link>

          {/* STATS (disabled for now) */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl opacity-50 cursor-not-allowed shadow-inner">
            <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 size={24} className="text-white" />
            </div>

            <h3 className="text-xl font-bold uppercase mb-2">Statistiques</h3>
            <p className="text-white/50 text-sm">Bientôt disponible.</p>
          </div>

          {/* FUTURE CARD SLOT */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl opacity-30 cursor-not-allowed">
            <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center mb-4">
              <Calendar size={24} className="text-white" />
            </div>

            <h3 className="text-xl font-bold uppercase mb-2">Gestion Staff</h3>
            <p className="text-white/50 text-sm">Module en préparation.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;