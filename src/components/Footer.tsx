import { Link } from "react-router-dom";
import { ShieldCheck, Instagram, Twitter, Facebook, Ticket } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative z-10 bg-[#0f172a] border-t border-white/10 pt-16 pb-8 overflow-hidden">
      {/* Effet d'aura en arrière-plan */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        {/* --- COLONNE 1 : BRAND --- */}
        <div className="md:col-span-2 space-y-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all">
              <span className="text-white font-black italic">O</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">
              ONEWAYTICKET
            </span>
          </Link>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            La destination ultime pour vos billets d'exception. Vivez des moments inoubliables avec une gestion simplifiée et sécurisée. Le futur de vos souvenirs commence ici.
          </p>
          <div className="flex gap-4">
            <SocialIcon icon={<Instagram size={18} />} />
            <SocialIcon icon={<Twitter size={18} />} />
            <SocialIcon icon={<Facebook size={18} />} />
          </div>
        </div>

        {/* --- COLONNE 2 : LIENS --- */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">Navigation</h3>
          <ul className="space-y-4 text-sm font-medium text-slate-400">
            <li><Link to="/events" className="hover:text-cyan-400 transition-colors flex items-center gap-2"><Ticket size={14} /> Événements</Link></li>
            <li><Link to="/about" className="hover:text-cyan-400 transition-colors">À propos</Link></li>
            <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
            <li><Link to="/profile-page" className="hover:text-cyan-400 transition-colors">Mon Compte</Link></li>
          </ul>
        </div>

        {/* --- COLONNE 3 : CONFORMITÉ --- */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">Conformité</h3>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck size={16} /> RGPD Compliant
            </div>
            <p className="text-[10px] text-slate-500 leading-tight uppercase tracking-wider font-bold">
              Vos données sont chiffrées et traitées selon les normes européennes en vigueur.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-[10px] font-bold uppercase tracking-tighter text-slate-500">
              <Link to="/legal/terms" className="hover:text-white transition-colors">CGU & CGV</Link>
              <Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>

      </div>

      {/* --- FOOTER BOTTOM --- */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} ONEWAYTICKET INC. TOUS DROITS RÉSERVÉS.
        </p>
        <p className="text-[10px] font-black italic text-slate-600 uppercase tracking-tighter">
          DESIGNED FOR THE BOLD.
        </p>
      </div>
    </footer>
  );
};

// Petit composant pour les icônes sociales
const SocialIcon = ({ icon }: { icon: React.ReactNode }) => (
  <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 hover:scale-110 transition-all duration-300">
    {icon}
  </a>
);

export default Footer;