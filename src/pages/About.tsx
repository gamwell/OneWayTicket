import { Link } from "react-router-dom";
import { Ticket, Shield, Zap, Heart, ArrowRight, Mail, Phone, MapPin } from "lucide-react";

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
              Histoire
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Fondée en 2024 à Paris, OneWayTicket révolutionne l'accès aux événements culturels et festifs en proposant une billetterie 100% digitale, sécurisée et instantanée.
          </p>
        </div>

        {/* STORY */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-black uppercase italic mb-4 text-amber-300">Notre vision</h2>
          <p className="text-white/60 leading-relaxed mb-4">
            OneWayTicket est né d'une frustration partagée par des millions de personnes : la complexité d'achat de billets, les arnaques, les files d'attente virtuelles interminables. Nous avons décidé de tout repenser.
          </p>
          <p className="text-white/60 leading-relaxed">
            Aujourd'hui, notre plateforme accompagne plus de <span className="text-amber-300 font-bold">50 événements</span> et des milliers de participants à travers la France et la Belgique, avec un taux de satisfaction de <span className="text-amber-300 font-bold">98%</span>.
          </p>
        </div>

        {/* ÉQUIPE */}
        <div className="mb-12">
          <h2 className="text-2xl font-black uppercase italic mb-6 text-center">L'équipe</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Alexandre Moreau", role: "CEO & Co-fondateur", emoji: "👨‍💼" },
              { name: "Sophie Legrand", role: "CTO & Co-fondatrice", emoji: "👩‍💻" },
              { name: "Thomas Petit", role: "Responsable Événements", emoji: "🎯" },
            ].map((member) => (
              <div key={member.name} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
                <div className="text-5xl mb-3">{member.emoji}</div>
                <p className="font-black text-white">{member.name}</p>
                <p className="text-white/40 text-xs uppercase tracking-wider mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* VALEURS */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Shield, title: "Sécurité avant tout", desc: "Chaque billet est unique, chiffré et lié à votre profil. Impossible à falsifier.", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
            { icon: Zap, title: "Instantané", desc: "De l'achat à l'entrée en quelques secondes. Votre QR code est disponible immédiatement.", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            { icon: Ticket, title: "Expérience premium", desc: "Interface intuitive, design soigné et support réactif pour chaque événement.", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
            { icon: Heart, title: "Fait avec passion", desc: "Une équipe passionnée qui croit que chaque moment mérite d'être vécu pleinement.", color: "text-fuchsia-400", bg: "bg-fuchsia-500/10 border-fuchsia-500/20" },
          ].map((item) => (
            <div key={item.title} className={`bg-white/5 border ${item.bg} rounded-3xl p-6 flex gap-4`}>
              <div className={`${item.color} mt-1 flex-shrink-0`}><item.icon size={24} /></div>
              <div>
                <h3 className="font-black uppercase tracking-wide mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CONTACT */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-2xl font-black uppercase italic mb-6 text-center">Nous contacter</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl text-center">
              <Mail className="text-amber-400" size={28} />
              <p className="text-white/40 text-xs uppercase tracking-wider">Email</p>
              <a href="mailto:contact@onewayticket.fr" className="text-amber-300 font-bold hover:text-amber-200 transition-colors text-sm">
                contact@onewayticket.fr
              </a>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl text-center">
              <Phone className="text-rose-400" size={28} />
              <p className="text-white/40 text-xs uppercase tracking-wider">Téléphone</p>
              <a href="tel:+33142000000" className="text-rose-300 font-bold hover:text-rose-200 transition-colors text-sm">
                +33 1 42 00 00 00
              </a>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl text-center">
              <MapPin className="text-teal-400" size={28} />
              <p className="text-white/40 text-xs uppercase tracking-wider">Adresse</p>
              <p className="text-teal-300 font-bold text-sm">12 Rue de la Paix<br />75001 Paris, France</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/events" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 text-black rounded-2xl font-black uppercase tracking-widest hover:bg-amber-300 transition-all">
            Voir les événements <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}
