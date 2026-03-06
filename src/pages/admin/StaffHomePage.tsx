import { Link } from "react-router-dom";
import { QrCode, Smartphone, WifiOff, BarChart3 } from "lucide-react";

export default function StaffHomePage() {
  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white flex flex-col">

      {/* HEADER */}
      <header className="p-6 text-center border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <h1 className="text-3xl font-extrabold tracking-wide">OWT STAFF</h1>
        <p className="text-sm text-white/60 mt-1">
          Outils d’organisation & contrôle
        </p>
      </header>

      {/* LOGO */}
      <div className="flex justify-center mt-10 mb-6">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-2xl border border-white/10">
          <span className="text-4xl font-black tracking-tight">OWT</span>
        </div>
      </div>

      {/* MENU */}
      <div className="grid grid-cols-1 gap-6 px-6 mt-4">

        <Link
          to="/admin/scan"
          className="p-6 rounded-2xl bg-blue-600/20 border border-blue-600/40 text-blue-300 flex items-center gap-4 hover:scale-[1.03] hover:bg-blue-600/30 transition-all shadow-lg shadow-blue-900/20"
        >
          <QrCode className="w-10 h-10" />
          <div>
            <h2 className="text-xl font-bold">Scan Standard</h2>
            <p className="text-sm text-blue-200/70">Caméra + validation en direct</p>
          </div>
        </Link>

        <Link
          to="/admin/scan/mobile"
          className="p-6 rounded-2xl bg-green-600/20 border border-green-600/40 text-green-300 flex items-center gap-4 hover:scale-[1.03] hover:bg-green-600/30 transition-all shadow-lg shadow-green-900/20"
        >
          <Smartphone className="w-10 h-10" />
          <div>
            <h2 className="text-xl font-bold">Scan Mobile</h2>
            <p className="text-sm text-green-200/70">Optimisé smartphone</p>
          </div>
        </Link>

        <Link
          to="/admin/scan/offline"
          className="p-6 rounded-2xl bg-yellow-600/20 border border-yellow-600/40 text-yellow-300 flex items-center gap-4 hover:scale-[1.03] hover:bg-yellow-600/30 transition-all shadow-lg shadow-yellow-900/20"
        >
          <WifiOff className="w-10 h-10" />
          <div>
            <h2 className="text-xl font-bold">Scan Hors‑ligne</h2>
            <p className="text-sm text-yellow-200/70">Stockage local + synchro</p>
          </div>
        </Link>

        <Link
          to="/admin/checkin-dashboard"
          className="p-6 rounded-2xl bg-purple-600/20 border border-purple-600/40 text-purple-300 flex items-center gap-4 hover:scale-[1.03] hover:bg-purple-600/30 transition-all shadow-lg shadow-purple-900/20"
        >
          <BarChart3 className="w-10 h-10" />
          <div>
            <h2 className="text-xl font-bold">Dashboard Check‑in</h2>
            <p className="text-sm text-purple-200/70">Stats en temps réel</p>
          </div>
        </Link>

      </div>

      {/* FOOTER */}
      <footer className="mt-auto py-6 text-center text-xs text-white/40 border-t border-white/5">
        ONEWAYTICKET — Staff Edition
      </footer>
    </div>
  );
}