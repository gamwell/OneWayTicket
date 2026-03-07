import { Link } from "react-router-dom";
import { Ticket, Shield, Zap, Heart, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#1a0525] text-white pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <p className="text-amber-300 text-xs font-black uppercase tracking-[0.3em] mb-4">À propos</p>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic mb-6">
            Notre{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-500">
              Mission
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            OneWayTicket est né d'une conviction simple : l'accès à la culture et aux événements doit être fluide, sécurisé et accessible à tous.
          </p>
        </div>

        {/* VALEURS */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {[
            {
              icon: Shield,
              title: "Sécurité avant tout",
              desc: "Chaque billet est unique, chiffré et lié à votre profil. Impossible à falsifier.",
              color: "text-teal-400",
              bg: "bg-teal-500/10 border-teal-500/20",
            },
            {
              icon: Zap,
              title: "Instantané",
              desc: "De l'achat à l'entrée en quelques secondes. Votre QR code est disponible immédiatement.",
              color: "text-amber-400",
              bg: "bg-amber-500/10 border-amber-500/20",
            },
            {
              icon: Ticket,
              title: "Expérience premium",
              desc: "Interface intuitive, design soigné et support réactif pour chaque événement.",
              color: "text-rose-400",
              bg: "bg-rose-500/10 border-rose-500/20",
            },
            {
              icon: Heart,
              title: "Fait avec passion",
              desc: "Une équipe passionnée qui croit que chaque moment mérite d'être vécu pleinement.",
              color: "text-fuchsia-400",
              bg: "bg-fuchsia-500/10 border-fuchsia-500/20",
            },
          ].map((item) => (
            <div key={item.title} className={`bg-white/5 border ${item.bg} rounded-3xl p-6 flex gap-4`}>
              <div className={`${item.color} mt-1 flex-shrink-0`}>
                <item.icon size={24} />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-wide mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CONTACT */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
          <p className="text-white/40 text-sm mb-2">Une question ? Une suggestion ?</p>
          <h2 className="text-2xl font-black uppercase italic mb-4">Contactez-nous</h2>
          <a
            href="mailto:clgvernant@gmail.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 text-black rounded-2xl font-black uppercase tracking-widest hover:bg-amber-300 transition-all"
          >
            clgvernant@gmail.com <ArrowRight size={16} />
          </a>
        </div>

        <div className="text-center mt-12">
          <Link to="/events" className="text-amber-400 hover:text-amber-300 font-bold uppercase tracking-widest text-sm underline">
            Voir les événements →
          </Link>
        </div>

      </div>
    </div>
  );
}
